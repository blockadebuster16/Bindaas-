import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_TITLE = 'BiNDAAS! | Luxury Athletic Energy';
const DEFAULT_DESCRIPTION = 'Experience the intersection of high-fashion luxury and athletic energy. Shop the latest collections from BiNDAAS! — Made in India, Made for the World.';
const DEFAULT_IMAGE = 'https://bindaas.in/og-image.jpg'; // Update with your actual OG image URL
const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://bindaas.in';

/**
 * SEO component — manages <title>, meta description, Open Graph, Twitter Cards,
 * canonical URL, and JSON-LD structured data.
 *
 * @param {string} title      - Page-specific title (combined with brand suffix)
 * @param {string} description - Meta description for this page
 * @param {string} image       - OG image URL (falls back to DEFAULT_IMAGE)
 * @param {string} type        - OG type: 'website' | 'product' (default: 'website')
 * @param {object} jsonLd      - Custom JSON-LD object (overrides default)
 */
const SEO = ({ title, description, image, type = 'website', jsonLd }) => {
    const location = useLocation();

    useEffect(() => {
        const fullTitle = title ? `${title} | BiNDAAS!` : DEFAULT_TITLE;
        const metaDesc = description || DEFAULT_DESCRIPTION;
        const metaImage = image || DEFAULT_IMAGE;
        const canonicalUrl = `${SITE_URL}${location.pathname}`;

        // ── Title ──────────────────────────────────────────────────
        document.title = fullTitle;

        // ── Helper to upsert a <meta> tag ──────────────────────────
        const setMeta = (selector, value) => {
            let el = document.querySelector(selector);
            if (!el) {
                el = document.createElement('meta');
                const [attr, val] = selector.replace('meta[', '').replace(']', '').split('="');
                el.setAttribute(attr, val.replace('"', ''));
                document.head.appendChild(el);
            }
            el.setAttribute('content', value);
        };

        // ── Helper to upsert a <link> tag ──────────────────────────
        const setLink = (rel, href) => {
            let el = document.querySelector(`link[rel="${rel}"]`);
            if (!el) {
                el = document.createElement('link');
                el.setAttribute('rel', rel);
                document.head.appendChild(el);
            }
            el.setAttribute('href', href);
        };

        // ── Standard Meta ──────────────────────────────────────────
        setMeta('meta[name="description"]', metaDesc);
        setMeta('meta[name="robots"]', 'index, follow');

        // ── Canonical URL ──────────────────────────────────────────
        setLink('canonical', canonicalUrl);

        // ── Open Graph ─────────────────────────────────────────────
        setMeta('meta[property="og:title"]', fullTitle);
        setMeta('meta[property="og:description"]', metaDesc);
        setMeta('meta[property="og:image"]', metaImage);
        setMeta('meta[property="og:url"]', canonicalUrl);
        setMeta('meta[property="og:type"]', type);
        setMeta('meta[property="og:site_name"]', 'BiNDAAS!');
        setMeta('meta[property="og:locale"]', 'en_IN');

        // ── Twitter / X Cards ──────────────────────────────────────
        setMeta('meta[name="twitter:card"]', 'summary_large_image');
        setMeta('meta[name="twitter:title"]', fullTitle);
        setMeta('meta[name="twitter:description"]', metaDesc);
        setMeta('meta[name="twitter:image"]', metaImage);
        setMeta('meta[name="twitter:site"]', '@bindaas');

        // ── JSON-LD Structured Data ────────────────────────────────
        const schemaData = jsonLd || {
            '@context': 'https://schema.org',
            '@type': type === 'product' ? 'WebPage' : 'WebPage',
            name: fullTitle,
            description: metaDesc,
            url: canonicalUrl,
            publisher: {
                '@type': 'Organization',
                name: 'BiNDAAS!',
                url: SITE_URL,
                logo: {
                    '@type': 'ImageObject',
                    url: `${SITE_URL}/logo192.png`
                }
            }
        };

        let ldScript = document.getElementById('bindaas-jsonld');
        if (!ldScript) {
            ldScript = document.createElement('script');
            ldScript.type = 'application/ld+json';
            ldScript.id = 'bindaas-jsonld';
            document.head.appendChild(ldScript);
        }
        ldScript.textContent = JSON.stringify(schemaData);

    }, [title, description, image, type, jsonLd, location.pathname]);

    return null;
};

export default SEO;
