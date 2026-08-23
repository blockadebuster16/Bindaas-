const supabase = require('../config/supabase');

if (!supabase) {
    console.error("CRITICAL: Supabase client is not initialized. Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set.");
}

// ==========================================
// STORE SETTINGS MODULE
// ==========================================
const getSettings = async () => {
    const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).single();
    
    if (error || !data) {
        return {
            cgst: 9, sgst: 9, shippingGst: 18,
            airRate: 54, surfaceRate: 42, codFee: 34,
            codEnabled: true, itemWeight: 300, unitWeight: 500,
            freeShippingThreshold: 0,
            climateFeeEnabled: true, climateFeeAmount: 25,
            climateFeeCause: 'Certified Mangrove Restoration Projects'
        };
    }
    
    // CamelCase mapping for frontend
    return {
        cgst: data.cgst,
        sgst: data.sgst,
        shippingGst: data.shipping_gst,
        airRate: data.air_rate,
        surfaceRate: data.surface_rate,
        codFee: data.cod_fee,
        codEnabled: data.cod_enabled,
        itemWeight: data.item_weight,
        unitWeight: data.unit_weight,
        freeShippingThreshold: data.free_shipping_threshold,
        climateFeeEnabled: data.climate_fee_enabled,
        climateFeeAmount: data.climate_fee_amount,
        climateFeeCause: data.climate_fee_cause
    };
};

const updateSettings = async (updates, adminEmail) => {
    // Map to snake_case for DB
    const dbUpdates = {
        cgst: updates.cgst,
        sgst: updates.sgst,
        shipping_gst: updates.shippingGst,
        air_rate: updates.airRate,
        surface_rate: updates.surfaceRate,
        cod_fee: updates.codFee,
        cod_enabled: updates.codEnabled,
        item_weight: updates.itemWeight,
        unit_weight: updates.unitWeight,
        free_shipping_threshold: updates.freeShippingThreshold,
        climate_fee_enabled: updates.climateFeeEnabled,
        climate_fee_amount: updates.climateFeeAmount,
        climate_fee_cause: updates.climateFeeCause,
        updated_at: new Date().toISOString()
    };
    
    // Remove undefined fields
    Object.keys(dbUpdates).forEach(key => dbUpdates[key] === undefined && delete dbUpdates[key]);

    // 1. Update settings (Upsert to ensure the singleton exists)
    const { error } = await supabase.from('store_settings').upsert({ id: 1, ...dbUpdates });
    if (error) throw error;

    // 2. Log audit trail
    if (adminEmail) {
        await supabase.from('settings_audit_log').insert([{
            admin_email: adminEmail,
            changes: dbUpdates
        }]);
    }
    
    return await getSettings();
};


// ==========================================
// ORDERS MODULE
// ==========================================
const createOrder = async (orderData, itemsData) => {
    // 1. Try atomic RPC procedure if available on Supabase
    try {
        const { data: rpcOrder, error: rpcError } = await supabase.rpc('insert_order_with_items', {
            p_order: orderData,
            p_items: itemsData
        });

        if (!rpcError && rpcOrder) {
            console.log(`✅ Atomic Order Created via RPC: #${rpcOrder.id}`);
            return rpcOrder;
        }
    } catch (e) {
        console.warn("⚠️ RPC insert_order_with_items fallback to REST:", e.message);
    }

    // 2. Fallback to standard Supabase REST insert if RPC function not executed yet
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
        
    if (orderError) throw orderError;

    const itemsWithOrderId = itemsData.map(item => ({ ...item, order_id: order.id }));
    const { error: itemsError } = await supabase.from('order_items').insert(itemsWithOrderId);
    
    if (itemsError) {
        console.error("❌ Order items insertion failed:", itemsError);
    }

    return order;
};

