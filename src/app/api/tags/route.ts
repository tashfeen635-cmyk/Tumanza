import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Setting } from '@/models/Setting';
import { requireAdmin } from '@/lib/auth';

const DEFAULT_TAGS = ['Almonds', 'Seeds', 'Herbs', 'Tea', 'Shilajit'];

export async function GET() {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json(DEFAULT_TAGS);
    }
    await connectDB();
    const setting = await Setting.findOne({ key: 'quick_search_tags' });
    if (setting && Array.isArray(setting.value)) {
      return NextResponse.json(setting.value);
    }
    return NextResponse.json(DEFAULT_TAGS);
  } catch {
    return NextResponse.json(DEFAULT_TAGS);
  }
}

export async function PUT(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const tags = body.tags;
    if (!Array.isArray(tags)) {
      return NextResponse.json({ error: 'Invalid tags array' }, { status: 400 });
    }

    await connectDB();
    await Setting.findOneAndUpdate(
      { key: 'quick_search_tags' },
      { key: 'quick_search_tags', value: tags },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, tags });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update tags' }, { status: 500 });
  }
}
