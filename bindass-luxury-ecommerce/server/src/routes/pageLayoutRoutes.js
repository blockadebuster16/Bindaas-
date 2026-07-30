const express = require('express');
const router = express.Router();
const { getPageLayout, getAllPageLayouts, updatePageLayout } = require('../controllers/pageLayoutController');

router.get('/', getAllPageLayouts);
router.get('/:page', getPageLayout);
router.put('/:page', updatePageLayout);

module.exports = router;
