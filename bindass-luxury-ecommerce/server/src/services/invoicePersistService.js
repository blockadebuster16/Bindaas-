/**
 * invoicePersistService.js
 *
 * Persists generated invoices to the Supabase `invoices` + `invoice_items` tables.
 * Provides GST-compliant sequential invoice numbering (INV-YYYY-XXXXXX).
 * Stores full HTML snapshot for re-generation and compliance auditing.
 *
 * GST Configuration:
 *   - Default HSN Code 6211: Readymade garments / luxury apparel
 *   - CGST: 9% | SGST: 9% (intra-state transactions)
 *   - IGST: 18% (inter-state — not applied by default, set via order metadata)
 */

const supabase = require('../config/supabase');

// ── GST Constants ───────────────────────────────────────────────────────────────
const DEFAULT_HSN_CODE  = '6211';   // HSN for readymade garments (apparel ≤ ₹1000 → 5%, > ₹1000 → 12%)
const DEFAULT_CGST_RATE = 9.00;
const DEFAULT_SGST_RATE = 9.00;

/**
 * Generate a sequential invoice number in the format: INV-YYYY-XXXXXX
 * Uses Supabase sequence `invoice_number_seq` for collision-safe numbering.
 *
 * @returns {Promise<string>} e.g. "INV-2026-001042"
 */
const generateInvoiceNumber = async () => {
    const { data, error } = await supabase.rpc('nextval', { sequence_name: 'invoice_number_seq' }).single()
        .catch(() => ({ data: null, error: true }));

    // Fallback if RPC isn't available: use timestamp-based number
    const seq = data ? String(data).padStart(6, '0') : String(Date.now()).slice(-6);
    const year = new Date().getFullYear();
    return `INV-${year}-${seq}`;
};

/**
 * Persist a complete invoice record with GST breakdown to Supabase.
 *
 * @param {Object} opts
 * @param {Object}   opts.order         - Supabase order record (id, user_email, total_amount, etc.)
 * @param {Array}    opts.items         - Order items [{ product_id, name, quantity, price, size }]
 * @param {string}   opts.invoiceHTML   - Pre-rendered HTML from invoiceService.js
 * @param {Object}   opts.gstSettings   - { cgstRate, sgstRate, shippingGst, climateFee } from store settings
 * @param {Object}   opts.pricing       - { subtotal, discount, shipping, cgst, sgst, climateFee, total }
 *
 * @returns {Promise<Object>} - Persisted invoice record { id, invoice_number, ... }
 */
