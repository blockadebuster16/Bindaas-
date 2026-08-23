const express = require('express');
const router = express.Router();
const { getCoupons, createCoupon, toggleCoupon, deleteCoupon, validateCoupon } = require('../services/supabaseService');
const { protectAdmin, protect } = require('../middleware/authMiddleware');

// --- ADMIN ROUTES ---

// @route   GET /api/coupons
// @desc    Get all coupons (Admin)
router.get('/', protectAdmin, async (req, res) => {
  try {
    const coupons = await getCoupons();
    res.json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ message: "Error fetching coupons" });
  }
});

// @route   POST /api/coupons
// @desc    Create a new coupon (Admin)
router.post('/', protectAdmin, async (req, res) => {
  try {
    const coupon = await createCoupon(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    if (error.message === "Coupon code already exists") {
        return res.status(400).json({ message: "Coupon code already exists" });
    }
    console.error("Error creating coupon:", error);
    res.status(500).json({ message: "Error creating coupon" });
  }
});

// @route   PATCH /api/coupons/:id/toggle
// @desc    Toggle coupon status (Admin)
router.patch('/:id/toggle', protectAdmin, async (req, res) => {
  try {
    const coupon = await toggleCoupon(req.params.id);
    res.json(coupon);
  } catch (error) {
    if (error.message === "Coupon not found") return res.status(404).json({ message: error.message });
    console.error("Error toggling coupon:", error);
    res.status(500).json({ message: "Error toggling coupon" });
  }
});

// @route   DELETE /api/coupons/:id
// @desc    Delete a coupon (Admin)
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    await deleteCoupon(req.params.id);
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ message: "Error deleting coupon" });
  }
});


// --- PUBLIC ROUTES (USER) ---

// @route   POST /api/coupons/validate
// @desc    Validate a coupon code and return discount info
// API-003 FIX: Requires auth — prevents unauthenticated coupon enumeration
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const validated = await validateCoupon(code, subtotal);
    res.json(validated);
  } catch (error) {
    res.status(400).json({ message: error.message || "Error validating coupon" });
  }
});

module.exports = router;
