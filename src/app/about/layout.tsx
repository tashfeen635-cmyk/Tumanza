import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Our Story — From Gilgit-Baltistan to Your Door',
  description:
    'Tumanza began with a family farm in Gilgit-Baltistan. Learn how we source organic nuts, herbs and teas with full farm transparency for Pakistan families.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Tumanza | Organic from Gilgit-Baltistan',
    description:
      'Our story: organic farming partnerships in Gilgit-Baltistan and honest dry fruits for Pakistan.',
    url: '/about',
  },
};

const aboutFaqs = [
  {
    question: 'Where does Tumanza source its products?',
    answer:
      'Tumanza partners with farmers in the highlands of Gilgit-Baltistan and other trusted organic growers, with products packed for delivery across Pakistan.',
  },
  {
    question: 'Are Tumanza products organic?',
    answer:
      'Yes. We focus on organic, chemical-free farming practices and offer nuts, herbs, teas and superfoods selected for purity and freshness.',
  },
  {
    question: 'Does Tumanza deliver across Pakistan?',
    answer:
      'Yes. Tumanza delivers handpicked organic products to customers across Pakistan. See the shop or contact page for order help.',
  },
];

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
          faqJsonLd(aboutFaqs),
        ]}
      />
      {children}
    </>
  );
}
