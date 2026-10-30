'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { ProductItem } from '@/lib/types';

interface ProductCardProps {
  product: ProductItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { openProductModal, toggleWishlist, isInWishlist } = useStore();
  const inWishlist = isInWishlist(product._id);

  const rating = product.reviewAvg != null ? Math.round(product.reviewAvg) : Math.round(product.rating || 5);

  const displayImage =
    !product.image || product.image.includes('unsplash')
      ? product.name?.toLowerCase().includes('shilajit')
        ? '/images/shilajit.png'
        : '/images/product-pack.jpg'
      : product.image;

  const starsHtml = '★'.repeat(Math.max(1, Math.min(5, rating))) + '☆'.repeat(Math.max(0, 5 - rating));

  return (
    <div className="product-card" onClick={() => openProductModal(product)}>
      <div className="product-img">
        <img src={displayImage} alt={product.name} loading="lazy" />
        {product.badge && (
          <span className={`product-badge ${product.badge.toLowerCase()}`}>
            {product.badge}
          </span>
        )}
        <button
          type="button"
          className="wishlist-heart"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product._id);
          }}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={inWishlist ? '#e04f3a' : 'none'}
            stroke={inWishlist ? '#e04f3a' : 'currentColor'}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <div className="product-actions">
          <button
            type="button"
            className="btn btn-primary btn-block btn-card-details"
            onClick={(e) => {
              e.stopPropagation();
              openProductModal(product);
            }}
          >
            VIEW DETAILS
          </button>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.urduName && <span className="product-name-urdu">{product.urduName}</span>}
        {product.description && <p className="product-desc">{product.description}</p>}
        <div className="product-rating">
          <span className="stars">{starsHtml}</span>
          {product.reviewCount && product.reviewCount > 0 ? (
            <span className="review-count"> ({product.reviewCount})</span>
          ) : null}
        </div>
        <div className="product-price">
          {product.oldPrice > 0 && (
            <span className="price-old">Rs.{product.oldPrice.toFixed(2)}</span>
          )}
          <span className="price-current">Rs.{product.price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
