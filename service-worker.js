const CACHE_NAME = 'fitness-tracker-v1';
const urlsToCache = [
    '/Fitness-Tracker/',
    '/Fitness-Tracker/index.html',
    '/Fitness-Tracker/styles/main.css',
    '/Fitness-Tracker/js/storage.js',
    '/Fitness-Tracker/js/ui.js',
    '/Fitness-Tracker/js/calendar.js',
    '/Fitness-Tracker/js/weightlifting.js',
    '/Fitness-Tracker/js/cardio.js',
    '/Fitness-Tracker/js/app.js'
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
