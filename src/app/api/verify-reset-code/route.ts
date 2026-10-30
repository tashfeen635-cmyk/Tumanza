import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { User, PasswordResetToken } from '@/models';
import { cleanStr, safeEqual } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const email = cleanStr(body.email, 200).toLowerCase();
    const code = typeof body.code === 'string' ? body.code.trim() : '';

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid code or email.' }, { status: 400 });
    }

    const resetEntry = await PasswordResetToken.findOne({ userId: user._id });
    if (!resetEntry) {
      return NextResponse.json({ error: 'Invalid code or email.' }, { status: 400 });
    }

    // Check expiry (10 minutes)
    if (Date.now() - resetEntry.createdAt.getTime() > 10 * 60 * 1000) {
      await PasswordResetToken.deleteMany({ userId: user._id });
      return NextResponse.json({ error: 'Invalid code or email.' }, { status: 400 });
    }

    // Check max attempts
    if (resetEntry.attempts >= 3) {
      await PasswordResetToken.deleteMany({ userId: user._id });
      return NextResponse.json({ error: 'Invalid code or email.' }, { status: 400 });
    }

    // Constant-time comparison
    if (!safeEqual(resetEntry.code, code)) {
      resetEntry.attempts += 1;
      await resetEntry.save();
      if (resetEntry.attempts >= 3) {
        await PasswordResetToken.deleteMany({ userId: user._id });
      }
      return NextResponse.json({ error: 'Invalid code or email.' }, { status: 400 });
    }

    // Code is valid - generate grant token
    const grantToken = crypto.randomBytes(32).toString('hex');
    resetEntry.grantToken = grantToken;
    await resetEntry.save();

    return NextResponse.json({ message: 'Code verified.', grantToken });
  } catch (err: any) {
    console.error('Verify reset code error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
