import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdHero from '../components/AdHero';
import AdSplitBanner from '../components/AdSplitBanner';
import AdStrip from '../components/AdStrip';
import AdBreak from '../components/AdBreak';
import AdFeatureShowcase from '../components/AdFeatureShowcase';
import GridProductCard from '../components/GridProductCard';
import RecentlyViewed from '../components/RecentlyViewed';
import SEO from '../components/SEO';
import API_BASE_URL from '../config/api';

const Home = () => {
    // State
    const [products, setProducts] = useState([]);
    const [pageLayout, setPageLayout] = useState(null);
    const [loading, setLoading] = useState(true);
    const scrollRef1 = React.useRef(null);
    const scrollRef2 = React.useRef(null);

    // Fetch Products & Page Layout
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, layoutRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/products?limit=24&select=name,price,images,pages,stock_quantity,low_stock_threshold,category`),
                    axios.get(`${API_BASE_URL}/api/page-layouts/home`)
                ]);
                setProducts(prodRes.data);
                if (layoutRes.data && layoutRes.data.sections) {
                    setPageLayout(layoutRes.data);
                }
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

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white gap-4 font-[#Outfit]">
            <div className="w-8 h-8 border-2 border-[#FFD017] border-t-[#111111] rounded-full animate-spin" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#6B6457]">Curating Collection...</span>
        </div>
    );

    // Default Section List if layout API is pending
    const activeSections = pageLayout?.sections?.filter(s => s.enabled) || [
        { type: 'hero_ad' },
        { type: 'split_ad' },
        { type: 'ad_strip' },
        { type: 'product_grid', categoryFilter: 'new_arrivals', title: 'New Arrivals' },
        { type: 'ad_break' },
        { type: 'product_grid', categoryFilter: 'womens_collection', title: "Women's Collection" },
        { type: 'heritage' },
        { type: 'recently_viewed' }
    ];

    return (
        <div className="font-sans">
            <SEO
                title="Home"
                description="Experience the intersection of high-fashion luxury and athletic energy. Shop the latest collections from BiNDAAS!"
            />

            {/* Render Dynamic Page Layout Sections */}
            {activeSections.map((sec, idx) => {
                switch (sec.type) {
                    case 'hero_ad':
                        return <AdHero key={sec.id || idx} page="home" />;

                    case 'split_ad':
                        return <AdSplitBanner key={sec.id || idx} page="home" />;

                    case 'ad_strip':
                        return <AdStrip key={sec.id || idx} page="home" />;

                    case 'ad_break':
                        return (
                            <AdBreak 
                                key={sec.id || idx} 
                                page="home" 
                                adId={sec.adId?._id || sec.adId} 
                                fallbackTitle={sec.title || "WOMENSWEAR"}
                            />
                        );

                    case 'product_grid':
                        const isWomen = sec.categoryFilter === 'womens_collection';
                        const gridProducts = isWomen 
                            ? products.filter(p => p.pages && p.pages.includes('womens_collection'))
                            : products;
                        const scrollRef = isWomen ? scrollRef2 : scrollRef1;

                        return (
                            <section key={sec.id || idx} className="bg-white py-8 md:py-14 px-2.5 sm:px-4 lg:px-6 border-t border-[#E8E3D8]/50">
                                <div className="max-w-[1800px] mx-auto">
                                    <div className="flex justify-between items-end mb-5 md:mb-7 px-1">
                                        <div>
                                            <span className="text-[#D4AF37] font-bold uppercase tracking-[0.25em] text-[10px] mb-1.5 block">
                                                {isWomen ? 'Exclusively For Her' : 'Recently Added'}
                                            </span>
                                            <h2 className="text-2xl md:text-4xl font-extrabold text-[#111111] tracking-tight font-['Playfair_Display',serif]">
                                                {sec.title || (isWomen ? "Women's Collection" : "New Arrivals")}
                                            </h2>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Link 
                                                to={sec.redirectUrl || (isWomen ? "/women" : "/shop")} 
                                                className="rounded-full bg-white text-[#111111] px-5 py-2 text-xs font-semibold border border-slate-200/80 shadow-sm hover:bg-[#111111] hover:text-white hover:border-[#111111] transition-all duration-300 inline-flex items-center"
                                            >
                                                Discover more
                                            </Link>
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => scroll(scrollRef, 'left')}
                                                    className="w-8 h-8 rounded-full border border-[#D4AF37] bg-transparent flex items-center justify-center hover:bg-[#FFD017] hover:border-[#FFD017] transition-all duration-200"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-[#111111]"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => scroll(scrollRef, 'right')}
                                                    className="w-8 h-8 rounded-full border border-[#D4AF37] bg-transparent flex items-center justify-center hover:bg-[#FFD017] hover:border-[#FFD017] transition-all duration-200"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#111111]"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scrollable Carousel Grid */}
                                    <div ref={scrollRef} className="flex overflow-x-auto gap-2.5 md:gap-3 lg:gap-3.5 pb-2 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                        {gridProducts.map((product) => (
                                            <div key={product._id} className="snap-start flex-shrink-0 w-[calc(75%-8px)] sm:w-[calc(45%-10px)] lg:w-[calc(25%-10px)]">
                                                <GridProductCard product={product} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        );

                    case 'feature_showcase':
                    case 'heritage':
                        return (
                            <AdFeatureShowcase 
                                key={sec.id || idx} 
                                page="home" 
                                adId={sec.adId?._id || sec.adId} 
                            />
                        );

                    case 'recently_viewed':
                        return <RecentlyViewed key={sec.id || idx} />;

                    default:
                        return null;
                }
            })}
        </div>
    );
};

export default Home;