const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/authMiddleware');
const integrationQueue = require('../services/integrationQueue');
const { createOrder, recordCouponUsage, recordClimateDonation, getSettings, validateCoupon } = require('../services/supabaseService');
const { calculateOrderTotals } = require('../utils/shippingCalculator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const inventoryService = require('../services/inventoryService');
const invoicePersistService = require('../services/invoicePersistService');
const invoiceService = require('../services/invoiceService');
const outboxWorker = require('../services/outboxWorker');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- STEP 1: Create an Order ---
router.post('/create-order', protect, async (req, res) => {
    const { amount, currency, couponCode, shippingMethod, isCOD, isClimateSelected } = req.body;
    const resolvedCurrency = currency || 'INR';

    try {
        // Fetch cart items for the user
        const cart = await Cart.findOne({ userId: req.user.uid });
        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // Map items and calculate subtotal
        let subtotal = 0;
        const items = [];
        for (const item of cart.items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.name}` });
            }
            subtotal += product.price * item.quantity;
            items.push({
                productId: product._id,
                quantity: item.quantity,
                price: product.price
            });
        }

        // Calculate discount
        let discount = 0;
        if (couponCode) {
            try {
                const coupon = await validateCoupon(couponCode, subtotal);
                if (coupon.discountType === 'percentage') {
                    discount = Math.round(subtotal * (coupon.discountValue / 100));
                } else {
                    discount = coupon.discountValue;
                }
            } catch (err) {
                return res.status(400).json({ message: err.message || "Invalid coupon code" });
            }
        }

        // Calculate base order totals
        const totals = await calculateOrderTotals(items, shippingMethod || 'Air', isCOD || false, discount);

        // Fetch climate fee from settings if selected
        const settings = await getSettings();
        const climateFee = (isClimateSelected && settings.climateFeeEnabled)
            ? Number(settings.climateFeeAmount ?? 25)
            : 0;

        const serverTotalAmount = totals.totalAmount + climateFee;

        // If client-side amount was sent, verify it with a minor tolerance for rounding
        if (amount) {
            const clientAmount = Number(amount);
            if (isNaN(clientAmount) || Math.abs(clientAmount - serverTotalAmount) > 1) {
                return res.status(400).json({ message: "Transaction amount mismatch. Please reload checkout." });
            }
        }

        const options = {
            amount: Math.round(serverTotalAmount * 100), // in paise
            currency: resolvedCurrency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        console.log(`Order initiated by: ${req.user.email} for ₹${serverTotalAmount}`);
        res.json(order);
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500).json({ message: "Razorpay Order Error", error: error.message || error });
    }
});

// --- STEP 2: Verify Payment & Save to Supabase ---
router.post('/verify-payment', protect, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderDetails || !orderDetails.cart) {
        return res.status(400).json({ status: "failure", message: "Missing required payment verification fields" });
    }

    // 1. PAY-001 FIX: Constant-time HMAC comparison (protect against timing attacks)
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const actualBuffer = Buffer.from(razorpay_signature);

    if (expectedBuffer.length !== actualBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
        console.warn("⚠️ Invalid Razorpay Signature received for order:", razorpay_order_id);
        return res.status(400).json({ status: "failure", message: "Invalid signature" });
    }

    console.log("✅ Payment Verified Cryptographically.");

    const Product = require('../models/Product');
    const invoiceService = require('../services/invoiceService');

    try {
        // 2. PAY-003 & PAY-004 FIX: Authoritative product pricing (Fetch only, NO decrement yet to fix ARCH-001)
        const orderProducts = [];
        for (const item of orderDetails.cart) {
            const productId = item.id || item.productId;
            
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error(`Product ${productId} not found.`);
            }
            if (product.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}`);
            }

            // PAY-004 FIX: Always use authoritative product.price from DB, NOT client item.price
            orderProducts.push({
                product_id: product._id.toString(),
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                size: item.size || 'M',
                image: item.image || (product.images && product.images[0]) || ''
            });
        }

        // 3. PAY-002 & PAY-007 FIX: Save Order to Supabase with Idempotency Key & State Machine
        // (Fixing ARCH-001 by doing this FIRST before mutating MongoDB state)
        const newOrderData = {
            user_email: req.user.email,
            total_amount: orderDetails.amount,
            climate_contribution: orderDetails.climateContribution || 0,
            transaction_id: razorpay_payment_id,
            status: 'Pending',
            payment_status: 'PAYMENT_VERIFIED',
            fulfillment_status: 'UNFULFILLED',
            shipping_info: orderDetails.shippingInfo || {},
            idempotency_key: razorpay_payment_id // Enforces DB deduplication
        };

        let savedOrder;
        try {
            savedOrder = await createOrder(newOrderData, orderProducts);
        } catch (dbErr) {
            // PAY-002: Idempotent handling for replayed webhooks / duplicate POSTs
            if (dbErr.code === '23505' || (dbErr.message && dbErr.message.includes('unique constraint'))) {
                console.log(`ℹ️ Replayed payment verification detected for transaction ${razorpay_payment_id} — returning existing status.`);
                return res.json({
                    status: "success",
                    message: "Payment already verified",
                    order: {
                        id: razorpay_order_id,
                        transaction_id: razorpay_payment_id,
                        amount: orderDetails.amount
                    }
                });
            }
            throw dbErr;
        }

        // 3.5. Atomic stock decrement + ledger logging via inventoryService
        try {
            await inventoryService.decrementStock(orderProducts, savedOrder.id, req.user.email);
        } catch (stockErr) {
            console.error(`⚠️ [paymentRoutes] Stock contention error for order ${savedOrder.id}:`, stockErr.message);
            // Stock failed but payment succeeded — order is flagged. We continue the flow
            // to issue the invoice, but admin needs to refund or backorder.
        }

        // 4. Optional Coupon & Climate Donation logging
        if (orderDetails.couponId) {
            recordCouponUsage(orderDetails.couponId, req.user.email, savedOrder.id).catch(cErr => {
                console.error("Failed to record coupon usage:", cErr);
            });
        }

        if (orderDetails.climateContribution > 0) {
            recordClimateDonation({
                orderId: savedOrder.id,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                customerEmail: req.user.email,
                customerName: (orderDetails.shippingInfo?.firstName || '') + ' ' + (orderDetails.shippingInfo?.lastName || ''),
                donationAmount: orderDetails.climateContribution,
                cause: 'Certified Mangrove Restoration Projects'
            }).catch(dErr => {
                console.error("Failed to record climate donation:", dErr);
            });
        }

        // 5. Generate Luxury HTML Invoice & Persist GST Record
        const invoiceHTML = invoiceService.generateInvoiceHTML({
            _id: savedOrder.id,
            userEmail: savedOrder.user_email,
            totalAmount: savedOrder.total_amount,
            transactionId: savedOrder.transaction_id,
            ticketId: savedOrder.ticket_id,
            shippingInfo: savedOrder.shipping_info,
            orderDate: savedOrder.order_date
        }, orderProducts);

        const savedInvoice = await invoicePersistService.persistInvoice({
            order: savedOrder,
            items: orderProducts,
            invoiceHTML,
            pricing: {
                subtotal: orderDetails.amount, // assuming simple subtotal = amount for now, can be enriched
                discount: 0,
                shipping: 0,
                climateFee: orderDetails.climateContribution || 0
            }
        }).catch(e => {
            console.error('[paymentRoutes] Invoice persist error:', e.message);
            return { id: null, invoice_number: 'PENDING' };
        });

        // 6. Enqueue Domain Event (Durable Outbox Queue)
        // This triggers Qikink submission & Resend email asynchronously via the polling worker
        outboxWorker.enqueue('OrderPaidEvent', savedOrder.id, {
            orderId:       savedOrder.id,
            ticketId:      savedOrder.ticket_id,
            userEmail:     savedOrder.user_email,
            customerName:  ((orderDetails.shippingInfo?.firstName || '') + ' ' + (orderDetails.shippingInfo?.lastName || '')).trim(),
            totalAmount:   savedOrder.total_amount,
            invoiceId:     savedInvoice.id,
            invoiceNumber: savedInvoice.invoice_number,
            invoiceHTML,
            items:         orderProducts,
            orderData:     savedOrder
        });

        // 7. PAY-009 FIX: Return ticket_id & order_id to client
        res.json({
            status: "success",
            order: {
                id: razorpay_order_id,
                order_id: savedOrder.id,
                ticket_id: savedOrder.ticket_id,
                amount: savedOrder.total_amount,
                items: orderProducts
            }
        });

    } catch (error) {
        console.error("❌ Payment Verification Error:", error);
        res.status(400).json({ status: "failure", message: error.message || "Payment verification logic failed." });
    }
});

