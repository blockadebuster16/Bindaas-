import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import RecentlyViewed from '../components/RecentlyViewed';
import YouMayAlsoLike from '../components/YouMayAlsoLike';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API_BASE_URL from '../config/api';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { formatPrice } = useCurrency();
    const { addToHistory } = useRecentlyViewed();
    const toast = useToast();

    // UI State
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('M');
    const [activeTab, setActiveTab] = useState('details'); // 'details' | 'washcare' | 'shipping' | 'reviews'
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

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

    // Record View Event
    useEffect(() => {
        if (product) {
            addToHistory(product);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product]);

    const addToCartHandler = async () => {
        const cartItem = {
            productId: product._id,
            _id: product._id,
            name: product.name,
            price: product.price,
            size: selectedSize,
            image: product.images?.[0] || 'https://via.placeholder.com/600',
            quantity: 1
        };

        await addToCart(cartItem);
        toast.success(`${product.name} (Size ${selectedSize}) added to your bag! 🛍️`);
    };

    const handleBuyNow = async () => {
        const cartItem = {
            productId: product._id,
            _id: product._id,
            name: product.name,
            price: product.price,
            size: selectedSize,
            image: product.images?.[0] || 'https://via.placeholder.com/600',
            quantity: 1
        };

        await addToCart(cartItem);
        navigate('/checkout');
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
            const token = localStorage.getItem("bindass_user_token");
            await axios.post(`${API_BASE_URL}/api/reviews/${product._id}`, newReview, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const reviewsRes = await axios.get(`${API_BASE_URL}/api/reviews/${product._id}`);
            setReviewsData(reviewsRes.data);
            setNewReview({ rating: 5, comment: '' });
            toast.success('Review submitted successfully!');
        } catch (err) {
            setReviewError(err.response?.data?.message || "Failed to submit review");
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-['Manrope'] uppercase tracking-widest text-xs">Loading Piece...</div>;
    if (!product) return <div className="p-20 text-center font-['Manrope'] uppercase tracking-widest text-xs">Product Not Found</div>;

    const isWished = isInWishlist(product._id);
    const imagesList = product.images && product.images.length > 0
        ? product.images
        : ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'];

    const availableSizes = product.sizes && product.sizes.length > 0
        ? product.sizes
        : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    return (
        <div className="bg-white min-h-screen font-sans">
            <SEO
                title={product.name}
                description={product.description?.substring(0, 160)}
            />

            <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 md:py-10">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-1.5 text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-6 overflow-x-auto whitespace-nowrap">
                    <Link to="/" className="hover:text-black transition-colors flex-shrink-0">Home</Link>
                    <span className="text-[10px] flex-shrink-0">/</span>
                    <span className="flex-shrink-0 hover:text-black transition-colors">{product.category || 'Collection'}</span>
                    <span className="text-[10px] flex-shrink-0">/</span>
                    <span className="text-black font-bold truncate">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">

                    {/* ── Left Column: Exact Bluorng 2-Column Asymmetrical Image Grid & Smooth Scroll ── */}
                    <div className="lg:col-span-7">
                        {imagesList.length === 1 && (
                            <div className="w-full aspect-[3/4] bg-[#f5f5f5] rounded-3xl overflow-hidden border border-slate-100/80 shadow-sm">
                                <img src={imagesList[0]} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                        )}

                        {imagesList.length === 2 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {imagesList.map((img, idx) => (
                                    <div key={idx} className="w-full aspect-[3/4] bg-[#f5f5f5] rounded-3xl overflow-hidden border border-slate-100/80 shadow-sm">
                                        <img src={img} alt={`${product.name}-${idx}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {imagesList.length >= 3 && (
                            <div className="space-y-3.5">
                                {/* Top feature grid: 1 Tall left image + 2 Stacked right images (Exact Bluorng visual layout) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    {/* Left Image (Tall) */}
                                    <div className="w-full h-[450px] md:h-[580px] bg-[#f5f5f5] rounded-3xl overflow-hidden border border-slate-100/80 shadow-sm">
                                        <img src={imagesList[0]} alt={`${product.name}-1`} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Right Stacked Images (2 images) */}
                                    <div className="flex flex-col gap-3.5 h-[450px] md:h-[580px]">
                                        <div className="w-full h-1/2 bg-[#f5f5f5] rounded-3xl overflow-hidden border border-slate-100/80 shadow-sm">
                                            <img src={imagesList[1]} alt={`${product.name}-2`} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="w-full h-1/2 bg-[#f5f5f5] rounded-3xl overflow-hidden border border-slate-100/80 shadow-sm">
                                            <img src={imagesList[2]} alt={`${product.name}-3`} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                </div>

                                {/* Additional images (if > 3): 2-column grid */}
                                {imagesList.length > 3 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        {imagesList.slice(3).map((img, idx) => (
                                            <div key={idx} className="w-full aspect-[3/4] bg-[#f5f5f5] rounded-3xl overflow-hidden border border-slate-100/80 shadow-sm">
                                                <img src={img} alt={`${product.name}-${idx + 4}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Right Column: Sticky Product Info Panel ── */}
                    <div className="lg:col-span-5 sticky top-24 h-fit bg-[#F9F9F9] p-6 md:p-8 rounded-3xl border border-slate-100 space-y-6">

                        {/* Title & Bookmark/Wishlist */}
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#111111] leading-tight">
                                    {product.name}
                                </h1>
                                <p className="text-sm font-semibold text-slate-500 mt-1">
                                    {formatPrice(product.price)}
                                </p>
                            </div>

                            {/* Bookmark / Wishlist Icon Button */}
                            <button
                                onClick={() => toggleWishlist(product)}
                                className="p-2.5 rounded-full bg-white border border-slate-200 hover:border-black transition-all flex items-center justify-center shadow-sm hover:scale-105"
                                title="Add to Wishlist"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill={isWished ? "#111111" : "none"}
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.8}
                                    stroke="#111111"
                                    className="w-5 h-5"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1 0 2 .89 2 2v15.448l-7.593-4.34-7.593 4.34V5.322c0-1.1.9-2 2-2h11.186z" />
                                </svg>
                            </button>
                        </div>

                        {/* Size Selection Section */}
                        <div className="space-y-3 pt-2 border-t border-slate-200/60">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-[#111111] uppercase tracking-wider text-[11px]">Size</span>
                                <button
                                    onClick={() => setIsSizeGuideOpen(true)}
                                    className="text-[11px] font-bold text-slate-500 hover:text-black underline underline-offset-4 uppercase tracking-wider"
                                >
                                    Size Guide
                                </button>
                            </div>

                            {/* Size Pills (Bluorng pill style) */}
                            <div className="flex flex-wrap gap-2">
                                {availableSizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${selectedSize === size
                                            ? 'bg-[#111111] text-white border-[#111111] shadow-md'
                                            : 'bg-white text-[#111111] border-slate-200 hover:border-black'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons (ADD TO BAG & BUY NOW) */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={addToCartHandler}
                                className="flex-1 py-3.5 px-6 rounded-full border border-slate-300 bg-white text-[#111111] hover:bg-slate-100 font-bold uppercase tracking-[0.15em] text-[11px] transition-all duration-200 text-center"
                            >
                                ADD TO BAG
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 py-3.5 px-6 rounded-full bg-[#111111] text-white hover:bg-neutral-800 font-bold uppercase tracking-[0.15em] text-[11px] transition-all duration-200 text-center shadow-lg"
                            >
                                BUY NOW
                            </button>
                        </div>

                        {/* Tabbed Info Section (Details & Description / Washcare / Shipping / Reviews) */}
                        <div className="pt-4 border-t border-slate-200/60 space-y-4">
                            {/* Tabs Navigation */}
                            <div className="flex border-b border-slate-200 gap-6 text-xs font-bold uppercase tracking-wider">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`pb-2.5 transition-all ${activeTab === 'details'
                                        ? 'border-b-2 border-[#111111] text-[#111111]'
                                        : 'text-slate-400 hover:text-black'
                                        }`}
                                >
                                    Details & Description
                                </button>
                                <button
                                    onClick={() => setActiveTab('washcare')}
                                    className={`pb-2.5 transition-all ${activeTab === 'washcare'
                                        ? 'border-b-2 border-[#111111] text-[#111111]'
                                        : 'text-slate-400 hover:text-black'
                                        }`}
                                >
                                    Washcare
                                </button>
                                <button
                                    onClick={() => setActiveTab('shipping')}
                                    className={`pb-2.5 transition-all ${activeTab === 'shipping'
                                        ? 'border-b-2 border-[#111111] text-[#111111]'
                                        : 'text-slate-400 hover:text-black'
                                        }`}
                                >
                                    Shipping
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`pb-2.5 transition-all ${activeTab === 'reviews'
                                        ? 'border-b-2 border-[#111111] text-[#111111]'
                                        : 'text-slate-400 hover:text-black'
                                        }`}
                                >
                                    Reviews ({reviewsData.count})
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="text-xs text-slate-600 space-y-4 font-light leading-relaxed pt-2">
                                {activeTab === 'details' && (
                                    <div className="space-y-3">
                                        <div>
                                            <p className="font-bold text-[#111111] uppercase tracking-wider text-[10px] mb-1">Details</p>
                                            <ul className="list-disc pl-4 space-y-1 text-[11px] font-medium text-slate-700">
                                                <li>100% French Terry Cotton</li>
                                                <li>260 GSM Heavyweight Fabric</li>
                                                <li>High-Density Screen Print Branding</li>
                                                <li>Relaxed / Oversized Silhouette</li>
                                                <li>Runs oversized. We recommend ordering your true size for intended fit.</li>
                                            </ul>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200/40">
                                            <p className="font-bold text-[#111111] uppercase tracking-wider text-[10px] mb-1">Description</p>
                                            <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                                                {product.description || "A signature piece from the BiNDAAS! studio. Meticulously designed for the modern silhouette using premium materials."}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'washcare' && (
                                    <div className="space-y-2">
                                        <p className="font-bold text-[#111111] uppercase tracking-wider text-[10px]">Care Instructions</p>
                                        <p className="text-[11px] text-slate-600 font-normal">
                                            {product.materials_care || "Hand or machine wash cold inside-out with like colors. Do not bleach. Tumble dry low or line dry in shade. Cool iron on reverse side if needed, avoiding printed areas."}
                                        </p>
                                        <p className="text-[10px] text-slate-400 italic pt-1">
                                            {product.materials_integrity || "Committed to luxury quality and ethical craftsmanship."}
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'shipping' && (
                                    <div className="space-y-2">
                                        <p className="font-bold text-[#111111] uppercase tracking-wider text-[10px]">Shipping & Returns</p>
                                        <p className="text-[11px] text-slate-600 font-normal">
                                            Complimentary express shipping on all orders across India. Orders are dispatched within 24-48 business hours. Easy 7-day returns & exchanges supported.
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div className="space-y-4">
                                        {/* Average Rating Banner */}
                                        <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200">
                                            <div className="flex text-amber-400 text-xs">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <span key={i} className={`material-icons text-sm ${i <= Math.round(reviewsData.averageRating) ? 'text-amber-400' : 'text-slate-200'}`}>star</span>
                                                ))}
                                            </div>
                                            <span className="font-bold text-xs text-[#111111]">
                                                {reviewsData.count > 0 ? `${reviewsData.averageRating} out of 5` : 'No reviews yet'}
                                            </span>
                                        </div>

                                        {/* Reviews List */}
                                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                            {reviewsData.reviews.length === 0 ? (
                                                <p className="text-slate-400 text-[11px] italic">Be the first to review this piece.</p>
                                            ) : (
                                                reviewsData.reviews.map(review => (
                                                    <div key={review._id} className="bg-white p-3 rounded-xl border border-slate-100 text-[11px]">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-bold text-[#111111]">{review.userName}</span>
                                                            <span className="text-[9px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-slate-600 font-normal">{review.comment}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Write Review Form */}
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 pt-3">
                                            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 text-[#111111]">Write a Review</h4>
                                            {reviewError && <p className="text-red-500 text-[10px] mb-2">{reviewError}</p>}
                                            {!user ? (
                                                <div className="text-center py-2">
                                                    <button onClick={() => setIsAuthModalOpen(true)} className="btn-pill text-[10px] py-2 px-4">
                                                        Sign In to Review
                                                    </button>
                                                </div>
                                            ) : (
                                                <form onSubmit={handleReviewSubmit} className="space-y-2">
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <span
                                                                key={i}
                                                                onClick={() => setNewReview({ ...newReview, rating: i })}
                                                                className={`material-icons cursor-pointer text-base ${i <= newReview.rating ? 'text-amber-400' : 'text-slate-200'}`}
                                                            >
                                                                star
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <textarea
                                                        value={newReview.comment}
                                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                                        required
                                                        rows="2"
                                                        placeholder="Your thoughts on fit and quality..."
                                                        className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-black"
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={reviewSubmitting}
                                                        className="btn-pill text-[10px] py-2 px-5"
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

                {/* You May Also Like Carousel (Bluorng style) */}
                <div className="mt-16">
                    <YouMayAlsoLike currentProductId={product._id} category={product.category} />
                </div>

                {/* Recently Viewed Footprint */}
                <div className="mt-8">
                    <RecentlyViewed />
                </div>
            </div>

            {/* ── Size Guide Modal ── */}
            {isSizeGuideOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsSizeGuideOpen(false)}>
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b pb-4">
                            <h3 className="text-lg font-extrabold uppercase tracking-tight text-[#111111]">Size Guide</h3>
                            <button onClick={() => setIsSizeGuideOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 hover:text-black">
                                âœ•
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 font-normal">All measurements are in inches. Designed with an oversized fit.</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left text-slate-700 border-collapse">
                                <thead>
                                    <tr className="border-b bg-slate-50 text-[10px] uppercase tracking-wider">
                                        <th className="p-3 font-bold">Size</th>
                                        <th className="p-3 font-bold">Chest</th>
                                        <th className="p-3 font-bold">Length</th>
                                        <th className="p-3 font-bold">Shoulder</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b"><td className="p-3 font-bold">XS</td><td className="p-3">42"</td><td className="p-3">28"</td><td className="p-3">21"</td></tr>
                                    <tr className="border-b"><td className="p-3 font-bold">S</td><td className="p-3">44"</td><td className="p-3">29"</td><td className="p-3">22"</td></tr>
                                    <tr className="border-b"><td className="p-3 font-bold">M</td><td className="p-3">46"</td><td className="p-3">30"</td><td className="p-3">23"</td></tr>
                                    <tr className="border-b"><td className="p-3 font-bold">L</td><td className="p-3">48"</td><td className="p-3">31"</td><td className="p-3">24"</td></tr>
                                    <tr className="border-b"><td className="p-3 font-bold">XL</td><td className="p-3">50"</td><td className="p-3">32"</td><td className="p-3">25"</td></tr>
                                    <tr className="border-b"><td className="p-3 font-bold">XXL</td><td className="p-3">52"</td><td className="p-3">33"</td><td className="p-3">26"</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="pt-2 text-right">
                            <button onClick={() => setIsSizeGuideOpen(false)} className="btn-pill px-6 py-2.5 text-[10px]">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
