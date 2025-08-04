// Service Worker للمستكشف الفضائي
// Copyright © 2024 - جميع الحقوق محفوظة

const CACHE_NAME = 'space-explorer-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/game.js',
  '/manifest.json',
  '/images/icon-16.png',
  '/images/icon-32.png',
  '/images/apple-touch-icon.png',
  '/sounds/explosion-42132.mp3',
  '/sounds/aylex-i-can-fly.mp3',
  '/sounds/escp-neon-metaphor.mp3',
  '/sounds/large-explosion-100420.mp3'
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('تم فتح الكاش');
        return cache.addAll(urlsToCache);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف كاش قديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// التعامل مع الطلبات
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // إرجاع الملف من الكاش إذا وجد
        if (response) {
          return response;
        }
        
        // محاولة جلب الملف من الشبكة
        return fetch(event.request).then(
          function(response) {
            // فحص صحة الاستجابة
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // نسخ الاستجابة للكاش
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

// رسائل من الصفحة الرئيسية
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});