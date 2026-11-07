'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ProductItem } from '@/lib/types';
import { productSlug } from '@/lib/seo';

export default function InlineSearch() {
  const router = useRouter();
  const { allProducts } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ProductItem[]>([]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const q = term.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }
    const filtered = allProducts.filter((p) => {
      const match = `${p.name} ${p.category} ${p.description || ''} ${p.urduName || ''}`.toLowerCase();
      return match.includes(q);
    });
    setResults(filtered);
  };

  return (
    <section className="inline-search" id="inlineSearch">
      <div className="container">
        <div className="inline-search-head">
          <span className="inline-search-eyebrow">QUICK SEARCH</span>
          <h2 className="inline-search-title">Find your favorite organic picks</h2>
          <p className="inline-search-subtitle">
            Search by product, category or ingredient &mdash; results appear as you type.
          </p>
        </div>

        <div className="inline-search-inner">
          <span className="inline-search-icon-wrap">
            <svg
              className="inline-search-icon"
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
          </span>
          <input
            type="text"
            className="inline-search-input"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search nuts, seeds, herbs, teas, supplements..."
          />
          {searchTerm && (
            <button
              className="inline-search-clear visible"
              type="button"
              aria-label="Clear search"
              onClick={() => handleSearch('')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        <div className="inline-search-tags">
          <span className="inline-search-tags-label">Popular:</span>
          {['Almonds', 'Seeds', 'Herbs', 'Tea', 'Shilajit'].map((tag) => (
            <button
              key={tag}
              type="button"
              className="inline-search-tag"
              onClick={() => handleSearch(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {searchTerm.trim() && (
          <div className="inline-search-results has-results" id="inlineSearchResults">
            {results.length === 0 ? (
              <div className="search-no-results">
                <p>No products found matching &quot;<strong>{searchTerm}</strong>&quot;</p>
              </div>
            ) : (
              results.map((p) => {
                const searchImg =
                  !p.image || p.image.includes('unsplash')
                    ? '/images/product-pack.jpg'
                    : p.image;

                return (
                  <div
                    key={p._id}
                    className="search-result-item"
                    onClick={() => {
                      setSearchTerm('');
                      router.push(`/product/${productSlug(p)}`);
                    }}
                  >
                    <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded">
                      <Image src={searchImg} alt={p.name} fill sizes="48px" loading="lazy" className="object-cover" />
                    </div>
                    <div className="search-result-info">
                      <div className="search-result-name">{p.name}</div>
                      <div className="search-result-meta">
                        {p.category} {p.urduName ? `· ${p.urduName}` : ''}
                      </div>
                    </div>
                    <span className="search-result-price">Rs.{p.price.toFixed(2)}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </section>
  );
}
