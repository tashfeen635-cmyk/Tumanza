'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ProductItem } from '@/lib/types';
import { productSlug } from '@/lib/seo';

export default function SearchOverlay() {
  const router = useRouter();
  const { searchOpen, setSearchOpen, allProducts, quickSearchTags, openProductModal } = useStore();
  const [query, setQuery] = useState('');
  const [signatureProduct, setSignatureProduct] = useState<ProductItem | null>(null);
  const [signatureKeywords, setSignatureKeywords] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/signature-product', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.enabled || !data?.published || !data?.product?.name) return;

        const product = data.product as ProductItem;
        setSignatureProduct({
          ...product,
          section: product.section || 'signature',
          rating: product.rating ?? 5,
        });

        const highlights = Array.isArray(data.highlights) ? data.highlights : [];
        setSignatureKeywords(
          [
            data.sectionHeading,
            data.tagline,
            ...highlights.map((h: { title?: string; subtitle?: string }) => `${h.title || ''} ${h.subtitle || ''}`),
          ]
            .filter(Boolean)
            .join(' ')
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      document.body.style.overflow = '';
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const catalog = signatureProduct
      ? [
          signatureProduct,
          ...allProducts.filter(
            (p) => p.name.trim().toLowerCase() !== signatureProduct.name.trim().toLowerCase()
          ),
        ]
      : allProducts;

    return catalog.filter((p) => {
      const extra = p._id === signatureProduct?._id ? ` ${signatureKeywords}` : '';
      const matchable = `${p.name} ${p.category} ${p.description || ''} ${p.urduName || ''}${extra}`.toLowerCase();
      return matchable.includes(q);
    });
  }, [query, allProducts, signatureProduct, signatureKeywords]);

  if (!searchOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setSearchOpen(false);
      }}
    >
      <div
        className="search-overlay active"
        id="searchOverlay"
        style={{
          maxHeight: '85vh',
          background: 'var(--header-bg)',
          paddingTop: '20px',
        }}
      >
        <div className="search-overlay-inner">
          <div className="search-input-row">
            <svg
              className="search-input-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              ref={inputRef}
              type="text"
              id="searchInput"
              placeholder="Search nuts, herbs, teas, supplements..."
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="search-close"
              id="searchClose"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#666', fontWeight: 600, textTransform: 'uppercase', marginRight: '4px' }}>Popular:</span>
            {quickSearchTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                style={{
                  background: query.toLowerCase() === tag.toLowerCase() ? '#541d2b' : '#f5f0eb',
                  color: query.toLowerCase() === tag.toLowerCase() ? '#fff' : '#444',
                  border: '1px solid #e5dbcd',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <div
            className="search-results"
            id="searchResults"
            style={{
              maxHeight: '60vh',
              overflowY: 'auto',
              marginTop: '16px',
            }}
          >
            {!query.trim() && (
              <p style={{ textAlign: 'center', color: '#888', padding: '30px 0', fontSize: '14px' }}>
                Start typing to search products...
              </p>
            )}

            {query.trim() && results.length === 0 && (
              <div className="search-no-results">
                <p>No products found for &quot;<strong>{query}</strong>&quot;</p>
              </div>
            )}

            {results.map((product) => {
              const resultImg =
                !product.image || product.image.includes('unsplash')
                  ? '/images/product-pack.jpg'
                  : product.image;

              return (
                <div
                  key={product._id}
                  className="search-result-item"
                  onClick={() => {
                    setSearchOpen(false);
                    if (product._id === signatureProduct?._id) {
                      window.setTimeout(() => openProductModal(product), 0);
                      return;
                    }
                    router.push(`/product/${productSlug(product)}`);
                  }}
                >
                  <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded">
                    <Image src={resultImg} alt={product.name} fill sizes="48px" loading="lazy" className="object-cover" />
                  </div>
                  <div className="search-result-info">
                    <div className="search-result-name">{product.name}</div>
                    <div className="search-result-meta">
                      {product.category} {product.urduName ? `· ${product.urduName}` : ''}
                    </div>
                  </div>
                  <span className="search-result-price">Rs.{product.price.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
