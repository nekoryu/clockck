var CACHE_NAME = 'clockck-v2'; // バージョンを上げて強制更新
var urlsToCache = [
    './',
    './index.html?v=2',
    './script.js?v=2',
    './styles.css?v=2',
    './clockck192.png',
    './clockck512.png'
];

// インストール処理
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // 即座に新しいSWを有効化
    );
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches
            .match(event.request)
            .then(function(response) {
                // キャッシュがあれば返す、なければネットワークへ（Network Firstに近い挙動をさせる場合はここを調整）
                return response || fetch(event.request);
            })
    );
});

// 古いキャッシュの削除と制御の奪取
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
            self.clients.claim() // すぐに制御を開始
        ])
    );
});
