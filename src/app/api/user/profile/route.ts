import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser, cleanStr } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      address: user.address,
      verified: user.verified,
    });
  } catch (err: any) {
    console.error('Get profile error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, city, address } = body;

    await connectDB();
    if (name !== undefined) {
      const cleanedName = cleanStr(name, 120);
      if (!cleanedName) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
      }
      user.name = cleanedName;
    }
    if (phone !== undefined) user.phone = cleanStr(phone, 40);
    if (city !== undefined) user.city = cleanStr(city, 80);
    if (address !== undefined) user.address = cleanStr(address, 300);

    await user.save();

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      address: user.address,
      verified: user.verified,
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
