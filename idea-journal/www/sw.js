const CACHE_NAME = 'idea-journal-v2';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/editor.css',
  '/css/easymde.min.css',
  '/js/app.js',
  '/js/libs/easymde.min.js',
  '/js/storage/database.js',
  '/js/storage/export.js',
  '/js/storage/import.js',
  '/js/components/idea-list.js',
  '/js/components/heatmap.js',
  '/js/components/weekly-report.js',
  '/js/components/settings.js',
  '/js/components/tag-chip.js',
  '/js/features/markdown-editor.js',
  '/js/features/image-compressor.js',
  '/js/features/tag-manager.js',
  '/js/features/weekly-summary.js',
  '/js/features/theme-manager.js',
  '/js/features/data-manager.js',
  '/manifest.json'
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
