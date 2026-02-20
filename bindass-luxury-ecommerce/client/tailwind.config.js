/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}", // This covers all subfolders in src
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#11d411",
                "background-light": "#ffffff", // Updated to white as per request
                "background-dark": "#ffffffff", // Updated from user HTML
            },
            fontFamily: {
                serif: ['Manrope', 'serif'],
                "display": ["Work Sans", "Manrope", "sans-serif"], // Added Work Sans
            },
        },
    },
    plugins: [],
}