// --- STEP 3: Razorpay Webhook Handler (Asynchronous Gateway Notifications) ---
// Handles the case where the client browser disconnects during payment.
// If verify-payment was already called, the idempotency_key prevents duplicate order creation.
router.post('/webhook', async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!signature || !webhookSecret) {
        return res.status(400).json({ status: 'failure', message: 'Missing signature or webhook secret' });
    }

    try {
        const payloadString = typeof req.body === 'string' || Buffer.isBuffer(req.body)
            ? req.body.toString()
            : JSON.stringify(req.body);

        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(payloadString)
            .digest('hex');

        const expectedBuffer = Buffer.from(expectedSignature);
        const actualBuffer   = Buffer.from(signature);

        if (expectedBuffer.length !== actualBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
            console.warn('⚠️ Invalid Razorpay Webhook Signature received');
            return res.status(400).json({ status: 'failure', message: 'Invalid webhook signature' });
        }

        const event = req.body;
        console.log(`🔔 Razorpay Webhook Verified — Event: ${event.event}`);

        // Respond to Razorpay immediately (< 5s SLA) — do all work asynchronously
        res.status(200).json({ status: 'ok' });

        // Process payment captured events asynchronously
        if (event.event === 'payment.captured' || event.event === 'order.paid') {
            setImmediate(async () => {
                try {
                    const paymentEntity  = event.payload?.payment?.entity;
                    const paymentId      = paymentEntity?.id;
                    const razorpayOrdId  = paymentEntity?.order_id;
                    const customerEmail  = paymentEntity?.email;
                    const amountPaise    = paymentEntity?.amount;

                    if (!paymentId) {
                        console.warn('⚠️ [Webhook] payment.captured with no payment ID — skipping');
                        return;
                    }

                    console.log(`🔔 [Webhook] Processing captured payment: ${paymentId} (Order: ${razorpayOrdId})`);

                    // Check if this payment was already processed by verify-payment
                    const { getOrdersWithItems } = require('../services/supabaseService');
                    const existingOrders = await getOrdersWithItems({ userEmail: customerEmail });
                    const alreadyProcessed = existingOrders.some(o => o.razorpayPaymentId === paymentId);

                    if (alreadyProcessed) {
                        console.log(`ℹ️ [Webhook] Order for ${paymentId} already exists — no action needed.`);
                        return;
                    }

                    // Payment exists in Razorpay but no order in our DB — this means
                    // verify-payment was never called (client disconnect scenario).
                    // Log for manual admin review — do NOT auto-create order here
                    // as we lack the cart/shipping info needed to build the order.
                    console.error(
                        `🚨 [Webhook] ORPHANED PAYMENT DETECTED:\n` +
                        `   Payment ID: ${paymentId}\n` +
                        `   Amount: ₹${(amountPaise / 100).toFixed(2)}\n` +
                        `   Customer: ${customerEmail}\n` +
                        `   ACTION REQUIRED: Check Razorpay dashboard and contact customer.`
                    );

                    // Emit to event_outbox for admin alerting (Phase 4 will process this)
                    const { supabase } = require('../config/supabase');
                    if (supabase) {
                        await supabase.from('event_outbox').insert([{
                            event_type: 'OrphanedPaymentDetected',
                            aggregate_id: paymentId,
                            payload: {
                                payment_id:       paymentId,
                                razorpay_order_id: razorpayOrdId,
                                customer_email:   customerEmail,
                                amount_paise:     amountPaise,
                                gateway_event:    event.event,
                                timestamp:        new Date().toISOString()
                            },
                            status: 'PENDING'
                        }]).catch(e => console.error('[Webhook] Failed to write orphaned payment to outbox:', e.message));
                    }

                } catch (asyncErr) {
                    console.error('❌ [Webhook] Async processing error:', asyncErr.message);
                }
            });
        }

    } catch (err) {
        console.error('❌ Razorpay Webhook Processing Error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

module.exports = router;
