import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Product } from '@/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const hasMongoUri = Boolean(
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL
  );
  const hasAdminUser = Boolean(process.env.ADMIN_USERNAME);
  const hasAdminPass = Boolean(process.env.ADMIN_PASSWORD);

  let dbStatus = 'disconnected';
  let productCount = 0;
  let dbError: string | null = null;

  try {
    const conn = await connectDB();
    dbStatus = conn.connection.readyState === 1 ? 'connected' : `state_${conn.connection.readyState}`;
    productCount = await Product.countDocuments();
  } catch (err: any) {
    dbStatus = 'error';
    dbError = err?.message || 'Unknown database connection error';
  }

  return NextResponse.json(
    {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      env: {
        hasMongoUri,
        hasAdminUser,
        hasAdminPass,
        nodeEnv: process.env.NODE_ENV,
      },
      database: {
        status: dbStatus,
        readyState: mongoose.connection.readyState,
        productCount,
        error: dbError,
      },
    },
    {
      status: dbStatus === 'connected' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