const getOrdersWithItems = async (filters = {}) => {
    // Core columns that always exist + pipeline columns added by migration
    // (migration columns degrade gracefully via the fallback)
    let query = supabase.from('orders').select(`
        id, user_email, full_name, phone, total_amount, climate_contribution,
        status, shipping_info, order_date, transaction_id, razorpay_payment_id,
        shipping_address,
        payment_status, fulfillment_status, ticket_id, idempotency_key,
        qikink_order_id, qikink_shipment_id, tracking_number, courier_name,
        tracking_url, qikink_synced_at, qikink_sync_failed,
        email_sent_at, email_send_failed,
        order_items (
            id, product_id, name, image, quantity, price, size, color
        )
    `, { count: 'exact' }).order('order_date', { ascending: false });

    if (filters.userEmail) {
        query = query.eq('user_email', filters.userEmail);
    }
    if (filters.status && filters.status !== 'All') {
        query = query.eq('status', filters.status);
    }

    if (filters.limit) {
        const skip = filters.skip || 0;
        query = query.range(skip, skip + filters.limit - 1);
    }

    const { data, error, count } = await query;

    // If the full query failed (migration columns may not exist yet), fall back to base columns only
    if (error) {
        console.warn('⚠️ Full order query failed (migration pending?), falling back to base columns:', error.message);
        let fallbackQuery = supabase.from('orders').select(`
            id, user_email, total_amount, climate_contribution,
            status, shipping_info, order_date, transaction_id,
            order_items ( id, product_id, name, image, quantity, price, size )
        `, { count: 'exact' }).order('order_date', { ascending: false });

        if (filters.userEmail) fallbackQuery = fallbackQuery.eq('user_email', filters.userEmail);
        if (filters.status && filters.status !== 'All') fallbackQuery = fallbackQuery.eq('status', filters.status);
        if (filters.limit) {
            const skip = filters.skip || 0;
            fallbackQuery = fallbackQuery.range(skip, skip + filters.limit - 1);
        }

        const { data: fbData, error: fbError, count: fbCount } = await fallbackQuery;
        if (fbError) {
            console.error('❌ Fallback order query failed:', fbError);
            throw fbError;
        }
        
        if (filters.returnCount) return { data: mapOrders(fbData), count: fbCount };
        return mapOrders(fbData);
    }

    if (filters.returnCount) return { data: mapOrders(data), count };
    return mapOrders(data);
};

// Shared mapping helper — converts Supabase snake_case rows to camelCase for the frontend.
// full_name, phone, and shipping_address are stored inside the shipping_info JSONB field if not migrated.
const mapOrders = (data) => data.map(order => {
    const si = order.shipping_info || {};
    return {
        _id: order.id,
        userEmail: order.user_email,
        fullName: order.full_name || (si.firstName ? `${si.firstName} ${si.lastName || ''}`.trim() : (si.fullName || 'Anonymous')),
        phone: order.phone || si.phone || si.mobile || '',
        razorpayPaymentId: order.razorpay_payment_id || order.transaction_id || null,
        shippingAddress: order.shipping_address || {
            addressLine1: si.addressLine1 || '',
            addressLine2: si.addressLine2 || '',
            city: si.city || '',
            state: si.state || '',
            postalCode: si.pincode || si.postalCode || '',
            country: si.country || 'India'
        },
        totalAmount: order.total_amount,
        climateContribution: order.climate_contribution,
        status: order.status,
        shippingInfo: si,
        orderDate: order.order_date,
        transactionId: order.transaction_id,
        // Pipeline columns (null before migration runs — graceful)
        paymentStatus: order.payment_status || 'PAYMENT_VERIFIED',
        fulfillmentStatus: order.fulfillment_status || null,
        ticketId: order.ticket_id || null,
        qikinkOrderId: order.qikink_order_id || null,
        qikinkShipmentId: order.qikink_shipment_id || null,
        trackingNumber: order.tracking_number || null,
        courierName: order.courier_name || null,
        trackingUrl: order.tracking_url || null,
        qikinkSyncedAt: order.qikink_synced_at || null,
        qikinkSyncFailed: order.qikink_sync_failed || false,
        emailSentAt: order.email_sent_at || null,
        emailSendFailed: order.email_send_failed || false,
        // Products: flat structure so OrdersManagement can use item.name / item.image directly
        products: (order.order_items || []).map(item => ({
            productId: item.product_id,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color || null
        }))
    };
});

const updateOrderStatus = async (orderId, status) => {
    const { data, error } = await supabase.from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();
    if (error) throw error;
    return { ...data, _id: data.id };
};

const updateQikinkOrderDetails = async (orderId, qikinkData) => {
    const { data, error } = await supabase.from('orders')
        .update({
            qikink_order_id: qikinkData.qikinkOrderId,
            qikink_shipment_id: qikinkData.shipmentId,
            fulfillment_status: qikinkData.status || 'SUBMITTED',
            qikink_synced_at: new Date().toISOString(),
            qikink_sync_failed: false
        })
        .eq('id', orderId)
        .select()
        .single();

    if (error) {
        console.error("❌ Error updating Qikink order details:", error);
        throw error;
    }
    return data;
};

const markQikinkFailed = async (orderId) => {
    await supabase.from('orders')
        .update({ qikink_sync_failed: true })
        .eq('id', orderId);
};

