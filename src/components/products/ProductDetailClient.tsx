'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ProductItem, ReviewRecord } from '@/lib/types';
import { resolveProductImage } from '@/lib/seo';

interface Props {
  product: ProductItem;
}

export default function ProductDetailClient({ product }: Props) {
  const { openOrderPopup, toggleWishlist, isInWishlist, token } = useStore();
  const inWishlist = isInWishlist(product._id);

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'shipping'>('overview');

  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(product.reviewAvg ?? null);
  const [reviewsCount, setReviewsCount] = useState(product.reviewCount || 0);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Gallery images (de-duplicated main + gallery images)
  const mainImg = resolveProductImage(product);
  const images = Array.from(
    new Set([mainImg, ...(product.images ?? [])].filter(Boolean))
  ) as string[];
  const hasGallery = images.length > 1;
  const currentImage = images[activeImageIndex] ?? images[0] ?? mainImg;

  const rating = avgRating != null ? Math.round(avgRating) : Math.round(product.rating || 5);
  const starsString =
    '★'.repeat(Math.max(1, Math.min(5, rating))) + '☆'.repeat(Math.max(0, 5 - rating));

  useEffect(() => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    fetch(`/api/reviews/${product._id}`, { headers })
      .then((res) => (res.ok ? res.json() : { reviews: [] }))
      .then((data) => {
        setReviews(data.reviews || []);
        if (data.avgRating != null) setAvgRating(data.avgRating);
        setReviewsCount(data.count || 0);
        if (data.userReview) {
          setUserRating(data.userReview.rating || 5);
          setUserComment(data.userReview.comment || '');
        }
      })
      .catch(() => {});
  }, [product._id, token]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      window.location.href = '/account';
      return;
    }
    setSubmittingReview(true);
    setReviewMessage(null);
    try {
      const res = await fetch(`/api/reviews/${product._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: userRating, comment: userComment }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewMessage({ text: data.message || 'Review submitted successfully!' });
        const refRes = await fetch(`/api/reviews/${product._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (refRes.ok) {
          const refData = await refRes.json();
          setReviews(refData.reviews || []);
          setAvgRating(refData.avgRating);
          setReviewsCount(refData.count || 0);
        }
      } else {
        setReviewMessage({ text: data.error || 'Failed to submit review', error: true });
      }
    } catch {
      setReviewMessage({ text: 'Network error. Please try again.', error: true });
    } finally {
      setSubmittingReview(false);
    }
  };

  const descriptionText =
    product.description?.trim() ||
    `${product.name} from Tumanza is a premium organic ${product.category.toLowerCase()} product, sourced with purity from Gilgit-Baltistan and delivered fresh across Pakistan.`;

  return (
    <div className="product-detail-page bg-[#fbf7f1] min-h-screen pt-28 pb-16">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Product Section: Two Column Layout */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#eadaad]/40 p-6 sm:p-10 lg:p-12">
          {/* Top Left Go Back Button */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#541d2b] bg-[#fbf7f1] hover:bg-[#541d2b] hover:text-[#dfceae] px-4 py-2 rounded-xl border border-[#eadaad]/60 transition-all shadow-xs"
            >
              <span>&larr;</span> Go Back
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
           {/* Left Column: Product Gallery (55% -> col-span-7) */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4 items-start sticky top-28">
            
            {/* Thumbnails (rendered only if multiple unique images exist) */}
            {hasGallery && (
              <div className="flex sm:flex-col gap-3 order-2 sm:order-1 w-full sm:w-24 overflow-x-auto sm:overflow-y-auto max-h-[500px] shrink-0 pb-2 sm:pb-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-[#fbf7f1] ${
                      activeImageIndex === idx ? 'border-[#541d2b] shadow-md ring-2 ring-[#dfceae]/50' : 'border-[#eadaad]/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}

            {/* Large Main Image Display */}
            <div className="relative order-1 sm:order-2 flex-1 w-full rounded-2xl bg-[#fbf7f1] border border-[#eadaad]/60 overflow-hidden group shadow-inner min-h-[380px] sm:min-h-[480px] lg:min-h-[540px] flex items-center justify-center">
              {product.badge && (
                <span className="absolute top-4 left-4 z-10 bg-[#541d2b] text-[#dfceae] text-xs font-semibold px-3 py-1.5 rounded-full shadow tracking-wider uppercase">
                  {product.badge}
                </span>
              )}
              
              <button
                type="button"
                onClick={() => setZoomModalOpen(true)}
                className="absolute inset-0 w-full h-full flex items-center justify-center cursor-zoom-in focus:outline-none"
                title="Click to zoom image"
              >
                <img
                  src={currentImage}
                  alt={product.name}
                  className="max-h-[460px] w-auto object-contain transition-transform duration-500 group-hover:scale-105 p-6"
                />
              </button>

              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 shadow border border-gray-200 pointer-events-none flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#541d2b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                Click to Zoom
              </div>
            </div>
          </div>

          {/* Right Column: Product Information (45% -> col-span-5) */}
          <div className="lg:col-span-5 flex flex-col">
            
            {/* Category Tag */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold tracking-widest text-[#541d2b] bg-[#dfceae]/30 px-3 py-1 rounded-md uppercase">
                {product.category || 'Organic Superfood'}
              </span>
              <span className="text-xs font-semibold text-[#8B9A46] bg-[#8B9A46]/10 px-2.5 py-1 rounded-md">
                ✓ {product.stock || 'In Stock'}
              </span>
            </div>

            {/* Title & Urdu Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#1a1a1a] font-bold leading-tight mb-1">
              {product.name}
            </h1>
            {product.urduName && (
              <p className="text-base text-[#5d5b5b] font-medium mb-3 italic">
                {product.urduName}
              </p>
            )}

            {/* Rating & Reviews Count */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
              <div className="flex text-[#c4a35a] text-lg tracking-tight">{starsString}</div>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="text-sm font-semibold text-[#541d2b] hover:underline"
              >
                {reviewsCount > 0 ? `${reviewsCount} Customer Reviews` : 'Be the first to review'}
              </button>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-4 mb-6 bg-[#fbf7f1] p-4 rounded-xl border border-[#eadaad]/50">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-[#541d2b]">
                Rs.{product.price.toFixed(2)}
              </div>
              {product.oldPrice > product.price && (
                <div className="text-lg text-gray-400 line-through font-medium">
                  Rs.{product.oldPrice.toFixed(2)}
                </div>
              )}
              {product.oldPrice > product.price && (
                <span className="ml-auto text-xs font-bold text-white bg-[#541d2b] px-2.5 py-1 rounded-full">
                  Save Rs.{(product.oldPrice - product.price).toFixed(0)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
              {descriptionText}
            </p>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                <div className="inline-flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2 text-gray-600 hover:bg-gray-100 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-[#1a1a1a] min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3.5 py-2 text-gray-600 hover:bg-gray-100 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Order Now / Add to Cart Button */}
              <button
                type="button"
                onClick={() => openOrderPopup(product)}
                className="w-full py-4 px-6 rounded-xl bg-[#541d2b] text-[#dfceae] hover:bg-[#3f1520] font-bold text-base tracking-wider uppercase shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5 text-[#dfceae]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Order Now — Rs.{(product.price * quantity).toFixed(2)}
              </button>

              {/* Wishlist Button directly underneath */}
              <button
                type="button"
                onClick={() => toggleWishlist(product._id)}
                className={`w-full py-3 px-6 rounded-xl border font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  inWishlist
                    ? 'border-[#541d2b] bg-[#541d2b]/5 text-[#541d2b]'
                    : 'border-gray-300 hover:border-[#541d2b] text-gray-700 bg-white'
                }`}
              >
                <span className={`text-lg ${inWishlist ? 'text-[#541d2b]' : 'text-gray-400'}`}>
                  {inWishlist ? '♥' : '♡'}
                </span>
                {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Guarantee / Perks bar */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-gray-100 text-xs text-gray-600 font-medium">
              <div className="flex items-center gap-2 bg-[#fbf7f1] p-3 rounded-lg border border-[#eadaad]/40">
                <span className="text-base">🚚</span>
                <span>{product.shippingInfo || 'Fast Nationwide Delivery'}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#fbf7f1] p-3 rounded-lg border border-[#eadaad]/40">
                <span className="text-base">🛡️</span>
                <span>100% Pure &amp; Organic</span>
              </div>
            </div>

          </div>
        </div>

        {/* Additional Sections: Tabs for Details, Reviews, Shipping & Returns */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-[#eadaad]/40 overflow-hidden">
          
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 bg-[#fbf7f1]/50 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-serif text-sm sm:text-base font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-[#541d2b] text-[#541d2b] bg-white'
                  : 'border-transparent text-gray-600 hover:text-[#541d2b]'
              }`}
            >
              Product Specifications &amp; Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 font-serif text-sm sm:text-base font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-[#541d2b] text-[#541d2b] bg-white'
                  : 'border-transparent text-gray-600 hover:text-[#541d2b]'
              }`}
            >
              Customer Reviews ({reviewsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shipping')}
              className={`px-6 py-4 font-serif text-sm sm:text-base font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'shipping'
                  ? 'border-[#541d2b] text-[#541d2b] bg-white'
                  : 'border-transparent text-gray-600 hover:text-[#541d2b]'
              }`}
            >
              Shipping &amp; Return Policy
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-6 sm:p-10">
            
            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-serif font-bold text-[#1a1a1a]">About {product.name}</h3>
                <p className="text-gray-700 text-base leading-relaxed">
                  {descriptionText}
                </p>

                {product.benefits && (
                  <div className="bg-[#fbf7f1] p-4 rounded-xl border border-[#eadaad]/50">
                    <h4 className="font-serif font-bold text-sm text-[#541d2b] mb-1">Key Benefits &amp; Features</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{product.benefits}</p>
                  </div>
                )}

                {product.specifications && (
                  <div className="bg-[#fbf7f1] p-4 rounded-xl border border-[#eadaad]/50">
                    <h4 className="font-serif font-bold text-sm text-[#541d2b] mb-1">Detailed Specifications</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{product.specifications}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between py-2.5 border-b border-gray-100 text-sm">
                    <span className="font-semibold text-gray-600">Category</span>
                    <span className="text-gray-900">{product.category}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-gray-100 text-sm">
                    <span className="font-semibold text-gray-600">Availability</span>
                    <span className="text-[#8B9A46] font-semibold">{product.stock || 'In Stock'}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-gray-100 text-sm">
                    <span className="font-semibold text-gray-600">Brand</span>
                    <span className="text-gray-900">Tumanza (Gilgit-Baltistan)</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-gray-100 text-sm">
                    <span className="font-semibold text-gray-600">Quality</span>
                    <span className="text-gray-900">100% Natural &amp; Handpicked</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#1a1a1a]">Customer Feedback &amp; Ratings</h3>
                    <p className="text-sm text-gray-500 mt-1">Real experiences from verified Tumanza shoppers.</p>
                  </div>
                  {avgRating != null && (
                    <div className="flex items-center gap-3 bg-[#fbf7f1] px-4 py-2.5 rounded-xl border border-[#eadaad]/60">
                      <span className="text-2xl font-serif font-bold text-[#541d2b]">{avgRating.toFixed(1)}</span>
                      <div>
                        <div className="text-[#c4a35a] text-sm">{'★'.repeat(Math.round(avgRating))}</div>
                        <div className="text-xs text-gray-500">{reviewsCount} total ratings</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Review Form */}
                <div className="bg-[#fbf7f1] p-6 rounded-2xl border border-[#eadaad]/50">
                  <h4 className="font-serif font-bold text-base text-[#1a1a1a] mb-3">Leave a Review</h4>
                  {token ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setUserRating(n)}
                              className={`text-2xl transition-colors ${n <= userRating ? 'text-[#c4a35a]' : 'text-gray-300'}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Review</label>
                        <textarea
                          value={userComment}
                          onChange={(e) => setUserComment(e.target.value)}
                          rows={3}
                          placeholder="Share your thoughts about taste, packaging, and freshness..."
                          className="w-full p-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#541d2b] text-sm bg-white"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="py-3 px-6 rounded-xl bg-[#541d2b] text-[#dfceae] hover:bg-[#3f1520] font-bold text-sm uppercase tracking-wider transition-all shadow"
                      >
                        {submittingReview ? 'Submitting...' : 'Post Review'}
                      </button>

                      {reviewMessage && (
                        <p className={`text-sm font-semibold mt-2 ${reviewMessage.error ? 'text-red-600' : 'text-green-700'}`}>
                          {reviewMessage.text}
                        </p>
                      )}
                    </form>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Please <Link href="/account" className="text-[#541d2b] font-bold underline">sign in to your account</Link> to submit a review.
                    </p>
                  )}
                </div>

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No reviews yet for this product. Be the first to share your review!</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r._id} className="p-5 rounded-xl border border-gray-100 bg-white shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                          <strong className="text-sm font-semibold text-gray-900">{r.userName}</strong>
                          <span className="text-[#c4a35a] text-sm tracking-tighter">{'★'.repeat(r.rating)}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Shipping & Returns */}
            {activeTab === 'shipping' && (
              <div className="space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#1a1a1a] mb-2">Shipping &amp; Delivery</h3>
                  <p>
                    {product.shippingInfo || 'We deliver across all major cities and towns in Pakistan. Orders are typically processed within 24 hours and shipped via reliable courier services. Delivery time usually takes 2 to 4 business days.'}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-xl font-serif font-bold text-[#1a1a1a] mb-2">Return &amp; Exchange Policy</h3>
                  <p>
                    {product.returnPolicy || 'Your satisfaction is our utmost priority. If you receive a damaged or incorrect package, please contact our support team within 48 hours of delivery for a prompt replacement or refund.'}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      </div>

      {/* Zoom / Lightbox Modal */}
      {zoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-2xl overflow-hidden p-6 flex flex-col items-center shadow-2xl">
            <button
              type="button"
              onClick={() => setZoomModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center font-bold text-xl transition-colors"
            >
              &times;
            </button>
            <h3 className="text-lg font-serif font-bold text-[#1a1a1a] mb-4">{product.name} — High Resolution View</h3>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-[#fbf7f1] rounded-xl w-full">
              <img
                src={images[activeImageIndex] || mainImg}
                alt={`${product.name} zoomed`}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
