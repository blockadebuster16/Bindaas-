const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_CONTEXT = `You are Bindass AI, the exclusive personal shopping assistant for BINDASS!! — a premium Indian luxury fashion brand. 

You are warm, knowledgeable, stylish, and helpful. You assist customers with:
- Product discovery and recommendations based on their style preferences
- Information about the latest Men's, Women's, and Sports collections
- Size guides, fit details, and material information
- Order tracking and shipping inquiries
- Membership and Club BINDASS!! benefits
- General styling advice and outfit composition

Keep responses concise, friendly, and premium in tone. Never break character. 
If you don't know something specific about an order or product, direct the customer to contact support or browse the relevant collection page.
Always end with a helpful follow-up or offer further assistance.`;

router.post('/chat', protect, async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Build conversation history for Gemini
        const contents = [];

        // Include previous turns if provided
        if (history && Array.isArray(history)) {
            history.forEach(turn => {
                contents.push({
                    role: turn.role,
                    parts: [{ text: turn.text }]
                });
            });
        }

        // Add new user message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const response = await axios.post(GEMINI_URL, {
            system_instruction: {
                parts: [{ text: SYSTEM_CONTEXT }]
            },
            contents
        });

        const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response. Please try again.";
        res.json({ reply });

    } catch (error) {
        if (error.response) {
            console.error('Gemini API Error details:', JSON.stringify(error.response.data, null, 2));
            return res.status(error.response.status).json({ 
                error: 'AI service error', 
                message: error.response.data?.error?.message || 'Gemini API rejected the request'
            });
        }
        console.error('AI chat error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
