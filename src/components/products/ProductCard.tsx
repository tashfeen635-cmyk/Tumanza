'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductItem } from '@/lib/types';
import { productSlug } from '@/lib/seo';

interface ProductCardProps {
  product: ProductItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useStore();
  const inWishlist = isInWishlist(product._id);
  const href = `/product/${productSlug(product)}`;

  const rating = product.reviewAvg != null ? Math.round(product.reviewAvg) : Math.round(product.rating || 5);

  const displayImage =
    !product.image || product.image.includes('unsplash')
      ? '/images/product-pack.jpg'
      : product.image;

  const starsHtml = '★'.repeat(Math.max(1, Math.min(5, rating))) + '☆'.repeat(Math.max(0, 5 - rating));

  return (
    <article
      className="product-card"
      onClick={() => router.push(href)}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-img relative block aspect-square md:aspect-auto md:h-[26rem] overflow-hidden">
        <Image
          src={displayImage}
          alt={`${product.name} — buy online at Tumanza`}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          loading="lazy"
          className="object-contain md:object-cover p-2 md:p-0"
        />
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
          <Link
            href={href}
            className="btn btn-primary btn-block btn-card-details"
            onClick={(e) => e.stopPropagation()}
          >
            VIEW DETAILS
          </Link>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-name">
          <Link href={href} onClick={(e) => e.stopPropagation()} style={{ color: 'inherit', textDecoration: 'none' }}>
            {product.name}
          </Link>
        </h3>
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
    </article>
  );
}
