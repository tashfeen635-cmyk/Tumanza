import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { SignatureProduct, Review } from '@/models';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    let config = await SignatureProduct.findOne().lean();

    if (!config) {
      config = await SignatureProduct.create({
        enabled: true,
        published: true,
        sectionHeading: 'OUR SIGNATURE PRODUCT',
        mainHeading: 'Tumanza Shilajit',
        tagline: 'Pure Power from Gilgit-Baltistan',
        description: 'Pure Himalayan resin harvested from the majestic peaks of Gilgit-Baltistan. Rich in 84+ fulvic trace minerals and bioactive compounds for unmatched cellular energy, stamina, and holistic vitality.',
        badge: 'PREMIUM QUALITY',
        price: 59.0,
        oldPrice: 79.0,
        stock: 'In Stock',
        category: 'Signature Product',
        urduName: 'خالص سلاجیت',
        images: ['/images/shilajit.png'],
        highlights: [
          { title: '84+ Minerals', subtitle: 'Fulvic & Humic Acid' },
          { title: 'Stamina & Energy', subtitle: 'Natural Cellular Vitality' },
          { title: 'Gilgit Harvest', subtitle: 'Authentic High-Altitude' },
          { title: 'Lab Tested Purity', subtitle: '100% Certified Safe' },
        ],
        showRatings: true,
        orderButtonText: 'Order Now',
        shippingText: 'Free Nationwide Shipping',
        paymentText: 'Secure Payment COD Available',
        returnText: '100% Authentic Guaranteed',
      });
      config = await SignatureProduct.findById(config._id).lean();
    }

    // Get review stats or default
    const mainImg = config.images?.[0] || '/images/shilajit.png';

    const populatedProduct = {
      _id: config._id.toString(),
      name: config.mainHeading,
      urduName: config.urduName,
      category: config.category,
      price: config.price,
      oldPrice: config.oldPrice,
      stock: config.stock,
      image: mainImg,
      images: config.images,
      badge: config.badge,
      description: config.description,
      reviewAvg: 5,
      reviewCount: 42,
    };

    return NextResponse.json({
      ...config,
      _id: config._id.toString(),
      product: populatedProduct,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (err: any) {
    console.error('Get signature product error:', err);
    return NextResponse.json({ error: 'Internal server error', message: err?.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    let config = await SignatureProduct.findOne();
    if (!config) {
      config = new SignatureProduct();
    }

    if (typeof body.enabled === 'boolean') config.enabled = body.enabled;
    if (typeof body.published === 'boolean') config.published = body.published;
    if (body.sectionHeading !== undefined) config.sectionHeading = String(body.sectionHeading);
    if (body.mainHeading !== undefined) config.mainHeading = String(body.mainHeading);
    if (body.tagline !== undefined) config.tagline = String(body.tagline);
    if (body.description !== undefined) config.description = String(body.description);
    if (body.badge !== undefined) config.badge = String(body.badge);
    if (body.price !== undefined) config.price = Number(body.price) || 0;
    if (body.oldPrice !== undefined) config.oldPrice = Number(body.oldPrice) || 0;
    if (body.stock !== undefined) config.stock = String(body.stock);
    if (body.category !== undefined) config.category = String(body.category);
    if (body.urduName !== undefined) config.urduName = String(body.urduName);
    if (Array.isArray(body.images)) {
      config.images = body.images.map((s: any) => String(s).trim()).filter(Boolean);
    }
    if (Array.isArray(body.highlights)) {
      config.highlights = body.highlights.map((h: any) => ({
        title: String(h.title || '').trim(),
        subtitle: String(h.subtitle || '').trim(),
      })).filter((h: any) => h.title);
    }
    if (typeof body.showRatings === 'boolean') config.showRatings = body.showRatings;
    if (body.orderButtonText !== undefined) config.orderButtonText = String(body.orderButtonText);
    if (body.shippingText !== undefined) config.shippingText = String(body.shippingText);
    if (body.paymentText !== undefined) config.paymentText = String(body.paymentText);
    if (body.returnText !== undefined) config.returnText = String(body.returnText);

    config.updatedAt = new Date();
    await config.save();

    revalidatePath('/', 'page');

    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    console.error('Update signature product error:', err);
    return NextResponse.json({ error: 'Internal server error', message: err?.message }, { status: 500 });
  }
}
