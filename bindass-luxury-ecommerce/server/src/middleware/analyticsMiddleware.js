const supabase = require('../config/supabase');

// Middleware to log API requests as analytics events if needed
// Or specifically tracking certain routes like /api/products (views)
const trackEvent = (eventType) => async (req, res, next) => {
    // Fire and forget
    if (supabase) {
        try {
            const userEmail = req.user?.email || null;
            supabase.from('analytics_events').insert([{
                user_email: userEmail,
                event_type: eventType,
                page_path: req.originalUrl,
                session_id: req.headers['x-session-id'] || null,
                zone: req.headers['x-user-zone'] || 'UNKNOWN',
                metadata: { method: req.method, query: req.query || {} }
            }]).then(() => {});
        } catch(e) {}
    }
    next();
};

module.exports = { trackEvent };
