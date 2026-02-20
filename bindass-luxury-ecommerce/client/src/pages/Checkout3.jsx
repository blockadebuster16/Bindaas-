import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ReviewOrder = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // 1. Load Actual Data from LocalStorage
    const cartItems = JSON.parse(localStorage.getItem('bindass_cart')) || [];
    const shippingData = JSON.parse(localStorage.getItem('shipping_info')) || {};
    const paymentData = JSON.parse(localStorage.getItem('payment_info')) || { type: 'Not Selected', lastFour: 'XXXX' };
    const totals = JSON.parse(localStorage.getItem('checkout_totals')) || { subtotal: 0, tax: 0, totalAmount: 0 };

    const handlePlaceOrder = async () => {
        try {
            const token = await user.getIdToken();

            // 2. Create Razorpay Order
            const { data: order } = await axios.post('http://localhost:5001/api/payments/create-order',
                { amount: totals.totalAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const options = {
                key: "YOUR_RAZORPAY_KEY_ID", // Replace with your rzp_test_... key
                amount: order.amount,
                currency: "INR",
                name: "BINDASS!! Co.",
                order_id: order.id,
                handler: async (res) => {
                    // 3. Verify Payment on Backend
                    const verifyResponse = await axios.post('http://localhost:5001/api/payments/verify-payment',
                        { ...res, cart: cartItems, shipping: shippingData },
                        { headers: { Authorization: `Bearer ${token}` } });

                    // 4. Clear temporary session data
                    localStorage.removeItem('bindass_cart');
                    localStorage.removeItem('shipping_info');
                    localStorage.removeItem('payment_info');
                    localStorage.removeItem('checkout_totals');

                    // 5. Navigate to Success page with real order data
                    navigate('/success', { state: { order: verifyResponse.data.order } });
                },
                prefill: {
                    name: `${shippingData.firstName} ${shippingData.lastName}`,
                    email: shippingData.email,
                },
                theme: { color: "#10221c" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (e) {
            console.error("Order failed:", e);
            alert("Could not process order. Please try again.");
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Progress Stepper */}
                <div className="mb-12 max-w-3xl">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/10 -z-10 -translate-y-1/2"></div>
                        <div className="flex flex-col items-center gap-2 bg-background-light pr-4 cursor-pointer" onClick={() => navigate('/checkout')}>
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/20">
                                <i className="material-icons text-sm">check</i>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Shipping</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 bg-background-light px-4 cursor-pointer" onClick={() => navigate('/checkout/payment')}>
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/20">
                                <i className="material-icons text-sm">check</i>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Payment</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 bg-background-light pl-4">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/20">3</div>
                            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Review</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column: Review Details */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <h1 className="text-3xl dark:text-black font-bold mb-2">Review Your Order</h1>
                            <p className="text-slate-500 dark:text-slate-400">Please verify your details before placing the order.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shipping Address - DYNAMIC */}
                            <div className="bg-white dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-800 relative group transition-all hover:shadow-md">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-xs uppercase tracking-widest dark:text-black">Shipping Address</h3>
                                    <button onClick={() => navigate('/checkout')} className="text-primary text-xs font-bold hover:underline uppercase tracking-wide">Edit</button>
                                </div>
                                <p className="text-lg font-bold mb-1">{shippingData.firstName} {shippingData.lastName}</p>
                                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                    <p>{shippingData.address}</p>
                                    <p>{shippingData.city}, {shippingData.postalCode}</p>
                                    <p>{shippingData.country}</p>
                                    <p className="pt-2 font-medium text-slate-900 dark:text-slate-200">{shippingData.phone}</p>
                                </div>
                            </div>

                            {/* Payment Method - DYNAMIC */}
                            <div className="bg-white dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-800 relative group transition-all hover:shadow-md">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-xs uppercase tracking-widest dark:text-black">Payment Method</h3>
                                    <button onClick={() => navigate('/checkout/payment')} className="text-primary text-xs font-bold hover:underline uppercase tracking-wide">Edit</button>
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-100">
                                        <span className="material-icons text-slate-400">credit_card</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{paymentData.method || 'Card'} •••• {paymentData.lastFour}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide underline decoration-emerald-500">Authorized for Transaction</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bag Items - DYNAMIC */}
                        <div className="bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-sm uppercase tracking-widest">Your Bag ({cartItems.length})</h3>
                                <Link to="/cart" className="text-primary text-xs font-bold hover:underline uppercase tracking-wide">Edit Bag</Link>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {cartItems.map((item, idx) => (
                                    <div key={idx} className="p-6 flex gap-6">
                                        <div className="w-20 h-24 bg-background-light rounded overflow-hidden flex-shrink-0 border border-slate-100">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow flex flex-col justify-between py-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-sm font-bold uppercase">{item.name}</h4>
                                                <p className="font-bold text-sm">₹{item.price.toLocaleString()}</p>
                                            </div>
                                            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold">Size: {item.size} • Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary - DYNAMIC */}
                    <aside className="w-full lg:w-[400px]">
                        <div className="sticky top-28 dark:text-black bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center justify-between uppercase tracking-tighter">Final Summary</h3>
                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Subtotal</span>
                                    <span>₹{totals.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Shipping</span>
                                    <span className="text-emerald-600 font-bold uppercase text-xs">Complimentary</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Estimated Tax (8%)</span>
                                    <span>₹{totals.tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold pt-4 text-slate-900 border-t border-slate-100 mt-4">
                                    <span>Total</span>
                                    <span className="text-primary font-black">₹{totals.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <button onClick={handlePlaceOrder} className="w-full bg-[#10221c] text-white font-bold py-5 rounded-lg uppercase tracking-[0.2em] text-sm transition-all shadow-lg hover:bg-black active:scale-95 flex items-center justify-center space-x-2">
                                <span>Place Order</span>
                                <span className="material-icons text-sm">check_circle</span>
                            </button>
                        </div>
                    </aside>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ReviewOrder;