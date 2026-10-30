'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

export default function Footer() {
  const pathname = usePathname();
  const { openPolicyModal } = useStore();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            {/* Col 1 */}
            <div className="footer-col">
              <Link href="/" className="footer-logo">
                Tumanza
              </Link>
              <p className="footer-about">
                Premium organic nuts sourced directly from sustainable farms. Natural, wholesome,
                and packed fresh for your family.
              </p>
              <div className="footer-social">
                <a
                  href="https://www.facebook.com/tumanza.official/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/tumanza.official/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <circle cx="12" cy="12" r="5"></circle>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"></circle>
                  </svg>
                </a>
              </div>
            </div>

            {/* Col 2 */}
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/shop">Shop</Link>
                </li>
                <li>
                  <Link href="/about">About Us</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/account">My Account</Link>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="footer-col">
              <h4>Customer Service</h4>
              <ul className="footer-links">
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openPolicyModal('shipping');
                    }}
                  >
                    Shipping Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openPolicyModal('returns');
                    }}
                  >
                    Return &amp; Refund
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openPolicyModal('privacy');
                    }}
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openPolicyModal('terms');
                    }}
                  >
                    Terms &amp; Conditions
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="footer-col">
              <h4>Contact Info</h4>
              <ul className="footer-contact">
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  42 Orchard Lane, Portland, OR 97201
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  +1 (503) 555-0192
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  hello@tumanza.com
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Tumanza. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
