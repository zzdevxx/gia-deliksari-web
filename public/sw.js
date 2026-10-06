/* GIA Deliksari — Service Worker
 *
 * Strategy:
 *   - HTML navigations (/home, /info, /admin, /super, /kas): network-first,
 *     fall back to cache when offline. Ensures jemaat always sees fresh content
 *     when online, but can still browse the public pages without internet.
 *   - API GET responses: stale-while-revalidate (instant render from cache,
 *     refresh from network in background).
 *   - Static assets (images, fonts, CSS, JS chunks): cache-first with 30-day
 *     expiration.
 *   - Cross-origin (Drive, YouTube, Supabase): bypass — let browser handle.
 *
 * Versioning:
 *   Bump CACHE_VERSION to invalidate all old caches after significant deploys.
 *   Currently 1.0.0.
 */

const CACHE_VERSION = 'gia-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const HTML_CACHE = `${CACHE_VERSION}-html`;
const API_CACHE = `${CACHE_VERSION}-api`;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Minimal precache for first-install offline experience.
// We don't precache full HTML (would balloon size); instead the runtime cache
// fills as jemaat navigates.
const PRECACHE_URLS = [
  '/',
  '/home',
  '/info',
  '/images/logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      try {
        await cache.addAll(PRECACHE_URLS);
      } catch (err) {
        // If any individual asset fails (e.g, 404), continue install — don't block.
        console.warn('[sw] precache partial failure:', err);
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop caches from older versions.
      const all = await caches.keys();
      await Promise.all(
        all
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function isHTMLRequest(req) {
  const accept = req.headers.get('accept') || '';
  return req.mode === 'navigate' || accept.includes('text/html');
}

function isStaticAsset(url) {
  return /\/_next\/static\//.test(url.pathname)
    || /\.(?:png|jpg|jpeg|webp|avif|svg|ico|css|js|woff2?|ttf|eot)$/.test(url.pathname);
}

function isAPIGET(req, urlObj) {
  return req.method === 'GET' && urlObj.pathname.startsWith('/api/');
}
function u(req) {
  return new URL(req.url);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const urlObj = u(req);

  // Bypass non-http(s) (chrome-extension://, data:, etc) and cross-origin
  // media that we don't want to cache (Drive file streams, YouTube embeds).
  if (!urlObj.protocol.startsWith('http')) return;
  if (
    urlObj.host.includes('drive.google.com')
    || urlObj.host.includes('youtube.com')
    || urlObj.host.includes('youtube-nocookie.com')
    || urlObj.host.includes('r2.dev')
    || urlObj.host.includes('googleapis.com')
    || urlObj.host.includes('googlevideo.com')
  ) {
    return;
  }

  // 1. HTML navigations → network-first, fallback to cache.
  if (isHTMLRequest(req)) {
    event.respondWith(
      (async () => {
        try {
          const network = await fetch(req);
          // Only cache successful public pages (avoid caching /admin etc. when gated)
          if (network.ok && (network.status === 200)) {
            const cache = await caches.open(HTML_CACHE);
            cache.put(req, network.clone()).catch(() => {});
          }
          return network;
        } catch (err) {
          const cached = await caches.match(req);
          if (cached) return cached;
          // Last-ditch: serve homepage if offline and not precached.
          const fallback = await caches.match('/home');
          if (fallback) return fallback;
          throw err;
        }
      })(),
    );
    return;
  }

  // 2. API GET → stale-while-revalidate.
  if (isAPIGET(req, urlObj)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE);
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone()).catch(() => {});
            return res;
          })
          .catch(() => null);
        return cached || (await network) || new Response('Offline', { status: 503 });
      })(),
    );
    return;
  }

  // 3. Static assets → cache-first, 30-day expiration.
  if (isStaticAsset(urlObj)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(req);
        if (cached) {
          const dateHeader = cached.headers.get('date');
          const age = dateHeader ? Date.now() - new Date(dateHeader).getTime() : 0;
          if (age < MAX_AGE_MS) return cached;
        }
        try {
          const network = await fetch(req);
          if (network.ok) cache.put(req, network.clone()).catch(() => {});
          return network;
        } catch (err) {
          if (cached) return cached;
          throw err;
        }
      })(),
    );
    return;
  }

  // Default: network passthrough.
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});