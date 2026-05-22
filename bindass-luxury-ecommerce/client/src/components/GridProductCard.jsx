import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';

const GridProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { formatPrice } = useCurrency();
    const isWished = isInWishlist(product._id);
    
    // Fallback if images array missing
    const dominantImage = product.images?.[0] || 'https://via.placeholder.com/400x533';
    const hoverImage = product.images?.[1] || dominantImage;

    const formattedPrice = formatPrice(product.price);

    // Dummy array of 3 generic swatches for the visual effect shown in the SS
    // In a real scenario, this would come from product.colors or product.variants
    const swatches = ['#000000', '#ffffff', '#e5e7eb']; 

    return (
        <div 
            className="group block relative cursor-pointer font-display" 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/product/${product._id}`} className="block relative bg-[#f1f1f1] aspect-[3/4] overflow-hidden">
                <img 
                    src={isHovered ? hoverImage : dominantImage} 
                    alt={product.name} 
                    className="w-full h-full object-cover object-top transition-all duration-500"
                />
                <button 
                    className={`absolute top-3 right-3 p-2 rounded-full z-10 transition-all ${isWished ? 'bg-white/80 text-[#ff3f6c]' : 'bg-transparent text-gray-500 hover:text-black hover:scale-110'}`}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product);
                    }}
                >
                    {/* Minimalist Heart Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill={isWished ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                </button>
            </Link>
            
            <div className="pt-3 pb-6 flex flex-col items-start text-left">
                {product.category && (
                   <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{product.category}</span>
                )}
                <h3 className="text-xs uppercase tracking-wide text-gray-800 font-medium leading-relaxed truncate w-full">
                    <Link to={`/product/${product._id}`}>{product.name}</Link>
                </h3>
                <p className="text-xs font-bold text-gray-900 mt-0.5">
                    {formattedPrice}
                </p>
                <div className="flex gap-1 mt-2">
                    {swatches.map((color, idx) => (
                        <div 
                            key={idx} 
                            className="w-2.5 h-2.5 border border-gray-300"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                    {/* Add a subtle +1 logic matching screenshot */}
                    <span className="text-[9px] text-gray-500 ml-1 leading-none self-center">+1</span>
                </div>
            </div>
        </div>
    );
};

export default GridProductCard;
