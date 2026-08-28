const CACHE_NAME = 'macro-tracker-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first: always try the network for a fresh version,
  // only fall back to cache if genuinely offline.
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});