import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Review, User } from '@/models';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    if (!mongoose.isValidObjectId(productId)) {
      return NextResponse.json({ reviews: [], avgRating: null, count: 0, userReview: null });
    }

    await connectDB();

    const reviews = await Review.find({ productId: new mongoose.Types.ObjectId(productId) })
      .sort({ createdAt: -1 })
      .lean();

    const userIds = reviews.map((r) => r.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap: Record<string, string> = {};
    for (let u = 0; u < users.length; u++) {
      userMap[users[u]._id.toString()] = users[u].name;
    }

    const result = [];
    let totalRating = 0;

    for (let i = 0; i < reviews.length; i++) {
      totalRating += reviews[i].rating;
      result.push({
        _id: reviews[i]._id,
        rating: reviews[i].rating,
        comment: reviews[i].comment,
        createdAt: reviews[i].createdAt,
        userName: userMap[reviews[i].userId.toString()] || 'Unknown',
      });
    }

    const avgRating = reviews.length > 0 ? Math.round((totalRating / reviews.length) * 10) / 10 : null;

    return NextResponse.json({
      reviews: result,
      avgRating,
      count: reviews.length,
    });
  } catch (err: any) {
    console.error('Get reviews error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
