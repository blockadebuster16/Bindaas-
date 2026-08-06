import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCheckout } from '../context/CheckoutContext';
import { useCart } from '../context/CartContext';
import { useGeo } from '../context/GeoContext';
import API_BASE_URL from '../config/api';

const FloatingInput = ({ label, error, children }) => (
    <div className="relative">
        {children}
        {label && <label className="absolute -top-2 left-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white px-1">{label}</label>}
        {error && <p className="mt-1 text-[9px] text-red-500 font-bold uppercase tracking-widest">{error}</p>}
    </div>
);

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        shippingData, updateShipping,
        checkoutTotals, updateTotals,
        appliedCoupon, applyCoupon, removeCoupon,
        shippingMethod, setShippingMethod,
        isCOD, setIsCOD,
        storeConfig
    } = useCheckout();

    const { geoData } = useGeo();
    const zone = geoData?.zone;
    const { cartItems } = useCart();
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: shippingData
    });

    useEffect(() => {
        const sub = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        if (sub > 0) {
            updateTotals({ subtotal: sub, itemCount: totalQty });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cartItems]);

    useEffect(() => {
        const fetchAndFill = async () => {
            if (user) {
                try {
                    const token = localStorage.getItem("bindass_user_token");
                    const { data: profile } = await axios.get(`${API_BASE_URL}/api/users/profile`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (profile.displayName) {
                        const names = profile.displayName.split(' ');
                        setValue('firstName', names[0]);
                        if (names.length > 1) setValue('lastName', names.slice(1).join(' '));
                    }
                    if (profile.email) setValue('email', profile.email);
                    if (profile.phoneNumber) setValue('phone', profile.phoneNumber);
                    if (profile.addressLine1) setValue('addressLine1', profile.addressLine1);
                    if (profile.addressLine2) setValue('addressLine2', profile.addressLine2);
                    if (profile.city) setValue('city', profile.city);
                    if (profile.state) setValue('state', profile.state || 'IN');
                    if (profile.pincode) setValue('pincode', profile.pincode);
                } catch (err) {
                    console.error("Frictionless fill error:", err);
                }
            }
        };
        fetchAndFill();
    }, [user, setValue]);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponLoading(true);
        setCouponError('');
        try {
            const { data: coupon } = await axios.post(`${API_BASE_URL}/api/coupons/validate`, {
                code: couponCode,
                subtotal: checkoutTotals.subtotal
            });
            let discountValue = 0;
            if (coupon.discountType === 'percentage') {
                discountValue = Math.round(checkoutTotals.subtotal * (coupon.discountValue / 100));
            } else {
                discountValue = coupon.discountValue;
            }
            applyCoupon(coupon);
            updateTotals({ discount: discountValue });
            setCouponCode('');
        } catch (err) {
            setCouponError(err.response?.data?.message || 'Invalid code');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        removeCoupon();
        updateTotals({ discount: 0 });
    };

    const onSubmit = (data) => {
        updateShipping(data);
        navigate('/checkout/payment');
    };

    const inputClass = (hasError) =>
        `w-full border ${hasError ? 'border-red-400' : 'border-slate-200'} rounded-lg px-4 pt-5 pb-3 text-sm font-medium text-[#111111] bg-white outline-none focus:border-[#111111] focus:ring-0 transition-colors duration-200 placeholder-transparent peer`;

    return (
        <div className="bg-[#FAFAF9] min-h-screen font-sans">

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                {/* Progress Steps */}
                <div className="mb-10 max-w-sm mx-auto">
                    <div className="flex items-center gap-0">
                        <div className="flex flex-col items-center">
                            <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-black shadow-md">1</div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#111111] mt-1.5">Shipping</span>
                        </div>
                        <div className="flex-1 h-px bg-slate-200 mx-3 mt-[-14px]" />
                        <div className="flex flex-col items-center opacity-40">
                            <div className="w-9 h-9 rounded-full border-2 border-slate-300 text-slate-400 flex items-center justify-center text-xs font-black">2</div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1.5">Review & Pay</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
                    {/* ── Left: Form ── */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-black text-[#111111] tracking-tight mb-1">Shipping Details</h1>
                        <p className="text-sm text-slate-400 font-medium mb-7">Where should we send your order?</p>

                        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                            {/* Name Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <FloatingInput label="First Name" error={errors.firstName?.message}>
                                    <input
                                        {...register("firstName", { required: "Required" })}
                                        className={inputClass(errors.firstName)}
                                        placeholder="First Name"
                                    />
                                </FloatingInput>
                                <FloatingInput label="Last Name" error={errors.lastName?.message}>
                                    <input
                                        {...register("lastName", { required: "Required" })}
                                        className={inputClass(errors.lastName)}
                                        placeholder="Last Name"
                                    />
                                </FloatingInput>
                            </div>

                            {/* Street */}
                            <FloatingInput label="Street Address" error={errors.addressLine1?.message}>
                                <input
                                    {...register("addressLine1", { required: "Street address is required" })}
                                    className={inputClass(errors.addressLine1)}
                                    placeholder="Street Address"
                                />
                            </FloatingInput>

                            {/* Apt / Landmark */}
                            <FloatingInput label="Apartment / Landmark (optional)">
                                <input
                                    {...register("addressLine2")}
                                    className={inputClass(false)}
                                    placeholder="Apartment / Landmark (optional)"
                                />
                            </FloatingInput>

                            {/* City / Pincode / Country */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <FloatingInput label="City" error={errors.city?.message}>
                                    <input
                                        {...register("city", { required: "Required" })}
                                        className={inputClass(errors.city)}
                                        placeholder="City"
                                    />
                                </FloatingInput>
                                <FloatingInput label="Pincode" error={errors.pincode?.message}>
                                    <input
                                        {...register("pincode", {
                                            required: "Required",
                                            pattern: { value: /^[0-9]{6}$/, message: "6-digit pincode" }
                                        })}
                                        className={inputClass(errors.pincode)}
                                        placeholder="Pincode"
                                    />
                                </FloatingInput>
                                <FloatingInput label="Country">
                                    <select
                                        {...register("countryCode")}
                                        className="w-full border border-slate-200 rounded-lg px-4 pt-5 pb-3 text-sm font-medium text-[#111111] bg-white outline-none focus:border-[#111111] transition-colors"
                                    >
                                        <option value="IN">ðŸ‡®ðŸ‡³ India</option>
                                        <option value="US">ðŸ‡ºðŸ‡¸ USA</option>
                                    </select>
                                </FloatingInput>
                            </div>

                            {/* Email / Phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FloatingInput label="Email Address" error={errors.email?.message}>
                                    <input
                                        {...register("email", {
                                            required: "Required",
                                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                                        })}
                                        className={inputClass(errors.email)}
                                        placeholder="Email Address"
                                        type="email"
                                    />
                                </FloatingInput>
                                <FloatingInput label="Phone Number" error={errors.phone?.message}>
                                    <input
                                        {...register("phone", {
                                            required: "Required",
                                            pattern: { value: /^[0-9]{10}$/, message: "10-digit number" }
                                        })}
                                        className={inputClass(errors.phone)}
                                        placeholder="Phone Number"
                                        type="tel"
                                    />
                                </FloatingInput>
                            </div>

                            {/* Security note */}
                            <div className="flex items-center gap-2 py-3 px-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                <span className="material-icons text-emerald-500 text-sm">verified_user</span>
                                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">Your data is encrypted & never shared</p>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#111111] text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.25em] hover:bg-[#222] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                            >
                                <span>Continue to Review & Pay</span>
                                <span className="material-icons text-sm">arrow_forward</span>
                            </button>
                        </form>
                    </div>

                    {/* ── Right: Order Summary ── */}
                    <aside className="w-full lg:w-[380px] flex-shrink-0">
                        <div className="sticky top-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#111111]">Order Summary</h3>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                                    {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                                </span>
                            </div>

                            {/* Items */}
                            <div className="px-6 py-4 space-y-4 max-h-[240px] overflow-y-auto">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="flex gap-3">
                                        <div className="w-14 h-18 rounded-lg overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100">
                                            <img src={item.image} className="w-full h-full object-cover object-top" alt={item.name} />
                                        </div>
                                        <div className="flex-1 py-0.5 min-w-0">
                                            <h4 className="text-[11px] font-bold text-[#111111] truncate leading-tight">{item.name}</h4>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                {item.size} · Qty {item.quantity}
                                            </p>
                                            <div className="text-[11px] font-black text-[#111111] mt-1.5">₹{(item.price || 0).toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="px-6 pb-6 space-y-5 border-t border-slate-50 pt-5">
                                {/* Shipping Method */}
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Shipping Method</p>
                                    <div className="space-y-2">
                                        {['Air', 'Surface'].map(m => (
                                            <label key={m} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${shippingMethod === m ? 'border-[#111111] bg-[#111111]/3' : 'border-slate-100 hover:border-slate-300'}`}>
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${shippingMethod === m ? 'border-[#111111]' : 'border-slate-300'}`}>
                                                        {shippingMethod === m && <div className="w-2 h-2 rounded-full bg-[#111111]" />}
                                                    </div>
                                                    <div>
                                                        <span className="text-[11px] font-bold text-[#111111]">{m} Shipping</span>
                                                        <p className="text-[9px] text-slate-400 font-medium">{m === 'Air' ? 'Express 2-3 days' : 'Standard 5-7 days'}</p>
                                                    </div>
                                                </div>
                                                <input type="radio" name="shippingMethod" value={m} checked={shippingMethod === m} onChange={() => setShippingMethod(m)} className="hidden" />
                                            </label>
                                        ))}
                                        {storeConfig?.codEnabled && (
                                            <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isCOD ? 'border-amber-400 bg-amber-50' : 'border-slate-100 hover:border-amber-200'}`}>
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${isCOD ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                                                        {isCOD && <span className="material-icons text-white text-[8px]">check</span>}
                                                    </div>
                                                    <div>
                                                        <span className="text-[11px] font-bold text-[#111111]">Cash on Delivery</span>
                                                        <p className="text-[9px] text-amber-600 font-bold">+₹{storeConfig?.codFee} + GST</p>
                                                    </div>
                                                </div>
                                                <input type="checkbox" checked={isCOD} onChange={e => setIsCOD(e.target.checked)} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* International notice */}
                                {zone?.isInternational && zone?.duty_note && (
                                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-1">âš  International Order</p>
                                        <p className="text-[10px] text-amber-700 leading-relaxed">{zone.duty_note}</p>
                                    </div>
                                )}

                                {/* Coupon */}
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Promo Code</p>
                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <span className="material-icons text-emerald-500 text-sm">local_offer</span>
                                                <div>
                                                    <span className="text-emerald-700 font-black text-[10px] uppercase tracking-widest">{appliedCoupon.code}</span>
                                                    <p className="text-[9px] text-emerald-500 font-medium">Applied!</p>
                                                </div>
                                            </div>
                                            <button onClick={handleRemoveCoupon} className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 flex items-center justify-center transition-colors">
                                                <span className="material-icons text-xs">close</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                    placeholder="ENTER CODE"
                                                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#111111] outline-none focus:border-[#111111] bg-slate-50"
                                                />
                                                <button
                                                    onClick={handleApplyCoupon}
                                                    disabled={couponLoading || !couponCode}
                                                    className="bg-[#111111] text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-40 hover:bg-[#222] transition-colors"
                                                >
                                                    {couponLoading ? '...' : 'Apply'}
                                                </button>
                                            </div>
                                            {couponError && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest">{couponError}</p>}
                                        </div>
                                    )}
                                </div>

                                {/* Totals */}
                                <div className="space-y-2.5 border-t border-slate-100 pt-4">
                                    <div className="flex justify-between text-[12px] text-slate-500">
                                        <span className="font-medium">Subtotal</span>
                                        <span className="font-semibold text-[#111111]">₹{(checkoutTotals?.subtotal || 0).toLocaleString()}</span>
                                    </div>
                                    {checkoutTotals?.discount > 0 && (
                                        <div className="flex justify-between text-[12px] text-emerald-600">
                                            <span className="font-medium">Discount</span>
                                            <span className="font-bold">-₹{(checkoutTotals?.discount || 0).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-[12px] text-slate-500">
                                        <span className="font-medium">Shipping</span>
                                        {checkoutTotals?.shippingTotal > 0
                                            ? <span className="font-semibold text-[#111111]">₹{checkoutTotals.shippingTotal.toLocaleString()}</span>
                                            : <span className="text-emerald-600 font-bold text-[9px] uppercase tracking-widest">Free</span>
                                        }
                                    </div>
                                    {isCOD && checkoutTotals?.codFee > 0 && (
                                        <div className="flex justify-between text-[12px] text-amber-600">
                                            <span className="font-medium">COD Fee</span>
                                            <span className="font-bold">₹{checkoutTotals.codFee.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-[12px] text-slate-500">
                                        <span className="font-medium">CGST ({storeConfig?.cgst ?? 9}%)</span>
                                        <span className="font-semibold text-[#111111]">₹{(checkoutTotals?.cgst || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[12px] text-slate-500">
                                        <span className="font-medium">SGST ({storeConfig?.sgst ?? 9}%)</span>
                                        <span className="font-semibold text-[#111111]">₹{(checkoutTotals?.sgst || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-3 border-t border-slate-100 mt-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total</span>
                                        <span className="text-2xl font-black text-[#111111] leading-none">₹{(checkoutTotals?.totalAmount || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default Checkout;

