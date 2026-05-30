import { signedFetch, type SigningContext } from './signedFetch';

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC ?? '';
const NOTIF_KEY = 'tc_notifications_enabled';

export function notificationsEnabled(): boolean {
  return localStorage.getItem(NOTIF_KEY) === '1';
}

export function isSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function currentPermission(): NotificationPermission {
  return typeof Notification !== 'undefined' ? Notification.permission : 'default';
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
    ]);
  } catch {
    return null;
  }
}

function urlB64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

type PushErrorCode =
  | 'NOT_SUPPORTED'
  | 'VAPID_MISSING'
  | 'PERMISSION_DENIED'
  | 'SW_NOT_READY'
  | 'SUBSCRIBE_FAILED'
  | 'SERVER_ERROR';

export class PushError extends Error {
  readonly code: PushErrorCode;
  constructor(code: PushErrorCode, message: string) {
    super(message);
    this.name = 'PushError';
    this.code = code;
  }
}

export async function enableNotifications(signing: SigningContext): Promise<void> {
  if (!isSupported()) {
    throw new PushError('NOT_SUPPORTED', 'Push notifications not supported in this browser');
  }

  if (!VAPID_PUBLIC) {
    console.error('[Push] VITE_VAPID_PUBLIC is missing from env');
    throw new PushError('VAPID_MISSING', 'VAPID public key not configured');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('[Push] Permission result:', permission);
    throw new PushError('PERMISSION_DENIED', `Permission ${permission}`);
  }

  const reg = await getRegistration();
  if (!reg) {
    console.error('[Push] Service worker not ready (timeout or missing)');
    throw new PushError('SW_NOT_READY', 'Service worker not ready');
  }

  let sub: PushSubscription;
  try {
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      sub = existing;
    } else {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC).buffer as ArrayBuffer,
      });
    }
  } catch (err) {
    console.error('[Push] pushManager.subscribe failed:', err);
    throw new PushError('SUBSCRIBE_FAILED', err instanceof Error ? err.message : 'Subscribe failed');
  }

  const json = sub.toJSON();
  try {
    const res = await signedFetch(signing, '/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint, keys: json.keys }),
    });
    if (!res.ok) {
      console.warn('[Push] Server returned', res.status);
      throw new PushError('SERVER_ERROR', `Server error ${res.status}`);
    }
  } catch (err) {
    if (err instanceof PushError) throw err;
    console.warn('[Push] Fetch failed (offline?), subscription still saved locally');
  }

  localStorage.setItem(NOTIF_KEY, '1');
}

export async function disableNotifications(signing: SigningContext): Promise<void> {
  const reg = await getRegistration();
  if (reg) {
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      try {
        await signedFetch(signing, '/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      } catch {
        // offline — continue with local unsubscribe
      }
      await sub.unsubscribe();
    }
  }
  localStorage.removeItem(NOTIF_KEY);
}
