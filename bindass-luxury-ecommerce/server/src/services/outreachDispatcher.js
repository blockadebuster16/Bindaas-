const formData = require('form-data');
const Mailgun = require('mailgun.js');
const supabase = require('../config/supabase');
const { boss } = require('./segmentationWorker');

const mailgun = new Mailgun(formData);

// Job processor for sending campaign emails
const initOutreachDispatcher = () => {
    if (!boss) return;
    // We register the worker to process 'send-campaign-email'
    // Rate limits (e.g., max 50 per hour) can be enforced by pg-boss config or custom logic here.
    boss.work('send-campaign-email', { teamSize: 5, teamConcurrency: 5 }, async (job) => {
        try {
            const { campaignId, stepId, recipientEmail, subject, bodyHtml, senderProfileId } = job.data;

            // 1. Fetch Sender Profile
            const { data: profile, error: profileErr } = await supabase
                .from('sender_profiles')
                .select('*')
                .eq('id', senderProfileId)
                .single();

            if (profileErr || !profile) {
                throw new Error('Sender profile not found.');
            }

            // 2. Initialize Mailgun Client
            const mg = mailgun.client({
                username: 'api',
                key: profile.mailgun_api_key,
                url: 'https://api.mailgun.net' // or eu.mailgun.net
            });

            // 3. Send Email
            const messageData = {
                from: `${profile.from_name} <${profile.from_email}>`,
                to: recipientEmail,
                subject: subject,
                html: bodyHtml,
                "v:campaignId": campaignId,
                "v:stepId": stepId
            };

            const response = await mg.messages.create(profile.mailgun_domain, messageData);

            // 4. Log Event to webhook sink (optimistic log, webhooks will handle the rest)
            await supabase.from('email_events').insert([{
                campaign_id: campaignId,
                step_id: stepId,
                recipient_email: recipientEmail,
                event_type: 'sent',
                message_id: response.id
            }]);

            console.log(`✉️ Email sent to ${recipientEmail} via ${profile.domain}`);
        } catch (err) {
            console.error('❌ Outreach Dispatch Error:', err.message);
            throw err; // Allow pg-boss to retry
        }
    });
};

// Helper to enqueue a drip sequence
const enqueueDripSequence = async (campaignId, recipientEmail) => {
    if (!boss) {
        console.warn('⚠️ Cannot enqueue drip sequence: pg-boss is not initialized');
        return;
    }
    const { data: steps, error } = await supabase
        .from('campaign_steps')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('step_order', { ascending: true });

    if (error || !steps || steps.length === 0) return;

    const { data: campaign } = await supabase.from('campaigns').select('sender_profile_id').eq('id', campaignId).single();

    for (const step of steps) {
        const delaySeconds = step.delay_hours * 3600;
        
        await boss.send('send-campaign-email', {
            campaignId: campaignId,
            stepId: step.id,
            recipientEmail: recipientEmail,
            subject: step.subject,
            bodyHtml: step.body_html,
            senderProfileId: campaign.sender_profile_id
        }, { startAfter: delaySeconds });
    }
};

module.exports = { initOutreachDispatcher, enqueueDripSequence };
