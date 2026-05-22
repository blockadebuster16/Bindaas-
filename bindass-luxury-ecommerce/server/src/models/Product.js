const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String },
    stock_quantity: { type: Number, default: 0 },
    low_stock_threshold: { type: Number, default: 5 },
    materials_care: { type: String },
    materials_integrity: { type: String },
    shipping_returns: { type: String },
    pages: [{ type: String }],   // e.g. ['new_arrivals', 'womens_collection']
    images: [{ type: String }],
    sizes: [{ type: String }],
    colors: [{ type: String }],
    fit: { type: String },
    productType: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

productSchema.index({ pages: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
