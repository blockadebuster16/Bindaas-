const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto'); // Built-in Node module for security
const { protect } = require('../middleware/authMiddleware'); // Your Firebase "Bouncer"
const { triggerOrderAutomation } = require('../services/automationService');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- STEP 1: Create an Order (Protected by Firebase) ---
router.post('/create-order', protect, async (req, res) => {
    const { amount } = req.body;

    // Safety check: ensure amount is valid
    if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
    }

    try {
        const options = {
            amount: Math.round(amount * 100), // convert to paise, rounded to avoid floating point issues
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // This will now work because 'protect' middleware is present
        console.log(`Order initiated by: ${req.user.email}`);

        res.json(order);
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500).json({ message: "Razorpay Order Error", error });
    }
});

// --- STEP 2: Verify Payment & Trigger Automation ---
router.post('/verify-payment', protect, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;

    // Create the expected signature using your Secret Key
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        console.log("✅ Payment Verified.");

        await triggerOrderAutomation({
            ...orderDetails,
            transactionId: razorpay_payment_id,
            userEmail: req.user.email
        });

        // Return the order info so the Success page can show it
        res.json({
            status: "success",
            order: {
                id: razorpay_order_id,
                amount: orderDetails.amount, // Ensure this is in your orderDetails
                items: orderDetails.cart // If you passed the cart here
            }
        });
    } else {
        res.status(400).json({ status: "failure", message: "Invalid signature" });
    }
});

module.exports = router;