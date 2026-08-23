const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'luxury-ecommerce-products',
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' },
      { fetch_format: 'auto', quality: 'auto' }
    ]
  }
});

const adStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'luxury-ecommerce-ads',
    resource_type: 'auto', // This allows both images and videos
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov', 'webm'],
    transformation: [
      { fetch_format: 'auto', quality: 'auto' }
    ]
  }
});

// API-004 FIX: 5MB limit for product images — prevents memory/bandwidth DoS
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });
// API-004 FIX: 50MB limit for ad media (videos need more room)
const adUpload = multer({ storage: adStorage, limits: { fileSize: 50 * 1024 * 1024 } });

module.exports = { cloudinary, upload, adUpload };
