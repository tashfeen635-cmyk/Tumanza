import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Wishlist } from '@/models';
import { requireUser } from '@/lib/auth';

export async function DELETE(
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

    await connectDB();
    const result = await Wishlist.deleteOne({
      userId: user._id,
      productId: new mongoose.Types.ObjectId(productId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Not in wishlist' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Removed from wishlist' });
  } catch (err: any) {
    console.error('Delete wishlist error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
