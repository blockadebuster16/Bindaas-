const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    // Google OAuth sub (for Google users) OR MongoDB User _id (for email users)
    googleUID: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

// A user can only leave one review per product
reviewSchema.index({ product: 1, googleUID: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
