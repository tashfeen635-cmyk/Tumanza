import React from 'react';

export default function Features() {
  return (
    <section className="features">
      <div className="container">
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <h3>Free Shipping</h3>
            <p>On all orders over Rs.5933</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3>100% Organic</h3>
            <p>Certified organic products</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </div>
            <h3>Secure Payment</h3>
            <p>100% secure checkout</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h3>Farm Fresh</h3>
            <p>Direct from organic farms</p>
          </div>
        </div>
      </div>
    </section>
  );
}
