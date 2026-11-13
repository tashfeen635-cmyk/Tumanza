import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Setting } from '@/models';
import {
  requireAdmin,
  hashPassword,
  verifyAdminPassword,
  getAdminUsername,
  ADMIN_CREDENTIALS_KEY,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const username = await getAdminUsername();
    return NextResponse.json(
      { username: username || '' },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err: any) {
    console.error('Get admin account error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newUsername = typeof body.newUsername === 'string' ? body.newUsername.trim() : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    const confirmNewPassword =
      typeof body.confirmNewPassword === 'string' ? body.confirmNewPassword : '';

    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
    }
    if (newUsername.length < 3 || newUsername.length > 64) {
      return NextResponse.json(
        { error: 'New username must be between 3 and 64 characters' },
        { status: 400 }
      );
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }
    if (newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { error: 'New password and confirmation do not match' },
        { status: 400 }
      );
    }

    const currentPasswordValid = await verifyAdminPassword(currentPassword);
    if (!currentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const { hash, salt } = await hashPassword(newPassword);

    await connectDB();
    await Setting.updateOne(
      { key: ADMIN_CREDENTIALS_KEY },
      {
        $set: {
          value: {
            username: newUsername,
            passwordHash: hash,
            salt,
            updatedAt: new Date().toISOString(),
          },
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      message: 'Admin credentials updated successfully',
      username: newUsername,
    });
  } catch (err: any) {
    console.error('Update admin account error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
