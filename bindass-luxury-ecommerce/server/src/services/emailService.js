/**
 * emailService.js
 *
 * Transactional email dispatcher using the Resend SDK.
 * Sends luxury HTML invoices directly to customers after payment confirmation.
 *
 * Configured via environment variables:
 *   RESEND_API_KEY   — Resend API key (from resend.com dashboard)
 *   EMAIL_FROM       — Sender address (must be a verified Resend domain)
 *   EMAIL_REPLY_TO   — Reply-to address for customer replies
 *
 * Dev Mode: If RESEND_API_KEY is not set, the function logs a warning and
 * returns a mock message ID without throwing — safe for local development.
 */

const { Resend } = require('resend');

let resendClient = null;

const getResendClient = () => {
    if (!resendClient && process.env.RESEND_API_KEY) {
        resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
};

/**
 * Send the luxury HTML invoice to a customer via Resend.
 *
 * @param {Object} opts
 * @param {string}        opts.customerEmail  - Recipient email address
 * @param {string}        opts.customerName   - Recipient full name (used in subject personalisation)
 * @param {string|number} opts.orderId        - Internal Supabase order ID (for subject line)
 * @param {string}        opts.ticketId       - Luxury digital token ID displayed in invoice
 * @param {string}        opts.invoiceHTML    - Pre-rendered HTML invoice string from invoiceService.js
 *
 * @returns {Promise<{id: string}>} Resend message object with delivery ID
 * @throws  {Error} If the Resend API returns an error response
 */
const sendInvoiceEmail = async ({ customerEmail, customerName, orderId, ticketId, invoiceHTML }) => {
    const client = getResendClient();

    // ── Dev Mode Guard ──────────────────────────────────────────────────────────
    if (!client) {
        console.warn(
            `⚠️ [emailService] RESEND_API_KEY is not set — running in Dev Mode.\n` +
            `   Would have sent invoice to: ${customerEmail} for Order #${orderId}`
        );
        return { id: `dev_mock_${Date.now()}` };
    }

    // ── Build Email Options ─────────────────────────────────────────────────────
    const firstName = (customerName || '').split(' ')[0] || 'Valued Client';

    const recipient = (process.env.DEV_OVERRIDE_EMAIL && process.env.NODE_ENV !== 'production')
        ? process.env.DEV_OVERRIDE_EMAIL
        : customerEmail;

    const emailOptions = {
        from: process.env.EMAIL_FROM || 'BiNDAAS! Luxury <onboarding@resend.dev>',
        reply_to: process.env.EMAIL_REPLY_TO || 'support@bindaas.social',
        to: [recipient],
        subject: `✨ Your Order is Confirmed, ${firstName}! — BiNDAAS! Luxury Couture`,
        html: invoiceHTML,
        headers: {
            'X-Order-ID':  String(orderId  || ''),
            'X-Ticket-ID': String(ticketId || '')
        },
        tags: [
            { name: 'category', value: 'order_confirmation' },
            { name: 'brand',    value: 'bindass_luxury'      }
        ]
    };

    // ── Dispatch via Resend SDK ─────────────────────────────────────────────────
    const { data, error } = await client.emails.send(emailOptions);

    if (error) {
        // Resend returns structured error objects — throw with full context
        const message = error.message || JSON.stringify(error);
        throw new Error(`[emailService] Resend API error: ${message}`);
    }

    console.log(
        `✉️ [emailService] Invoice dispatched via Resend\n` +
        `   → To:       ${customerEmail}\n` +
        `   → Order:    #${orderId}\n` +
        `   → Ticket:   ${ticketId}\n` +
        `   → Resend ID: ${data.id}`
    );

    return data; // { id: "re_xxxx" }
};

module.exports = { sendInvoiceEmail };
