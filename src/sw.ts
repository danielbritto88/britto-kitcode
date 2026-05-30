/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// R2 photos — cache-first, 30 days
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/photo/'),
  new CacheFirst({
    cacheName: 'tc-photos',
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 30, maxEntries: 100 })],
  }),
);

// API sync — stale-while-revalidate so offline reads still work
registerRoute(
  ({ url }) => url.pathname === '/api/sync',
  new StaleWhileRevalidate({ cacheName: 'tc-api' }),
);

// Skip waiting when the main thread requests it (for "new version" toast)
self.addEventListener('message', (event) => {
  if ((event.data as { type?: string } | undefined)?.type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json() as { title?: string; body?: string; url?: string };

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Tanque Cheio', {
      body: data.body ?? '',
      icon: '/icons/pwa-192.png',
      badge: '/icons/pwa-192.png',
      data: { url: data.url ?? '/manutencao' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data as { url: string }).url;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => 'focus' in c);
        if (existing) {
          void existing.navigate(url);
          return existing.focus();
        }
        return self.clients.openWindow(url);
      }),
  );
});
