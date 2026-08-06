import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Success = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [orderData, setOrderData] = useState(null);
    const [confettiDone, setConfettiDone] = useState(false);

    useEffect(() => {
        if (location.state?.order) {
            setOrderData(location.state.order);
        }
        const timer = setTimeout(() => setConfettiDone(true), 2000);
        return () => clearTimeout(timer);
    }, [location]);

    const orderId = orderData?.id || orderData?._id || `BD-${Math.floor(Math.random() * 900000) + 100000}`;
    const paidAmount = orderData?.amount || orderData?.totalAmount || 0;
    const items = orderData?.items || [];
    const firstName = user?.displayName?.split(' ')?.[0] || 'there';

    return (
        <div className="bg-[#FAFAF9] min-h-screen font-sans">
            {/* Minimal brand header */}
            <div className="border-b border-slate-100 bg-white">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="text-xl font-black tracking-tight text-[#111111]">BiNDAAS!</Link>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                        <span className="material-icons text-xs">check_circle</span>
                        Order Confirmed
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
                {/* Success Hero */}
                <div className="text-center mb-12">
                    {/* Animated checkmark */}
                    <div className="relative inline-flex items-center justify-center mb-6">
                        <div className={`w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 transition-all duration-700 ${confettiDone ? 'scale-100 opacity-100' : 'scale-90 opacity-80'}`}>
                            <span className="material-icons text-white text-4xl">check</span>
                        </div>
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-200 animate-ping opacity-30" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-[#111111] tracking-tight leading-tight mb-2">
                        Order Confirmed!
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mb-1">
                        Hey {firstName} 👋 — your order is on its way.
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                        Order #{orderId.toString().toUpperCase()}
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                    {/* Left: Items + Shipping */}
                    <div className="lg:col-span-7 space-y-5">

                        {/* Items */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#111111]">Your Pieces</h2>
                                {items.length > 0 && (
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{items.length} item{items.length > 1 ? 's' : ''}</span>
                                )}
                            </div>
                            <div className="divide-y divide-slate-50">
                                {items.length > 0 ? (
                                    items.map((item, idx) => (
                                        <div key={idx} className="px-6 py-5 flex gap-5 hover:bg-slate-50/50 transition-colors">
                                            <div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#F5F5F5] border border-slate-100">
                                                <img
                                                    src={item.image || 'https://via.placeholder.com/200'}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover object-top"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                                                <div>
                                                    <h4 className="text-[11px] font-black uppercase tracking-tight text-[#111111] leading-tight truncate">{item.name}</h4>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Size {item.size} · Qty {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-black text-[#111111]">₹{(item.price || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-6 py-10 text-center">
                                        <span className="material-icons text-slate-200 text-4xl mb-3">inbox</span>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            Digital receipt arriving in your inbox shortly.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Shipping + Payment Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Shipping destination */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <span className="material-icons text-slate-500 text-sm">local_shipping</span>
                                    </div>
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Shipping To</h3>
                                </div>
                                <p className="text-[11px] font-black text-[#111111] uppercase tracking-tight mb-1.5">
                                    {orderData?.shippingInfo?.firstName} {orderData?.shippingInfo?.lastName}
                                </p>
                                <div className="text-[10px] text-slate-500 space-y-0.5 font-medium leading-relaxed">
                                    <p>{orderData?.shippingInfo?.addressLine1 || 'Address confirmed'}</p>
                                    <p>{orderData?.shippingInfo?.city} {orderData?.shippingInfo?.pincode}</p>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-1.5">
                                    <span className="material-icons text-emerald-500 text-xs">verified</span>
                                    <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">Express & Insured</p>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <span className="material-icons text-emerald-600 text-sm">shield</span>
                                    </div>
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Payment</h3>
                                </div>
                                <p className="text-[11px] font-black text-[#111111] uppercase tracking-tight mb-0.5">Razorpay Secure</p>
                                <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mb-3">Transaction Verified</p>
                                <div className="flex gap-3 items-center opacity-60">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-2 w-auto" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-3 w-auto" />
                                </div>
                            </div>
                        </div>

                        {/* What's next */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#111111] mb-4">What Happens Next?</h3>
                            <div className="space-y-4">
                                {[
                                    { icon: 'email', title: 'Confirmation Email', desc: 'An order receipt has been sent to your registered email.', color: 'bg-blue-100 text-blue-600' },
                                    { icon: 'inventory_2', title: 'Order Processing', desc: 'Your pieces are being quality-checked and packed with care.', color: 'bg-amber-100 text-amber-600' },
                                    { icon: 'local_shipping', title: 'Dispatch & Delivery', desc: 'Express tracked shipping. You\'ll receive a tracking link.', color: 'bg-emerald-100 text-emerald-600' },
                                ].map((step, idx) => (
                                    <div key={idx} className="flex gap-3 items-start">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                                            <span className="material-icons text-sm">{step.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-[#111111] uppercase tracking-tight">{step.title}</p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary card */}
                    <div className="lg:col-span-5">
                        <div className="bg-[#111111] text-white rounded-2xl p-8 sticky top-8 shadow-2xl shadow-black/20">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                                    <span className="material-icons text-white text-sm">receipt_long</span>
                                </div>
                                <h3 className="text-[9px] font-black uppercase tracking-[0.35em] text-white/60">Order Receipt</h3>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-[11px] font-bold text-white/60 uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span>₹{(paidAmount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                                    <span>Shipping & Insurance</span>
                                    <span>Complimentary</span>
                                </div>
                                <div className="pt-5 border-t border-white/10 flex justify-between items-end">
                                    <div>
                                        <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/30 mb-1">Total Paid</p>
                                        <p className="text-3xl font-black leading-none tracking-tight">₹{(paidAmount || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <span className="material-icons text-white/30 text-xl">account_balance_wallet</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <Link to="/profile" className="block">
                                    <button className="w-full bg-white text-[#111111] py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] hover:bg-slate-100 transition-colors">
                                        Track Your Order
                                    </button>
                                </Link>
                                <Link to="/" className="block">
                                    <button className="w-full border border-white/20 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] hover:border-white/40 hover:bg-white/5 transition-all">
                                        Continue Shopping
                                    </button>
                                </Link>
                            </div>

                            <div className="border-t border-white/10 pt-5">
                                <p className="text-[9px] text-white/25 text-center font-medium leading-relaxed">
                                    Receipt sent to <span className="text-white/40">{user?.email}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Success;