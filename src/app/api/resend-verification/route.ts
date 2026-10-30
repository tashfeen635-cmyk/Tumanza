import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { EmailVerificationToken } from '@/models';
import { requireUser } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.verified) {
      return NextResponse.json({ message: 'Email already verified' });
    }

    await connectDB();
    await EmailVerificationToken.deleteMany({ userId: user._id });

    const token = crypto.randomBytes(32).toString('hex');
    await EmailVerificationToken.create({ token, userId: user._id });

    sendVerificationEmail(user.email, token).catch(() => {});

    return NextResponse.json({ message: 'Verification email sent' });
  } catch (err: any) {
    console.error('Resend verification error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
