/**
 * invoiceService.js
 * 
 * Luxury HTML Invoice Renderer with dynamic placeholder mapping.
 * Generates brand-styled HTML invoices for email delivery via Resend / emailService.
 */

/**
 * Generate a luxury HTML invoice for a confirmed order.
 * 
 * @param {Object} order  - Order object with userEmail, totalAmount, shippingInfo, ticketId, etc.
 * @param {Array} items   - Cart line items array
 * @returns {string}      - HTML document string
 */
const generateInvoiceHTML = (order, items = []) => {
    const shipping = order.shippingInfo || order.shipping_info || {};
    const customerName = `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim() || order.userEmail || 'Valued Client';
    const orderDate = new Date(order.orderDate || order.order_date || Date.now()).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const itemsRows = items.map(item => `
        <tr>
            <td style="padding: 14px 16px; border-bottom: 1px solid #1a1a1a; color: #f3f3f3; font-size: 14px;">
                <strong style="color: #d4af37;">${escapeHtml(item.name || 'Luxury Item')}</strong><br/>
                <span style="font-size: 12px; color: #888888;">Size: ${escapeHtml(item.size || 'M')}</span>
            </td>
            <td style="padding: 14px 16px; border-bottom: 1px solid #1a1a1a; color: #cccccc; font-size: 14px; text-align: center;">
                ${item.quantity}
            </td>
            <td style="padding: 14px 16px; border-bottom: 1px solid #1a1a1a; color: #d4af37; font-size: 14px; text-align: right; font-family: monospace;">
                ₹${Number(item.price).toLocaleString('en-IN')}
            </td>
            <td style="padding: 14px 16px; border-bottom: 1px solid #1a1a1a; color: #ffffff; font-size: 14px; text-align: right; font-weight: 600; font-family: monospace;">
                ₹${(Number(item.price) * item.quantity).toLocaleString('en-IN')}
            </td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice — Bindass Luxury</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b0b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #e0e0e0;">
    <div style="max-width: 680px; margin: 40px auto; background-color: #121212; border: 1px solid #222222; border-radius: 8px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.8);">
        
        <!-- HEADER -->
        <div style="padding: 36px 40px; background: linear-gradient(135deg, #111111 0%, #1a1810 100%); border-bottom: 2px solid #d4af37; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; letter-spacing: 4px; color: #d4af37; font-weight: 700; text-transform: uppercase;">BINDASS</h1>
            <p style="margin: 6px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #888888; text-transform: uppercase;">Luxury Apparel & Couture</p>
        </div>

        <!-- ORDER REF & TICKET -->
        <div style="padding: 24px 40px; background-color: #161616; border-bottom: 1px solid #222222; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <p style="margin: 0; font-size: 12px; color: #888888; text-transform: uppercase;">Order Reference</p>
                <p style="margin: 4px 0 0 0; font-size: 16px; color: #ffffff; font-weight: 600; font-family: monospace;">#${order._id || order.id}</p>
            </div>
            <div style="text-align: right;">
                <p style="margin: 0; font-size: 12px; color: #888888; text-transform: uppercase;">Digital Token ID</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #d4af37; font-family: monospace;">${order.ticketId || order.ticket_id || 'VERIFIED'}</p>
            </div>
        </div>

        <!-- ADDRESS & META -->
        <div style="padding: 32px 40px; border-bottom: 1px solid #1f1f1f;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="width: 50%; vertical-align: top;">
                        <p style="margin: 0; font-size: 11px; color: #d4af37; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Billed & Shipped To</p>
                        <p style="margin: 8px 0 0 0; font-size: 15px; color: #ffffff; font-weight: 600;">${escapeHtml(customerName)}</p>
                        <p style="margin: 4px 0 0 0; font-size: 13px; color: #aaaaaa; line-height: 1.5;">
                            ${escapeHtml(shipping.address || '')}<br/>
                            ${escapeHtml(shipping.city || '')}, ${escapeHtml(shipping.state || '')} - ${escapeHtml(shipping.pincode || shipping.zip || '')}<br/>
                            Contact: ${escapeHtml(shipping.phone || shipping.mobile || '')}
                        </p>
                    </td>
                    <td style="width: 50%; vertical-align: top; text-align: right;">
                        <p style="margin: 0; font-size: 11px; color: #d4af37; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Payment Details</p>
                        <p style="margin: 8px 0 0 0; font-size: 13px; color: #cccccc;">Date: <strong style="color: #ffffff;">${orderDate}</strong></p>
                        <p style="margin: 4px 0 0 0; font-size: 13px; color: #cccccc;">Transaction ID: <br/><span style="font-family: monospace; color: #d4af37; font-size: 12px;">${order.transactionId || order.transaction_id || 'N/A'}</span></p>
                        <p style="margin: 4px 0 0 0; font-size: 13px; color: #cccccc;">Status: <span style="background-color: #1b3820; color: #4ade80; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">PAID</span></p>
                    </td>
                </tr>
            </table>
        </div>

        <!-- ITEMS TABLE -->
        <div style="padding: 32px 40px 16px 40px;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid #333333;">
                        <th style="padding: 10px 16px; text-align: left; font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Item Description</th>
                        <th style="padding: 10px 16px; text-align: center; font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                        <th style="padding: 10px 16px; text-align: right; font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Price</th>
                        <th style="padding: 10px 16px; text-align: right; font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRows}
                </tbody>
            </table>
        </div>

        <!-- TOTALS SUMMARY -->
        <div style="padding: 16px 40px 32px 40px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="width: 50%;"></td>
                    <td style="width: 50%;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 6px 0; color: #aaaaaa; font-size: 13px;">Grand Total</td>
                                <td style="padding: 6px 0; color: #d4af37; font-size: 18px; font-weight: 700; text-align: right; font-family: monospace;">₹${Number(order.totalAmount || order.total_amount).toLocaleString('en-IN')}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>

        <!-- FOOTER -->
        <div style="padding: 24px 40px; background-color: #0b0b0b; border-top: 1px solid #1a1a1a; text-align: center; font-size: 12px; color: #666666;">
            <p style="margin: 0;">Thank you for your patronizing Bindass Luxury Couture.</p>
            <p style="margin: 4px 0 0 0; color: #444444;">For support or inquiries: support@bindaas.social</p>
        </div>

    </div>
</body>
</html>
    `;
};

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = { generateInvoiceHTML };
