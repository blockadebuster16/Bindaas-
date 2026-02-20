import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Success = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        // Retrieve order details passed from the Cart checkout
        if (location.state?.order) {
            setOrderData(location.state.order);
        }
    }, [location]);

    return (
        <main className="max-w-5xl mx-auto px-6 py-12 font-['Work_Sans'] bg-white">
            {/* Success Banner */}
            <section className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-6">
                    <span className="material-icons text-emerald-500 text-5xl">check_circle</span>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Thank you for your order!</h1>
                <p className="text-slate-600 text-lg mb-2 uppercase tracking-widest text-xs font-bold">
                    Order #{orderData?.id || "LC-" + Math.floor(Math.random() * 1000000)}
                </p>
                <p className="text-slate-500">
                    A confirmation email has been sent to <span className="font-medium text-slate-800">{user?.email}</span>
                </p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Order Details */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-xl font-bold mb-6 flex items-center border-b border-slate-100 pb-4 uppercase tracking-tighter">
                            Order Details
                        </h2>
                        <div className="space-y-6">
                            {/* Static mapping for UI preview, in production map orderData.items */}
                            <div className="flex space-x-6 pb-6 border-b border-slate-50">
                                <div className="w-32 h-40 bg-slate-100 rounded-sm overflow-hidden flex-shrink-0">
                                    <img alt="Polo" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf9CfeJOeAtgBmqa1rWbt7wdDPXWoPV7M9PPeqaLwIIrWZ-Yy5ZXuKSd6DLqhYFggKQTwiPF9XgdHRLg-Pt1vdSCxti67luVfHOuAk-dS49DOKkUiyf0RXiYp9WgqvAllOzi16GegNbl31qYlrPVtZywlUmaePaCctIuxKBOUlNpdoS7nAc3JRjxxFAtsRC_MqDCQs7StAywsiukKcYg-YdiXMSaeoIv787tU3OrPf2WqV0XK50UVWcfWLyk-bXnZLUg9ccve4gQQT" />
                                </div>
                                <div className="flex-grow flex flex-col justify-between py-2">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1 tracking-tight uppercase">Luxury Essential Piece</h3>
                                        <p className="text-slate-500 text-xs uppercase tracking-widest">Size: M</p>
                                        <p className="text-slate-500 text-xs mt-2 uppercase font-bold tracking-widest">Qty: 1</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-lg">₹{(orderData?.amount || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Information Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-[#f8f9f8] p-6 rounded-sm border border-slate-100">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Shipping Address</h4>
                            <p className="text-slate-800 font-medium uppercase text-xs">{user?.displayName}</p>
                            <p className="text-slate-600 text-xs">Standard Luxury Delivery</p>
                            <p className="text-slate-600 text-xs">Awaiting Shipment</p>
                        </div>
                        <div className="bg-[#f8f9f8] p-6 rounded-sm border border-slate-100">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Delivery Status</h4>
                            <p className="text-xs text-slate-500 uppercase tracking-tighter">Method</p>
                            <p className="text-slate-800 font-bold text-xs uppercase mb-2">Express Premium</p>
                            <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest">Est: 3-5 Business Days</p>
                        </div>
                    </section>
                </div>

                {/* Right Column: Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-slate-100 rounded-sm p-8 sticky top-28 shadow-sm">
                        <h3 className="text-xl font-bold mb-8 uppercase tracking-tighter">Summary</h3>
                        <div className="space-y-4 text-sm mb-8">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Paid Amount</span>
                                <span className="font-bold">₹{(orderData?.amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Shipping</span>
                                <span className="text-emerald-600 font-bold">FREE</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Link to="/profile">
                                <button className="w-full bg-[#10221c] text-white py-4 rounded-sm font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all mb-4">
                                    Track My Order
                                </button>
                            </Link>
                            <Link to="/">
                                <button className="w-full bg-white border border-slate-200 text-slate-900 py-4 rounded-sm font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">
                                    Continue Shopping
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Success;