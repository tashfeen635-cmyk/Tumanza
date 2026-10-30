import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Wishlist, Product } from '@/models';
import { requireUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const items = await Wishlist.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    const productIds = items.map((i) => i.productId);
    const products = productIds.length ? await Product.find({ _id: { $in: productIds } }).lean() : [];

    const productMap: Record<string, any> = {};
    for (let p = 0; p < products.length; p++) {
      productMap[products[p]._id.toString()] = products[p];
    }

    const result = [];
    for (let j = 0; j < items.length; j++) {
      const product = productMap[items[j].productId.toString()];
      if (product) {
        result.push({
          _id: items[j]._id,
          productId: items[j].productId,
          createdAt: items[j].createdAt,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          stock: product.stock,
          badge: product.badge,
          oldPrice: product.oldPrice,
          rating: product.rating,
          description: product.description,
          urduName: product.urduName,
          section: product.section,
        });
      }
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Get wishlist error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;
    if (!productId || !mongoose.isValidObjectId(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    await connectDB();
    const existing = await Wishlist.findOne({ userId: user._id, productId });
    if (existing) {
      return NextResponse.json({ error: 'Already in wishlist' }, { status: 409 });
    }

    await Wishlist.create({ userId: user._id, productId });
    return NextResponse.json({ message: 'Added to wishlist' }, { status: 201 });
  } catch (err: any) {
    console.error('Add wishlist error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
