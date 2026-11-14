import { sendNotification, setVapidDetails } from 'web-push';
import { connectDB } from './db';
import { PushSubscription } from '@/models';

export type AdminPushType = 'order' | 'subscriber' | 'review';

export interface AdminPushPayload {
  title: string;
  body: string;
  type: AdminPushType;
  tag?: string;
  url?: string;
}

let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    console.warn('Web push disabled: VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY are not set.');
    return false;
  }

  setVapidDetails(
    process.env.VAPID_SUBJECT || 'https://tumanza.com',
    publicKey,
    privateKey
  );
  configured = true;
  return true;
}

export function getVapidPublicKey(): string {
  return process.env.VAPID_PUBLIC_KEY || '';
}

export async function sendAdminPush(payload: AdminPushPayload): Promise<void> {
  if (!ensureConfigured()) return;

  try {
    await connectDB();

    const subscriptions = await PushSubscription.find().lean();
    if (subscriptions.length === 0) return;

    const body = JSON.stringify({
      ...payload,
      url: payload.url || '/tumanza-control-7x9p',
    });

    const results = await Promise.allSettled(
      subscriptions.map((subscription) =>
        sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth,
            },
          },
          body,
          { TTL: 60 * 60 * 24 }
        )
      )
    );

    const staleEndpoints: string[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') return;
      const statusCode = Number((result.reason && result.reason.statusCode) || 0);
      if (statusCode === 404 || statusCode === 410) {
        staleEndpoints.push(subscriptions[index].endpoint);
      }
    });

    if (staleEndpoints.length > 0) {
      await PushSubscription.deleteMany({ endpoint: { $in: staleEndpoints } });
    }
  } catch (err: any) {
    console.error('Admin push error:', err?.message || err);
  }
}
