'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ProductItem } from '@/lib/types';
import { productSlug } from '@/lib/seo';

interface ProductCardProps {
  product: ProductItem;
}

const truncateDescription = (desc: string, maxLen = 153) => {
  if (!desc) return '';
  const trimmed = desc.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen).trim() + '...';
};

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const href = `/product/${productSlug(product)}`;

  const rating = product.reviewAvg != null ? Math.round(product.reviewAvg) : Math.round(product.rating || 5);

  const displayImage =
    !product.image || product.image.includes('unsplash')
      ? '/images/product-pack.jpg'
      : product.image;

  const starsHtml = '★'.repeat(Math.max(1, Math.min(5, rating))) + '☆'.repeat(Math.max(0, 5 - rating));

  const displayDescription = product.description ? truncateDescription(product.description, 153) : '';

  return (
    <article
      className="product-card"
      onClick={() => router.push(href)}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-img">
        <Image
          src={displayImage}
          alt={`${product.name} — buy online at Tumanza`}
          fill
          sizes="(max-width: 992px) 50vw, 33vw"
          loading="lazy"
          className="product-image"
        />
        {product.badge && (
          <span className={`product-badge ${product.badge.toLowerCase()}`}>
            {product.badge}
          </span>
        )}
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
        <div className="product-heading">
          <h3 className="product-name">
            <Link href={href} onClick={(e) => e.stopPropagation()} style={{ color: 'inherit', textDecoration: 'none' }}>
              {product.name}
            </Link>
          </h3>
          {product.urduName && <span className="product-name-urdu">{product.urduName}</span>}
        </div>
        <p className="product-desc">{displayDescription || '\u00A0'}</p>
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
        <div className="product-actions-mobile">
          <Link
            href={href}
            className="btn btn-primary btn-block btn-card-details"
            onClick={(e) => e.stopPropagation()}
          >
            VIEW DETAILS
          </Link>
        </div>
      </div>
    </article>
  );
}
