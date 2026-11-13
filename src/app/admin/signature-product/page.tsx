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
  Award,
  Plus,
  Trash2,
  Upload,
  Loader2,
  Check,
  Edit3,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface Highlight {
  title: string;
  subtitle: string;
}

interface SignatureConfig {
  _id: string;
  enabled: boolean;
  published: boolean;
  sectionHeading: string;
  mainHeading: string;
  tagline: string;
  description: string;
  badge: string;
  price: number;
  oldPrice: number;
  stock: string;
  category: string;
  urduName: string;
  images: string[];
  highlights: Highlight[];
  showRatings: boolean;
  orderButtonText: string;
  shippingText: string;
  paymentText: string;
  returnText: string;
}

export default function AdminSignatureProductPage() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [config, setConfig] = useState<SignatureConfig | null>(null);

  // Modals
  const [activeModal, setActiveModal] = useState<'none' | 'edit'>('none');
  const [modalLoading, setModalLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: 'Tumanza Pure Shilajit Gold Resin',
    urduName: 'خالص سلاجیت گولڈ',
    category: 'Signature Product',
    price: 59.00,
    oldPrice: 89.00,
    stock: 'In Stock',
    image: '/images/shilajit.png',
    images: ['/images/shilajit.png'],
    badge: 'SIGNATURE GOLD',
    sectionHeading: 'OUR SIGNATURE PRODUCT',
    mainHeading: 'Tumanza Shilajit Gold',
    tagline: 'Pure Power from Gilgit-Baltistan',
    description: 'Pure Himalayan resin harvested from the majestic peaks of Gilgit-Baltistan. Rich in 84+ fulvic trace minerals and bioactive compounds for unmatched cellular energy, stamina, and holistic vitality.',
    highlights: [
      { title: '84+ Minerals', subtitle: 'Fulvic & Humic Acid' },
      { title: 'Stamina & Energy', subtitle: 'Natural Cellular Vitality' },
      { title: 'Gilgit Harvest', subtitle: 'Authentic High-Altitude' },
      { title: 'Lab Tested Purity', subtitle: '100% Certified Safe' },
    ],
    showRatings: true,
    orderButtonText: 'Order Now',
    shippingText: 'Free Nationwide Shipping',
    paymentText: 'Secure Payment COD Available',
    returnText: '100% Authentic Guaranteed',
    enabled: true,
    published: true,
  });

  const [newImageInput, setNewImageInput] = useState('');
  const [newHighlightTitle, setNewHighlightTitle] = useState('');
  const [newHighlightSub, setNewHighlightSub] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('peaknuts_admin_token');
    if (saved) {
      setAdminToken(saved);
    }
  }, []);

  useEffect(() => {
    if (adminToken) {
      fetchData();
    }
  }, [adminToken]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/signature-product', { cache: 'no-store' });
      if (res.ok) {
        const sigData = await res.json();
        setConfig(sigData);
        setFormData({
          name: sigData.mainHeading || 'Tumanza Pure Shilajit Gold Resin',
          urduName: sigData.urduName || 'خالص سلاجیت گولڈ',
          category: sigData.category || 'Signature Product',
          price: sigData.price ?? 59.0,
          oldPrice: sigData.oldPrice ?? 89.0,
          stock: sigData.stock || 'In Stock',
          image: sigData.images?.[0] || '/images/shilajit.png',
          images: Array.isArray(sigData.images) && sigData.images.length > 0 ? sigData.images : ['/images/shilajit.png'],
          badge: sigData.badge || 'SIGNATURE GOLD',
          sectionHeading: sigData.sectionHeading || 'OUR SIGNATURE PRODUCT',
          mainHeading: sigData.mainHeading || 'Tumanza Shilajit Gold',
          tagline: sigData.tagline || 'Pure Power from Gilgit-Baltistan',
          description: sigData.description || '',
          highlights: Array.isArray(sigData.highlights) && sigData.highlights.length > 0 ? sigData.highlights : [
            { title: '84+ Minerals', subtitle: 'Fulvic & Humic Acid' },
            { title: 'Stamina & Energy', subtitle: 'Natural Cellular Vitality' },
            { title: 'Gilgit Harvest', subtitle: 'Authentic High-Altitude' },
            { title: 'Lab Tested Purity', subtitle: '100% Certified Safe' },
          ],
          showRatings: sigData.showRatings ?? true,
          orderButtonText: sigData.orderButtonText || 'Order Now',
          shippingText: sigData.shippingText || 'Free Nationwide Shipping',
          paymentText: sigData.paymentText || 'Secure Payment COD Available',
          returnText: sigData.returnText || '100% Authentic Guaranteed',
          enabled: sigData.enabled ?? true,
          published: sigData.published ?? true,
        });
      }
    } catch (e) {
      console.error('Failed to load signature data:', e);
      setErrorMsg('Failed to load data from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adminToken) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    const uploadForm = new FormData();
    uploadForm.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: uploadForm,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({
          ...prev,
          image: data.url,
          images: [...prev.images, data.url],
        }));
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Network error during upload');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    setModalLoading(true);

    try {
      const res = await fetch('/api/signature-product', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setActiveModal('none');
        await fetchData();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update signature product');
      }
    } catch {
      alert('Network error updating signature product');
    } finally {
      setModalLoading(false);
    }
  };

  const handleQuickTogglePublished = async () => {
    if (!adminToken || !config) return;
    const newPublished = !config.published;
    try {
      const res = await fetch('/api/signature-product', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ published: newPublished }),
      });
      if (res.ok) {
        setConfig((prev) => (prev ? { ...prev, published: newPublished } : null));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      alert('Failed to update status');
    }
  };

  if (!adminToken) {
    return (
      <div className="min-h-screen bg-brand-charcoal flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl text-center">
          <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Admin Authentication Required</h1>
          <p className="text-xs text-gray-500 mt-2 mb-6">Please sign in from the main admin dashboard.</p>
          <Link href="/admin" className="px-6 py-3 bg-brand-charcoal text-white text-xs font-bold rounded-xl uppercase tracking-wider">
            Go to Admin Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-brand-charcoal text-gray-300 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/15 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-white tracking-wider">Tumanza</h2>
            <span className="text-[10px] tracking-widest font-semibold uppercase text-accent bg-accent/15 px-2 py-0.5 rounded">
              Admin Portal
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
            { id: 'products', name: 'Products', icon: Package, href: '/admin' },
            { id: 'signature', name: 'Signature Product', icon: Award, href: '/admin/signature-product', active: true },
            { id: 'orders', name: 'Orders', icon: ShoppingCart, href: '/admin' },
            { id: 'subscribers', name: 'Subscribers', icon: Mail, href: '/admin' },
            { id: 'users', name: 'Users', icon: Users, href: '/admin' },
            { id: 'reviews', name: 'Reviews', icon: Star, href: '/admin' },
            { id: 'analytics', name: 'Analytics', icon: BarChart3, href: '/admin' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = item.active;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-white font-semibold shadow'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
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
            onClick={() => {
              localStorage.removeItem('peaknuts_admin_token');
              window.location.href = '/admin';
            }}
            className="w-full flex items-center space-x-2 text-xs text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] tracking-widest font-bold uppercase text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded">
                  100% Independent Flagship Module
                </span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Signature Product Management</h1>
              <p className="text-xs text-gray-500 mt-1">
                Manage your flagship homepage signature product completely isolated from the standard Tumanza collection.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-white border border-gray-300 text-brand-charcoal text-xs font-bold rounded-xl shadow-xs hover:bg-gray-50 flex items-center gap-2"
              >
                <Store className="w-3.5 h-3.5" /> Preview Homepage
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-charcoal" />
              <p className="text-xs text-gray-400 mt-2">Loading Signature Product module...</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Currently Published Signature Product Card */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Award className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase ${
                          config?.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {config?.published ? 'Published Live on Homepage' : 'Draft / Unpublished'}
                        </span>
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded">
                          {config?.enabled ? 'Section Enabled' : 'Section Disabled'}
                        </span>
                      </div>
                      <h2 className="text-xl font-serif font-bold text-brand-charcoal">
                        {config?.mainHeading || 'Signature Product'}
                      </h2>
                      <p className="text-xs text-gray-500">{config?.tagline || 'Homepage Flagship Showcase'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleQuickTogglePublished}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        config?.published
                          ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          : 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
                      }`}
                    >
                      {config?.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{config?.published ? 'Unpublish' : 'Publish Live'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (config) {
                          setFormData({
                            name: config.mainHeading || '',
                            urduName: config.urduName || '',
                            category: config.category || 'Signature Product',
                            price: config.price ?? 0,
                            oldPrice: config.oldPrice ?? 0,
                            stock: config.stock || 'In Stock',
                            image: config.images?.[0] || '/images/shilajit.png',
                            images: config.images?.length ? config.images : ['/images/shilajit.png'],
                            badge: config.badge || 'SIGNATURE',
                            sectionHeading: config.sectionHeading || 'OUR SIGNATURE PRODUCT',
                            mainHeading: config.mainHeading || '',
                            tagline: config.tagline || 'Pure Power from Gilgit-Baltistan',
                            description: config.description || '',
                            highlights: config.highlights || [],
                            showRatings: config.showRatings ?? true,
                            orderButtonText: config.orderButtonText || 'Order Now',
                            shippingText: config.shippingText || 'Free Nationwide Shipping',
                            paymentText: config.paymentText || 'Secure Payment COD Available',
                            returnText: config.returnText || '100% Authentic Guaranteed',
                            enabled: config.enabled ?? true,
                            published: config.published ?? true,
                          });
                        }
                        setActiveModal('edit');
                      }}
                      className="px-5 py-2.5 bg-brand-charcoal hover:bg-black text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Signature Product
                    </button>
                  </div>
                </div>

                {/* Details Preview */}
                {config && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 items-center">
                    <div className="md:col-span-4 relative aspect-square rounded-2xl bg-[#FFF8ED] border border-[#eadaad]/60 overflow-hidden flex items-center justify-center p-4">
                      {config.images?.[0] ? (
                        <Image src={config.images[0]} alt={config.mainHeading} fill unoptimized className="object-contain p-2" />
                      ) : (
                        <Sparkles className="w-12 h-12 text-amber-600" />
                      )}
                    </div>

                    <div className="md:col-span-8 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-bold text-brand-charcoal bg-gray-100 px-3 py-1 rounded-lg">
                          {config.category || 'Signature Product'}
                        </span>
                        <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                          {config.stock || 'In Stock'}
                        </span>
                        <span className="text-xl font-bold text-brand-charcoal ml-auto">
                          Rs.{config.price?.toFixed(2)}
                        </span>
                        {config.oldPrice && config.oldPrice > config.price && (
                          <span className="text-sm text-gray-400 line-through">
                            Rs.{config.oldPrice?.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                        {config.description}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {config.highlights?.map((h, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[11px]">
                            <span className="block font-bold text-brand-charcoal truncate">{h.title}</span>
                            <span className="text-gray-500 truncate block">{h.subtitle}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span>📦 {config.shippingText}</span>
                        <span>💳 {config.paymentText}</span>
                        <span>🛡️ {config.returnText}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {saveSuccess && (
            <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-2">
              <Check className="w-4 h-4" /> Signature Product successfully updated &amp; published live!
            </div>
          )}

        </div>
      </main>

      {/* Edit Modal */}
      {activeModal === 'edit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-brand-charcoal mb-1">
              Edit Signature Product
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Modify flagship product details, pricing, gallery images, highlights, and trust guarantees completely independent of normal products.
            </p>

            <form onSubmit={handleEditProductSubmit} className="space-y-6 text-left">
              
              {/* Basic Info */}
              <div className="space-y-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">1. Product Identity &amp; Pricing</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.mainHeading}
                      onChange={(e) => setFormData((prev) => ({ ...prev, mainHeading: e.target.value }))}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Urdu Name / Subtitle</label>
                    <input
                      type="text"
                      value={formData.urduName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, urduName: e.target.value }))}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Price (Rs.) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Old Price (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.oldPrice}
                      onChange={(e) => setFormData((prev) => ({ ...prev, oldPrice: Number(e.target.value) }))}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Stock Status</label>
                    <select
                      value={formData.stock}
                      onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Product Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                  ></textarea>
                </div>
              </div>

              {/* Images & Gallery */}
              <div className="space-y-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">2. Product Image Gallery</h4>
                <p className="text-[11px] text-gray-500">Upload multiple images, add URLs, and reorder them easily.</p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Image URL..."
                    value={newImageInput}
                    onChange={(e) => setNewImageInput(e.target.value)}
                    className="flex-1 text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newImageInput.trim()) return;
                      setFormData((prev) => ({
                        ...prev,
                        images: [...prev.images, newImageInput.trim()],
                      }));
                      setNewImageInput('');
                    }}
                    className="px-4 py-3 bg-brand-charcoal text-white text-xs font-bold rounded-xl"
                  >
                    Add URL
                  </button>
                  <label className="px-4 py-3 bg-white hover:bg-gray-100 text-brand-charcoal text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 border border-gray-300">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? '...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group bg-white rounded-xl border border-gray-200 p-2 flex flex-col items-center">
                        <div className="relative w-full h-20 rounded-lg overflow-hidden mb-2 bg-[#FFF8ED]">
                          <Image src={img} alt={`Gallery ${idx + 1}`} fill unoptimized className="object-contain" />
                        </div>
                        <div className="flex items-center justify-between w-full text-[10px] font-semibold text-gray-600 px-1">
                          <span>#{idx + 1} {idx === 0 && '(Main)'}</span>
                          <div className="flex gap-1">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...formData.images];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx - 1];
                                  updated[idx - 1] = temp;
                                  setFormData((prev) => ({ ...prev, images: updated }));
                                }}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                            )}
                            {idx < formData.images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...formData.images];
                                  const temp = updated[idx];
                                  updated[idx] = updated[idx + 1];
                                  updated[idx + 1] = temp;
                                  setFormData((prev) => ({ ...prev, images: updated }));
                                }}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.images.filter((_, i) => i !== idx);
                                setFormData((prev) => ({ ...prev, images: updated }));
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Homepage Section Settings */}
              <div className="space-y-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">3. Section Titles &amp; Highlights</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Small Top Label</label>
                    <input
                      type="text"
                      value={formData.sectionHeading}
                      onChange={(e) => setFormData((prev) => ({ ...prev, sectionHeading: e.target.value }))}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Main Heading</label>
                    <input
                      type="text"
                      value={formData.mainHeading}
                      onChange={(e) => setFormData((prev) => ({ ...prev, mainHeading: e.target.value }))}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Quality Badge</label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Order Button Text</label>
                    <input
                      type="text"
                      value={formData.orderButtonText}
                      onChange={(e) => setFormData((prev) => ({ ...prev, orderButtonText: e.target.value }))}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                    />
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-gray-700">Product Highlights (4 Feature Cards)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Title (e.g. 84+ Minerals)"
                      value={newHighlightTitle}
                      onChange={(e) => setNewHighlightTitle(e.target.value)}
                      className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Subtitle (e.g. Fulvic Acid)"
                        value={newHighlightSub}
                        onChange={(e) => setNewHighlightSub(e.target.value)}
                        className="flex-1 text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newHighlightTitle.trim()) return;
                          setFormData((prev) => ({
                            ...prev,
                            highlights: [...prev.highlights, { title: newHighlightTitle.trim(), subtitle: newHighlightSub.trim() }],
                          }));
                          setNewHighlightTitle('');
                          setNewHighlightSub('');
                        }}
                        className="px-3 py-2.5 bg-brand-charcoal text-white text-xs font-bold rounded-xl"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {formData.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200 text-xs">
                        <div>
                          <span className="font-bold text-brand-charcoal">{h.title}</span> &mdash; <span className="text-gray-500">{h.subtitle}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              highlights: prev.highlights.filter((_, i) => i !== idx),
                            }));
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shipping & Trust Assurances */}
              <div className="space-y-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">4. Shipping &amp; Trust Information</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Shipping Text</label>
                    <input
                      type="text"
                      value={formData.shippingText}
                      onChange={(e) => setFormData((prev) => ({ ...prev, shippingText: e.target.value }))}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Text</label>
                    <input
                      type="text"
                      value={formData.paymentText}
                      onChange={(e) => setFormData((prev) => ({ ...prev, paymentText: e.target.value }))}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Guarantee Text</label>
                    <input
                      type="text"
                      value={formData.returnText}
                      onChange={(e) => setFormData((prev) => ({ ...prev, returnText: e.target.value }))}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showRatings}
                      onChange={(e) => setFormData((prev) => ({ ...prev, showRatings: e.target.checked }))}
                      className="w-4 h-4 text-brand-charcoal rounded"
                    />
                    <span className="text-xs font-bold text-gray-700">Display Customer Ratings &amp; Reviews</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-xs font-bold text-green-700">Publish Live on Homepage</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-8 py-3 bg-brand-charcoal hover:bg-black text-white text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-2"
                >
                  {modalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
