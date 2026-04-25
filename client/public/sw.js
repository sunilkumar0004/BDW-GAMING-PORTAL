const CACHE_NAME = 'bdw-game-cache-v2';
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/favicon.ico'
];

const PROXY_URL = '/api/proxy/game?url=';
const PROXY_DOMAINS = [
    'gamedistribution.com',
    'gamemonetize',
    'gamepix.com',
    'images.wallpapersden.com',
    'placehold.co'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // 1. Skip internal API calls
    if (url.pathname.startsWith('/api/')) return;

    // 2. Caching Strategy: Stale-While-Revalidate for Images and Fonts
    const isImage = event.request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|webp|gif|svg)$/);
    const isFont = event.request.destination === 'font' || url.hostname.includes('fonts.gstatic.com');
    const isProxied = PROXY_DOMAINS.some(d => url.hostname.includes(d));

    if (isImage || isFont || isProxied) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    const fetchPromise = fetch(event.request).then((networkResponse) => {
                        if (networkResponse.ok) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => cachedResponse); // Fallback to cache if offline

                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // 3. Network First for everything else
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
