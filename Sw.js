// Service Worker للتطبيق - يدعم العمل دون اتصال
const CACHE_NAME = 'zayton-scan-v4-' + new Date().getTime();
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/color-analyzer.js',
    '/time-analyzer.js',
    '/adaptive-learning.js',
    '/manifest.json'
];

// حدث التثبيت
self.addEventListener('install', function(event) {
    console.log('Service Worker: Installing Zayton Scan...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(function() {
                console.log('Service Worker: Install completed');
                return self.skipWaiting();
            })
            .catch(function(error) {
                console.log('Service Worker: Install failed', error);
            })
    );
});

// حدث التنشيط
self.addEventListener('activate', function(event) {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            console.log('Service Worker: Activate completed');
            return self.clients.claim();
        })
    );
});

// حدث Fetch - serving cached content when offline
self.addEventListener('fetch', function(event) {
    // تجنب缓存 طلبات التحليلات والبيانات الديناميكية
    if (event.request.url.includes('/api/') || 
        event.request.url.includes('/analytics')) {
        return fetch(event.request);
    }

    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // إذا وجدت في الكاش، أرجعها
                if (response) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return response;
                }
                
                // وإلا أحمل من الشبكة
                console.log('Service Worker: Fetching from network', event.request.url);
                return fetch(event.request).then(function(response) {
                    // تأكد أن الاستجابة صالحة
                    if(!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // استنسخ الاستجابة
                    var responseToCache = response.clone();
                    
                    // ضعها في الكاش
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                }).catch(function(error) {
                    console.log('Service Worker: Fetch failed', error);
                    // في حالة عدم الاتصال، يمكن إرجاع صفحة بديلة
                    return new Response('Zayton Scan - You are offline. Please check your internet connection.');
                });
            })
    );
});

// حدث الرسائل من الصفحة الرئيسية
self.addEventListener('message', function(event) {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: '2.0',
            cache: CACHE_NAME
        });
    }
});

// حدث المزامنة في الخلفية (للمستقبل)
self.addEventListener('sync', function(event) {
    console.log('Service Worker: Background sync', event.tag);
    if (event.tag === 'background-sync') {
        // يمكن إضافة مزامنة البيانات هنا لاحقاً
    }
});

// حدث الدفع (للمستقبل)
self.addEventListener('push', function(event) {
    console.log('Service Worker: Push message received');
    const options = {
        body: 'Zayton Scan is ready for use!',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png'
    };
    
    event.waitUntil(
        self.registration.showNotification('Zayton Scan', options)
    );
});