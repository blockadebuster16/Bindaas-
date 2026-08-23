const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    toggleProductStatus,
    searchProducts
} = require('../controllers/productController');
const { protectAdmin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { productSchema } = require('../validators/schemas');

// @route   GET /api/products/search
router.get('/search', searchProducts);

// @route   GET /api/products
router.route('/')
    .get(getProducts)
    .post(protectAdmin, validate(productSchema), createProduct);

// @route   GET /api/products/:id
// @route   PUT /api/products/:id
// @route   DELETE /api/products/:id
router.route('/:id')
    .get(getProductById)
    .put(protectAdmin, validate(productSchema), updateProduct)
    .delete(protectAdmin, deleteProduct);

router.patch('/:id/toggle', protectAdmin, toggleProductStatus);

module.exports = router;