import React, { useEffect, useState } from 'react'; // useState kept for `processing`
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
        // Safety: If no totals, go back to cart
        if (checkoutTotals.totalAmount === 0) {
            navigate('/cart');
            return;
        }

        // Analytics Hook
        const logAnalytics = async () => {
            if (user) {
                try {
                     const token = await user.getIdToken();
                     const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5001/api/analytics' : '/api/analytics';
                     await axios.post(`${API_BASE}/event`, {
                         eventType: 'checkout_payment_started',
                         pagePath: '/checkout-payment',
                         zone: geoData?.zone?.zone_name || 'UNKNOWN',
                         metadata: { cartCount: cartItems.length }
                     }, { headers: { Authorization: `Bearer ${token}` } });
                } catch(e) {}
            }
        };
        logAnalytics();

    }, [checkoutTotals, navigate, user, geoData, cartItems.length]);


    const handlePlaceOrder = async () => {
        if (!user) return alert("Please sign in.");
        
        // Safety check: ensure total is valid
        if ((checkoutTotals?.totalAmount || 0) <= 0) {
            return alert("Invalid order total. Please return to cart and try again.");
        }

        if (!window.Razorpay) {
            return alert("Secure payment gateway (Razorpay) failed to load. Please check your internet connection or disable ad-blockers and refresh the page.");
        }
        
        setProcessing(true);
        try {
            const token = await user.getIdToken();

            // Dynamic API URL for Payment Routes
            const API_BASE = window.location.hostname === 'localhost' 
                ? 'http://localhost:5001/api/payments' 
                : '/api/payments';

            // 1. Create Order on Server
            const { data: order } = await axios.post(`${API_BASE}/create-order`,
                { amount: checkoutTotals.totalAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 2. Razorpay Options
            const options = {
                key: "rzp_test_SawF4zg8SaC3gx", // Should ideally be injected via ENV or returned by server
                amount: order.amount,
                currency: "INR",
                name: "BINDASS!! Co.",
                description: "Luxury Collection Purchase",
                order_id: order.id,
                handler: async (response) => {
                    try {
                        // 3. Verify Payment
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

                        // 4. Navigate to Success
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
                theme: { color: "#10221c" },
                modal: {
                    ondismiss: () => setProcessing(false)
                }
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
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen">
            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Simplified 2-Step Stepper */}
                <div className="mb-12 max-w-xl mx-auto">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/10 -z-10 -translate-y-1/2"></div>
                        <div className="flex flex-col items-center gap-2 bg-background-light pr-8 cursor-pointer group" onClick={() => navigate('/checkout')}>
                            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-110">
                                <i className="material-icons text-sm">check</i>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Shipping</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 bg-background-light pl-8">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/20 scale-110">2</div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Review & Pay</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column: Final Review */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold dark:text-black mb-2 uppercase tracking-tighter">Finalize Your Acquisition</h1>
                            <p className="text-slate-500 text-sm font-medium">Please review your shipment details before secure payment.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shipping Summary */}
                            <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                                <div className="flex justify-between items-center mb-6 relative">
                                    <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-400">Shipment Details</h3>
                                    <button onClick={() => navigate('/checkout')} className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">Edit</button>
                                </div>
                                <p className="text-lg font-bold mb-2 uppercase tracking-tight">{shippingData.firstName} {shippingData.lastName}</p>
                                <div className="text-sm text-slate-600 space-y-1 font-medium italic">
                                    <p className="flex items-center gap-2 not-italic underline underline-offset-4 decoration-slate-200 decoration-2">{shippingData.addressLine1}</p>
                                    <p className="pl-5">{shippingData.city}, {shippingData.pincode}</p>
                                    <p className="pl-5">{shippingData.countryCode === 'IN' ? 'India' : 'International'}</p>
                                    <p className="pt-4 flex items-center gap-2 border-t mt-4 border-slate-50 font-bold text-slate-900 not-italic"><i className="material-icons text-xs opacity-40">phone</i> {shippingData.phone}</p>
                                </div>
                            </div>

                            {/* Payment Security Summary */}
                            <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                                <div className="flex justify-between items-center mb-6 relative">
                                    <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-400">Payment Security</h3>
                                    <span className="flex gap-1">
                                        <i className="material-icons text-emerald-500 text-xs">verified_user</i>
                                        <i className="material-icons text-emerald-500 text-xs">lock</i>
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                                        <i className="material-icons text-2xl">shield</i>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm uppercase tracking-tight">Razorpay Secure</p>
                                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Cards, UPI, Netbanking</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mb-4 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="visa" className="h-2 w-auto" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="mc" className="h-3 w-auto" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="upi" className="h-2 w-auto" />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium italic border-t pt-4 border-slate-50 leading-relaxed">Payments are processed securely via encrypted gateway. We never store your card details.</p>
                            </div>
                        </div>

                        {/* Item Review Table */}
                        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                            <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#10221c]">Selected Pieces ({cartItems.length})</h3>
                                <Link to="/cart" className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">Modify Bag</Link>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {cartItems.map((item, idx) => (
                                    <div key={idx} className="px-8 py-6 flex gap-6 items-center">
                                        <div className="w-16 h-20 bg-slate-50 rounded overflow-hidden flex-shrink-0 border border-slate-100">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-xs font-bold uppercase tracking-tight text-[#10221c] leading-tight mb-1">{item.name}</h4>
                                                <p className="font-bold text-sm">₹{(item.price || 0).toLocaleString()}</p>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Size: {item.size} • Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Final Summary & CTA */}
                    <aside className="w-full lg:w-[400px]">
                        <div className="sticky top-28 bg-white p-8 rounded-xl border border-slate-200 shadow-xl overflow-hidden relative">
                            {processing && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary animate-pulse">Initializing Portal...</p>
                                </div>
                            )}
                            
                            <h3 className="text-lg font-extrabold mb-6 flex items-center justify-between dark:text-black uppercase tracking-tighter">
                                Acquisition Totals
                            </h3>

                            <div className="space-y-4 mb-10">
                                <div className="flex justify-between text-[13px] text-slate-500">
                                    <span className="font-medium">Subtotal</span>
                                    <span className="dark:text-black font-bold text-sm">₹{(checkoutTotals?.subtotal || 0).toLocaleString()}</span>
                                </div>
                                {(checkoutTotals?.discount || 0) > 0 && (
                                    <div className="flex justify-between text-[13px] text-emerald-600 font-medium">
                                        <span className="font-medium">Discount</span>
                                        <span className="font-bold text-sm">-₹{(checkoutTotals?.discount || 0).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[13px] text-slate-500">
                                    <span className="font-medium">Shipping ({shippingMethod})</span>
                                    {(checkoutTotals?.shippingTotal ?? 0) > 0
                                        ? <span className="dark:text-black font-bold text-sm">₹{checkoutTotals.shippingTotal.toLocaleString()}</span>
                                        : <span className="text-emerald-700 font-black uppercase text-[9px] tracking-[0.2em] bg-emerald-50 px-2 py-1 rounded">Complimentary</span>
                                    }
                                </div>
                                {isCOD && (checkoutTotals?.codFee ?? 0) > 0 && (
                                    <div className="flex justify-between text-[13px] text-amber-600">
                                        <span className="font-medium">COD Collection Fee</span>
                                        <span className="font-bold text-sm">₹{checkoutTotals.codFee.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[13px] text-slate-500 border-b border-slate-50 pb-4">
                                    <span className="font-medium">CGST</span>
                                    <span className="dark:text-black font-bold text-sm">₹{(checkoutTotals?.cgst || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[13px] text-slate-500 border-b border-slate-50 pb-4">
                                    <span className="font-medium">SGST</span>
                                    <span className="dark:text-black font-bold text-sm">₹{(checkoutTotals?.sgst || 0).toLocaleString()}</span>
                                </div>
                                {/* Climate Action Fee */}
                                {storeConfig?.climateFeeEnabled && (
                                    <div className="flex justify-between text-[13px] border-b border-slate-50 pb-4">
                                        <span className="font-medium text-emerald-700">🌿 Climate Action</span>
                                        {isClimateSelected
                                            ? <span className="font-bold text-sm text-emerald-700">₹{storeConfig.climateFeeAmount}</span>
                                            : <span className="text-slate-400 text-[10px] font-bold uppercase">Opted Out</span>
                                        }
                                    </div>
                                )}
                                <div className="flex justify-between text-2xl font-black pt-4 text-[#10221c] items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-1">Grand Total</span>
                                        <span className="leading-none">₹{(checkoutTotals?.totalAmount || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ── Climate Action Nudge ── */}
                            {storeConfig?.climateFeeEnabled && (
                                <label className={`flex gap-3 p-4 rounded-xl border cursor-pointer mb-4 transition-all ${
                                    isClimateSelected
                                        ? 'border-emerald-200 bg-emerald-50'
                                        : 'border-slate-100 bg-white opacity-60'
                                }`}>
                                    <div className="flex-shrink-0 pt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={isClimateSelected}
                                            onChange={e => setIsClimateSelected(e.target.checked)}
                                            className="accent-emerald-600 w-4 h-4"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-800 mb-1">🌿 Climate Action — ₹{storeConfig.climateFeeAmount}</p>
                                        <p className="text-[10px] text-emerald-700 leading-relaxed">
                                            Contribute ₹{storeConfig.climateFeeAmount} to offset the carbon footprint of your delivery.
                                            This supports <strong>{storeConfig.climateFeeCause}</strong> and is non-refundable.
                                        </p>
                                    </div>
                                </label>
                            )}

                            <button 
                                onClick={handlePlaceOrder}
                                disabled={processing}
                                className={`w-full py-6 rounded-lg uppercase tracking-[0.3em] text-[11px] font-black transition-all flex items-center justify-center space-x-3 shadow-lg shadow-[#10221c]/20 ${
                                    processing 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                    : 'bg-[#10221c] text-white hover:bg-black active:scale-95'
                                }`}
                            >
                                <span>Place Your Order</span>
                                <i className="material-icons text-sm">lock</i>
                            </button>
                            
                            <p className="text-[10px] text-slate-400 text-center mt-6 font-medium italic opacity-60 px-4">
                                Secure transaction powered by Razorpay. View our <Link to="/" className="underline">Refund Policy</Link>.
                            </p>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default CheckoutReviewPay;
