const User = require('../models/User');
const { upsertCustomerProfile } = require('../services/supabaseService');

// @desc    Get or Initialize user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        let user = await User.findOne({ firebaseUID: req.user.uid });

        if (!user) {
            // Initialize new profile from Firebase data
            user = await User.create({
                firebaseUID: req.user.uid,
                email: req.user.email,
                displayName: req.user.name || 'Value Member'
            });
        }

        res.json(user);
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: "Server error fetching profile" });
    }
};

// @desc    Update user profile & address
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const updates = req.body;
        
        // Block sensitive fields from being updated here
        delete updates.firebaseUID;
        delete updates.email;
        delete updates.membershipTier;

        const user = await User.findOneAndUpdate(
            { firebaseUID: req.user.uid },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Server error updating profile" });
    }
};

// @desc    Add product to recently viewed
// @route   POST /api/users/recently-viewed
// @access  Private
exports.addToRecentlyViewed = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) return res.status(400).json({ message: "Product ID required" });

        const user = await User.findOne({ firebaseUID: req.user.uid });
        if (!user) return res.status(404).json({ message: "User not found" });

        // deduplicate and keep only the last 12
        let history = user.recentlyViewed || [];
        
        // Remove the ID if it already exists (to move it to the front)
        history = history.filter(id => id.toString() !== productId);
        
        // Add to front
        history.unshift(productId);
        
        // Slice to 12
        user.recentlyViewed = history.slice(0, 12);
        
        await user.save();
        res.json({ success: true, history: user.recentlyViewed });
    } catch (error) {
        console.error("Recently Viewed Error:", error);
        res.status(500).json({ message: "Server error updating history" });
    }
};

// @desc    Get recently viewed products (populated)
// @route   GET /api/users/recently-viewed
// @access  Private
exports.getRecentlyViewed = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.user.uid })
            .populate('recentlyViewed', 'name price images category stock_quantity');

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user.recentlyViewed || []);
    } catch (error) {
        console.error("Get History Error:", error);
        res.status(500).json({ message: "Server error fetching history" });
    }
};
// @desc    Sync guest history to server on login
// @route   POST /api/users/recently-viewed/sync
// @access  Private
exports.syncRecentlyViewed = async (req, res) => {
    try {
        const { productIds } = req.body;
        if (!Array.isArray(productIds)) return res.status(400).json({ message: "Array of product IDs required" });

        const user = await User.findOne({ firebaseUID: req.user.uid });
        if (!user) return res.status(404).json({ message: "User not found" });

        // deduplicate and keep only the last 12
        let currentHistory = user.recentlyViewed || [];
        
        // Merge guest items to the front
        let merged = [...productIds, ...currentHistory];
        
        // Unique IDs (cast to string for Comparison)
        const uniqueIds = [];
        const seen = new Set();
        
        for (const id of merged) {
            const idStr = id.toString();
            if (!seen.has(idStr)) {
                seen.add(idStr);
                uniqueIds.push(id);
            }
        }
        
        user.recentlyViewed = uniqueIds.slice(0, 12);
        
        await user.save();
        
        // Populate and return
        const updatedUser = await User.findById(user._id).populate('recentlyViewed', 'name price images category stock_quantity');
        res.json(updatedUser.recentlyViewed || []);
    } catch (error) {
        console.error("Recently Viewed Sync Error:", error);
        res.status(500).json({ message: "Server error syncing history" });
    }
};

// @desc    Sync extra customer profile data to Supabase
// @route   POST /api/users/profile/sync
// @access  Private
exports.syncCustomerProfile = async (req, res) => {
    try {
        const { firstName, lastName, mobile, birthdate, gender } = req.body;
        
        // Use the email from the verified Firebase token
        const profileData = {
            email: req.user.email,
            firstName,
            lastName,
            mobile,
            birthdate,
            gender
        };

        await upsertCustomerProfile(profileData);
        res.status(200).json({ success: true, message: "Profile synced to Supabase" });
    } catch (error) {
        console.error("Profile Sync Error:", error);
        res.status(500).json({ message: "Server error syncing profile" });
    }
};
