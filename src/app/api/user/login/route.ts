import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { User, UserToken } from '@/models';
import { cleanStr, verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    let { email, password } = body;
    email = cleanStr(email, 200).toLowerCase();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password, user.salt);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    await UserToken.create({ token, userId: user._id });

    return NextResponse.json({
      token,
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        address: user.address,
        verified: user.verified,
      },
    });
  } catch (err: any) {
    console.error('User login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
