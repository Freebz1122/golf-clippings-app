const CACHE_NAME = 'ganton-grass-v1';
const urlsToCache = [
  '/', '/index.html', '/manifest.json', '/images/logo.png', '/images/calendar.png',
  '/images/Monday.png', '/images/Tuesday.png', '/images/Wednesday.png', '/images/Thursday.png',
  '/images/Friday.png', '/images/Saturday.png', '/images/Sunday.png', '/offline.html', '/favicon.ico'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching assets', urlsToCache);
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating', CACHE_NAME);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Intercepting fetch for', event.request.url);
  if (event.request.url.indexOf('https://www.gstatic.com/firebasejs/') !== -1 || !event.request.url.startsWith(self.location.origin)) {
    console.log('Service Worker: Bypassing cache for Firebase or external resource', event.request.url);
    event.respondWith(fetch(event.request).catch(err => {
      console.error('Service Worker: Failed to fetch external resource', err);
      return new Response('External resource fetch failed', { status: 503 });
    }));
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return response;
        }
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const clonedResponse = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse);
            });
            return networkResponse;
          })
          .catch(() => caches.match('/offline.html'))
      })
  );
});