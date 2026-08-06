import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import GridProductCard from '../components/GridProductCard';

const SearchResults = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const { data } = await axios.get(`http://localhost:5001/api/products/search?q=${query}`);
                setProducts(data);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query]);

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-12 font-sans min-h-screen">
            <header className="mb-8">
                <h1 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2">Search Results For</h1>
                <h2 className="text-3xl md:text-5xl font-black text-[#111111] uppercase tracking-tighter italic">"{query}"</h2>
                <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{products.length} pieces found</p>
            </header>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="animate-pulse space-y-4">
                            <div className="aspect-[3/4] bg-slate-200 rounded-3xl" />
                            <div className="h-4 bg-slate-200 w-3/4 rounded" />
                            <div className="h-4 bg-slate-200 w-1/2 rounded" />
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="max-w-[1800px] mx-auto px-2.5 sm:px-4 lg:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 lg:gap-3.5">
                        {products.map(product => (
                            <GridProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                    <span className="material-icons-outlined text-6xl text-slate-200 mb-6">search_off</span>
                    <h3 className="text-xl font-bold text-[#10221c] uppercase tracking-widest mb-2">No Matches Found</h3>
                    <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto">
                        We couldn't find any pieces matching your search. Try adjusting your terms or browse our collections.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link to="/men" className="btn-pill">Men</Link>
                        <Link to="/women" className="btn-pill">Women</Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
