const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/wishlist
// @desc    Get user's persistent wishlist
router.get('/', protect, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ userId: req.user.uid }).populate('products');
        
        if (!wishlist) {
            wishlist = await Wishlist.create({ userId: req.user.uid, products: [] });
        }
        
        res.json(wishlist.products);
    } catch (error) {
        console.error("Fetch Wishlist Error:", error);
        res.status(500).json({ message: "Server error fetching wishlist" });
    }
});

// @route   POST /api/wishlist/sync
// @desc    Merge guest wishlist with DB wishlist
router.post('/sync', protect, async (req, res) => {
    try {
        const { productIds } = req.body; // Array of IDs from LocalStorage
        let wishlist = await Wishlist.findOne({ userId: req.user.uid });

        if (!wishlist) {
            wishlist = await Wishlist.create({ userId: req.user.uid, products: productIds });
        } else {
            // Merge logic: Add new IDs while avoiding duplicates
            const currentIds = wishlist.products.map(id => id.toString());
            const newIds = productIds.filter(id => !currentIds.includes(id.toString()));
            
            wishlist.products = [...wishlist.products, ...newIds];
            await wishlist.save();
        }

        // Return populated list for the UI
        const populated = await Wishlist.findById(wishlist._id).populate('products');
        res.json(populated.products);
    } catch (error) {
        console.error("Sync Wishlist Error:", error);
        res.status(500).json({ message: "Server error syncing wishlist" });
    }
});

module.exports = router;