const updateQikinkTracking = async (orderId, trackingData) => {
    const { data, error } = await supabase.from('orders')
        .update({
            fulfillment_status: trackingData.fulfillmentStatus || 'SUBMITTED',
            courier_name: trackingData.courierName,
            tracking_number: trackingData.trackingNumber,
            tracking_url: trackingData.trackingUrl,
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

const markEmailSent = async (orderId) => {
    await supabase.from('orders')
        .update({ email_sent_at: new Date().toISOString(), email_send_failed: false })
        .eq('id', orderId);
};

const markEmailFailed = async (orderId) => {
    await supabase.from('orders')
        .update({ email_send_failed: true })
        .eq('id', orderId);
};


// ==========================================
// CLIMATE DONATIONS MODULE
// ==========================================

/**
 * Write a record to climate_donations when a donation was included in a paid order.
 * Called from paymentRoutes.js during verify-payment.
 */
const recordClimateDonation = async ({ orderId, razorpayOrderId, razorpayPaymentId, customerEmail, customerName, donationAmount, cause }) => {
    const { data, error } = await supabase
        .from('climate_donations')
        .insert([{
            order_id:            orderId,
            razorpay_order_id:   razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            customer_email:      customerEmail,
            customer_name:       customerName || '',
            donation_amount:     donationAmount,
            cause:               cause || 'Certified Mangrove Restoration Projects',
            is_refundable:       false
        }])
        .select()
        .single();

    if (error) {
        console.error('❌ Failed to record climate donation:', error);
        throw error;
    }
    console.log(`🌿 Climate donation recorded — ₹${donationAmount} for order ${razorpayOrderId}`);
    return data;
};

/**
 * Look up whether a specific Razorpay order had a climate donation.
 * Used by refund processing & reconciliation services.
 * Returns { hasDonation: bool, record: {...} | null }
 */
const checkClimateDonation = async (razorpayOrderId) => {
    const { data, error } = await supabase
        .from('climate_donations')
        .select('*')
        .eq('razorpay_order_id', razorpayOrderId)
        .maybeSingle();

    if (error) throw error;

    return {
        hasDonation: !!data,
        record: data ? {
            id:                 data.id,
            orderId:            data.order_id,
            razorpayOrderId:    data.razorpay_order_id,
            razorpayPaymentId:  data.razorpay_payment_id,
            customerEmail:      data.customer_email,
            customerName:       data.customer_name,
            donationAmount:     data.donation_amount,
            cause:              data.cause,
            isRefundable:       data.is_refundable,
            donatedAt:          data.donated_at
        } : null
    };
};


// ==========================================
// COUPON MODULE
// ==========================================
const getCoupons = async () => {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(c => ({
        _id: c.id,
        code: c.code,
        discountType: c.discount_type,
        discountValue: c.discount_value,
        minPurchase: c.min_purchase,
        expiryDate: c.expiry_date,
        isActive: c.is_active,
        usageCount: c.usage_count,
        createdAt: c.created_at
    }));
};

const createCoupon = async (couponData) => {
    const { data, error } = await supabase.from('coupons').insert([{
        code: couponData.code.toUpperCase(),
        discount_type: couponData.discountType,
        discount_value: couponData.discountValue,
        min_purchase: couponData.minPurchase || 0,
        expiry_date: couponData.expiryDate,
        is_active: couponData.isActive !== false
    }]).select().single();
    
    if (error) {
        if (error.code === '23505') throw new Error("Coupon code already exists"); // unique violation
        throw error;
    }
    return data;
};

const toggleCoupon = async (id) => {
    // get current
    const { data: current, error: getErr } = await supabase.from('coupons').select('is_active').eq('id', id).single();
    if (getErr || !current) throw new Error("Coupon not found");
    
    const { data, error } = await supabase.from('coupons')
        .update({ is_active: !current.is_active })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

const deleteCoupon = async (id) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
    return true;
};

const validateCoupon = async (code, subtotal) => {
    const { data: coupon, error } = await supabase.from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

    if (error || !coupon) throw new Error("Invalid or inactive coupon code");
    
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
        throw new Error("This coupon has expired");
    }
    
    if (subtotal < coupon.min_purchase) {
        throw new Error(`Minimum purchase of ₹${coupon.min_purchase} required`);
    }

    return {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value
    };
};

const recordCouponUsage = async (couponId, userEmail, orderId) => {
    // 1. Record usage
    await supabase.from('coupon_usage').insert([{
        coupon_id: couponId,
        user_email: userEmail,
        order_id: orderId
    }]);
    
    // 2. Increment usage_count
    // Supabase REST doesn't have an increment operation, so we fetch and add
    const { data: coupon } = await supabase.from('coupons').select('usage_count').eq('id', couponId).single();
    if (coupon) {
        await supabase.from('coupons').update({ usage_count: coupon.usage_count + 1 }).eq('id', couponId);
    }
};

const upsertCustomerProfile = async (profileData) => {
    const { error } = await supabase.from('customer_profiles').upsert({
        email: profileData.email,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        mobile: profileData.mobile,
        birthdate: profileData.birthdate,
        gender: profileData.gender,
        updated_at: new Date().toISOString()
    });

    if (error) {
        console.error("Failed to upsert customer profile:", error);
        throw error;
    }
    return true;
};

module.exports = {
    getSettings, updateSettings,
    createOrder, getOrdersWithItems, updateOrderStatus,
    updateQikinkOrderDetails, markQikinkFailed, updateQikinkTracking, markEmailSent, markEmailFailed,
    recordClimateDonation, checkClimateDonation,
    getCoupons, createCoupon, toggleCoupon, deleteCoupon, validateCoupon, recordCouponUsage,
    upsertCustomerProfile
};
