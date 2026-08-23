const { getOrdersWithItems, updateOrderStatus: updateSupabaseOrderStatus, checkClimateDonation, updateQikinkTracking } = require('../services/supabaseService');
const qikinkService = require('../services/qikinkService');


// @desc    Get all orders with filtering
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const { search, status, sort, paginated, limit, page } = req.query;

        // Build filter object for Supabase
        let filters = {};
        if (search) {
            filters.userEmail = search; // We'd need to adapt Supabase service for regex, let's keep it simple or exact for now
        }
        if (status && status !== 'All') {
            filters.status = status;
        }

        const isPaginated = paginated === 'true';
        let totalItems = 0;
        let totalPages = 1;
        let currentPage = 1;

        if (isPaginated || limit) {
            filters.returnCount = true;
            const limitNum = limit ? parseInt(limit) : 20;
            currentPage = page ? parseInt(page) : 1;
            const skip = (currentPage - 1) * limitNum;
            filters.limit = limitNum;
            filters.skip = skip;
        }

        let result = await getOrdersWithItems(filters);
        let orders = filters.returnCount ? result.data : result;
        if (filters.returnCount) {
            totalItems = result.count;
            totalPages = Math.ceil(totalItems / filters.limit);
        }

        // Client-side sort for now if we need 'oldest', since supabase service defaults to descending
        if (sort === 'oldest') {
             orders = orders.reverse();
        }

        if (isPaginated) {
            res.json({
                orders,
                totalItems,
                totalPages,
                currentPage
            });
        } else {
            res.json(orders);
        }
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

// @desc    Check if an order has a climate donation (for refund & admin automation)
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

// @desc    Sync Qikink fulfillment tracking status for an order
// @route   POST /api/orders/:id/sync-qikink
// @access  Private/Admin
const syncQikinkStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const orders = await getOrdersWithItems({});
        const targetOrder = orders.find(o => String(o._id) === String(orderId));

        if (!targetOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        const qikinkOrderId = targetOrder.qikinkOrderId;
        if (!qikinkOrderId) {
            return res.status(400).json({ message: "Order does not have a Qikink order ID associated yet" });
        }

        const trackingData = await qikinkService.fetchQikinkTracking(qikinkOrderId);
        const updated = await updateQikinkTracking(orderId, trackingData);

        res.json({
            message: "Qikink tracking status updated successfully",
            tracking: trackingData,
            order: updated
        });
    } catch (error) {
        console.error("Sync Qikink Status Error:", error);
        res.status(500).json({ message: error.message || "Failed to sync Qikink tracking status" });
    }
};

module.exports = { getOrders, updateOrderStatus, getMyOrders, getClimateDonationStatus, syncQikinkStatus };
