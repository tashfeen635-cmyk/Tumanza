'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { DEFAULT_INSTAGRAM_IMAGES } from '@/lib/constants';
import {
  ProductCard,
  Features,
  Newsletter,
  SignatureProductSection,
} from '@/components';

export default function HomePage() {
  const { allProducts, collectionCategories } = useStore();
  const [selectedCollectionCategory, setSelectedCollectionCategory] = React.useState('All');
  const [instagramImages, setInstagramImages] = React.useState<string[]>([
    ...DEFAULT_INSTAGRAM_IMAGES,
  ]);

  React.useEffect(() => {
    let cancelled = false;

    fetch('/api/instagram-feed', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (
          !cancelled &&
          Array.isArray(data?.images) &&
          data.images.length === DEFAULT_INSTAGRAM_IMAGES.length
        ) {
          setInstagramImages(data.images.map(String));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const collectionCategoriesList = ['All', ...collectionCategories];

  const popularProducts = allProducts.filter(
    (p) => !p.section || p.section === 'popular' || p.section === 'trending' || p.section === 'bestselling'
  );
  const baseProducts = popularProducts.length > 0 ? popularProducts : allProducts;

  const filteredCollectionProducts = selectedCollectionCategory === 'All'
    ? baseProducts
    : baseProducts.filter((p) => p.category === selectedCollectionCategory);

  const displayProducts = filteredCollectionProducts.slice(0, 6);

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Verified Buyer',
      text: "The freshest almonds I've ever tasted. You can really tell the difference with organic. My family goes through a bag every week now!",
    },
    {
      name: 'Emily R.',
      role: 'Verified Buyer',
      text: "I've tried every nut brand out there, and Tumanza is hands down the best. The trail mix is addictive, and I love that everything is organic.",
    },
    {
      name: 'James L.',
      role: 'Verified Buyer',
      text: 'Fast delivery, eco-friendly packaging, and the cashews are unbelievably fresh. Tumanza has become our household staple. Highly recommend!',
    },
  ];

  return (
    <div>
      {/* ========== HERO SECTION ========== */}
      <section className="hero">
        {/* Desktop Hero Image */}
        <div className="absolute inset-0 z-0 hidden md:block">
          <Image
            src="/img/hero.jpg"
            alt="Tumanza Hero Background"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={75}
            className="object-cover object-right"
          />
        </div>
        {/* Mobile Hero Image */}
        <div className="absolute inset-0 z-0 block md:hidden">
          <Image
            src="/img/hero-mobile.jpg"
            alt="Tumanza Hero Background"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={75}
            className="object-cover object-bottom"
          />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-inner">
          <div className="hero-content">
            <p className="hero-subtitle">100% ORGANIC</p>
            <h1 className="hero-title">NATURAL WELLNESS &amp; ORGANIC PRODUCTS</h1>
            <p className="hero-text">
              Discover premium Shilajit, wild herbal tea, dry fruits and Nuts. Natural goodness,
              carefully sourced for better living.
            </p>
            <Link href="/products" className="btn btn-white">
              SHOP NOW
            </Link>
          </div>
        </div>
      </section>

      {/* ========== SIGNATURE PRODUCT SECTION ========== */}
      <SignatureProductSection />

      {/* ========== POPULAR PRODUCTS ========== */}
      <section className="products-section" id="shop" data-section-name="popular">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Tumanza&apos;s Collection</h2>
            <p className="section-subtitle">
              Our most loved organic nuts and wellness products that customers keep coming back for
            </p>
          </div>

          {/* Collection Category Filter Tabs */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '35px',
            }}
          >
            {collectionCategoriesList.map((cat) => {
              const isActive = selectedCollectionCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCollectionCategory(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '30px',
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: isActive ? '#541d2b' : '#f9f6f0',
                    color: isActive ? '#fff' : '#5d5b5b',
                    border: isActive ? '1px solid #541d2b' : '1px solid #e5dbcd',
                    boxShadow: isActive ? '0 4px 12px rgba(84, 29, 43, 0.2)' : 'none',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="products-grid" id="popularGrid">
            {displayProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          {filteredCollectionProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              <p>No products found in this category.</p>
            </div>
          )}
          {baseProducts.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '45px' }}>
              <Link href="/products" className="btn btn-primary">
                MORE PRODUCTS
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Customers Say</h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, idx) => (
              <div key={idx} className="testimonial-card">
                <div className="testimonial-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
                <div className="testimonial-author">
                  <div className="author-info">
                    <h4>{t.name}</h4>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <Features />

      {/* ========== NEWSLETTER ========== */}
      <Newsletter />

      {/* ========== INSTAGRAM FEED ========== */}
      <section className="instagram-feed">
        <div className="instagram-grid">
          {instagramImages.map((src, i) => (
            <a
              key={i}
              href="https://www.instagram.com/tumanza.official/"
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-item relative block h-64 overflow-hidden"
            >
              <Image
                src={src}
                alt={`Instagram ${i + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                loading="lazy"
                unoptimized={!src.startsWith('/')}
                className="object-cover"
              />
              <div className="instagram-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="5"
                    ry="5"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  ></rect>
                  <circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="2"></circle>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="white"></circle>
                </svg>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
