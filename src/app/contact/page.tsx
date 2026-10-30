'use client';

import React, { useState } from 'react';
import { Features, Newsletter } from '@/components';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div>
      {/* ========== CONTACT HERO ========== */}
      <section className="contact-hero">
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">Contact Us</h1>
            <p className="section-subtitle">
              Have a question or want to get in touch? We&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* ========== CONTACT SECTION ========== */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info">
              <h3>Get In Touch</h3>

              <div className="contact-info-item">
                <div className="contact-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <strong>Our Address</strong>
                  <p>42 Orchard Lane, Portland, OR 97201</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div>
                  <strong>Phone</strong>
                  <p>+1 (503) 555-0192</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div>
                  <strong>Email</strong>
                  <p>hello@tumanza.com</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div>
                  <strong>Business Hours</strong>
                  <p>
                    Mon - Fri: 9:00 AM - 6:00 PM
                    <br />
                    Sat: 10:00 AM - 4:00 PM
                    <br />
                    Sun: Closed
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form">
              <h3>Send Us A Message</h3>
              {submitted ? (
                <div style={{ padding: '20px', background: '#dcfce7', color: '#166534', borderRadius: '4px', textAlign: 'center' }}>
                  <strong>Thank you!</strong> Your message has been sent. We will get back to you shortly.
                </div>
              ) : (
                <form id="contactForm" onSubmit={handleSubmit}>
                  <div className="contact-form-row">
                    <div className="contact-form-group">
                      <label htmlFor="contactName">Full Name *</label>
                      <input
                        type="text"
                        id="contactName"
                        required
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="contact-form-group">
                      <label htmlFor="contactEmail">Email *</label>
                      <input
                        type="email"
                        id="contactEmail"
                        required
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="contact-form-group">
                    <label htmlFor="contactSubject">Subject *</label>
                    <input
                      type="text"
                      id="contactSubject"
                      required
                      placeholder="How can we help?"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="contact-form-group">
                    <label htmlFor="contactMessage">Message *</label>
                    <textarea
                      id="contactMessage"
                      required
                      placeholder="Write your message here..."
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">
                    SEND MESSAGE
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <Features />

      {/* ========== NEWSLETTER ========== */}
      <Newsletter />
    </div>
  );
}
