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

  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(product.reviewAvg ?? null);
  const [reviewsCount, setReviewsCount] = useState(product.reviewCount || 0);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const displayImage = resolveProductImage(product);
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
    if (!token) return;
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

  const answerBlock =
    product.description?.trim() ||
    `${product.name} from Tumanza is a premium organic ${product.category.toLowerCase()} product, sourced with care and available for delivery across Pakistan.`;

  return (
    <div className="product-detail-page" style={{ marginTop: '90px', paddingBottom: '60px' }}>
      <div className="container">
        <nav aria-label="Breadcrumb" style={{ fontSize: 13, marginBottom: 24, color: '#666' }}>
          <Link href="/">Home</Link>
          {' / '}
          <Link href="/shop">Shop</Link>
          {' / '}
          <span style={{ color: '#222' }}>{product.name}</span>
        </nav>

        <div className="product-modal-inner" style={{ display: 'grid', gap: 32 }}>
          <div className="product-modal-image">
            <div className="special-img-wrapper">
              <img src={displayImage} alt={`${product.name} — Tumanza organic`} />
              {product.badge && <div className="special-badge">{product.badge}</div>}
            </div>
          </div>

          <div className="product-modal-content">
            <span className="special-tag">{(product.category || 'PRODUCT').toUpperCase()}</span>
            <h1 className="special-title" style={{ marginTop: 8 }}>
              {product.name}
            </h1>
            {product.urduName && <p className="product-modal-urdu">{product.urduName}</p>}

            {/* AEO answer block — short citable summary */}
            <p className="special-description" style={{ fontSize: 15, lineHeight: 1.6 }}>
              {answerBlock}
            </p>

            <div className="special-pricing">
              <div className="special-price">
                {product.oldPrice > 0 && (
                  <span className="special-price-old">Rs.{product.oldPrice.toFixed(2)}</span>
                )}
                <span className="special-price-current">Rs.{product.price.toFixed(2)}</span>
              </div>
              <div className="special-rating">
                <span className="stars">{starsString}</span>
                <span className="rating-count">
                  ({reviewsCount > 0 ? `${reviewsCount} reviews` : product.stock || 'In Stock'})
                </span>
              </div>
            </div>

            <div className="special-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary btn-order-now"
                onClick={() => openOrderPopup(product)}
              >
                ORDER NOW
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => toggleWishlist(product._id)}
              >
                {inWishlist ? '♥ In Wishlist' : '♡ Wishlist'}
              </button>
              <Link href="/shop" className="btn btn-outline">
                Back to Shop
              </Link>
            </div>

            <section style={{ marginTop: 36, borderTop: '1px solid #eee', paddingTop: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, marginBottom: 12 }}>
                Product details
              </h2>
              <ul style={{ fontSize: 14, lineHeight: 1.7, color: '#444', paddingLeft: 18 }}>
                <li>Category: {product.category}</li>
                <li>Availability: {product.stock || 'In Stock'}</li>
                <li>Brand: Tumanza</li>
                <li>Ships across Pakistan</li>
              </ul>
            </section>

            <section style={{ marginTop: 28 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                }}
              >
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, margin: 0 }}>
                  Customer Reviews ({reviewsCount})
                </h2>
                {avgRating != null && (
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{avgRating.toFixed(1)} / 5.0</span>
                )}
              </div>

              {token ? (
                <form
                  onSubmit={handleReviewSubmit}
                  style={{ background: 'var(--off-white)', padding: 16, marginBottom: 20, borderRadius: 4 }}
                >
                  <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600 }}>Your rating</p>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setUserRating(n)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 20,
                          color: n <= userRating ? '#c4a35a' : '#ccc',
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    rows={3}
                    placeholder="Share your experience..."
                    style={{ width: '100%', padding: 10, marginBottom: 10, fontSize: 13 }}
                  />
                  <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                  {reviewMessage && (
                    <p
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        color: reviewMessage.error ? '#c0392b' : '#2e7d32',
                      }}
                    >
                      {reviewMessage.text}
                    </p>
                  )}
                </form>
              ) : (
                <p style={{ fontSize: 13, marginBottom: 16 }}>
                  <Link href="/account">Sign in</Link> to leave a review.
                </p>
              )}

              {reviews.length === 0 ? (
                <p style={{ fontSize: 13, color: '#777' }}>No reviews yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {reviews.map((r) => (
                    <li
                      key={r._id}
                      style={{
                        borderBottom: '1px solid #eee',
                        padding: '12px 0',
                        fontSize: 13,
                      }}
                    >
                      <strong>{r.userName}</strong>
                      <span style={{ marginLeft: 8, color: '#c4a35a' }}>
                        {'★'.repeat(r.rating)}
                      </span>
                      <p style={{ margin: '6px 0 0', color: '#555' }}>{r.comment}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
