import { ProductItem } from '@/lib/types';
import { absoluteUrl, BRAND, getSiteUrl } from '@/lib/site';
import { CONTACT_INFO } from '@/lib/constants';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Stable SEO slug: name + last 8 chars of Mongo id */
export function productSlug(product: { _id: string; name: string }): string {
  const id = String(product._id);
  const suffix = id.slice(-8).toLowerCase();
  const base = slugify(product.name) || 'product';
  return `${base}-${suffix}`;
}

export function extractIdSuffixFromSlug(slug: string): string {
  const parts = slug.split('-');
  return (parts[parts.length - 1] || '').toLowerCase();
}

export function resolveProductImage(product: {
  name?: string;
  image?: string;
}): string {
  const img = product.image || '/images/product-pack.jpg';
  if (img.includes('unsplash')) {
    return product.name?.toLowerCase().includes('shilajit')
      ? '/images/shilajit.png'
      : '/images/product-pack.jpg';
  }
  return img;
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'OnlineStore'],
    name: BRAND.name,
    url: getSiteUrl(),
    logo: absoluteUrl('/img/tumanza-logo.png'),
    description: BRAND.tagline,
    email: CONTACT_INFO.email,
    telephone: CONTACT_INFO.phoneE164 || CONTACT_INFO.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT_INFO.streetAddress,
      addressLocality: CONTACT_INFO.city,
      addressRegion: CONTACT_INFO.region,
      postalCode: CONTACT_INFO.postalCode,
      addressCountry: CONTACT_INFO.country,
    },
    sameAs: BRAND.sameAs,
    areaServed: {
      '@type': 'Country',
      name: 'Pakistan',
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(product: ProductItem) {
  const mainImg = resolveProductImage(product);
  const extraImgs = Array.isArray(product.images) ? product.images : [];
  const allImgs = Array.from(new Set([mainImg, ...extraImgs].filter(Boolean)));
  const imageUrls = allImgs.map((img) => (img.startsWith('http') ? img : absoluteUrl(img)));

  const url = absoluteUrl(`/product/${productSlug(product)}`);
  const ratingValue =
    product.reviewAvg != null ? product.reviewAvg : product.rating || undefined;
  const reviewCount = product.reviewCount || 0;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description:
      product.description ||
      `${product.name} — premium organic product from Tumanza, sourced for Pakistan families.`,
    image: imageUrls,
    sku: String(product._id),
    brand: {
      '@type': 'Brand',
      name: BRAND.name,
    },
    category: product.category,
    url,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'PKR',
      price: product.price,
      availability:
        (product.stock || '').toLowerCase().includes('out')
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: BRAND.name,
      },
    },
  };

  if (ratingValue && reviewCount > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return data;
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}
