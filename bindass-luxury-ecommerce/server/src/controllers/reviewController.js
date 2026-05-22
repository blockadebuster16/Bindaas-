const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
exports.getReviewsByProduct = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
        
        // Calculate average rating
        let averageRating = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
            averageRating = (sum / reviews.length).toFixed(1);
        }

        res.json({
            count: reviews.length,
            averageRating: parseFloat(averageRating),
            reviews
        });
    } catch (error) {
        console.error("Get Reviews Error:", error);
        res.status(500).json({ message: "Server error fetching reviews" });
    }
};

// @desc    Add a review to a product
// @route   POST /api/reviews/:productId
// @access  Private
exports.addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.productId;
        
        if (!rating || !comment) {
            return res.status(400).json({ message: "Please provide a rating and a comment" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if user already reviewed this product
        const alreadyReviewed = await Review.findOne({
            product: productId,
            firebaseUID: req.user.uid
        });

        if (alreadyReviewed) {
            return res.status(400).json({ message: "You have already reviewed this product" });
        }

        const review = await Review.create({
            product: productId,
            firebaseUID: req.user.uid,
            userName: req.user.name || 'Anonymous Member',
            rating: Number(rating),
            comment
        });

        res.status(201).json(review);
    } catch (error) {
        console.error("Add Review Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "You have already reviewed this product" });
        }
        res.status(500).json({ message: "Server error adding review" });
    }
};
