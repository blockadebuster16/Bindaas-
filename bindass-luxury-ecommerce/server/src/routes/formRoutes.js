const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const ContactMessage = require('../models/ContactMessage');
const { protectAdmin } = require('../middleware/authMiddleware');

// @route   POST /api/forms/subscribe
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const existing = await Subscriber.findOne({ email });
        if (existing) return res.status(400).json({ message: "Already subscribed" });

        await Subscriber.create({ email });
        res.status(201).json({ message: "Subscribed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Subscription failed", error: error.message });
    }
});

// @route   POST /api/forms/contact
router.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        await ContactMessage.create({ name, email, subject, message });
        res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to send message", error: error.message });
    }
});

// @route   GET /api/forms/subscribe (Admin only)
router.get('/subscribe', protectAdmin, async (req, res) => {
    try {
        const subs = await Subscriber.find().sort('-subscribedAt');
        res.json(subs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch subscribers" });
    }
});

// @route   GET /api/forms/contact (Admin only)
router.get('/contact', protectAdmin, async (req, res) => {
    try {
        const msgs = await ContactMessage.find().sort('-createdAt');
        res.json(msgs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch messages" });
    }
});

module.exports = router;
