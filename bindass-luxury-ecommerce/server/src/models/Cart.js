const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Google OAuth sub or MongoDB User _id
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        image: String,
        size: String,
        quantity: { type: Number, default: 1, min: 1, max: 100 } // DB-003 + VULN-008: min/max guards
    }]
}, { timestamps: true });

// DB-003 FIX: Explicit index for O(1) lookup (userId already has unique:true which creates an index)
cartSchema.index({ userId: 1 });

module.exports = mongoose.model('Cart', cartSchema);
