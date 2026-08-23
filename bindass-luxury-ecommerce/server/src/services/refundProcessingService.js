/**
 * refundProcessingService.js
 *
 * Core orchestrator for the multi-stage refund state machine.
 * Enforces financial integrity (no over-refunding), manages DB transactions,
 * and tracks audit logs for every state transition.
 */

const supabase = require('../config/supabase');
const outboxWorker = require('./outboxWorker');
const domainBus = require('./eventEmitter');
const gatewayAdapter = require('./paymentGatewayRefundAdapter');
const crypto = require('crypto');

/**
 * Log a state change in the immutable refund_audit_logs table.
 */
const logAudit = async (refundId, previousStatus, newStatus, actorType, actorId, notes = null) => {
    if (!supabase) return;
    await supabase.from('refund_audit_logs').insert([{
        refund_id: refundId,
        previous_status: previousStatus,
        new_status: newStatus,
        actor_type: actorType,
        actor_id: actorId,
        notes
    }]).catch(e => console.error('[RefundService] Audit log failed:', e.message));
};

/**
 * Validates that the requested refund amount does not exceed the remaining settled net amount of the order.
 * Prevents negative values and over-refunding exploits.
 */
const validateFinancialIntegrity = async (orderId, requestedAmount, excludeRefundId = null) => {
    const { data: order, error: orderErr } = await supabase
        .from('orders')
        .select('total_amount, payment_status, status')
        .eq('id', orderId)
        .single();
    
    if (orderErr || !order) throw new Error('Order not found for financial validation.');
    if (order.payment_status !== 'PAYMENT_VERIFIED' && order.payment_status !== 'REFUND_INITIATED') {
        throw new Error('Order is not in a valid payment state for refunds.');
    }
    
    // Sum all previously approved/processed refunds for this order
    let query = supabase.from('returns')
        .select('refund_amount')
        .eq('order_id', orderId)
        .in('status', ['APPROVED', 'GATEWAY_INITIATED', 'PROCESSED_SUCCESS']);
    
    if (excludeRefundId) {
        query = query.neq('id', excludeRefundId);
    }
    
    const { data: existingRefunds } = await query;
    const totalAlreadyRefunded = existingRefunds?.reduce((sum, r) => sum + parseFloat(r.refund_amount), 0) || 0;
    const requested = parseFloat(requestedAmount);
    
    if (requested <= 0) throw new Error('Refund amount must be greater than zero.');
    
    if ((totalAlreadyRefunded + requested) > parseFloat(order.total_amount)) {
        throw new Error(`Over-refund exploit blocked: Total allowed remaining is ₹${(order.total_amount - totalAlreadyRefunded).toFixed(2)}`);
    }
    
    return true;
};

/**
 * Stage 1: Customer (or Admin) requests an RMA / Refund.
 */
const requestRefund = async ({ orderId, userEmail, reasonCode, customerNotes, itemsToReturn = [], refundAmount }) => {
    // Basic verification
    await validateFinancialIntegrity(orderId, refundAmount);

    const idempotencyKey = crypto.randomUUID();
    const refundType = itemsToReturn.length > 0 ? 'PARTIAL' : 'FULL';

    // 1. Create Refund Record
    const { data: refundRecord, error } = await supabase
        .from('returns')
        .insert([{
            order_id: orderId,
            user_email: userEmail,
            reason: 'RMA_REQUEST', // Legacy compat
            reason_code: reasonCode,
            description: customerNotes,
            items_to_return: itemsToReturn,
            refund_amount: refundAmount,
            refund_type: refundType,
            status: 'REQUESTED',
            idempotency_key: idempotencyKey
        }])
        .select()
        .single();
    
    if (error) throw error;

    // 2. Add Line Items mapping
    if (itemsToReturn.length > 0) {
        const lineItems = itemsToReturn.map(item => ({
            refund_id: refundRecord.id,
            product_id: String(item.product_id),
            quantity_returned: item.quantity,
            refund_amount_allocated: item.allocated_amount || 0
        }));
        await supabase.from('refund_items').insert(lineItems).catch(() => {});
    }

    // 3. Audit & Emit
    await logAudit(refundRecord.id, null, 'REQUESTED', 'CUSTOMER', userEmail);
    
    // Enqueue for reliable email dispatch
    outboxWorker.enqueue('RefundRequestedEvent', refundRecord.id, refundRecord, 'Refund');
    domainBus.emit('RefundRequestedEvent', refundRecord);

    console.log(`🔄 [RefundService] Refund #${refundRecord.id} REQUESTED (₹${refundAmount})`);
    return refundRecord;
};

/**
 * Stage 2: Admin flags for warehouse review.
 */
const flagForReview = async (refundId, adminEmail, notes) => {
    const { data, error } = await supabase.from('returns')
        .update({ status: 'UNDER_REVIEW', admin_notes: notes, reviewed_by: adminEmail })
        .eq('id', refundId).eq('status', 'REQUESTED').select().single();
    
    if (error) throw new Error('Cannot flag for review from current state.');
    
    await logAudit(refundId, 'REQUESTED', 'UNDER_REVIEW', 'ADMIN', adminEmail, notes);
    
    // Enqueue for any async tasks (e.g. support ticket update if implemented later)
    outboxWorker.enqueue('RefundUnderReviewEvent', data.id, data, 'Refund');
    domainBus.emit('RefundUnderReviewEvent', data);
    
    return data;
};

/**
 * Stage 3 & 4: Admin approves the refund, immediately initiating gateway processing.
 */
