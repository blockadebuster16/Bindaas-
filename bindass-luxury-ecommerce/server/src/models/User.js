const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUID: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    displayName: String, // Luxury Moniker
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
        default: 'Value Member' 
    },
    recentlyViewed: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
