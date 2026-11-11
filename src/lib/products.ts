import { connectDB } from '@/lib/db';
import { Product, Review } from '@/models';
import { ProductItem } from '@/lib/types';
import { extractIdSuffixFromSlug, resolveProductImage } from '@/lib/seo';
import mongoose from 'mongoose';
import { unstable_cache } from 'next/cache';

function mapProduct(p: any, statsMap: Record<string, { avg: number; count: number }>): ProductItem {
  const id = p._id.toString();
  const stat = statsMap[id];
  return {
    _id: id,
    name: p.name,
    category: p.category,
    price: p.price,
    stock: p.stock,
    image: resolveProductImage(p),
    images: Array.isArray(p.images) ? p.images : [],
    section: p.section || '',
    badge: p.badge || '',
    oldPrice: p.oldPrice || 0,
    rating: p.rating || 5,
    description: p.description || '',
    urduName: p.urduName || '',
    sortOrder: p.sortOrder || 0,
    specifications: p.specifications || '',
    benefits: p.benefits || '',
    shippingInfo: p.shippingInfo || '',
    returnPolicy: p.returnPolicy || '',
    reviewAvg: stat ? Math.round(stat.avg * 10) / 10 : null,
    reviewCount: stat ? stat.count : 0,
  };
}

async function getReviewStatsMap(): Promise<Record<string, { avg: number; count: number }>> {
  const reviewStats = await Review.aggregate([
    { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const statsMap: Record<string, { avg: number; count: number }> = {};
  for (let i = 0; i < reviewStats.length; i++) {
    statsMap[reviewStats[i]._id.toString()] = reviewStats[i];
  }
  return statsMap;
}

export const getAllProducts = unstable_cache(
  async (): Promise<ProductItem[]> => {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return [];
    }
    try {
      await connectDB();
      const products = await Product.find().lean();
      const statsMap = await getReviewStatsMap();
      const mapped = products.map((p: any) => mapProduct(p, statsMap));
      mapped.sort((a, b) => {
        const soA = (a.sortOrder && a.sortOrder > 0) ? a.sortOrder : 999999;
        const soB = (b.sortOrder && b.sortOrder > 0) ? b.sortOrder : 999999;
        if (soA !== soB) return soA - soB;
        return a._id.localeCompare(b._id);
      });
      return JSON.parse(JSON.stringify(mapped));
    } catch (e) {
      console.warn('[getAllProducts] DB connection failed, returning empty array:', e);
      return [];
    }
  },
  ['all-products-cache'],
  { revalidate: 60, tags: ['products'] }
);

export async function getProductById(id: string): Promise<ProductItem | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const products = await getAllProducts();
  return products.find((p) => p._id === id) || null;
}

/** Resolve /product/[slug] using trailing id suffix or full ObjectId */
export async function getProductBySlug(slug: string): Promise<ProductItem | null> {
  if (!slug) return null;
  const products = await getAllProducts();

  if (mongoose.Types.ObjectId.isValid(slug)) {
    return products.find((p) => p._id === slug) || null;
  }

  const suffix = extractIdSuffixFromSlug(slug);
  if (!suffix || suffix.length < 6) return null;

  return products.find((p: any) => p._id.toLowerCase().endsWith(suffix)) || null;
}
