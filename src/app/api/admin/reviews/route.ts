import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Review, User, Product } from '@/models';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const reviews = await Review.find().sort({ createdAt: -1 }).lean();

    const userIds = reviews.map((r) => r.userId);
    const productIds = reviews.map((r) => r.productId);

    const users = await User.find({ _id: { $in: userIds } }).lean();
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    const userMap: Record<string, string> = {};
    for (let u = 0; u < users.length; u++) userMap[users[u]._id.toString()] = users[u].name;

    const productMap: Record<string, string> = {};
    for (let p = 0; p < products.length; p++) productMap[products[p]._id.toString()] = products[p].name;

    const result = reviews.map((r: any) => ({
      _id: r._id,
      productName: productMap[r.productId.toString()] || 'Deleted Product',
      userName: userMap[r.userId.toString()] || 'Unknown',
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Admin reviews error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
