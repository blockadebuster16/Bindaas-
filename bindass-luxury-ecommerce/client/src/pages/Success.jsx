import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Success = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        // Retrieve order details passed from the Checkout process
        if (location.state?.order) {
            setOrderData(location.state.order);
        }
    }, [location]);

    // Derived Status for a premium feel
    const orderId = orderData?.id || orderData?._id || `LC-${Math.floor(Math.random() * 900000) + 100000}`;
    const paidAmount = orderData?.amount || orderData?.totalAmount || 0;
    const items = orderData?.items || [];

    return (
        <div className="bg-white min-h-screen font-['Work_Sans']">
            <main className="max-w-5xl mx-auto px-6 py-20 animate-fade-in-up">
                
                {/* Success Header Area */}
                <div className="text-center mb-16 space-y-4">
                    <div className="relative inline-block mb-6">
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center animate-pulse">
                            <i className="material-icons text-5xl text-emerald-500">check_circle</i>
                        </div>
                        <div className="absolute -inset-2 border border-emerald-100 rounded-full animate-ping opacity-20" />
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-black text-[#10221c] tracking-tighter uppercase leading-none">
                        Acquisition Confirmed
                    </h1>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.2em]">
                        Order #{orderId.toString().toUpperCase()}
                    </p>
                    <div className="max-w-md mx-auto pt-4">
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Thank you for your trust, <span className="text-[#10221c] font-black">{user?.displayName?.split(' ')?.[0] || 'valued member'}</span>. 
                            Your luxury selection is now being prepared for express delivery.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    
                    {/* Left: Product & Shipping Review */}
                    <div className="lg:col-span-7 space-y-12">
                        
                        {/* Items Receipt */}
                        <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#10221c] border-b border-slate-100 pb-4 mb-8">
                                Selected Pieces
                            </h3>
                            <div className="space-y-8">
                                {items.length > 0 ? (
                                    items.map((item, idx) => (
                                        <div key={idx} className="flex gap-8 group">
                                            <div className="w-24 h-32 bg-[#faf9f8] rounded-sm overflow-hidden flex-shrink-0 border border-slate-100 group-hover:shadow-lg transition-all duration-500">
                                                <img 
                                                    src={item.image || 'https://via.placeholder.com/200'} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                            <div className="flex-grow flex flex-col justify-between py-2">
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-black uppercase tracking-tight text-[#10221c]">{item.name}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                        Size: {item.size} • Quantity: {item.quantity}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-black text-[#10221c]">₹{(item.price || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center border border-dashed border-slate-100 rounded-lg bg-slate-50/30">
                                        <p className="text-slate-400 italic text-[11px] uppercase tracking-widest">
                                            Digital receipt arriving shortly in your inbox.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Info Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10221c] mb-6">Shipping Destination</h3>
                                <div className="p-6 bg-[#faf9f8] border border-slate-100 rounded-sm">
                                    <p className="text-xs font-black uppercase text-[#10221c] mb-2">
                                        {orderData?.shippingInfo?.firstName} {orderData?.shippingInfo?.lastName}
                                    </p>
                                    <div className="text-[11px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
                                        <p>{orderData?.shippingInfo?.addressLine1 || 'Delivery address confirmed'}</p>
                                        <p>{orderData?.shippingInfo?.city} {orderData?.shippingInfo?.pincode}</p>
                                        <p className="mt-4 flex items-center gap-1 text-emerald-600 font-black">
                                            <i className="material-icons text-xs">local_shipping</i> Express Insured
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10221c] mb-6">Secure Transaction</h3>
                                <div className="p-6 bg-[#faf9f8] border border-slate-100 rounded-sm">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Payment Method</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-slate-100 flex items-center justify-center p-2">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="upi" className="w-full h-auto" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-[#10221c] uppercase">Razorpay Secure</p>
                                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest leading-none">Auth: Confirmed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary Card */}
                    <div className="lg:col-span-5">
                        <div className="bg-[#10221c] text-white p-10 rounded-sm sticky top-28 shadow-2xl">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-10 text-emerald-500">Summary</h3>
                            
                            <div className="space-y-6 mb-12">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                                    <span>Investment Subtotal</span>
                                    <span>₹{(paidAmount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                                    <span>Shipping & Insurance</span>
                                    <span>Complimentary</span>
                                </div>
                                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                                    <div>
                                        <p className="text-[8px] font-bold uppercase tracking-[0.4em] opacity-40 mb-1">Final Amount Paid</p>
                                        <p className="text-3xl font-black tracking-tighter leading-none">₹{(paidAmount || 0).toLocaleString()}</p>
                                    </div>
                                    <i className="material-icons text-white/20 text-4xl">receipt_long</i>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Link to="/profile" className="block">
                                    <button className="w-full bg-emerald-500 text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                                        Track Acquisition
                                    </button>
                                </Link>
                                <Link to="/" className="block">
                                    <button className="w-full bg-transparent border border-white/20 text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all">
                                        Continue Exploring
                                    </button>
                                </Link>
                            </div>

                            <p className="mt-10 text-[9px] text-white/30 text-center font-medium leading-relaxed italic">
                                A copy of this receipt has been dispatched to your encrypted email {user?.email}.
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Success;