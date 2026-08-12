const CACHE_NAME = 'lms-bangsal-cloud-v15';
const APP_SHELL = [
  './', './index.html', './offline.html', './styles.css?v=15.0', './config.js',
  './app.js?v=15.0', './vendor/xlsx.full.min.js', './vendor/exceljs.min.js', './manifest.webmanifest',
  './assets/logo-smpn1-bangsal.png', './assets/icon-192.png', './assets/icon-512.png',
  './assets/template-data-siswa.xlsx'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('lms-bangsal-') && key !== CACHE_NAME).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(new URL('./offline.html', self.registration.scope).href)));
    return;
  }
  event.respondWith(caches.match(request).then(cached => {
    const refreshed = fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(() => cached);
    return cached || refreshed;
  }));
});
