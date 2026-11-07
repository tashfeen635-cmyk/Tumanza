'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ProductItem } from '@/lib/types';
import { productSlug } from '@/lib/seo';

export default function SearchOverlay() {
  const router = useRouter();
  const { searchOpen, setSearchOpen, allProducts } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      setResults([]);
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

  const handleSearch = (text: string) => {
    setQuery(text);
    const q = text.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }

    const filtered = allProducts.filter((p) => {
      const matchable = `${p.name} ${p.category} ${p.description || ''} ${p.urduName || ''}`.toLowerCase();
      return matchable.includes(q);
    });
    setResults(filtered);
  };

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
              onChange={(e) => handleSearch(e.target.value)}
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
