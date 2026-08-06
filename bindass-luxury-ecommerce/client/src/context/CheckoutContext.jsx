import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CheckoutContext = createContext();

const SETTINGS_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/settings`;

// ── Pure shipping calculation (mirrors shippingCalculator.js on server) ────
const computeShipping = (itemCount, method, isCOD, cfg) => {
    if (!cfg) return { shipping: 0, codFee: 0, shippingGst: 0, shippingTotal: 0 };

    const totalWeight = itemCount * cfg.itemWeight;
    const units = Math.ceil(totalWeight / cfg.unitWeight);
    const rate = method === 'Surface' ? cfg.surfaceRate : cfg.airRate;
    const baseShipping = units * rate;
    const codFeeVal = isCOD && cfg.codEnabled ? cfg.codFee : 0;
    const shippingGst = Math.round((baseShipping + codFeeVal) * (cfg.shippingGst / 100));
    const shippingTotal = baseShipping + codFeeVal + shippingGst;

    return { shipping: baseShipping, codFee: codFeeVal, shippingGst, shippingTotal };
};

export const CheckoutProvider = ({ children }) => {
    // ── Persisted State ─────────────────────────────────────────────────────
    const [shippingData, setShippingData] = useState(() => {
        const saved = localStorage.getItem('bindass_checkout_shipping');
        return saved ? JSON.parse(saved) : {
            firstName: '', lastName: '', addressLine1: '',
            city: '', state: '', pincode: '', countryCode: 'IN',
            email: '', phone: ''
        };
    });

    const [appliedCoupon, setAppliedCoupon] = useState(() => {
        const saved = localStorage.getItem('bindass_applied_coupon');
        return saved ? JSON.parse(saved) : null;
    });

    const [paymentData, setPaymentData] = useState(() => {
        const saved = localStorage.getItem('bindass_checkout_payment');
        return saved ? JSON.parse(saved) : { method: 'card', lastFour: 'XXXX' };
    });

    const [checkoutTotals, setCheckoutTotals] = useState(() => {
        try {
            const saved = localStorage.getItem('bindass_checkout_totals');
            return saved ? JSON.parse(saved) : { subtotal: 0, cgst: 0, sgst: 0, discount: 0, shipping: 0, shippingGst: 0, codFee: 0, totalAmount: 0 };
        } catch { return { subtotal: 0, cgst: 0, sgst: 0, discount: 0, shipping: 0, shippingGst: 0, codFee: 0, totalAmount: 0 }; }
    });

    // ── Climate Action state ───────────────────────────────────────────────
    const [isClimateSelected, setIsClimateSelected] = useState(() => {
        const saved = localStorage.getItem('bindass_climate_fee');
        return saved !== null ? JSON.parse(saved) : true; // checked by default
    });

    // ── Shipping method state ───────────────────────────────────────────────
    const [shippingMethod, setShippingMethod] = useState('Air');   // 'Air' | 'Surface'
    const [isCOD, setIsCOD] = useState(false);

    // ── Live store settings ─────────────────────────────────────────────────
    const [storeConfig, setStoreConfig] = useState(null);

    useEffect(() => {
        axios.get(SETTINGS_URL).then(({ data }) => setStoreConfig(data)).catch(() => {
            // Fallback to safe defaults if API unreachable
            setStoreConfig({ cgst: 9, sgst: 9, shippingGst: 18, airRate: 54, surfaceRate: 42, codFee: 34, codEnabled: true, itemWeight: 300, unitWeight: 500, freeShippingThreshold: 0 });
        });
    }, []);

    // ── Persistence ─────────────────────────────────────────────────────────
    useEffect(() => { localStorage.setItem('bindass_checkout_shipping', JSON.stringify(shippingData)); }, [shippingData]);
    useEffect(() => { localStorage.setItem('bindass_checkout_payment', JSON.stringify(paymentData)); }, [paymentData]);
    useEffect(() => { localStorage.setItem('bindass_applied_coupon', JSON.stringify(appliedCoupon)); }, [appliedCoupon]);
    useEffect(() => { localStorage.setItem('bindass_checkout_totals', JSON.stringify(checkoutTotals)); }, [checkoutTotals]);
    useEffect(() => { localStorage.setItem('bindass_climate_fee', JSON.stringify(isClimateSelected)); }, [isClimateSelected]);

    // ── Core recalculation ──────────────────────────────────────────────────
    const updateTotals = useCallback(({ subtotal: newSubtotal, discount: newDiscount, itemCount } = {}) => {
        setCheckoutTotals(prev => {
            const cfg = storeConfig;
            const subtotal = newSubtotal ?? prev.subtotal ?? 0;
            const discount = newDiscount ?? prev.discount ?? 0;
            const count = itemCount ?? prev._itemCount ?? 0;

            const discountedSubtotal = Math.max(0, subtotal - discount);

            // CGST + SGST on products
            const cgstRate = cfg ? (cfg.cgst ?? 9) / 100 : 0.09;
            const sgstRate = cfg ? (cfg.sgst ?? 9) / 100 : 0.09;
            const cgst = Math.round(discountedSubtotal * cgstRate);
            const sgst = Math.round(discountedSubtotal * sgstRate);
            const tax = cgst + sgst; // combined for total

            // Shipping (free shipping check)
            let shippingCharge = { shipping: 0, codFee: 0, shippingGst: 0, shippingTotal: 0 };
            const freeThreshold = cfg?.freeShippingThreshold ?? 0;
            if (!cfg || freeThreshold === 0 || subtotal < freeThreshold) {
                shippingCharge = computeShipping(count, shippingMethod, isCOD, cfg);
            }

            // Climate Action Fee (non-refundable, not subject to other taxes)
            const climateFee = (isClimateSelected && cfg?.climateFeeEnabled)
                ? Number(cfg.climateFeeAmount ?? 25)
                : 0;

            const totalAmount = Math.round(discountedSubtotal + tax + shippingCharge.shippingTotal + climateFee);

            return {
                subtotal,
                discount,
                cgst,
                sgst,
                tax,
                shipping: shippingCharge.shipping,
                shippingGst: shippingCharge.shippingGst,
                codFee: shippingCharge.codFee,
                shippingTotal: shippingCharge.shippingTotal,
                climateFee,
                totalAmount,
                _itemCount: count
            };
        });
    }, [storeConfig, shippingMethod, isCOD, isClimateSelected]);

    // ── Re-compute when shipping method / COD / config changes ──────────────
    useEffect(() => {
        if (checkoutTotals.subtotal > 0) {
            updateTotals({ subtotal: checkoutTotals.subtotal, discount: checkoutTotals.discount, itemCount: checkoutTotals._itemCount });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shippingMethod, isCOD, storeConfig, isClimateSelected]);

    // ── Actions ─────────────────────────────────────────────────────────────
    const updateShipping = (data) => setShippingData(prev => ({ ...prev, ...data }));
    const updatePayment  = (data) => setPaymentData(prev => ({ ...prev, ...data }));

    const applyCoupon = (coupon) => setAppliedCoupon(coupon);
    const removeCoupon = () => {
        setAppliedCoupon(null);
        updateTotals({ discount: 0, subtotal: checkoutTotals.subtotal, itemCount: checkoutTotals._itemCount });
    };

    const clearCheckout = () => {
        ['bindass_checkout_shipping', 'bindass_checkout_payment', 'bindass_checkout_totals', 'bindass_applied_coupon', 'bindass_climate_fee'].forEach(k => localStorage.removeItem(k));
        setShippingData({ firstName: '', lastName: '', addressLine1: '', city: '', state: '', pincode: '', countryCode: 'IN', email: '', phone: '' });
        setPaymentData({ method: 'card', lastFour: 'XXXX' });
        setAppliedCoupon(null);
        setCheckoutTotals({ subtotal: 0, cgst: 0, sgst: 0, tax: 0, discount: 0, shipping: 0, shippingGst: 0, codFee: 0, climateFee: 0, totalAmount: 0 });
        setShippingMethod('Air');
        setIsCOD(false);
        setIsClimateSelected(true);
    };

    return (
        <CheckoutContext.Provider value={{
            shippingData, updateShipping,
            paymentData, updatePayment,
            checkoutTotals, updateTotals,
            appliedCoupon, applyCoupon, removeCoupon,
            clearCheckout,
            shippingMethod, setShippingMethod,
            isCOD, setIsCOD,
            isClimateSelected, setIsClimateSelected,
            storeConfig
        }}>
            {children}
        </CheckoutContext.Provider>
    );
};

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (!context) throw new Error('useCheckout must be used within a CheckoutProvider');
    return context;
};
