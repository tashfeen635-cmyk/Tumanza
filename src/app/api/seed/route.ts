import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import {
  Product,
  Order,
  Subscriber,
  Revenue,
  seedProducts,
  seedOrders,
  seedRevenue,
} from '@/models';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const [pc, oc, sc, rc] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Subscriber.countDocuments(),
      Revenue.countDocuments(),
    ]);

    if (pc === 0) await Product.insertMany(seedProducts);
    if (oc === 0) await Order.insertMany(seedOrders);
    if (sc === 0) await Subscriber.insertMany([]);
    if (rc === 0) await Revenue.create(seedRevenue);

    // Update any products missing images or metadata
    const imageMap: Record<string, string> = {};
    seedProducts.forEach((p) => {
      imageMap[p.name] = p.image;
    });
    const noImage = await Product.find({
      $or: [{ image: { $exists: false } }, { image: '' }],
    });
    for (const p of noImage) {
      if (imageMap[p.name]) {
        p.image = imageMap[p.name];
        await p.save();
      }
    }

    return NextResponse.json({ message: 'Seed complete' });
  } catch (err: any) {
    console.error('Seed error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
