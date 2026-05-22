const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        required: true, 
        unique: true 
    }, // Firebase UID
    products: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
    }]
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
