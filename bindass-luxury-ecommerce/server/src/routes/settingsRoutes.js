const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public: Checkout fetches settings for calculations
router.get('/', getSettings);

// Protected: Admin can update settings (requires admin JWT)
router.patch('/', protectAdmin, updateSettings);

module.exports = router;
