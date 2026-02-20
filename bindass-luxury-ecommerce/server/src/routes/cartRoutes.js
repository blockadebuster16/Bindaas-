const router = require('express').Router();
const Cart = require('../models/Cart');
const { protect } = require('../middleware/authMiddleware');

// Get User Cart
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.uid });
        if (!cart) cart = await Cart.create({ userId: req.user.uid, items: [] });
        res.json(cart.items);
    } catch (err) { res.status(500).send(err); }
});

// Update/Sync Cart
router.post('/sync', protect, async (req, res) => {
    try {
        const { items } = req.body;
        const cart = await Cart.findOneAndUpdate(
            { userId: req.user.uid },
            { items },
            { upsert: true, new: true }
        );
        res.json(cart.items);
    } catch (err) { res.status(500).send(err); }
});

module.exports = router;