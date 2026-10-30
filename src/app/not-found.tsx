import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center py-16">
        <span className="text-6xl sm:text-8xl font-serif font-extrabold text-brand-gold tracking-widest block">
          404
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-charcoal mt-2 mb-3">
          Harvest Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-8">
          The page you are looking for might have been moved, renamed, or is temporarily
          unavailable in our catalog.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3.5 bg-brand-charcoal hover:bg-black text-white text-xs font-bold tracking-widest uppercase rounded-lg shadow transition-colors"
        >
          Return To Home
        </Link>
      </div>
    </div>
  );
}
