const { getOrdersWithItems, updateOrderStatus: updateSupabaseOrderStatus, checkClimateDonation } = require('../services/supabaseService');
const googleSheetsService = require('../services/googleSheetsService');

// @desc    Get all orders with filtering
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const { search, status, sort } = req.query;

        // Build filter object for Supabase
        let filters = {};
        if (search) {
            filters.userEmail = search; // We'd need to adapt Supabase service for regex, let's keep it simple or exact for now
        }
        if (status && status !== 'All') {
            filters.status = status;
        }

        let orders = await getOrdersWithItems(filters);

        // Client-side sort for now if we need 'oldest', since supabase service defaults to descending
        if (sort === 'oldest') {
             orders = orders.reverse();
        }

        res.json(orders);
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        res.status(500).json({ message: "Failed to fetch orders." });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value." });
        }

        const updatedOrder = await updateSupabaseOrderStatus(orderId, status);

        // Trigger Google Sheets Sync
        try {
            await googleSheetsService.updateOrderStatus(orderId, status);
        } catch(sheetErr) {
            console.error("Sheets sync failed but DB updated", sheetErr);
        }

        res.json({ message: "Order status updated successfully.", order: updatedOrder });
    } catch (error) {
        console.error("Update Order Status Error:", error);
        res.status(500).json({ message: "Failed to update order status." });
    }
};

// @desc    Get logged in user orders from last year
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const userEmail = req.user.email;
        if (!userEmail) {
            return res.status(400).json({ message: "User email not found in token." });
        }

        const orders = await getOrdersWithItems({ userEmail });

        // Filter last year
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const recentOrders = orders.filter(o => new Date(o.orderDate) >= oneYearAgo);

        res.json(recentOrders);
    } catch (error) {
        console.error("Get My Orders Error:", error);
        res.status(500).json({ message: "Failed to fetch your order history." });
    }
};

// @desc    Check if an order has a climate donation (for n8n automation)
// @route   GET /api/orders/climate-donation/:razorpayOrderId
// @access  Private (Service/Admin)
const getClimateDonationStatus = async (req, res) => {
    try {
        const { razorpayOrderId } = req.params;
        const result = await checkClimateDonation(razorpayOrderId);
        res.json(result);
    } catch (error) {
        console.error("Check Donation Error:", error);
        res.status(500).json({ message: "Failed to check donation status." });
    }
};

module.exports = { getOrders, updateOrderStatus, getMyOrders, getClimateDonationStatus };
