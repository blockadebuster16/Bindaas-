import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCheckout } from '../context/CheckoutContext';
import { useToast } from '../context/ToastContext';

const Cart = () => {
    const { cartItems, removeFromCart } = useCart();
    const { user, setIsAuthModalOpen } = useAuth();
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();
    const { updateTotals, clearCheckout } = useCheckout();
    const toast = useToast();

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalAmount = subtotal;

    const handleCheckout = async () => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        if (cartItems.length === 0) {
            toast.warning('Your bag is empty — add some pieces first!');
            return;
        }

        // 1. Prepare Checkout Context
        clearCheckout(); // Start fresh
        updateTotals({
            subtotal,
            discount: 0,
            itemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0)
        });

        // 2. Head to Step 1
        navigate('/checkout');
    };

    return (
        <>
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 font-['Manrope'] bg-white min-h-screen pb-24 md:pb-12">
            <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tighter mb-8 md:mb-12 text-[#10221c]">
                Your Shopping Bag ({cartItems.length})
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
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
                                        <p className="font-bold text-[#10221c]">{formatPrice(item.price)}</p>
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
                        <div className="flex flex-col items-center justify-center py-16 bg-white w-full">
                            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                <ellipse cx="100" cy="165" rx="35" ry="3" fill="#f1f1f1" />
                                <path d="M 60 115 L 75 115 M 65 100 L 95 100 C 105 100 105 85 95 85 C 85 85 85 100 95 100" fill="none" stroke="#424553" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <g transform="translate(100, 100) rotate(6) translate(-100, -100)">
                                    <path d="M 80 60 C 80 20 120 20 120 60" fill="none" stroke="#424553" strokeWidth="3" strokeLinecap="round" />
                                    <path d="M 70 50 L 130 45 L 140 140 L 75 145 Z" fill="#ff3f6c" strokeLinejoin="round" />
                                    <circle cx="80" cy="58" r="2.5" fill="#fff" stroke="#424553" strokeWidth="1.5"/>
                                    <circle cx="120" cy="55" r="2.5" fill="#fff" stroke="#424553" strokeWidth="1.5"/>
                                    <path d="M 90 105 C 90 85 105 85 105 100 C 105 85 120 85 120 105" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                                </g>
                            </svg>

                            <h3 className="text-[22px] font-bold text-[#424553] mt-2 mb-2">Hey, it feels so light!</h3>
                            <p className="text-[15px] text-[#7e818c] mb-8 font-normal">There is nothing in your bag. Let's add some items.</p>
                            
                            <button className="btn-pill">
                                ADD ITEMS FROM WISHLIST
                            </button>
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
                                <span className="font-medium text-[#10221c]">{formatPrice(subtotal)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between py-8">
                            <span className="font-bold uppercase tracking-widest text-xs">Total</span>
                            <span className="font-extrabold text-2xl text-[#10221c]">{formatPrice(totalAmount)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={cartItems.length === 0}
                            className={`w-full ${cartItems.length > 0
                                ? 'btn-pill'
                                : 'btn-pill opacity-50 cursor-not-allowed hover:bg-black'
                                }`}
                        >
                            Proceed to Acquisition
                        </button>
                    </div>
                </div>
            </div>
        </main>

        {/* Mobile sticky bottom CTA — only shows when cart has items */}
        {cartItems.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 p-4 flex items-center justify-between gap-4 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                    <p className="text-xl font-extrabold text-[#10221c]">{formatPrice(totalAmount)}</p>
                </div>
                <button
                    onClick={handleCheckout}
                    className="btn-pill flex-1 max-w-[200px] py-3.5 text-[11px]"
                >
                    Proceed to Checkout
                </button>
            </div>
        )}
    </>
    );
};

export default Cart;