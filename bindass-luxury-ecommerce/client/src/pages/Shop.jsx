import React from 'react';
import { Link } from 'react-router-dom';
import DynamicPage from '../components/DynamicPage';

/**
 * ROUTE-002 FIX: Replaced inline placeholder JSX in App.jsx with proper Shop page.
 * Shows the full DynamicPage (admin-configurable) with a product grid fallback.
 */
const Shop = () => {
    return (
        <DynamicPage
            pageKey="shop"
            title="Shop All — BiNDAAS!"
            description="Explore the complete BiNDAAS!! collection. Premium Indian luxury fashion for men and women."
            fallback={
                <div className="min-h-screen bg-bindas-parchment flex flex-col items-center justify-center gap-6 px-6 font-sans">
                    <div className="text-center space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Collections</p>
                        <h1 className="text-4xl md:text-6xl font-black text-bindas-onyx uppercase tracking-tighter italic">
                            Shop BiNDAAS!!
                        </h1>
                        <p className="text-sm text-[#6B6457] max-w-md leading-relaxed">
                            Discover our complete range of premium Indian luxury fashion.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link to="/men" className="btn-primary rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest">Men</Link>
                        <Link to="/women" className="btn-primary rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest">Women</Link>
                        <Link to="/apparel" className="btn-primary rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest">Apparel</Link>
                        <Link to="/sport" className="btn-primary rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest">Sport</Link>
                        <Link to="/classics" className="btn-primary rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest">Classics</Link>
                    </div>
                </div>
            }
        />
    );
};

export default Shop;
