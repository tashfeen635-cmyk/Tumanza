'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  ProductCard,
  InlineSearch,
  Features,
  Newsletter,
} from '@/components';

export default function ShopPage() {
  const { allProducts } = useStore();

  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const categories = ['Nuts', 'Herbs & Supplements', 'Teas', 'Mixes & Butters', 'Spices'];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = allProducts.slice();

    if (category) {
      list = list.filter((p) => p.category === category);
    }

    if (priceRange) {
      const parts = priceRange.split('-');
      const minP = parseFloat(parts[0]);
      const maxP = parts[1] ? parseFloat(parts[1]) : Infinity;
      list = list.filter((p) => p.price >= minP && p.price <= maxP);
    }

    if (ratingFilter) {
      const r = parseInt(ratingFilter, 10);
      list = list.filter((p) => {
        const star = p.reviewAvg != null ? p.reviewAvg : p.rating || 5;
        return star >= r;
      });
    }

    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => {
        const ra = a.reviewAvg != null ? a.reviewAvg : a.rating || 5;
        const rb = b.reviewAvg != null ? b.reviewAvg : b.rating || 5;
        return rb - ra;
      });
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [allProducts, category, priceRange, ratingFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  return (
    <div>
      {/* ========== SHOP HERO ========== */}
      <section className="hero" style={{ minHeight: '50vh' }}>
        <div className="hero-overlay"></div>
        <div className="hero-inner">
          <div className="hero-content">
            <p className="hero-subtitle">TUMANZA COLLECTION</p>
            <h1 className="hero-title">Shop All Products</h1>
            <p className="hero-text">
              Explore our full range of premium organic nuts, seeds, herbs, teas and supplements.
            </p>
          </div>
        </div>
      </section>

      {/* ========== INLINE SEARCH BAR + FILTERS ========== */}
      <InlineSearch />

      {/* Filter controls */}
      <div className="container" style={{ marginTop: '20px', marginBottom: '10px' }}>
        <div
          id="shopFilters"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            padding: '16px',
            background: 'var(--off-white)',
            borderRadius: '6px',
          }}
        >
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 14px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '13px',
              background: '#fff',
              cursor: 'pointer',
              minWidth: '140px',
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={priceRange}
            onChange={(e) => {
              setPriceRange(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 14px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '13px',
              background: '#fff',
              cursor: 'pointer',
              minWidth: '140px',
            }}
          >
            <option value="">All Prices</option>
            <option value="0-15">Under Rs.15</option>
            <option value="15-25">Rs.15 - Rs.25</option>
            <option value="25-50">Rs.25 - Rs.50</option>
            <option value="50-100">Rs.50+</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 14px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '13px',
              background: '#fff',
              cursor: 'pointer',
              minWidth: '120px',
            }}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 14px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '13px',
              background: '#fff',
              cursor: 'pointer',
              minWidth: '150px',
            }}
          >
            <option value="">Sort By</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name: A-Z</option>
          </select>

          <span style={{ fontSize: '13px', color: '#666', marginLeft: 'auto' }}>
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ========== PRODUCTS GRID ========== */}
      <section className="products-section" id="shopPaginatedSection">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">All Products</h2>
            <p className="section-subtitle">
              Browse our complete collection of premium organic products
            </p>
          </div>

          {paginatedList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              <p>No products match your selected filters.</p>
            </div>
          ) : (
            <div className="products-grid" id="shopPaginatedGrid">
              {paginatedList.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
                padding: '30px 0',
                flexWrap: 'wrap',
              }}
            >
              <button
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                style={{
                  padding: '8px 14px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  background: '#fff',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  color: currentPage <= 1 ? '#ccc' : '#333',
                }}
              >
                &laquo; Prev
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const p = idx + 1;
                const isActive = p === currentPage;
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    style={{
                      padding: '8px 14px',
                      border: isActive ? '1px solid #1a1a1a' : '1px solid #ddd',
                      borderRadius: '6px',
                      background: isActive ? '#1a1a1a' : '#fff',
                      color: isActive ? '#fff' : '#333',
                      fontWeight: isActive ? 600 : 400,
                      cursor: isActive ? 'default' : 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                style={{
                  padding: '8px 14px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  background: '#fff',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  color: currentPage >= totalPages ? '#ccc' : '#333',
                }}
              >
                Next &raquo;
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <Features />

      {/* ========== NEWSLETTER ========== */}
      <Newsletter />
    </div>
  );
}
