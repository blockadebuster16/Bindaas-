/**
 * refundNotificationService.js
 *
 * Formats and dispatches transactional emails for refund lifecycle events.
 * Triggered asynchronously by the outboxWorker / domainBus.
 */

const { Resend } = require('resend');

// If Resend is not configured, fall back to silent logging
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = 'support@bindaas.social';

const sendEmail = async (to, subject, htmlContent) => {
    if (!resend) {
        console.warn(`[RefundNotifications] Resend API key missing. Would send to ${to}: ${subject}`);
        return;
    }
    try {
        await resend.emails.send({
            from: `BiNDAAS Support <${FROM_EMAIL}>`,
            to,
            subject,
            html: htmlContent
        });
        console.log(`✉️ [RefundNotifications] Sent to ${to}: ${subject}`);
    } catch (err) {
        console.error(`❌ [RefundNotifications] Failed to send email to ${to}:`, err.message);
    }
};

const notifyRequested = async (refundRecord) => {
    const subject = `Your Return Request Received — Order #${refundRecord.order_id}`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
            <h2>Return Request Received</h2>
            <p>Hi,</p>
            <p>We've received your return/refund request for Order <strong>#${refundRecord.order_id}</strong>.</p>
            <p><strong>Amount Requested:</strong> ₹${refundRecord.refund_amount}</p>
            <p><strong>Reason:</strong> ${refundRecord.reason_code || 'N/A'}</p>
            <p>Our team is reviewing your request. You can expect an update within <strong>1-2 business days</strong>.</p>
            <hr />
            <p style="font-size: 12px; color: #666;">BiNDAAS Luxury Support</p>
        </div>
    `;
    await sendEmail(refundRecord.user_email, subject, html);
};

const notifyApproved = async (refundRecord) => {
    const subject = `Refund Approved — Order #${refundRecord.order_id}`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
            <h2>Refund Approved</h2>
            <p>Great news!</p>
            <p>Your refund of <strong>₹${refundRecord.refund_amount}</strong> for Order #${refundRecord.order_id} has been approved.</p>
            <p>We are queuing it for bank processing. Once the bank confirms the transfer, we will send you the Bank Reference Number (ARN).</p>
            <hr />
            <p style="font-size: 12px; color: #666;">BiNDAAS Luxury Support</p>
        </div>
    `;
    await sendEmail(refundRecord.user_email, subject, html);
};

const notifyRejected = async (refundRecord) => {
    const subject = `Update on Return Request — Order #${refundRecord.order_id}`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
            <h2>Return Request Update</h2>
            <p>Hi,</p>
            <p>After careful review, we are unable to approve your refund request for Order #${refundRecord.order_id} at this time.</p>
            <p><strong>Reason for rejection:</strong><br/>
               <em>${refundRecord.admin_notes || 'Does not meet return policy criteria.'}</em>
            </p>
            <p>If you believe this was an error, please reply to this email to open an escalated support ticket.</p>
            <hr />
            <p style="font-size: 12px; color: #666;">BiNDAAS Luxury Support</p>
        </div>
    `;
    await sendEmail(refundRecord.user_email, subject, html);
};

const notifySettled = async (refundRecord) => {
    const subject = `Refund Processed Successfully — Order #${refundRecord.order_id}`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
            <h2>Refund Complete</h2>
            <p>Your refund of <strong>₹${refundRecord.refund_amount}</strong> has been successfully processed by the payment gateway.</p>
            <p><strong>Bank Reference Number (ARN):</strong> ${refundRecord.bank_reference_number || 'N/A'}</p>
            <p>Please allow 5-7 business days for the funds to reflect in your original payment method.</p>
            <hr />
            <p style="font-size: 12px; color: #666;">BiNDAAS Luxury Support</p>
        </div>
    `;
    await sendEmail(refundRecord.user_email, subject, html);
};

const notifyFailed = async (refundRecord) => {
    const subject = `Action Required: Refund Delayed — Order #${refundRecord.order_id}`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
            <h2>Refund Processing Delay</h2>
            <p>Hi,</p>
            <p>We attempted to process your refund of ₹${refundRecord.refund_amount}, but encountered a delay with the bank/payment gateway.</p>
            <p>Don't worry — our finance team has been automatically notified and is investigating the issue. We will update you shortly or reach out for alternative payout details if needed.</p>
            <hr />
            <p style="font-size: 12px; color: #666;">BiNDAAS Luxury Support</p>
        </div>
    `;
    await sendEmail(refundRecord.user_email, subject, html);
};

module.exports = {
    notifyRequested,
    notifyApproved,
    notifyRejected,
    notifySettled,
    notifyFailed
};
