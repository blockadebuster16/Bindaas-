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
        console.warn("⚠️ store_settings row not found. Returning hardcoded defaults.");
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
    // 1. Insert Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
        
    if (orderError) throw orderError;

    // 2. Insert Items with foreign key
    const itemsWithOrderId = itemsData.map(item => ({ ...item, order_id: order.id }));
    const { error: itemsError } = await supabase.from('order_items').insert(itemsWithOrderId);
    
    if (itemsError) {
        // Rollback is manual in standard Supabase REST (or RPC if needed), but we'll soft-handle here
        console.error("Order items insertion failed:", itemsError);
    }

    return order;
};

const getOrdersWithItems = async (filters = {}) => {
    let query = supabase.from('orders').select(`
        *,
        order_items (*)
    `).order('order_date', { ascending: false });

    if (filters.userEmail) {
        query = query.eq('user_email', filters.userEmail);
    }
    if (filters.status && filters.status !== 'All') {
        query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Map to camelCase for frontend (matches old MongoDB structure)
    return data.map(order => ({
        _id: order.id,
        userEmail: order.user_email,
        totalAmount: order.total_amount,
        climateContribution: order.climate_contribution,
        status: order.status,
        transactionId: order.transaction_id,
        shippingInfo: order.shipping_info,
        orderDate: order.order_date,
        products: order.order_items.map(item => ({
            productId: { _id: item.product_id, name: item.name, images: [item.image] }, // Simulate mongo populate
            quantity: item.quantity,
            price: item.price,
            size: item.size
        }))
    }));
};

const updateOrderStatus = async (orderId, status) => {
    const { data, error } = await supabase.from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();
    if (error) throw error;
    return { ...data, _id: data.id };
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
 * Used by the n8n refund automation endpoint.
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
    recordClimateDonation, checkClimateDonation,
    getCoupons, createCoupon, toggleCoupon, deleteCoupon, validateCoupon, recordCouponUsage,
    upsertCustomerProfile
};
