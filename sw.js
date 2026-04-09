var CACHE_NAME = 'clockck-v4'; // スケーリング安定化・バグ修正版
var urlsToCache = [
    './',
    './index.html',
    './script.js',
    './styles.css',
    './clockck192.png',
    './clockck512.png'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches
            .match(event.request)
            .then(function(response) {
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        Promise.all([
            caches.keys().then(function(cacheNames) {
                return Promise.all(
                    cacheNames.filter(function(cacheName) {
                        return cacheName !== CACHE_NAME;
                    }).map(function(cacheName) {
                        return caches.delete(cacheName);
                    })
                );
            }),
            self.clients.claim()
        ])
    );
});
