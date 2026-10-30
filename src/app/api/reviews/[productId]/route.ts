import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Review, User, UserToken } from '@/models';
import { requireUser, cleanStr } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    if (!mongoose.isValidObjectId(productId)) {
      return NextResponse.json({ reviews: [], avgRating: null, count: 0, userReview: null });
    }

    await connectDB();

    // Check if requesting user has token to return userReview
    let currentUserId: string | null = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const found = await UserToken.findOne({ token: authHeader.slice(7) });
      if (found) currentUserId = found.userId.toString();
    }

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
    let userReview = null;

    for (let i = 0; i < reviews.length; i++) {
      totalRating += reviews[i].rating;
      result.push({
        _id: reviews[i]._id,
        rating: reviews[i].rating,
        comment: reviews[i].comment,
        createdAt: reviews[i].createdAt,
        userName: userMap[reviews[i].userId.toString()] || 'Unknown',
      });
      if (currentUserId && reviews[i].userId.toString() === currentUserId) {
        userReview = { rating: reviews[i].rating, comment: reviews[i].comment };
      }
    }

    const avgRating = reviews.length > 0 ? Math.round((totalRating / reviews.length) * 10) / 10 : null;

    return NextResponse.json({
      reviews: result,
      avgRating,
      count: reviews.length,
      userReview,
    });
  } catch (err: any) {
    console.error('Get reviews error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { productId } = await params;
    if (!mongoose.isValidObjectId(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await request.json();
    const rating = parseInt(body.rating, 10);
    const comment = cleanStr(body.comment, 1000);

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    await connectDB();
    const existing = await Review.findOne({
      userId: user._id,
      productId: new mongoose.Types.ObjectId(productId),
    });

    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      existing.createdAt = new Date();
      await existing.save();
      return NextResponse.json({ message: 'Review updated' });
    } else {
      await Review.create({
        productId: new mongoose.Types.ObjectId(productId),
        userId: user._id,
        rating,
        comment,
      });
      return NextResponse.json({ message: 'Review added' }, { status: 201 });
    }
  } catch (err: any) {
    console.error('Submit review error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
