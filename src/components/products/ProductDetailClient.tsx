'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ProductItem, ReviewRecord } from '@/lib/types';
import { resolveProductImage } from '@/lib/seo';

interface Props {
  product: ProductItem;
}

export default function ProductDetailClient({ product }: Props) {
  const { openOrderPopup } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'shipping'>('overview');

  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(product.reviewAvg ?? null);
  const [reviewsCount, setReviewsCount] = useState(product.reviewCount || 0);

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
    fetch(`/api/reviews/${product._id}`)
      .then((res) => (res.ok ? res.json() : { reviews: [] }))
      .then((data) => {
        setReviews(data.reviews || []);
        if (data.avgRating != null) setAvgRating(data.avgRating);
        setReviewsCount(data.count || 0);
      })
      .catch(() => {});
  }, [product._id]);

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
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4 items-start lg:sticky lg:top-28">
            
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
                    <Image src={img} alt={`${product.name} thumbnail ${idx + 1}`} fill sizes="96px" className="object-contain p-2" />
                  </button>
                ))}
              </div>
            )}

            {/* Large Main Image Display */}
            <div className="relative order-1 sm:order-2 flex-1 w-full rounded-2xl bg-[#fbf7f1] border border-[#eadaad]/60 overflow-hidden group shadow-inner aspect-square flex items-center justify-center p-4 sm:p-6">
              {product.badge && (
                <span className="absolute top-4 left-4 z-10 bg-[#541d2b] text-[#dfceae] text-xs font-semibold px-3 py-1.5 rounded-full shadow tracking-wider uppercase">
                  {product.badge}
                </span>
              )}
              
              <div className="relative w-full h-full">
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  fetchPriority="high"
                  className="object-contain"
                />
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading text-[#1a1a1a] font-bold leading-tight mb-1">
              {product.name}
            </h1>
            {product.urduName && (
              <p className="text-sm font-medium text-[#5d5b5b] mb-3">{product.urduName}</p>
            )}

            {/* Rating & Reviews Jump */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center text-amber-500 text-sm tracking-widest">
                {starsString}
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="text-xs font-semibold text-[#541d2b] hover:underline"
              >
                ({reviewsCount} {reviewsCount === 1 ? 'Review' : 'Reviews'})
              </button>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-3 mb-6 p-4 rounded-xl bg-[#fbf7f1] border border-[#eadaad]/50">
              <span className="text-2xl sm:text-3xl font-bold text-[#541d2b]">
                Rs.{product.price.toFixed(2)}
              </span>
              {product.oldPrice && product.oldPrice > 0 && (
                <span className="text-base text-gray-400 line-through">
                  Rs.{product.oldPrice.toFixed(2)}
                </span>
              )}
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="ml-auto text-xs font-bold bg-[#b95871] text-white px-2.5 py-1 rounded-full">
                  Save Rs.{(product.oldPrice - product.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
              {descriptionText}
            </p>

            {/* Quantity Selector & Order Now Action */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity:</span>
                <div className="inline-flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2 text-gray-600 hover:bg-gray-100 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-bold text-gray-800 text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3.5 py-2 text-gray-600 hover:bg-gray-100 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => openOrderPopup(product)}
                  className="flex-1 bg-[#541d2b] hover:bg-[#3f1520] text-[#dfceae] font-bold py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm tracking-wider uppercase"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  ORDER NOW
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100 text-center">
              <div className="p-3 bg-[#fbf7f1] rounded-xl border border-[#eadaad]/40">
                <span className="block font-bold text-xs text-[#541d2b]">100% Organic</span>
                <span className="text-[11px] text-gray-500">Pure Harvest</span>
              </div>
              <div className="p-3 bg-[#fbf7f1] rounded-xl border border-[#eadaad]/40">
                <span className="block font-bold text-xs text-[#541d2b]">Fast Shipping</span>
                <span className="text-[11px] text-gray-500">Nationwide</span>
              </div>
              <div className="p-3 bg-[#fbf7f1] rounded-xl border border-[#eadaad]/40">
                <span className="block font-bold text-xs text-[#541d2b]">Lab Tested</span>
                <span className="text-[11px] text-gray-500">Highest Quality</span>
              </div>
            </div>

          </div>
        </div>

        {/* Tabs Section: Overview / Reviews / Shipping */}
        <div className="mt-14 border-t border-gray-200 pt-10">
          <div className="flex border-b border-gray-200 gap-8">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`pb-4 text-sm sm:text-base font-bold transition-all relative ${
                activeTab === 'overview' ? 'text-[#541d2b] border-b-2 border-[#541d2b]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Product Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-sm sm:text-base font-bold transition-all relative ${
                activeTab === 'reviews' ? 'text-[#541d2b] border-b-2 border-[#541d2b]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Customer Reviews ({reviewsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shipping')}
              className={`pb-4 text-sm sm:text-base font-bold transition-all relative ${
                activeTab === 'shipping' ? 'text-[#541d2b] border-b-2 border-[#541d2b]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Shipping &amp; Returns
            </button>
          </div>

          <div className="py-8">
            {activeTab === 'overview' && (
              <div className="prose max-w-none text-gray-600 text-sm sm:text-base leading-relaxed space-y-4">
                <p>{descriptionText}</p>
                <p>
                  Handpicked and sustainably packed to retain maximum natural freshness and nutritional benefits. Enjoy the authentic, rich taste of premium organic produce directly from nature.
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-gray-500 text-sm">No reviews yet for this product.</p>
                  ) : (
                    reviews.map((r) => {
                      const rStars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
                      return (
                        <div key={r._id} className="p-4 rounded-xl border border-gray-100 bg-white shadow-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-gray-800 text-sm">{r.userName}</span>
                            <span className="text-xs text-gray-400">{r.createdAt?.slice(0, 10)}</span>
                          </div>
                          <div className="text-amber-500 text-xs mb-2">
                            {rStars}
                          </div>
                          <p className="text-gray-600 text-sm">{r.comment}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="prose max-w-none text-gray-600 text-sm sm:text-base leading-relaxed space-y-4">
                <h3 className="text-xl font-heading font-bold text-[#1a1a1a] mb-2">Shipping Information</h3>
                <p>
                  We ship nationwide across Pakistan with reliable courier partners. Standard delivery takes 2 to 4 business days. Free shipping on qualifying orders.
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-xl font-heading font-bold text-[#1a1a1a] mb-2">Return &amp; Exchange Policy</h3>
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
  </div>
  );
}
