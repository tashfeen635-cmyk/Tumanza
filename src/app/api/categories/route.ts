import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Setting } from '@/models/Setting';
import { requireAdmin } from '@/lib/auth';

const DEFAULT_CATEGORIES = ['Nuts', 'Herbs & Supplements', 'Teas', 'Mixes & Butters', 'Spices'];

export async function GET() {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json(DEFAULT_CATEGORIES);
    }
    await connectDB();
    const setting = await Setting.findOne({ key: 'collection_categories' });
    if (setting && Array.isArray(setting.value)) {
      return NextResponse.json(setting.value);
    }
    return NextResponse.json(DEFAULT_CATEGORIES);
  } catch {
    return NextResponse.json(DEFAULT_CATEGORIES);
  }
}

export async function PUT(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const categories = body.categories;
    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: 'Invalid categories array' }, { status: 400 });
    }

    await connectDB();
    await Setting.findOneAndUpdate(
      { key: 'collection_categories' },
      { key: 'collection_categories', value: categories },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update categories' }, { status: 500 });
  }
}
