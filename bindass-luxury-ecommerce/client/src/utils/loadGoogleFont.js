/**
 * loadGoogleFont — dynamically injects a Google Font <link> tag into <head>
 * with deduplication (won't insert the same font twice).
 *
 * Extracted from Navbar.jsx and AdStrip.jsx where it was duplicated.
 *
 * @param {string} family - Font family name e.g. "Playfair Display"
 */
const loadGoogleFont = (family) => {
    if (!family || document.querySelector(`link[data-gfont="${family}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
    link.setAttribute('data-gfont', family);
    document.head.appendChild(link);
};

export default loadGoogleFont;
