import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Review } from '@/models';
import { requireAdmin } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
    }

    await connectDB();
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review deleted' });
  } catch (err: any) {
    console.error('Delete review error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
