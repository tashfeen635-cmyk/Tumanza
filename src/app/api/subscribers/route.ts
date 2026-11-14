import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Subscriber } from '@/models';
import { requireAdmin, cleanStr, isValidEmail } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';
import { sendAdminPush } from '@/lib/push';

export async function GET(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const subs = await Subscriber.find().lean();
    return NextResponse.json(subs);
  } catch (err: any) {
    console.error('Get subscribers error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const email = cleanStr(body.email, 200).toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Already subscribed' }, { status: 409 });
    }

    const date = new Date().toISOString().slice(0, 10);
    const subscriber = await Subscriber.create({ email, date });

    sendWelcomeEmail(email).catch(() => {});

    void sendAdminPush({
      type: 'subscriber',
      title: 'New newsletter subscriber',
      body: email,
      tag: `subscriber:${subscriber._id}`,
      url: '/tumanza-control-7x9p?section=subscribers',
    });

    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });
  } catch (err: any) {
    console.error('Create subscriber error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
