const CACHE = 'agriflow-static-v3';

const STATIC = [
  '/css/style.css',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/index.html',
  '/pages/admin.html',
  '/pages/landlord.html',
  '/pages/manager.html',
];

// Install — cache everything
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).catch(() => {})
  );
});

// Activate — clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch — network first for HTML, cache first for assets
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Never intercept Firebase
  if (url.hostname.includes('firebase') ||
      url.hostname.includes('google') ||
      url.hostname.includes('gstatic')) return;

  // HTML — network first, fallback to cache
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // CSS/images — cache first
  if (e.request.destination === 'style' ||
      e.request.destination === 'image') {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
