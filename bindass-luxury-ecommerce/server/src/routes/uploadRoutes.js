const express = require('express');
const router = express.Router();
const { upload, adUpload } = require('../config/cloudinary');
const { adminProtect } = require('../middleware/adminAuth');

// @route   POST /api/upload
// @desc    Upload multiple images to Cloudinary (for products)
// @access  Admin
router.post('/', adminProtect, upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No images uploaded' });
        }

        const imageUrls = req.files.map(file => file.path);
        
        res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            urls: imageUrls
        });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ success: false, message: 'Server error during upload' });
    }
});

// @route   POST /api/upload/ad
// @desc    Upload single image or video for advertisement
// @access  Admin
router.post('/ad', adminProtect, adUpload.single('media'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No media uploaded' });
        }

        res.status(200).json({
            success: true,
            message: 'Media uploaded successfully',
            url: req.file.path,
            mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image'
        });
    } catch (error) {
        console.error('Error uploading ad media:', error);
        res.status(500).json({ success: false, message: 'Server error during upload' });
    }
});

module.exports = router;
