/**
 * returnRoutes.js
 *
 * Returns & Refund Management API
 *
 * Customer Routes (protected):
 *   POST /api/returns/request           - Submit a return request
 *   GET  /api/returns/my               - Get customer's own return requests
 *
 * Admin Routes (admin-protected):
 *   GET  /api/returns                  - List all returns (filterable)
 *   GET  /api/returns/:id              - Get specific return record
 *   POST /api/returns/:id/approve      - Approve return + trigger Razorpay refund
 *   POST /api/returns/:id/reject       - Reject return with notes
 */

const express      = require('express');
const router       = express.Router();
const { protect, protectAdmin }  = require('../middleware/authMiddleware');
const refundService = require('../services/refundProcessingService');

// ── Customer: Submit Return Request ─────────────────────────────────────────────
router.post('/request', protect, async (req, res) => {
    const { orderId, reason, description, itemsToReturn, refundAmount } = req.body;

    if (!orderId || !reason) {
        return res.status(400).json({ success: false, message: 'orderId and reason are required' });
    }

    try {
        const returnRecord = await refundService.requestRefund({
            orderId:       Number(orderId),
            userEmail:     req.user.email,
            reasonCode:    reason, // mapped to reasonCode in new engine
            customerNotes: description,
            itemsToReturn: itemsToReturn || [],
            refundAmount:  refundAmount  || 0
        });

        res.status(201).json({ success: true, return: returnRecord });
    } catch (err) {
        console.error('[returnRoutes] Create return error:', err.message);
        res.status(400).json({ success: false, message: err.message });
    }
});

// ── Customer: Get Own Returns ───────────────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
    try {
        const returns = await refundService.getAllReturns({ userEmail: req.user.email });
        res.json({ success: true, returns });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Admin: List All Returns ─────────────────────────────────────────────────────
router.get('/', protectAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        const returns = await refundService.getAllReturns({ status });
        res.json({ success: true, returns });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Admin: Get Single Return ────────────────────────────────────────────────────
router.get('/:id', protectAdmin, async (req, res) => {
    try {
        const returnRecord = await refundService.getReturnById(Number(req.params.id));
        res.json({ success: true, return: returnRecord });
    } catch (err) {
        res.status(404).json({ success: false, message: 'Return not found' });
    }
});

// ── Admin: Approve Return (triggers automated Razorpay refund) ─────────────────
router.post('/:id/approve', protectAdmin, async (req, res) => {
    const { adminNotes, refundAmount } = req.body;

    try {
        const result = await refundService.approveAndInitiateRefund(
            Number(req.params.id),
            req.admin?.email || 'admin@bindaas.luxury',
            adminNotes  || null,
            refundAmount || null
        );
        res.json({ success: true, return: result, message: 'Return approved and refund initiated via Razorpay' });
    } catch (err) {
        console.error('[returnRoutes] Approve return error:', err.message);
        res.status(400).json({ success: false, message: err.message });
    }
});

// ── Admin: Reject Return ────────────────────────────────────────────────────────
router.post('/:id/reject', protectAdmin, async (req, res) => {
    const { adminNotes } = req.body;

    if (!adminNotes) {
        return res.status(400).json({ success: false, message: 'adminNotes are required when rejecting' });
    }

    try {
        const result = await refundService.rejectRefund(
            Number(req.params.id),
            req.admin?.email || 'admin@bindaas.luxury',
            adminNotes
        );
        res.json({ success: true, return: result, message: 'Return request rejected' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router;
