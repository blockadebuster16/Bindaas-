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

// Update/Sync Cart (Merge Logic)
router.post('/sync', protect, async (req, res) => {
    try {
        const { items: guestItems, overwrite } = req.body; // Items from LocalStorage
        let cart = await Cart.findOne({ userId: req.user.uid });

        if (!cart) {
            cart = await Cart.create({ userId: req.user.uid, items: guestItems });
        } else if (overwrite) {
            // DIRECT OVERWRITE from frontend (Single Source of Truth)
            cart.items = guestItems;
            await cart.save();
        } else {
            // Legacy merge logic
            const existingItems = cart.items;

            guestItems.forEach(gItem => {
                // Safety check: Skip malformed guest items
                if (!gItem || !gItem.productId) return;

                const existingIndex = existingItems.findIndex(eItem => 
                    eItem && eItem.productId &&
                    eItem.productId.toString() === gItem.productId.toString() && 
                    eItem.size === gItem.size
                );

                if (existingIndex > -1) {
                    // Update quantity
                    existingItems[existingIndex].quantity += (gItem.quantity || 1);
                } else {
                    // Add new item
                    existingItems.push(gItem);
                }
            });

            cart.items = existingItems;
            await cart.save();
        }

        res.json(cart.items);
    } catch (err) { 
        console.error("Cart Sync Error:", err);
        res.status(500).send(err); 
    }
});

module.exports = router;