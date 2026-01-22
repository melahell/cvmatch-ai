const CACHE_NAME = 'cvcrush-v5.3.3';
const STATIC_ASSETS = [
    '/',
    '/login',
    '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Cache uniquement les assets explicitement listés
// Fetch event - Network First strategy for documents to avoid chunk mismatch
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) {
        return;
    }

    // Ignore API and Next.js internals (handled by browser cache usually)
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) {
        return;
    }

    // Ignore RSC requests
    if (url.searchParams.has('_rsc')) {
        return;
    }

    // Only handle specific static assets
    if (!STATIC_ASSETS.includes(url.pathname)) {
        return;
    }

    // Network First Strategy
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If we get a valid response, clone it to cache and return it
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // If network fails, try cache
                return caches.match(event.request);
            })
    );
});
