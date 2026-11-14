import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PushSubscription } from '@/models';
import { requireAdmin, cleanStr } from '@/lib/auth';
import { getVapidPublicKey } from '@/lib/push';

export const runtime = 'nodejs';

function isValidSubscription(value: any): boolean {
  return Boolean(
    value &&
      typeof value.endpoint === 'string' &&
      value.endpoint.startsWith('https://') &&
      value.keys &&
      typeof value.keys.p256dh === 'string' &&
      typeof value.keys.auth === 'string'
  );
}

export async function GET(request: Request) {
  const isAdmin = await requireAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return NextResponse.json({ error: 'Push notifications are not configured' }, { status: 503 });
  }

  return NextResponse.json({ publicKey });
}

export async function POST(request: Request) {
  const isAdmin = await requireAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!isValidSubscription(body)) {
      return NextResponse.json({ error: 'Invalid push subscription' }, { status: 400 });
    }

    const endpoint = cleanStr(body.endpoint, 2000);
    const p256dh = cleanStr(body.keys.p256dh, 500);
    const auth = cleanStr(body.keys.auth, 500);
    const userAgent = cleanStr(request.headers.get('user-agent') || '', 300);

    await connectDB();
    await PushSubscription.updateOne(
      { endpoint },
      { $set: { endpoint, keys: { p256dh, auth }, userAgent } },
      { upsert: true }
    );

    return NextResponse.json({ message: 'Subscribed to push notifications' }, { status: 201 });
  } catch (err: any) {
    console.error('Push subscribe error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const isAdmin = await requireAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const endpoint = cleanStr(body && body.endpoint, 2000);
    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    await connectDB();
    await PushSubscription.deleteOne({ endpoint });
    return NextResponse.json({ message: 'Unsubscribed from push notifications' });
  } catch (err: any) {
    console.error('Push unsubscribe error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
