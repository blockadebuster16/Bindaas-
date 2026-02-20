import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const { user, googleSignIn, logOut } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await googleSignIn();
            navigate('/profile');
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <>
            {/* Promo Bar */}
            <div className="w-full bg-white text-[#10221c] text-[10px] uppercase tracking-[0.2em] py-2 text-center font-bold border-b border-gray-100 font-['Manrope']">
                Join Club BINDASS!! to enjoy exclusive benefits!
            </div>

            <header className="sticky top-0 z-[100] bg-[#10221c] text-white font-['Manrope']">
                {/* Top Row: Logo, Search, Utilities */}
                <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Left: Logo */}
                    <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                        <div className="w-8 h-5 bg-white rounded-[2px] flex items-center justify-center">
                            <span className="material-icons-outlined text-[#10221c] text-sm">architecture</span>
                        </div>
                        <span className="text-xl font-extrabold tracking-tighter uppercase">BINDASS!!</span>
                    </Link>

                    {/* Center: Search */}
                    <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
                        <div className="relative group">
                            <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004526]">search</span>
                            <input
                                type="text"
                                placeholder="Find a piece"
                                className="w-full bg-white text-slate-900 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#004526] placeholder-slate-400 font-medium transition-shadow"
                            />
                        </div>
                    </div>

                    {/* Right: Utilities */}
                    <div className="flex items-center space-x-6">
                        <Link to="/" className="hover:text-emerald-400 transition-colors"><span className="material-icons-outlined">room</span></Link>
                        <Link to="/" className="hover:text-emerald-400 transition-colors"><span className="material-icons-outlined">favorite_border</span></Link>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link to="/profile" className="hover:text-emerald-400 transition-colors" title="View Profile">
                                    <img src={user.photoURL} className="w-6 h-6 rounded-full border border-white/20" alt="pfp" />
                                </Link>
                                <button
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to logout?")) {
                                            logOut();
                                            navigate('/');
                                        }
                                    }}
                                    className="material-icons-outlined hover:text-red-400 text-[18px] transition-colors"
                                    title="Logout"
                                >
                                    logout
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleLogin} className="material-icons-outlined hover:text-emerald-400">person_outline</button>
                        )}

                        <Link to="/cart" className="relative hover:text-emerald-400 transition-colors">
                            <span className="material-icons-outlined">shopping_bag</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-white text-[#10221c] text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Bottom Row: Navigation & Mega Menu */}
                <nav className="border-t border-white/10 relative">
                    <ul className="flex justify-center items-center flex-wrap gap-x-6 xl:gap-x-8 py-3 text-[11px] font-bold uppercase tracking-widest">

                        {/* India Exclusives */}
                        <li className="group static">
                            <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer py-2 px-2 -mx-2 bg-transparent group-hover:bg-[#152e26]">
                                India Exclusives
                                <span className="material-icons-outlined text-[14px]">expand_more</span>
                            </Link>
                            {/* Mega Menu Dropdown */}
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
                                        {/* Close Button Placeholder (Functionality usually handled by mouseleave on web) */}
                                        <button className="text-white hover:text-emerald-400 self-start">
                                            <span className="material-icons-outlined">close</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>

                        {/* New In */}
                        <li className="group static">
                            <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer py-2 px-2 -mx-2 bg-transparent group-hover:bg-[#152e26]">
                                New In
                                <span className="material-icons-outlined text-[14px]">expand_more</span>
                            </Link>
                            <div className="absolute left-0 top-full w-full bg-[#10221c] text-white shadow-2xl transition-all duration-300 transform origin-top scale-y-0 group-hover:scale-y-100 opacity-0 group-hover:opacity-100 visible group-hover:visible border-t border-white/10 z-50">
                                <div className="max-w-[1440px] mx-auto px-6 py-10 max-h-[80vh] overflow-y-auto">
                                    <div className="flex justify-between items-start">
                                        <div className="w-48 pt-1">
                                            <Link to="/" className="block text-xs font-bold uppercase hover:text-emerald-400">View All New In</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>

                        {/* Standard Links */}
                        <li><Link to="/men" className="hover:text-emerald-400 transition-colors text-white">Men</Link></li>
                        <li><Link to="/women" className="hover:text-emerald-400 transition-colors text-white">Women</Link></li>
                        <li><Link to="/kids" className="hover:text-emerald-400 transition-colors text-white">Kids</Link></li>
                        <li><Link to="/sale" className="hover:text-emerald-400 transition-colors text-white">Sale</Link></li>

                        {/* We are Bindass!! Mega Menu */}
                        <li className="group static">
                            <Link
                                to="/"
                                className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer py-2 px-2 -mx-2 bg-transparent group-hover:bg-[#152e26]"
                            >
                                We are Bindass!!
                                <span className="material-icons-outlined text-[14px]">expand_more</span>
                            </Link>

                            {/* Mega Menu Dropdown */}
                            <div className="absolute left-0 top-full w-full bg-[#10221c] text-white shadow-2xl transition-all duration-300 transform origin-top scale-y-0 group-hover:scale-y-100 opacity-0 group-hover:opacity-100 visible group-hover:visible border-t border-white/10 z-50">
                                <section className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-200">
                                    {/* Column 1: Commitments */}
                                    <div className="relative group/card cursor-pointer overflow-hidden border-r border-white/10">
                                        <div className="aspect-[4/3] h-64 w-full">
                                            <img
                                                alt="Discover Our Commitments"
                                                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 opacity-80 group-hover/card:opacity-100"
                                                src="https://images.unsplash.com/photo-1620799140408-ed5341cd2431?q=80&w=800&auto=format&fit=crop"
                                            />
                                        </div>
                                        <div className="bg-[#152e26] p-4 absolute bottom-0 w-full">
                                            <h3 className="text-white text-xs font-bold uppercase tracking-widest text-center">
                                                Discover Our Commitments
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Column 2: Heritage */}
                                    <Link to="/heritage" className="relative group/card cursor-pointer overflow-hidden border-r border-white/10 block">
                                        <div className="aspect-[4/3] h-64 w-full">
                                            <img
                                                alt="Bindass Story"
                                                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 grayscale group-hover/card:grayscale-0"
                                                src="https://images.unsplash.com/photo-1554062975-23b21bfe3664?q=80&w=2000&auto=format&fit=crop"
                                            />
                                        </div>
                                        <div className="bg-[#152e26] p-4 absolute bottom-0 w-full group-hover/card:bg-[#11d490] transition-colors">
                                            <h3 className="text-white group-hover/card:text-[#10221c] text-xs font-bold uppercase tracking-widest text-center transition-colors">
                                                Bindass Story
                                            </h3>
                                        </div>
                                    </Link>

                                    {/* Column 3: Sport Collection */}
                                    <Link to="/sport" className="relative group/card cursor-pointer overflow-hidden border-r border-white/10 block">
                                        <div className="aspect-[4/3] h-64 w-full">
                                            <img
                                                alt="Bindass Sport"
                                                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7808qIvwuvaB__KXj775ubfVz-WesZbrtFib_cgqLoUrSziunoBofXdZp-qAzZmYz3a7Hu43EcTCKpBbxIE4SiQ_9hc25gsP-B_DCuge4VFbKZC_530XEnodiEv-ijoXTzcrEg-FF8zL0z0KedoFzj7lFuz5TSBwvdkvP2qCeXHc8rLRCJky6nPChr3vVAC7-pAy308DY4mmcWvKi2u5xWW0F09MIErImZXqcSKEKrEgRuX5mOaUVOvnVfUFkeFgJugFfcHxKDrFR"
                                            />
                                        </div>
                                        <div className="bg-[#152e26] p-4 absolute bottom-0 w-full group-hover/card:bg-[#11d490] transition-colors">
                                            <h3 className="text-white group-hover/card:text-[#10221c] text-xs font-bold uppercase tracking-widest text-center transition-colors">
                                                Bindass Sport
                                            </h3>
                                        </div>
                                    </Link>

                                    {/* Column 4: Club */}
                                    <Link to="/membership" className="relative group/card cursor-pointer overflow-hidden block">
                                        <div className="aspect-[4/3] h-64 w-full">
                                            <img
                                                alt="Le Club Bindass"
                                                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
                                                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop"
                                            />
                                        </div>
                                        <div className="bg-[#11d490] p-4 absolute bottom-0 w-full flex items-center justify-between">
                                            <h3 className="text-[#10221c] text-xs font-bold uppercase tracking-widest mx-auto">
                                                Le Club Bindass
                                            </h3>
                                        </div>
                                    </Link>
                                </section>
                            </div>
                        </li>
                    </ul>
                </nav>
            </header>
        </>
    );
};

export default Navbar;