const express = require('express');
const router = express.Router();
const { logEvent, getAnalytics } = require('../controllers/analyticsController');
const { protect, protectAdmin } = require('../middleware/authMiddleware');

// Optional auth: we want to log guest events too, so we won't strictly enforce a valid token,
// just try to decode it if present
const optionalAuth = (req, res, next) => {
    protect(req, res, (err) => {
        // Ignore the error if no token, just proceed
        next();
    });
};

router.post('/event', optionalAuth, logEvent);
router.get('/', protectAdmin, getAnalytics);

module.exports = router;
