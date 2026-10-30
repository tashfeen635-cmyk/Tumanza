import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { User, PasswordResetToken, UserToken } from '@/models';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { grantToken, password } = body;

    if (!grantToken || !password) {
      return NextResponse.json({ error: 'Grant token and password are required' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const resetEntry = await PasswordResetToken.findOne({ grantToken });
    if (!resetEntry || !resetEntry.grantToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset session. Please start over.' },
        { status: 400 }
      );
    }

    // Check expiry (10 minutes)
    if (Date.now() - resetEntry.createdAt.getTime() > 10 * 60 * 1000) {
      await PasswordResetToken.deleteMany({ userId: resetEntry.userId });
      return NextResponse.json(
        { error: 'Reset session has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(password);
    await User.findByIdAndUpdate(resetEntry.userId, {
      password: hashed.hash,
      salt: hashed.salt,
    });
    await PasswordResetToken.deleteMany({ userId: resetEntry.userId });

    // Auto-login: generate session token
    const user = await User.findById(resetEntry.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    await UserToken.create({ token: sessionToken, userId: user._id });

    return NextResponse.json({
      message: 'Password reset successfully!',
      token: sessionToken,
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
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
