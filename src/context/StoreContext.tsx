'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductItem, UserProfile } from '@/lib/types';

interface StoreContextType {
  user: UserProfile | null;
  token: string | null;
  wishlist: string[];
  allProducts: ProductItem[];
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
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  setUserAuth: (token: string, profile: UserProfile) => void;
  logout: () => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [orderProduct, setOrderProduct] = useState<ProductItem | null>(null);
  const [activePolicy, setActivePolicy] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Initialize Auth & Wishlist from localStorage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('peaknuts_user_token');
      const savedProfile = localStorage.getItem('peaknuts_user_profile');
      if (savedToken) {
        setToken(savedToken);
        if (savedProfile) {
          setUser(JSON.parse(savedProfile));
        }
        // Fetch fresh profile and wishlist
        fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((prof) => {
            if (prof) {
              setUser(prof);
              localStorage.setItem('peaknuts_user_profile', JSON.stringify(prof));
            }
          })
          .catch(() => {});

        fetch('/api/user/wishlist', {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => (res.ok ? res.json() : []))
          .then((items) => {
            setWishlist(items.map((i: any) => i.productId?.toString() || i.productId));
          })
          .catch(() => {});
      }
    } catch {}

    refreshProducts();
  }, []);

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
    }
  };

  const setUserAuth = (newToken: string, profile: UserProfile) => {
    setToken(newToken);
    setUser(profile);
    localStorage.setItem('peaknuts_user_token', newToken);
    localStorage.setItem('peaknuts_user_profile', JSON.stringify(profile));
    // Fetch wishlist
    fetch('/api/user/wishlist', {
      headers: { Authorization: `Bearer ${newToken}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        setWishlist(items.map((i: any) => i.productId?.toString() || i.productId));
      })
      .catch(() => {});
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/user/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    setToken(null);
    setUser(null);
    setWishlist([]);
    localStorage.removeItem('peaknuts_user_token');
    localStorage.removeItem('peaknuts_user_profile');
  };

  const toggleWishlist = async (productId: string) => {
    if (!token) {
      window.location.href = '/account';
      return;
    }

    const inList = wishlist.includes(productId);
    if (inList) {
      // Remove
      setWishlist((prev) => prev.filter((id) => id !== productId));
      try {
        await fetch(`/api/user/wishlist/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        setWishlist((prev) => [...prev, productId]);
      }
    } else {
      // Add
      setWishlist((prev) => [...prev, productId]);
      try {
        await fetch('/api/user/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        });
      } catch {
        setWishlist((prev) => prev.filter((id) => id !== productId));
      }
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

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
        user,
        token,
        wishlist,
        allProducts,
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
        toggleWishlist,
        isInWishlist,
        setUserAuth,
        logout,
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
