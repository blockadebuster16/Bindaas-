/**
 * returnService.js
 *
 * Handles the full return/refund lifecycle:
 * 1. Customer submits a return request (status: REQUESTED)
 * 2. Admin reviews and approves/rejects (status: APPROVED | REJECTED)
 * 3. On approval: Razorpay Refund API is called automatically
 * 4. Stock is restored via inventoryService.js
 * 5. Inventory ledger entry is written
 * 6. Events are emitted on the domain bus
 *
 * Automated Refund Decision:
 * YES — automated Razorpay refunds on admin approval are the right call because:
 * - Human approval preserves fraud protection / manual review step
 * - Automated API execution eliminates Razorpay dashboard navigation
 * - Full Razorpay refund_id audit trail is stored
 * - Supports partial refunds (e.g. refund only damaged items, not full order)
 */

const Razorpay         = require('razorpay');
const supabase         = require('../config/supabase');
const inventoryService = require('./inventoryService');
const domainBus        = require('./eventEmitter');

const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ── 1. Customer: Submit Return Request ──────────────────────────────────────────

/**
 * Create a new return request from a customer.
 *
 * @param {Object} opts
 * @param {number}   opts.orderId       - Supabase order ID
 * @param {string}   opts.userEmail     - Customer email (must match order.user_email)
 * @param {string}   opts.reason        - Brief reason (e.g. 'DAMAGED', 'WRONG_SIZE', 'CHANGED_MIND')
 * @param {string}   opts.description   - Detailed description
 * @param {Array}    opts.itemsToReturn - [{ product_id, quantity, reason }]
 * @param {number}   opts.refundAmount  - Requested refund amount (validated server-side)
 *
 * @returns {Promise<Object>} - Created return record
 */
const createReturnRequest = async ({ orderId, userEmail, reason, description, itemsToReturn = [], refundAmount }) => {
    // Validate order belongs to user
    const { data: order, error: orderErr } = await supabase
        .from('orders')
        .select('id, user_email, total_amount, transaction_id, status, payment_status')
        .eq('id', orderId)
        .single();

    if (orderErr || !order) throw new Error('Order not found');
    if (order.user_email !== userEmail) throw new Error('Unauthorized: order does not belong to this user');
    if (order.payment_status !== 'PAYMENT_VERIFIED') throw new Error('Cannot return an order that has not been paid');

    // Check for existing pending return
    const { data: existingReturn } = await supabase
        .from('returns')
        .select('id, status')
        .eq('order_id', orderId)
        .not('status', 'in', '("REJECTED","CLOSED")')
        .maybeSingle();

    if (existingReturn) throw new Error('A return request is already active for this order');

    // Server-side refund amount validation: cannot exceed order total
    const validatedRefundAmount = Math.min(
        parseFloat(refundAmount || 0),
        parseFloat(order.total_amount)
    );

    const { data: returnRecord, error } = await supabase
        .from('returns')
        .insert([{
            order_id:        orderId,
            user_email:      userEmail,
            reason:          reason,
            description:     description || null,
            items_to_return: itemsToReturn,
            refund_amount:   validatedRefundAmount,
            status:          'REQUESTED',
            razorpay_payment_id: order.transaction_id
        }])
        .select()
        .single();

    if (error) throw error;

    // Emit domain event
    domainBus.emit('ReturnRequestedEvent', {
        orderId,
        returnId: returnRecord.id,
        userEmail,
        refundAmount: validatedRefundAmount
    });

    console.log(`🔄 [returnService] Return #${returnRecord.id} requested for Order #${orderId}`);
    return returnRecord;
};


// ── 2. Admin: Approve Return → Auto-Refund + Stock Restore ─────────────────────

/**
 * Admin approves a return request.
 * Automatically triggers:
 *   1. Razorpay Refund API call
 *   2. Stock restoration via inventoryService
 *   3. Inventory ledger entry (RETURN event)
 *   4. Order status update to REFUNDED
 *   5. Domain event emission
 *
 * @param {number} returnId    - Return record ID
 * @param {string} adminEmail  - Admin email (for audit trail)
 * @param {string} adminNotes  - Optional admin notes
 * @param {number} refundOverride - Override refund amount (partial refund)
 *
 * @returns {Promise<Object>} - Updated return record with Razorpay refund details
 */
