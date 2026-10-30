import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { Token } from '@/models';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Admin credentials are not configured on the server' }, { status: 500 });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    await Token.create({ token });

    return NextResponse.json({ token });
  } catch (err: any) {
    console.error('Admin login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
