const Product = require('../models/Product');

// @desc    Get all products (with optimized filtering/limiting)
// @route   GET /api/products
exports.getProducts = async (req, res) => {
    try {
        const { limit, page, category, pages, sort, select } = req.query;
        
        const filter = {};
        if (category) filter.category = category;
        if (pages) filter.pages = pages; // Matches if pages array contains the value

        // Build Query
        let query = Product.find(filter);

        // Selection (Optimization: only send required fields for grids)
        if (select) {
            query = query.select(select.split(',').join(' '));
        }

        // Sorting
        if (sort) {
            const sortBy = sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination/Limiting (Only apply if limit is provided)
        if (limit) {
            const limitNum = parseInt(limit);
            const pageNum = parseInt(page) || 1;
            const skip = (pageNum - 1) * limitNum;
            query = query.skip(skip).limit(limitNum);
        }

        const products = await query;
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch products", error: error.message });
    }
};

// Get a specific product by its ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Create a new product (Admin)
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock_quantity, low_stock_threshold, materials_care, materials_integrity, shipping_returns, pages, images, sizes, colors, fit, productType } = req.body;
        
        const product = new Product({
            name,
            description,
            price,
            category,
            stock_quantity: stock_quantity || 0,
            low_stock_threshold: low_stock_threshold || 5,
            materials_care: materials_care || '',
            materials_integrity: materials_integrity || '',
            shipping_returns: shipping_returns || '',
            pages: pages || [],
            images: images || [],
            sizes: sizes || [],
            colors: colors || [],
            fit: fit || '',
            productType: productType || ''
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: "Failed to create product", error: error.message });
    }
};

// Update an existing product (Admin)
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock_quantity, low_stock_threshold, materials_care, materials_integrity, shipping_returns, pages, images, sizes, colors, fit, productType } = req.body;
        
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.category = category || product.category;
            product.stock_quantity = stock_quantity !== undefined ? stock_quantity : product.stock_quantity;
            product.low_stock_threshold = low_stock_threshold !== undefined ? low_stock_threshold : product.low_stock_threshold;
            product.materials_care = materials_care !== undefined ? materials_care : product.materials_care;
            product.materials_integrity = materials_integrity !== undefined ? materials_integrity : product.materials_integrity;
            product.shipping_returns = shipping_returns !== undefined ? shipping_returns : product.shipping_returns;
            product.pages = pages !== undefined ? pages : product.pages;
            product.images = images !== undefined ? images : product.images;
            product.sizes = sizes !== undefined ? sizes : product.sizes;
            product.colors = colors !== undefined ? colors : product.colors;
            product.fit = fit !== undefined ? fit : product.fit;
            product.productType = productType !== undefined ? productType : product.productType;

            const updatedProduct = await product.save();
            res.status(200).json(updatedProduct);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to update product", error: error.message });
    }
};

// Delete a product (Admin)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.status(200).json({ message: "Product removed" });
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to delete product", error: error.message });
    }
};

// Search products
exports.searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(200).json([]);

        const products = await Product.find(
            { $text: { $search: q }, isActive: true },
            { score: { $meta: "textScore" } }
        )
        .sort({ score: { $meta: "textScore" } })
        .limit(10);

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Search failed", error: error.message });
    }
};

// Toggle product status (Admin)
exports.toggleProductStatus = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.isActive = !product.isActive;
            const updatedProduct = await product.save();
            res.status(200).json(updatedProduct);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to toggle status", error: error.message });
    }
};