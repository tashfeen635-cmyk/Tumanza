import type { Metadata, Viewport } from 'next';
import { Marcellus, Open_Sans } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { Header, Footer } from '@/components';
import JsonLd from '@/components/seo/JsonLd';
import { organizationJsonLd } from '@/lib/seo';
import { absoluteUrl, getSiteUrl } from '@/lib/site';

const SearchOverlay = dynamic(() => import('@/components/modals/SearchOverlay'));
const ProductModal = dynamic(() => import('@/components/modals/ProductModal'));
const OrderPopup = dynamic(() => import('@/components/modals/OrderPopup'));
const PolicyModal = dynamic(() => import('@/components/modals/PolicyModal'));
const BackToTop = dynamic(() => import('@/components/layout/BackToTop'));

const marcellus = Marcellus({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-marcellus',
  display: 'swap',
  adjustFontFallback: true,
});

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-opensans',
  display: 'swap',
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  themeColor: '#dfceae',
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Tumanza — Nature's Finest Organic Nuts, Herbs & Superfoods",
    template: '%s | Tumanza',
  },
  description:
    'Buy premium organic nuts, seeds, herbs & teas from Gilgit-Baltistan. Handpicked, pure, and delivered across Pakistan by Tumanza.',
  keywords: [
    'Tumanza',
    'organic nuts Pakistan',
    'Hunza walnuts',
    'Gilgit-Baltistan dry fruits',
    'organic almonds',
    'buy dry fruits online Pakistan',
  ],
  authors: [{ name: 'Tumanza', url: getSiteUrl() }],
  creator: 'Tumanza',
  publisher: 'Tumanza',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Tumanza — Nature's Finest Organic Nuts & Seeds",
    description:
      'Handpicked organic nuts, herbs & superfoods from Gilgit-Baltistan. Pure, raw, delivered across Pakistan.',
    url: absoluteUrl('/'),
    siteName: 'Tumanza',
    locale: 'en_PK',
    type: 'website',
    images: [
      {
        url: '/img/hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Tumanza organic nuts and superfoods',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Tumanza — Nature's Finest Organic Nuts & Seeds",
    description:
      'Handpicked organic nuts, herbs & superfoods from Gilgit-Baltistan. Delivered across Pakistan.',
    images: ['/img/hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${marcellus.variable} ${openSans.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="/img/hero.webp" type="image/webp" media="(min-width: 769px)" fetchPriority="high" />
        <link rel="preload" as="image" href="/img/hero.jpg" type="image/jpeg" media="(min-width: 769px)" fetchPriority="high" />
        <link rel="preload" as="image" href="/img/hero-mobile.jpg" type="image/jpeg" media="(max-width: 768px)" fetchPriority="high" />
      </head>
      <body suppressHydrationWarning>
        <JsonLd data={organizationJsonLd()} />
        <StoreProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />

          <SearchOverlay />
          <ProductModal />
          <OrderPopup />
          <PolicyModal />
          <BackToTop />
        </StoreProvider>
      </body>
    </html>
  );
}
