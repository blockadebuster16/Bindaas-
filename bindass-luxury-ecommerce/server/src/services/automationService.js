const axios = require('axios');

const triggerOrderAutomation = async (orderData) => {
    try {
        const response = await axios.post(process.env.N8N_WEBHOOK_URL, {
            orderId: orderData._id,
            customerEmail: orderData.userEmail,
            customerName: orderData.userName,
            amount: orderData.totalAmount,
            items: orderData.items,
            timestamp: new Date()
        });
        console.log('✅ n8n Webhook Triggered:', response.status);
    } catch (error) {
        console.error('❌ n8n Webhook Failed:', error.message);
    }
};

module.exports = { triggerOrderAutomation };