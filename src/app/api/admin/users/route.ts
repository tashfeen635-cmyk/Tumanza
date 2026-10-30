import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User, Order } from '@/models';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const users = await User.find(
      {},
      'name email phone city address verified createdAt'
    )
      .sort({ createdAt: -1 })
      .lean();

    const counts = await Order.aggregate([
      { $group: { _id: '$email', count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    for (let c = 0; c < counts.length; c++) {
      countMap[counts[c]._id] = counts[c].count;
    }

    const result = users.map((u: any) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      city: u.city,
      address: u.address,
      verified: u.verified,
      createdAt: u.createdAt,
      orderCount: countMap[u.email] || 0,
    }));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Admin users error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
