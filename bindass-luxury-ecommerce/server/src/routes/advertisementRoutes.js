const express = require('express');
const router = express.Router();
const { getAds, getAllAds, createAd, updateAd, toggleAd, deleteAd } = require('../controllers/advertisementController');
const { protectAdmin } = require('../middleware/authMiddleware');
const { cacheControl } = require('../middleware/cache');

// Public routes
router.get('/', cacheControl, getAds);

// Admin routes
router.get('/admin', protectAdmin, getAllAds);
router.post('/', protectAdmin, createAd);
router.put('/:id', protectAdmin, updateAd);
router.patch('/:id/toggle', protectAdmin, toggleAd);
router.delete('/:id', protectAdmin, deleteAd);

module.exports = router;
