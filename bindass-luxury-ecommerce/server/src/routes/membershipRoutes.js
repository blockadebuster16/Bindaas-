const express = require('express');
const router = express.Router();
const { getMyTier, getTiers } = require('../controllers/membershipController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my-tier', protect, getMyTier);
router.get('/tiers', getTiers);

module.exports = router;
