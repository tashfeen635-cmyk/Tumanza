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
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
} from 'lucide-react';
import { ProductItem, OrderRecord, SubscriberRecord } from '@/lib/types';

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Login form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Active navigation section
  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'products' | 'orders' | 'subscribers' | 'users' | 'reviews' | 'analytics'
  >('dashboard');

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
    section: 'popular',
    badge: '',
    rating: 5,
    description: '',
  });

  const [viewingOrder, setViewingOrder] = useState<OrderRecord | null>(null);

  // Initial token check
  useEffect(() => {
    const saved = localStorage.getItem('peaknuts_admin_token');
    if (saved) {
      setAdminToken(saved);
    }
  }, []);

  // Fetch admin data when token is set
  useEffect(() => {
    if (adminToken) {
      fetchAllData();
    }
  }, [adminToken]);

  const fetchAllData = async () => {
    if (!adminToken) return;
    setLoadingData(true);
    const headers = { Authorization: `Bearer ${adminToken}` };

    try {
      const [prodsRes, ordsRes, subsRes, revRes, usersRes, revsRes, anaRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders', { headers }),
        fetch('/api/subscribers', { headers }),
        fetch('/api/revenue', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/reviews', { headers }),
        fetch('/api/admin/analytics', { headers }),
      ]);

      if (prodsRes.ok) setProducts(await prodsRes.json());
      if (ordsRes.ok) setOrders(await ordsRes.json());
      if (subsRes.ok) setSubscribers(await subsRes.json());
      if (revRes.ok) setRevenueData(await revRes.json());
      if (usersRes.ok) setUsersList(await usersRes.json());
      if (revsRes.ok) setReviewsList(await revsRes.json());
      if (anaRes.ok) setAnalyticsData(await anaRes.json());
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
      section: 'popular',
      badge: '',
      rating: 5,
      description: '',
    });
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
      section: p.section || '',
      badge: p.badge || '',
      rating: p.rating || 5,
      description: p.description || '',
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(prodFormData),
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
      <div className="min-h-screen bg-brand-charcoal flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl border border-white/10 text-center">
          <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Tumanza Admin</h1>
          <p className="text-xs text-gray-500 mt-1 mb-6">Enter your management credentials</p>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
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

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-charcoal"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg font-medium text-center">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 bg-brand-charcoal hover:bg-black text-white text-xs font-bold tracking-widest uppercase rounded-lg shadow transition-colors disabled:opacity-50 mt-2"
            >
              {loggingIn ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <Link
            href="/"
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
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col md:flex-row">
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
            { id: 'orders', name: 'Orders', icon: ShoppingCart, count: orders.length },
            { id: 'subscribers', name: 'Subscribers', icon: Mail, count: subscribers.length },
            { id: 'users', name: 'Users', icon: Users, count: usersList.length },
            { id: 'reviews', name: 'Reviews', icon: Star, count: reviewsList.length },
            { id: 'analytics', name: 'Analytics', icon: BarChart3 },
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
                    <option value="Nuts">Nuts</option>
                    <option value="Herbs & Supplements">Herbs & Supplements</option>
                    <option value="Teas">Teas</option>
                    <option value="Mixes & Butters">Mixes & Butters</option>
                    <option value="Spices">Spices</option>
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

              <div className="grid grid-cols-2 gap-3">
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
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Image URL / Path</label>
                <input
                  type="text"
                  value={prodFormData.image}
                  onChange={(e) => setProdFormData({ ...prodFormData, image: e.target.value })}
                  placeholder="/images/shilajit.png or image URL"
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-charcoal"
                />
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
