const router = require('express').Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { cartSyncSchema } = require('../validators/schemas');

// Get User Cart
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.uid });
        if (!cart) cart = await Cart.create({ userId: req.user.uid, items: [] });
        res.json(cart.items);
    } catch (err) { res.status(500).send(err); }
});

// VULN-008 FIX: Validate all cart items against DB before saving
async function validateCartItems(items) {
    if (!Array.isArray(items)) return [];
    const validated = [];
    for (const item of items) {
        if (!item || !item.productId) continue;
        // Validate quantity bounds
        const qty = parseInt(item.quantity, 10);
        if (isNaN(qty) || qty < 1 || qty > 100) continue;
        // Validate product exists in DB
        try {
            const product = await Product.findById(item.productId).select('_id name price stock_quantity');
            if (!product) continue; // Silently drop invalid product IDs
            validated.push({
                productId: product._id,
                name: product.name,
                price: product.price,    // Always use server-side price
                image: item.image || '',
                size: item.size || 'M',
                quantity: qty
            });
        } catch (e) {
            // Skip malformed ObjectId
        }
    }
    return validated;
}

// Update/Sync Cart (Merge Logic)
router.post('/sync', protect, validate(cartSyncSchema), async (req, res) => {
    try {
        const { items: guestItems, overwrite } = req.body;
        let cart = await Cart.findOne({ userId: req.user.uid });

        if (!cart) {
            const validatedItems = await validateCartItems(guestItems);
            cart = await Cart.create({ userId: req.user.uid, items: validatedItems });
        } else if (overwrite) {
            // VULN-008 FIX: Validate items before overwriting
            cart.items = await validateCartItems(guestItems);
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
                    // Update quantity (capped at 100)
                    existingItems[existingIndex].quantity = Math.min(100, existingItems[existingIndex].quantity + (gItem.quantity || 1));
                } else {
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