/**
 * integrationQueue.js
 *
 * Lightweight in-memory async integration queue for:
 * 1. Direct Qikink Print-on-Demand order submission
 * 2. Resend transactional email dispatch for customer invoice confirmation
 *
 * Runs in the background (via setImmediate) so it never delays HTTP response times.
 * Implements exponential backoff retries (1s, 2s, 4s, 8s, 16s) up to 5 attempts.
 */

const qikinkService = require('./qikinkService');
const emailService  = require('./emailService');
const { updateQikinkOrderDetails, markQikinkFailed, markEmailSent, markEmailFailed } = require('./supabaseService');

const MAX_RETRIES   = 5;
const BASE_DELAY_MS = 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Execute a single background integration task with exponential backoff retries.
 *
 * @param {Object} task
 * @param {string} task.type     - 'qikink_order_creation' | 'resend_invoice_email'
 * @param {Object} task.payload  - Task payload data
 */
const processTask = async (task) => {
    const { type, payload } = task;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // ── Task A: Qikink POD Order Submission ────────────────────────────
            if (type === 'qikink_order_creation') {
                const { orderData, itemsData } = payload;
                console.log(`📦 [IntegrationQueue] Submitting order #${orderData.id || orderData._id} to Qikink API (attempt ${attempt})...`);

                const qikinkRes = await qikinkService.createQikinkOrder(orderData, itemsData);
                await updateQikinkOrderDetails(orderData.id || orderData._id, qikinkRes);
                console.log(`✅ [IntegrationQueue] Qikink order created: ${qikinkRes.qikinkOrderId}`);
                return;
            }

            // ── Task B: Resend Invoice Email Dispatch ──────────────────────────
            if (type === 'resend_invoice_email') {
                const { orderId, customerEmail, customerName, ticketId, invoiceHTML } = payload;

                console.log(`✉️ [IntegrationQueue] Dispatching invoice email via Resend (attempt ${attempt})...`);

                const result = await emailService.sendInvoiceEmail({
                    customerEmail,
                    customerName,
                    orderId,
                    ticketId,
                    invoiceHTML
                });

                if (orderId) {
                    await markEmailSent(orderId);
                }

                console.log(`✅ [IntegrationQueue] Invoice email dispatched — Resend ID: ${result.id}`);
                return;
            }

            throw new Error(`Unknown task type: ${type}`);

        } catch (err) {
            const isLastAttempt = attempt === MAX_RETRIES;
            const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);

            if (isLastAttempt) {
                console.error(`❌ [IntegrationQueue] ${type} permanently failed after ${MAX_RETRIES} attempts:`, err.message);

                // Track failure status in DB
                if (type === 'qikink_order_creation' && payload.orderData) {
                    await markQikinkFailed(payload.orderData.id || payload.orderData._id).catch(() => {});
                } else if (type === 'resend_invoice_email' && payload.orderId) {
                    await markEmailFailed(payload.orderId).catch(() => {});
                }
            } else {
                console.warn(`⚠️ [IntegrationQueue] ${type} attempt ${attempt} failed — retrying in ${delay}ms:`, err.message);
                await sleep(delay);
            }
        }
    }
};

/**
 * Push a task onto the background integration queue.
 * Returns immediately — task executes asynchronously via setImmediate.
 *
 * @param {string} type    - 'qikink_order_creation' | 'resend_invoice_email'
 * @param {Object} payload - Payload data for the task handler
 */
const push = (type, payload) => {
    setImmediate(() => {
        processTask({ type, payload }).catch((err) => {
            console.error(`[IntegrationQueue] Fatal error in background task ${type}:`, err);
        });
    });
};

module.exports = { push };
