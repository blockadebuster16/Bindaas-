/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // ── Bindaas Brand Palette (from palette.scss & theme/index.ts) ──
                "bindas-amber":     "#FFD017", // Bright Amber — primary CTA
                "bindas-gold":      "#D4AF37", // Metallic Gold — secondary accent
                "bindas-cream":     "#FAE7A8", // Vanilla Custard — card bg
                "bindas-parchment": "#F5F2EB", // Warm White — page bg
                "bindas-graphite":  "#2A2A2A", // Charcoal — secondary text
                "bindas-onyx":      "#111111", // Near-black — navbars / primary text
                // Legacy aliases kept for backward compatibility
                "primary":          "#FFD017",
                "background-light": "#F5F2EB",
                "background-dark":  "#111111",
            },
            fontFamily: {
                display: ["'Playfair Display'", "Georgia", "serif"],
                sans:    ["'Outfit'", "'Manrope'", "sans-serif"],
                mono:    ["'Inter'", "ui-monospace", "monospace"],
                serif:   ["'Playfair Display'", "Georgia", "serif"],
            },
        },
    },
    plugins: [],
}