import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ProductDetail = () => {
    const { id } = useParams();

    // UI State
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState("");
    const [selectedSize, setSelectedSize] = useState('M');
    const [openAccordion, setOpenAccordion] = useState('desc');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
                setProduct(data);
                setMainImage(data.images[0] || 'https://via.placeholder.com/600');
                setLoading(false);
            } catch (error) {
                console.error("Error fetching product:", error);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const addToCart = () => {
        const existingCart = JSON.parse(localStorage.getItem('bindass_cart')) || [];

        const cartItem = {
            cartId: Date.now(), // Unique ID for cart management
            id: product._id,
            name: product.name,
            price: product.price,
            size: selectedSize,
            image: mainImage,
            quantity: 1
        };

        existingCart.push(cartItem);
        localStorage.setItem('bindass_cart', JSON.stringify(existingCart));

        // Trigger Navbar update
        window.dispatchEvent(new Event('storage'));
        alert(`${product.name} added to your bag.`);
    };

    if (loading) return <div className="p-20 text-center font-['Manrope'] uppercase tracking-widest text-xs">Loading Piece...</div>;
    if (!product) return <div className="p-20 text-center font-['Manrope'] uppercase tracking-widest text-xs">Product Not Found</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 font-['Manrope'] bg-white">
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-12">
                <Link to="/" className="hover:text-black">Home</Link>
                <span className="material-icons-outlined text-[12px]">chevron_right</span>
                <span>{product.category || 'Collection'}</span>
                <span className="material-icons-outlined text-[12px]">chevron_right</span>
                <span className="text-black font-bold">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left: Image Gallery */}
                <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
                    <div className="hidden md:flex flex-col space-y-4 w-20">
                        {product.images?.map((img, index) => (
                            <div
                                key={index}
                                onClick={() => setMainImage(img)}
                                className={`aspect-square rounded-sm overflow-hidden cursor-pointer border ${mainImage === img ? 'border-black' : 'border-transparent'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt={`thumb-${index}`} />
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 bg-[#f8f9f8] aspect-[4/5] rounded-sm overflow-hidden">
                        <img src={mainImage} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt={product.name} />
                    </div>
                </div>

                {/* Right: Info */}
                <div className="lg:col-span-5 space-y-10">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tighter text-[#10221c] uppercase mb-4 leading-tight">{product.name}</h1>
                        <p className="text-2xl font-light text-emerald-800">₹{product.price.toLocaleString()}</p>
                    </div>

                    {/* Size Selector */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Select Size: {selectedSize}</h3>
                        <div className="flex gap-3">
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`w-12 h-12 border text-[10px] font-bold transition-all ${selectedSize === size ? 'bg-[#10221c] text-white border-[#10221c]' : 'border-slate-200 hover:border-black'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={addToCart}
                            className="flex-1 bg-[#10221c] text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-emerald-950 transition-all active:scale-95 shadow-lg"
                        >
                            Add to Shopping Bag
                        </button>
                        <button className="px-6 border border-slate-200 hover:border-black transition-all group">
                            <span className="material-icons-outlined group-hover:text-red-500 transition-colors">favorite_border</span>
                        </button>
                    </div>

                    {/* Details Accordion */}
                    <div className="border-t border-slate-100 pt-6">
                        <div className="border-b border-slate-100">
                            <button
                                onClick={() => setOpenAccordion(openAccordion === 'desc' ? '' : 'desc')}
                                className="w-full flex justify-between items-center py-4 uppercase text-[10px] font-bold tracking-[0.2em] text-[#10221c] group"
                            >
                                Product Description
                                <span className={`material-icons-outlined text-sm transition-transform duration-300 ${openAccordion === 'desc' ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>
                            {openAccordion === 'desc' && (
                                <div className="pb-6 text-sm text-slate-500 font-light leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300">
                                    {product.description || "A signature piece from the BINDASS!! studio. Meticulously designed for the modern silhouette using premium materials."}
                                </div>
                            )}
                        </div>
                        <div className="border-b border-slate-100">
                            <button
                                onClick={() => setOpenAccordion(openAccordion === 'ship' ? '' : 'ship')}
                                className="w-full flex justify-between items-center py-4 uppercase text-[10px] font-bold tracking-[0.2em] text-[#10221c] group"
                            >
                                Shipping & Returns
                                <span className={`material-icons-outlined text-sm transition-transform duration-300 ${openAccordion === 'ship' ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>
                            {openAccordion === 'ship' && (
                                <div className="pb-6 text-sm text-slate-500 font-light leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300">
                                    Complimentary express shipping on all luxury orders. Easy 30-day returns in original packaging.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;