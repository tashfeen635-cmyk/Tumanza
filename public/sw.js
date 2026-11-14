const DEFAULT_URL = '/tumanza-control-7x9p';
const ICON = '/icons/icon-192.png';

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function () {
  // Network only. Push notifications do not need an offline cache, and caching
  // Next.js pages can serve stale content after a deployment.
});

self.addEventListener('push', function (event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    try {
      data = { body: event.data ? event.data.text() : '' };
    } catch (ignored) {
      data = {};
    }
  }

  var title = data.title || 'Tumanza Admin';
  var options = {
    body: data.body || '',
    icon: ICON,
    badge: ICON,
    tag: data.tag || undefined,
    renotify: Boolean(data.tag),
    data: { url: data.url || DEFAULT_URL },
    timestamp: Date.now(),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var target =
    (event.notification.data && event.notification.data.url) || DEFAULT_URL;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i += 1) {
          var client = clientList[i];
          if ('focus' in client) {
            return client.focus().then(function () {
              if ('navigate' in client) {
                return client.navigate(target).catch(function () {});
              }
              return undefined;
            });
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(target);
        }
        return undefined;
      })
  );
});
