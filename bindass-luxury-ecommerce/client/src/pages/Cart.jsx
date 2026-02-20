import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cartItems, removeFromCart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const totalAmount = subtotal + tax;

    const handleCheckout = async () => {
        if (!user) {
            alert("Please sign in to complete your luxury purchase.");
            return;
        }

        if (cartItems.length === 0) {
            alert("Your bag is empty.");
            return;
        }

        try {
            const token = await user.getIdToken();

            // 1. Create Order on Server
            const { data: order } = await axios.post(
                'http://localhost:5001/api/payments/create-order',
                { amount: totalAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 2. Razorpay Options
            const options = {
                key: "YOUR_RAZORPAY_KEY_ID", // Ensure this starts with rzp_test_
                amount: order.amount,
                currency: order.currency,
                name: "BINDASS!! Co.",
                description: "Luxury Collection Purchase",
                order_id: order.id,
                handler: async (response) => {
                    try {
                        // 3. Verify Payment
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            cart: cartItems
                        };

                        await axios.post(
                            'http://localhost:5001/api/payments/verify-payment',
                            verifyData,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        // 4. Clear Cart and Redirect to Success Page
                        await clearCart();

                        // Navigate to the Success design we built, passing order details
                        navigate('/success', {
                            state: {
                                order: {
                                    id: response.razorpay_order_id,
                                    amount: totalAmount,
                                    items: cartItems
                                }
                            }
                        });
                    } catch (err) {
                        console.error("Verification failed:", err);
                        alert("Payment verification failed. Please check your profile for order status.");
                    }
                },
                prefill: {
                    name: user.displayName,
                    email: user.email,
                },
                theme: {
                    color: "#10221c"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Checkout initialization failed:", error);
            alert("Could not initiate checkout. Is the server running?");
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-6 py-12 font-['Manrope'] bg-white min-h-screen">
            <h1 className="text-3xl font-extrabold uppercase tracking-tighter mb-12 text-[#10221c]">
                Your Shopping Bag ({cartItems.length})
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Items */}
                <div className="lg:col-span-8 space-y-8">
                    {cartItems.length > 0 ? (
                        cartItems.map((item) => (
                            <div key={item.cartId} className="flex gap-6 pb-8 border-b border-slate-100 items-center">
                                <div className="w-32 h-40 bg-slate-50 rounded-sm overflow-hidden flex-shrink-0">
                                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                </div>
                                <div className="flex-1 flex flex-col justify-between h-32">
                                    <div className="flex justify-between">
                                        <div>
                                            <h3 className="font-bold uppercase text-sm tracking-tight text-[#10221c]">{item.name}</h3>
                                            <p className="text-[10px] text-slate-400 uppercase mt-1 tracking-widest font-bold">Size: {item.size}</p>
                                        </div>
                                        <p className="font-bold text-[#10221c]">₹{item.price.toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.cartId)}
                                        className="text-[10px] uppercase font-bold text-red-500 underline underline-offset-8 w-fit hover:text-red-700 transition-colors"
                                    >
                                        Remove Piece
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center border border-dashed border-slate-200">
                            <p className="text-slate-400 uppercase tracking-widest text-xs">Your bag is currently empty.</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Summary */}
                <div className="lg:col-span-4 h-fit sticky top-32">
                    <div className="bg-[#f8f9f8] p-8 rounded-sm border border-slate-100">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-slate-400">Order Summary</h2>
                        <div className="space-y-4 text-sm border-b border-slate-200 pb-6">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="font-medium text-[#10221c]">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Luxury Surcharge (8%)</span>
                                <span className="font-medium text-[#10221c]">₹{tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Shipping</span>
                                <span className="text-emerald-700 font-bold uppercase text-[10px] tracking-widest">Complimentary</span>
                            </div>
                        </div>
                        <div className="flex justify-between py-8">
                            <span className="font-bold uppercase tracking-widest text-xs">Total</span>
                            <span className="font-extrabold text-2xl text-[#10221c]">₹{totalAmount.toLocaleString()}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={cartItems.length === 0}
                            className={`w-full py-5 uppercase text-[10px] font-bold tracking-[0.3em] transition-all ${cartItems.length > 0
                                ? 'bg-[#10221c] text-white hover:bg-black active:scale-95'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            Proceed to Acquisition
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
};

export default Cart;