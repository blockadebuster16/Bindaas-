import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';

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
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

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
                // Optimized fetch: Only the promo record needed for the top bar
                const { data } = await axios.get('https://bindaas-ucyv.onrender.com/api/advertisements?bannerType=promo');
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
                    const { data } = await axios.get(`${API_BASE_URL}/api/products/search?q=${searchQuery}`);
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
            setMobileSearchOpen(false);
        }
    };

    const navLinks = [
        { label: 'Men', to: '/men' },
        { label: 'Women', to: '/women' },
        { label: 'Kids', to: '/kids' },
        { label: 'Sale', to: '/sale' },
        { label: 'Heritage', to: '/heritage' },
        { label: 'Sport', to: '/sport' },
        { label: 'Membership', to: '/membership' },
    ];

    return (
        <>
            {/* Promo Bar */}
            {promoAd && promoAd !== 'loading' ? (
                <div
                    className="w-full tracking-[0.2em] py-2 text-center border-b border-gray-100 font-['Manrope'] px-4 flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: promoAd.tagColor || '#ffffff' }}
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
                        style={{ color: promoAd.titleColor || '#10221c' }}
                    />
                </div>
            ) : promoAd === 'loading' ? (
                <div className="w-full bg-white text-[#10221c] text-[10px] uppercase tracking-[0.2em] py-2 text-center font-bold border-b border-gray-100 font-['Manrope']">
                    Join Club BINDASS!! to enjoy exclusive benefits!
                </div>
            ) : null}

            <header className="sticky top-0 z-[100] bg-white text-black font-['Manrope'] shadow-sm">
                {/* Top Row */}
                <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-3">

                    {/* Mobile: Hamburger */}
                    <button
                        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <span className="material-icons-outlined text-[22px]">menu</span>
                    </button>

                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                        <div className="w-7 h-5 md:w-8 bg-[#10221c] rounded-[2px] flex items-center justify-center">
                            <span className="material-icons-outlined text-white text-sm">architecture</span>
                        </div>
                        <span className="text-lg md:text-xl font-extrabold tracking-tighter uppercase">BINDASS!!</span>
                    </Link>

                    {/* Center: Desktop Search */}
                    <div className="flex-1 max-w-2xl mx-8 hidden lg:block relative">
                        <form onSubmit={handleSearchSubmit} className="relative group">
                            <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004526]">search</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length > 2 && setShowResults(true)}
                                placeholder="Find a piece"
                                className="w-full bg-slate-100 text-slate-900 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#004526] placeholder-slate-500 font-medium transition-shadow"
                            />
                            {searchLoading && <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin rounded-full h-4 w-4 border-b-2 border-[#10221c]"></div>}
                        </form>

                        {/* Search Results Preview */}
                        {showResults && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[200]">
                                <div className="max-h-[400px] overflow-y-auto">
                                    {searchResults.length > 0 ? (
                                        <div className="py-2">
                                            {searchResults.map(product => (
                                                <Link 
                                                    key={product._id} 
                                                    to={`/product/${product._id}`}
                                                    onClick={() => { setShowResults(false); setSearchQuery(''); }}
                                                    className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                                >
                                                    <img src={product.images[0]} className="w-12 h-16 object-cover rounded-sm" alt={product.name} />
                                                    <div>
                                                        <p className="text-xs font-bold text-[#10221c] uppercase tracking-wider">{product.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">{product.category}</p>
                                                        <p className="text-xs font-black text-emerald-800 mt-1">₹{product.price.toLocaleString()}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                            <button 
                                                onClick={handleSearchSubmit}
                                                className="w-full py-3 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.2em] text-[#10221c] hover:bg-slate-100 transition-colors"
                                            >
                                                View All Results
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No pieces found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {showResults && <div className="fixed inset-0 z-[-1]" onClick={() => setShowResults(false)}></div>}
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center gap-4 md:gap-5">
                        {/* Mobile Search Toggle */}
                        <button
                            className="lg:hidden"
                            onClick={() => setMobileSearchOpen(p => !p)}
                            aria-label="Search"
                        >
                            <span className="material-icons-outlined text-[22px]">search</span>
                        </button>

                        {/* Location (desktop only) */}
                        <Link to="/" className="hidden md:block hover:text-emerald-400 transition-colors">
                            <span className="material-icons-outlined">room</span>
                        </Link>

                        {/* Wishlist */}
                        <Link to="/wishlist" className="relative hover:text-[#ff3f6c] transition-colors">
                            <span className="material-icons-outlined text-[22px]">favorite_border</span>
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#ff3f6c] text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* User — desktop only */}
                        {user ? (
                            <div className="hidden md:flex items-center gap-3">
                                <Link to="/profile" title="View Profile">
                                    <img src={user.photoURL} className="w-6 h-6 rounded-full border border-gray-200" alt="pfp" />
                                </Link>
                                <button
                                    onClick={() => { if (window.confirm("Logout?")) { logOut(); navigate('/'); } }}
                                    className="material-icons-outlined hover:text-red-400 text-[18px] transition-colors"
                                >logout</button>
                            </div>
                        ) : (
                            <button onClick={handleLogin} className="material-icons-outlined hover:text-emerald-400 hidden md:block">person_outline</button>
                        )}

                        {/* Cart */}
                        <Link to="/cart" className="relative hover:text-emerald-400 transition-colors">
                            <span className="material-icons-outlined text-[22px]">shopping_bag</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#10221c] text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Mobile Search Bar (expandable) */}
                {mobileSearchOpen && (
                    <div className="lg:hidden px-4 pb-3 border-t border-gray-100">
                        <form onSubmit={handleSearchSubmit} className="relative mt-3">
                            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Find a piece"
                                className="w-full bg-slate-100 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#004526] placeholder-slate-400"
                            />
                        </form>
                    </div>
                )}

                {/* Desktop Nav Row */}
                <nav className="border-t border-gray-200 relative hidden lg:block">
                    <ul className="flex justify-center items-center flex-wrap gap-x-6 xl:gap-x-8 py-3 text-[11px] font-bold uppercase tracking-widest">

                        {/* India Exclusives Mega Menu */}
                        <li className="group static">
                            <Link to="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1 cursor-pointer py-2 px-2 -mx-2 bg-transparent group-hover:bg-gray-100">
                                India Exclusives
                                <span className="material-icons-outlined text-[14px]">expand_more</span>
                            </Link>
                            <div className="absolute left-0 top-full w-full bg-[#10221c] text-white shadow-2xl transition-all duration-300 transform origin-top scale-y-0 group-hover:scale-y-100 opacity-0 group-hover:opacity-100 visible group-hover:visible border-t border-white/10 z-50">
                                <div className="max-w-[1440px] mx-auto px-6 py-10 max-h-[80vh] overflow-y-auto">
                                    <div className="flex justify-between items-start">
                                        <div className="w-48 space-y-4 pt-1">
                                            <Link to="/" className="block text-xs font-bold hover:text-emerald-400 uppercase tracking-wider">India Exclusives</Link>
                                            <Link to="/" className="block text-xs font-bold hover:text-emerald-400 uppercase tracking-wider">New In</Link>
                                        </div>
                                        <div className="w-48 border-l border-white/10 pl-8">
                                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Clothing</h4>
                                            <ul className="space-y-2 text-xs font-medium text-slate-300">
                                                <li><Link to="/men" className="hover:text-white hover:underline transition-colors">Polo Shirts</Link></li>
                                                <li><Link to="/men" className="hover:text-white hover:underline transition-colors">Shirts</Link></li>
                                            </ul>
                                        </div>
                                        <div className="w-48 border-l border-white/10 pl-8">
                                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Shoes</h4>
                                            <ul className="space-y-2 text-xs font-medium text-slate-300">
                                                <li><Link to="/men" className="hover:text-white hover:underline transition-colors">Sneakers</Link></li>
                                            </ul>
                                        </div>
                                        <div className="w-48 border-l border-white/10 pl-8">
                                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Accessories</h4>
                                            <ul className="space-y-2 text-xs font-medium text-slate-300">
                                                <li><Link to="/men" className="hover:text-white hover:underline transition-colors">Caps</Link></li>
                                            </ul>
                                        </div>
                                        <div className="w-48 border-l border-white/10 pl-8">
                                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Bags</h4>
                                            <ul className="space-y-2 text-xs font-medium text-slate-300">
                                                <li><Link to="/men" className="hover:text-white hover:underline transition-colors">Backpacks</Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>

                        {/* New In */}
                        <li className="group static">
                            <Link to="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1 cursor-pointer py-2 px-2 -mx-2 bg-transparent group-hover:bg-gray-100">
                                New In
                                <span className="material-icons-outlined text-[14px]">expand_more</span>
                            </Link>
                            <div className="absolute left-0 top-full w-full bg-[#10221c] text-white shadow-2xl transition-all duration-300 transform origin-top scale-y-0 group-hover:scale-y-100 opacity-0 group-hover:opacity-100 visible group-hover:visible border-t border-white/10 z-50">
                                <div className="max-w-[1440px] mx-auto px-6 py-10">
                                    <Link to="/" className="block text-xs font-bold uppercase hover:text-emerald-400">View All New In</Link>
                                </div>
                            </div>
                        </li>

                        <li><Link to="/men" className="hover:text-emerald-600 transition-colors">Men</Link></li>
                        <li><Link to="/women" className="hover:text-emerald-600 transition-colors">Women</Link></li>
                        <li><Link to="/kids" className="hover:text-emerald-600 transition-colors">Kids</Link></li>
                        <li><Link to="/sale" className="hover:text-emerald-600 transition-colors">Sale</Link></li>

                        {/* We are Bindass!! Mega Menu */}
                        <li className="group static">
                            <Link to="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1 cursor-pointer py-2 px-2 -mx-2 bg-transparent group-hover:bg-gray-100">
                                We are Bindass!!
                                <span className="material-icons-outlined text-[14px]">expand_more</span>
                            </Link>
                            <div className="absolute left-0 top-full w-full bg-[#10221c] text-white shadow-2xl transition-all duration-300 transform origin-top scale-y-0 group-hover:scale-y-100 opacity-0 group-hover:opacity-100 visible group-hover:visible border-t border-white/10 z-50">
                                <section className="grid grid-cols-4 border-b border-gray-200">
                                    <div className="relative group/card cursor-pointer overflow-hidden border-r border-white/10">
                                        <div className="aspect-[4/3] h-64 w-full">
                                            <img alt="Discover Our Commitments" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 opacity-80 group-hover/card:opacity-100" src="https://images.unsplash.com/photo-1620799140408-ed5341cd2431?q=80&w=800&auto=format&fit=crop" />
                                        </div>
                                        <div className="bg-[#152e26] p-4 absolute bottom-0 w-full">
                                            <h3 className="text-white text-xs font-bold uppercase tracking-widest text-center">Discover Our Commitments</h3>
                                        </div>
                                    </div>
                                    <Link to="/heritage" className="relative group/card cursor-pointer overflow-hidden border-r border-white/10 block">
                                        <div className="aspect-[4/3] h-64 w-full">
                                            <img alt="Bindass Story" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 grayscale group-hover/card:grayscale-0" src="https://images.unsplash.com/photo-1554062975-23b21bfe3664?q=80&w=2000&auto=format&fit=crop" />
                                        </div>
                                        <div className="bg-[#152e26] p-4 absolute bottom-0 w-full group-hover/card:bg-[#11d490] transition-colors">
                                            <h3 className="text-white group-hover/card:text-[#10221c] text-xs font-bold uppercase tracking-widest text-center transition-colors">Bindass Story</h3>
                                        </div>
                                    </Link>
                                    <Link to="/sport" className="relative group/card cursor-pointer overflow-hidden border-r border-white/10 block">
                                        <div className="aspect-[4/3] h-64 w-full">
                                            <img alt="Bindass Sport" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7808qIvwuvaB__KXj775ubfVz-WesZbrtFib_cgqLoUrSziunoBofXdZp-qAzZmYz3a7Hu43EcTCKpBbxIE4SiQ_9hc25gsP-B_DCuge4VFbKZC_530XEnodiEv-ijoXTzcrEg-FF8zL0z0KedoFzj7lFuz5TSBwvdkvP2qCeXHc8rLRCJky6nPChr3vVAC7-pAy308DY4mmcWvKi2u5xWW0F09MIErImZXqcSKEKrEgRuX5mOaUVOvnVfUFkeFgJugFfcHxKDrFR" />
                                        </div>
                                        <div className="bg-[#152e26] p-4 absolute bottom-0 w-full group-hover/card:bg-[#11d490] transition-colors">
                                            <h3 className="text-white group-hover/card:text-[#10221c] text-xs font-bold uppercase tracking-widest text-center transition-colors">Bindass Sport</h3>
                                        </div>
                                    </Link>
                                    <Link to="/membership" className="relative group/card cursor-pointer overflow-hidden block">
                                        <div className="aspect-[4/3] h-64 w-full">
                                            <img alt="Le Club Bindass" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop" />
                                        </div>
                                        <div className="bg-[#11d490] p-4 absolute bottom-0 w-full flex items-center justify-between">
                                            <h3 className="text-[#10221c] text-xs font-bold uppercase tracking-widest mx-auto">Le Club Bindass</h3>
                                        </div>
                                    </Link>
                                </section>
                            </div>
                        </li>
                    </ul>
                </nav>
            </header>

            {/* === MOBILE MENU DRAWER === */}
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[150] bg-black/50 transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Panel */}
            <div
                className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-[160] flex flex-col transition-transform duration-300 ease-out lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                        <div className="w-7 h-5 bg-[#10221c] rounded-[2px] flex items-center justify-center">
                            <span className="material-icons-outlined text-white text-sm">architecture</span>
                        </div>
                        <span className="text-lg font-extrabold tracking-tighter uppercase">BINDASS!!</span>
                    </Link>
                    <button onClick={() => setMobileMenuOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100">
                        <span className="material-icons-outlined text-[22px]">close</span>
                    </button>
                </div>

                {/* User in Drawer */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                    {user ? (
                        <>
                            <img src={user.photoURL} className="w-9 h-9 rounded-full border border-gray-200" alt="pfp" />
                            <div className="flex-1">
                                <p className="text-xs font-bold">{user.displayName}</p>
                                <Link to="/profile" className="text-[10px] text-emerald-600 uppercase tracking-widest font-bold" onClick={() => setMobileMenuOpen(false)}>View Profile</Link>
                            </div>
                            <button onClick={() => { logOut(); navigate('/'); setMobileMenuOpen(false); }} className="text-[10px] uppercase tracking-widest text-red-400 font-bold">Sign Out</button>
                        </>
                    ) : (
                        <button onClick={() => { handleLogin(); setMobileMenuOpen(false); }} className="w-full py-3 bg-[#10221c] text-white text-[11px] font-bold uppercase tracking-widest rounded-lg">
                            Sign In / Join
                        </button>
                    )}
                </div>

                {/* Nav Links */}
                <nav className="flex-1 overflow-y-auto py-3">
                    <ul className="divide-y divide-gray-50">
                        {navLinks.map(link => (
                            <li key={link.to}>
                                <Link
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between px-5 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                                >
                                    {link.label}
                                    <span className="material-icons-outlined text-[18px] text-gray-300">chevron_right</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Drawer Footer */}
                <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-around">
                    <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-gray-500">
                        <span className="material-icons-outlined text-[22px]">favorite_border</span>
                        Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                    </Link>
                    <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-gray-500">
                        <span className="material-icons-outlined text-[22px]">shopping_bag</span>
                        Bag {cartCount > 0 && `(${cartCount})`}
                    </Link>
                </div>
            </div>
        </>
    );
};

export default Navbar;
