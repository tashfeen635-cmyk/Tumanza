import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order, Subscriber, Review } from '@/models';
import { requireAdmin } from '@/lib/auth';

interface AdminNotification {
  id: string;
  type: 'order' | 'subscriber' | 'review';
  title: string;
  message: string;
  section: 'orders' | 'subscribers' | 'reviews';
  createdAt: string;
}

function createdAtOf(value: any, fallback?: any): Date {
  try {
    if (value && typeof value.getTimestamp === 'function') {
      const fromId = value.getTimestamp();
      if (fromId instanceof Date && !isNaN(fromId.getTime())) return fromId;
    }
  } catch {}
  if (fallback) {
    const parsed = new Date(fallback);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date(0);
}

export async function GET(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const [orders, subscribers, reviews] = await Promise.all([
      Order.find().sort({ _id: -1 }).limit(30).lean(),
      Subscriber.find().sort({ _id: -1 }).limit(30).lean(),
      Review.find()
        .sort({ createdAt: -1 })
        .limit(30)
        .populate('productId', 'name')
        .populate('userId', 'name')
        .lean(),
    ]);

    const notifications: AdminNotification[] = [];

    for (const order of orders as any[]) {
      const items = Array.isArray(order.items) ? order.items : [];
      const total = items.reduce(
        (sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0),
        0
      );
      notifications.push({
        id: `order:${order._id}`,
        type: 'order',
        title: 'New Order',
        message: `${order.customer} placed order ${order.orderId} • Rs.${total.toFixed(2)}`,
        section: 'orders',
        createdAt: createdAtOf(order._id, order.date).toISOString(),
      });
    }

    for (const sub of subscribers as any[]) {
      notifications.push({
        id: `subscriber:${sub._id}`,
        type: 'subscriber',
        title: 'New Subscriber',
        message: `${sub.email} subscribed to the newsletter`,
        section: 'subscribers',
        createdAt: createdAtOf(sub._id, sub.date).toISOString(),
      });
    }

    for (const review of reviews as any[]) {
      const productName = review.productId?.name || 'a product';
      const userName = review.userId?.name || 'A customer';
      const comment = String(review.comment || '').replace(/\s+/g, ' ').trim();
      let message = `${userName} rated ${productName} ${review.rating}★`;
      if (comment) {
        message += `: “${comment.length > 60 ? comment.slice(0, 60) + '…' : comment}”`;
      }
      notifications.push({
        id: `review:${review._id}`,
        type: 'review',
        title: 'New Review',
        message,
        section: 'reviews',
        createdAt: createdAtOf(review._id, review.createdAt).toISOString(),
      });
    }

    notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json({ notifications: notifications.slice(0, 60) });
  } catch (err: any) {
    console.error('Admin notifications error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
