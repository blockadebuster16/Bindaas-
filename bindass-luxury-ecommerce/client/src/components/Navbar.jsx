import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import loadGoogleFont from '../utils/loadGoogleFont';
import RenderText from './shared/RenderText';
import { lenisStop, lenisStart } from './SmoothScroll';

import logoBlack from '../assets/text-logo-black-transparent.png';
import useFocusTrap from '../hooks/useFocusTrap';

const Navbar = () => {
    const { user, setIsAuthModalOpen, logOut } = useAuth();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const drawerRef = useRef(null);
    useFocusTrap(drawerRef, mobileMenuOpen);
    const [promoAd, setPromoAd] = useState('loading');
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
    const [hasHeroAtTop, setHasHeroAtTop] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const collectionsRef = useRef(null);

    // Replace polling setInterval with MutationObserver — no more 500ms DOM polling
    useEffect(() => {
        const checkHeroAtTop = () => {
            const heroEl = document.querySelector('.hero-banner-top');
            setHasHeroAtTop(!!heroEl);
        };

        checkHeroAtTop();

        // MutationObserver watches for DOM changes — zero cost vs setInterval
        const observer = new MutationObserver(checkHeroAtTop);
        observer.observe(document.body, { childList: true, subtree: true });
        window.addEventListener('resize', checkHeroAtTop);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', checkHeroAtTop);
        };
    }, [location.pathname]);

    // Track scroll position for header color transition
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setIsCollectionsOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open — using Lenis API
    useEffect(() => {
        if (mobileMenuOpen) {
            lenisStop();
            // Fallback for touch devices (where Lenis isn't running)
            document.documentElement.style.overflow = 'hidden';
        } else {
            lenisStart();
            document.documentElement.style.overflow = '';
        }
        return () => {
            lenisStart();
            document.documentElement.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    // Close collections dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (collectionsRef.current && !collectionsRef.current.contains(e.target)) {
                setIsCollectionsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogin = () => {
        setIsAuthModalOpen(true);
        setMobileMenuOpen(false);
    };

    useEffect(() => {
        const fetchPromoAd = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/api/advertisements?bannerType=promo`);
                const ad = data[0] || null;
                setPromoAd(ad);
                if (ad && ad.titleFontFamily) {
                    loadGoogleFont(ad.titleFontFamily);
                }
            } catch (err) {
                setPromoAd(null);
            }
        };
        fetchPromoAd();
    }, []);

    // Search Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setSearchLoading(true);
                try {
                    const { data } = await axios.get(`${API_BASE_URL}/api/products/search?q=${encodeURIComponent(searchQuery)}`);
                    setSearchResults(data);
                    setShowResults(true);
                } catch (err) {
                    console.error("Search failed", err);
                } finally {
                    setSearchLoading(false);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setShowResults(false);
            setSearchOpen(false);
            setSearchQuery('');
            setMobileMenuOpen(false);
        }
    };

    const handleSearchIconClick = () => {
        setSearchOpen(p => !p);
        if (!searchOpen) {
            setTimeout(() => document.getElementById('navbar-search-input')?.focus(), 50);
        } else {
            setShowResults(false);
        }
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    // Featured collections for the mega dropdown
    const featuredCollections = [
        { title: "Valentine Special", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=500&auto=format&fit=crop", link: "/shop?cat=valentine" },
        { title: "Caps & Headwear", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=500&auto=format&fit=crop", link: "/shop?cat=caps" },
        { title: "Winter Collection '25", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=500&auto=format&fit=crop", link: "/shop?cat=winter" },
        { title: "Bindass Racing Club", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=500&auto=format&fit=crop", link: "/shop?cat=racing" },
        { title: "Studio Basics", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=500&auto=format&fit=crop", link: "/shop?cat=basics" },
        { title: "Yacht & Summer Line", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500&auto=format&fit=crop", link: "/shop?cat=yacht" }
    ];

    // Header transparent overlay ONLY applies if a Hero Banner is active at top of page, unscrolled
    const isTransparentOverlay = hasHeroAtTop && !isScrolled && !mobileMenuOpen;

    let headerClasses = "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 font-sans ";
    if (isTransparentOverlay) {
        headerClasses += "bg-transparent text-white border-transparent shadow-none py-2";
    } else {
        headerClasses += "bg-white text-[#111111] shadow-md border-b border-slate-200 py-1";
    }

    const navLinkClass = `transition-colors py-1 hover:text-[#D4AF37] ${isTransparentOverlay ? 'text-white' : 'text-[#111111]'}`;

    return (
        <>
            {/* Layout Spacer when page does NOT start with a Hero Banner */}
            {!hasHeroAtTop && <div className="h-16 md:h-20" />}

            {/* Promo Bar */}
            {promoAd && promoAd !== 'loading' ? (
                <div
                    className="w-full tracking-[0.2em] py-1.5 text-center border-b border-[#E8E3D8] font-sans px-4 flex items-center justify-center overflow-hidden z-[101] relative"
                    style={{ backgroundColor: promoAd.tagColor || '#FFD017' }}
                >
                    <RenderText
                        value={promoAd.title}
                        svgUrl={promoAd.titleSvgUrl}
                        bold={promoAd.titleBold}
                        italic={promoAd.titleItalic}
                        stroke={promoAd.titleStroke}
                        strokeColor={promoAd.titleStrokeColor}
                        strokeWidth={promoAd.titleStrokeWidth}
                        fontSize={promoAd.titleFontSize}
                        fontFamily={promoAd.titleFontFamily}
                        className="text-[10px] font-bold"
                        style={{ color: promoAd.titleColor || '#111111' }}
                    />
                </div>
            ) : null}

            {/* Header: Unified Single Row */}
            <header className={headerClasses}>
                <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-6 relative">

                    {/* Mobile: Hamburger & Logo */}
                    <div className="flex items-center gap-4 lg:hidden">
                        <button
                            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0 active:scale-95"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open menu"
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-menu"
                        >
                            <span className="material-icons-outlined text-[24px]">menu</span>
                        </button>
                        <Link to="/" className="flex items-center flex-shrink-0 my-auto" onClick={closeMobileMenu}>
                            <img
                                src={logoBlack}
                                alt="BiNDAAS!"
                                className={`h-8 md:h-9 object-contain transition-all duration-300 ${isTransparentOverlay ? 'brightness-0 invert' : ''}`}
                            />
                        </Link>
                    </div>

                    {/* Desktop Left Group: Logo + Navigation Links */}
                    <div className="hidden lg:flex items-center gap-7 lg:gap-9 flex-1">
                        <Link to="/" className="flex items-center flex-shrink-0 my-auto">
                            <img
                                src={logoBlack}
                                alt="BiNDAAS!"
                                className={`h-10 md:h-[42px] lg:h-12 object-contain transition-all duration-300 ${isTransparentOverlay ? 'brightness-0 invert' : ''}`}
                            />
                        </Link>

                        {/* Inline Menu Links */}
                        <nav className="flex items-center">
                            <ul className="flex items-center gap-5 xl:gap-7 text-[11px] font-bold uppercase tracking-[0.16em]">
                                <li>
                                    <Link to="/men" className={navLinkClass}>Men</Link>
                                </li>
                                <li>
                                    <Link to="/women" className={navLinkClass}>Women</Link>
                                </li>

                                {/* ── COLLECTIONS MEGA DROPDOWN ── */}
                                <li className="relative" ref={collectionsRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsCollectionsOpen(p => !p)}
                                        className={`transition-colors py-1.5 flex items-center gap-1 hover:text-[#D4AF37] cursor-pointer bg-transparent border-none ${isTransparentOverlay ? 'text-white' : 'text-[#111111]'}`}
                                        aria-expanded={isCollectionsOpen}
                                        aria-haspopup="true"
                                    >
                                        Collections
                                        <span className={`material-icons-outlined text-[15px] transition-transform duration-300 ${isCollectionsOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                    </button>

                                    {/* Mega Dropdown Menu */}
                                    <div
                                        className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[calc(100vw-4rem)] max-w-[1200px] bg-white text-black shadow-2xl border border-slate-100 z-50 rounded-2xl p-6 md:p-8 transition-all duration-300 origin-top ${
                                            isCollectionsOpen
                                                ? 'opacity-100 scale-y-100 pointer-events-auto translate-y-0'
                                                : 'opacity-0 scale-y-95 pointer-events-none -translate-y-2'
                                        }`}
                                        style={{ transformOrigin: 'top center' }}
                                    >
                                        <div className="flex items-center justify-between mb-5">
                                            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-400">Featured Collections</span>
                                            <Link to="/shop" onClick={() => setIsCollectionsOpen(false)} className="text-[11px] font-bold uppercase tracking-wider text-black hover:text-[#D4AF37] transition-colors">
                                                View All Drops →
                                            </Link>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                            {featuredCollections.map((col, idx) => (
                                                <Link key={idx} to={col.link} onClick={() => setIsCollectionsOpen(false)} className="group/col block text-center space-y-2">
                                                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-sm">
                                                        <img
                                                            src={col.image}
                                                            alt={col.title}
                                                            className="w-full h-full object-cover group-hover/col:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider group-hover/col:text-black transition-colors">
                                                        {col.title}
                                                    </p>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </li>

                                <li>
                                    <Link to="/heritage" className={navLinkClass}>About Us</Link>
                                </li>
                                <li>
                                    <Link to="/membership" className={navLinkClass}>Membership</Link>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    {/* Right Group: Action Icons */}
                    <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">

                        {/* Search Icon */}
                        <button
                            onClick={handleSearchIconClick}
                            aria-label={searchOpen ? 'Close search' : 'Open search'}
                            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-black/5 transition-colors active:scale-95"
                        >
                            <span className="material-icons-outlined text-[24px]">{searchOpen ? 'close' : 'search'}</span>
                        </button>

                        {/* Wishlist */}
                        <Link to="/wishlist" aria-label={`Wishlist (${wishlistCount} items)`} className="relative hover:text-[#ff3f6c] transition-colors flex items-center w-10 h-10 justify-center rounded-lg hover:bg-black/5 active:scale-95">
                            <span className="material-icons-outlined text-[24px]">favorite_border</span>
                            {wishlistCount > 0 && (
                                <span className="absolute top-1 right-1 bg-[#ff3f6c] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                    {wishlistCount > 9 ? '9+' : wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* User — desktop only */}
                        {user ? (
                            <div className="hidden md:flex items-center gap-3">
                                <Link to="/profile" title="View Profile" className="flex items-center w-10 h-10 justify-center rounded-lg hover:bg-black/5 active:scale-95">
                                    <img src={user.picture} className="w-7 h-7 rounded-full border-2 border-[#FFD017]" alt="Profile" onError={(e) => { e.target.src = ''; e.target.className = 'w-7 h-7 rounded-full bg-[#111111] flex items-center justify-center text-white text-xs font-bold'; }} />
                                </Link>
                                {/* Inline logout confirm */}
                                {showLogoutConfirm ? (
                                    <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                                        <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Logout?</span>
                                        <button
                                            onClick={() => { logOut(); navigate('/'); setShowLogoutConfirm(false); }}
                                            className="text-[9px] bg-red-500 text-white font-bold uppercase px-2 py-0.5 rounded hover:bg-red-600 transition-colors"
                                        >Yes</button>
                                        <button
                                            onClick={() => setShowLogoutConfirm(false)}
                                            className="text-[9px] text-red-400 font-bold uppercase px-1 hover:text-red-600 transition-colors"
                                        >No</button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowLogoutConfirm(true)}
                                        className="material-icons-outlined hover:text-red-400 text-[22px] transition-colors flex items-center w-10 h-10 justify-center rounded-lg hover:bg-black/5"
                                        aria-label="Logout"
                                    >logout</button>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={handleLogin}
                                aria-label="Sign in"
                                className="material-icons-outlined text-[24px] hover:opacity-80 hidden md:flex items-center w-10 h-10 justify-center rounded-lg hover:bg-black/5 active:scale-95"
                            >person_outline</button>
                        )}

                        {/* Cart */}
                        <Link to="/cart" aria-label={`Cart (${cartCount} items)`} className="relative hover:opacity-80 transition-opacity flex items-center w-10 h-10 justify-center rounded-lg hover:bg-black/5 active:scale-95">
                            <span className="material-icons-outlined text-[24px]">shopping_bag</span>
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 bg-[#FFD017] text-[#111111] text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Search Overlay */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out border-t ${
                        isTransparentOverlay ? 'border-white/10 bg-black/90 backdrop-blur-xl' : 'border-gray-100 bg-white'
                    } ${searchOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
                >
                    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3 relative">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                            <input
                                id="navbar-search-input"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length > 2 && setShowResults(true)}
                                placeholder="Find a piece…"
                                className={`w-full rounded-full py-3 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD017] font-medium transition-shadow ${
                                    isTransparentOverlay ? 'bg-white/10 text-white placeholder-slate-400' : 'bg-gray-100 text-black placeholder-gray-500'
                                }`}
                            />
                            {searchLoading && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin rounded-full h-4 w-4 border-b-2 border-[#FFD017]"></div>
                            )}
                        </form>

                        {/* Search Results Preview */}
                        {showResults && (
                            <div className="absolute top-full left-4 right-4 md:left-6 md:right-6 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[200]">
                                <div className="max-h-[320px] overflow-y-auto" data-lenis-prevent>
                                    {searchResults.length > 0 ? (
                                        <div className="py-2">
                                            {searchResults.map(product => (
                                                <Link
                                                    key={product._id}
                                                    to={`/product/${product._id}`}
                                                    onClick={() => { setShowResults(false); setSearchQuery(''); setSearchOpen(false); }}
                                                    className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                                >
                                                    <img src={product.images[0]} className="w-12 h-16 object-cover rounded-sm" alt={product.name} />
                                                    <div>
                                                        <p className="text-xs font-bold text-[#111111] uppercase tracking-wider">{product.name}</p>
                                                        <p className="text-[10px] text-[#6B6457] font-medium">{product.category}</p>
                                                        <p className="text-xs font-black text-[#D4AF37] mt-1">₹{product.price.toLocaleString()}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No pieces found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════════════
                MOBILE MENU DRAWER
                Full slide-in panel from left — this was missing entirely
                ═══════════════════════════════════════════════════════════ */}

            {/* Overlay Backdrop */}
            <div
                className={`fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
                    mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={closeMobileMenu}
                aria-hidden="true"
            />

            {/* Drawer Panel */}
            <div
                ref={drawerRef}
                id="mobile-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                className={`fixed top-0 left-0 h-full w-[85vw] max-w-[340px] bg-white z-[160] flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E3D8] flex-shrink-0">
                    <Link to="/" onClick={closeMobileMenu}>
                        <img src={logoBlack} alt="BiNDAAS!" className="h-8 object-contain" />
                    </Link>
                    <button
                        onClick={closeMobileMenu}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label="Close menu"
                    >
                        <span className="material-icons-outlined text-[24px]">close</span>
                    </button>
                </div>

                {/* Drawer Body — Scrollable */}
                <div className="flex-1 overflow-y-auto py-4" data-lenis-prevent>

                    {/* Mobile Search */}
                    <div className="px-5 mb-4">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search pieces…"
                                className="w-full bg-slate-100 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD017] font-medium text-black placeholder-gray-500"
                            />
                        </form>
                    </div>

                    {/* Primary Nav Links */}
                    <nav>
                        <ul className="space-y-1 px-3">
                            <li>
                                <Link
                                    to="/men"
                                    onClick={closeMobileMenu}
                                    className="flex items-center px-4 py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-wider text-[#111111] hover:bg-[#FFD017]/10 hover:text-[#111111] transition-colors active:bg-[#FFD017]/20"
                                >
                                    <span className="material-icons-outlined text-[18px] mr-3 text-[#D4AF37]">male</span>
                                    Men
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/women"
                                    onClick={closeMobileMenu}
                                    className="flex items-center px-4 py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-wider text-[#111111] hover:bg-[#FFD017]/10 transition-colors active:bg-[#FFD017]/20"
                                >
                                    <span className="material-icons-outlined text-[18px] mr-3 text-[#D4AF37]">female</span>
                                    Women
                                </Link>
                            </li>

                            {/* Collections accordion */}
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setIsCollectionsOpen(p => !p)}
                                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-wider text-[#111111] hover:bg-[#FFD017]/10 transition-colors active:bg-[#FFD017]/20"
                                    aria-expanded={isCollectionsOpen}
                                >
                                    <span className="flex items-center">
                                        <span className="material-icons-outlined text-[18px] mr-3 text-[#D4AF37]">style</span>
                                        Collections
                                    </span>
                                    <span className={`material-icons-outlined text-[18px] transition-transform duration-200 ${isCollectionsOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                </button>

                                {/* Collections sub-list */}
                                {isCollectionsOpen && (
                                    <ul className="mt-1 ml-10 space-y-1 border-l-2 border-[#FFD017]/40 pl-4">
                                        {featuredCollections.map((col, idx) => (
                                            <li key={idx}>
                                                <Link
                                                    to={col.link}
                                                    onClick={closeMobileMenu}
                                                    className="block py-2 text-[12px] font-semibold text-[#6B6457] hover:text-[#111111] transition-colors"
                                                >
                                                    {col.title}
                                                </Link>
                                            </li>
                                        ))}
                                        <li>
                                            <Link to="/shop" onClick={closeMobileMenu} className="block py-2 text-[11px] font-bold uppercase tracking-widest text-[#D4AF37] hover:text-[#111111] transition-colors">
                                                View All Drops →
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </li>

                            <li>
                                <Link
                                    to="/heritage"
                                    onClick={closeMobileMenu}
                                    className="flex items-center px-4 py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-wider text-[#111111] hover:bg-[#FFD017]/10 transition-colors active:bg-[#FFD017]/20"
                                >
                                    <span className="material-icons-outlined text-[18px] mr-3 text-[#D4AF37]">history_edu</span>
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/membership"
                                    onClick={closeMobileMenu}
                                    className="flex items-center px-4 py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-wider text-[#111111] hover:bg-[#FFD017]/10 transition-colors active:bg-[#FFD017]/20"
                                >
                                    <span className="material-icons-outlined text-[18px] mr-3 text-[#D4AF37]">workspace_premium</span>
                                    Membership
                                </Link>
                            </li>
                        </ul>

                        {/* Divider */}
                        <div className="my-4 mx-5 border-t border-[#E8E3D8]" />

                        {/* Secondary Links */}
                        <ul className="space-y-1 px-3">
                            <li>
                                <Link to="/cart" onClick={closeMobileMenu} className="flex items-center justify-between px-4 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wider text-[#111111] hover:bg-slate-100 transition-colors">
                                    <span className="flex items-center gap-3">
                                        <span className="material-icons-outlined text-[18px] text-slate-400">shopping_bag</span>
                                        My Bag
                                    </span>
                                    {cartCount > 0 && <span className="bg-[#FFD017] text-[#111111] text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
                                </Link>
                            </li>
                            <li>
                                <Link to="/wishlist" onClick={closeMobileMenu} className="flex items-center justify-between px-4 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wider text-[#111111] hover:bg-slate-100 transition-colors">
                                    <span className="flex items-center gap-3">
                                        <span className="material-icons-outlined text-[18px] text-slate-400">favorite_border</span>
                                        Wishlist
                                    </span>
                                    {wishlistCount > 0 && <span className="bg-[#ff3f6c] text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{wishlistCount}</span>}
                                </Link>
                            </li>
                            {user && (
                                <li>
                                    <Link to="/profile" onClick={closeMobileMenu} className="flex items-center px-4 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wider text-[#111111] hover:bg-slate-100 transition-colors gap-3">
                                        <span className="material-icons-outlined text-[18px] text-slate-400">person_outline</span>
                                        My Profile
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </nav>
                </div>

                {/* Drawer Footer — Auth CTA */}
                <div className="px-5 py-4 border-t border-[#E8E3D8] flex-shrink-0">
                    {user ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={user.picture} className="w-9 h-9 rounded-full border-2 border-[#FFD017]" alt="Profile" onError={(e) => { e.target.style.display = 'none'; }} />
                                <div>
                                    <p className="text-[11px] font-bold text-[#111111] uppercase tracking-wider">{user.given_name || user.name || 'Member'}</p>
                                    <p className="text-[10px] text-[#6B6457]">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { logOut(); navigate('/'); closeMobileMenu(); }}
                                className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg border border-red-200 hover:border-red-400"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="w-full bg-[#111111] text-white py-3.5 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-icons-outlined text-[18px]">person_outline</span>
                            Sign In / Register
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;
