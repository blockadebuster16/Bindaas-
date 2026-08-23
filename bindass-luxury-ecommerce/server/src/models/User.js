const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Google OAuth sub (unique Google user ID)
    googleUID: {
        type: String,
        unique: true,
        sparse: true, // sparse allows null for email-only users
    },
    // Authentication provider: "google" or "email"
    authProvider: {
        type: String,
        enum: ['google', 'email'],
        default: 'email',
    },
    // Hashed password (only for email/password auth — not selected by default)
    password: {
        type: String,
        select: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // DB-001 FIX: enforce case-insensitive uniqueness at DB level
        trim: true,
    },
    displayName: String,
    picture: String,    // Google profile picture URL
    phoneNumber: String,

    // Persistent Shipping Profile
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },

    membershipTier: {
        type: String,
        default: 'Value Member',
    },
    recentlyViewed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }]  // DB-002: size enforced at 20 in userController via $slice
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
