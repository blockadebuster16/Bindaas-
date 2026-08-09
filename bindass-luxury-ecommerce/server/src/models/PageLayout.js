const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['hero_ad', 'split_ad', 'ad_strip', 'ad_break', 'ad_middle', 'product_grid', 'recently_viewed', 'heritage', 'feature_showcase'],
        required: true 
    },
    title: { type: String, default: '' },
    adId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement', default: null },
    categoryFilter: { type: String, default: '' }, // e.g. 'new_arrivals', 'womens_collection'
    redirectUrl: { type: String, default: '' }, // e.g. '/shop', '/women', '/men'
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true }
}, { _id: false });

const pageLayoutSchema = new mongoose.Schema({
    page: { type: String, required: true, unique: true }, // e.g. 'home', 'men', 'women', 'apparel', 'sports', 'classics'
    title: { type: String, default: '' },
    sections: [sectionSchema],
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PageLayout', pageLayoutSchema);
