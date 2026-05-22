const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video', 'none'], required: function() { return this.bannerType !== 'promo'; } },
    mediaUrl: { type: String, required: function() { return this.bannerType !== 'promo'; } },
    mediaUrlTablet: { type: String, default: '' },
    mediaUrlMobile: { type: String, default: '' },
    mediaCropTablet: { type: Object, default: null }, // { x, y, width, height, zoom }
    mediaCropMobile: { type: Object, default: null },
    bannerType: { type: String, enum: ['hero', 'strip', 'middle', 'promo'], required: true },
    pages: [{ type: String }], // e.g. ['home', 'men', 'women']

    // Category/Middle Banner specific
    subtitle: { type: String },   // e.g. "STYLES FOR EVERY OCCASION!"

    // Strip-specific fields
    tag: { type: String },        // e.g. "#NewStylesEveryWeek"
    tagline: { type: String },    // e.g. "Grab yours before they're gone."
    deal: { type: String },       // e.g. "UPTO"
    discount: { type: String },   // e.g. "30%"
    dealSuffix: { type: String }, // e.g. "OFF"

    // Custom Colors
    titleColor:    { type: String, default: '#ffffff' },
    tagColor:      { type: String, default: '#ffffff' },
    taglineColor:  { type: String, default: '#ffffff' },
    subtitleColor: { type: String, default: '#ffffff' },
    ctaColor:      { type: String, default: '#ffffff' },

    // Typography — title
    titleBold:        { type: Boolean, default: false },
    titleItalic:      { type: Boolean, default: false },
    titleStroke:      { type: Boolean, default: false },
    titleStrokeColor: { type: String,  default: '#000000' },
    titleStrokeWidth: { type: String,  default: '2' },
    titleSvgUrl:      { type: String,  default: '' },
    titleFontSize:    { type: String,  default: '' },
    titleFontFamily:  { type: String,  default: '' },

    // Typography — tag
    tagBold:        { type: Boolean, default: false },
    tagItalic:      { type: Boolean, default: false },
    tagStroke:      { type: Boolean, default: false },
    tagStrokeColor: { type: String,  default: '#000000' },
    tagStrokeWidth: { type: String,  default: '2' },
    tagSvgUrl:      { type: String,  default: '' },
    tagFontSize:    { type: String,  default: '' },
    tagFontFamily:  { type: String,  default: '' },

    // Typography — tagline (strip)
    taglineBold:        { type: Boolean, default: false },
    taglineItalic:      { type: Boolean, default: false },
    taglineStroke:      { type: Boolean, default: false },
    taglineStrokeColor: { type: String,  default: '#000000' },
    taglineStrokeWidth: { type: String,  default: '2' },
    taglineSvgUrl:      { type: String,  default: '' },
    taglineFontSize:    { type: String,  default: '' },
    taglineFontFamily:  { type: String,  default: '' },

    // Typography — subtitle
    subtitleBold:        { type: Boolean, default: false },
    subtitleItalic:      { type: Boolean, default: false },
    subtitleStroke:      { type: Boolean, default: false },
    subtitleStrokeColor: { type: String,  default: '#000000' },
    subtitleStrokeWidth: { type: String,  default: '2' },
    subtitleSvgUrl:      { type: String,  default: '' },
    subtitleFontSize:    { type: String,  default: '' },
    subtitleFontFamily:  { type: String,  default: '' },

    // CTA
    ctaText: { type: String },
    ctaLink: { type: String },

    // Control
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

advertisementSchema.index({ bannerType: 1 });
advertisementSchema.index({ pages: 1 });
advertisementSchema.index({ isActive: 1 });

module.exports = mongoose.model('Advertisement', advertisementSchema);
