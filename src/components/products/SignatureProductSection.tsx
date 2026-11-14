'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ProductItem } from '@/lib/types';
import { resolveProductImage } from '@/lib/seo';

interface SignatureConfig {
  _id: string;
  productId: string;
  enabled: boolean;
  published: boolean;
  sectionHeading: string;
  mainHeading: string;
  tagline: string;
  description: string;
  badge: string;
  images: string[];
  highlights: { title: string; subtitle: string }[];
  showRatings: boolean;
  orderButtonText: string;
  shippingText: string;
  paymentText: string;
  returnText: string;
  product?: ProductItem;
}

export default function SignatureProductSection() {
  const { allProducts, openOrderPopup } = useStore();
  
  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP
  const [config, setConfig] = useState<SignatureConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetch('/api/signature-product', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setConfig(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fallback product if API fails or hasn't loaded yet
  const fallbackProduct = allProducts.find(
    (p) => p.name.toLowerCase().includes('shilajit')
  ) || allProducts[0];

  const product = config?.product || fallbackProduct;

  // Conditional returns MUST happen AFTER all hooks
  if (!product) return null;
  if (config && (!config.enabled || !config.published)) {
    return null;
  }

  const mainImg = resolveProductImage(product);
  const rawImages = [
    ...(config?.images && config.images.length > 0 ? config.images : []),
    product.image,
    ...(product.images || []),
  ];
  const galleryImages = Array.from(new Set(rawImages.filter(Boolean))) as string[];

  const currentImage = galleryImages[activeImageIndex] || mainImg;

  const ratingValue = product.reviewAvg ?? product.rating ?? 5;
  const reviewCount = product.reviewCount ?? 0;
  const starsString = '★'.repeat(Math.round(ratingValue)) + '☆'.repeat(5 - Math.round(ratingValue));

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const sectionHeading = config?.sectionHeading || 'OUR SIGNATURE PRODUCT';
  const mainHeading = config?.mainHeading || product.name || 'Tumanza Shilajit';
  const tagline = config?.tagline || 'Pure Power from Gilgit-Baltistan';
  const description = config?.description || product.description || '';
  const badge = config?.badge || product.badge || 'PREMIUM QUALITY';
  const highlights = config?.highlights?.length ? config.highlights : [
    { title: '84+ Minerals', subtitle: 'Fulvic & Humic Acid' },
    { title: 'Stamina & Energy', subtitle: 'Natural Cellular Vitality' },
    { title: 'Gilgit Harvest', subtitle: 'Authentic High-Altitude' },
    { title: 'Lab Tested Purity', subtitle: '100% Certified Safe' },
  ];
  const orderButtonText = config?.orderButtonText || 'Order Now';
  const shippingText = config?.shippingText || 'Free Nationwide Shipping';
  const paymentText = config?.paymentText || 'Secure Payment COD Available';
  const returnText = config?.returnText || '100% Authentic Guaranteed';
  const showRatings = config?.showRatings ?? true;

  return (
    <section className="signature-product-section py-16 sm:py-24 bg-[#FFF8ED] border-y border-[#eadaad]/50 relative overflow-hidden">
      {/* Background Subtle Luxury Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#dfceae]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#541d2b]/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="inline-block text-xs font-bold tracking-[0.2em] text-[#541d2b] uppercase bg-[#dfceae]/30 px-4 py-1.5 rounded-full mb-3 shadow-xs">
            {sectionHeading}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading text-[#1a1a1a] font-bold tracking-tight mb-3">
            {mainHeading}
          </h2>
          <p className="text-base sm:text-lg text-[#5d5b5b] font-medium">
            {tagline}
          </p>
        </div>

        {/* Main Product Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-[#eadaad]/60 p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* LEFT COLUMN: Product Image Gallery */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              
              {/* Main Image Viewport */}
              <div className="relative w-full aspect-square rounded-2xl bg-[#FFF8ED] border border-[#eadaad]/60 overflow-hidden shadow-inner flex items-center justify-center p-6 group">
                {badge && (
                  <span className="absolute top-4 left-4 z-10 bg-[#541d2b] text-[#dfceae] text-xs font-bold px-3.5 py-1.5 rounded-full shadow tracking-widest uppercase">
                    {badge}
                  </span>
                )}

                {/* Previous / Next Navigation Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-15 bg-white/90 hover:bg-white text-[#541d2b] p-2.5 rounded-full shadow-md border border-[#eadaad] transition-all opacity-80 group-hover:opacity-100"
                      aria-label="Previous Image"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-15 bg-white/90 hover:bg-white text-[#541d2b] p-2.5 rounded-full shadow-md border border-[#eadaad] transition-all opacity-80 group-hover:opacity-100"
                      aria-label="Next Image"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </>
                )}

                {/* Primary Image */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="object-contain transition-all duration-500 hover:scale-105"
                  />
                </div>
              </div>

              {/* Thumbnails Row */}
              {galleryImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 justify-start sm:justify-center">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-[#FFF8ED] ${
                        activeImageIndex === idx
                          ? 'border-[#541d2b] shadow-md ring-2 ring-[#dfceae]/60 scale-105'
                          : 'border-[#eadaad]/60 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        sizes="96px"
                        className="object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Product Details */}
            <div className="lg:col-span-6 flex flex-col">
              
              {/* Category & Stock Status */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold tracking-widest text-[#541d2b] bg-[#dfceae]/30 px-3 py-1 rounded-md uppercase">
                  {product.category || 'Herbs & Supplements'}
                </span>
                <span className="text-xs font-semibold text-[#8B9A46] bg-[#8B9A46]/10 px-3 py-1 rounded-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8B9A46] animate-pulse"></span>
                  {product.stock || 'In Stock'}
                </span>
              </div>

              {/* Title & Urdu Name */}
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading text-[#1a1a1a] font-bold leading-tight mb-1">
                {product.name}
              </h3>
              {product.urduName && (
                <p className="text-sm font-semibold text-[#5d5b5b] mb-4">
                  {product.urduName} &bull; Strength &bull; Stamina &bull; Better Health
                </p>
              )}

              {/* Rating & Review Count */}
              {showRatings && (
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center text-amber-500 text-sm tracking-widest">
                    {starsString}
                  </div>
                  <span className="text-xs font-bold text-[#541d2b]">
                    {ratingValue.toFixed(1)} ({reviewCount} Verified Reviews)
                  </span>
                </div>
              )}

               {/* Pricing Box */}
              <div className="flex items-baseline gap-4 mb-6 p-4 rounded-2xl bg-[#FFF8ED] border border-[#eadaad]/60 shadow-inner">
                <span className="text-3xl sm:text-4xl font-bold text-[#541d2b]">
                  Rs.{Number(product?.price || 59).toFixed(2)}
                </span>
                {product?.oldPrice && product.oldPrice > product.price && (
                  <>
                    <span className="text-base text-gray-400 line-through">
                      Rs.{Number(product.oldPrice).toFixed(2)}
                    </span>
                    <span className="ml-auto text-xs font-bold bg-[#b95871] text-white px-3 py-1 rounded-full shadow-xs">
                      Save Rs.{Number(product.oldPrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-6">
                {description}
              </p>

              {/* Feature Highlights / Icons */}
              {highlights.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {highlights.map((h, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-[#FFF8ED]/70 border border-[#eadaad]/40">
                      <div className="w-9 h-9 rounded-lg bg-[#541d2b] text-[#dfceae] flex items-center justify-center font-bold shrink-0 shadow-xs">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-[#1a1a1a]">{h.title}</h5>
                        <p className="text-[11px] text-[#5d5b5b]">{h.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Now CTA Button */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => openOrderPopup(product)}
                  className="w-full bg-[#541d2b] hover:bg-[#3f1520] text-[#dfceae] font-bold py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-base tracking-wider uppercase group"
                >
                  <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {orderButtonText}
                </button>
              </div>

              {/* Shipping, Secure Payment & Return Info */}
              <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-gray-100 text-center">
                <div className="p-3 bg-[#FFF8ED] rounded-xl border border-[#eadaad]/50">
                  <span className="block font-bold text-xs text-[#541d2b]">Shipping</span>
                  <span className="text-[11px] text-gray-500">{shippingText}</span>
                </div>
                <div className="p-3 bg-[#FFF8ED] rounded-xl border border-[#eadaad]/50">
                  <span className="block font-bold text-xs text-[#541d2b]">Payment</span>
                  <span className="text-[11px] text-gray-500">{paymentText}</span>
                </div>
                <div className="p-3 bg-[#FFF8ED] rounded-xl border border-[#eadaad]/50">
                  <span className="block font-bold text-xs text-[#541d2b]">Guarantee</span>
                  <span className="text-[11px] text-gray-500">{returnText}</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
