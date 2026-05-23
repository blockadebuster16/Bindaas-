import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import AdHero from '../components/AdHero';
import AdStrip from '../components/AdStrip';
import RecentlyViewed from '../components/RecentlyViewed';
import SEO from '../components/SEO';
import API_BASE_URL from '../config/api';

const Home = () => {
    // State
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef1 = React.useRef(null);
    const scrollRef2 = React.useRef(null);
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { formatPrice } = useCurrency();

    // Fetch Products
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Optimized fetch: Only fields needed for the home page grids, and limited to 24 items
                const prodRes = await axios.get('https://bindaas-ucyv.onrender.com/api/products?limit=24&select=name,price,images,pages,stock_quantity,low_stock_threshold,category`);
                setProducts(prodRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const scroll = (ref, direction) => {
        const el = ref.current;
        if (el) {
            const scrollAmount = direction === 'left' ? -el.offsetWidth : el.offsetWidth;
            el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Quick Add Functionality (No Navigation, No Alert)
    const handleQuickAdd = async (e, product) => {
        e.preventDefault(); // Prevent navigation to product detail
        e.stopPropagation();

        const cartItem = {
            id: product._id,
            name: product.name,
            price: product.price,
            size: 'M', // Default size for quick add
            image: product.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop',
            quantity: 1
        };

        await addToCart(cartItem);

        // No alert as per user request for silent add
        // Optional: Could add a small toast notification here if desired later
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center font-display text-xs uppercase tracking-widest text-slate-500">
            Curating Collection...
        </div>
    );

    return (
        <div className="font-display">
            <SEO
                title="Home"
                description="Experience the intersection of high-fashion luxury and athletic energy. Shop the latest collections from Bindass!!"
            />

            {/* Hero Section - Dynamic */}
            <AdHero page="home" />

            {/* ── Advertisement Banner Carousel ── */}
            <AdStrip page="home" />


            {/* ── Section 1: New Arrivals ── */}
            <section className="bg-white py-10 md:py-16 px-4 md:px-12">
                <div className="max-w-[1440px] mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-end mb-6 md:mb-8">
                        <div>
                            <span className="text-[#8b6e5a] font-bold uppercase tracking-[0.2em] text-[10px] mb-1 block">Recently Added</span>
                            <h2 className="text-2xl md:text-4xl font-extrabold text-[#10221c] tracking-tight">New Arrivals</h2>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => scroll(scrollRef1, 'left')} className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>
                            <button onClick={() => scroll(scrollRef1, 'right')} className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Scrollable carousel */}
                    <div ref={scrollRef1} className="flex overflow-x-auto gap-4 lg:gap-6 pb-2 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {products.filter(p => p.pages && p.pages.includes('new_arrivals')).map((product) => {
                            const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= (product.low_stock_threshold || 5);
                            const isWished = isInWishlist(product._id);
                            return (
                                <Link to={`/product/${product._id}`} key={product._id} className="group block relative snap-start flex-shrink-0 w-[calc(50%-8px)] lg:w-[calc(25%-12px)]">
                                    <div className="relative overflow-hidden bg-[#f2eeeb] mb-3" style={{ aspectRatio: '3/4' }}>
                                        <button
                                            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                                            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill={isWished ? "#ff3f6c" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke={isWished ? "#ff3f6c" : "currentColor"} className="w-4 h-4 text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                                        </button>
                                        {isLowStock && <span className="absolute bottom-3 left-3 z-10 bg-white text-gray-800 text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wide shadow-sm">Limited Stock</span>}
                                        <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop'} alt={product.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-gray-800"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
                                            <span className="text-xs font-medium text-gray-800">5.0</span>
                                        </div>
                                        <h3 className="text-[11px] font-semibold text-[#8b6e5a] uppercase tracking-widest leading-tight mb-1.5 group-hover:text-[#10221c] transition-colors line-clamp-2">{product.name}</h3>
                                        <p className="text-sm font-medium text-gray-900">{formatPrice(product.price)}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* VIEW ALL */}
                    <div className="flex justify-center mt-10">
                        <Link to="/shop" className="px-10 py-3.5 bg-[#2d1a14] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#10221c] transition-colors">View All</Link>
                    </div>
                </div>
            </section>

            {/* ── Section 2: Women's Collection ── */}
            <section className="bg-[#faf8f6] py-10 md:py-16 px-4 md:px-12">
                <div className="max-w-[1440px] mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-end mb-6 md:mb-8">
                        <div>
                            <span className="text-[#8b6e5a] font-bold uppercase tracking-[0.2em] text-[10px] mb-1 block">Exclusively For Her</span>
                            <h2 className="text-2xl md:text-4xl font-extrabold text-[#10221c] tracking-tight">Women's Collection</h2>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => scroll(scrollRef2, 'left')} className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>
                            <button onClick={() => scroll(scrollRef2, 'right')} className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Scrollable carousel */}
                    <div ref={scrollRef2} className="flex overflow-x-auto gap-4 lg:gap-6 pb-2 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {products.filter(p => p.pages && p.pages.includes('womens_collection')).map((product) => {
                            const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= (product.low_stock_threshold || 5);
                            const isWished = isInWishlist(product._id);
                            return (
                                <Link to={`/product/${product._id}`} key={product._id} className="group block relative snap-start flex-shrink-0 w-[calc(50%-8px)] lg:w-[calc(25%-12px)]">
                                    <div className="relative overflow-hidden bg-[#f2eeeb] mb-3" style={{ aspectRatio: '3/4' }}>
                                        <button
                                            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                                            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill={isWished ? "#ff3f6c" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke={isWished ? "#ff3f6c" : "currentColor"} className="w-4 h-4 text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                                        </button>
                                        {isLowStock && <span className="absolute bottom-3 left-3 z-10 bg-white text-gray-800 text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wide shadow-sm">Limited Stock</span>}
                                        <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop'} alt={product.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-gray-800"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
                                            <span className="text-xs font-medium text-gray-800">5.0</span>
                                        </div>
                                        <h3 className="text-[11px] font-semibold text-[#8b6e5a] uppercase tracking-widest leading-tight mb-1.5 group-hover:text-[#10221c] transition-colors line-clamp-2">{product.name}</h3>
                                        <p className="text-sm font-medium text-gray-900">₹{product.price?.toLocaleString('en-IN')}.00</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* VIEW ALL */}
                    <div className="flex justify-center mt-10">
                        <Link to="/shop" className="px-10 py-3.5 bg-[#2d1a14] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#10221c] transition-colors">View All</Link>
                    </div>
                </div>
            </section>

            {/* Brand Heritage / Story */}
            <section className="bg-[#10221c] text-white py-14 md:py-24 px-4 md:px-12 relative overflow-hidden">
                <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <span className="text-[#11d411] font-bold uppercase tracking-[0.2em] text-[10px] mb-4 md:mb-6 block">
                            The Heritage
                        </span>
                        <h2 className="text-3xl md:text-6xl font-extrabold uppercase tracking-tighter leading-tight mb-5 md:mb-8">
                            René's Legacy:<br />The Crocodile
                        </h2>
                        <p className="text-slate-300 text-sm leading-relaxed mb-6 md:mb-8 max-w-md font-light">
                            From the tennis courts of 1920s Paris to the streets of today, the crocodile has symbolized tenacity, elegance, and fair play. Our latest collection pays homage to this sporting heritage while pushing the boundaries of contemporary fashion.
                        </p>
                        <button className="px-8 py-4 border border-white text-white text-xs font-bold uppercase tracking-[0.15em] hover:bg-white hover:text-[#10221c] transition-all">
                            Discover The Story
                        </button>
                    </div>
                    <div className="order-1 lg:order-2 relative">
                        <div className="aspect-[4/3] bg-white/5 rounded-sm overflow-hidden border border-white/10">
                            <img
                                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop"
                                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
                                alt="Heritage"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Recently Viewed Segment */}
            <RecentlyViewed />
        </div>
    );
};

export default Home;
