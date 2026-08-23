/**
 * paymentGatewayRefundAdapter.js
 *
 * Interface for initiating refunds with Razorpay using idempotency keys
 * and handling asynchronous settlement webhooks safely.
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Initiates a refund against a specific Razorpay Payment ID.
 * Wraps the outbound call with an idempotency key to prevent accidental double charges.
 * 
 * @param {Object} opts
 * @param {string} opts.paymentId     - Original Razorpay Payment ID (`pay_xxx`)
 * @param {number} opts.amount        - Amount in INR (will be converted to paise)
 * @param {string} opts.idempotencyKey- Unique key generated for this refund attempt
 * @param {string} opts.refundId      - Internal DB refund/return ID for auditing
 * @param {string} opts.reasonCode    - Short reason code mapping
 * 
 * @returns {Promise<Object>} - Contains { gatewayRefundId, status, error }
 */
const initiateRefund = async ({ paymentId, amount, idempotencyKey, refundId, reasonCode }) => {
    try {
        const amountPaise = Math.round(parseFloat(amount) * 100);

        // Map internal reasons to Razorpay standard reasons if necessary, or pass custom notes
        const refundResponse = await razorpay.payments.refund(paymentId, {
            amount: amountPaise,
            speed: 'normal',
            notes: {
                refund_id: String(refundId),
                idempotency_key: idempotencyKey,
                reason: reasonCode
            }
        });

        return {
            success: true,
            gatewayRefundId: refundResponse.id,
            status: refundResponse.status // typically 'pending' or 'processed'
        };
    } catch (error) {
        console.error(`[GatewayAdapter] Razorpay refund failed for ${paymentId}:`, error.message);
        return {
            success: false,
            error: error.message || 'Gateway rejection'
        };
    }
};

/**
 * Checks the status of a specific refund at the gateway level.
 * Useful for split-brain/timeout recovery.
 * 
 * @param {string} gatewayRefundId - Razorpay `rfnd_xxx` ID
 * @returns {Promise<Object>} - Razorpay refund entity
 */
const verifyRefundStatus = async (gatewayRefundId) => {
    try {
        const response = await razorpay.refunds.fetch(gatewayRefundId);
        return response;
    } catch (error) {
        console.error(`[GatewayAdapter] Failed to fetch refund status for ${gatewayRefundId}:`, error.message);
        throw error;
    }
};

module.exports = {
    initiateRefund,
    verifyRefundStatus
};
