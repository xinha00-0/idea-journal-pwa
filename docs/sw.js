const CACHE_NAME = 'idea-journal-v3';

const BASE = '/idea-journal-pwa';

const PRECACHE_URLS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/css/style.css',
  BASE + '/css/editor.css',
  BASE + '/css/easymde.min.css',
  BASE + '/js/app.js',
  BASE + '/js/libs/easymde.min.js',
  BASE + '/js/storage/database.js',
  BASE + '/js/storage/export.js',
  BASE + '/js/storage/import.js',
  BASE + '/js/components/idea-list.js',
  BASE + '/js/components/heatmap.js',
  BASE + '/js/components/weekly-report.js',
  BASE + '/js/components/settings.js',
  BASE + '/js/components/tag-chip.js',
  BASE + '/js/features/markdown-editor.js',
  BASE + '/js/features/image-compressor.js',
  BASE + '/js/features/tag-manager.js',
  BASE + '/js/features/weekly-summary.js',
  BASE + '/js/features/theme-manager.js',
  BASE + '/js/features/data-manager.js',
  BASE + '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
