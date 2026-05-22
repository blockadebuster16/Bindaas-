import React from 'react';

const ProductCard = ({ product, onBuy }) => {
    return (
        <div className="group relative border-b border-gray-100 pb-8 transition-all hover:shadow-sm bg-white p-2">
            {/* Image Container */}
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-sm bg-gray-50 lg:aspect-none group-hover:opacity-90 lg:h-80 transition-opacity">
                <img
                    src={product.images?.[0] || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                />
            </div>

            {/* Product Info */}
            <div className="mt-4 flex justify-between items-start">
                <div>
                    <h3 className="text-sm font-light text-gray-900 uppercase tracking-wider">
                        <a href={`/product/${product._id}`}>
                            {product.name}
                        </a>
                    </h3>
                    <p className="mt-1 text-xs text-gray-400 italic font-serif">{product.category}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">₹{product.price.toLocaleString()}</p>
            </div>

            {/* The Luxury CTA Button */}
            <button
                onClick={(e) => {
                    e.preventDefault(); // Prevents navigation if inside a link
                    onBuy();
                }}
                className="mt-6 w-full bg-black text-white py-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-gray-800 transition-all duration-300 active:scale-95"
            >
                Acquire Piece
            </button>
        </div>
    );
};

export default ProductCard;