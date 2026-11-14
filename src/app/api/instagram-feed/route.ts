import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { Setting } from '@/models';
import { requireAdmin, cleanStr } from '@/lib/auth';
import { DEFAULT_INSTAGRAM_IMAGES } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SETTING_KEY = 'instagram_feed';
const SLOT_COUNT = DEFAULT_INSTAGRAM_IMAGES.length;

function sanitizeImages(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length !== SLOT_COUNT) return null;

  const images = value.map((item) => cleanStr(String(item ?? ''), 1000));
  if (images.some((image) => !image)) return null;
  if (images.some((image) => !(image.startsWith('/') || /^https?:\/\//i.test(image)))) return null;

  return images;
}

export async function GET() {
  try {
    await connectDB();
    const doc = await Setting.findOne({ key: SETTING_KEY }).lean();
    const stored = sanitizeImages((doc?.value as any)?.images);

    return NextResponse.json(
      { images: stored ?? DEFAULT_INSTAGRAM_IMAGES },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );
  } catch (err: any) {
    console.error('Get Instagram feed error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: err?.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const images = sanitizeImages(body?.images);
    if (!images) {
      return NextResponse.json(
        { error: `Exactly ${SLOT_COUNT} valid image paths or URLs are required` },
        { status: 400 }
      );
    }

    await connectDB();
    await Setting.findOneAndUpdate(
      { key: SETTING_KEY },
      { key: SETTING_KEY, value: { images } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    revalidatePath('/', 'page');

    return NextResponse.json({ success: true, images });
  } catch (err: any) {
    console.error('Update Instagram feed error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: err?.message },
      { status: 500 }
    );
  }
}
