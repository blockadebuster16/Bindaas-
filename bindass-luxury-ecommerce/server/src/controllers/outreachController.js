const supabase = require('../config/supabase');
const { enqueueDripSequence } = require('../services/outreachDispatcher');

// 1. Webhook Sink for Mailgun Events
const mailgunWebhook = async (req, res) => {
    try {
        const eventData = req.body['event-data'];
        if (!eventData) return res.status(400).send('Invalid payload');

        const eventType = eventData.event;
        const recipient = eventData.recipient;
        const messageId = eventData.message?.headers['message-id'];
        const userVariables = eventData['user-variables'] || {};
        
        const campaignId = userVariables.campaignId || null;
        const stepId = userVariables.stepId || null;

        await supabase.from('email_events').insert([{
            campaign_id: campaignId,
            step_id: stepId,
            recipient_email: recipient,
            event_type: eventType,
            message_id: messageId,
            metadata: eventData
        }]);

        res.status(200).send('OK');
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(500).send('Server Error');
    }
};

// 2. Admin: Get Segments
const getSegments = async (req, res) => {
    try {
        const { data, error } = await supabase.from('segments').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Admin: Create Segment
const createSegment = async (req, res) => {
    try {
        const { name, description, rules } = req.body;
        const { data, error } = await supabase.from('segments').insert([{ name, description, rules }]).select();
        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Admin: Get Campaigns
const getCampaigns = async (req, res) => {
    try {
        const { data, error } = await supabase.from('campaigns').select('*, segments(name), sender_profiles(from_email)');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. Admin: Create Campaign
const createCampaign = async (req, res) => {
    try {
        const { name, segment_id, sender_profile_id, steps } = req.body;
        
        // Insert Campaign
        const { data: campaign, error: cErr } = await supabase.from('campaigns').insert([{
            name, segment_id, sender_profile_id, status: 'active'
        }]).select().single();
        if (cErr) throw cErr;

        // Insert Steps
        const stepsData = steps.map((s, index) => ({
            campaign_id: campaign.id,
            step_order: index + 1,
            delay_hours: s.delay_hours || 0,
            subject: s.subject,
            body_html: s.body_html
        }));
        
        const { error: sErr } = await supabase.from('campaign_steps').insert(stepsData);
        if (sErr) throw sErr;

        // Enqueue Sequence for the targeted segment
        // First, fetch emails matching segment (simplistic approach: fetch all for now or resolve via custom SQL rules)
        // For demonstration, fetch everyone in 'Champions' if the segment says so.
        // A production version would parse `rules` JSON to form a query.
        
        const { data: segment } = await supabase.from('segments').select('rules').eq('id', segment_id).single();
        let targetQuery = supabase.from('customer_segments').select('email');
        
        if (segment && segment.rules.rfm_segment) {
            targetQuery = targetQuery.eq('rfm_segment', segment.rules.rfm_segment);
        }

        const { data: customers } = await targetQuery;

        if (customers) {
            for (const cust of customers) {
                await enqueueDripSequence(campaign.id, cust.email);
            }
        }

        res.json({ message: `Campaign created and queued for ${customers ? customers.length : 0} recipients.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('email_events')
            .select('event_type, count(*)', { count: 'exact' });
        
        // Grouping events
        // Note: supabase client doesn't group natively without RPC, 
        // fallback to standard select and count in JS for demo, or a raw query.
        const { data: rawEvents } = await supabase.from('email_events').select('event_type');
        const stats = rawEvents.reduce((acc, curr) => {
            acc[curr.event_type] = (acc[curr.event_type] || 0) + 1;
            return acc;
        }, {});
        
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { mailgunWebhook, getSegments, createSegment, getCampaigns, createCampaign, getAnalytics };
