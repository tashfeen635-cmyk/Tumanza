import type { MetadataRoute } from 'next';
import { getAllProducts } from '@/lib/products';
import { productSlug, resolveProductImage } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/shop'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/about'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/contact'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getAllProducts();
    productRoutes = products.map((p) => {
      const mainImg = resolveProductImage(p);
      const extraImgs = Array.isArray(p.images) ? p.images : [];
      const rawImgs = Array.from(new Set([mainImg, ...extraImgs].filter(Boolean)));
      const images = rawImgs.map((img) => (img.startsWith('http') ? img : absoluteUrl(img)));

      return {
        url: absoluteUrl(`/product/${productSlug(p)}`),
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        images,
      };
    });
  } catch (err) {
    console.error('Sitemap product fetch failed:', err);
  }

  return [...staticRoutes, ...productRoutes];
}
