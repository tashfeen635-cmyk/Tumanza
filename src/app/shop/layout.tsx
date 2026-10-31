import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Organic Nuts, Herbs & Teas',
  description:
    'Browse Tumanza’s full range of organic nuts, seeds, herbs, teas and superfoods. Sourced from Gilgit-Baltistan and delivered across Pakistan.',
  alternates: { canonical: '/shop' },
  openGraph: {
    title: 'Shop Organic Nuts & Superfoods | Tumanza',
    description:
      'Explore premium organic nuts, herbs and teas from Tumanza — pure, handpicked, Pakistan delivery.',
    url: '/shop',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
