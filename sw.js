// AgriFlow Service Worker — minimal, no HTML caching
const CACHE = 'agriflow-static-v1';

// Only cache CSS and images — never HTML
const STATIC = [
  '/AgriFlow/css/style.css',
  '/AgriFlow/images/icon-192.png',
  '/AgriFlow/images/icon-512.png',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).catch(() => {})
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // NEVER intercept HTML pages — always fresh from network
  if (e.request.mode === 'navigate') return;

  // NEVER intercept Firebase
  if (url.hostname.includes('firebase') ||
      url.hostname.includes('google') ||
      url.hostname.includes('gstatic')) return;

  // CSS and images — cache first
  if (e.request.destination === 'style' ||
      e.request.destination === 'image') {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
