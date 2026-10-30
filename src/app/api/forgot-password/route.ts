import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { User, PasswordResetToken } from '@/models';
import { cleanStr } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const email = cleanStr(body.email, 200).toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset code has been sent.' });
    }

    await PasswordResetToken.deleteMany({ userId: user._id });
    const code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    await PasswordResetToken.create({ code, userId: user._id });

    sendPasswordResetEmail(user.email, code).catch(() => {});

    return NextResponse.json({ message: 'If an account exists, a reset code has been sent.' });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