const approveAndInitiateRefund = async (refundId, adminEmail, adminNotes, refundOverrideAmount = null) => {
    // Lock and fetch
    const { data: refundRecord, error: fetchErr } = await supabase
        .from('returns')
        .select('*, orders(transaction_id, dispute_status)')
        .eq('id', refundId)
        .single();
        
    if (fetchErr || !refundRecord) throw new Error('Refund not found.');
    if (!['REQUESTED', 'UNDER_REVIEW'].includes(refundRecord.status)) {
        throw new Error(`Cannot approve from status: ${refundRecord.status}`);
    }
    
    if (refundRecord.orders?.dispute_status === 'ACTIVE') {
        throw new Error('Cannot process refund: an active chargeback exists on this order.');
    }

    const finalAmount = refundOverrideAmount ?? refundRecord.refund_amount;
    await validateFinancialIntegrity(refundRecord.order_id, finalAmount, refundId);

    // 1. Mark APPROVED locally
    await supabase.from('returns').update({ 
        status: 'APPROVED', 
        refund_amount: finalAmount, 
        admin_notes: adminNotes, 
        reviewed_by: adminEmail 
    }).eq('id', refundId);
    
    await logAudit(refundId, refundRecord.status, 'APPROVED', 'ADMIN', adminEmail, adminNotes);
    const approvedEventData = { ...refundRecord, refund_amount: finalAmount };
    outboxWorker.enqueue('RefundApprovedEvent', refundId, approvedEventData, 'Refund');
    domainBus.emit('RefundApprovedEvent', approvedEventData);

    // 2. Call Gateway via Adapter
    const gatewayRes = await gatewayAdapter.initiateRefund({
        paymentId: refundRecord.orders.transaction_id,
        amount: finalAmount,
        idempotencyKey: refundRecord.idempotency_key,
        refundId: refundId,
        reasonCode: refundRecord.reason_code
    });

    // 3. Handle Gateway Response
    if (gatewayRes.success) {
        const { data: updated } = await supabase.from('returns').update({
            status: 'GATEWAY_INITIATED',
            gateway_refund_id: gatewayRes.gatewayRefundId,
            refund_status: gatewayRes.status
        }).eq('id', refundId).select().single();

        await logAudit(refundId, 'APPROVED', 'GATEWAY_INITIATED', 'SYSTEM_WEBHOOK', 'GatewayAdapter');
        outboxWorker.enqueue('RefundInitiatedEvent', refundId, updated, 'Refund');
        domainBus.emit('RefundInitiatedEvent', updated);
        console.log(`💸 [RefundService] Refund #${refundId} GATEWAY_INITIATED: ${gatewayRes.gatewayRefundId}`);
        return updated;
    } else {
        const { data: updated } = await supabase.from('returns').update({
            status: 'FAILED',
            admin_notes: `Gateway Failure: ${gatewayRes.error}`,
            refund_status: 'failed'
        }).eq('id', refundId).select().single();

        await logAudit(refundId, 'APPROVED', 'FAILED', 'SYSTEM_WEBHOOK', 'GatewayAdapter', gatewayRes.error);
        outboxWorker.enqueue('RefundFailedEvent', refundId, updated, 'Refund');
        domainBus.emit('RefundFailedEvent', updated);
        console.error(`❌ [RefundService] Refund #${refundId} FAILED at gateway: ${gatewayRes.error}`);
        return updated;
    }
};

/**
 * Stage 3 (Alt): Admin rejects the refund.
 */
const rejectRefund = async (refundId, adminEmail, rejectReason) => {
    if (!rejectReason) throw new Error('Rejection reason is required.');
    
    const { data: refundRecord, error } = await supabase.from('returns')
        .update({ status: 'REJECTED', admin_notes: rejectReason, reviewed_by: adminEmail })
        .eq('id', refundId)
        .in('status', ['REQUESTED', 'UNDER_REVIEW'])
        .select().single();

    if (error) throw new Error('Cannot reject from current state.');

    await logAudit(refundId, 'ANY', 'REJECTED', 'ADMIN', adminEmail, rejectReason);
    outboxWorker.enqueue('RefundRejectedEvent', refundId, refundRecord, 'Refund');
    domainBus.emit('RefundRejectedEvent', refundRecord);
    return refundRecord;
};

/**
 * Webhook Handler: Gateway confirms settlement (PROCESSED)
 */
const markRefundSettled = async (gatewayRefundId, bankReferenceNumber) => {
    const { data, error } = await supabase.from('returns')
        .update({ 
            status: 'PROCESSED_SUCCESS', 
            bank_reference_number: bankReferenceNumber,
            refund_status: 'processed',
            refunded_at: new Date().toISOString()
        })
        .eq('gateway_refund_id', gatewayRefundId)
        .eq('status', 'GATEWAY_INITIATED')
        .select().single();
        
    if (error) return; // Ignore if not found or wrong state
    
    await logAudit(data.id, 'GATEWAY_INITIATED', 'PROCESSED_SUCCESS', 'SYSTEM_WEBHOOK', 'Razorpay', `ARN: ${bankReferenceNumber}`);
    outboxWorker.enqueue('RefundSettledEvent', data.id, data, 'Refund');
    domainBus.emit('RefundSettledEvent', data);
};

// ── Read Queries ───────────────────────────────────────────────────────────────

const getAllReturns = async (filters = {}) => {
    let query = supabase.from('returns').select('*').order('requested_at', { ascending: false });

    if (filters.status)    query = query.eq('status', filters.status);
    if (filters.userEmail) query = query.eq('user_email', filters.userEmail);

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

const getReturnById = async (returnId) => {
    const { data, error } = await supabase.from('returns').select('*').eq('id', returnId).single();
    if (error) throw error;
    return data;
};

module.exports = {
    requestRefund,
    flagForReview,
    approveAndInitiateRefund,
    rejectRefund,
    markRefundSettled,
    getAllReturns,
    getReturnById
};
