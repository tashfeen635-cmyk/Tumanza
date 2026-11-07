'use client';

import React from 'react';
import Image from 'next/image';
import { Features, Newsletter } from '@/components';

export default function AboutPage() {
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
      {/* ========== ABOUT HERO ========== */}
      <section className="about-section" style={{ marginTop: '90px' }}>
        <div className="about-overlay"></div>
        <div className="about-inner">
          <div className="about-content">
            <p className="about-subtitle">OUR STORY</p>
            <h1 className="about-title">From The Orchard To Your Doorstep</h1>
            <p className="about-text">
              Tumanza was born from a simple belief: everyone deserves access to pure, organic, and
              sustainably sourced nuts. We partner directly with small farmers across the globe to
              bring you the freshest harvest.
            </p>
            <p className="about-text">
              No preservatives, no artificial flavors, no compromise. Just nature at its peak &mdash;
              cracked, roasted, and packed with care for you and your family.
            </p>
          </div>
        </div>
      </section>

      {/* ========== OUR STORY EXPANDED ========== */}
      <section className="about-story">
        <div className="container">
          <div className="about-story-grid">
            <div className="about-story-image relative h-[400px] rounded-2xl overflow-hidden">
              <Image src="/images/himalayan-wellness-collection.png" alt="Tumanza Himalayan Wellness Collection" fill sizes="(max-width: 768px) 100vw, 50vw" loading="lazy" className="object-cover" />
            </div>
            <div className="about-story-content">
              <h2 className="section-title">How It All Began</h2>
              <p>
                TUMANZA was introduced in 2026 with a vision to bring nature-inspired wellness and
                premium products to everyday life. Rooted in the natural richness of Pakistan, our
                brand focuses on carefully selected products, with quality, authenticity, and trust
                at its core.
              </p>
              <p>
                Our collection features three key categories: premium Shilajit sourced from
                high-altitude mountain regions, Tumuru Tea made from wild thyme of Gilgit-Baltistan,
                and carefully selected dry fruits.
              </p>
              <p>
                We prioritize Shilajit as our flagship product, followed by Tumuru Tea and dry fruits.
                Every product reflects our commitment to quality, natural origins, and delivering a
                premium experience to our customers.
              </p>
            </div>
          </div>
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
    </div>
  );
}
