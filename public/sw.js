var VERSION = 10;
var cacheName = 'cv19-v' + VERSION;

var filesToCache = [
  './',
  './manifest.json',
  './stats.php',
  './js/Chart.min.js',
  './js/app.js',
  './css/style.css',
  './img/icon-180x180.png',
  './img/icon-192x192.png'
];


self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('Service Worker: Caching app files...');
      return cache.addAll(filesToCache);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});


self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activating....');

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(cacheNames.map(function(key) {
        if (key !== cacheName) {
          console.log('Service Worker: Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});


self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(cacheName).then(function(cache) {
      return cache.match(event.request).then(function(response) {
        if (! event.request.url.endsWith('stats.php')) {
          return response || fetch(event.request);
        }

        if (response) {
          var expirationDate = Date.parse(response.headers.get('expires'));
          var now = new Date();
          if (expirationDate > now) {
              return response;
          }
        }

        return fetch(event.request).then(function(fetchResponse) {
          if (fetchResponse) {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          } else {
            return response;
          }
        });
      });
    })
  );
});
