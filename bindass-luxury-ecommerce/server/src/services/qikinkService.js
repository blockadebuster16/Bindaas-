/**
 * qikinkService.js
 * 
 * Direct API Integration for Qikink Print-on-Demand (POD) Fulfillment Service.
 * Handles automated order creation and live shipment tracking retrieval.
 */

const axios = require('axios');

const QIKINK_API_URL = process.env.QIKINK_API_URL || 'https://api.qikink.com/v1';
const QIKINK_API_KEY = process.env.QIKINK_API_KEY;
const QIKINK_CLIENT_ID = process.env.QIKINK_CLIENT_ID;

/**
 * Get configured headers for Qikink API requests
 */
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-api-key': QIKINK_API_KEY || '',
    'x-client-id': QIKINK_CLIENT_ID || ''
});

/**
 * Send order to Qikink for print-on-demand fulfillment.
 * 
 * @param {Object} orderData  - Supabase order details
 * @param {Array} itemsData   - Order items array
 * @returns {Promise<Object>} - Qikink response containing order_id and shipment details
 */
const createQikinkOrder = async (orderData, itemsData) => {
    if (!QIKINK_API_KEY) {
        console.warn('⚠️ [Qikink] QIKINK_API_KEY is not set. Simulating Qikink Order Creation in Dev Mode.');
        return {
            success: true,
            qikinkOrderId: `QK_MOCK_${Date.now()}`,
            shipmentId: `QK_SHIP_${Date.now()}`,
            status: 'SUBMITTED'
        };
    }

    const shippingInfo = orderData.shipping_info || {};
    
    // Map Bindass items to Qikink SKU payload structure
    const lineItems = itemsData.map(item => ({
        search_by: 'sku',
        sku: item.product_id || item.sku || 'DEFAULT_SKU',
        quantity: item.quantity,
        size: item.size || 'M'
    }));

    const payload = {
        order_number: String(orderData.id || orderData._id),
        gateway: 'Razorpay',
        payment_mode: 'Prepaid',
        total_amount: String(orderData.total_amount),
        shipping_address: {
            first_name: shippingInfo.firstName || 'Customer',
            last_name: shippingInfo.lastName || '',
            address1: shippingInfo.address || '',
            city: shippingInfo.city || '',
            state: shippingInfo.state || '',
            zip: shippingInfo.pincode || shippingInfo.zip || '',
            country: 'India',
            phone: shippingInfo.phone || shippingInfo.mobile || '',
            email: orderData.user_email
        },
        line_items: lineItems
    };

    try {
        const response = await axios.post(`${QIKINK_API_URL}/order/create`, payload, {
            headers: getHeaders(),
            timeout: 10000
        });

        console.log(`✅ [Qikink] Order created successfully:`, response.data);

        return {
            success: true,
            qikinkOrderId: response.data.order_id || response.data.qikink_order_id,
            shipmentId: response.data.shipment_id,
            status: 'SUBMITTED'
        };
    } catch (error) {
        console.error('❌ [Qikink] Order Creation Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Qikink API Order Creation Failed');
    }
};

/**
 * Fetch tracking details for an existing Qikink order.
 * 
 * @param {string} qikinkOrderId 
 * @returns {Promise<Object>} Tracking details (courier, awb, tracking_url, status)
 */
const fetchQikinkTracking = async (qikinkOrderId) => {
    if (!qikinkOrderId) {
        throw new Error('Qikink Order ID is required for tracking lookup');
    }

    if (!QIKINK_API_KEY || qikinkOrderId.startsWith('QK_MOCK_')) {
        return {
            fulfillmentStatus: 'IN_PRODUCTION',
            courierName: 'BlueDart Express',
            trackingNumber: `BD${Date.now().toString().slice(-8)}`,
            trackingUrl: `https://www.bluedart.com/tracking`,
            updatedAt: new Date()
        };
    }

    try {
        const response = await axios.get(`${QIKINK_API_URL}/order/track/${qikinkOrderId}`, {
            headers: getHeaders(),
            timeout: 8000
        });

        const data = response.data || {};
        return {
            fulfillmentStatus: mapQikinkStatus(data.status),
            courierName: data.courier_name || data.courier || '',
            trackingNumber: data.awb_number || data.tracking_number || '',
            trackingUrl: data.tracking_url || '',
            updatedAt: new Date()
        };
    } catch (error) {
        console.error('❌ [Qikink] Tracking Lookup Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch Qikink tracking status');
    }
};

/**
 * Map Qikink status strings to Bindass fulfillment_status Enum
 */
const mapQikinkStatus = (status = '') => {
    const s = status.toUpperCase();
    if (s.includes('SHIPPED') || s.includes('DISPATCHED')) return 'SHIPPED';
    if (s.includes('DELIVERED')) return 'DELIVERED';
    if (s.includes('CANCEL')) return 'CANCELLED';
    if (s.includes('PRINT') || s.includes('PROCESS')) return 'IN_PRODUCTION';
    return 'SUBMITTED';
};

module.exports = {
    createQikinkOrder,
    fetchQikinkTracking
};
