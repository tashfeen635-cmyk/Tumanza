import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Token } from '@/models';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.slice(7);
    await connectDB();
    await Token.deleteOne({ token });

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (err: any) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
