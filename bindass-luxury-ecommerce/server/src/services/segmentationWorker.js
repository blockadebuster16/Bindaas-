const supabase = require('../config/supabase');
const { PgBoss } = require('pg-boss');
require('dotenv').config();

let boss = null;
if (process.env.DATABASE_URL) {
    try {
        boss = new PgBoss(process.env.DATABASE_URL);
    } catch (e) {
        console.warn('⚠️ pg-boss initialization warning:', e.message);
    }
}

const initSegmentationWorker = async () => {
    if (!boss) {
        console.log('ℹ️ pg-boss skipped: DATABASE_URL not configured');
        return;
    }
    try {
        await boss.start();
        console.log('✅ pg-boss started for Segmentation & Outreach');

        // Schedule a recurring job to calculate RFM (e.g., daily at 2 AM)
        await boss.schedule('calculate-rfm', '0 2 * * *');
        
        boss.work('calculate-rfm', async (job) => {
            console.log('Running RFM calculation job...');
            await calculateRFMScores();
        });

    } catch (err) {
        console.error('❌ Error starting pg-boss:', err.message);
    }
};

const calculateRFMScores = async () => {
    try {
        // Fetch all successful orders to calculate RFM
        // A real system might run an aggregation query directly on the DB.
        const { data: orders, error } = await supabase
            .from('orders')
            .select('user_email, total_amount, order_date')
            .eq('status', 'Delivered');

        if (error) throw error;

        const customerStats = {};
        const now = new Date();

        orders.forEach(order => {
            const email = order.user_email;
            if (!email) return;

            if (!customerStats[email]) {
                customerStats[email] = { totalSpent: 0, totalOrders: 0, lastOrderDate: new Date(0) };
            }
            
            customerStats[email].totalSpent += Number(order.total_amount) || 0;
            customerStats[email].totalOrders += 1;
            
            const oDate = new Date(order.order_date);
            if (oDate > customerStats[email].lastOrderDate) {
                customerStats[email].lastOrderDate = oDate;
            }
        });

        // Upsert into customer_segments table
        const upsertData = Object.keys(customerStats).map(email => {
            const stats = customerStats[email];
            
            // Basic RFM Scoring Logic
            const daysSinceLastOrder = Math.floor((now - stats.lastOrderDate) / (1000 * 60 * 60 * 24));
            
            let rScore = 1;
            if (daysSinceLastOrder <= 30) rScore = 5;
            else if (daysSinceLastOrder <= 90) rScore = 4;
            else if (daysSinceLastOrder <= 180) rScore = 3;
            else if (daysSinceLastOrder <= 365) rScore = 2;

            let fScore = 1;
            if (stats.totalOrders >= 10) fScore = 5;
            else if (stats.totalOrders >= 5) fScore = 4;
            else if (stats.totalOrders >= 3) fScore = 3;
            else if (stats.totalOrders >= 2) fScore = 2;

            let mScore = 1;
            if (stats.totalSpent >= 50000) mScore = 5;
            else if (stats.totalSpent >= 20000) mScore = 4;
            else if (stats.totalSpent >= 10000) mScore = 3;
            else if (stats.totalSpent >= 5000) mScore = 2;

            // Determine Segment
            let segment = 'New';
            if (rScore >= 4 && fScore >= 4 && mScore >= 4) segment = 'Champions';
            else if (rScore >= 3 && fScore >= 3) segment = 'Loyal Customers';
            else if (rScore <= 2 && fScore >= 3) segment = 'At Risk';
            else if (rScore <= 2 && fScore <= 2) segment = 'Hibernating';
            
            return {
                email,
                recency_score: rScore,
                frequency_score: fScore,
                monetary_score: mScore,
                rfm_segment: segment,
                last_order_date: stats.lastOrderDate.toISOString(),
                total_orders: stats.totalOrders,
                total_spent: stats.totalSpent,
                last_calculated_at: now.toISOString()
            };
        });

        if (upsertData.length > 0) {
            const { error: upsertErr } = await supabase.from('customer_segments').upsert(upsertData, { onConflict: 'email' });
            if (upsertErr) throw upsertErr;
        }

        console.log(`✅ Calculated RFM for ${upsertData.length} customers.`);

    } catch (err) {
        console.error('RFM Calculation failed:', err);
    }
};

module.exports = { initSegmentationWorker, calculateRFMScores, boss };
