import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';

const YouMayAlsoLike = ({ currentProductId, category }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { formatPrice } = useCurrency();
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/products?limit=12');
                // Filter out current product
                const filtered = data.filter(p => p._id !== currentProductId);
                setProducts(filtered);
            } catch (err) {
                console.error("Failed to fetch related products:", err);
            } finally {
                setLoading(false);
            }
        };

        if (currentProductId) {
            fetchRelated();
        }
    }, [currentProductId, category]);

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (el) {
            const scrollAmount = direction === 'left' ? -el.offsetWidth * 0.75 : el.offsetWidth * 0.75;
            el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (loading || products.length === 0) return null;

    return (
        <section className="py-12 px-4 md:px-8 font-sans">
            <div className="max-w-[1440px] mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#111111]">
                        You may also like
                    </h2>

                    {products.length > 4 && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => scroll('left')}
                                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                                aria-label="Scroll left"
                            >
                                <span className="material-icons-outlined text-sm">chevron_left</span>
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                                aria-label="Scroll right"
                            >
                                <span className="material-icons-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Horizontal Scrollable Carousel */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-4 md:gap-5 pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {products.map((prod) => {
                        const isWished = isInWishlist(prod._id);
                        return (
                            <div
                                key={prod._id}
                                className="snap-start flex-shrink-0 w-[calc(65%-12px)] sm:w-[calc(40%-12px)] lg:w-[calc(25%-16px)] group"
                            >
                                {/* Card Container */}
                                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-[#F5F5F5] border border-slate-100/80 shadow-sm mb-3">
                                    <Link to={`/product/${prod._id}`} className="block w-full h-full">
                                        <img
                                            src={prod.images?.[0] || 'https://via.placeholder.com/400'}
                                            alt={prod.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            loading="lazy"
                                        />
                                    </Link>

                                    {/* Bookmark Icon Button */}
                                    <button
                                        onClick={(e) => { e.preventDefault(); toggleWishlist(prod); }}
                                        className="absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#111111] hover:bg-white shadow-sm transition-transform hover:scale-105"
                                        title="Wishlist"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill={isWished ? "#111111" : "none"}
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.8}
                                            stroke="#111111"
                                            className="w-4 h-4"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1 0 2 .89 2 2v15.448l-7.593-4.34-7.593 4.34V5.322c0-1.1.9-2 2-2h11.186z" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Title & Price Row */}
                                <div className="flex items-start justify-between px-1 gap-2">
                                    <Link to={`/product/${prod._id}`} className="block">
                                        <h3 className="text-[11px] font-bold text-[#111111] uppercase tracking-wider truncate group-hover:text-[#D4AF37] transition-colors">
                                            {prod.name}
                                        </h3>
                                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                                            {formatPrice(prod.price)}
                                        </p>
                                    </Link>
                                    <Link
                                        to={`/product/${prod._id}`}
                                        className="text-slate-400 hover:text-black font-light text-base leading-none transition-colors"
                                    >
                                        +
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default YouMayAlsoLike;
