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
        <section className="bg-white py-16 px-4 md:px-12 border-t border-slate-50">
            <div className="max-w-[1440px] mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <span className="text-[#8b6e5a] font-bold uppercase tracking-[0.2em] text-[10px] mb-1 block">Your Digital Footprint</span>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-[#10221c] tracking-tight uppercase">Recently Viewed</h2>
                    </div>
                    {history.length > 4 && (
                        <div className="flex gap-2">
                            <button onClick={() => scroll('left')} className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>
                            <button onClick={() => scroll('right')} className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                            </button>
                        </div>
                    )}
                </div>

                <div 
                    ref={scrollRef} 
                    className="flex overflow-x-auto gap-4 lg:gap-6 pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {history.map((product) => (
                        <Link 
                            to={`/product/${product._id}`} 
                            key={product._id} 
                            className="group block relative snap-start flex-shrink-0 w-[calc(50%-8px)] lg:w-[calc(20%-16px)]"
                        >
                            <div className="relative overflow-hidden bg-[#f2eeeb] mb-3" style={{ aspectRatio: '3/4' }}>
                                <img 
                                    src={product.images?.[0] || 'https://via.placeholder.com/400'} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                                    loading="lazy" 
                                />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-center px-2">
                                <h3 className="text-[10px] font-bold text-[#8b6e5a] uppercase tracking-widest leading-tight mb-1 truncate group-hover:text-[#10221c] transition-colors">{product.name}</h3>
                                <p className="text-xs font-bold text-gray-900">{formatPrice(product.price)}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentlyViewed;
