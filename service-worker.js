const CACHE_VERSION = new Date().getTime(); // Use timestamp as version
const CACHE_NAME = `fitness-tracker-${CACHE_VERSION}`;
const urlsToCache = [
    '/Fitness-Tracker/',
    '/Fitness-Tracker/index.html',
    '/Fitness-Tracker/styles/main.css',
    '/Fitness-Tracker/js/storage.js',
    '/Fitness-Tracker/js/ui.js',
    '/Fitness-Tracker/js/calendar.js',
    '/Fitness-Tracker/js/weightlifting.js',
    '/Fitness-Tracker/js/cardio.js',
    '/Fitness-Tracker/js/app.js',
    '/Fitness-Tracker/js/charts.js',
    '/Fitness-Tracker/js/circuit.js',
    '/Fitness-Tracker/js/meals.js',
    '/Fitness-Tracker/js/water.js',
    '/Fitness-Tracker/js/weight.js',
    '/Fitness-Tracker/js/utils.js',
    '/Fitness-Tracker/js/workouts.js'
];

// Install event: Cache all initial resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting()) // Activate new service worker immediately
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName); // Delete old caches
                    }
                })
            );
        }).then(() => self.clients.claim()) // Take control of all clients
    );
});

// Fetch event: Stale-while-revalidate strategy
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                // Don't cache responses that aren't successful
                if (networkResponse && networkResponse.status === 200) {
                    const cachePut = caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, networkResponse.clone()));
                }
                return networkResponse;
            }).catch(() => cachedResponse); // Fallback to cache if fetch fails

            // Return cached response immediately, but fetch new version in background
            return cachedResponse || fetchPromise;
        })
    );
});
