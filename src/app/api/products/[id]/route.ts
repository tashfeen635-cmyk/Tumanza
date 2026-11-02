import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Product } from '@/models';
import { requireAdmin, sanitizeProduct } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await request.json();
    const data = sanitizeProduct(body);

    if (!data.name || !data.category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/product/[slug]', 'page');
    return NextResponse.json(product);
  } catch (err: any) {
    console.error('Update product error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/product/[slug]', 'page');
    return NextResponse.json({ message: 'Deleted' });
  } catch (err: any) {
    console.error('Delete product error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
