const express = require('express');
const router = express.Router();
const { getOrders, updateOrderStatus, getMyOrders, getClimateDonationStatus } = require('../controllers/orderController');
const { protectAdmin, protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protectAdmin, getOrders);

router.get('/my-orders', protect, getMyOrders);

router.route('/:id/status')
    .put(protectAdmin, updateOrderStatus);

// n8n Automated Lookup
router.get('/climate-donation/:razorpayOrderId', protectAdmin, getClimateDonationStatus);

module.exports = router;
