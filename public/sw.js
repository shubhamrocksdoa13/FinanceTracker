// Deliberately minimal: this app is authenticated financial data, so we
// don't cache pages or API/action responses (staleness there would be
// actively misleading, and mutations must always hit the network). The only
// jobs here are (a) satisfy the "has a fetch-handling service worker"
// requirement for installability, and (b) make the app shell + a friendly
// offline screen available when there's no connection.
//
// Deliberately NOT cached: /_next/static/*. Those filenames are only
// guaranteed content-hashed/immutable in production builds — Next's dev
// server can reuse the same chunk URL across rebuilds, so cache-first there
// means the browser keeps serving a stale JS/CSS bundle indefinitely
// (surfaces as React hydration mismatches that a hard reload can't fix,
// since the SW keeps re-serving the same cached copy). The offline fallback
// below is fully self-contained inline HTML, so it doesn't need those
// bundles anyway — only the icons/manifest (which the browser/OS reads
// directly, not through the app bundle) are worth caching.
const CACHE_NAME = "wealth-tracker-shell-v2";

const PRECACHE_URLS = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];

const OFFLINE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Offline — Wealth Tracker</title>
<style>
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 24px;
    font-family: system-ui, -apple-system, sans-serif;
    background: #0a0a0a;
    color: #ededed;
  }
  h1 { font-size: 1.25rem; margin: 0 0 8px; }
  p { color: rgba(237, 237, 237, 0.6); margin: 0; }
</style>
</head>
<body>
  <div>
    <h1>You're offline</h1>
    <p>Wealth Tracker needs a connection to load your data. Reconnect and try again.</p>
  </div>
</body>
</html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // never intercept mutations

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isShellAsset =
    url.pathname.startsWith("/icons/") || url.pathname === "/manifest.webmanifest";

  if (isShellAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () => new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } })
      )
    );
  }
});
