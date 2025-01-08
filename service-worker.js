const CACHE_NAME = 'fitness-tracker-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/js/storage.js',
    '/js/ui.js',
    '/js/calendar.js',
    '/js/weightlifting.js',
    '/js/cardio.js',
    '/js/app.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
