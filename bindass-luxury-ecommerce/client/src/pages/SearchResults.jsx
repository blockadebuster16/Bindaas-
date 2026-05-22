import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useCurrency } from '../context/CurrencyContext';

const SearchResults = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q');
    const { formatPrice } = useCurrency();

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
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-12 font-['Manrope'] min-h-screen">
            <header className="mb-12">
                <h1 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2">Search Results For</h1>
                <h2 className="text-3xl md:text-5xl font-black text-[#10221c] uppercase tracking-tighter italic">"{query}"</h2>
                <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{products.length} pieces found</p>
            </header>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="animate-pulse space-y-4">
                            <div className="aspect-[3/4] bg-slate-100 rounded-sm" />
                            <div className="h-4 bg-slate-100 w-3/4 rounded" />
                            <div className="h-4 bg-slate-100 w-1/2 rounded" />
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {products.map(product => (
                        <Link 
                            key={product._id} 
                            to={`/product/${product._id}`}
                            className="group"
                        >
                            <div className="aspect-[3/4] overflow-hidden bg-slate-50 rounded-sm relative mb-4">
                                <img 
                                    src={product.images[0]} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#10221c] group-hover:text-emerald-600 transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    {product.category}
                                </p>
                                <p className="text-sm font-black text-[#10221c] mt-2">
                                    {formatPrice(product.price)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                    <span className="material-icons-outlined text-6xl text-slate-200 mb-6">search_off</span>
                    <h3 className="text-xl font-bold text-[#10221c] uppercase tracking-widest mb-2">No Matches Found</h3>
                    <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto">
                        We couldn't find any pieces matching your search. Try adjusting your terms or browse our collections.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link to="/men" className="px-6 py-3 bg-[#10221c] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all">Men</Link>
                        <Link to="/women" className="px-6 py-3 border border-[#10221c] text-[#10221c] text-[10px] font-bold uppercase tracking-widest hover:bg-[#10221c] hover:text-white transition-all">Women</Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
