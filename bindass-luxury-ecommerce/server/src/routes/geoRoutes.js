const express = require('express');
const router = express.Router();
const { getZoneByIP, getAllZones } = require('../controllers/geoController');

// Public: Called by frontend on page load
router.get('/zone', getZoneByIP);

// Public: Return all zones (for admin zone editor)
router.get('/zones', getAllZones);

module.exports = router;
