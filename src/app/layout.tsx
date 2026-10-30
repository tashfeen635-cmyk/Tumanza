import type { Metadata, Viewport } from 'next';
import { Marcellus, Open_Sans } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import {
  Header,
  Footer,
  SearchOverlay,
  ProductModal,
  OrderPopup,
  PolicyModal,
  BackToTop,
} from '@/components';

const marcellus = Marcellus({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-marcellus',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-opensans',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#dfceae',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://tumanza.com'),
  title: 'Tumanza — Nature\'s Finest Organic Nuts, Herbs & Superfoods',
  description:
    'Tumanza — premium organic nuts, seeds, herbs & teas handpicked from sustainable farms. Pure, raw, and packed with natural goodness.',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'Tumanza — Nature\'s Finest Organic Nuts & Seeds',
    description:
      'Handpicked from the best farms around the world. Pure, raw, and packed with natural goodness for a healthier you.',
    url: 'https://tumanza.com/',
    type: 'website',
    images: [
      {
        url: '/img/hero.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${marcellus.variable} ${openSans.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <StoreProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />

          {/* Global Interactive Modals */}
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
