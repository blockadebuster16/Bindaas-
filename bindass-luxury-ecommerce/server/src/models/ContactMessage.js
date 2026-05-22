const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    subject: { type: String },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ['new', 'read', 'archived'],
        default: 'new'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
