'use client';

import React, { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFeedback({ message: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 201) {
        setEmail('');
        setFeedback({ message: "Thanks for subscribing! You're on the list.", type: 'success' });
      } else if (res.status === 409) {
        setEmail('');
        setFeedback({ message: 'This email is already subscribed.', type: 'info' });
      } else {
        setFeedback({
          message: data.error || 'We could not subscribe you right now. Please try again.',
          type: 'error',
        });
      }
    } catch {
      setFeedback({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter">
      <div className="container">
        <div className="newsletter-inner">
          <h2 className="newsletter-title">Join Our Newsletter</h2>
          <p className="newsletter-text">
            Subscribe to get seasonal recipes, exclusive discounts, and first access to new arrivals.
          </p>
          <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email address"
              required
              aria-label="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFeedback(null);
              }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'SENDING...' : 'SUBSCRIBE'}
            </button>
          </form>
          {feedback && (
            <p className={`newsletter-feedback ${feedback.type}`} role="status" aria-live="polite">
              {feedback.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
