const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Google OAuth sub or MongoDB User _id
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        image: String,
        size: String,
        quantity: { type: Number, default: 1 }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
