const CACHE = 'agriflow-v3';
const BASE  = '/AgriFlow';

// Static assets to cache on install
const STATIC = [
  `${BASE}/css/style.css`,
  `${BASE}/images/icon-192.png`,
  `${BASE}/images/icon-512.png`,
];

// ── Install: cache static assets only ─────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('Cache install error:', err))
  );
});

// ── Activate: clean old caches ─────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch strategy ─────────────────────────────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always go to network for Firebase / Google APIs
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic') ||
    url.hostname.includes('google') ||
    url.hostname.includes('firebaseapp')
  ) {
    return; // let it go through normally
  }

  // HTML pages: network first, fallback to cache
  // This ensures users always get latest code
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          // Cache a copy for offline fallback
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // CSS/JS/Images: cache first, then network
  if (
    e.request.destination === 'style' ||
    e.request.destination === 'script' ||
    e.request.destination === 'image' ||
    e.request.destination === 'font'
  ) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }
});

// ── Message: force update ──────────────────────────────────
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
