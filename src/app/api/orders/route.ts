import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Order, Product, SignatureProduct, UserToken, nextOrderNumber } from '@/models';
import { requireAdmin, cleanStr, isValidEmail } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find().sort({ date: -1 }).lean();
    return NextResponse.json(orders);
  } catch (err: any) {
    console.error('Get orders error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const customer = cleanStr(body.customer, 120);
    const email = cleanStr(body.email, 200).toLowerCase();
    const phone = cleanStr(body.phone, 40);
    const city = cleanStr(body.city, 80);
    const address = cleanStr(body.address, 300);
    const rawItems = body.items;

    if (!customer || !email || !phone || !city || !address) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: 'Your order must contain at least one item' }, { status: 400 });
    }
    if (rawItems.length > 50) {
      return NextResponse.json({ error: 'Too many items in the order' }, { status: 400 });
    }

    // Resolve items against database catalog
    const ids: any[] = [];
    const names: string[] = [];
    for (let i = 0; i < rawItems.length; i++) {
      const raw = rawItems[i] || {};
      if (raw.productId && mongoose.isValidObjectId(raw.productId)) {
        ids.push(raw.productId);
      } else {
        const n = cleanStr(raw.name, 200);
        if (n) names.push(n);
      }
    }

    const catalogById = ids.length ? await Product.find({ _id: { $in: ids } }) : [];
    const catalogByName = names.length ? await Product.find({ name: { $in: names } }) : [];

    const byId: Record<string, any> = {};
    for (let a = 0; a < catalogById.length; a++) byId[catalogById[a]._id.toString()] = catalogById[a];
    const byName: Record<string, any> = {};
    for (let b = 0; b < catalogByName.length; b++) byName[catalogByName[b].name] = catalogByName[b];

    // Signature products are managed in their own collection, so fall back to them
    // when an item is not part of the standard product catalog.
    let signatureProduct: any = null;
    try {
      signatureProduct = await SignatureProduct.findOne().lean();
    } catch {}

    const sanitizedItems = [];
    for (let j = 0; j < rawItems.length; j++) {
      const item = rawItems[j] || {};
      const product =
        item.productId && mongoose.isValidObjectId(item.productId)
          ? byId[item.productId.toString()]
          : byName[cleanStr(item.name, 200)];

      let qty = parseInt(item.qty, 10);
      if (!Number.isFinite(qty) || qty < 1) qty = 1;
      if (qty > 100) qty = 100;

      if (!product) {
        const requestedId =
          item.productId && mongoose.isValidObjectId(item.productId)
            ? item.productId.toString()
            : '';
        const requestedName = cleanStr(item.name, 200);
        const signatureId = signatureProduct?._id?.toString();
        const matchesSignature =
          signatureProduct &&
          ((signatureId && requestedId === signatureId) ||
            (requestedName && requestedName === String(signatureProduct.mainHeading || '')));

        if (!matchesSignature) {
          return NextResponse.json(
            { error: 'Unknown product: ' + (requestedName || '(missing)') },
            { status: 400 }
          );
        }

        sanitizedItems.push({
          name: String(signatureProduct.mainHeading || requestedName || 'Signature Product'),
          qty,
          price: Number(signatureProduct.price) || 0,
        });
        continue;
      }

      sanitizedItems.push({
        productId: product._id,
        name: product.name,
        qty,
        price: product.price,
      });
    }

    const orderSeq = await nextOrderNumber();
    const orderId = 'PN-' + orderSeq;
    const date = new Date().toISOString().slice(0, 10);
    const status = 'Pending';

    // Associate with authenticated user if token passed
    let userId: any = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const foundToken = await UserToken.findOne({ token: authHeader.slice(7) });
        if (foundToken) userId = foundToken.userId;
      } catch {}
    }

    const order = await Order.create({
      orderId,
      userId,
      customer,
      email,
      phone,
      city,
      address,
      status,
      date,
      items: sanitizedItems,
    });

    // Fire-and-forget email
    sendOrderConfirmationEmail(email, order).catch(() => {});

    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    console.error('Create order error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
