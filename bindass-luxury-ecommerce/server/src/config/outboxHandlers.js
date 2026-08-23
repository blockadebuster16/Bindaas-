/**
 * outboxHandlers.js
 *
 * Registers domain event handlers for the outboxWorker.
 * These handlers are executed reliably by the outbox polling mechanism.
 */

const outboxWorker  = require('../services/outboxWorker');
const qikinkService = require('../services/qikinkService');
const emailService  = require('../services/emailService');
const invoicePersistService = require('../services/invoicePersistService');
const refundNotificationService = require('../services/refundNotificationService');
const { updateQikinkOrderDetails, markQikinkFailed } = require('../services/supabaseService');

const initHandlers = () => {
    // ── Handler: OrderPaidEvent ─────────────────────────────────────────────────
    // Fired when a payment is verified, invoice is generated, and stock is decremented.
    outboxWorker.registerHandler('OrderPaidEvent', async (payload) => {
        const { orderData, items, userEmail, customerName, ticketId, invoiceHTML, invoiceId } = payload;

        // 1. Dispatch Resend Email
        console.log(`✉️ [outboxHandlers] Dispatching invoice email for order ${orderData.id}...`);
        const emailResult = await emailService.sendInvoiceEmail({
            customerEmail: userEmail,
            customerName,
            orderId: orderData.id,
            ticketId,
            invoiceHTML
        });
        
        if (emailResult && emailResult.id) {
            await invoicePersistService.markInvoiceEmailSent(invoiceId, emailResult.id);
        }

        // 2. Submit to Qikink (POD Fulfillment)
        console.log(`📦 [outboxHandlers] Submitting order ${orderData.id} to Qikink...`);
        try {
            const qikinkRes = await qikinkService.createQikinkOrder(orderData, items);
            await updateQikinkOrderDetails(orderData.id, qikinkRes);
            console.log(`✅ [outboxHandlers] Qikink order created: ${qikinkRes.qikinkOrderId}`);
        } catch (qErr) {
            console.error(`❌ [outboxHandlers] Qikink submission failed:`, qErr.message);
            await markQikinkFailed(orderData.id).catch(() => {});
            throw qErr; // Rethrow so the worker knows it failed and applies backoff retries
        }
    });

    // ── Handlers: Refund Lifecycle Events ───────────────────────────────────────
    outboxWorker.registerHandler('RefundRequestedEvent', async (payload) => {
        await refundNotificationService.notifyRequested(payload);
    });

    outboxWorker.registerHandler('RefundApprovedEvent', async (payload) => {
        await refundNotificationService.notifyApproved(payload);
    });

    outboxWorker.registerHandler('RefundRejectedEvent', async (payload) => {
        await refundNotificationService.notifyRejected(payload);
    });

    outboxWorker.registerHandler('RefundSettledEvent', async (payload) => {
        await refundNotificationService.notifySettled(payload);
    });

    outboxWorker.registerHandler('RefundFailedEvent', async (payload) => {
        await refundNotificationService.notifyFailed(payload);
    });

    // Start the worker polling loop
    outboxWorker.start();
};

module.exports = { initHandlers };
