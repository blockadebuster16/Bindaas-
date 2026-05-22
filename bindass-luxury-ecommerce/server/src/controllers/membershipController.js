const supabase = require('../config/supabase');

const getMyTier = async (req, res) => {
    try {
        const userEmail = req.user.email;
        if (!supabase) return res.json({ tier: 'Silver', nextTier: 'Gold', progress: 0, benefits: ["Early access to sales", "Birthday reward"] });

        // 1. Calculate total spend from orders table
        const { data: orders, error: ordersErr } = await supabase
            .from('orders')
            .select('total_amount, status')
            .eq('user_email', userEmail);
            
        if (ordersErr) throw ordersErr;

        // Sum completed orders
        const sum = orders
            .filter(o => o.status !== 'Pending') // Only count successfully placed/fulfilled
            .reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0);

        // 2. Fetch all tiers
        const { data: tiers, error: tiersErr } = await supabase
            .from('membership_tiers')
            .select('*')
            .order('spend_threshold', { ascending: true });

        if (tiersErr) throw tiersErr;

        // 3. Determine current tier
        let currentTier = tiers && tiers.length > 0 ? tiers[0] : { name: 'Silver', spend_threshold: 0, benefits: ["Early access to sales", "Birthday reward"] };
        let nextTier = null;

        if (tiers && tiers.length > 0) {
            for (let i = 0; i < tiers.length; i++) {
                if (sum >= tiers[i].spend_threshold) {
                    currentTier = tiers[i];
                    if (i + 1 < tiers.length) {
                        nextTier = tiers[i+1];
                    } else {
                        nextTier = null;
                    }
                }
            }
        }

        const progress = nextTier && nextTier.spend_threshold > 0
            ? Math.min(100, Math.round((sum / nextTier.spend_threshold) * 100))
            : 100;


        res.json({
            tier: currentTier.name,
            totalSpend: sum,
            benefits: currentTier.benefits,
            nextTier: nextTier ? nextTier.name : null,
            nextTierThreshold: nextTier ? nextTier.spend_threshold : null,
            progress
        });

    } catch (err) {
        console.error('getMyTier error:', err);
        res.status(500).json({ message: 'Failed to fetch membership info' });
    }
};

const getTiers = async (req, res) => {
    try {
        if (!supabase) return res.json([]);
        const { data, error } = await supabase.from('membership_tiers').select('*').order('spend_threshold');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch tiers' });
    }
};

module.exports = { getMyTier, getTiers };
