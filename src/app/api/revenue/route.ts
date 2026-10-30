import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Revenue } from '@/models';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const revenue = await Revenue.findOne().lean();
    return NextResponse.json(revenue || { labels: [], values: [] });
  } catch (err: any) {
    console.error('Get revenue error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
