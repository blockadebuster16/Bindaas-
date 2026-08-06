import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCheckout } from '../context/CheckoutContext';
import { useGeo } from '../context/GeoContext';

const CheckoutReviewPay = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { clearCart, cartItems } = useCart();
    const { shippingData, checkoutTotals, clearCheckout, shippingMethod, isCOD, isClimateSelected, setIsClimateSelected, storeConfig } = useCheckout();
    const [processing, setProcessing] = useState(false);
    const { geoData } = useGeo();

    useEffect(() => {
        if (checkoutTotals.totalAmount === 0) {
            navigate('/cart');
            return;
        }
        const logAnalytics = async () => {
            if (user) {
                try {
                    const token = localStorage.getItem("bindass_user_token");
                    const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/analytics`;
                    await axios.post(`${API_BASE}/event`, {
                        eventType: 'checkout_payment_started',
                        pagePath: '/checkout-payment',
                        zone: geoData?.zone?.zone_name || 'UNKNOWN',
                        metadata: { cartCount: cartItems.length }
                    }, { headers: { Authorization: `Bearer ${token}` } });
                } catch (e) { }
            }
        };
        logAnalytics();
    }, [checkoutTotals, navigate, user, geoData, cartItems.length]);

    const handlePlaceOrder = async () => {
        if (!user) return alert("Please sign in.");
        if ((checkoutTotals?.totalAmount || 0) <= 0) {
            return alert("Invalid order total. Please return to cart and try again.");
        }
        if (!window.Razorpay) {
            return alert("Secure payment gateway (Razorpay) failed to load. Please check your internet connection or disable ad-blockers and refresh the page.");
        }
        setProcessing(true);
        try {
            const token = localStorage.getItem("bindass_user_token");
            const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/payments`;
            const { data: order } = await axios.post(`${API_BASE}/create-order`,
                { amount: checkoutTotals.totalAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const options = {
                key: "rzp_test_SawF4zg8SaC3gx",
                amount: order.amount,
                currency: "INR",
                name: "BiNDAAS! Co.",
                description: "Luxury Collection Purchase",
                order_id: order.id,
                handler: async (response) => {
                    try {
                        const verifyResponse = await axios.post(`${API_BASE}/verify-payment`,
                            {
                                ...response,
                                orderDetails: {
                                    cart: cartItems.map(item => ({
                                        id: item._id || item.productId,
                                        name: item.name,
                                        quantity: item.quantity,
                                        price: item.price,
                                        image: item.image,
                                        size: item.size
                                    })),
                                    amount: checkoutTotals.totalAmount,
                                    climateContribution: checkoutTotals.climateFee || 0,
                                    shippingInfo: shippingData
                                }
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        await clearCart();
                        clearCheckout();
                        navigate('/success', {
                            state: {
                                order: verifyResponse.data.order || {
                                    id: response.razorpay_order_id,
                                    amount: checkoutTotals.totalAmount,
                                    items: cartItems
                                }
                            }
                        });
                    } catch (err) {
                        console.error("Order verification failed:", err);
                        alert("Payment successful but order verification failed. Support has been notified.");
                    }
                },
                prefill: {
                    name: `${shippingData.firstName} ${shippingData.lastName}`,
                    email: shippingData.email,
                    contact: shippingData.phone
                },
                theme: { color: "#111111" },
                modal: { ondismiss: () => setProcessing(false) }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Payment initiation error:", error);
            const errMsg = error.response?.data?.message || "Failed to initialize payment.";
            alert(`${errMsg} Please try again.`);
            setProcessing(false);
        }
    };

    return (
        <div className="bg-[#FAFAF9] min-h-screen font-sans">
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                {/* Progress Steps */}
                <div className="mb-10 max-w-sm mx-auto">
                    <div className="flex items-center gap-0">
                        <div className="flex flex-col items-center cursor-pointer group" onClick={() => navigate('/checkout')}>
                            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                <span className="material-icons text-sm">check</span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mt-1.5">Shipping</span>
                        </div>
                        <div className="flex-1 h-px bg-emerald-200 mx-3 mt-[-14px]" />
                        <div className="flex flex-col items-center">
                            <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-black shadow-md">2</div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#111111] mt-1.5">Review & Pay</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
                    {/* ── Left: Review ── */}
                    <div className="flex-1 min-w-0 space-y-6">
                        <div>
                            <h1 className="text-2xl font-black text-[#111111] tracking-tight mb-1">Review Your Order</h1>
                            <p className="text-sm text-slate-400 font-medium">Confirm everything looks right before payment.</p>
                        </div>

                        {/* Shipping + Payment cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Shipping Summary */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-full -mr-8 -mt-8" />
                                <div className="flex justify-between items-start mb-4 relative">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                                            <span className="material-icons text-slate-600 text-sm">local_shipping</span>
                                        </div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Delivery To</h3>
                                    </div>
                                    <button onClick={() => navigate('/checkout')} className="text-[9px] font-black uppercase tracking-widest text-[#111111] border-b border-[#111111]/20 hover:border-[#111111] transition-colors pb-px">Edit</button>
                                </div>
                                <p className="text-sm font-black text-[#111111] mb-1 uppercase tracking-tight">{shippingData.firstName} {shippingData.lastName}</p>
                                <div className="text-[11px] text-slate-500 space-y-0.5 font-medium leading-relaxed">
                                    <p>{shippingData.addressLine1}</p>
                                    <p>{shippingData.city}, {shippingData.pincode}</p>
                                    <p>{shippingData.countryCode === 'IN' ? 'India' : 'International'}</p>
                                    <p className="pt-2 font-bold text-[#111111] flex items-center gap-1.5">
                                        <span className="material-icons text-xs opacity-40">phone</span>
                                        {shippingData.phone}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Security */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-full -mr-8 -mt-8" />
                                <div className="flex items-center gap-2 mb-4 relative">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <span className="material-icons text-emerald-600 text-sm">shield</span>
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Secure Payment</h3>
                                </div>
                                <p className="text-sm font-black text-[#111111] mb-0.5">Razorpay Gateway</p>
                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-3">Cards · UPI · Netbanking</p>
                                <div className="flex gap-3 items-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-2.5 w-auto" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 w-auto" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-3 w-auto" />
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111]">
                                    Your Pieces <span className="text-slate-400 font-bold">({cartItems.length})</span>
                                </h3>
                                <Link to="/cart" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-[#111111] border-b border-transparent hover:border-[#111111] transition-all pb-px">Modify Bag</Link>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {cartItems.map((item, idx) => (
                                    <div key={idx} className="px-6 py-5 flex gap-5 items-center hover:bg-slate-50/50 transition-colors">
                                        <div className="w-16 h-20 bg-[#F5F5F5] rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h4 className="text-[11px] font-black uppercase tracking-tight text-[#111111] leading-tight mb-1 truncate">{item.name}</h4>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.size} · Qty {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-black text-[#111111] flex-shrink-0">₹{(item.price || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Summary + CTA ── */}
                    <aside className="w-full lg:w-[380px] flex-shrink-0">
                        <div className="sticky top-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            {/* Processing overlay */}
                            {processing && (
                                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
                                    <div className="w-10 h-10 border-3 border-[#111111]/20 border-t-[#111111] rounded-full animate-spin" style={{ borderWidth: '3px' }} />
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#111111] animate-pulse">Opening Secure Gateway...</p>
                                </div>
                            )}

                            <div className="px-6 pt-6 pb-4 border-b border-slate-50">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#111111]">Order Totals</h3>
                            </div>

                            <div className="px-6 py-5 space-y-3">
                                <div className="flex justify-between text-[12px] text-slate-500">
                                    <span className="font-medium">Subtotal</span>
                                    <span className="font-bold text-[#111111]">₹{(checkoutTotals?.subtotal || 0).toLocaleString()}</span>
                                </div>
                                {(checkoutTotals?.discount || 0) > 0 && (
                                    <div className="flex justify-between text-[12px] text-emerald-600">
                                        <span className="font-medium">Discount</span>
                                        <span className="font-bold">-₹{(checkoutTotals?.discount || 0).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[12px] text-slate-500">
                                    <span className="font-medium">Shipping ({shippingMethod})</span>
                                    {(checkoutTotals?.shippingTotal ?? 0) > 0
                                        ? <span className="font-bold text-[#111111]">₹{checkoutTotals.shippingTotal.toLocaleString()}</span>
                                        : <span className="text-emerald-600 font-black text-[9px] uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Free</span>
                                    }
                                </div>
                                {isCOD && (checkoutTotals?.codFee ?? 0) > 0 && (
                                    <div className="flex justify-between text-[12px] text-amber-600">
                                        <span className="font-medium">COD Fee</span>
                                        <span className="font-bold">₹{checkoutTotals.codFee.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[12px] text-slate-500">
                                    <span className="font-medium">CGST</span>
                                    <span className="font-bold text-[#111111]">₹{(checkoutTotals?.cgst || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[12px] text-slate-500 pb-3 border-b border-slate-100">
                                    <span className="font-medium">SGST</span>
                                    <span className="font-bold text-[#111111]">₹{(checkoutTotals?.sgst || 0).toLocaleString()}</span>
                                </div>

                                {storeConfig?.climateFeeEnabled && (
                                    <div className="flex justify-between text-[12px]">
                                        <span className="font-medium text-emerald-700">ðŸŒ¿ Climate Action</span>
                                        {isClimateSelected
                                            ? <span className="font-bold text-emerald-700">₹{storeConfig.climateFeeAmount}</span>
                                            : <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Opted Out</span>
                                        }
                                    </div>
                                )}

                                <div className="flex justify-between items-end pt-2 mt-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grand Total</span>
                                    <span className="text-2xl font-black text-[#111111] leading-none">₹{(checkoutTotals?.totalAmount || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="px-6 pb-6 space-y-3">
                                {/* Climate nudge */}
                                {storeConfig?.climateFeeEnabled && (
                                    <label className={`flex gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${isClimateSelected ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50/50 opacity-70'}`}>
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${isClimateSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                                                {isClimateSelected && <span className="material-icons text-white text-[8px]">check</span>}
                                            </div>
                                            <input type="checkbox" checked={isClimateSelected} onChange={e => setIsClimateSelected(e.target.checked)} className="hidden" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800 mb-0.5">ðŸŒ¿ Climate Action — ₹{storeConfig.climateFeeAmount}</p>
                                            <p className="text-[9px] text-emerald-700 leading-relaxed">
                                                Offset your delivery's carbon footprint. Supports <strong>{storeConfig.climateFeeCause}</strong>.
                                            </p>
                                        </div>
                                    </label>
                                )}

                                {/* CTA */}
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={processing}
                                    className="w-full bg-[#111111] text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.25em] hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                                >
                                    <span className="material-icons text-sm">lock</span>
                                    <span>Place Your Order</span>
                                </button>

                                <p className="text-[9px] text-slate-400 text-center font-medium leading-relaxed">
                                    Encrypted & secured by Razorpay.{' '}
                                    <Link to="/" className="underline hover:text-[#111111] transition-colors">Refund Policy</Link>
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default CheckoutReviewPay;




