import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { Token } from '@/models';
import { isAdminConfigured, verifyAdminLogin } from '@/lib/auth';
import {
  clearLoginFailures,
  checkLoginLock,
  getClientKey,
  registerLoginFailure,
} from '@/lib/loginThrottle';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const clientKey = getClientKey(request);
    const existingLock = checkLoginLock(clientKey);
    if (existingLock.locked) {
      return NextResponse.json(
        {
          error: `Too many failed attempts. Try again in ${existingLock.retryAfter} seconds.`,
          retryAfter: existingLock.retryAfter,
          locked: true,
        },
        { status: 429, headers: { 'Retry-After': String(existingLock.retryAfter) } }
      );
    }

    await connectDB();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    if (!(await isAdminConfigured())) {
      return NextResponse.json({ error: 'Admin credentials are not configured on the server' }, { status: 500 });
    }

    if (!(await verifyAdminLogin(username, password))) {
      const failure = registerLoginFailure(clientKey);
      if (failure.locked) {
        return NextResponse.json(
          {
            error: `Too many failed attempts. Try again in ${failure.retryAfter} seconds.`,
            retryAfter: failure.retryAfter,
            locked: true,
          },
          { status: 429, headers: { 'Retry-After': String(failure.retryAfter) } }
        );
      }
      return NextResponse.json(
        {
          error: `Invalid username or password. ${failure.attemptsRemaining} attempt${
            failure.attemptsRemaining === 1 ? '' : 's'
          } left.`,
          attemptsRemaining: failure.attemptsRemaining,
        },
        { status: 401 }
      );
    }

    clearLoginFailures(clientKey);

    const token = crypto.randomBytes(32).toString('hex');
    await Token.create({ token });

    return NextResponse.json({ token });
  } catch (err: any) {
    console.error('Admin login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
