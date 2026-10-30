import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserToken } from '@/models';
import { requireUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.slice(7);
    await connectDB();
    await UserToken.deleteOne({ token });

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (err: any) {
    console.error('User logout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
