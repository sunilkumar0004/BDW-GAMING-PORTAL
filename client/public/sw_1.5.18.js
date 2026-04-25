
// Mock Service Worker for GameDistribution / GameMonetize SDKs
// This prevents 404 errors when games try to register their own workers
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Pass-through
});
