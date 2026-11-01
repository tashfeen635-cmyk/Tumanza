import crypto from 'crypto';
import { connectDB } from './db';
import { Token, UserToken, User, IUser } from '@/models';

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

export function sanitizeProduct(body: any) {
  body = body || {};
  const price = Number(body.price);
  const oldPrice = Number(body.oldPrice);
  const rating = Number(body.rating);
  const sortOrder = Number(body.sortOrder);
  return {
    name: cleanStr(body.name, 200),
    category: cleanStr(body.category, 120),
    price: Number.isFinite(price) && price >= 0 ? price : 0,
    stock: cleanStr(body.stock, 60) || 'In Stock',
    image: cleanStr(body.image, 1000),
    section: cleanStr(body.section, 60),
    badge: cleanStr(body.badge, 30),
    oldPrice: Number.isFinite(oldPrice) && oldPrice >= 0 ? oldPrice : 0,
    rating: Number.isFinite(rating) && rating >= 1 && rating <= 5 ? rating : 5,
    description: cleanStr(body.description, 2000),
    urduName: cleanStr(body.urduName, 200),
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
}

export async function requireAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const tokenStr = authHeader.slice(7);
  await connectDB();
  const found = await Token.findOne({ token: tokenStr });
  return !!found;
}

export async function requireUser(request: Request): Promise<IUser | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const tokenStr = authHeader.slice(7);
  await connectDB();
  const found = await UserToken.findOne({ token: tokenStr });
  if (!found) return null;
  const user = await User.findById(found.userId);
  return user || null;
}
