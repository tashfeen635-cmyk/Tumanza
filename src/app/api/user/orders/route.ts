import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/models';
import { requireUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!user.verified) {
      return NextResponse.json({ error: 'Email verification required' }, { status: 403 });
    }

    await connectDB();
    const query = user._id
      ? { $or: [{ userId: user._id }, { email: user.email }] }
      : { email: user.email };

    const userOrders = await Order.find(query).sort({ date: -1 }).lean();
    return NextResponse.json(userOrders);
  } catch (err: any) {
    console.error('User orders error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
