'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { OrderRecord } from '@/lib/types';
import { productSlug } from '@/lib/seo';

function AccountContent() {
  const searchParams = useSearchParams();
  const { user, token, setUserAuth, logout, allProducts, wishlist, toggleWishlist } =
    useStore();

  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [activePanel, setActivePanel] = useState<'profile' | 'orders' | 'wishlist'>('profile');

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Profile update
  const [profName, setProfName] = useState(user?.name || '');
  const [profPhone, setProfPhone] = useState(user?.phone || '');
  const [profCity, setProfCity] = useState(user?.city || '');
  const [profAddress, setProfAddress] = useState(user?.address || '');
  const [profLoading, setProfLoading] = useState(false);
  const [profMsg, setProfMsg] = useState('');

  // Orders
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Verify notice
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);

  useEffect(() => {
    const vToken = searchParams.get('verify');
    if (vToken) {
      fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: vToken }),
      })
        .then((res) => res.json())
        .then((d) => {
          if (d.message) setVerifyNotice('Email verified successfully!');
        })
        .catch(() => {});
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setProfName(user.name || '');
      setProfPhone(user.phone || '');
      setProfCity(user.city || '');
      setProfAddress(user.address || '');
    }
  }, [user]);

  useEffect(() => {
    if (token && user?.verified && activePanel === 'orders') {
      setOrdersLoading(true);
      fetch('/api/user/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => setOrders(d))
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }
  }, [token, user, activePanel]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const d = await res.json();
      if (res.ok) {
        setUserAuth(d.token, d.profile);
      } else {
        setLoginError(d.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('Network error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const d = await res.json();
      if (res.ok) {
        setUserAuth(d.token, d.profile);
      } else {
        setRegError(d.error || 'Registration failed');
      }
    } catch {
      setRegError('Network error');
    } finally {
      setRegLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setProfLoading(true);
    setProfMsg('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profName, phone: profPhone, city: profCity, address: profAddress }),
      });
      const d = await res.json();
      if (res.ok) {
        setUserAuth(token, d);
        setProfMsg('Profile saved successfully!');
      } else {
        setProfMsg(d.error || 'Failed to save');
      }
    } catch {
      setProfMsg('Network error');
    } finally {
      setProfLoading(false);
    }
  };

  const wishlistProducts = allProducts.filter((p) => wishlist.includes(p._id));

  return (
    <section className="account-section">
      <div className="account-container">
        {verifyNotice && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 16px', marginBottom: '20px', borderRadius: '4px', textAlign: 'center', fontSize: '14px' }}>
            {verifyNotice}
          </div>
        )}

        {!user ? (
          /* ================= GUEST: LOGIN / REGISTER ================= */
          <div className="auth-card">
            <div className="auth-tabs">
              <button
                className={`auth-tab ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => setAuthTab('login')}
              >
                SIGN IN
              </button>
              <button
                className={`auth-tab ${authTab === 'register' ? 'active' : ''}`}
                onClick={() => setAuthTab('register')}
              >
                CREATE ACCOUNT
              </button>
            </div>

            {authTab === 'login' ? (
              <form onSubmit={handleLogin} className="contact-form">
                <div className="contact-form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="contact-form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>

                {loginError && (
                  <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '14px' }}>{loginError}</p>
                )}

                <button type="submit" className="btn btn-primary btn-block" disabled={loginLoading}>
                  {loginLoading ? 'SIGNING IN...' : 'SIGN IN'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="contact-form">
                <div className="contact-form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>
                <div className="contact-form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                <div className="contact-form-group">
                  <label>Password (min 6 characters) *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Create password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>

                {regError && (
                  <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '14px' }}>{regError}</p>
                )}

                <button type="submit" className="btn btn-primary btn-block" disabled={regLoading}>
                  {regLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* ================= USER LOGGED IN ================= */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h1 className="account-greeting" style={{ margin: 0 }}>
                Hello, {user.name}!
              </h1>
              <button onClick={logout} className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '11px' }}>
                LOGOUT
              </button>
            </div>

            <div className="account-nav">
              <button
                className={`account-nav-btn ${activePanel === 'profile' ? 'active' : ''}`}
                onClick={() => setActivePanel('profile')}
              >
                PROFILE
              </button>
              <button
                className={`account-nav-btn ${activePanel === 'orders' ? 'active' : ''}`}
                onClick={() => setActivePanel('orders')}
              >
                ORDERS
              </button>
              <button
                className={`account-nav-btn ${activePanel === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActivePanel('wishlist')}
              >
                WISHLIST ({wishlist.length})
              </button>
            </div>

            {activePanel === 'profile' && (
              <div className="account-card">
                <form onSubmit={handleSaveProfile} className="contact-form">
                  <div className="contact-form-group">
                    <label>Full Name</label>
                    <input type="text" value={profName} onChange={(e) => setProfName(e.target.value)} required />
                  </div>
                  <div className="contact-form-group">
                    <label>Email Address</label>
                    <input type="email" value={user.email} disabled style={{ background: '#f5f5f5', color: '#999' }} />
                  </div>
                  <div className="contact-form-group">
                    <label>Phone Number</label>
                    <input type="tel" value={profPhone} onChange={(e) => setProfPhone(e.target.value)} placeholder="0300-1234567" />
                  </div>
                  <div className="contact-form-group">
                    <label>City</label>
                    <input type="text" value={profCity} onChange={(e) => setProfCity(e.target.value)} placeholder="Lahore" />
                  </div>
                  <div className="contact-form-group">
                    <label>Delivery Address</label>
                    <textarea rows={2} value={profAddress} onChange={(e) => setProfAddress(e.target.value)} placeholder="Complete address"></textarea>
                  </div>

                  {profMsg && <p style={{ fontSize: '13px', color: 'var(--primary)', marginBottom: '10px' }}>{profMsg}</p>}

                  <button type="submit" className="btn btn-primary account-save-btn" disabled={profLoading}>
                    {profLoading ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                </form>
              </div>
            )}

            {activePanel === 'orders' && (
              <div className="account-card">
                {!user.verified ? (
                  <p style={{ textAlign: 'center', color: '#888' }}>Please verify your email address to view past orders.</p>
                ) : ordersLoading ? (
                  <p style={{ textAlign: 'center', color: '#888' }}>Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="orders-empty">
                    <p>You have not placed any orders yet.</p>
                    <Link href="/products" className="btn btn-primary">
                      START SHOPPING
                    </Link>
                  </div>
                ) : (
                  orders.map((ord) => {
                    const total = (ord.items || []).reduce((s, it) => s + it.qty * it.price, 0);
                    return (
                      <div key={ord._id} className="order-card">
                        <div className="order-card-header">
                          <span className="order-card-id">Order #{ord.orderId}</span>
                          <span className={`order-status ${ord.status.toLowerCase()}`}>{ord.status}</span>
                          <span className="order-card-date">{ord.date}</span>
                        </div>
                        <div className="order-card-items">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="order-card-item">
                              <span>{it.name} &times; {it.qty}</span>
                              <span>Rs.{(it.qty * it.price).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="order-card-total">
                          <span>Total</span>
                          <span>Rs.{total.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activePanel === 'wishlist' && (
              <div className="account-card">
                {wishlistProducts.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#888', padding: '20px 0' }}>Your wishlist is empty.</p>
                ) : (
                  <div>
                    {wishlistProducts.map((p) => (
                      <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '14px', color: 'var(--black)' }}>{p.name}</strong>
                          <span style={{ fontSize: '13px', color: 'var(--primary)' }}>Rs.{p.price.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link href={`/product/${productSlug(p)}`} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '11px' }}>
                            VIEW
                          </Link>
                          <button type="button" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => toggleWishlist(p._id)}>
                            REMOVE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px 0' }}>Loading account...</div>}>
      <AccountContent />
    </Suspense>
  );
}
