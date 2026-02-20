import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // State for Shipping Info
    const [shippingInfo, setShippingInfo] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'India',
        email: '',
        phone: ''
    });

    // State for Cart & Totals
    const [cartItems, setCartItems] = useState([]);
    const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 });

    // 1. Load Session Data on Mount
    useEffect(() => {
        // Load existing cart
        const items = JSON.parse(localStorage.getItem('bindass_cart')) || [];
        setCartItems(items);

        // Calculate Totals
        const sub = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const tx = sub * 0.08;
        setTotals({ subtotal: sub, tax: tx, total: sub + tx });

        // Restore shipping info if user clicked "Back"
        const savedShipping = JSON.parse(localStorage.getItem('shipping_info'));
        if (savedShipping) {
            setShippingInfo(savedShipping);
        }
    }, []);

    // 2. Pre-fill User Data if first time
    useEffect(() => {
        if (user && !shippingInfo.firstName) {
            setShippingInfo(prev => ({
                ...prev,
                email: user.email || '',
                firstName: user.displayName ? user.displayName.split(' ')[0] : '',
                lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Save data to persist session
        localStorage.setItem('shipping_info', JSON.stringify(shippingInfo));
        localStorage.setItem('checkout_totals', JSON.stringify({
            subtotal: totals.subtotal,
            tax: totals.tax,
            totalAmount: totals.total // Ensure naming matches Checkout3.jsx
        }));
        navigate('/checkout/payment');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Stepper */}
                <div className="mb-12 max-w-3xl">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/10 -z-10 -translate-y-1/2"></div>
                        <div className="flex flex-col items-center gap-2 bg-background-light pr-4">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/20">1</div>
                            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Shipping</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 bg-background-light px-4 opacity-50">
                            <div className="w-10 h-10 rounded-full bg-white border-2 border-primary/20 text-zinc-400 flex items-center justify-center font-bold">2</div>
                            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Payment</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 bg-background-light pl-4 opacity-50">
                            <div className="w-10 h-10 rounded-full bg-white border-2 border-primary/20 text-zinc-400 flex items-center justify-center font-bold">3</div>
                            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Review</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column: Form */}
                    <div className="flex-1 space-y-8">
                        <h1 className="text-3xl font-bold dark:text-black">Shipping Information</h1>
                        <section className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {/* ... Your existing Input Fields (FirstName, LastName, Address, etc.) ... */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input required name="firstName" value={shippingInfo.firstName} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-4" placeholder="First Name" />
                                    <input required name="lastName" value={shippingInfo.lastName} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-4" placeholder="Last Name" />
                                </div>
                                <input required name="address" value={shippingInfo.address} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-4" placeholder="Street Address" />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <input required name="city" value={shippingInfo.city} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-4" placeholder="City" />
                                    <input required name="postalCode" value={shippingInfo.postalCode} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-4" placeholder="Postal Code" />
                                    <select name="country" value={shippingInfo.country} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-4 bg-white">
                                        <option value="India">India</option>
                                        <option value="USA">USA</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input required name="email" value={shippingInfo.email} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-4" placeholder="Email" type="email" />
                                    <input required name="phone" value={shippingInfo.phone} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-4" placeholder="Phone" type="tel" />
                                </div>
                                <button className="w-full bg-[#10221c] text-white font-bold py-5 rounded-lg uppercase tracking-widest text-xs hover:bg-black transition-all" type="submit">
                                    Continue to Payment
                                </button>
                            </form>
                        </section>
                    </div>

                    {/* Right Column: DYNAMIC Order Summary */}
                    <aside className="w-full lg:w-[400px]">
                        <div className="sticky top-28 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center justify-between dark:text-black">
                                Order Summary
                                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{cartItems.length} Items</span>
                            </h3>

                            <div className="space-y-4 mb-8 max-h-[250px] overflow-y-auto custom-scrollbar">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="flex space-x-4 border-b border-slate-50 pb-4">
                                        <div className="w-16 h-20 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                                            <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                        </div>
                                        <div className="flex-1 py-1">
                                            <h4 className="text-xs font-bold uppercase dark:text-black truncate">{item.name}</h4>
                                            <p className="text-[10px] text-slate-500">Size: {item.size}</p>
                                            <div className="text-xs font-bold mt-1 dark:text-black">₹{item.price.toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 border-t pt-6">
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Subtotal</span>
                                    <span className="dark:text-black font-medium">₹{totals.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Shipping</span>
                                    <span className="text-emerald-600 font-bold uppercase text-[10px]">Complimentary</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Tax (8%)</span>
                                    <span className="dark:text-black font-medium">₹{totals.tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold pt-4 border-t mt-4 dark:text-black">
                                    <span>Total</span>
                                    <span className="text-primary">₹{totals.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Checkout;