export type PushSubscriptionState =
  | 'subscribed'
  | 'permission-required'
  | 'denied'
  | 'unsupported'
  | 'unconfigured'
  | 'error';

export function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function isStandaloneApp(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i += 1) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export async function registerAdminServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;
    return registration;
  } catch {
    return null;
  }
}

let cachedPublicKey = '';

async function getPublicKey(
  adminToken: string
): Promise<{ key: string; state?: PushSubscriptionState }> {
  if (cachedPublicKey) return { key: cachedPublicKey };

  try {
    const res = await fetch('/api/admin/push', {
      headers: { Authorization: `Bearer ${adminToken}` },
      cache: 'no-store',
    });
    if (res.status === 503) return { key: '', state: 'unconfigured' };
    if (!res.ok) return { key: '', state: 'error' };
    const data = await res.json();
    cachedPublicKey = String(data.publicKey || '');
    return cachedPublicKey ? { key: cachedPublicKey } : { key: '', state: 'unconfigured' };
  } catch {
    return { key: '', state: 'error' };
  }
}

export async function prepareAdminPush(adminToken: string): Promise<void> {
  if (!pushSupported()) return;
  await registerAdminServiceWorker();
  await getPublicKey(adminToken);
}

export async function ensureAdminPushSubscription(
  adminToken: string
): Promise<PushSubscriptionState> {
  if (!pushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';

  const registration = await registerAdminServiceWorker();
  if (!registration) return 'error';

  const keyResult = await getPublicKey(adminToken);
  if (!keyResult.key) return keyResult.state || 'error';
  const serverKey = keyResult.key;

  if (Notification.permission !== 'granted') return 'permission-required';

  try {
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(serverKey),
      });
    }

    const res = await fetch('/api/admin/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(subscription.toJSON()),
    });

    return res.ok ? 'subscribed' : 'error';
  } catch {
    const currentPermission = (
      typeof Notification !== 'undefined' ? Notification.permission : 'default'
    ) as NotificationPermission;
    return currentPermission === 'denied' ? 'denied' : 'error';
  }
}

export async function requestPushPermissionAndSubscribe(
  adminToken: string
): Promise<PushSubscriptionState> {
  if (!pushSupported()) return 'unsupported';

  try {
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
      return permission === 'denied' ? 'denied' : 'permission-required';
    }
  } catch {
    return 'error';
  }

  return ensureAdminPushSubscription(adminToken);
}

export async function showServiceWorkerNotification(item: {
  id: string;
  title: string;
  message: string;
  section: string;
}): Promise<boolean> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('Notification' in window) ||
    Notification.permission !== 'granted'
  ) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    await registration.showNotification(item.title, {
      body: item.message,
      tag: item.id,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: `/tumanza-control-7x9p?section=${encodeURIComponent(item.section)}` },
    });
    return true;
  } catch {
    return false;
  }
}
