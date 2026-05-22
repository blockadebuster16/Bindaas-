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
const { adminProtect } = require('../middleware/adminAuth');

// @route   GET /api/products/search
router.get('/search', searchProducts);

// @route   GET /api/products
router.route('/')
    .get(getProducts)
    .post(adminProtect, createProduct);

// @route   GET /api/products/:id
// @route   PUT /api/products/:id
// @route   DELETE /api/products/:id
router.route('/:id')
    .get(getProductById)
    .put(adminProtect, updateProduct)
    .delete(adminProtect, deleteProduct);

router.patch('/:id/toggle', adminProtect, toggleProductStatus);

module.exports = router;