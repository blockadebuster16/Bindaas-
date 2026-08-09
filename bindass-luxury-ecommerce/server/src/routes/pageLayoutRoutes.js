const express = require('express');
const router = express.Router();
const { getPageLayout, getAllPageLayouts, updatePageLayout } = require('../controllers/pageLayoutController');
const { cacheControl } = require('../middleware/cache');

router.get('/', cacheControl, getAllPageLayouts);
router.get('/:page', cacheControl, getPageLayout);
router.put('/:page', updatePageLayout);

module.exports = router;
