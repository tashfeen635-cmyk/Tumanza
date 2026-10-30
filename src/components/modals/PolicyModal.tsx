'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';

export default function PolicyModal() {
  const { activePolicy, closePolicyModal } = useStore();

  if (!activePolicy) return null;

  const policyContent: Record<string, { title: string; content: React.ReactNode }> = {
    shipping: {
      title: 'Shipping Policy',
      content: (
        <>
          <h3>Delivery Times</h3>
          <p>Standard delivery takes 3&ndash;5 business days within Pakistan. Remote areas may take up to 7 business days.</p>
          <h3>Free Shipping</h3>
          <p>We offer free shipping on all orders above Rs.5933. Orders below this threshold incur a flat delivery fee.</p>
          <h3>Order Tracking</h3>
          <p>Once your order is dispatched, you will receive an email with tracking details. You can track your parcel via courier.</p>
        </>
      ),
    },
    returns: {
      title: 'Return & Refund Policy',
      content: (
        <>
          <h3>Returns</h3>
          <p>If you are not satisfied with your purchase, you may return unopened items within 7 days of delivery for a full refund.</p>
          <h3>Damaged Goods</h3>
          <p>If your order arrives damaged, please contact us within 48 hours with photographs. We will arrange a replacement or refund at no extra cost.</p>
          <h3>Refund Process</h3>
          <p>Refunds are processed within 5&ndash;7 business days after we receive and inspect the returned items.</p>
        </>
      ),
    },
    privacy: {
      title: 'Privacy Policy',
      content: (
        <>
          <h3>Information We Collect</h3>
          <p>We collect your name, email, phone number, and delivery address when you place an order or subscribe to our newsletter.</p>
          <h3>How We Use Your Data</h3>
          <p>Your information is used solely for order processing, delivery, and sending occasional promotional offers (if subscribed). We never sell your data to third parties.</p>
          <h3>Data Security</h3>
          <p>We use industry-standard measures to protect your personal information and ensure secure transactions.</p>
        </>
      ),
    },
    terms: {
      title: 'Terms & Conditions',
      content: (
        <>
          <h3>General</h3>
          <p>By using the Tumanza website and placing orders, you agree to these terms and conditions.</p>
          <h3>Pricing</h3>
          <p>All prices are listed in Pakistani Rupees (Rs.) and are subject to change without prior notice. Prices at the time of order placement are final.</p>
          <h3>Payment</h3>
          <p>We currently accept Cash on Delivery (COD) only. Full payment is expected upon delivery of your order.</p>
          <h3>Limitation of Liability</h3>
          <p>Tumanza shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.</p>
        </>
      ),
    },
  };

  const current = policyContent[activePolicy] || {
    title: 'Policy Details',
    content: <p>No information available.</p>,
  };

  return (
    <>
      <div className="policy-modal-overlay active" onClick={closePolicyModal}></div>
      <div className="policy-modal active" id="policyModal">
        <button
          className="policy-modal-close"
          id="policyModalClose"
          aria-label="Close"
          onClick={closePolicyModal}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h2 className="policy-modal-title" id="policyModalTitle">
          {current.title}
        </h2>
        <div className="policy-modal-body" id="policyModalBody">
          {current.content}
        </div>
      </div>
    </>
  );
}
