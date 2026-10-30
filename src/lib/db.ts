import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env fallback if not already provided by PM2 or process environment
if (!process.env.MONGO_URI && !process.env.MONGODB_URI && !process.env.DATABASE_URL) {
  dotenv.config();
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });
  try {
    dotenv.config({ path: '/var/www/Tumanza/.env' });
  } catch {}
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  const MONGO_URI =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL;

  if (!MONGO_URI) {
    console.error('[DB] Error: No MongoDB connection string found in MONGO_URI, MONGODB_URI, or DATABASE_URL');
    throw new Error('MONGO_URI env variable is not set');
  }

  // If already connected, reuse connection
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection was closed or broken, reset
  if (cached.conn && cached.conn.connection.readyState === 0) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error('[DB] Connection error:', e?.message || e);
    throw e;
  }

  return cached.conn;
}
