import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User, EmailVerificationToken } from '@/models';
import { cleanStr } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);
    const token = cleanStr(body.token || searchParams.get('token'), 200);

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const verifyToken = await EmailVerificationToken.findOne({ token });
    if (!verifyToken) {
      return NextResponse.json({ error: 'Invalid or expired verification link' }, { status: 400 });
    }

    // Check expiry (24 hours)
    if (Date.now() - verifyToken.createdAt.getTime() > 24 * 60 * 60 * 1000) {
      await EmailVerificationToken.deleteOne({ token });
      return NextResponse.json(
        { error: 'Verification link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    await User.findByIdAndUpdate(verifyToken.userId, { verified: true });
    await EmailVerificationToken.deleteMany({ userId: verifyToken.userId });

    return NextResponse.json({ message: 'Email verified successfully!' });
  } catch (err: any) {
    console.error('Verify email error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