const persistInvoice = async ({ order, items = [], invoiceHTML, gstSettings = {}, pricing = {} }) => {
    if (!supabase) {
        console.warn('[invoicePersistService] Supabase not initialized — invoice not persisted');
        return { id: null, invoice_number: 'INV-OFFLINE' };
    }

    const invoiceNumber = await generateInvoiceNumber();

    // ── Calculate GST breakdown ─────────────────────────────────────────────────
    const cgstRate    = gstSettings.cgstRate    ?? DEFAULT_CGST_RATE;
    const sgstRate    = gstSettings.sgstRate    ?? DEFAULT_SGST_RATE;
    const subtotal    = pricing.subtotal        ?? 0;
    const discount    = pricing.discount        ?? 0;
    const shipping    = pricing.shipping        ?? 0;
    const climateFee  = Number(order.climate_contribution ?? 0);
    const taxableBase = subtotal - discount;
    const cgstAmount  = parseFloat(((taxableBase * cgstRate) / 100).toFixed(2));
    const sgstAmount  = parseFloat(((taxableBase * sgstRate) / 100).toFixed(2));
    const shippingGst = parseFloat(((shipping * (gstSettings.shippingGst ?? 18)) / 100).toFixed(2));
    const totalAmount = Number(order.total_amount);

    // ── Build HSN breakdown ─────────────────────────────────────────────────────
    // Bindaas sells single category apparel — all items share HSN 6211
    const hsnBreakdown = [{
        hsn_code:    DEFAULT_HSN_CODE,
        description: 'Readymade Garments / Luxury Apparel',
        taxable_amount: taxableBase,
        cgst_rate:   cgstRate,
        sgst_rate:   sgstRate,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount
    }];

    // ── Shipping info ────────────────────────────────────────────────────────────
    const shippingInfo   = order.shipping_info   || {};
    const customerName   = `${shippingInfo.firstName || ''} ${shippingInfo.lastName || ''}`.trim();
    const customerPhone  = shippingInfo.phone || shippingInfo.mobile || '';

    // ── Insert invoice record ────────────────────────────────────────────────────
    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
            order_id:            order.id,
            invoice_number:      invoiceNumber,
            user_email:          order.user_email,
            customer_name:       customerName || null,
            customer_phone:      customerPhone || null,
            subtotal:            subtotal,
            discount_amount:     discount,
            shipping_amount:     shipping,
            shipping_gst_amount: shippingGst,
            cgst_rate:           cgstRate,
            sgst_rate:           sgstRate,
            cgst_amount:         cgstAmount,
            sgst_amount:         sgstAmount,
            igst_amount:         0,
            climate_fee:         climateFee,
            total_amount:        totalAmount,
            currency:            'INR',
            seller_gstin:        process.env.SELLER_GSTIN || 'PENDING_REGISTRATION',
            seller_pan:          process.env.SELLER_PAN   || null,
            default_hsn_code:    DEFAULT_HSN_CODE,
            hsn_breakdown:       hsnBreakdown,
            html_snapshot:       invoiceHTML,
            status:              'ISSUED'
        }])
        .select()
        .single();

    if (invoiceError) {
        console.error('[invoicePersistService] Failed to persist invoice:', invoiceError.message);
        throw invoiceError;
    }

    // ── Insert line items (best-effort, non-blocking) ────────────────────────────
    if (items.length > 0) {
        const lineItems = items.map(item => {
            const lineTotal  = parseFloat((item.price * item.quantity).toFixed(2));
            const lineCGST   = parseFloat(((lineTotal * cgstRate) / 100).toFixed(2));
            const lineSGST   = parseFloat(((lineTotal * sgstRate) / 100).toFixed(2));
            return {
                invoice_id:   invoice.id,
                product_id:   String(item.product_id || item.id || ''),
                name:         item.name,
                hsn_code:     DEFAULT_HSN_CODE,
                size:         item.size || null,
                quantity:     item.quantity,
                unit_price:   item.price,
                line_total:   lineTotal,
                cgst_amount:  lineCGST,
                sgst_amount:  lineSGST,
                igst_amount:  0
            };
        });

        await supabase.from('invoice_items').insert(lineItems)
            .catch(e => console.error('[invoicePersistService] Line items insert error:', e.message));
    }

    // ── Link invoice_id back to the order ────────────────────────────────────────
    await supabase.from('orders')
        .update({ invoice_id: invoice.id })
        .eq('id', order.id)
        .catch(e => console.error('[invoicePersistService] Failed to link invoice to order:', e.message));

    console.log(`📋 [invoicePersistService] Invoice persisted: ${invoiceNumber} (ID: ${invoice.id}) for Order #${order.id}`);
    return invoice;
};

/**
 * Mark an invoice as email-sent (updates email_sent_at timestamp).
 * Called by emailService after successful Resend dispatch.
 *
 * @param {number} invoiceId
 * @param {string} resendMessageId - Resend delivery ID
 */
const markInvoiceEmailSent = async (invoiceId, resendMessageId) => {
    if (!invoiceId || !supabase) return;
    await supabase.from('invoices')
        .update({
            email_sent_at: new Date().toISOString(),
            metadata: { resend_message_id: resendMessageId }
        })
        .eq('id', invoiceId)
        .catch(e => console.error('[invoicePersistService] Failed to mark email sent:', e.message));
};

/**
 * Fetch a persisted invoice record by order ID.
 *
 * @param {number} orderId
 * @returns {Promise<Object|null>}
 */
const getInvoiceByOrderId = async (orderId) => {
    const { data, error } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('order_id', orderId)
        .single();

    if (error) return null;
    return data;
};

module.exports = {
    persistInvoice,
    markInvoiceEmailSent,
    getInvoiceByOrderId
};
