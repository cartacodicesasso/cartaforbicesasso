addEventListener('install', e =>
  e.waitUntil(
    caches.open('cfs').then(cache =>
      cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/app.js',
        '/background.js',
        '/manifest.json',
        '/favicon.png',
        '/emoji.png',
        '/icon-paper.png',
        '/icon-rock.png',
        '/icon-scissors.png'
      ]))
  )
)

addEventListener('fetch', e =>
  e.respondWith(
    caches.match(e.request)
      .then(res => res || fetch(e.request))
  )
)