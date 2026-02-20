const express = require('express');
const router = express.Router();
const { getProducts, getProductById } = require('../controllers/productController');

// @route   GET /api/products
router.get('/', getProducts);

// @route   GET /api/products/:id
router.get('/:id', getProductById);

module.exports = router;