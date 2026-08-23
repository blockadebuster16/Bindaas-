const express      = require('express');
const router       = express.Router();
const { getOrders, updateOrderStatus, getMyOrders, getClimateDonationStatus, syncQikinkStatus } = require('../controllers/orderController');
const { protectAdmin, protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { orderStatusSchema } = require('../validators/schemas');

router.route('/')
    .get(protectAdmin, getOrders);

router.get('/my-orders', protect, getMyOrders);

router.route('/:id/status')
    .put(protectAdmin, validate(orderStatusSchema), updateOrderStatus);

// Qikink Fulfillment Tracking Sync
router.post('/:id/sync-qikink', protectAdmin, syncQikinkStatus);

// Climate Donation Lookup
router.get('/climate-donation/:razorpayOrderId', protectAdmin, getClimateDonationStatus);

// ── Invoice PDF — on-demand generation ─────────────────────────────────────────
// Fetches the stored HTML snapshot and renders it as PDF in-flight.
// No file is saved — PDF is generated and streamed directly to client.
router.get('/:id/invoice/pdf', protect, async (req, res) => {
    try {
        const { getInvoiceByOrderId } = require('../services/invoicePersistService');
        const { generateInvoicePDF }  = require('../services/pdfService');
        const supabaseService         = require('../services/supabaseService');

        const orderId = Number(req.params.id);

        // Verify order belongs to requester (or is admin)
        const orders  = await supabaseService.getOrdersWithItems({ userEmail: req.user.email });
        const isOwner = orders.some(o => o._id === orderId);
        if (!isOwner && !req.user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const invoice = await getInvoiceByOrderId(orderId);
        if (!invoice || !invoice.html_snapshot) {
            return res.status(404).json({ success: false, message: 'Invoice not found. Please contact support.' });
        }

        const pdfBuffer = await generateInvoicePDF(invoice.html_snapshot);

        res.set({
            'Content-Type':        'application/pdf',
            'Content-Disposition': `attachment; filename="BiNDAAS-Invoice-${invoice.invoice_number}.pdf"`,
            'Content-Length':      pdfBuffer.length
        });
        res.send(pdfBuffer);

    } catch (err) {
        console.error('[orderRoutes] PDF generation error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to generate invoice PDF' });
    }
});

// ── Invoice Data — for display in frontend ─────────────────────────────────────
router.get('/:id/invoice', protect, async (req, res) => {
    try {
        const { getInvoiceByOrderId } = require('../services/invoicePersistService');
        const invoice = await getInvoiceByOrderId(Number(req.params.id));
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        // Strip HTML snapshot from public response (security + bandwidth)
        const { html_snapshot: _, ...invoiceData } = invoice;
        res.json({ success: true, invoice: invoiceData });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
