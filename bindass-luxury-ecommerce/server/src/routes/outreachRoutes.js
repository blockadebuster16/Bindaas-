const express = require('express');
const router = express.Router();
const { mailgunWebhook, getSegments, createSegment, getCampaigns, createCampaign, getAnalytics } = require('../controllers/outreachController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Webhook endpoint (Public for Mailgun)
router.post('/webhooks/mailgun', mailgunWebhook);

// Admin endpoints
router.get('/segments', protectAdmin, getSegments);
router.post('/segments', protectAdmin, createSegment);

router.get('/campaigns', protectAdmin, getCampaigns);
router.post('/campaigns', protectAdmin, createCampaign);

router.get('/analytics', protectAdmin, getAnalytics);

module.exports = router;
