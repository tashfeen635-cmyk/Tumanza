import crypto from 'crypto';
import { connectDB } from './db';
import { Token, Setting } from '@/models';

export function escapeHtml(value: unknown): string {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isValidEmail(value: unknown): boolean {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function cleanStr(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  const v = value.trim();
  return v.length > max ? v.slice(0, max) : v;
}

export function safeEqual(a: string | number, b: string | number): boolean {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function scryptAsync(password: string, salt: string, len: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, len, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string, existingSalt?: string) {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = await scryptAsync(password, salt, 64);
  return { hash: hash.toString('hex'), salt };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const derived = await scryptAsync(password, salt, 64);
  const hashBuffer = Buffer.from(hash, 'hex');
  if (derived.length !== hashBuffer.length) return false;
  return crypto.timingSafeEqual(derived, hashBuffer);
}

export const ADMIN_CREDENTIALS_KEY = 'admin_credentials';

export interface StoredAdminCredentials {
  username: string;
  passwordHash: string;
  salt: string;
}

export async function getStoredAdminCredentials(): Promise<StoredAdminCredentials | null> {
  await connectDB();
  const doc = await Setting.findOne({ key: ADMIN_CREDENTIALS_KEY }).lean();
  const value: any = doc?.value;
  if (
    value &&
    typeof value.username === 'string' &&
    typeof value.passwordHash === 'string' &&
    typeof value.salt === 'string'
  ) {
    return { username: value.username, passwordHash: value.passwordHash, salt: value.salt };
  }
  return null;
}

export async function isAdminConfigured(): Promise<boolean> {
  const stored = await getStoredAdminCredentials();
  if (stored) return true;
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
}

export async function getAdminUsername(): Promise<string | null> {
  const stored = await getStoredAdminCredentials();
  if (stored) return stored.username;
  return process.env.ADMIN_USERNAME || null;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (typeof password !== 'string') return false;
  const stored = await getStoredAdminCredentials();
  if (stored) {
    return verifyPassword(password, stored.passwordHash, stored.salt);
  }
  const envPassword = process.env.ADMIN_PASSWORD;
  return Boolean(envPassword) && safeEqual(password, envPassword as string);
}

export async function verifyAdminLogin(username: string, password: string): Promise<boolean> {
  if (typeof username !== 'string' || typeof password !== 'string') return false;
  const stored = await getStoredAdminCredentials();
  if (stored) {
    if (!safeEqual(username, stored.username)) return false;
    return verifyPassword(password, stored.passwordHash, stored.salt);
  }
  const envUsername = process.env.ADMIN_USERNAME;
  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envUsername || !envPassword) return false;
  return safeEqual(username, envUsername) && safeEqual(password, envPassword);
}

export function sanitizeProduct(body: any) {
  body = body || {};
  const price = Number(body.price);
  const oldPrice = Number(body.oldPrice);
  const rating = Number(body.rating);
  const sortOrder = Number(body.sortOrder);
  let images = body.images;
  if (Array.isArray(images)) {
    images = images.map((s: any) => cleanStr(String(s).trim(), 1000)).filter(Boolean);
  } else if (typeof images === 'string') {
    images = images.split(',').map((s: string) => cleanStr(s.trim(), 1000)).filter(Boolean);
  } else {
    images = [];
  }
  return {
    name: cleanStr(body.name, 200),
    category: cleanStr(body.category, 120),
    price: Number.isFinite(price) && price >= 0 ? price : 0,
    stock: cleanStr(body.stock, 60) || 'In Stock',
    image: cleanStr(body.image, 1000),
    images,
    section: cleanStr(body.section, 60),
    badge: cleanStr(body.badge, 30),
    oldPrice: Number.isFinite(oldPrice) && oldPrice >= 0 ? oldPrice : 0,
    rating: Number.isFinite(rating) && rating >= 1 && rating <= 5 ? rating : 5,
    description: cleanStr(body.description, 2000),
    urduName: cleanStr(body.urduName, 200),
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    specifications: cleanStr(body.specifications, 2000),
    benefits: cleanStr(body.benefits, 2000),
    shippingInfo: cleanStr(body.shippingInfo, 2000),
    returnPolicy: cleanStr(body.returnPolicy, 2000),
  };
}

export async function requireAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const tokenStr = authHeader.slice(7);
  if (!tokenStr) return false;

  await connectDB();
  const found = await Token.findOne({ token: tokenStr });
  if (found) return true;

  // Optional emergency access token, only when explicitly configured.
  const masterSecret = process.env.ADMIN_SECRET_TOKEN;
  if (!masterSecret) return false;
  return safeEqual(tokenStr, masterSecret);
}

