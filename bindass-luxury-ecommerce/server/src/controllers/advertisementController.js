const Advertisement = require('../models/Advertisement');

const STYLE_FIELD_DEFAULTS = {
    titleBold: false, titleItalic: false, titleStroke: false, titleStrokeColor: '#000000', titleStrokeWidth: '2', titleSvgUrl: '', titleFontSize: '', titleFontFamily: '',
    tagBold: false,   tagItalic: false,   tagStroke: false,   tagStrokeColor: '#000000',   tagStrokeWidth: '2',   tagSvgUrl: '',   tagFontSize: '',   tagFontFamily: '',
    taglineBold: false, taglineItalic: false, taglineStroke: false, taglineStrokeColor: '#000000', taglineStrokeWidth: '2', taglineSvgUrl: '', taglineFontSize: '', taglineFontFamily: '',
    subtitleBold: false, subtitleItalic: false, subtitleStroke: false, subtitleStrokeColor: '#000000', subtitleStrokeWidth: '2', subtitleSvgUrl: '', subtitleFontSize: '', subtitleFontFamily: '',
};

const applyDefaults = (doc) => {
    const obj = doc.toObject ? doc.toObject() : doc;
    return { ...STYLE_FIELD_DEFAULTS, ...obj };
};

// @desc  Get active ads filtered by bannerType and page (public)
// @route GET /api/advertisements?bannerType=hero&page=home
exports.getAds = async (req, res) => {
    try {
        const { bannerType, page } = req.query;
        const filter = { isActive: true };
        if (bannerType) filter.bannerType = bannerType;
        if (page) filter.pages = page;

        const ads = await Advertisement.find(filter).sort({ order: 1, createdAt: -1 });
        res.json(ads.map(applyDefaults));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch advertisements', error: error.message });
    }
};

// @desc  Get all ads (admin)
// @route GET /api/advertisements/admin
exports.getAllAds = async (req, res) => {
    try {
        const ads = await Advertisement.find().sort({ bannerType: 1, order: 1, createdAt: -1 });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch advertisements', error: error.message });
    }
};

// @desc  Create ad (admin)
// @route POST /api/advertisements
exports.createAd = async (req, res) => {
    try {
        const ad = new Advertisement(req.body);
        const saved = await ad.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create advertisement', error: error.message });
    }
};

// @desc  Update ad (admin)
// @route PUT /api/advertisements/:id
exports.updateAd = async (req, res) => {
    try {
        const ad = await Advertisement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!ad) return res.status(404).json({ message: 'Advertisement not found' });
        res.json(ad);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update advertisement', error: error.message });
    }
};

// @desc  Toggle active status (admin)
// @route PATCH /api/advertisements/:id/toggle
exports.toggleAd = async (req, res) => {
    try {
        const ad = await Advertisement.findById(req.params.id);
        if (!ad) return res.status(404).json({ message: 'Advertisement not found' });
        ad.isActive = !ad.isActive;
        await ad.save();
        res.json(ad);
    } catch (error) {
        res.status(500).json({ message: 'Failed to toggle advertisement', error: error.message });
    }
};

// @desc  Delete ad (admin)
// @route DELETE /api/advertisements/:id
exports.deleteAd = async (req, res) => {
    try {
        const ad = await Advertisement.findByIdAndDelete(req.params.id);
        if (!ad) return res.status(404).json({ message: 'Advertisement not found' });
        res.json({ message: 'Advertisement deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete advertisement', error: error.message });
    }
};
