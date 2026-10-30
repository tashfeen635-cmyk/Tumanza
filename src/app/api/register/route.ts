import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { User, UserToken, EmailVerificationToken } from '@/models';
import { cleanStr, isValidEmail, hashPassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    let { name, email, password } = body;

    name = cleanStr(name, 120);
    email = cleanStr(email, 200).toLowerCase();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashed.hash,
      salt: hashed.salt,
      verified: false,
    });

    const verifyToken = crypto.randomBytes(32).toString('hex');
    await EmailVerificationToken.create({ token: verifyToken, userId: user._id });
    sendVerificationEmail(user.email, verifyToken).catch(() => {});

    const token = crypto.randomBytes(32).toString('hex');
    await UserToken.create({ token, userId: user._id });

    return NextResponse.json(
      {
        token,
        profile: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          city: user.city,
          address: user.address,
          verified: user.verified,
        },
        needsVerification: true,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
