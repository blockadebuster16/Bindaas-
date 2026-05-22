const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/authMiddleware');
const { triggerOrderAutomation } = require('../services/automationService');
const { createOrder, recordCouponUsage, recordClimateDonation } = require('../services/supabaseService');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- STEP 1: Create an Order ---
router.post('/create-order', protect, async (req, res) => {
    const { amount, currency } = req.body;
    const resolvedCurrency = currency || 'INR';

    if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
    }

    try {
        const options = {
            amount: Math.round(amount * 100),
            currency: resolvedCurrency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        console.log(`Order initiated by: ${req.user.email}`);
        res.json(order);
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500).json({ message: "Razorpay Order Error", error });
    }
});

// --- STEP 2: Verify Payment & Save to Supabase ---
router.post('/verify-payment', protect, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        console.log("✅ Payment Verified.");

        const mongoose = require('mongoose');
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const Product = require('../models/Product');
            const googleSheetsService = require('../services/googleSheetsService');

            // 1. Validate and Decrement Stock (Still MongoDB for Products)
            const orderProducts = [];
            for (const item of orderDetails.cart) {
                // Find stock and check limits
                const product = await Product.findById(item.id || item.productId).session(session);
                if (!product) throw new Error(`Product ${item.id} not found.`);
                if (product.stock_quantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }

                product.stock_quantity -= item.quantity;
                await product.save({ session });

                orderProducts.push({
                    product_id: product._id.toString(),
                    name: product.name,
                    quantity: item.quantity,
                    price: item.price,
                    size: item.size || 'M',
                    image: item.image || (product.images && product.images[0]) || ''
                });
            }

            // 2. Create the Order in Supabase
            const newOrderData = {
                user_email: req.user.email,
                total_amount: orderDetails.amount,
                climate_contribution: orderDetails.climateContribution || 0,
                transaction_id: razorpay_payment_id,
                status: 'Pending',
                shipping_info: orderDetails.shippingData || {}
            };

            const savedOrder = await createOrder(newOrderData, orderProducts);

            // Record Coupon Usage if coupon was applied
            if (orderDetails.couponId) {
                try {
                    await recordCouponUsage(orderDetails.couponId, req.user.email, savedOrder.id);
                } catch(cErr) {
                    console.error("Failed to record coupon usage:", cErr);
                }
            }

            // Record Climate Donation if applicable
            if (orderDetails.climateContribution > 0) {
                try {
                    await recordClimateDonation({
                        orderId: savedOrder.id,
                        razorpayOrderId: razorpay_order_id,
                        razorpayPaymentId: razorpay_payment_id,
                        customerEmail: req.user.email,
                        customerName: (orderDetails.shippingData?.firstName || '') + ' ' + (orderDetails.shippingData?.lastName || ''),
                        donationAmount: orderDetails.climateContribution,
                        cause: 'Certified Mangrove Restoration Projects' // Can be made dynamic from store config
                    });
                } catch(dErr) {
                    console.error("Failed to record climate donation:", dErr);
                }
            }

            // 3. Commit the MongoDB transaction
            await session.commitTransaction();
            session.endSession();

            // 4. Trigger External Services
            const appOrderData = {
                _id: savedOrder.id,
                userEmail: savedOrder.user_email,
                totalAmount: savedOrder.total_amount,
                status: savedOrder.status,
                transactionId: savedOrder.transaction_id,
                orderDate: savedOrder.order_date,
                userName: (orderDetails.shippingData?.firstName || '') + ' ' + (orderDetails.shippingData?.lastName || ''),
                items: orderDetails.cart
            };

            try {
                googleSheetsService.appendOrder(appOrderData);
            } catch(e) {
                console.error("Sheets sync failed:", e);
            }

            try {
                await triggerOrderAutomation(appOrderData);
            } catch(e) {
                console.error("Automation sync failed:", e);
            }


            res.json({
                status: "success",
                order: {
                    id: razorpay_order_id,
                    amount: orderDetails.amount, 
                    items: orderDetails.cart 
                }
            });

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Transaction Error:", error);
            res.status(400).json({ status: "failure", message: error.message || "Payment verification logic failed." });
        }

    } else {
        res.status(400).json({ status: "failure", message: "Invalid signature" });
    }
});

module.exports = router;