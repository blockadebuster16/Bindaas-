import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import RecentlyViewed from '../components/RecentlyViewed';
import SEO from '../components/SEO';
import clarity from '@microsoft/clarity';
import { useAuth } from '../context/AuthContext';


const ProductDetail = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { formatPrice } = useCurrency();
    const { addToHistory } = useRecentlyViewed();

    // UI State
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState("");
    const [selectedSize, setSelectedSize] = useState('M');
    const [openAccordion, setOpenAccordion] = useState('desc');

    const { user, setIsAuthModalOpen } = useAuth();
    const [reviewsData, setReviewsData] = useState({ count: 0, averageRating: 0, reviews: [] });
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/api/products/${id}`);
                setProduct(data);
                setMainImage(data.images[0] || 'https://via.placeholder.com/600');
                
                const reviewsRes = await axios.get(`${API_BASE_URL}/api/reviews/${id}`);
                setReviewsData(reviewsRes.data);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching product:", error);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // Record View Event (Digital Footprint)
    useEffect(() => {
        if (product) {
            addToHistory(product);
        }
    }, [product]);

    const addToCartHandler = async () => {
        const cartItem = {
            productId: product._id,
            _id: product._id,
            name: product.name,
            price: product.price,
            size: selectedSize,
            image: mainImage,
            quantity: 1
        };

        await addToCart(cartItem);
        alert(`${product.name} added to your bag.`);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }
        setReviewSubmitting(true);
        setReviewError('');
        try {
            const token = await user.getIdToken();
            await axios.post(`${API_BASE_URL}/api/reviews/${product._id}`, newReview, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const reviewsRes = await axios.get(`${API_BASE_URL}/api/reviews/${product._id}`);
            setReviewsData(reviewsRes.data);
            setNewReview({ rating: 5, comment: '' });
        } catch (err) {
            setReviewError(err.response?.data?.message || "Failed to submit review");
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-['Manrope'] uppercase tracking-widest text-xs">Loading Piece...</div>;
    if (!product) return <div className="p-20 text-center font-['Manrope'] uppercase tracking-widest text-xs">Product Not Found</div>;

    const isWished = isInWishlist(product._id);

    return (
        <div className="bg-white min-h-screen">
            <SEO 
                title={product.name} 
                description={product.description?.substring(0, 160)} 
            />
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 font-['Manrope'] bg-white">
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-1 text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-6 md:mb-12 overflow-x-auto whitespace-nowrap">
                <Link to="/" className="hover:text-black flex-shrink-0">Home</Link>
                <span className="material-icons-outlined text-[12px] flex-shrink-0">chevron_right</span>
                <span className="flex-shrink-0">{product.category || 'Collection'}</span>
                <span className="material-icons-outlined text-[12px] flex-shrink-0">chevron_right</span>
                <span className="text-black font-bold truncate">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-16">
                {/* Left: Image Gallery */}
                <div className="lg:col-span-7">
                    {/* Mobile: horizontal thumbnail strip */}
                    <div className="flex md:hidden gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                        {product.images?.map((img, index) => (
                            <div
                                key={index}
                                onClick={() => setMainImage(img)}
                                className={`w-14 h-14 flex-shrink-0 rounded-sm overflow-hidden cursor-pointer border-2 ${mainImage === img ? 'border-black' : 'border-transparent'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt={`thumb-${index}`} />
                            </div>
                        ))}
                    </div>
                    {/* Desktop: side-by-side */}
                    <div className="hidden md:flex flex-row gap-6">
                        <div className="flex flex-col space-y-4 w-20">
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
                    {/* Mobile: main image */}
                    <div className="md:hidden bg-[#f8f9f8] aspect-[4/5] rounded-sm overflow-hidden">
                        <img src={mainImage} className="w-full h-full object-cover" alt={product.name} />
                    </div>
                </div>

                {/* Right: Info */}
                <div className="lg:col-span-5 space-y-8">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tighter text-[#10221c] uppercase mb-3 leading-tight">{product.name}</h1>
                        <p className="text-xl md:text-2xl font-light text-emerald-800 mb-2">{formatPrice(product.price)}</p>
                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => setOpenAccordion('reviews')}>
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <span key={i} className={`material-icons text-[12px] ${i <= Math.round(reviewsData.averageRating) ? 'text-amber-400' : 'text-slate-300'}`}>star</span>
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 hover:text-black transition-colors">
                                {reviewsData.count > 0 ? `${reviewsData.averageRating} (${reviewsData.count} reviews)` : 'No reviews yet'}
                            </span>
                        </div>
                    </div>

                    {/* Size Selector */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Select Size: {selectedSize}</h3>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`w-11 h-11 md:w-12 md:h-12 border text-[10px] font-bold transition-all ${selectedSize === size ? 'bg-[#10221c] text-white border-[#10221c]' : 'border-slate-200 hover:border-black'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={addToCartHandler}
                            className="flex-1 bg-[#10221c] text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-emerald-950 transition-all active:scale-95 shadow-lg"
                        >
                            Add to Shopping Bag
                        </button>
                        <button 
                            onClick={() => toggleWishlist(product)}
                            className={`px-6 border transition-all flex items-center justify-center group ${isWished ? 'border-[#ff3f6c] bg-[#ff3f6c]/5' : 'border-slate-200 hover:border-black'}`}
                        >
                            <span className={`material-icons-outlined transition-colors ${isWished ? 'text-[#ff3f6c]' : 'text-slate-400 group-hover:text-red-500'}`}>
                                {isWished ? 'favorite' : 'favorite_border'}
                            </span>
                        </button>
                    </div>



                    {/* Details Accordion */}
                    <div className="border-t border-slate-200 dark:border-primary/10 mt-12">
                        {/* Product Description */}
                        <div className="border-b border-slate-200 dark:border-primary/10">
                            <button
                                onClick={() => {
                                    const nextState = openAccordion === 'desc' ? '' : 'desc';
                                    setOpenAccordion(nextState);
                                    if (nextState === 'desc') clarity.event('accordion_opened', { section_name: 'Product Description' });
                                }}
                                className="w-full flex justify-between items-center py-6 text-left group"
                            >
                                <span className="text-sm font-bold uppercase tracking-widest group-hover:text-[#10b981] transition-colors text-[#10221c]">
                                    Product Description
                                </span>
                                <span className="material-icons text-slate-400 group-hover:text-[#10b981] transition-colors">
                                    {openAccordion === 'desc' ? 'remove' : 'add'}
                                </span>
                            </button>
                            {openAccordion === 'desc' && (
                                <div className="pb-6 text-sm text-slate-600 font-light leading-relaxed animate-fade-in-down">
                                    {product.description || "A signature piece from the BINDASS!! studio. Meticulously designed for the modern silhouette using premium materials."}
                                </div>
                            )}
                        </div>

                        {/* Materials & Care */}
                        <div className="border-b border-slate-200 dark:border-primary/10">
                            <button
                                onClick={() => {
                                    const nextState = openAccordion === 'materials' ? '' : 'materials';
                                    setOpenAccordion(nextState);
                                    if (nextState === 'materials') clarity.event('accordion_opened', { section_name: 'Materials & Care' });
                                }}
                                className="w-full flex justify-between items-center py-6 text-left group"
                            >
                                <span className="text-sm font-bold uppercase tracking-widest group-hover:text-[#10b981] transition-colors text-[#10221c]">
                                    Materials & Care
                                </span>
                                <span className="material-icons text-slate-400 group-hover:text-[#10b981] transition-colors">
                                    {openAccordion === 'materials' ? 'remove' : 'add'}
                                </span>
                            </button>
                            {openAccordion === 'materials' && (
                                <div className="pb-6 text-sm text-slate-600 font-light leading-relaxed animate-fade-in-down">
                                    <p>{product.materials_care || "Meticulously designed using premium materials. Handle with care to ensure longevity."}</p>
                                </div>
                            )}
                        </div>
 
                        {/* Materials Integrity */}
                        <div className="border-b border-slate-200 dark:border-primary/10">
                            <button
                                onClick={() => {
                                    const nextState = openAccordion === 'integrity' ? '' : 'integrity';
                                    setOpenAccordion(nextState);
                                    if (nextState === 'integrity') clarity.event('accordion_opened', { section_name: 'Materials Integrity' });
                                }}
                                className="w-full flex justify-between items-center py-6 text-left group"
                            >
                                <span className="text-sm font-bold uppercase tracking-widest group-hover:text-[#10b981] transition-colors text-[#10221c]">
                                    Materials Integrity
                                </span>
                                <span className="material-icons text-slate-400 group-hover:text-[#10b981] transition-colors">
                                    {openAccordion === 'integrity' ? 'remove' : 'add'}
                                </span>
                            </button>
                            {openAccordion === 'integrity' && (
                                <div className="pb-6 text-sm text-slate-600 font-light leading-relaxed animate-fade-in-down">
                                    <p>{product.materials_integrity || "Committed to conscious luxury. This piece reflects our ongoing journey toward transparency, environmental responsibility, and ethical craftsmanship."}</p>
                                </div>
                            )}
                        </div>

                        {/* Shipping & Returns */}
                        <div className="border-b border-slate-200 dark:border-primary/10">
                            <button
                                onClick={() => {
                                    const nextState = openAccordion === 'ship' ? '' : 'ship';
                                    setOpenAccordion(nextState);
                                    if (nextState === 'ship') clarity.event('accordion_opened', { section_name: 'Shipping & Returns' });
                                }}
                                className="w-full flex justify-between items-center py-6 text-left group"
                            >
                                <span className="text-sm font-bold uppercase tracking-widest group-hover:text-[#10b981] transition-colors text-[#10221c]">
                                    Shipping & Returns
                                </span>
                                <span className="material-icons text-slate-400 group-hover:text-[#10b981] transition-colors">
                                    {openAccordion === 'ship' ? 'remove' : 'add'}
                                </span>
                            </button>
                            {openAccordion === 'ship' && (
                                <div className="pb-6 text-sm text-slate-600 font-light leading-relaxed animate-fade-in-down">
                                    Complimentary express shipping on all luxury orders. Easy 30-day returns in original packaging.
                                </div>
                            )}
                        </div>

                        {/* Customer Reviews (Google Form) */}
                        <div className="border-b border-slate-200 dark:border-primary/10">
                            <button
                                onClick={() => setOpenAccordion(openAccordion === 'reviews' ? '' : 'reviews')}
                                className="w-full flex justify-between items-center py-6 text-left group"
                            >
                                <span className="text-sm font-bold uppercase tracking-widest group-hover:text-[#10b981] transition-colors text-[#10221c]">
                                    Customer Reviews
                                </span>
                                <span className="material-icons text-slate-400 group-hover:text-[#10b981] transition-colors">
                                    {openAccordion === 'reviews' ? 'remove' : 'add'}
                                </span>
                            </button>
                            {openAccordion === 'reviews' && (
                                <div className="pb-8 animate-fade-in-down">
                                    {/* Existing Reviews List */}
                                    <div className="mb-8 space-y-6">
                                        {reviewsData.reviews.length === 0 ? (
                                            <p className="text-sm text-slate-500 font-light italic">Be the first to review this piece.</p>
                                        ) : (
                                            reviewsData.reviews.map(review => (
                                                <div key={review._id} className="bg-slate-50 p-4 rounded-sm border border-slate-100">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="text-xs font-bold text-emerald-900">{review.userName}</p>
                                                            <div className="flex mt-1">
                                                                {[1, 2, 3, 4, 5].map(i => (
                                                                    <span key={i} className={`material-icons text-[12px] ${i <= review.rating ? 'text-amber-400' : 'text-slate-200'}`}>star</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 font-light mt-2">{review.comment}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Write Review Form */}
                                    <div className="bg-white rounded-sm p-6 border border-slate-200">
                                        <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Write a Review</h4>
                                        {reviewError && <p className="text-red-500 text-xs mb-4">{reviewError}</p>}
                                        {!user ? (
                                            <div className="text-center py-6">
                                                <p className="text-sm text-slate-500 mb-4">You must be logged in to leave a review.</p>
                                                <button onClick={() => setIsAuthModalOpen(true)} className="bg-[#10221c] text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black">
                                                    Sign In to Review
                                                </button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleReviewSubmit}>
                                                <div className="mb-4">
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Rating</label>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <span 
                                                                key={i} 
                                                                onClick={() => setNewReview({...newReview, rating: i})}
                                                                className={`material-icons cursor-pointer text-xl ${i <= newReview.rating ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}
                                                            >
                                                                star
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="mb-4">
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Your Review</label>
                                                    <textarea 
                                                        value={newReview.comment}
                                                        onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                                        required
                                                        rows="4"
                                                        placeholder="What did you think of this piece?"
                                                        className="w-full border border-slate-200 rounded-sm p-3 text-sm focus:outline-none focus:border-[#10221c]"
                                                    ></textarea>
                                                </div>
                                                <button 
                                                    type="submit" 
                                                    disabled={reviewSubmitting}
                                                    className="bg-[#10221c] text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all disabled:opacity-50"
                                                >
                                                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Recently Viewed Footprint */}
            <div className="mt-20">
                <RecentlyViewed />
            </div>
        </div>
    </div>
);
};

export default ProductDetail;