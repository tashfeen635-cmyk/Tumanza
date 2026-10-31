import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Contact Tumanza',
  description:
    'Contact Tumanza in Islamabad — email info@tumanza.com or WhatsApp 0317-0885816. Organic nuts & superfoods delivered across Pakistan.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Tumanza',
    description: 'Get in touch with Tumanza for organic dry fruits and superfoods across Pakistan.',
    url: '/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />
      {children}
    </>
  );
}
