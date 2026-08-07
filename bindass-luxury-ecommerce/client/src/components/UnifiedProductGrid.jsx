import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import GridProductCard from './GridProductCard';
import ProductSkeleton from './shared/ProductSkeleton';
import FilterSidebar from './FilterSidebar';
import API_BASE_URL from '../config/api';

const UnifiedProductGrid = ({ title, pageTarget }) => {
    const [originalProducts, setOriginalProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    // Sort Dropdown State
    const [isSortOpen, setIsSortOpen] = useState(false);
    const sortDropdownRef = useRef();

    // Active Quick Filter Pill (e.g. 'Accessories', 'Shoes', 'Clothes', '')
    const [activePill, setActivePill] = useState('');

    // Sort Criteria
    const [sortBy, setSortBy] = useState(''); // '', 'price-asc', 'price-desc', 'newest'

    // Deep Filter States
    const defaultFilters = {
        colors: [],
        sizes: [],
        productTypes: [],
        fits: [],
        minPrice: '',
        maxPrice: ''
    };
    const [filters, setFilters] = useState(defaultFilters);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // Optimized fetch: Filter by pageTarget on the server and request only needed fields
                const { data } = await axios.get(`${API_BASE_URL}/api/products?pages=${pageTarget}&select=name,price,images,pages,stock_quantity,low_stock_threshold,colors,sizes,productType,fit,createdAt,category`);
                setOriginalProducts(data);
            } catch (err) {
                console.error("Failed to fetch products for grid:", err);
            } finally {
                setLoading(false);
            }
        };

        if (pageTarget) fetchProducts();
    }, [pageTarget]);

    // Close sort dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const clearAllFilters = () => {
        setFilters(defaultFilters);
        setActivePill('');
    };

    // Calculate Available Options (distinct traits found in ALL products for this page)
    const availableOptions = useMemo(() => {
        const options = {
            colors: new Set(),
            sizes: new Set(),
            productTypes: new Set(),
            fits: new Set(),
            counts: { colors: {}, sizes: {}, types: {}, fits: {} }
        };

        originalProducts.forEach(p => {
            // Colors
            if (p.colors && p.colors.length > 0) {
                p.colors.forEach(c => {
                    options.colors.add(c);
                    options.counts.colors[c] = (options.counts.colors[c] || 0) + 1;
                });
            }
            // Sizes
            if (p.sizes && p.sizes.length > 0) {
                p.sizes.forEach(s => {
                    options.sizes.add(s);
                    options.counts.sizes[s] = (options.counts.sizes[s] || 0) + 1;
                });
            }
            // Product Type
            if (p.productType) {
                options.productTypes.add(p.productType);
                options.counts.types[p.productType] = (options.counts.types[p.productType] || 0) + 1;
            }
            // Fit
            if (p.fit) {
                options.fits.add(p.fit);
                options.counts.fits[p.fit] = (options.counts.fits[p.fit] || 0) + 1;
            }
        });

        return {
            colors: Array.from(options.colors).sort(),
            sizes: Array.from(options.sizes).sort(),
            productTypes: Array.from(options.productTypes).sort(),
            fits: Array.from(options.fits).sort(),
            counts: options.counts
        };
    }, [originalProducts]);


    // Compute fully filtered & sorted products
    const processedProducts = useMemo(() => {
        let result = [...originalProducts];

        // 1. Apply Pill (Quick Category/Type filter)
        if (activePill !== '') {
            // we'll assume the pill corresponds to productType usually, or maybe category string included check
            result = result.filter(p => 
                (p.productType && p.productType.toLowerCase() === activePill.toLowerCase()) || 
                (p.category && p.category.toLowerCase().includes(activePill.toLowerCase()))
            );
        }

        // 2. Apply Deep Filters
        if (filters.colors.length > 0) {
            result = result.filter(p => p.colors && p.colors.some(c => filters.colors.includes(c)));
        }
        if (filters.sizes.length > 0) {
            result = result.filter(p => p.sizes && p.sizes.some(s => filters.sizes.includes(s)));
        }
        if (filters.productTypes.length > 0) {
            result = result.filter(p => p.productType && filters.productTypes.includes(p.productType));
        }
        if (filters.fits.length > 0) {
            result = result.filter(p => p.fit && filters.fits.includes(p.fit));
        }
        
        // 3. Price Filter manually handled by min/max
        const minP = filters.minPrice ? Number(filters.minPrice) : 0;
        const maxP = filters.maxPrice ? Number(filters.maxPrice) : Number.MAX_SAFE_INTEGER;
        if (minP > 0 || maxP < Number.MAX_SAFE_INTEGER) {
             result = result.filter(p => p.price >= minP && p.price <= maxP);
        }

        // 4. Apply Sorting
        if (sortBy === 'price-asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-desc') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return result;
    }, [originalProducts, activePill, filters, sortBy]);

    // Pill handler helper
    const handlePillClick = (pillName) => {
        setActivePill(prev => prev === pillName ? '' : pillName); // toggle
    };

    return (
        <div className="bg-white min-h-screen relative font-sans">
            {/* Pill Navigation */}
            <div className="pt-2 pb-4 px-2.5 sm:px-4 lg:px-6 max-w-[1800px] mx-auto">
                <div className="flex flex-wrap gap-2 mb-8">
                    <button 
                        onClick={() => setActivePill('')}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 ${activePill === '' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-[#111111] border-[#D4AF37] hover:border-[#111111] hover:bg-[#111111]/5'}`}
                    >
                        View All
                    </button>
                    <button 
                        onClick={() => handlePillClick('Accessories')}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 ${activePill === 'Accessories' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-[#111111] border-[#D4AF37] hover:border-[#111111] hover:bg-[#111111]/5'}`}
                    >
                        Accessories
                    </button>
                    <button 
                        onClick={() => handlePillClick('Shoes')}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 ${activePill === 'Shoes' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-[#111111] border-[#D4AF37] hover:border-[#111111] hover:bg-[#111111]/5'}`}
                    >
                        Shoes
                    </button>
                    <button 
                        onClick={() => handlePillClick('Clothes')}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 ${activePill === 'Clothes' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-transparent text-[#111111] border-[#D4AF37] hover:border-[#111111] hover:bg-[#111111]/5'}`}
                    >
                        Clothes
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex justify-between items-center border-t border-[#E8E3D8] pt-6 pr-2 relative">
                    
                    {/* Sort By Container */}
                    <div className="relative" ref={sortDropdownRef}>
                        <button 
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="text-xs uppercase tracking-widest font-medium text-[#111111] flex items-center gap-1 hover:text-[#D4AF37] transition-colors focus:outline-none"
                        >
                            Sort By 
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ml-0.5 transition-transform ${isSortOpen ? '-rotate-180' : ''}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                        
                        {/* Sort Dropdown Panel */}
                        {isSortOpen && (
                            <div className="absolute top-full left-0 mt-3 w-52 bg-white shadow-xl border border-[#E8E3D8] z-30 py-2">
                                <button 
                                    onClick={() => { setSortBy(''); setIsSortOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-[10px] tracking-widest uppercase transition-colors ${sortBy === '' ? 'font-bold text-[#111111] bg-[#FFD017]' : 'text-[#6B6457] hover:bg-[#FFD017]/40 hover:text-[#111111]'}`}
                                >
                                    Recommended
                                </button>
                                <button 
                                    onClick={() => { setSortBy('newest'); setIsSortOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-[10px] tracking-widest uppercase transition-colors ${sortBy === 'newest' ? 'font-bold text-[#111111] bg-[#FFD017]' : 'text-[#6B6457] hover:bg-[#FFD017]/40 hover:text-[#111111]'}`}
                                >
                                    Newest Arrivals
                                </button>
                                <button 
                                    onClick={() => { setSortBy('price-asc'); setIsSortOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-[10px] tracking-widest uppercase transition-colors ${sortBy === 'price-asc' ? 'font-bold text-[#111111] bg-[#FFD017]' : 'text-[#6B6457] hover:bg-[#FFD017]/40 hover:text-[#111111]'}`}
                                >
                                    Price: Low to High
                                </button>
                                <button 
                                    onClick={() => { setSortBy('price-desc'); setIsSortOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-[10px] tracking-widest uppercase transition-colors ${sortBy === 'price-desc' ? 'font-bold text-[#111111] bg-[#FFD017]' : 'text-[#6B6457] hover:bg-[#FFD017]/40 hover:text-[#111111]'}`}
                                >
                                    Price: High to Low
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => setIsFilterOpen(true)}
                        className="text-xs uppercase tracking-widest font-medium text-[#111111] flex items-center gap-2 hover:text-[#D4AF37] transition-colors relative"
                    >
                        Filter
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                        </svg>
                        
                        {/* Notify Indicator if filters are active */}
                        {(filters.colors.length > 0 || filters.sizes.length > 0 || filters.productTypes.length > 0 || filters.fits.length > 0 || filters.minPrice !== '' || filters.maxPrice !== '') && (
                            <span className="absolute -top-1 -right-2 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Grid Area */}
            {loading ? (
                <div className="px-2.5 sm:px-4 lg:px-6 py-6 max-w-[1800px] mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 lg:gap-3.5">
                        {Array.from({ length: 8 }).map((_, idx) => (
                            <ProductSkeleton key={`skeleton-${idx}`} />
                        ))}
                    </div>
                </div>
            ) : processedProducts.length === 0 ? (
                <div className="flex justify-center flex-col items-center h-64 gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6B6457]">No Items Found</span>
                    <button onClick={clearAllFilters} className="text-[10px] font-bold text-[#111111] border-b border-[#D4AF37] uppercase tracking-widest pb-0.5 hover:text-[#D4AF37] transition-colors">Clear Filters</button>
                </div>
            ) : (
                <div className="px-2.5 sm:px-4 lg:px-6 py-6 max-w-[1800px] mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 lg:gap-3.5">
                        {processedProducts.map(product => (
                            <GridProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            )}

            {/* Filter Sidebar overlay */}
            <FilterSidebar 
                isOpen={isFilterOpen} 
                onClose={() => setIsFilterOpen(false)} 
                totalResults={processedProducts.length}
                filters={filters}
                setFilters={setFilters}
                availableOptions={availableOptions}
                clearAll={clearAllFilters}
            />
        </div>
    );
};

export default UnifiedProductGrid;


