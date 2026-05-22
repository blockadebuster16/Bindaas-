import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addMultipleToCart } = useCart();
    const { formatPrice } = useCurrency();

    const [selectedIds, setSelectedIds] = useState(new Set());
    const [addedFeedback, setAddedFeedback] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

    const allSelected = wishlistItems.length > 0 && selectedIds.size === wishlistItems.length;

    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(wishlistItems.map(p => p._id)));
        }
    };

    const handleAddToCart = () => {
        const toAdd = wishlistItems
            .filter(p => selectedIds.has(p._id))
            .map(product => ({ ...product, size: product.sizes?.[0] || 'M', quantity: 1 }));
        addMultipleToCart(toAdd);
        setSelectedIds(new Set());
        setAddedFeedback(true);
        setTimeout(() => setAddedFeedback(false), 2000);
    };

    const handleConfirmRemove = () => {
        selectedIds.forEach(id => removeFromWishlist(id));
        setSelectedIds(new Set());
        setShowRemoveConfirm(false);
    };

    return (
        <main className="max-w-[1440px] mx-auto min-h-screen bg-white">
            <div className={`px-4 md:px-8 py-10 md:py-16 transition-all duration-300 ${selectedIds.size > 0 ? 'pb-32' : 'pb-10'}`}>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                    <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tighter text-[#10221c]">
                        My Wishlist{' '}
                        <span className="font-medium text-gray-400">({wishlistItems.length} Items)</span>
                    </h1>

                    {wishlistItems.length > 0 && (
                        <button
                            id="wishlist-select-all-btn"
                            onClick={toggleSelectAll}
                            className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold text-[#10221c] border border-[#10221c] px-5 py-2.5 hover:bg-[#10221c] hover:text-white transition-all duration-200 rounded-sm self-start sm:self-auto"
                        >
                            <span
                                className={`w-4 h-4 border-2 flex items-center justify-center rounded-sm transition-colors ${
                                    allSelected ? 'bg-[#10221c] border-[#10221c]' : 'border-[#10221c]'
                                }`}
                            >
                                {allSelected && (
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </span>
                            {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                    )}
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white w-full border border-dashed border-gray-200">
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
                        <h3 className="text-[22px] font-bold text-[#424553] mt-2 mb-2">It feels so light!</h3>
                        <p className="text-[15px] text-[#7e818c] mb-8 font-normal">There is nothing in your wishlist yet.</p>
                        <Link
                            to="/"
                            className="px-10 py-[14px] border border-[#ff3f6c] text-[#ff3f6c] bg-transparent uppercase font-bold text-[13px] tracking-wider hover:bg-[#ff3f6c] hover:text-white transition-colors duration-300 rounded-sm inline-block"
                        >
                            CONTINUE SHOPPING
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                        {wishlistItems.map(product => {
                            const isSelected = selectedIds.has(product._id);
                            const dominantImage = product.images?.[0] || 'https://via.placeholder.com/400x533';
                            return (
                                <div
                                    key={product._id}
                                    className="group relative cursor-pointer font-display"
                                    onClick={() => toggleSelect(product._id)}
                                >
                                    {/* Selection Overlay Ring */}
                                    <div className={`absolute inset-0 z-10 pointer-events-none border-2 transition-all duration-200 ${isSelected ? 'border-[#10221c]' : 'border-transparent group-hover:border-gray-300'}`} />

                                    {/* Checkbox badge */}
                                    <div className={`absolute top-3 left-3 z-20 w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-all duration-200 ${
                                        isSelected
                                            ? 'bg-[#10221c] border-[#10221c]'
                                            : 'bg-white/80 border-gray-400 opacity-0 group-hover:opacity-100'
                                    }`}>
                                        {isSelected && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Product Image */}
                                    <div className="relative bg-[#f1f1f1] aspect-[3/4] overflow-hidden">
                                        <img
                                            src={dominantImage}
                                            alt={product.name}
                                            className="w-full h-full object-cover object-top transition-all duration-500 group-hover:scale-[1.03]"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="pt-3 pb-6 flex flex-col items-start text-left">
                                        {product.category && (
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{product.category}</span>
                                        )}
                                        <h3 className="text-xs uppercase tracking-wide text-gray-800 font-medium leading-relaxed truncate w-full">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs font-bold text-gray-900 mt-0.5">{formatPrice(product.price)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Sticky Bottom Bar — slides up only when items are selected */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out ${
                    selectedIds.size > 0 ? 'translate-y-0' : 'translate-y-full'
                }`}
            >
                <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
                    <p className="text-[12px] uppercase tracking-widest font-bold text-gray-500">
                        {selectedIds.size > 0
                            ? <span className="text-[#10221c]">{selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected</span>
                            : 'Select items to add to bag'}
                    </p>

                    <div className="flex items-center gap-3">
                        {/* Remove Selected */}
                        <button
                            id="wishlist-remove-selected-btn"
                            onClick={() => setShowRemoveConfirm(true)}
                            disabled={selectedIds.size === 0}
                            className={`flex items-center gap-2 px-6 py-3.5 uppercase text-[11px] font-bold tracking-[0.2em] transition-all duration-300 rounded-sm border ${
                                selectedIds.size > 0
                                    ? 'border-red-400 text-red-500 hover:bg-red-50 active:scale-95'
                                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                        </button>

                        {/* Add to Bag */}
                        <button
                            id="wishlist-add-to-cart-btn"
                            onClick={handleAddToCart}
                            disabled={selectedIds.size === 0}
                            className={`flex items-center gap-2.5 px-8 py-3.5 uppercase text-[11px] font-bold tracking-[0.2em] transition-all duration-300 rounded-sm ${
                                selectedIds.size > 0
                                    ? addedFeedback
                                        ? 'bg-emerald-600 text-white scale-95'
                                        : 'bg-[#10221c] text-white hover:bg-black active:scale-95'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {addedFeedback ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Added to Bag!
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Add to Bag
                                    {selectedIds.size > 0 && (
                                        <span className="bg-white/20 rounded-full px-2 py-0.5 text-[10px]">
                                            {selectedIds.size}
                                        </span>
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Remove Confirmation Modal */}
            {showRemoveConfirm && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center px-4"
                    style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.35)' }}
                    onClick={() => setShowRemoveConfirm(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5"
                        style={{ animation: 'scaleIn 0.2s ease-out', transformOrigin: 'center' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Warning Icon */}
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>

                        <div className="text-center">
                            <h3 className="text-lg font-extrabold text-[#10221c] uppercase tracking-tight">Remove from Wishlist?</h3>
                            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                You're about to remove{' '}
                                <span className="font-bold text-[#10221c]">{selectedIds.size} item{selectedIds.size > 1 ? 's' : ''}</span>{' '}
                                from your wishlist. This cannot be undone.
                            </p>
                        </div>

                        <div className="flex gap-3 w-full mt-1">
                            <button
                                id="wishlist-cancel-remove-btn"
                                onClick={() => setShowRemoveConfirm(false)}
                                className="flex-1 py-3 border border-gray-200 rounded-xl text-[12px] font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Keep
                            </button>
                            <button
                                id="wishlist-confirm-remove-btn"
                                onClick={handleConfirmRemove}
                                className="flex-1 py-3 bg-red-500 rounded-xl text-[12px] font-bold uppercase tracking-widest text-white hover:bg-red-600 active:scale-95 transition-all"
                            >
                                Yes, Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.92); }
                    to   { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </main>
    );
};

export default Wishlist;
