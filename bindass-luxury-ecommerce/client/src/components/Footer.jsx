import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;
        setSubmitting(true);
        setStatus({ type: '', message: '' });
        try {
            await axios.post('http://localhost:5001/api/forms/subscribe', { email });
            setStatus({ type: 'success', message: 'Subscribed!' });
            setEmail('');
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed' });
        } finally {
            setSubmitting(false);
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        }
    };
    return (
        <footer className="bg-white border-t border-slate-100 pt-16 pb-8 font-['Manrope']">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand Identity */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-xl dark:text-black font-extrabold tracking-tighter uppercase">BINDASS!!</h2>
                        <p className="text-slate-500 text-xs font-light leading-relaxed">
                            The intersection of athletic energy and high-fashion luxury. Defining the modern silhouette since 2026.
                        </p>
                    </div>

                    {/* Social Media - "Follow Us" */}
                    <div className="pt-2">
                        <h5 className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em] mb-4">Follow Us</h5>
                        <div className="flex gap-3">
                            {[
                                { icon: 'facebook', link: '#' },
                                { icon: 'instagram', link: '#' },
                                { icon: 'x', link: '#' },
                                { icon: 'linkedin', link: '#' },
                                { icon: 'github', link: '#' }
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.link}
                                    className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-emerald-500 transition-all duration-300 hover:-translate-y-1 shadow-sm"
                                >
                                    <img
                                        src={`https://cdn.simpleicons.org/${social.icon}/fff`}
                                        alt={social.icon}
                                        className="w-4 h-4 opacity-90"
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Collections */}
                <div>
                    <h5 className="text-[10px] dark:text-black font-bold uppercase tracking-widest mb-6">Collections</h5>
                    <ul className="text-xs text-slate-500 space-y-3 font-medium">
                        <li><Link to="/men" className="hover:text-emerald-500 transition-colors">Men's Polo Hub</Link></li>
                        <li><Link to="/women" className="hover:text-emerald-500 transition-colors">Women's Collection</Link></li>
                        <li><Link to="/" className="hover:text-emerald-500 transition-colors">New Arrivals</Link></li>
                        <li><Link to="/apparel" className="hover:text-emerald-500 transition-colors">Kids & Junior</Link></li>
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
                        <li><Link to="/contact" className="hover:text-emerald-500 transition-colors">Contact Us</Link></li>
                        <li><Link to="/terms" className="hover:text-emerald-500 transition-colors">Terms & Conditions</Link></li>
                        <li><Link to="/privacy" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
                        <li><Link to="/sustainability" className="hover:text-emerald-500 transition-colors">Sustainability</Link></li>
                        <li><Link to="/faq" className="hover:text-emerald-500 transition-colors">FAQ</Link></li>
                        <li><Link to="/" className="hover:text-emerald-500 transition-colors">Shipping & Returns</Link></li>
                    </ul>
                </div>

                {/* Newsletter Subscription */}
                <div>
                    <h5 className="text-[10px] dark:text-black font-bold uppercase tracking-widest mb-6">Newsletter</h5>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tight mb-4">Subscribe for exclusive access to drops.</p>
                    <form onSubmit={handleSubscribe} className="flex border-b border-black py-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="bg-transparent w-full text-xs focus:outline-none placeholder:text-slate-300"
                        />
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className={`text-[10px] font-bold uppercase tracking-widest hover:text-emerald-500 transition-colors ${submitting ? 'opacity-50' : ''}`}
                        >
                            {submitting ? '...' : 'OK'}
                        </button>
                    </form>
                    {status.message && (
                        <p className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${status.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {status.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-50 flex flex-col items-center gap-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                    © 2026 Bindass!!. All rights reserved.
                </p>
                <p className="text-[11px] text-slate-400 font-medium text-center flex items-center gap-1.5">
                    Designed with <span className="text-rose-500 animate-pulse">❤️</span> in Mumbai <span className="text-rose-500 animate-pulse"> </span> | <span className="text-rose-500 animate-pulse"> </span> Made in India , Made for the World 🌏
                </p>
                <div className="flex gap-6 text-[8px] text-slate-300 uppercase tracking-[0.2em] font-bold mt-4">
                    <Link to="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-black transition-colors">Terms of Service</Link>
                    <Link to="/cookies" className="hover:text-black transition-colors">Cookie Settings</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;