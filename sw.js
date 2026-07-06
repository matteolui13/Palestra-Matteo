/* FIT·LOG service worker — app shell offline + cache runtime per libreria esercizi */
const CACHE = 'fitlog-v1';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './css/style.css', './js/app.js', './js/data-diet.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // Libreria esercizi e immagini: cache-first con fetch in fallback (così funziona anche offline dopo il primo uso)
  if (url.hostname === 'raw.githubusercontent.com' || url.hostname.includes('fonts.g') || url.hostname === 'cdnjs.cloudflare.com') {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }))
    );
    return;
  }
  // App shell: cache-first, aggiornamento in background
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(hit => {
        const net = fetch(e.request).then(res => {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    );
  }
});
