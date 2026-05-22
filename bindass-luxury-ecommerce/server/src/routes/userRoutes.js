const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, addToRecentlyViewed, getRecentlyViewed, syncRecentlyViewed, syncCustomerProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/recently-viewed', protect, addToRecentlyViewed);
router.post('/recently-viewed/sync', protect, syncRecentlyViewed);
router.get('/recently-viewed', protect, getRecentlyViewed);
router.post('/profile/sync', protect, syncCustomerProfile);

module.exports = router;
