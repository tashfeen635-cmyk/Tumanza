import { connectDB } from '@/lib/db';
import { Product, Review } from '@/models';
import { ProductItem } from '@/lib/types';
import { extractIdSuffixFromSlug, resolveProductImage } from '@/lib/seo';
import mongoose from 'mongoose';

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
    section: p.section || '',
    badge: p.badge || '',
    oldPrice: p.oldPrice || 0,
    rating: p.rating || 5,
    description: p.description || '',
    urduName: p.urduName || '',
    sortOrder: p.sortOrder || 0,
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

export async function getAllProducts(): Promise<ProductItem[]> {
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
  return mapped;
}

export async function getProductById(id: string): Promise<ProductItem | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await connectDB();
  const p = await Product.findById(id).lean();
  if (!p) return null;
  const statsMap = await getReviewStatsMap();
  return mapProduct(p, statsMap);
}

/** Resolve /product/[slug] using trailing id suffix or full ObjectId */
export async function getProductBySlug(slug: string): Promise<ProductItem | null> {
  if (!slug) return null;

  if (mongoose.Types.ObjectId.isValid(slug)) {
    return getProductById(slug);
  }

  const suffix = extractIdSuffixFromSlug(slug);
  if (!suffix || suffix.length < 6) return null;

  await connectDB();
  const products = await Product.find().lean();
  const match = products.find((p: any) => p._id.toString().toLowerCase().endsWith(suffix));
  if (!match) return null;

  const statsMap = await getReviewStatsMap();
  return mapProduct(match, statsMap);
}
