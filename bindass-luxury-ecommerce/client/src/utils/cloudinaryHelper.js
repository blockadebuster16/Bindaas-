/**
 * Generates a cropped Cloudinary URL based on provided crop data.
 * @param {string} url - The original Cloudinary URL.
 * @param {Object} crop - Crop data containing { x, y, width, height }.
 * @returns {string} - Transformed URL.
 */
export const getCroppedUrl = (url, crop) => {
    if (!url || !crop || typeof url !== 'string' || !url.includes('/upload/')) return url;

    // Cloudinary transformation string
    // c_crop: defines the cropping area
    // x, y, w, h are coordinates from react-easy-crop (typically pixels)
    const transform = `c_crop,w_${Math.round(crop.width)},h_${Math.round(crop.height)},x_${Math.round(crop.x)},y_${Math.round(crop.y)}`;
    
    // Inject transformation after /upload/
    return url.replace('/upload/', `/upload/${transform}/`);
};

/**
 * Automatically applies f_auto (format auto) and q_auto (quality auto) 
 * to a Cloudinary URL to serve next-gen formats like WebP/AVIF automatically.
 * @param {string} url - The original Cloudinary URL.
 * @returns {string} - Optimized URL.
 */
export const optimizeCloudinaryUrl = (url) => {
    if (!url || typeof url !== 'string' || !url.includes('/upload/')) return url;
    
    // If it already has f_auto or q_auto, skip to avoid duplicate transformations
    if (url.includes('f_auto') || url.includes('q_auto')) return url;

    return url.replace('/upload/', '/upload/f_auto,q_auto/');
};
