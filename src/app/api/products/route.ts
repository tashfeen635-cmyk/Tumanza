import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product, Review } from '@/models';
import { requireAdmin, sanitizeProduct } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ sortOrder: 1, _id: 1 }).lean();

    const reviewStats = await Review.aggregate([
      { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    const statsMap: Record<string, { avg: number; count: number }> = {};
    for (let i = 0; i < reviewStats.length; i++) {
      statsMap[reviewStats[i]._id.toString()] = reviewStats[i];
    }

    const result = products.map((p: any) => {
      const stat = statsMap[p._id.toString()];
      let img = p.image || '/images/product-pack.jpg';
      if (img.includes('unsplash')) {
        img = p.name?.toLowerCase().includes('shilajit')
          ? '/images/shilajit.png'
          : '/images/product-pack.jpg';
      }
      return {
        ...p,
        image: img,
        reviewAvg: stat ? Math.round(stat.avg * 10) / 10 : null,
        reviewCount: stat ? stat.count : 0,
      };
    });

    result.sort((a: any, b: any) => {
      const soA = (a.sortOrder && a.sortOrder > 0) ? a.sortOrder : 999999;
      const soB = (b.sortOrder && b.sortOrder > 0) ? b.sortOrder : 999999;
      if (soA !== soB) return soA - soB;
      return String(a._id).localeCompare(String(b._id));
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (err: any) {
    console.error('Get products error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: err?.message || 'Database error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const data = sanitizeProduct(body);

    if (!data.name || !data.category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }

    await connectDB();
    const product = await Product.create(data);
    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    console.error('Create product error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
