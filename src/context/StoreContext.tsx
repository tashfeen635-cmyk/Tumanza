'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductItem } from '@/lib/types';

interface StoreContextType {
  allProducts: ProductItem[];
  quickSearchTags: string[];
  collectionCategories: string[];
  selectedProduct: ProductItem | null;
  orderProduct: ProductItem | null;
  activePolicy: string | null;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  openProductModal: (product: ProductItem) => void;
  closeProductModal: () => void;
  openOrderPopup: (product?: ProductItem) => void;
  closeOrderPopup: () => void;
  openPolicyModal: (policy: string) => void;
  closePolicyModal: () => void;
  refreshProducts: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children, initialProducts = [] }: { children: ReactNode; initialProducts?: ProductItem[] }) => {
  const [allProducts, setAllProducts] = useState<ProductItem[]>(initialProducts);
  const [quickSearchTags, setQuickSearchTags] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('tumanza_quick_tags');
      if (cached) return JSON.parse(cached);
    } catch {}
    return ['Almonds', 'Seeds', 'Herbs', 'Tea', 'Shilajit'];
  });
  const [collectionCategories, setCollectionCategories] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('tumanza_collection_cats');
      if (cached) return JSON.parse(cached);
    } catch {}
    return ['Nuts', 'Herbs & Supplements', 'Teas', 'Mixes & Butters', 'Spices'];
  });
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [orderProduct, setOrderProduct] = useState<ProductItem | null>(null);
  const [activePolicy, setActivePolicy] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Initialize Tags from localStorage / API
  useEffect(() => {
    refreshProducts();

    fetch('/api/tags')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          setQuickSearchTags(data);
          localStorage.setItem('tumanza_quick_tags', JSON.stringify(data));
        }
      })
      .catch(() => {});

    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          setCollectionCategories(data);
          localStorage.setItem('tumanza_collection_cats', JSON.stringify(data));
        }
      })
      .catch(() => {});
  }, []);

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
    }
  };

  const openProductModal = (product: ProductItem) => {
    setSelectedProduct(product);
    document.body.style.overflow = 'hidden';
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    document.body.style.overflow = '';
  };

  const openOrderPopup = (product?: ProductItem) => {
    if (product) {
      setOrderProduct(product);
    } else if (selectedProduct) {
      setOrderProduct(selectedProduct);
    }
    document.body.style.overflow = 'hidden';
  };

  const closeOrderPopup = () => {
    setOrderProduct(null);
    document.body.style.overflow = '';
  };

  const openPolicyModal = (policy: string) => {
    setActivePolicy(policy);
    document.body.style.overflow = 'hidden';
  };

  const closePolicyModal = () => {
    setActivePolicy(null);
    document.body.style.overflow = '';
  };

  return (
    <StoreContext.Provider
      value={{
        allProducts,
        quickSearchTags,
        collectionCategories,
        selectedProduct,
        orderProduct,
        activePolicy,
        searchOpen,
        setSearchOpen,
        openProductModal,
        closeProductModal,
        openOrderPopup,
        closeOrderPopup,
        openPolicyModal,
        closePolicyModal,
        refreshProducts,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
