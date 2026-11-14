'use client';

import React, { useState, useEffect } from 'react';
import '@/app/admin.css';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Mail,
  Users,
  Star,
  BarChart3,
  LogOut,
  Store,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
  Upload,
  Loader2,
  Tag,
  Award,
  KeyRound,
} from 'lucide-react';
import { ProductItem, OrderRecord, SubscriberRecord } from '@/lib/types';
import SignatureProductEditor from '@/components/admin/SignatureProductEditor';
import AdminNotifications from '@/components/admin/AdminNotifications';
import { unlockNotificationAudio } from '@/lib/notificationSound';

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Login form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [lockSeconds, setLockSeconds] = useState(0);
  const [loggingIn, setLoggingIn] = useState(false);

  // Active navigation section
  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'products' | 'signature' | 'orders' | 'subscribers' | 'users' | 'reviews' | 'analytics' | 'tags' | 'categories' | 'settings'
  >('dashboard');

  // Account settings
  const [settingsUsername, setSettingsUsername] = useState('');
  const [settingsCurrentPassword, setSettingsCurrentPassword] = useState('');
  const [settingsNewPassword, setSettingsNewPassword] = useState('');
  const [settingsConfirmPassword, setSettingsConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cached data
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<{ labels: string[]; values: number[] }>({
    labels: [],
    values: [],
  });
  const [quickSearchTags, setQuickSearchTags] = useState<string[]>(['Almonds', 'Seeds', 'Herbs', 'Tea', 'Shilajit']);
  const [newTagInput, setNewTagInput] = useState('');
  const [collectionCategories, setCollectionCategories] = useState<string[]>([
    'Nuts',
    'Herbs & Supplements',
    'Teas',
    'Mixes & Butters',
    'Spices',
  ]);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const [loadingData, setLoadingData] = useState(false);

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [prodFormData, setProdFormData] = useState({
    name: '',
    urduName: '',
    category: 'Nuts',
    price: 0,
    oldPrice: 0,
    stock: 'In Stock',
    image: '',
    gallery1: '',
    gallery2: '',
    section: 'popular',
    badge: '',
    rating: 5,
    description: '',
    sortOrder: 0,
    specifications: '',
    benefits: '',
    shippingInfo: '',
    returnPolicy: '',
  });

  const [viewingOrder, setViewingOrder] = useState<OrderRecord | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Initial token check
  useEffect(() => {
    const saved = localStorage.getItem('peaknuts_admin_token');
    if (saved) {
      setAdminToken(saved);
    }
  }, []);

  // Open the section requested by a push notification
  useEffect(() => {
    try {
      const section = new URLSearchParams(window.location.search).get('section');
      const allowed = [
        'dashboard',
        'products',
        'signature',
        'orders',
        'subscribers',
        'users',
        'reviews',
        'analytics',
        'tags',
        'categories',
        'settings',
      ];
      if (section && allowed.includes(section)) {
        setActiveSection(section as typeof activeSection);
      }
    } catch {}
  }, []);

  // Restore an active login lock countdown after a refresh
  useEffect(() => {
    try {
      const raw = localStorage.getItem('peaknuts_admin_lock_until');
      if (!raw) return;
      const remaining = Math.ceil((Number(raw) - Date.now()) / 1000);
      if (remaining > 0) {
        setLockSeconds(remaining);
      } else {
        localStorage.removeItem('peaknuts_admin_lock_until');
      }
    } catch {}
  }, []);

  // Countdown for the 1-minute lockout after three failed attempts
  useEffect(() => {
    if (lockSeconds <= 0) return;
    const timer = window.setTimeout(() => {
      setLockSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [lockSeconds]);

  useEffect(() => {
    if (lockSeconds > 0) return;
    try {
      const raw = localStorage.getItem('peaknuts_admin_lock_until');
      if (raw && Number(raw) <= Date.now()) {
        localStorage.removeItem('peaknuts_admin_lock_until');
      }
    } catch {}
  }, [lockSeconds]);

  // Fetch admin data when token is set
  useEffect(() => {
    if (adminToken) {
      fetchAllData();
    }
  }, [adminToken]);

  // Load current admin username for account settings
  useEffect(() => {
    if (!adminToken) return;
    fetch('/api/admin/account', {
      headers: { Authorization: `Bearer ${adminToken}` },
      cache: 'no-store',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.username === 'string') {
          setSettingsUsername(data.username);
        }
      })
      .catch(() => {});
  }, [adminToken]);

  const fetchAllData = async () => {
    if (!adminToken) return;
    setLoadingData(true);
    const headers = { Authorization: `Bearer ${adminToken}` };

    try {
      const [prodsRes, ordsRes, subsRes, revRes, usersRes, revsRes, anaRes, tagsRes, catsRes] = await Promise.all([
        fetch('/api/products', { cache: 'no-store' }),
        fetch('/api/orders', { headers, cache: 'no-store' }),
        fetch('/api/subscribers', { headers, cache: 'no-store' }),
        fetch('/api/revenue', { headers, cache: 'no-store' }),
        fetch('/api/admin/users', { headers, cache: 'no-store' }),
        fetch('/api/admin/reviews', { headers, cache: 'no-store' }),
        fetch('/api/admin/analytics', { headers, cache: 'no-store' }),
        fetch('/api/tags', { cache: 'no-store' }),
        fetch('/api/categories', { cache: 'no-store' }),
      ]);

      if (prodsRes.ok) setProducts(await prodsRes.json());
      if (ordsRes.ok) setOrders(await ordsRes.json());
      if (subsRes.ok) setSubscribers(await subsRes.json());
      if (revRes.ok) setRevenueData(await revRes.json());
      if (usersRes.ok) setUsersList(await usersRes.json());
      if (revsRes.ok) setReviewsList(await revsRes.json());
      if (anaRes.ok) setAnalyticsData(await anaRes.json());
      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        if (Array.isArray(tagsData)) setQuickSearchTags(tagsData);
      }
      if (catsRes.ok) {
        const catsData = await catsRes.json();
        if (Array.isArray(catsData)) setCollectionCategories(catsData);
      }
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    unlockNotificationAudio();
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'default') {
      window.Notification.requestPermission().catch(() => {});
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        setAdminToken(data.token);
        localStorage.setItem('peaknuts_admin_token', data.token);
        setLockSeconds(0);
        try {
          localStorage.removeItem('peaknuts_admin_lock_until');
        } catch {}
      } else if (res.status === 429 && typeof data.retryAfter === 'number' && data.retryAfter > 0) {
        try {
          localStorage.setItem(
            'peaknuts_admin_lock_until',
            String(Date.now() + data.retryAfter * 1000)
          );
        } catch {}
        setLockSeconds(data.retryAfter);
        setLoginError('');
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('Network error. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    if (adminToken) {
      fetch('/api/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      }).catch(() => {});
    }
    setAdminToken(null);
    localStorage.removeItem('peaknuts_admin_token');
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    setSettingsMessage(null);

    if (settingsNewPassword !== settingsConfirmPassword) {
      setSettingsMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setSettingsSaving(true);
    try {
      const res = await fetch('/api/admin/account', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          currentPassword: settingsCurrentPassword,
          newUsername: settingsUsername,
          newPassword: settingsNewPassword,
          confirmNewPassword: settingsConfirmPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSettingsMessage({
          type: 'success',
          text: data.message || 'Admin credentials updated successfully.',
        });
        setSettingsCurrentPassword('');
        setSettingsNewPassword('');
        setSettingsConfirmPassword('');
        if (data.username) setSettingsUsername(data.username);
      } else {
        setSettingsMessage({ type: 'error', text: data.error || 'Failed to update credentials.' });
      }
    } catch {
      setSettingsMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSettingsSaving(false);
    }
  };

  // PRODUCT CRUD
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProdFormData({
      name: '',
      urduName: '',
      category: 'Nuts',
      price: 15.0,
      oldPrice: 0,
      stock: 'In Stock',
      image: '',
      gallery1: '',
      gallery2: '',
      section: 'popular',
      badge: '',
      rating: 5,
      description: '',
      sortOrder: 0,
      specifications: '',
      benefits: '',
      shippingInfo: '',
      returnPolicy: '',
    });
    setUploadingImage(false);
    setProductModalOpen(true);
  };

  const openEditProductModal = (p: ProductItem) => {
    setEditingProduct(p);
    setProdFormData({
      name: p.name,
      urduName: p.urduName || '',
      category: p.category || 'Nuts',
      price: p.price || 0,
      oldPrice: p.oldPrice || 0,
      stock: p.stock || 'In Stock',
      image: p.image || '',
      gallery1: p.images?.[0] || '',
      gallery2: p.images?.[1] || '',
      section: p.section || '',
      badge: p.badge || '',
      rating: p.rating || 5,
      description: p.description || '',
      sortOrder: p.sortOrder || 0,
      specifications: p.specifications || '',
      benefits: p.benefits || '',
      shippingInfo: p.shippingInfo || '',
      returnPolicy: p.returnPolicy || '',
    });
    setUploadingImage(false);
    setProductModalOpen(true);
  };

  const handleFieldImageUpload = async (
    field: 'image' | 'gallery1' | 'gallery2',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP, etc.)');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('Image file size must be less than 4MB');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        if (res.status === 413) {
          throw new Error('Image file is too large (maximum size is 4MB). Please choose a smaller image.');
        }
        throw new Error(text || `Server error (${res.status})`);
      }

      if (res.ok && data.url) {
        setProdFormData((prev) => ({ ...prev, [field]: data.url }));
      } else {
        alert(data.error || data.message || 'Failed to upload image');
      }
    } catch (err: any) {
      alert(err?.message || 'Network error while uploading image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    const payload = {
      ...prodFormData,
      images: [prodFormData.gallery1, prodFormData.gallery2].filter(Boolean),
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setProductModalOpen(false);
        fetchAllData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to save product');
      }
    } catch {
      alert('Network error saving product.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!adminToken || !confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch {
      alert('Failed to delete product.');
    }
  };

  // ORDER STATUS CHANGE
  const handleOrderStatusChange = async (orderId: string, status: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status } : o))
        );
      }
    } catch {
      alert('Failed to update status.');
    }
  };

  // DELETE SUBSCRIBER
  const handleDeleteSubscriber = async (id: string) => {
    if (!adminToken || !confirm('Delete subscriber?')) return;
    try {
      const res = await fetch(`/api/subscribers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        setSubscribers((prev) => prev.filter((s) => s._id !== id));
      }
    } catch {
      alert('Failed to delete subscriber.');
    }
  };

  // DELETE REVIEW
  const handleDeleteReview = async (id: string) => {
    if (!adminToken || !confirm('Delete customer review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        setReviewsList((prev) => prev.filter((r) => r._id !== id));
      }
    } catch {
      alert('Failed to delete review.');
    }
  };

  // SEED DATABASE TRIGGER
  const handleTriggerSeed = async () => {
    if (!adminToken || !confirm('Seed default sample data into MongoDB?')) return;
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      alert(data.message || 'Seed executed');
      fetchAllData();
    } catch {
      alert('Failed to seed.');
    }
  };

  // Total store revenue calculated from orders
  const totalStoreRevenue = orders.reduce((sum, ord) => {
    const ordTotal = (ord.items || []).reduce((s, it) => s + it.qty * it.price, 0);
    return sum + ordTotal;
  }, 0);

  if (!adminToken) {
    /* ================= LOGIN SCREEN ================= */
    return (
      <div className="min-h-screen bg-brand-charcoal flex items-center justify-center p-4" suppressHydrationWarning>
        <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl border border-white/10 text-center" suppressHydrationWarning>
          <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Tumanza Admin</h1>
          <p className="text-xs text-gray-500 mt-1 mb-6">Enter your management credentials</p>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div suppressHydrationWarning>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full text-xs p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-charcoal"
              />
            </div>

            <div suppressHydrationWarning>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((v) => !v)}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-charcoal"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {lockSeconds > 0 ? (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg font-medium text-center">
                Too many failed attempts. Try again in {lockSeconds}s.
              </p>
            ) : (
              loginError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg font-medium text-center">
                  {loginError}
                </p>
              )
            )}

            <button
              type="submit"
              disabled={loggingIn || lockSeconds > 0}
              className="w-full py-3 bg-brand-charcoal hover:bg-black text-white text-xs font-bold tracking-widest uppercase rounded-lg shadow transition-colors disabled:opacity-50 mt-2"
            >
              {lockSeconds > 0
                ? `Try again in ${lockSeconds}s`
                : loggingIn
                  ? 'Authenticating...'
                  : 'Sign In'}
            </button>
          </form>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 text-xs text-gray-400 hover:text-brand-charcoal"
          >
            &larr; Back to Public Store
          </Link>
        </div>
      </div>
    );
  }

  /* ================= AUTHENTICATED ADMIN DASHBOARD ================= */
  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col md:flex-row" suppressHydrationWarning>
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-brand-charcoal text-gray-300 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-white tracking-wider">Tumanza</h2>
            <span className="text-[10px] tracking-widest font-semibold uppercase text-accent bg-accent/10 px-2 py-0.5 rounded">
              Admin Portal
            </span>
          </div>
          <button
            onClick={fetchAllData}
            title="Refresh Data"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
            { id: 'products', name: 'Products', icon: Package, count: products.length },
            { id: 'signature', name: 'Signature Product', icon: Award },
            { id: 'orders', name: 'Orders', icon: ShoppingCart, count: orders.length },
            { id: 'subscribers', name: 'Subscribers', icon: Mail, count: subscribers.length },
            { id: 'users', name: 'Users', icon: Users, count: usersList.length },
            { id: 'reviews', name: 'Reviews', icon: Star, count: reviewsList.length },
            { id: 'analytics', name: 'Analytics', icon: BarChart3 },
            { id: 'tags', name: 'Quick Search Tags', icon: Tag, count: quickSearchTags.length },
            { id: 'categories', name: 'Collection Categories', icon: Package, count: collectionCategories.length },
            { id: 'settings', name: 'Account Settings', icon: KeyRound },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-white font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={handleTriggerSeed}
            className="w-full text-left text-xs text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5"
          >
            Seed Sample Data
          </button>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center space-x-2 text-xs text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <Store className="w-4 h-4" />
            <span>Storefront</span>
          </Link>
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center space-x-2 text-xs text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {/* Top Bar */}
        <div className="mb-6 flex items-center justify-end border-b border-gray-200 pb-3">
          <AdminNotifications
            adminToken={adminToken}
            onNavigate={(section) => setActiveSection(section)}
            variant="light"
          />
        </div>
        {/* ================= SECTION: DASHBOARD ================= */}
        {activeSection === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Dashboard Overview</h1>
              <p className="text-xs text-gray-500 mt-1">Real-time performance of your organic store</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-brand-darkgreen flex items-center justify-center font-bold text-lg">
                  Rs.
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Total Revenue
                  </span>
                  <h3 className="text-xl font-bold text-brand-charcoal mt-0.5">
                    Rs.{totalStoreRevenue.toFixed(2)}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Total Orders
                  </span>
                  <h3 className="text-xl font-bold text-brand-charcoal mt-0.5">{orders.length}</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Products
                  </span>
                  <h3 className="text-xl font-bold text-brand-charcoal mt-0.5">{products.length}</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Subscribers
                  </span>
                  <h3 className="text-xl font-bold text-brand-charcoal mt-0.5">
                    {subscribers.length}
                  </h3>
                </div>
              </div>
            </div>

            {/* Monthly Revenue Bar Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider mb-6">
                Monthly Revenue Trend (Rs.)
              </h3>
              <div className="h-56 flex items-end gap-2 sm:gap-4 pt-4 border-b border-gray-200">
                {(revenueData.labels || []).map((lbl, idx) => {
                  const val = revenueData.values[idx] || 0;
                  const maxVal = Math.max(...(revenueData.values || [1]), 4000);
                  const heightPercent = Math.max(8, (val / maxVal) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                        {val > 0 ? `Rs.${val}` : '0'}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all ${
                          val > 0 ? 'bg-primary hover:bg-accent' : 'bg-gray-100'
                        }`}
                      />
                      <span className="text-[11px] font-semibold text-gray-500 mt-2">{lbl}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveSection('orders')}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  View All Orders &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Items</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.slice(0, 5).map((ord) => {
                      const total = (ord.items || []).reduce((s, it) => s + it.qty * it.price, 0);
                      return (
                        <tr key={ord._id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-bold text-brand-charcoal">{ord.orderId}</td>
                          <td className="p-3">{ord.customer}</td>
                          <td className="p-3 text-gray-400">{ord.date}</td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                ord.status === 'Delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : ord.status === 'Shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-3 text-gray-500">{ord.items?.length || 0}</td>
                          <td className="p-3 text-right font-bold text-brand-charcoal">
                            Rs.{total.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION: PRODUCTS ================= */}
        {activeSection === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-brand-charcoal">
                  Product Catalog
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage inventory, pricing, images, and descriptions
                </p>
              </div>
              <button
                onClick={openAddProductModal}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-charcoal hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Badge</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3">Order</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 flex items-center space-x-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {p.image && (
                              <Image
                                src={
                                  p.image.includes('unsplash')
                                    ? p.name?.toLowerCase().includes('shilajit')
                                      ? '/images/shilajit.png'
                                      : '/images/product-pack.jpg'
                                    : p.image
                                }
                                alt={p.name}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-brand-charcoal block">{p.name}</span>
                            {p.urduName && (
                              <span className="text-[11px] text-gray-400">{p.urduName}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-gray-600">{p.category}</td>
                        <td className="p-3 font-semibold text-brand-charcoal">
                          Rs.{p.price.toFixed(2)}
                          {p.oldPrice > 0 && (
                            <span className="text-[10px] text-gray-400 line-through ml-1.5">
                              Rs.{p.oldPrice.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              p.stock === 'In Stock'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.stock}
                          </span>
                        </td>
                        <td className="p-3">
                          {p.badge && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold">
                              {p.badge}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-amber-500 font-semibold">{p.rating} ★</td>
                        <td className="p-3 text-gray-600 font-medium">{p.sortOrder ?? 0}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-brand-charcoal hover:border-gray-400 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION: ORDERS ================= */}
        {activeSection === 'orders' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Order Fulfillment</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Process customer deliveries and update shipment status
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">City</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 text-center">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((ord) => {
                      const total = (ord.items || []).reduce((s, it) => s + it.qty * it.price, 0);
                      return (
                        <tr key={ord._id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-bold text-brand-charcoal">{ord.orderId}</td>
                          <td className="p-3">
                            <span className="font-semibold block">{ord.customer}</span>
                            <span className="text-[11px] text-gray-400">{ord.email}</span>
                          </td>
                          <td className="p-3 text-gray-600">{ord.phone}</td>
                          <td className="p-3 text-gray-600">{ord.city}</td>
                          <td className="p-3">
                            <select
                              value={ord.status}
                              onChange={(e) => handleOrderStatusChange(ord._id, e.target.value)}
                              className={`p-1.5 rounded-lg border font-semibold text-[11px] focus:outline-none ${
                                ord.status === 'Delivered'
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : ord.status === 'Shipped'
                                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                                  : 'bg-amber-50 border-amber-200 text-amber-800'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                          <td className="p-3 text-gray-400">{ord.date}</td>
                          <td className="p-3 text-right font-bold text-brand-charcoal">
                            Rs.{total.toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => setViewingOrder(ord)}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600"
                              title="View Order Slip"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION: SUBSCRIBERS ================= */}
        {activeSection === 'subscribers' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Newsletter Subscribers</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                List of email addresses subscribed for recipes &amp; offers
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Subscribed Date</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscribers.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-semibold text-brand-charcoal">{s.email}</td>
                      <td className="p-3 text-gray-400">{s.date}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteSubscriber(s._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= SECTION: USERS ================= */}
        {activeSection === 'users' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Registered Customers</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Verified member accounts and lifetime order counts
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">City</th>
                      <th className="p-3">Verified</th>
                      <th className="p-3">Orders Placed</th>
                      <th className="p-3">Member Since</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <span className="font-bold text-brand-charcoal block">{u.name}</span>
                          <span className="text-gray-400 text-[11px]">{u.email}</span>
                        </td>
                        <td className="p-3 text-gray-600">{u.phone || '—'}</td>
                        <td className="p-3 text-gray-600">{u.city || '—'}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.verified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {u.verified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-brand-charcoal">{u.orderCount}</td>
                        <td className="p-3 text-gray-400">{u.createdAt?.slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION: REVIEWS ================= */}
        {activeSection === 'reviews' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Product Reviews Moderation</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Review ratings and feedback submitted by verified buyers
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3">Comment</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reviewsList.map((r) => (
                      <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-bold text-brand-charcoal">{r.productName}</td>
                        <td className="p-3">{r.userName}</td>
                        <td className="p-3 text-amber-500 font-bold">{r.rating} ★</td>
                        <td className="p-3 text-gray-600 max-w-xs truncate">{r.comment || '—'}</td>
                        <td className="p-3 text-gray-400">{r.createdAt?.slice(0, 10)}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteReview(r._id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            title="Remove Review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION: ANALYTICS ================= */}
        {activeSection === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Sales Analytics</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Revenue trends, order fulfillment breakdown, and best sellers
              </p>
            </div>

            {analyticsData ? (
              <div className="space-y-6">
                {/* Top metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Gross Revenue</span>
                    <h3 className="text-2xl font-bold text-brand-charcoal mt-1">
                      Rs.{analyticsData.totalRevenue.toFixed(2)}
                    </h3>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Total Volume</span>
                    <h3 className="text-2xl font-bold text-brand-charcoal mt-1">
                      {analyticsData.totalOrders} Orders
                    </h3>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Fulfillment</span>
                    <div className="flex items-center space-x-3 mt-2 text-xs">
                      <span className="text-green-700 font-bold">
                        {analyticsData.statusCounts?.Delivered || 0} Delivered
                      </span>
                      <span>•</span>
                      <span className="text-blue-700 font-bold">
                        {analyticsData.statusCounts?.Shipped || 0} Shipped
                      </span>
                      <span>•</span>
                      <span className="text-amber-700 font-bold">
                        {analyticsData.statusCounts?.Pending || 0} Pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top 10 Best Sellers */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider mb-4">
                    Top 10 Products By Revenue
                  </h3>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                      <tr>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Units Sold</th>
                        <th className="p-3 text-right">Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(analyticsData.topProducts || []).map((tp: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-3 font-semibold text-brand-charcoal">{tp.name}</td>
                          <td className="p-3 text-gray-600">{tp.qty} units</td>
                          <td className="p-3 text-right font-bold text-brand-charcoal">
                            Rs.{tp.revenue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Loading analytics insights...</p>
            )}
          </div>
        )}

        {/* ================= SECTION: QUICK SEARCH TAGS ================= */}
        {activeSection === 'tags' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Quick Search Tags</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Add, remove, or edit the quick search filter tabs displayed in the top search overlay
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-xl space-y-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New tag name (e.g. Honey)"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  className="flex-1 text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = newTagInput.trim();
                    if (!trimmed) return;
                    if (quickSearchTags.map(t => t.toLowerCase()).includes(trimmed.toLowerCase())) {
                      alert('Tag already exists!');
                      return;
                    }
                    setQuickSearchTags([...quickSearchTags, trimmed]);
                    setNewTagInput('');
                  }}
                  className="px-5 py-3 bg-brand-charcoal hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-colors"
                >
                  Add Tag
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Current Tags:</label>
                <div className="flex flex-wrap gap-2">
                  {quickSearchTags.map((tag, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold text-brand-charcoal"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setQuickSearchTags(quickSearchTags.filter((_, i) => i !== idx));
                        }}
                        className="text-red-500 hover:text-red-700 p-0.5"
                        title="Remove tag"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {quickSearchTags.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No tags added yet.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={async () => {
                    if (!adminToken) return;
                    try {
                      const res = await fetch('/api/tags', {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${adminToken}`,
                        },
                        body: JSON.stringify({ tags: quickSearchTags }),
                      });
                      if (res.ok) {
                        alert('Quick search tags updated successfully!');
                      } else {
                        const d = await res.json();
                        alert(d.error || 'Failed to update tags');
                      }
                    } catch {
                      alert('Network error saving tags.');
                    }
                  }}
                  className="w-full py-3 bg-accent hover:bg-brand-darkgreen text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-colors"
                >
                  Save Changes to Store
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION: COLLECTION CATEGORIES ================= */}
        {activeSection === 'categories' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Collection Categories</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Add, remove, or edit the filter tabs &amp; categories for &quot;Tumanza&apos;s Collection&quot; &amp; products page
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-xl space-y-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name (e.g. Honey & Oils)"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  className="flex-1 text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = newCategoryInput.trim();
                    if (!trimmed) return;
                    if (collectionCategories.map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) {
                      alert('Category already exists!');
                      return;
                    }
                    setCollectionCategories([...collectionCategories, trimmed]);
                    setNewCategoryInput('');
                  }}
                  className="px-5 py-3 bg-brand-charcoal hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-colors"
                >
                  Add Category
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Current Categories:</label>
                <div className="flex flex-wrap gap-2">
                  {collectionCategories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold text-brand-charcoal"
                    >
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCollectionCategories(collectionCategories.filter((_, i) => i !== idx));
                        }}
                        className="text-red-500 hover:text-red-700 p-0.5"
                        title="Remove category"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {collectionCategories.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No categories added yet.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={async () => {
                    if (!adminToken) return;
                    try {
                      const res = await fetch('/api/categories', {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${adminToken}`,
                        },
                        body: JSON.stringify({ categories: collectionCategories }),
                      });
                      if (res.ok) {
                        alert('Collection categories updated successfully!');
                      } else {
                        const d = await res.json();
                        alert(d.error || 'Failed to update categories');
                      }
                    } catch {
                      alert('Network error saving categories.');
                    }
                  }}
                  className="w-full py-3 bg-accent hover:bg-brand-darkgreen text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-colors"
                >
                  Save Categories to Store
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION: SIGNATURE PRODUCT ================= */}
        {activeSection === 'signature' && adminToken && (
          <SignatureProductEditor adminToken={adminToken} />
        )}

        {/* ================= SECTION: ACCOUNT SETTINGS ================= */}
        {activeSection === 'settings' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Account Settings</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Update the administrator login username and password
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-xl">
              <form onSubmit={handleUpdateAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">New Username *</label>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={settingsUsername}
                    onChange={(e) => setSettingsUsername(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Current Password *</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={settingsCurrentPassword}
                      onChange={(e) => setSettingsCurrentPassword(e.target.value)}
                      className="w-full text-xs p-3 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                      aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-charcoal"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">New Password *</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={settingsNewPassword}
                      onChange={(e) => setSettingsNewPassword(e.target.value)}
                      className="w-full text-xs p-3 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-charcoal"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={settingsConfirmPassword}
                      onChange={(e) => setSettingsConfirmPassword(e.target.value)}
                      className="w-full text-xs p-3 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-charcoal"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {settingsMessage && (
                  <p
                    className={`text-xs p-2.5 rounded-lg font-medium ${
                      settingsMessage.type === 'success'
                        ? 'text-green-700 bg-green-50'
                        : 'text-red-600 bg-red-50'
                    }`}
                  >
                    {settingsMessage.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="w-full py-3 bg-accent hover:bg-brand-darkgreen text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-colors disabled:opacity-50"
                >
                  {settingsSaving ? 'Saving...' : 'Save Credentials'}
                </button>

                <p className="text-[11px] text-gray-400">
                  Your current session stays signed in after updating the credentials.
                </p>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setProductModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 z-10 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setProductModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-brand-charcoal mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={prodFormData.name}
                    onChange={(e) => setProdFormData({ ...prodFormData, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Urdu Name</label>
                  <input
                    type="text"
                    value={prodFormData.urduName}
                    onChange={(e) => setProdFormData({ ...prodFormData, urduName: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    value={prodFormData.category}
                    onChange={(e) => setProdFormData({ ...prodFormData, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                  >
                    {collectionCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Section</label>
                  <select
                    value={prodFormData.section}
                    onChange={(e) => setProdFormData({ ...prodFormData, section: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                  >
                    <option value="popular">Popular</option>
                    <option value="trending">Trending</option>
                    <option value="bestselling">Bestselling</option>
                    <option value="">None</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Price (Rs.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodFormData.price}
                    onChange={(e) =>
                      setProdFormData({ ...prodFormData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Old Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodFormData.oldPrice}
                    onChange={(e) =>
                      setProdFormData({ ...prodFormData, oldPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Stock Status</label>
                  <select
                    value={prodFormData.stock}
                    onChange={(e) => setProdFormData({ ...prodFormData, stock: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Badge (e.g. SALE, HOT)</label>
                  <input
                    type="text"
                    value={prodFormData.badge}
                    onChange={(e) => setProdFormData({ ...prodFormData, badge: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={prodFormData.rating}
                    onChange={(e) =>
                      setProdFormData({ ...prodFormData, rating: parseInt(e.target.value) || 5 })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={prodFormData.sortOrder}
                    onChange={(e) =>
                      setProdFormData({ ...prodFormData, sortOrder: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Product Images (3 Separate Images)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Slot 1: Main Image */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center bg-gray-50">
                    <span className="block text-[11px] font-bold text-gray-700 mb-2">1. Main Cover Image</span>
                    {prodFormData.image ? (
                      <div className="flex flex-col items-center">
                        <img src={prodFormData.image} alt="Main" className="w-20 h-20 object-cover rounded-md mb-2 border" />
                        <label className="cursor-pointer text-[10px] bg-brand-charcoal text-white px-2 py-1 rounded font-semibold">
                          Change
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFieldImageUpload('image', e)} />
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer block py-2">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <span className="text-[10px] font-bold text-gray-700 block">Upload Main</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFieldImageUpload('image', e)} />
                      </label>
                    )}
                  </div>

                  {/* Slot 2: Gallery 1 */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center bg-gray-50">
                    <span className="block text-[11px] font-bold text-gray-700 mb-2">2. Gallery Image 2</span>
                    {prodFormData.gallery1 ? (
                      <div className="flex flex-col items-center">
                        <img src={prodFormData.gallery1} alt="Gallery 1" className="w-20 h-20 object-cover rounded-md mb-2 border" />
                        <label className="cursor-pointer text-[10px] bg-brand-charcoal text-white px-2 py-1 rounded font-semibold">
                          Change
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFieldImageUpload('gallery1', e)} />
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer block py-2">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <span className="text-[10px] font-bold text-gray-700 block">Upload Photo 2</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFieldImageUpload('gallery1', e)} />
                      </label>
                    )}
                  </div>

                  {/* Slot 3: Gallery 2 */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center bg-gray-50">
                    <span className="block text-[11px] font-bold text-gray-700 mb-2">3. Gallery Image 3</span>
                    {prodFormData.gallery2 ? (
                      <div className="flex flex-col items-center">
                        <img src={prodFormData.gallery2} alt="Gallery 2" className="w-20 h-20 object-cover rounded-md mb-2 border" />
                        <label className="cursor-pointer text-[10px] bg-brand-charcoal text-white px-2 py-1 rounded font-semibold">
                          Change
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFieldImageUpload('gallery2', e)} />
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer block py-2">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <span className="text-[10px] font-bold text-gray-700 block">Upload Photo 3</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFieldImageUpload('gallery2', e)} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={prodFormData.description}
                  onChange={(e) =>
                    setProdFormData({ ...prodFormData, description: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                />
              </div>



              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Specifications</label>
                  <textarea
                    rows={2}
                    value={prodFormData.specifications}
                    onChange={(e) => setProdFormData({ ...prodFormData, specifications: e.target.value })}
                    placeholder="Size, origin, weight, packaging..."
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Key Benefits</label>
                  <textarea
                    rows={2}
                    value={prodFormData.benefits}
                    onChange={(e) => setProdFormData({ ...prodFormData, benefits: e.target.value })}
                    placeholder="Health perks, purity..."
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Shipping Info</label>
                  <input
                    type="text"
                    value={prodFormData.shippingInfo}
                    onChange={(e) => setProdFormData({ ...prodFormData, shippingInfo: e.target.value })}
                    placeholder="Fast Nationwide Delivery..."
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Return Policy</label>
                  <input
                    type="text"
                    value={prodFormData.returnPolicy}
                    onChange={(e) => setProdFormData({ ...prodFormData, returnPolicy: e.target.value })}
                    placeholder="48-hour replacement..."
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-charcoal hover:bg-black text-white font-bold uppercase tracking-wider rounded-lg shadow mt-2 transition-colors"
              >
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ORDER DETAILS ================= */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setViewingOrder(null)}
          />
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 z-10 border border-gray-100 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setViewingOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-brand-charcoal mb-1">
              Order #{viewingOrder.orderId}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{viewingOrder.date}</p>

            <div className="bg-brand-offwhite p-4 rounded-xl text-xs space-y-1.5 text-gray-600 mb-6">
              <p>
                <strong>Customer:</strong> {viewingOrder.customer}
              </p>
              <p>
                <strong>Email:</strong> {viewingOrder.email}
              </p>
              <p>
                <strong>Phone:</strong> {viewingOrder.phone}
              </p>
              <p>
                <strong>Destination:</strong> {viewingOrder.address}, {viewingOrder.city}
              </p>
              <p>
                <strong>Current Status:</strong>{' '}
                <span className="font-bold text-brand-charcoal">{viewingOrder.status}</span>
              </p>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Purchased Items
            </h4>
            <div className="divide-y divide-gray-100 text-xs mb-6">
              {(viewingOrder.items || []).map((it, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-brand-charcoal">{it.name}</span>
                    <span className="text-gray-400 ml-2">Qty: {it.qty}</span>
                  </div>
                  <span className="font-bold">Rs.{(it.qty * it.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm font-bold border-t border-gray-100 pt-3 text-brand-charcoal">
              <span>Total Amount:</span>
              <span>
                Rs.
                {(viewingOrder.items || [])
                  .reduce((sum, it) => sum + it.qty * it.price, 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
