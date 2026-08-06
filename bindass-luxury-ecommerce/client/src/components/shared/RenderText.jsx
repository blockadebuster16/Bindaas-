import React from 'react';

/**
 * RenderText — shared typography component used by ad banners and the Navbar.
 * Handles text with optional SVG image, bold/italic, stroke effects,
 * custom font size, and dynamic Google Font families.
 *
 * Extracted from Navbar.jsx and AdStrip.jsx where it was identically duplicated.
 *
 * @param {string}  value       - Text content to display
 * @param {string}  svgUrl      - If set, renders an <img> instead of text
 * @param {boolean} bold        - Apply font-weight: 900
 * @param {boolean} italic      - Apply font-style: italic
 * @param {boolean} stroke      - Apply -webkit-text-stroke
 * @param {string}  strokeColor - Stroke color (default: #000000)
 * @param {string}  strokeWidth - Stroke width in px (default: '2')
 * @param {number}  fontSize    - Font size in px
 * @param {string}  fontFamily  - Custom Google Font family name
 * @param {string}  className   - Additional Tailwind / CSS classes
 * @param {object}  style       - Inline style overrides (e.g., color)
 * @param {string}  tag         - HTML element to render ('span', 'h1', 'p', etc.)
 */
const RenderText = ({
    value,
    svgUrl,
    bold,
    italic,
    stroke,
    strokeColor,
    strokeWidth,
    fontSize,
    fontFamily,
    className = '',
    style = {},
    tag: Tag = 'span',
}) => {
    if (svgUrl) {
        return (
            <img
                src={svgUrl}
                alt={value}
                className={`inline-block object-contain max-h-[1.4em] ${className}`}
                style={style}
            />
        );
    }

    const computedStyle = {
        ...style,
        fontWeight: bold ? '900' : undefined,
        fontStyle: italic ? 'italic' : undefined,
        WebkitTextStroke: stroke ? `${strokeWidth || '2'}px ${strokeColor || '#000000'}` : undefined,
        paintOrder: stroke ? 'stroke fill' : undefined,
        fontSize: fontSize ? `${fontSize}px` : undefined,
        fontFamily: fontFamily ? `'${fontFamily}', sans-serif` : undefined,
    };

    return (
        <Tag className={className} style={computedStyle}>
            {value}
        </Tag>
    );
};

export default RenderText;
