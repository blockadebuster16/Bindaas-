import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-100 pt-16 pb-8 font-['Manrope']">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand Identity */}
                <div className="space-y-4">
                    <h2 className="text-xl dark:text-black font-extrabold tracking-tighter uppercase">BINDASS!!</h2>
                    <p className="text-slate-500 text-xs font-light leading-relaxed">
                        The intersection of athletic energy and high-fashion luxury. Defining the modern silhouette since 2026.
                    </p>
                </div>

                {/* Collections */}
                <div>
                    <h5 className="text-[10px] dark:text-black font-bold uppercase tracking-widest mb-6">Collections</h5>
                    <ul className="text-xs text-slate-500 space-y-3 font-medium">
                        <li><Link to="/men" className="hover:text-emerald-500 transition-colors">Men's Polo Hub</Link></li>
                        <li><Link to="/women" className="hover:text-emerald-500 transition-colors">Women's Collection</Link></li>
                        <li><Link to="/" className="hover:text-emerald-500 transition-colors">New Arrivals</Link></li>
                        <li><Link to="/kids" className="hover:text-emerald-500 transition-colors">Kids & Junior</Link></li>
                    </ul>
                </div>

                {/* Our Universe - UPDATED with Heritage */}
                <div>
                    <h5 className="text-[10px] dark:text-black font-bold uppercase tracking-widest mb-6">Our Universe</h5>
                    <ul className="text-xs text-slate-500 space-y-3 font-medium">
                        <li>
                            <Link to="/heritage" className="text-[#10221c] font-bold hover:text-emerald-500 transition-colors">
                                Our Heritage Story
                            </Link>
                        </li>
                        <li><Link to="/profile" className="hover:text-emerald-500 transition-colors">My Account</Link></li>
                        <li><Link to="/" className="hover:text-emerald-500 transition-colors">Sustainability</Link></li>
                        <li><Link to="/" className="hover:text-emerald-500 transition-colors">Shipping & Returns</Link></li>
                    </ul>
                </div>

                {/* Newsletter Subscription */}
                <div>
                    <h5 className="text-[10px] dark:text-black font-bold uppercase tracking-widest mb-6">Newsletter</h5>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tight mb-4">Subscribe for exclusive access to drops.</p>
                    <form className="flex border-b border-black py-2">
                        <input
                            type="email"
                            placeholder="Email address"
                            className="bg-transparent w-full text-xs focus:outline-none placeholder:text-slate-300"
                        />
                        <button type="submit" className="text-[10px] font-bold uppercase tracking-widest hover:text-emerald-500 transition-colors">OK</button>
                    </form>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[9px] text-slate-400 uppercase tracking-widest">
                    © 2026 BINDASS!! Co. All Rights Reserved.
                </p>
                <div className="flex gap-6 text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                    <Link to="/" className="hover:text-black transition-colors">Privacy Policy</Link>
                    <Link to="/" className="hover:text-black transition-colors">Terms of Service</Link>
                    <Link to="/" className="hover:text-black transition-colors">Cookie Settings</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;