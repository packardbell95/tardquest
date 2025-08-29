/**
 * Tardquest Service Worker (Runtime + Progressive Asset Caching)
 * ---------------------------------------------------------------------------
 * Responsibilities:
 *   1. Precache critical shell (HTML entry points) for offline / fast resume.
 *   2. Runtime caching for static assets (images, audio, video, fonts, JS/CSS)
 *      using a stale‑while‑revalidate strategy (serve cache hit; update in bg).
 *   3. Stream large responses while emitting progressive byte updates back to
 *      the page (SW_PROGRESS), enabling an accurate preload progress bar.
 *   4. Respond to preload script messages for: warm caching, cache probes,
 *      cache listing, and skipWaiting orchestration.
 *   5. Broadcast fast cache hits (SW_CACHE_HIT) so the preloader can mark
 *      assets "done" without re-downloading.
 *
 * Message Protocol (page <-> SW):
 *   To SW:
 *     - 'SW_SKIP_WAITING' : Immediately activate updated SW (manual trigger).
 *     - { type:'WARM_CACHE', urls:[...] } : Fetch & store any uncached URLs.
 *     - { type:'CACHE_PROBE', urls:[...] } : Report which of the URLs are cached.
 *     - { type:'CACHE_LIST' } : Return a list of all cached request URLs.
 *   From SW:
 *     - { type:'SW_PROGRESS', url, total?, loadedDelta, done } : Progressive fetch.
 *     - { type:'SW_CACHE_HIT', url } : Asset served from cache immediately.
 *     - { type:'WARM_CACHE_RESULT', added, attempted } : Warm cache summary.
 *     - { type:'CACHE_PROBE_RESULT', total, cachedCount, missing:[...] }
 *     - { type:'CACHE_LIST_RESULT', urls:[...] }
 *
 * Caching Strategy Details:
 *   - Navigation requests: network-first -> fallback chain (game.html -> ./)
 *   - Static asset extensions (images/audio/video/fonts/etc): stale-while-revalidate
 *   - Streaming: When body streaming is supported, we tee() the response so one
 *     branch is cached while the other is progressively streamed to the client.
 *
 * Versioning:
 *   Increment CACHE_VERSION when adding/removing/modifying precached core shell
 *   assets to force eviction of old cache entries.
 */

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------

const CACHE_VERSION = 'v1'; // bump when shell assets change
const CACHE_NAME = 'tardquest-' + CACHE_VERSION;

// Core shell assets required to bootstrap the game offline.
const PRECACHE = [
  './',
  './game.html',        // primary entry
];

// File extensions we treat as static cacheable assets.
const STATIC_EXT_REGEX = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|cur|mp3|wav|ogg|m4a|flac|mp4|webm|ogv|woff2?|ttf|otf|js|css)$/i;

// ---------------------------------------------------------------------------
// UTILITIES
// ---------------------------------------------------------------------------

/** Post a structured message to all controlled clients safely. */
async function broadcast(msg){
  try {
    const list = await self.clients.matchAll();
    list.forEach(c => { try { c.postMessage(msg); } catch(_){} });
  } catch(_){}
}

/** Safe single-client reply (used for request/response style messages). */
function reply(e, msg){ try { e.source && e.source.postMessage(msg); } catch(_){} }

/** Stale-while-revalidate update (fire-and-forget). */
function revalidate(cache, request){
  fetch(request).then(r=>{ if (r && r.ok) cache.put(request, r.clone()); }).catch(()=>{});
}

/** Build navigation fallback chain. */
function navFallback(){
  return caches.match('./game.html')
    .then(r => r || caches.match('./game-v1.html'))
    .then(r => r || caches.match('./'));
}

