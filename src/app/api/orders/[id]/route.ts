import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Order } from '@/models';
import { requireAdmin } from '@/lib/auth';
import { sendOrderStatusEmail } from '@/lib/email';

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
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await request.json();
    const status = body.status;
    const allowedStatuses = ['Pending', 'Shipped', 'Delivered'];
    if (!status || allowedStatuses.indexOf(status) === -1) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.email && (status === 'Shipped' || status === 'Delivered')) {
      sendOrderStatusEmail(order.email, order, status).catch(() => {});
    }

    return NextResponse.json(order);
  } catch (err: any) {
    console.error('Update order error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
