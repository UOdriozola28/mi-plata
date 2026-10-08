const V = 'miplata-v3';
const ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Responde desde caché y actualiza en segundo plano (funciona sin internet).
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(V).then(async cache => {
      const hit = await cache.match(e.request);
      const net = fetch(e.request)
        .then(res => { if (res && res.ok) cache.put(e.request, res.clone()); return res; })
        .catch(() => hit || cache.match('index.html'));
      return hit || net;
    })
  );
});
