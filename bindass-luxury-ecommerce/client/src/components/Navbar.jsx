import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import axios from 'axios';

import logoBlack from '../assets/text-logo-black-transparent.png';

const loadGoogleFont = (family) => {
    if (!family || document.querySelector(`link[data-gfont="${family}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
    link.setAttribute('data-gfont', family);
    document.head.appendChild(link);
};

const RenderText = ({ value, svgUrl, bold, italic, stroke, strokeColor, strokeWidth, fontSize, fontFamily, className = '', style = {}, tag: Tag = 'span' }) => {
    if (svgUrl) {
        return <img src={svgUrl} alt={value} className={`inline-block object-contain max-h-[1.4em] ${className}`} style={style} />;
    }
    const computedStyle = {
        ...style,
        fontWeight: bold ? '900' : undefined,
        fontStyle: italic ? 'italic' : undefined,
        WebkitTextStroke: stroke ? `${strokeWidth || '2'}px ${strokeColor || '#000000'}` : undefined,
        paintOrder: stroke ? 'stroke fill' : undefined,
        fontSize: fontSize ? `${fontSize}px` : undefined,
        fontFamily: fontFamily ? `'${fontFamily}', sans-serif` : undefined,
    };
    return <Tag className={className} style={computedStyle}>{value}</Tag>;
};

const Navbar = () => {
    const { user, setIsAuthModalOpen, logOut } = useAuth();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [promoAd, setPromoAd] = useState('loading');
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isCollectionsHovered, setIsCollectionsHovered] = useState(false);
    const [hasHeroAtTop, setHasHeroAtTop] = useState(false);

    // Dynamic detection: check if a Hero Banner exists on the current page layout
    useEffect(() => {
        const checkHeroAtTop = () => {
            const heroEl = document.querySelector('.hero-banner-top');
            setHasHeroAtTop(!!heroEl);
        };

        checkHeroAtTop();
        const timer = setInterval(checkHeroAtTop, 500);
        window.addEventListener('resize', checkHeroAtTop);

        return () => {
            clearInterval(timer);
            window.removeEventListener('resize', checkHeroAtTop);
        };
    }, [location.pathname]);

    // Track scroll position for header color transition
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const handleLogin = async () => {
        setIsAuthModalOpen(true);
    };

    useEffect(() => {
        const fetchPromoAd = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/advertisements?bannerType=promo');
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
                    const { data } = await axios.get(`http://localhost:5001/api/products/search?q=${searchQuery}`);
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

    // Featured collections for the Bluorng style dropdown
    const featuredCollections = [
        { title: "Valentine Special", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=500&auto=format&fit=crop", link: "/shop?cat=valentine" },
        { title: "Caps & Headwear", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=500&auto=format&fit=crop", link: "/shop?cat=caps" },
        { title: "Winter Collection '25", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=500&auto=format&fit=crop", link: "/shop?cat=winter" },
        { title: "Bindass Racing Club", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=500&auto=format&fit=crop", link: "/shop?cat=racing" },
        { title: "Studio Basics", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=500&auto=format&fit=crop", link: "/shop?cat=basics" },
        { title: "Yacht & Summer Line", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500&auto=format&fit=crop", link: "/shop?cat=yacht" }
    ];

    // Header transparent overlay ONLY applies if a Hero Banner is active at top of page, unscrolled, and not hovered
    const isTransparentOverlay = hasHeroAtTop && !isScrolled && !isCollectionsHovered;

    let headerClasses = "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 font-['Outfit','Manrope',sans-serif] ";
    if (isTransparentOverlay) {
        headerClasses += "bg-transparent text-white border-transparent shadow-none py-2";
    } else {
        headerClasses += "bg-white text-[#111111] shadow-md border-b border-slate-200 py-1";
    }

    return (
        <>
            {/* Layout Spacer when page does NOT start with a Hero Banner */}
            {!hasHeroAtTop && <div className="h-16 md:h-20" />}

            {/* Promo Bar */}
            {promoAd && promoAd !== 'loading' ? (
                <div
                    className="w-full tracking-[0.2em] py-1.5 text-center border-b border-[#E8E3D8] font-['Outfit','Manrope',sans-serif] px-4 flex items-center justify-center overflow-hidden z-[101] relative"
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
                            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <span className="material-icons-outlined text-[22px]">menu</span>
                        </button>
                        <Link to="/" className="flex items-center flex-shrink-0 my-auto">
                            <img 
                                src={logoBlack} 
                                alt="BiNDAAS!" 
                                className={`h-8 md:h-9 object-contain transition-all duration-300 ${
                                    isTransparentOverlay ? 'brightness-0 invert' : ''
                                }`} 
                            />
                        </Link>
                    </div>

                    {/* Desktop Left Group: Logo + Navigation Links */}
                    <div className="hidden lg:flex items-center gap-7 lg:gap-9 flex-1">
                        <Link to="/" className="flex items-center flex-shrink-0 my-auto">
                            <img 
                                src={logoBlack} 
                                alt="BiNDAAS!" 
                                className={`h-10 md:h-[42px] lg:h-12 object-contain transition-all duration-300 ${
                                    isTransparentOverlay ? 'brightness-0 invert' : ''
                                }`} 
                            />
                        </Link>

                        {/* Inline Menu Links */}
                        <nav className="flex items-center">
                            <ul className="flex items-center gap-5 xl:gap-7 text-[11px] font-bold uppercase tracking-[0.16em]">
                                <li>
                                    <Link to="/men" className={`transition-colors py-1 hover:text-[#D4AF37] ${isTransparentOverlay ? 'text-white' : 'text-[#111111]'}`}>
                                        Men
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/women" className={`transition-colors py-1 hover:text-[#D4AF37] ${isTransparentOverlay ? 'text-white' : 'text-[#111111]'}`}>
                                        Women
                                    </Link>
                                </li>

                                {/* ── COLLECTIONS MEGA DROPDOWN ── */}
                                <li 
                                    className="group static"
                                    onMouseEnter={() => setIsCollectionsHovered(true)}
                                    onMouseLeave={() => setIsCollectionsHovered(false)}
                                >
                                    <Link 
                                        to="/shop" 
                                        className={`transition-colors py-1.5 flex items-center gap-1 hover:text-[#D4AF37] ${isTransparentOverlay ? 'text-white' : 'text-[#111111]'}`}
                                    >
                                        Collections
                                        <span className="material-icons-outlined text-[15px]">expand_more</span>
                                    </Link>

                                    {/* Mega Dropdown Menu (Bluorng Style Cards) */}
                                    <div className="absolute left-0 top-full w-full bg-white text-black shadow-2xl transition-all duration-300 transform origin-top scale-y-0 group-hover:scale-y-100 opacity-0 group-hover:opacity-100 visible group-hover:visible border-t border-slate-100 z-50 rounded-b-3xl p-6 md:p-8">
                                        <div className="max-w-[1440px] mx-auto">
                                            <div className="flex items-center justify-between mb-5">
                                                <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-400">Featured Collections</span>
                                                <Link to="/shop" className="text-[11px] font-bold uppercase tracking-wider text-black hover:text-[#D4AF37] transition-colors">
                                                    View All Drops →
                                                </Link>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                                {featuredCollections.map((col, idx) => (
                                                    <Link key={idx} to={col.link} className="group/col block text-center space-y-2">
                                                        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-sm relative">
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
                                    </div>
                                </li>

                                <li>
                                    <Link to="/heritage" className={`transition-colors py-1 hover:text-[#D4AF37] ${isTransparentOverlay ? 'text-white' : 'text-[#111111]'}`}>
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/membership" className={`transition-colors py-1 hover:text-[#D4AF37] ${isTransparentOverlay ? 'text-white' : 'text-[#111111]'}`}>
                                        Membership
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    {/* Right Group: Action Icons */}
                    <div className="flex items-center gap-4 md:gap-5 flex-shrink-0">

                        {/* Search Icon */}
                        <button
                            onClick={handleSearchIconClick}
                            aria-label="Search"
                            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <span className="material-icons-outlined text-[24px]">{searchOpen ? 'close' : 'search'}</span>
                        </button>


                        {/* Wishlist */}
                        <Link to="/wishlist" className="relative hover:text-[#ff3f6c] transition-colors flex items-center">
                            <span className="material-icons-outlined text-[24px]">favorite_border</span>
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#ff3f6c] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* User */}
                        {user ? (
                            <div className="hidden md:flex items-center gap-3">
                                <Link to="/profile" title="View Profile" className="flex items-center">
                                    <img src={user.photoURL} className="w-7 h-7 rounded-full border border-white/30" alt="pfp" />
                                </Link>
                                <button
                                    onClick={() => { if (window.confirm("Logout?")) { logOut(); navigate('/'); } }}
                                    className="material-icons-outlined hover:text-red-400 text-[22px] transition-colors flex items-center"
                                >logout</button>
                            </div>
                        ) : (
                            <button onClick={handleLogin} className="material-icons-outlined text-[24px] hover:opacity-80 hidden md:flex items-center">person_outline</button>
                        )}

                        {/* Cart */}
                        <Link to="/cart" className="relative hover:opacity-80 transition-opacity flex items-center">
                            <span className="material-icons-outlined text-[24px]">shopping_bag</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#FFD017] text-[#111111] text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                    {cartCount}
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
                        <form onSubmit={handleSearchSubmit} className="relative group">
                            <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                            <input
                                id="navbar-search-input"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length > 2 && setShowResults(true)}
                                placeholder="Find a piece…"
                                className={`w-full rounded-full py-3 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-white font-medium transition-shadow ${
                                    isTransparentOverlay ? 'bg-white/10 text-white placeholder-slate-400' : 'bg-gray-100 text-black placeholder-gray-500'
                                }`}
                            />
                            {searchLoading && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                        </form>

                        {/* Search Results Preview */}
                        {showResults && (
                            <div className="absolute top-full left-4 right-4 md:left-6 md:right-6 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[200]">
                                <div className="max-h-[320px] overflow-y-auto">
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
        </>
    );
};

export default Navbar;