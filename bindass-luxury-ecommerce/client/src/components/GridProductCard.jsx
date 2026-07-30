import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';

const GridProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { formatPrice } = useCurrency();
    const isWished = isInWishlist(product._id);
    
    // Images
    const dominantImage = product.images?.[0] || 'https://via.placeholder.com/400x533';
    const hoverImage = product.images?.[1] || dominantImage;
    const imagesCount = product.images?.length || 1;

    const formattedPrice = formatPrice(product.price);

    return (
        <div 
            className="group block relative cursor-pointer font-['Outfit','Manrope',sans-serif]" 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Card Container (Signature Bluorng Rounded Aspect 3:4) */}
            <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-[#F5F5F5] border border-slate-200/50 shadow-sm mb-2.5">
                <Link to={`/product/${product._id}`} className="block w-full h-full">
                    <img 
                        src={isHovered ? hoverImage : dominantImage} 
                        alt={product.name} 
                        className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105"
                        loading="lazy"
                    />
                </Link>

                {/* Bookmark / Wishlist Badge Button (Bluorng Top Right Ribbon Tag) */}
                <button 
                    className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 w-7 h-8 sm:w-8 sm:h-9 bg-white text-[#111111] rounded-sm shadow-md flex items-center justify-center transition-transform hover:scale-105"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product);
                    }}
                    title="Bookmark / Wishlist"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill={isWished ? "#111111" : "none"} 
                        viewBox="0 0 24 24" 
                        strokeWidth={2} 
                        stroke="#111111" 
                        className="w-4 h-4"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1 0 2 .89 2 2v15.448l-7.593-4.34-7.593 4.34V5.322c0-1.1.9-2 2-2h11.186z" />
                    </svg>
                </button>

                {/* Low Stock Badge */}
                {product.stock_quantity > 0 && product.stock_quantity <= (product.low_stock_threshold || 5) && (
                    <span className="absolute bottom-3.5 left-3.5 z-10 bg-[#111111] text-[#FFD017] text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest">
                        Low Stock
                    </span>
                )}

                {/* Image Dots Indicator (Bluorng Style) */}
                {imagesCount > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className={`w-1.5 h-1.5 rounded-full transition-all ${!isHovered ? 'bg-white w-3' : 'bg-white/60'}`} />
                        <span className={`w-1.5 h-1.5 rounded-full transition-all ${isHovered ? 'bg-white w-3' : 'bg-white/60'}`} />
                        {imagesCount > 2 && <span className="w-1.5 h-1.5 rounded-full bg-white/60" />}
                    </div>
                )}
            </div>
            
            {/* Title, Price & Plus Button Row */}
            <div className="flex items-start justify-between px-1 gap-2">
                <Link to={`/product/${product._id}`} className="block">
                    <h3 className="text-[11px] font-bold text-[#111111] uppercase tracking-wider truncate group-hover:text-[#D4AF37] transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        {formattedPrice}
                    </p>
                </Link>

                <Link 
                    to={`/product/${product._id}`}
                    className="text-slate-400 hover:text-black font-light text-base leading-none transition-colors"
                >
                    +
                </Link>
            </div>
        </div>
    );
};

export default GridProductCard;
