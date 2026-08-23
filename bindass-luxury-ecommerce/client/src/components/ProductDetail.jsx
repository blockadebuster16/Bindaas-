import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const ProductDetail = () => {
    const { id } = useParams();

    // UI State
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('M');
    const [openAccordion, setOpenAccordion] = useState('');
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [pincode, setPincode] = useState('');
    const [pincodeStatus, setPincodeStatus] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/products/${id}`);
                setProduct(data);
                if (data.sizes && data.sizes.length > 0) {
                    setSelectedSize(data.sizes[0]);
                }
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
        const mainImage = product.images?.[0] || 'https://via.placeholder.com/600';

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

    const handlePincodeCheck = (e) => {
        e.preventDefault();
        if (pincode.length === 6) {
            setPincodeStatus('Available for delivery within 2-4 business days.');
        } else {
            setPincodeStatus('Please enter a valid 6-digit pincode.');
        }
    };

    if (loading) return <div className="p-20 text-center font-['Manrope'] uppercase tracking-widest text-xs">Loading Piece...</div>;
    if (!product) return <div className="p-20 text-center font-['Manrope'] uppercase tracking-widest text-xs">Product Not Found</div>;

    const description = product.description || "A signature piece from the BiNDAAS! studio. Meticulously designed for the modern silhouette using premium materials.";
    const isLongDesc = description.length > 150;

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 font-['Manrope'] bg-white">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start relative">
                
                {/* Left: Image Masonry/Grid (Scrolling) */}
                <div className="w-full lg:w-[60%] xl:w-[65%] grid grid-cols-2 gap-4">
                    {product.images?.map((img, index) => (
                        <div key={index} className={`bg-[#f8f9f8] overflow-hidden ${index === 0 && product.images.length % 2 !== 0 ? 'col-span-2' : 'col-span-1'} aspect-[4/5]`}>
                            <img src={img} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt={`${product.name} - View ${index + 1}`} />
                        </div>
                    ))}
                    {(!product.images || product.images.length === 0) && (
                        <div className="col-span-2 bg-[#f8f9f8] aspect-square flex items-center justify-center">
                            <span className="text-gray-400">No images available</span>
                        </div>
                    )}
                </div>

                {/* Right: Sticky Info Sidebar */}
                <div className="w-full lg:w-[40%] xl:w-[35%] lg:sticky lg:top-24 space-y-8 pb-12 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    
                    {/* Breadcrumbs inside right column */}
                    <nav className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-6">
                        <Link to="/" className="hover:text-black">Home</Link>
                        <span className="material-icons-outlined text-[10px]">chevron_right</span>
                        <span className="truncate max-w-[100px] sm:max-w-[150px]">{product.category || 'Collection'}</span>
                        <span className="material-icons-outlined text-[10px]">chevron_right</span>
                        <span className="text-black font-bold truncate max-w-[120px]">{product.name}</span>
                    </nav>

                    {/* Header: Title, Price, Rating */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-[#10221c] uppercase mb-3 leading-tight">{product.name}</h1>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xl font-medium text-gray-900">₹{product.price.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal uppercase tracking-wider ml-1">Incl. of all taxes</span></p>
                            <div className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                                <div className="flex text-amber-400 text-sm">
                                    <span className="material-icons text-base">star</span>
                                    <span className="material-icons text-base">star</span>
                                    <span className="material-icons text-base">star</span>
                                    <span className="material-icons text-base">star</span>
                                    <span className="material-icons text-base">star_half</span>
                                </div>
                                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-1 underline underline-offset-2">4.8 (12)</span>
                            </div>
                        </div>
                    </div>

                    {/* Description Section with View More */}
                    <div className="text-sm text-gray-600 leading-relaxed font-light">
                        <p>{isDescExpanded || !isLongDesc ? description : `${description.substring(0, 150)}...`}</p>
                        {isLongDesc && (
                            <button 
                                onClick={() => setIsDescExpanded(!isDescExpanded)} 
                                className="mt-2 text-[10px] font-bold uppercase tracking-widest text-black underline underline-offset-4 hover:text-emerald-800 transition-colors"
                            >
                                {isDescExpanded ? '- View Less' : '+ View More'}
                            </button>
                        )}
                    </div>

                    {/* Size Selector as Circular Swatches */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between items-end">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Select Size: <span className="text-gray-500 ml-1">{selectedSize}</span></h3>
                                <button className="text-[10px] uppercase font-bold text-gray-400 tracking-widest hover:text-black underline">Size Guide</button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {product.sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-11 h-11 rounded-full border flex items-center justify-center text-[11px] font-bold transition-all ${
                                            selectedSize === size 
                                                ? 'bg-black text-white border-black ring-2 ring-black ring-offset-2' 
                                                : 'bg-white text-black border-gray-300 hover:border-black'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-4">
                        <div className="flex gap-3 h-14">
                            <button className="w-14 h-full border border-gray-300 flex items-center justify-center rounded-sm hover:border-black hover:bg-gray-50 transition-all group shrink-0">
                                <span className="material-icons-outlined text-gray-600 group-hover:text-red-500 transition-colors">favorite_border</span>
                            </button>
                            <button
                                onClick={addToCart}
                                className="flex-1 h-full border-2 border-black bg-white text-black text-[11px] font-extrabold uppercase tracking-[0.2em] hover:bg-gray-50 transition-all active:scale-[0.98]"
                            >
                                Add to Bag
                            </button>
                        </div>
                        <button
                            onClick={addToCart}
                            className="w-full h-14 bg-[#10221c] text-white text-[11px] font-extrabold uppercase tracking-[0.2em] hover:bg-emerald-950 transition-all active:scale-[0.98] shadow-md"
                        >
                            Buy It Now
                        </button>
                    </div>

                    {/* Pincode Delivery Checker */}
                    <div className="bg-gray-50 p-5 rounded-sm border border-gray-100 mt-6">
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-900 mb-3 flex items-center gap-2">
                            <span className="material-icons-outlined text-sm">local_shipping</span>
                            Delivery Check
                        </h4>
                        <form onSubmit={handlePincodeCheck} className="flex gap-2">
                            <input 
                                type="text" 
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter Pincode" 
                                className="flex-1 border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-black rounded-sm"
                            />
                            <button type="submit" className="bg-black text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-gray-800 transition-colors">
                                Check
                            </button>
                        </form>
                        {pincodeStatus && (
                            <p className={`mt-2 text-xs ${pincodeStatus.includes('Available') ? 'text-green-600' : 'text-red-500'}`}>
                                {pincodeStatus}
                            </p>
                        )}
                    </div>

                    {/* Details Accordion (As per requirements: Promotions, Desc, Shipping) */}
                    <div className="border-t border-slate-200 pt-2 mt-8">
                        {/* Promotions Accordion */}
                        {product.promotions && (
                            <div className="border-b border-slate-200">
                                <button
                                    onClick={() => setOpenAccordion(openAccordion === 'promo' ? '' : 'promo')}
                                    className="w-full flex justify-between items-center py-5 uppercase text-[11px] font-bold tracking-[0.15em] text-[#10221c] group"
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="material-icons-outlined text-sm text-amber-600">local_offer</span>
                                        Available Offers
                                    </span>
                                    <span className={`material-icons-outlined text-sm transition-transform duration-300 ${openAccordion === 'promo' ? 'rotate-180' : ''}`}>expand_more</span>
                                </button>
                                {openAccordion === 'promo' && (
                                    <div className="pb-6 text-sm text-slate-600 font-medium leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300 bg-amber-50/50 p-4 rounded-sm">
                                        {product.promotions}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Product Description Accordion */}
                        <div className="border-b border-slate-200">
                            <button
                                onClick={() => setOpenAccordion(openAccordion === 'desc' ? '' : 'desc')}
                                className="w-full flex justify-between items-center py-5 uppercase text-[11px] font-bold tracking-[0.15em] text-[#10221c] group"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="material-icons-outlined text-sm text-gray-500">article</span>
                                    Product Details
                                </span>
                                <span className={`material-icons-outlined text-sm transition-transform duration-300 ${openAccordion === 'desc' ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>
                            {openAccordion === 'desc' && (
                                <div className="pb-6 text-sm text-slate-500 font-light leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300 px-2">
                                    {description}
                                    {product.materials_care && (
                                        <div className="mt-4">
                                            <strong className="text-gray-900 block mb-1">Materials & Care</strong>
                                            {product.materials_care}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Shipping Accordion */}
                        <div className="border-b border-slate-200">
                            <button
                                onClick={() => setOpenAccordion(openAccordion === 'ship' ? '' : 'ship')}
                                className="w-full flex justify-between items-center py-5 uppercase text-[11px] font-bold tracking-[0.15em] text-[#10221c] group"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="material-icons-outlined text-sm text-gray-500">inventory_2</span>
                                    Shipping & Returns
                                </span>
                                <span className={`material-icons-outlined text-sm transition-transform duration-300 ${openAccordion === 'ship' ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>
                            {openAccordion === 'ship' && (
                                <div className="pb-6 text-sm text-slate-500 font-light leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300 px-2">
                                    {product.shipping_returns || "Complimentary express shipping on all luxury orders. Easy 30-day returns in original packaging."}
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
