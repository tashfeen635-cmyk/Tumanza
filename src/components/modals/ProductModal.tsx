'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ReviewRecord } from '@/lib/types';

export default function ProductModal() {
  const { selectedProduct, closeProductModal, openOrderPopup, token } = useStore();
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Review submission state
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    if (!selectedProduct) return;

    setLoadingReviews(true);
    setReviewMessage(null);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/reviews/${selectedProduct._id}`, { headers })
      .then((res) => (res.ok ? res.json() : { reviews: [] }))
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating);
        setReviewsCount(data.count || 0);
        if (data.userReview) {
          setUserRating(data.userReview.rating || 5);
          setUserComment(data.userReview.comment || '');
        } else {
          setUserRating(5);
          setUserComment('');
        }
      })
      .catch((e) => console.error('Failed to load reviews:', e))
      .finally(() => setLoadingReviews(false));
  }, [selectedProduct, token]);

  if (!selectedProduct) return null;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmittingReview(true);
    setReviewMessage(null);

    try {
      const res = await fetch(`/api/reviews/${selectedProduct._id}`, {
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
        const refRes = await fetch(`/api/reviews/${selectedProduct._id}`, {
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

  const getBenefits = () => {
    const name = selectedProduct.name.toLowerCase();
    const cat = selectedProduct.category.toLowerCase();

    if (name.includes('shilajit')) {
      return [
        { title: 'Rich in Fulvic Acid', text: 'Natural minerals & humic substances' },
        { title: 'Boosts Energy', text: 'Natural adaptogen for vitality' },
        { title: 'Cognitive Health', text: 'Supports brain function & focus' },
        { title: 'Athletic Performance', text: 'Enhances stamina & recovery' },
      ];
    }
    if (name.includes('tumoro') || name.includes('thyme')) {
      return [
        { title: 'Rich in Antioxidants', text: 'Natural protection & immunity boost' },
        { title: 'Respiratory Relief', text: 'Soothes cold, flu & cough symptoms' },
        { title: 'Aids Digestion', text: 'Improves gut health naturally' },
        { title: '100% Caffeine Free', text: 'Enjoy any time of day' },
      ];
    }
    if (cat.includes('tea') || cat.includes('herb')) {
      return [
        { title: 'Natural Ingredients', text: 'Pure herbal goodness' },
        { title: 'Health Benefits', text: 'Supports overall wellness' },
        { title: 'Caffeine Free', text: 'Perfect for any time of day' },
        { title: 'Handpicked Quality', text: 'Sourced from organic farms' },
      ];
    }
    if (cat.includes('nut') || cat.includes('seed') || cat.includes('dried')) {
      return [
        { title: 'Rich in Nutrients', text: 'Packed with vitamins & minerals' },
        { title: 'Heart Healthy', text: 'Good fats for cardiovascular health' },
        { title: 'High in Protein', text: 'Natural energy & muscle support' },
        { title: '100% Organic', text: 'No preservatives or additives' },
      ];
    }
    return [
      { title: 'Premium Quality', text: 'Handpicked from the best sources' },
      { title: '100% Organic', text: 'No chemicals or preservatives' },
      { title: 'Farm Fresh', text: 'Directly sourced from organic farms' },
      { title: 'Packed With Care', text: 'Sealed fresh for your family' },
    ];
  };

  const benefits = getBenefits();
  const displayRating = avgRating !== null ? avgRating : selectedProduct.rating || 5;
  const ratingInt = Math.max(1, Math.min(5, Math.round(displayRating)));
  const starsString = '★'.repeat(ratingInt) + '☆'.repeat(5 - ratingInt);

  const displayImage =
    !selectedProduct.image || selectedProduct.image.includes('unsplash')
      ? selectedProduct.name?.toLowerCase().includes('shilajit')
        ? '/images/shilajit.png'
        : '/images/product-pack.jpg'
      : selectedProduct.image;

  return (
    <>
      <div className="product-modal-overlay active" onClick={closeProductModal}></div>
      <div className="product-modal active" id="productModal">
        <button
          className="product-modal-close"
          id="productModalClose"
          aria-label="Close"
          onClick={closeProductModal}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="product-modal-inner">
          <div className="product-modal-image">
            <div className="special-img-wrapper">
              <img id="modalProductImg" src={displayImage} alt={selectedProduct.name} loading="lazy" />
              {selectedProduct.badge && (
                <div className="special-badge" id="modalProductBadge">
                  {selectedProduct.badge}
                </div>
              )}
            </div>
            <div className="special-img-bg"></div>
          </div>

          <div className="product-modal-content">
            <span className="special-tag" id="modalProductCategory">
              {(selectedProduct.category || 'PRODUCT').toUpperCase()}
            </span>
            <h2 className="special-title" id="modalProductName">
              {selectedProduct.name}
            </h2>
            {selectedProduct.urduName && (
              <p className="product-modal-urdu" id="modalProductUrdu">
                {selectedProduct.urduName}
              </p>
            )}
            <p className="special-description" id="modalProductDesc">
              {selectedProduct.description ||
                'Premium quality organic product, handpicked and packed fresh for your family.'}
            </p>

            <div className="special-benefits" id="modalProductBenefits">
              {benefits.map((b, idx) => (
                <div key={idx} className="benefit-item">
                  <div className="benefit-icon">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div className="benefit-text">
                    <strong>{b.title}</strong>
                    <span>{b.text}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="special-pricing">
              <div className="special-price">
                {selectedProduct.oldPrice > 0 && (
                  <span className="special-price-old" id="modalProductOldPrice">
                    Rs.{selectedProduct.oldPrice.toFixed(2)}
                  </span>
                )}
                <span className="special-price-current" id="modalProductPrice">
                  Rs.{selectedProduct.price.toFixed(2)}
                </span>
              </div>
              <div className="special-rating">
                <span className="stars" id="modalProductStars">
                  {starsString}
                </span>
                <span className="rating-count" id="modalProductStock">
                  ({selectedProduct.stock || 'In Stock'})
                </span>
              </div>
            </div>

            <div className="special-actions">
              <button
                className="btn btn-primary btn-order-now"
                id="modalOrderBtn"
                onClick={() => {
                  closeProductModal();
                  openOrderPopup(selectedProduct);
                }}
              >
                ORDER NOW
              </button>
              <button className="btn btn-outline" id="modalCloseBtn" onClick={closeProductModal}>
                GO BACK
              </button>
            </div>

            {/* Customer Reviews Section */}
            <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', margin: 0, color: 'var(--black)' }}>
                  Customer Reviews ({reviewsCount})
                </h3>
                {avgRating !== null && (
                  <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600 }}>
                    {avgRating.toFixed(1)} / 5.0 avg
                  </span>
                )}
              </div>

              {token ? (
                <form
                  onSubmit={handleReviewSubmit}
                  style={{ background: 'var(--off-white)', padding: '16px', marginBottom: '20px', borderRadius: '4px' }}
                >
                  <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: 'var(--black)' }}>
                    Share Your Feedback
                  </p>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        onClick={() => setUserRating(s)}
                        style={{
                          cursor: 'pointer',
                          fontSize: '22px',
                          color: s <= userRating ? 'var(--accent)' : '#ccc',
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Write your honest review..."
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                  {reviewMessage && (
                    <p style={{ fontSize: '12px', marginTop: '6px', color: reviewMessage.error ? '#d32f2f' : 'var(--primary)' }}>
                      {reviewMessage.text}
                    </p>
                  )}
                  <div style={{ marginTop: '8px', textAlign: 'right' }}>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="btn btn-primary"
                      style={{ padding: '8px 20px', fontSize: '11px' }}
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ padding: '12px', background: '#f5f5f5', fontSize: '12px', marginBottom: '16px' }}>
                  <span>Want to review this product? </span>
                  <Link href="/account" onClick={closeProductModal} style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    Sign in to leave a review
                  </Link>
                </div>
              )}

              {loadingReviews ? (
                <p style={{ fontSize: '13px', color: '#999', textAlign: 'center' }}>Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#999', textAlign: 'center' }}>No reviews yet. Be the first!</p>
              ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {reviews.map((r) => (
                    <div key={r._id} style={{ borderBottom: '1px solid #f0f0f0', padding: '10px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                        <span>{r.userName}</span>
                        <span style={{ color: '#999', fontWeight: 400 }}>{r.createdAt?.slice(0, 10)}</span>
                      </div>
                      <div style={{ color: 'var(--accent)', fontSize: '13px', margin: '2px 0' }}>
                        {'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}
                      </div>
                      {r.comment && <p style={{ fontSize: '12px', color: '#555', margin: '2px 0 0' }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
