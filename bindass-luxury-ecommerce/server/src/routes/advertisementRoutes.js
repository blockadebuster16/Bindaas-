const express = require('express');
const router = express.Router();
const { getAds, getAllAds, createAd, updateAd, toggleAd, deleteAd } = require('../controllers/advertisementController');
const { adminProtect } = require('../middleware/adminAuth');

// Public routes
router.get('/', getAds);

// Admin routes
router.get('/admin', adminProtect, getAllAds);
router.post('/', adminProtect, createAd);
router.put('/:id', adminProtect, updateAd);
router.patch('/:id/toggle', adminProtect, toggleAd);
router.delete('/:id', adminProtect, deleteAd);

module.exports = router;
