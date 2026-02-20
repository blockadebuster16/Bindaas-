const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: String, required: true }, // Firebase UID
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: { type: Number, default: 1 }
        }
    ],
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, default: "Pending" }, // Pending, Paid, Failed
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
