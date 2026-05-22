import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCheckout } from '../context/CheckoutContext';
import { useCart } from '../context/CartContext';
import { useGeo } from '../context/GeoContext';

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

    // 1. Seed totals from CartContext (works for both guest & logged-in users)
    useEffect(() => {
        const sub = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        if (sub > 0) {
            updateTotals({ subtotal: sub, itemCount: totalQty });
        }
    }, [cartItems]);

    // 2. Pre-fill from Persistent Profile (Frictionless Experience)
    useEffect(() => {
        const fetchAndFill = async () => {
            if (user) {
                try {
                    const token = await user.getIdToken();
                    const { data: profile } = await axios.get('http://localhost:5001/api/users/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    // Auto-fill form fields
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
                    if (profile.state) setValue('state', profile.state || 'IN'); // Fallback to state or country code
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
            const { data: coupon } = await axios.post('http://localhost:5001/api/coupons/validate', {
                code: couponCode,
                subtotal: checkoutTotals.subtotal
            });

            // Calculate Discount
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

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen">
            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Stepper */}
                <div className="mb-12 max-w-xl mx-auto">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/10 -z-10 -translate-y-1/2"></div>
                        <div className="flex flex-col items-center gap-2 bg-background-light pr-8">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/20 scale-110">1</div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Shipping</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 bg-background-light pl-8 opacity-50">
                            <div className="w-10 h-10 rounded-full bg-white border-2 border-primary/20 text-zinc-400 flex items-center justify-center font-bold">2</div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Review & Pay</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column: Form */}
                    <div className="flex-1 space-y-8">
                        <h1 className="text-3xl font-bold dark:text-black">Shipping Information</h1>
                        <section className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
                            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <input 
                                            {...register("firstName", { required: "First name is required" })}
                                            className={`w-full border ${errors.firstName ? 'border-red-500' : 'border-slate-300'} rounded-lg p-4 outline-none focus:ring-1 focus:ring-primary`} 
                                            placeholder="First Name" 
                                        />
                                        {errors.firstName && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <input 
                                            {...register("lastName", { required: "Last name is required" })}
                                            className={`w-full border ${errors.lastName ? 'border-red-500' : 'border-slate-300'} rounded-lg p-4 outline-none focus:ring-1 focus:ring-primary`} 
                                            placeholder="Last Name" 
                                        />
                                        {errors.lastName && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.lastName.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <input 
                                        {...register("addressLine1", { required: "Street address is required" })}
                                        className={`w-full border ${errors.addressLine1 ? 'border-red-500' : 'border-slate-300'} rounded-lg p-4 outline-none focus:ring-1 focus:ring-primary`} 
                                        placeholder="Street Address" 
                                    />
                                    {errors.addressLine1 && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.addressLine1.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <input 
                                            {...register("city", { required: "City is required" })}
                                            className={`w-full border ${errors.city ? 'border-red-500' : 'border-slate-300'} rounded-lg p-4 outline-none focus:ring-1 focus:ring-primary`} 
                                            placeholder="City" 
                                        />
                                        {errors.city && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.city.message}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <input 
                                            {...register("pincode", { 
                                                required: "Pincode is required",
                                                pattern: { value: /^[0-9]{6}$/, message: "Valid 6-digit Pincode needed" }
                                            })}
                                            className={`w-full border ${errors.pincode ? 'border-red-500' : 'border-slate-300'} rounded-lg p-4 outline-none focus:ring-1 focus:ring-primary`} 
                                            placeholder="Pincode" 
                                        />
                                        {errors.pincode && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.pincode.message}</p>}
                                    </div>
                                    <select 
                                        {...register("countryCode")}
                                        className="w-full border border-slate-300 rounded-lg p-4 bg-white outline-none"
                                    >
                                        <option value="IN">India</option>
                                        <option value="US">USA</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <input 
                                            {...register("email", { 
                                                required: "Email is required",
                                                pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
                                            })}
                                            className={`w-full border ${errors.email ? 'border-red-500' : 'border-slate-300'} rounded-lg p-4 outline-none focus:ring-1 focus:ring-primary`} 
                                            placeholder="Email" 
                                            type="email" 
                                        />
                                        {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.email.message}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <input 
                                            {...register("phone", { 
                                                required: "Phone is required",
                                                pattern: { value: /^[0-9]{10}$/, message: "Valid 10-digit number needed" }
                                            })}
                                            className={`w-full border ${errors.phone ? 'border-red-500' : 'border-slate-300'} rounded-lg p-4 outline-none focus:ring-1 focus:ring-primary`} 
                                            placeholder="Phone" 
                                            type="tel" 
                                        />
                                        {errors.phone && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.phone.message}</p>}
                                    </div>
                                </div>

                                <button 
                                    className="w-full bg-[#10221c] text-white font-bold py-5 rounded-lg uppercase tracking-widest text-xs hover:bg-black transition-all active:scale-[0.98]" 
                                    type="submit"
                                >
                                    Continue to Payment
                                </button>
                            </form>
                        </section>
                    </div>

                    {/* Right Column: DYNAMIC Order Summary */}
                    <aside className="w-full lg:w-[400px]">
                        <div className="sticky top-28 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center justify-between dark:text-black uppercase tracking-tighter">
                                Order Summary
                                <span className="text-primary text-xs px-2 py-1 bg-primary/5 rounded-full">{cartItems.length} Items</span>
                            </h3>

                            <div className="space-y-4 mb-8 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="flex gap-4 border-b border-slate-50 pb-4">
                                        <div className="w-16 h-20 bg-slate-50 rounded overflow-hidden flex-shrink-0">
                                            <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                        </div>
                                        <div className="flex-1 py-1">
                                            <h4 className="text-[11px] font-bold uppercase dark:text-black truncate leading-tight">{item.name}</h4>
                                            <p className="text-[9px] text-slate-400 mt-0.5">SIZE: {item.size} • QTY: {item.quantity}</p>
                                            <div className="text-[11px] font-bold mt-2 dark:text-black">₹{(item.price || 0).toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                                {/* Shipping Method */}
                                <div className="mb-6 border-t pt-6">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Shipping Method</p>
                                    <div className="space-y-2">
                                        {['Air', 'Surface'].map(m => (
                                            <label key={m} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${shippingMethod === m ? 'border-gray-900 bg-gray-50' : 'border-slate-200 hover:border-gray-400'}`}>
                                                <div className="flex items-center gap-2">
                                                    <input type="radio" name="shippingMethod" value={m} checked={shippingMethod === m} onChange={() => setShippingMethod(m)} className="accent-gray-900" />
                                                    <span className="text-xs font-semibold text-gray-800">{m} Shipping</span>
                                                </div>
                                                <span className="text-xs font-medium text-gray-500">{m === 'Air' ? 'Faster' : 'Standard'}</span>
                                            </label>
                                        ))}
                                        {storeConfig?.codEnabled && (
                                            <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isCOD ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-amber-300'}`}>
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" checked={isCOD} onChange={e => setIsCOD(e.target.checked)} className="accent-amber-500" />
                                                    <span className="text-xs font-semibold text-gray-800">Cash on Delivery</span>
                                                </div>
                                                <span className="text-xs font-medium text-amber-600">+₹{storeConfig?.codFee} + GST</span>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* International DDU Disclaimer */}
                                {zone?.isInternational && zone?.duty_note && (
                                    <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-100">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-1">⚠️ International Order Notice</p>
                                        <p className="text-[10px] text-amber-700 leading-relaxed">{zone.duty_note}</p>
                                    </div>
                                )}

                                {/* Promo Code Section */}
                            <div className="mb-6 border-t pt-6">
                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest">{appliedCoupon.code}</span>
                                            <span className="text-emerald-400 text-[9px] uppercase font-medium">Applied</span>
                                        </div>
                                        <button onClick={handleRemoveCoupon} className="text-emerald-600 hover:text-emerald-800">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="PROMO CODE"
                                                className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-[#10221c]"
                                            />
                                            <button 
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading || !couponCode}
                                                className="bg-[#10221c] text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
                                            >
                                                {couponLoading ? '...' : 'Apply'}
                                            </button>
                                        </div>
                                        {couponError && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest">{couponError}</p>}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 border-t pt-6">
                                <div className="flex justify-between text-[13px] text-slate-500">
                                    <span>Subtotal</span>
                                    <span className="dark:text-black font-semibold">₹{(checkoutTotals?.subtotal || 0).toLocaleString()}</span>
                                </div>
                                
                                {checkoutTotals?.discount > 0 && (
                                    <div className="flex justify-between text-[13px] text-emerald-600 font-medium">
                                        <span>Discount</span>
                                        <span>-₹{(checkoutTotals?.discount || 0).toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-[13px] text-slate-500">
                                    <span>Shipping ({shippingMethod})</span>
                                    {checkoutTotals?.shippingTotal > 0 
                                        ? <span className="dark:text-black font-semibold">₹{checkoutTotals.shippingTotal.toLocaleString()}</span>
                                        : <span className="text-emerald-600 font-bold uppercase text-[9px] tracking-widest">Complimentary</span>
                                    }
                                </div>
                                {isCOD && checkoutTotals?.codFee > 0 && (
                                    <div className="flex justify-between text-[13px] text-amber-600">
                                        <span>COD Fee</span>
                                        <span className="font-semibold">₹{checkoutTotals.codFee.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[13px] text-slate-500">
                                    <span>CGST ({storeConfig?.cgst ?? 9}%)</span>
                                    <span className="dark:text-black font-semibold">₹{(checkoutTotals?.cgst || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[13px] text-slate-500">
                                    <span>SGST ({storeConfig?.sgst ?? 9}%)</span>
                                    <span className="dark:text-black font-semibold">₹{(checkoutTotals?.sgst || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-4 border-t mt-4 dark:text-black items-end">
                                    <span className="uppercase text-xs tracking-widest pb-1">Total</span>
                                    <span className="text-2xl font-black text-[#10221c]">₹{(checkoutTotals?.totalAmount || 0).toLocaleString()}</span>
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