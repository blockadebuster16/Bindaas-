const { getSettings: getSupabaseSettings } = require('../services/supabaseService');

/**
 * calculateShipping
 *
 * @param {Array}   items      - Cart items: [{ quantity: Number }]
 * @param {string}  method     - 'Air' | 'Surface'
 * @param {boolean} isCOD      - Whether the payment method is Cash on Delivery
 * @returns {Object} { baseShipping, codFee, gst, total, breakdown }
 */
const calculateShipping = async (items, method = 'Air', isCOD = false) => {
  const cfg = await getSupabaseSettings();

  // 1. Total weight (grams)
  const totalQty = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalWeight = totalQty * cfg.itemWeight;           // e.g., 2 shirts × 300g = 600g

  // 2. Number of billing units (ceil to next 500g unit)
  const units = Math.ceil(totalWeight / cfg.unitWeight);   // e.g., ceil(600 / 500) = 2

  // 3. Base shipping (before GST)
  const rate = method === 'Surface' ? cfg.surfaceRate : cfg.airRate;
  const baseShipping = units * rate;                        // e.g., 2 × ₹54 = ₹108

  // 4. COD fee (flat per order, before GST)
  const codFee = isCOD && cfg.codEnabled ? cfg.codFee : 0;

  // 5. GST on (shipping + COD)
  const gstRate = cfg.shippingGst / 100;
  const gst = Math.round((baseShipping + codFee) * gstRate);

  // 6. Total shipping charge
  const total = baseShipping + codFee + gst;

  return {
    baseShipping,
    codFee,
    gst,
    total,
    breakdown: {
      totalWeight,
      units,
      rate,
      method,
      gstRate: cfg.shippingGst,
      freeShipping: cfg.freeShippingThreshold > 0
    }
  };
};

/**
 * calculateOrderTotals
 * Full order total calculation — used for server-side verification before payment.
 *
 * @param {Array}  items         - [{ quantity, price }]
 * @param {string} method        - 'Air' | 'Surface'
 * @param {boolean} isCOD
 * @param {number}  discount     - Coupon discount in ₹
 */
const calculateOrderTotals = async (items, method = 'Air', isCOD = false, discount = 0) => {
  const cfg = await getSupabaseSettings();

  const subtotal = items.reduce((s, i) => s + (i.price * i.quantity), 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);

  // CGST + SGST on product subtotal
  const productTaxRate = ((cfg.cgst ?? 9) + (cfg.sgst ?? 9)) / 100;
  const cgst = Math.round(discountedSubtotal * ((cfg.cgst ?? 9) / 100));
  const sgst = Math.round(discountedSubtotal * ((cfg.sgst ?? 9) / 100));
  const luxuryTax = cgst + sgst; // combined for totalAmount calc

  // Free shipping check
  let shipping = { baseShipping: 0, codFee: 0, gst: 0, total: 0, breakdown: {} };
  if (cfg.freeShippingThreshold === 0 || subtotal < cfg.freeShippingThreshold) {
    shipping = await calculateShipping(items, method, isCOD);
  }

  const totalAmount = discountedSubtotal + luxuryTax + shipping.total;

  return {
    subtotal,
    discount,
    discountedSubtotal,
    cgst,
    sgst,
    luxuryTax,   // cgst + sgst combined (kept for backward compat)
    shipping: shipping.total,
    shippingBreakdown: shipping,
    totalAmount: Math.round(totalAmount),
    config: {
      cgstRate: cfg.cgst ?? 9,
      sgstRate: cfg.sgst ?? 9,
      shippingGstRate: cfg.shippingGst,
      freeShippingThreshold: cfg.freeShippingThreshold
    }
  };
};

module.exports = { calculateShipping, calculateOrderTotals };
