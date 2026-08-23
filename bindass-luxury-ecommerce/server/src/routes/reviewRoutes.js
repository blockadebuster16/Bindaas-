const express = require('express');
const router = express.Router();
const { getReviewsByProduct, addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { reviewSchema } = require('../validators/schemas');

router.get('/:productId', getReviewsByProduct);
router.post('/:productId', protect, validate(reviewSchema), addReview);

module.exports = router;
