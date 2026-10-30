'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';

export default function OrderPopup() {
  const { orderProduct, closeOrderPopup, user, token } = useStore();

  const [firstName, setFirstName] = useState(user?.name ? user.name.split(' ')[0] : '');
  const [lastName, setLastName] = useState(user?.name ? user.name.split(' ').slice(1).join(' ') : '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [address, setAddress] = useState(user?.address || '');
  const [postcode, setPostcode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string } | null>(null);

  if (!orderProduct) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !city.trim() ||
      !address.trim()
    ) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    const orderData = {
      customer: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      address: `${address.trim()}${postcode.trim() ? ', ' + postcode.trim() : ''}`,
      items: [
        {
          productId: orderProduct._id,
          name: orderProduct.name,
          qty: 1,
          price: orderProduct.price,
        },
      ],
    };

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderSuccess({ orderId: data.orderId || 'Confirmed' });
      } else {
        setErrorMsg(data.error || 'Failed to submit order. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOrderSuccess(null);
    setErrorMsg('');
    closeOrderPopup();
  };

  return (
    <>
      <div className="order-popup-overlay active" onClick={handleClose}></div>
      <div className="order-popup active" id="orderPopup">
        <button
          className="order-popup-close"
          id="orderPopupClose"
          aria-label="Close"
          onClick={handleClose}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {orderSuccess ? (
          <div className="order-popup-success">
            <div className="order-success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h4>Order Submitted!</h4>
            <p>Thank you! Your order #{orderSuccess.orderId} has been placed.</p>
            <p style={{ marginTop: '8px', fontSize: '13px' }}>We will contact you shortly to confirm your delivery.</p>
            <button
              type="button"
              className="btn btn-primary btn-block"
              style={{ marginTop: '20px' }}
              onClick={handleClose}
            >
              CONTINUE SHOPPING
            </button>
          </div>
        ) : (
          <>
            <h3 className="order-popup-title">Place Your Order</h3>
            <p className="order-popup-product" id="orderProductName">
              {orderProduct.name} &mdash; Rs.{orderProduct.price.toFixed(2)}
            </p>
            <form id="orderForm" onSubmit={handleSubmit}>
              <div className="order-form-row">
                <div className="order-form-group">
                  <label htmlFor="orderFirstName">First Name *</label>
                  <input
                    type="text"
                    id="orderFirstName"
                    required
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="order-form-group">
                  <label htmlFor="orderLastName">Last Name *</label>
                  <input
                    type="text"
                    id="orderLastName"
                    required
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="order-form-group">
                <label htmlFor="orderEmail">Email *</label>
                <input
                  type="email"
                  id="orderEmail"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="order-form-group">
                <label htmlFor="orderPhone">Mobile Number *</label>
                <input
                  type="tel"
                  id="orderPhone"
                  required
                  placeholder="e.g. 0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="order-form-group">
                <label htmlFor="orderCity">City *</label>
                <input
                  type="text"
                  id="orderCity"
                  required
                  placeholder="e.g. Lahore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="order-form-group">
                <label htmlFor="orderAddress">Address *</label>
                <textarea
                  id="orderAddress"
                  required
                  placeholder="Full delivery address"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                ></textarea>
              </div>

              <div className="order-form-group">
                <label htmlFor="orderPostcode">Postcode / ZIP *</label>
                <input
                  type="text"
                  id="orderPostcode"
                  required
                  placeholder="e.g. 54000"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                />
              </div>

              {errorMsg && (
                <p id="orderError" style={{ color: '#b00020', fontSize: '13px', margin: '0 0 10px', textAlign: 'center' }}>
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                id="orderSubmitBtn"
                disabled={loading}
              >
                {loading ? 'SUBMITTING...' : 'SUBMIT ORDER'}
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
