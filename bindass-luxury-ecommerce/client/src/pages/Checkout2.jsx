import React, { useState, useEffect } from 'react'; // Added useEffect
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PaymentPage = () => {
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '' });
    const [errors, setErrors] = useState({});

    // NEW: Session Persistence for Totals and Cart
    const [cartItems, setCartItems] = useState([]);
    const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 });

    // 1. Load Session Data on Mount
    useEffect(() => {
        // Load Cart & Totals
        const items = JSON.parse(localStorage.getItem('bindass_cart')) || [];
        const savedTotals = JSON.parse(localStorage.getItem('checkout_totals')) || { subtotal: 0, tax: 0, total: 0 };
        setCartItems(items);
        setTotals(savedTotals);

        // Load existing payment info if user navigated back from Review
        const savedPayment = JSON.parse(localStorage.getItem('payment_info'));
        if (savedPayment) {
            setSelectedMethod(savedPayment.method);
            // We don't store full card numbers for security, 
            // but we can keep placeholders if needed.
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCardData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateAndProceed = () => {
        const newErrors = {};
        if (selectedMethod === 'card') {
            if (!cardData.number) newErrors.number = true;
            if (!cardData.expiry) newErrors.expiry = true;
            if (!cardData.cvv) newErrors.cvv = true;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const paymentInfo = {
            method: selectedMethod,
            lastFour: cardData.number.slice(-4) || 'XXXX'
        };
        localStorage.setItem('payment_info', JSON.stringify(paymentInfo));
        navigate('/checkout/review');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Stepper Logic stays the same... */}

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column Logic stays the same... */}

                    {/* Right Column: Dynamic Order Summary */}
                    <aside className="w-full lg:w-[400px]">
                        <div className="sticky top-28 dark:text-black bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center justify-between uppercase">
                                Order Summary
                                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{cartItems.length} Items</span>
                            </h3>

                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Subtotal</span>
                                    <span>₹{totals.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Estimated Tax</span>
                                    <span>₹{totals.tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold pt-4 text-slate-900 border-t border-slate-100 mt-4">
                                    <span>Total</span>
                                    <span className="text-primary">₹{totals.total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button onClick={validateAndProceed} className="w-full bg-primary text-white font-bold py-5 rounded-lg uppercase tracking-[0.2em] text-sm">
                                Review Order
                            </button>
                        </div>
                    </aside>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PaymentPage;