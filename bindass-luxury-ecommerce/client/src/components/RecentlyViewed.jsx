import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useCurrency } from '../context/CurrencyContext';

const RecentlyViewed = () => {
    const { history } = useRecentlyViewed();
    const { formatPrice } = useCurrency();
    const scrollRef = useRef(null);

    if (!history || history.length === 0) return null;

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (el) {
            const scrollAmount = direction === 'left' ? -el.offsetWidth : el.offsetWidth;
            el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="bg-[#F5F2EB] py-4 sm:py-6 px-2.5 sm:px-5 lg:px-8 font-sans">
            <div className="bg-white rounded-[24px] sm:rounded-[36px] p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto shadow-sm border border-slate-200/40">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <span className="text-slate-400 font-bold uppercase tracking-[0.25em] text-[10px] mb-1 block">Your Digital Footprint</span>
                        <h2 className="text-lg sm:text-xl font-extrabold text-bindas-onyx tracking-tight uppercase">Recently Viewed</h2>
                    </div>
                    {history.length > 4 && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => scroll('left')}
                                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                            </button>
                        </div>
                    )}
                </div>

                <div 
                    ref={scrollRef} 
                    className="flex overflow-x-auto gap-3.5 sm:gap-4 lg:gap-5 pb-2 snap-x snap-mandatory scroll-smooth no-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {history.map((product) => (
                        <div 
                            key={product._id} 
                            className="group block relative snap-start flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.33%-12px)] lg:w-[calc(20%-16px)] cursor-pointer"
                        >
                            {/* Padded Grey Container */}
                            <div className="p-2 sm:p-2.5 bg-[#EAEAEA] rounded-2xl sm:rounded-3xl mb-2.5 shadow-sm">
                                <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-[#F5F5F5]">
                                    <Link to={`/product/${product._id}`} className="block w-full h-full">
                                        <img 
                                            src={product.images?.[0] || '/images/product-placeholder.svg'} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                                            loading="lazy" 
                                        />
                                    </Link>
                                </div>
                            </div>
                            {/* Product Title & Price Row */}
                            <div className="flex items-start justify-between px-1 gap-2">
                                <Link to={`/product/${product._id}`} className="block">
                                    <h3 className="text-[11px] font-bold text-bindas-onyx uppercase tracking-wider truncate group-hover:text-bindas-gold transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                                        From {formatPrice(product.price)}
                                    </p>
                                </Link>

                                <Link 
                                    to={`/product/${product._id}`}
                                    className="text-slate-400 hover:text-black font-light text-base leading-none transition-colors"
                                >
                                    +
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentlyViewed;
