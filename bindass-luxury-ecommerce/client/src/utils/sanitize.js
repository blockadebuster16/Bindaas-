/**
 * Input sanitization utilities.
 * Client-side guard against XSS and injection before sending to API.
 * Note: server-side validation/sanitization is still required as the
 * primary defense — this is defense-in-depth.
 */

/**
 * Sanitize a search query string:
 * - Trims whitespace
 * - Strips HTML tags
 * - Limits length to maxLength characters
 * - Removes characters commonly used in NoSQL injection
 */
export const sanitizeSearchQuery = (input, maxLength = 100) => {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .replace(/<[^>]*>/g, '')          // Strip HTML tags
        .replace(/[{}$]/g, '')             // Remove MongoDB operator chars
        .replace(/[^\w\s\-.,&'()]/g, '')   // Allow only safe characters
        .slice(0, maxLength);
};

/**
 * Sanitize a coupon code:
 * - Uppercase, alphanumeric + hyphens only
 * - Max 20 chars
 */
export const sanitizeCouponCode = (input) => {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9\-]/g, '')
        .slice(0, 20);
};

/**
 * Sanitize a free-text comment/review:
 * - Strips HTML tags
 * - Limits to maxLength
 */
export const sanitizeComment = (input, maxLength = 1000) => {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .replace(/<[^>]*>/g, '')
        .slice(0, maxLength);
};
