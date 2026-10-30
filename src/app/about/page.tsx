'use client';

import React from 'react';
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
            <div className="about-story-image">
              <img src="/images/showcase.png" alt="Our organic farm" loading="lazy" />
            </div>
            <div className="about-story-content">
              <h2 className="section-title">How It All Began</h2>
              <p>
                Tumanza started in 2018 with a small family farm in the highlands of
                Gilgit-Baltistan. What began as a passion for sharing the pure, untouched flavors of
                mountain-grown nuts quickly grew into a mission to connect health-conscious families
                with nature&apos;s finest organic produce.
              </p>
              <p>
                Our founders spent years building relationships with local farmers who share our
                commitment to organic, chemical-free farming. Every product we sell can be traced back
                to the farm it came from &mdash; that&apos;s our promise of transparency and trust.
              </p>
              <p>
                Today, Tumanza serves thousands of families across Pakistan and beyond, delivering
                handpicked, lab-tested organic nuts, seeds, herbs, and teas straight to their
                doorsteps. We believe that good food should be accessible, honest, and kind to the
                planet.
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
