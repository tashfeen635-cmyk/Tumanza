import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products — Organic Nuts, Herbs & Teas | Tumanza',
  description:
    'Browse Tumanza’s full range of organic nuts, seeds, herbs, teas and superfoods. Sourced from Gilgit-Baltistan and delivered across Pakistan.',
  alternates: { canonical: '/products' },
  openGraph: {
    title: 'Products | Tumanza',
    description:
      'Explore premium organic nuts, herbs and teas from Tumanza — pure, handpicked, Pakistan delivery.',
    url: '/products',
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
