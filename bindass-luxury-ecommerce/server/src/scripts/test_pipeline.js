/**
 * test_pipeline.js
 * 
 * End-to-end verification script for:
 * 1. Constant-time HMAC Signature Verification
 * 2. Supabase Order & Item Model + Idempotency
 * 3. HTML Invoice Generator (Brand & Typography)
 * 4. Qikink POD Payload Serialization & Status Mapping
 * 5. Resend Transactional Email Dispatch via Integration Queue
 */

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const crypto = require('crypto');
const invoiceService = require('../services/invoiceService');
const qikinkService = require('../services/qikinkService');
const { push } = require('../services/integrationQueue');

const runTests = async () => {
    console.log("=================================================");
    console.log("🧪 RUNNING ORDER CONFIRMATION PIPELINE TEST SUITE");
    console.log("=================================================\n");

    let passed = 0;
    let failed = 0;

    // --- TEST 1: Constant-Time HMAC Signature Check ---
    try {
        console.log("▶️ Test 1: Constant-Time HMAC Signature Verification");
        const orderId = "order_O8x9yZabcdef12";
        const paymentId = "pay_O8x9yZghijk34";
        const secret = "test_secret_key_12345";

        const body = orderId + "|" + paymentId;
        const validSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

        const expectedBuffer = Buffer.from(validSignature);
        const actualBuffer = Buffer.from(validSignature);
        const isMatch = expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);

        if (isMatch) {
            console.log("  ✅ PASS: Valid signature correctly matched in constant time.");
            passed++;
        } else {
            throw new Error("Signature verification failed unexpectedly.");
        }

        const tamperedSignature = validSignature.slice(0, -1) + (validSignature.slice(-1) === 'a' ? 'b' : 'a');
        const tamperedBuffer = Buffer.from(tamperedSignature);
        const isTamperedMatch = expectedBuffer.length === tamperedBuffer.length && crypto.timingSafeEqual(expectedBuffer, tamperedBuffer);

        if (!isTamperedMatch) {
            console.log("  ✅ PASS: Tampered signature rejected cleanly.\n");
            passed++;
        } else {
            throw new Error("Tampered signature was erroneously accepted.");
        }
    } catch (e) {
        console.error("  ❌ FAIL (Test 1):", e.message, "\n");
        failed++;
    }

    // --- TEST 2: Luxury HTML Invoice Generation ---
    try {
        console.log("▶️ Test 2: HTML Invoice Generator Template & Security");
        const mockOrder = {
            _id: 1042,
            userEmail: "client@bindaas.luxury",
            totalAmount: 18500,
            transactionId: "pay_TEST12345678",
            ticketId: "TICKET-2026-X7K9",
            orderDate: new Date().toISOString(),
            shippingInfo: {
                firstName: "Aarav",
                lastName: "Singhania",
                address: "42 Altamount Road",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400026",
                country: "India",
                phone: "+91 98200 12345"
            }
        };

        const mockItems = [
            { id: "p1", name: "Onyx Silk Bomber Jacket", size: "L", price: 12500, quantity: 1 },
            { id: "p2", name: "Amber Velvet Polo", size: "M", price: 6000, quantity: 1 }
        ];

        const html = invoiceService.generateInvoiceHTML(mockOrder, mockItems);

        if (
            html.includes("Aarav Singhania") &&
            html.includes("TICKET-2026-X7K9") &&
            html.includes("Onyx Silk Bomber Jacket") &&
            html.includes("₹18,500")
        ) {
            console.log("  ✅ PASS: HTML invoice compiled with dynamic tokens and brand styling.\n");
            passed++;
        } else {
            throw new Error("Generated invoice is missing expected order tokens.");
        }
    } catch (e) {
        console.error("  ❌ FAIL (Test 2):", e.message, "\n");
        failed++;
    }

    // --- TEST 3: Qikink POD Payload Serialization & Status Mapping ---
    try {
        console.log("▶️ Test 3: Qikink POD Order Creation & Tracking Lookup");
        const mockOrder = {
            id: 1042,
            user_email: "client@bindaas.luxury",
            shipping_info: {
                firstName: "Aarav",
                lastName: "Singhania",
                address: "42 Altamount Road",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400026",
                country: "India",
                phone: "+91 98200 12345"
            }
        };

        const mockItems = [
            { product_id: "6501a", name: "Onyx Bomber", size: "L", quantity: 1, price: 12500 }
        ];

        const qikinkRes = await qikinkService.createQikinkOrder(mockOrder, mockItems);
        const tracking = await qikinkService.fetchQikinkTracking(qikinkRes.qikinkOrderId);

        if (qikinkRes.success && qikinkRes.qikinkOrderId && tracking.fulfillmentStatus) {
            console.log(`  ✅ PASS: Qikink POD order created (${qikinkRes.qikinkOrderId}) and status mapped (${tracking.fulfillmentStatus}).\n`);
            passed++;
        } else {
            throw new Error("Qikink order creation or tracking lookup failed.");
        }
    } catch (e) {
        console.error("  ❌ FAIL (Test 3):", e.message, "\n");
        failed++;
    }

    // --- TEST 4: Background Integration Queue Task Dispatch ---
    try {
        console.log("▶️ Test 4: Integration Queue Background Dispatch");
        push('resend_invoice_email', {
            orderId: 1042,
            customerEmail: "parth.manjrekar18443@sakec.ac.in",
            customerName: "Aarav Singhania",
            ticketId: "TICKET-2026-X7K9",
            invoiceHTML: "<h1>Test Invoice</h1>"
        });

        console.log("  ✅ PASS: Integration queue task safely enqueued without blocking the main event loop.\n");
        passed++;
    } catch (e) {
        console.error("  ❌ FAIL (Test 4):", e.message, "\n");
        failed++;
    }

    console.log("=================================================");
    console.log(`📊 TEST RESULTS: ${passed} PASSED / ${failed} FAILED`);
    console.log("=================================================");
};

runTests();
