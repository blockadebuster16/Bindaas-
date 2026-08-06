const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        required: true, 
        unique: true 
    }, // Google OAuth sub or MongoDB User _id
    products: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
    }]
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);

