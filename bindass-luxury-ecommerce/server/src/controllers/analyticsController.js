const supabase = require('../config/supabase');

const logEvent = async (req, res) => {
    try {
        const { eventType, pagePath, zone, metadata } = req.body;
        
        // Don't crash if Supabase isn't configured
        if (!supabase) return res.status(200).send('OK');

        const userEmail = req.user?.email || null;
        
        await supabase.from('analytics_events').insert([{
            user_email: userEmail,
            event_type: eventType,
            page_path: pagePath,
            session_id: req.headers['x-session-id'] || null,
            zone: zone || 'UNKNOWN',
            metadata: metadata || {}
        }]);

        res.status(200).send('OK');
    } catch (err) {
        console.error('Analytics log event error:', err);
        res.status(500).send('Error');
    }
};

const getAnalytics = async (req, res) => {
    try {
        if (!supabase) return res.json({ message: "Supabase not configured." });

        // A simple query to get counts of events by type
        // For a full admin dashboard, you'd want more complex aggregations
        const { data, error } = await supabase.from('analytics_events').select('event_type');
        
        if (error) throw error;

        // Simple aggregation
        const counts = data.reduce((acc, curr) => {
            acc[curr.event_type] = (acc[curr.event_type] || 0) + 1;
            return acc;
        }, {});

        res.json(counts);
    } catch (err) {
        console.error('getAnalytics error:', err);
        res.status(500).json({ message: 'Failed to fetch analytics' });
    }
};

module.exports = { logEvent, getAnalytics };
