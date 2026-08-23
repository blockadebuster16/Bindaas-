import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import logoWhite from '../assets/logo-white.svg';

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
            await axios.post(`${API_BASE_URL}/api/forms/subscribe`, { email });
            setStatus({ type: 'success', message: 'Welcome to the inner circle!' });
            setEmail('');
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Subscription failed.' });
        } finally {
            setSubmitting(false);
            setTimeout(() => setStatus({ type: '', message: '' }), 4000);
        }
    };

    return (
        <footer className="bg-bindas-onyx text-white border-t border-[#2A2A2A] font-sans relative overflow-hidden">
            {/* Top Newsletter Strip (Bluorng Style) */}
            <div className="border-b border-[#2A2A2A] bg-[#161616] py-5 px-6 md:px-12">
                <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="text-center lg:text-left space-y-0.5">
                        <span className="text-bindas-amber font-bold uppercase tracking-[0.25em] text-[9px]">
                            Join The Inner Circle
                        </span>
                        <h3 className="text-base md:text-lg font-extrabold uppercase tracking-tight font-['Playfair_Display',serif]">
                            Subscribe For Exclusive Drops & Early Access
                        </h3>
                    </div>
                    <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2.5 max-w-sm">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            className="bg-[#222222] border border-[#333333] text-white px-4 py-2 text-xs focus:outline-none focus:border-bindas-amber flex-1 rounded-full placeholder:text-slate-500 font-medium"
                            required
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-pill whitespace-nowrap px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] bg-bindas-amber text-bindas-onyx hover:bg-white hover:text-bindas-onyx"
                        >
                            {submitting ? 'Subscribing...' : 'Subscribe'}
                        </button>
                    </form>
                </div>
                {status.message && (
                    <div className="max-w-[1440px] mx-auto mt-3 text-center lg:text-right">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${status.type === 'success' ? 'text-bindas-amber' : 'text-rose-400'}`}>
                            {status.message}
                        </span>
                    </div>
                )}
            </div>

            {/* Main Links Grid */}
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-10 pb-8 grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                {/* 1. Order Support (Left) */}
                <div className="text-left">
                    <h5 className="text-[10px] text-bindas-amber font-bold uppercase tracking-[0.25em] mb-6">Order Support</h5>
                    <ul className="text-xs text-slate-300 space-y-3 font-medium">
                        <li><Link to="/profile" className="hover:text-bindas-amber transition-colors">Make a Return / Exchange</Link></li>
                        <li><Link to="/terms" className="hover:text-bindas-amber transition-colors">Refund & Exchange Policy</Link></li>
                        <li><Link to="/profile" className="hover:text-bindas-amber transition-colors">Track Your Order</Link></li>
                        <li><Link to="/terms" className="hover:text-bindas-amber transition-colors">Shipping Policy</Link></li>
                        <li><Link to="/faq" className="hover:text-bindas-amber transition-colors">FAQ's</Link></li>
                        <li><Link to="/terms" className="hover:text-bindas-amber transition-colors">Terms of Service</Link></li>
                    </ul>
                </div>

                {/* 2. We Are BiNDAAS! (Next) */}
                <div className="text-left">
                    <h5 className="text-[10px] text-bindas-amber font-bold uppercase tracking-[0.25em] mb-6">We Are BiNDAAS!</h5>
                    <ul className="text-xs text-slate-300 space-y-3 font-medium">
                        <li><Link to="/heritage" className="hover:text-bindas-amber transition-colors">Our Heritage Story</Link></li>
                        <li><Link to="/contact" className="hover:text-bindas-amber transition-colors">Walk-in Stores</Link></li>
                        <li><Link to="/sustainability" className="hover:text-bindas-amber transition-colors">Sustainability & Craft</Link></li>
                        <li><Link to="/contact" className="hover:text-bindas-amber transition-colors">Collaborations</Link></li>
                        <li><Link to="/contact" className="hover:text-bindas-amber transition-colors">Careers & Media</Link></li>
                        <li><Link to="/privacy" className="hover:text-bindas-amber transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>

                {/* 3. Connect With Us (Last text column) */}
                <div className="text-left space-y-4">
                    <h5 className="text-[10px] text-bindas-amber font-bold uppercase tracking-[0.25em]">Connect With Us</h5>
                    <p className="text-slate-400 text-xs font-light leading-relaxed max-w-xs">
                        Redefining modern luxury streetwear. Engineered for individuality, authenticity, and enduring energy.
                    </p>

                    <div className="space-y-2 text-xs text-slate-300 font-medium pt-1">
                        <p className="flex items-center gap-2">
                            <span className="text-slate-500 text-[10px] uppercase font-bold">Call:</span>
                            <a href="tel:+918448441388" className="hover:text-bindas-amber transition-colors">+91 84484 41388</a>
                        </p>
                        <p className="flex items-center gap-2">
                            <span className="text-slate-500 text-[10px] uppercase font-bold">WhatsApp:</span>
                            <a href="https://wa.me/918448441388" target="_blank" rel="noopener noreferrer" className="hover:text-bindas-amber transition-colors">+91 84484 41388</a>
                        </p>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                        {[
                            { icon: 'instagram', link: 'https://instagram.com' },
                            { icon: 'facebook', link: 'https://facebook.com' },
                            { icon: 'x', link: 'https://x.com' },
                            { icon: 'youtube', link: 'https://youtube.com' },
                            { icon: 'linkedin', link: 'https://linkedin.com' }
                        ].map((social, idx) => (
                            <a
                                key={idx}
                                href={social.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Follow us on ${social.icon}`}
                                className="group/social w-8 h-8 rounded-full bg-[#222222] border border-[#333333] flex items-center justify-center text-white hover:bg-bindas-amber hover:border-bindas-amber transition-all duration-300 hover:-translate-y-1"
                            >
                                <img
                                    src={`https://cdn.simpleicons.org/${social.icon}/ffffff`}
                                    alt={social.icon}
                                    className="w-3.5 h-3.5 opacity-85 group-hover/social:brightness-0 transition-all"
                                />
                            </a>
                        ))}
                    </div>
                </div>

                {/* 4. Enlarged White BiNDAAS! Logo (Right Blank Space) */}
                <div className="flex items-center justify-start md:justify-end h-full pt-4 md:pt-0">
                    <img
                        src={logoWhite}
                        alt="BiNDAAS!"
                        className="h-14 md:h-16 lg:h-20 w-auto object-contain opacity-95 hover:opacity-100 transition-opacity"
                    />
                </div>
            </div>


            {/* Bottom Bar */}
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-6 border-t border-[#2A2A2A] flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center md:text-left">
                    © 2026 BiNDAAS! Co. ALL RIGHTS RESERVED.
                </p>

                <p className="text-[11px] text-slate-400 font-medium text-center flex items-center gap-1.5">
                    Designed with <span className="text-rose-500 animate-pulse">❤️</span> in Mumbai | Made in India, Made for the World 🌏
                </p>

                <div className="flex gap-6 text-[9px] text-slate-400 uppercase tracking-[0.2em] font-bold">
                    <Link to="/privacy" className="hover:text-bindas-amber transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-bindas-amber transition-colors">Terms of Service</Link>
                    <Link to="/privacy" className="hover:text-bindas-amber transition-colors">Cookie Settings</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;