/** Stream a response while sending SW_PROGRESS events. */
async function streamWithProgress(req, netResp, cache){
  // If no streaming support, just clone & return while caching.
  const readersSupported = netResp.body && 'getReader' in netResp.body;
  if (!readersSupported){
    cache.put(req, netResp.clone());
    return netResp;
  }

  const contentLength = parseInt(netResp.headers.get('content-length')||'0',10) || undefined;
  const [bodyForClient, bodyForCache] = netResp.body.tee();

  // Progress streaming branch
  const stream = new ReadableStream({
    start(controller){
      const reader = bodyForClient.getReader();
      let loaded = 0;
      function read(){
        reader.read().then(({done, value}) => {
          if (done){ controller.close(); broadcast({ type:'SW_PROGRESS', url:req.url, total: contentLength, loadedDelta: 0, done:true }); return; }
          if (value){
            loaded += value.length;
            controller.enqueue(value);
            broadcast({ type:'SW_PROGRESS', url:req.url, total: contentLength, loadedDelta: value.length, done:false });
          }
          read();
        }).catch(err=>{ try{ controller.error(err); }catch(_){} });
      }
      read();
    }
  });

  // Cache branch (wait not strictly required before responding)
  const cachePut = cache.put(req, new Response(bodyForCache, {
    headers: netResp.headers,
    status: netResp.status,
    statusText: netResp.statusText
  })).catch(()=>{});
  // Don't block response on cache completion; just ensure ongoing event lifetime.
  // (No need for event.waitUntil here because fetch handler already manages flow.)
  return new Response(stream, { headers: netResp.headers, status: netResp.status, statusText: netResp.statusText });
}

// ---------------------------------------------------------------------------
// INSTALL: Precache core shell
// ---------------------------------------------------------------------------
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(PRECACHE))
      .then(()=> self.skipWaiting())
      .catch(()=>{})
  );
});

// ---------------------------------------------------------------------------
// ACTIVATE: Clean old versioned caches
// ---------------------------------------------------------------------------
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(k => k.startsWith('tardquest-') && k !== CACHE_NAME)
        .map(k => caches.delete(k))
      ))
      .then(()=> self.clients.claim())
  );
});

// ---------------------------------------------------------------------------
// FETCH: Navigation + static asset handling with progress streaming
// ---------------------------------------------------------------------------
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                // only cache safe idempotent gets
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // restrict to same-origin

  const isNav = req.mode === 'navigate';
  const isStatic = STATIC_EXT_REGEX.test(url.pathname);

  if (isNav){
    // Network-first for HTML navigation; fallback to cached shell(s)
    e.respondWith(
      fetch(req)
        .then(r => {
          const clone = r.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, clone));
            return r;
        })
        .catch(() => navFallback())
    );
    return;
  }

  if (!isStatic) return; // let non-static requests pass through

  e.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached){
      // Notify page so preloader can fast-complete any asset
      broadcast({ type:'SW_CACHE_HIT', url: req.url });
      // Revalidate in background (no await)
      revalidate(cache, req);
      return cached;
    }
    try {
      const netResp = await fetch(req);
      if (!netResp || !netResp.ok) return netResp; // pass through error status
      return await streamWithProgress(req, netResp, cache);
    } catch(_err){
      // If offline & uncached, respond with 504 (gateway timeout semantics)
      return new Response('', { status: 504 });
    }
  })());
});

// ---------------------------------------------------------------------------
// MESSAGE: Control & cache inspection APIs
// ---------------------------------------------------------------------------
self.addEventListener('message', e => {
  const data = e.data;
  if (data === 'SW_SKIP_WAITING'){ self.skipWaiting(); return; }
  if (!data || typeof data !== 'object') return;

  // Warm cache: fetch any missing URLs & store them.
  if (data.type === 'WARM_CACHE' && Array.isArray(data.urls)){
    e.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => Promise.all(data.urls.map(u => cache.match(u).then(hit => {
          if (hit) return false;
          return fetch(u, { cache:'no-cache' })
            .then(r => { if (r.ok){ cache.put(u, r.clone()); return true; } return false; })
            .catch(()=>false);
        }))))
        .then(results => reply(e, { type:'WARM_CACHE_RESULT', added: results.filter(Boolean).length, attempted: data.urls.length }))
    );
  }

  // Probe: tell which of the requested URLs exist in cache.
  if (data.type === 'CACHE_PROBE' && Array.isArray(data.urls)){
    e.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => Promise.all(data.urls.map(u => cache.match(u).then(hit => ({ u, hit: !!hit })))))
        .then(results => {
          const missing = results.filter(r => !r.hit).map(r => r.u);
            reply(e, { type:'CACHE_PROBE_RESULT', total: results.length, cachedCount: results.length - missing.length, missing });
        })
    );
  }

  // List: enumerate cache contents (debug / audit).
  if (data.type === 'CACHE_LIST'){
    e.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.keys())
        .then(keys => keys.map(k => k.url.replace(self.location.origin + '/', './')))
        .then(urls => reply(e, { type:'CACHE_LIST_RESULT', urls }))
    );
  }
});