const approveReturn = async (returnId, adminEmail, adminNotes = null, refundOverride = null) => {
    // Fetch return record
    const { data: returnRecord, error: fetchErr } = await supabase
        .from('returns')
        .select('*')
        .eq('id', returnId)
        .single();

    if (fetchErr || !returnRecord) throw new Error('Return record not found');
    if (returnRecord.status !== 'REQUESTED' && returnRecord.status !== 'ADMIN_REVIEW') {
        throw new Error(`Cannot approve return in status: ${returnRecord.status}`);
    }

    const refundAmount = refundOverride ?? returnRecord.refund_amount;
    const refundPaise  = Math.round(parseFloat(refundAmount) * 100);

    // ── Step 1: Call Razorpay Refund API ───────────────────────────────────────
    let razorpayRefundId = null;
    let refundStatus     = 'pending';

    try {
        const refundResponse = await razorpay.payments.refund(returnRecord.razorpay_payment_id, {
            amount: refundPaise,
            speed:  'normal',  // 'normal' = 5-7 days | 'optimum' = instant (higher fee)
            notes: {
                return_id:   String(returnId),
                order_id:    String(returnRecord.order_id),
                admin_email: adminEmail,
                reason:      returnRecord.reason
            }
        });

        razorpayRefundId = refundResponse.id;
        refundStatus     = refundResponse.status;

        console.log(`💸 [returnService] Refund initiated: ${razorpayRefundId} (₹${refundAmount}) — Status: ${refundStatus}`);
    } catch (razorpayErr) {
        console.error('[returnService] Razorpay refund API error:', razorpayErr.message);
        // Mark return as failed refund — don't throw, update DB with error
        await supabase.from('returns').update({
            status:         'ADMIN_REVIEW',
            admin_notes:    `Refund API failed: ${razorpayErr.message}. Manual refund required.`,
            reviewed_by:    adminEmail,
            reviewed_at:    new Date().toISOString()
        }).eq('id', returnId);

        throw new Error(`Razorpay Refund API failed: ${razorpayErr.message}`);
    }

    // ── Step 2: Restore stock ───────────────────────────────────────────────────
    const itemsToReturn = returnRecord.items_to_return || [];
    if (itemsToReturn.length > 0) {
        await inventoryService.restoreStock(
            itemsToReturn,
            returnRecord.order_id,
            returnId,
            'RETURN',
            adminEmail
        ).catch(e => console.error('[returnService] Stock restore error:', e.message));
    }

    // ── Step 3: Update return record ────────────────────────────────────────────
    const { data: updatedReturn, error: updateErr } = await supabase
        .from('returns')
        .update({
            status:              'REFUND_INITIATED',
            admin_notes:         adminNotes,
            reviewed_by:         adminEmail,
            reviewed_at:         new Date().toISOString(),
            refund_amount:       refundAmount,
            razorpay_refund_id:  razorpayRefundId,
            refund_status:       refundStatus,
            refunded_at:         new Date().toISOString(),
            updated_at:          new Date().toISOString()
        })
        .eq('id', returnId)
        .select()
        .single();

    if (updateErr) throw updateErr;

    // ── Step 4: Update order status ─────────────────────────────────────────────
    await supabase.from('orders')
        .update({ status: 'Refunded', payment_status: 'REFUND_INITIATED' })
        .eq('id', returnRecord.order_id)
        .catch(e => console.error('[returnService] Order status update error:', e.message));

    // ── Step 5: Emit domain event ───────────────────────────────────────────────
    domainBus.emit('OrderRefundInitiatedEvent', {
        orderId:         returnRecord.order_id,
        returnId,
        razorpayRefundId,
        refundAmount,
        userEmail:       returnRecord.user_email,
        adminEmail
    });

    console.log(`✅ [returnService] Return #${returnId} approved — Refund ${razorpayRefundId} initiated`);
    return updatedReturn;
};


// ── 3. Admin: Reject Return ────────────────────────────────────────────────────

/**
 * Admin rejects a return request. No refund or stock change.
 *
 * @param {number} returnId
 * @param {string} adminEmail
 * @param {string} adminNotes - Required reason for rejection
 */
const rejectReturn = async (returnId, adminEmail, adminNotes) => {
    if (!adminNotes) throw new Error('Admin notes are required when rejecting a return');

    const { data, error } = await supabase
        .from('returns')
        .update({
            status:       'REJECTED',
            admin_notes:  adminNotes,
            reviewed_by:  adminEmail,
            reviewed_at:  new Date().toISOString(),
            updated_at:   new Date().toISOString()
        })
        .eq('id', returnId)
        .select()
        .single();

    if (error) throw error;

    domainBus.emit('ReturnRejectedEvent', {
        orderId:   data.order_id,
        returnId,
        userEmail: data.user_email,
        adminEmail
    });

    console.log(`❌ [returnService] Return #${returnId} rejected by ${adminEmail}`);
    return data;
};


// ── 4. Query Returns ────────────────────────────────────────────────────────────

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
    createReturnRequest,
    approveReturn,
    rejectReturn,
    getAllReturns,
    getReturnById
};
