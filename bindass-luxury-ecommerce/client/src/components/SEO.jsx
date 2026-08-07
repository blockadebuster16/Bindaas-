import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const DEFAULT_TITLE = 'BiNDAAS! | Luxury Athletic Energy';
const DEFAULT_DESCRIPTION = 'Experience the intersection of high-fashion luxury and athletic energy. Shop the latest collections from BiNDAAS! — Made in India, Made for the World.';
const DEFAULT_IMAGE = 'https://bindaas.in/og-image.jpg'; // Update with your actual OG image URL
const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://bindaas.in';

const SEO = ({ title, description, image, type = 'website', jsonLd }) => {
    const location = useLocation();

    const fullTitle = title ? `${title} | BiNDAAS!` : DEFAULT_TITLE;
    const metaDesc = description || DEFAULT_DESCRIPTION;
    const metaImage = image || DEFAULT_IMAGE;
    const canonicalUrl = `${SITE_URL}${location.pathname}`;

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

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={metaDesc} />
            <meta name="robots" content="index, follow" />
            
            <link rel="canonical" href={canonicalUrl} />
            
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDesc} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content="BiNDAAS!" />
            <meta property="og:locale" content="en_IN" />
            
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDesc} />
            <meta name="twitter:image" content={metaImage} />
            <meta name="twitter:site" content="@bindaas" />
            
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>
        </Helmet>
    );
};

export default SEO;
