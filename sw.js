const CACHE = 'pdg-8bba564df9b8';
const FILES = ["./", "index.html", "engine.js", "ai.js", "editor.js", "tablet.js", "fonts.css", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "fonts/atkinson-hyperlegible-latin-400-italic.woff2", "fonts/atkinson-hyperlegible-latin-400-normal.woff2", "fonts/atkinson-hyperlegible-latin-700-normal.woff2"];
self.addEventListener('install', ev => { ev.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', ev => { ev.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.startsWith('pdg-') && x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', ev => {
  if (ev.request.method !== 'GET') return;
  ev.respondWith(caches.match(ev.request, { ignoreSearch: true }).then(r => r || fetch(ev.request).catch(() => caches.match('index.html'))));
});
