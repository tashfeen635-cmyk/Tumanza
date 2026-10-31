import { CONTACT_INFO, SITE_NAME, SITE_TAGLINE } from '@/lib/constants';

/** Canonical public origin for tumanza.com */
export function getSiteUrl(): string {
  const raw = process.env.SITE_URL || 'https://tumanza.com';
  return raw.replace(/\/$/, '');
}

export function absoluteUrl(path = '/'): string {
  const base = getSiteUrl();
  if (!path || path === '/') return `${base}/`;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export const BRAND = {
  name: SITE_NAME,
  tagline: SITE_TAGLINE,
  email: CONTACT_INFO.email,
  sameAs: [
    'https://www.facebook.com/tumanza.official/',
    'https://www.instagram.com/tumanza.official/',
  ],
} as const;
