import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const Home = () => {
    // State
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = React.useRef(null);
    const { addToCart } = useCart();

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // In a real app, you might want to fetch only 'new arrivals' or limit the number
                const { data } = await axios.get('http://localhost:5001/api/products');
                // Slicing to show the first 8 for the New Arrivals section (allowing 2 full slides)
                setProducts(data.slice(0, 8));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching products:", error);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const scroll = (direction) => {
        const { current } = scrollRef;
        if (current) {
            const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Quick Add Functionality (No Navigation, No Alert)
    const handleQuickAdd = async (e, product) => {
        e.preventDefault(); // Prevent navigation to product detail
        e.stopPropagation();

        const cartItem = {
            id: product._id,
            name: product.name,
            price: product.price,
            size: 'M', // Default size for quick add
            image: product.images?.[0] || 'https://via.placeholder.com/400',
            quantity: 1
        };

        await addToCart(cartItem);

        // No alert as per user request for silent add
        // Optional: Could add a small toast notification here if desired later
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center font-display text-xs uppercase tracking-widest text-slate-500">
            Curating Collection...
        </div>
    );

    return (
        <div className="font-display">
            {/* Promo Bar */}
            <div className="bg-[#10221c] text-white text-[10px] uppercase tracking-[0.2em] py-2 text-center font-bold">
                Complimentary Standard Shipping on Orders Over ₹500
            </div>

            {/* Hero Section - Lacoste Style */}
            <section className="relative h-[85vh] w-full overflow-hidden group">
                {/* Background Image */}
                <img
                    src="https://images.unsplash.com/photo-1556906781-9a412961d28c?q=80&w=2000&auto=format&fit=crop"
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                    alt="Hero"
                />

                {/* Overlay Content */}
                <div className="absolute inset-0 bg-black/10 flex flex-col justify-end p-12 lg:p-24 text-white pb-32">
                    <div className="max-w-4xl animate-fade-in-up">
                        <span className="inline-block px-3 py-1 bg-white text-[#10221c] text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                            Spring-Summer 2024
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tighter leading-none mb-8">
                            L'Elegance<br />Sportif
                        </h1>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/men" className="px-8 py-4 bg-white text-[#10221c] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#10221c] hover:text-white transition-all text-center">
                                Shop Men
                            </Link>
                            <Link to="/women" className="px-8 py-4 bg-transparent border border-white text-white text-xs font-bold uppercase tracking-[0.15em] hover:bg-white hover:text-[#10221c] transition-all text-center">
                                Shop Women
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="bg-white py-4 px-4 bg-[#f6f8f6]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Category 1 */}
                    <div className="relative aspect-[4/5] group overflow-hidden cursor-pointer">
                        <img
                            src="https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt="Men"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <h3 className="text-white text-3xl font-extrabold uppercase tracking-tighter">Men's Polo</h3>
                        </div>
                    </div>
                    {/* Category 2 */}
                    <div className="relative aspect-[4/5] group overflow-hidden cursor-pointer">
                        <img
                            src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt="Women"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <h3 className="text-white text-3xl font-extrabold uppercase tracking-tighter">Women's Collection</h3>
                        </div>
                    </div>
                    {/* Category 3 */}
                    <div className="relative aspect-[4/5] group overflow-hidden cursor-pointer">
                        <img
                            src="https://images.unsplash.com/photo-1618354691438-25bc04584c23?q=80&w=800&auto=format&fit=crop"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt="Accessories"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <h3 className="text-white text-3xl font-extrabold uppercase tracking-tighter">Leather Goods</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* New Arrivals */}
            <section className="bg-white py-24 px-6 lg:px-12">
                <div className="max-w-[1440px] mx-auto">
                    {/* Section Header */}
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-[#10b981] font-bold uppercase tracking-[0.2em] text-[10px] mb-2 block">
                                Recently Added
                            </span>
                            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight">
                                New Arrivals
                            </h2>
                        </div>
                        {/* Carousel Controls */}
                        <div className="hidden md:flex gap-2">
                            <button
                                onClick={() => scroll('left')}
                                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                                <span className="material-icons-outlined text-sm">chevron_left</span>
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                                <span className="material-icons-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    {/* Product Carousel Container */}
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-8 pb-8 snap-x snap-mandatory scroll-smooth hide-scrollbar"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {products.map((product, index) => (
                            <Link
                                to={`/product/${product._id}`}
                                key={product._id}
                                className="group cursor-pointer min-w-[100%] sm:min-w-[calc(50%-1rem)] lg:min-w-[calc(25%-1.5rem)] snap-start block"
                            >
                                {/* Image Container */}
                                <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 mb-6">
                                    {/* NEW Badge (Example on 2nd item) */}
                                    {index === 1 && (
                                        <span className="absolute top-4 left-4 z-10 bg-[#10b981] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            New
                                        </span>
                                    )}
                                    <img
                                        src={product.images?.[0] || 'https://via.placeholder.com/400'}
                                        alt={product.name}
                                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Quick Add Button - Appears on Hover */}
                                    <button
                                        onClick={(e) => handleQuickAdd(e, product)}
                                        className="absolute bottom-0 left-0 w-full bg-[#10221c] text-white py-4 text-[10px] uppercase font-bold tracking-[0.2em] translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-[#11d411]"
                                    >
                                        Quick Add
                                    </button>
                                </div>

                                {/* Product Info */}
                                <div>
                                    <h3 className="text-base font-bold text-[#0f172a] mb-1 group-hover:text-[#10b981] transition-colors truncate">
                                        {product.name}
                                    </h3>
                                    <p className="text-xs text-slate-400 mb-3 font-medium">
                                        {/* Mocking variety text for display */}
                                        {index % 2 === 0 ? '5 Colors available' : 'Limited Edition'}
                                    </p>
                                    <p className="text-sm font-bold text-[#10b981]">₹{product.price}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Brand Heritage / Story */}
            <section className="bg-[#10221c] text-white py-24 px-6 lg:px-12 relative overflow-hidden">
                <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <span className="text-[#11d411] font-bold uppercase tracking-[0.2em] text-[10px] mb-6 block">
                            The Heritage
                        </span>
                        <h2 className="text-4xl lg:text-6xl font-extrabold uppercase tracking-tighter leading-tight mb-8">
                            René's Legacy:<br />The Crocodile
                        </h2>
                        <p className="text-slate-300 text-sm leading-relaxed mb-8 max-w-md font-light">
                            From the tennis courts of 1920s Paris to the streets of today, the crocodile has symbolized tenacity, elegance, and fair play. Our latest collection pays homage to this sporting heritage while pushing the boundaries of contemporary fashion.
                        </p>
                        <button className="px-8 py-4 border border-white text-white text-xs font-bold uppercase tracking-[0.15em] hover:bg-white hover:text-[#10221c] transition-all">
                            Discover The Story
                        </button>
                    </div>
                    <div className="order-1 lg:order-2 relative">
                        <div className="aspect-[4/3] bg-white/5 rounded-sm overflow-hidden border border-white/10">
                            {/* In a real app, replace with a heritage/brand image */}
                            <img
                                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
                                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
                                alt="Heritage"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;