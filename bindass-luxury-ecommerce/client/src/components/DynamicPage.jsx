import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import AdHero from './AdHero';
import AdSplitBanner from './AdSplitBanner';
import AdStrip from './AdStrip';
import AdBreak from './AdBreak';
import AdMiddle from './AdMiddle';
import AdFeatureShowcase from './AdFeatureShowcase';
import GridProductCard from './GridProductCard';
import RecentlyViewed from './RecentlyViewed';
import SEO from './SEO';
import { useProducts } from '../hooks/useProducts';
import { usePageLayout } from '../hooks/usePageLayouts';
import { useAdvertisements } from '../hooks/useAdvertisements';

const DynamicPage = ({ pageKey, title, description }) => {
    // We use a map of refs so each product grid section can have its own scroll ref
    const scrollRefs = useRef({});

    const { 
        data: products = [], 
        isLoading: isProductsLoading 
    } = useProducts({ limit: 48, select: 'name,price,images,pages,stock_quantity,low_stock_threshold,category' });
    
    const { 
        data: pageLayout, 
        isLoading: isLayoutLoading 
    } = usePageLayout(pageKey);
    
    const { 
        data: adsByBannerType = {}, 
        isLoading: isAdsLoading 
    } = useAdvertisements(pageKey);

    const loading = isProductsLoading || isLayoutLoading || isAdsLoading;

    const scroll = (id, direction) => {
        const el = scrollRefs.current[id];
        if (el) {
            const scrollAmount = direction === 'left' ? -el.offsetWidth : el.offsetWidth;
            el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white gap-4 font-sans">
            <div className="w-8 h-8 border-2 border-bindas-amber border-t-bindas-onyx rounded-full animate-spin" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#6B6457]">Curating Collection...</span>
        </div>
    );

    // Default Section List if layout API is pending or doesn't have sections
    const activeSections = pageLayout?.sections?.filter(s => s.enabled) || [
        { id: 'sec-1', type: 'hero_ad' },
        { id: 'sec-2', type: 'product_grid', categoryFilter: pageKey, title: `${title} Collection` },
        { id: 'sec-3', type: 'ad_break' },
    ];

    // Helper to find specific ad or fallback to first available
    const getAdData = (bannerType, adId) => {
        const ads = adsByBannerType[bannerType] || [];
        if (adId) {
            const match = ads.find(ad => ad._id === adId);
            if (match) return match;
        }
        return ads[0] || null;
    };

    return (
        <div className="font-sans">
            <SEO
                title={title}
                description={description}
            />

            {/* Render Dynamic Page Layout Sections */}
            {activeSections.map((sec, idx) => {
                const sectionId = sec.id || `sec-${idx}`;
                
                switch (sec.type) {
                    case 'hero_ad':
                        return <AdHero key={sectionId} heroAdsData={adsByBannerType['hero'] || []} />;

                    case 'split_ad':
                        return <AdSplitBanner key={sectionId} adData={getAdData('split', sec.adId)} />;

                    case 'ad_middle':
                        return <AdMiddle key={sectionId} page={pageKey} adData={getAdData('middle', sec.adId)} />;

                    case 'ad_strip':
                        return <AdStrip key={sectionId} stripAdsData={adsByBannerType['strip'] || []} />;

                    case 'ad_break':
                        return (
                            <AdBreak 
                                key={sectionId} 
                                page={pageKey} 
                                adData={getAdData('break', sec.adId)} 
                                fallbackTitle={sec.title || title}
                            />
                        );

                    case 'product_grid':
                        // Filter products for this specific grid
                        const filterKey = sec.categoryFilter || pageKey;
                        const isGlobal = filterKey === 'new_arrivals' || !filterKey;
                        
                        const gridProducts = isGlobal
                            ? products
                            : products.filter(p => p.pages && p.pages.includes(filterKey));

                        return (
                            <section key={sectionId} className="bg-white py-8 md:py-14 px-2.5 sm:px-4 lg:px-6 border-t border-[#E8E3D8]/50">
                                <div className="max-w-[1800px] mx-auto">
                                    <div className="flex justify-between items-end mb-5 md:mb-7 px-1">
                                        <div>
                                            <span className="text-bindas-gold font-bold uppercase tracking-[0.25em] text-[10px] mb-1.5 block">
                                                Curated Selection
                                            </span>
                                            <h2 className="text-2xl md:text-4xl font-extrabold text-bindas-onyx tracking-tight font-['Playfair_Display',serif]">
                                                {sec.title || `${title} Collection`}
                                            </h2>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Link 
                                                to={sec.redirectUrl || `/shop`} 
                                                className="rounded-full bg-white text-bindas-onyx px-5 py-2 text-xs font-semibold border border-slate-200/80 shadow-sm hover:bg-bindas-onyx hover:text-white hover:border-bindas-onyx transition-all duration-300 inline-flex items-center"
                                            >
                                                Discover more
                                            </Link>
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => scroll(sectionId, 'left')}
                                                    className="w-8 h-8 rounded-full border border-bindas-gold bg-transparent flex items-center justify-center hover:bg-bindas-amber hover:border-bindas-amber transition-all duration-200"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-bindas-onyx"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => scroll(sectionId, 'right')}
                                                    className="w-8 h-8 rounded-full border border-bindas-gold bg-transparent flex items-center justify-center hover:bg-bindas-amber hover:border-bindas-amber transition-all duration-200"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-bindas-onyx"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scrollable Carousel Grid */}
                                    {gridProducts.length > 0 ? (
                                        <div
                                            ref={(el) => (scrollRefs.current[sectionId] = el)}
                                            className="flex overflow-x-auto gap-2.5 md:gap-3 lg:gap-3.5 pb-2 snap-x snap-mandatory scroll-smooth"
                                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                            data-lenis-prevent
                                        >
                                            {gridProducts.map((product) => (
                                                <div key={product._id} className="snap-start flex-shrink-0 w-[calc(75%-8px)] sm:w-[calc(45%-10px)] lg:w-[calc(25%-10px)]">
                                                    <GridProductCard product={product} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center text-gray-500 font-medium text-sm">
                                            No products available in this collection yet.
                                        </div>
                                    )}
                                </div>
                            </section>
                        );

                    case 'feature_showcase':
                    case 'heritage':
                        return (
                            <AdFeatureShowcase 
                                key={sectionId} 
                                page={pageKey} 
                                adData={getAdData(sec.type, sec.adId)} 
                            />
                        );

                    case 'recently_viewed':
                        return <RecentlyViewed key={sectionId} />;

                    default:
                        return null;
                }
            })}
        </div>
    );
};

export default DynamicPage;
