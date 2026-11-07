'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

export default function Header() {
  const pathname = usePathname();
  const { setSearchOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`} id="siteHeader">
        <div className="header-container">
          {/* Left Nav */}
          <nav className="main-nav header-left" id="mainNav">
            <ul className="nav-menu">
              <li>
                <Link href="/" className={pathname === '/' ? 'active' : ''}>
                  HOME
                </Link>
              </li>
              <li>
                <Link href="/shop" className={pathname === '/shop' ? 'active' : ''}>
                  SHOP
                </Link>
              </li>
              <li>
                <Link href="/about" className={pathname === '/about' ? 'active' : ''}>
                  ABOUT
                </Link>
              </li>
              <li>
                <Link href="/contact" className={pathname === '/contact' ? 'active' : ''}>
                  CONTACT
                </Link>
              </li>
            </ul>
          </nav>

          {/* Center Logo */}
          <div className="header-center">
            <Link href="/" className="site-logo inline-block">
              <Image src="/img/logo.jpeg" alt="Tumanza" width={210} height={70} priority className="h-[50px] md:h-[70px] w-auto object-contain" />
            </Link>
          </div>

          {/* Right Header Icons */}
          <div className="header-right">
            <div className="header-icons">
              <button
                type="button"
                className="header-icon"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>

              <Link href="/shop" className="header-icon" aria-label="Shop">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39A2 2 0 0 0 9.66 17h8.66a2 2 0 0 0 1.97-1.61L23 6H6"></path>
                </svg>
              </Link>

              <Link href="/account" className="header-icon" aria-label="Account">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
            </div>

            <button
              className={`mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
              id="mobileToggle"
              aria-label="Menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`} id="mobileMenu">
          <ul className="mobile-nav-menu">
            <li>
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                HOME
              </Link>
            </li>
            <li>
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>
                SHOP
              </Link>
            </li>
            <li>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                ABOUT
              </Link>
            </li>
            <li>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                CONTACT
              </Link>
            </li>
            <li>
              <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
                MY ACCOUNT
              </Link>
            </li>
          </ul>
        </div>
        <div
          className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`}
          id="mobileMenuOverlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      </header>
    </>
  );
}
