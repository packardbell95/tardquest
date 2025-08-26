/**
 * Tardquest Preloader (v2 Release)
 * ---------------------------------------------------------------------------
 * Goals:
 *   - Discover & load assets (static manifest + dynamic DOM/CSS discovery)
 *   - Provide stable progress (count + byte based when possible)
 *   - Adaptive scheduling + prioritization
 *   - Graceful early exit via window.skipPreload()
 *   - Finalize only after a "quiet" period (no new assets) & SW readiness
 *   - Supply warm decode of images to reduce first‑use lag
 *   - Communicate with Service Worker for cache warming & progress
 *   - Keep game code decoupled: only calls window.onTardquestLoaded()
 *
 * Public helpers:
 *   - window.skipPreload(reason?)
 *   - window.auditSWCache(urls?)
 *
 * Notes:
 *   - This file purposely avoids external dependencies.
 *   - All dynamic discoveries are heuristic; unknown MIME types ignored.
 *   - Critical images get <link rel="preload"> hints.
 */
(function(){
    'use strict';

    /* --------------------------------------------------------------------- *
     *  CONFIGURATION CONSTANTS
     * --------------------------------------------------------------------- */
    const QUIET_MS = 400;                         // Time with no new assets before finalize attempt
    const CSS_BG_SCAN_BATCH = 400;                // Nodes per frame for computed background scan
    const MANIFEST_AUDIO_IMMEDIATE = true;        // Load audio early (match v1 behavior)
    const CRITICAL_IMG_REGEX = /assets\/(interface|cursors|fp-anim|.*\/ui)\/|assets\/.*?(?:turn|attack|items?|weapons?|armor|rings)/i;
    const ENABLE_DECODE_WARMUP = true;            // Create decoded image pool post-load
    const DECODE_WARMUP_LIMIT = 150;              // Max retained decoded image objects
    const DEFERRED_MEDIA_DELAY_MS = 600;          // Delay before starting deferred (non-critical) media
    const WAIT_FOR_SERVICE_WORKER = true;         // Gate finalize on SW readiness
    const SW_READY_TIMEOUT_MS = 3000;             // Fallback timeout for SW readiness
    const SIZE_CACHE_KEY = 'tqAssetSizes_v1';     // localStorage key for persisted size hints
    const MAX_CONCURRENCY = 12;

    /* --------------------------------------------------------------------- *
     *  STATIC MANIFEST
     *  (Inherited from v1; adjust as needed. Paths intentionally keep "./")
     * --------------------------------------------------------------------- */
    const STATIC_MANIFEST = [
        // fonts
        './fonts/DejaVuSansMono.woff',

        // cursors
        './assets/cursors/attack.cur','./assets/cursors/down.cur','./assets/cursors/grab.cur','./assets/cursors/left.cur',
        './assets/cursors/right.cur','./assets/cursors/touch.cur','./assets/cursors/turn-left.cur','./assets/cursors/turn-right.cur','./assets/cursors/up.cur',

        // fp-anim
        './assets/fp-anim/fp-torch.gif','./assets/fp-anim/fp-trombone.gif','./assets/fp-anim/rat-chomp.webm',

        // gamepad/generic
        './assets/gamepad/generic/d-down.png','./assets/gamepad/generic/d-left.png','./assets/gamepad/generic/d-right.png','./assets/gamepad/generic/d-up.png',
        './assets/gamepad/generic/L1.png','./assets/gamepad/generic/R1.png',

        // gamepad/playstation
        './assets/gamepad/playstation/circle.png','./assets/gamepad/playstation/cross.png','./assets/gamepad/playstation/select.png',
        './assets/gamepad/playstation/square.png','./assets/gamepad/playstation/start.png','./assets/gamepad/playstation/triangle.png',

        // gamepad/xinput
        './assets/gamepad/xinput/a.png','./assets/gamepad/xinput/b.png','./assets/gamepad/xinput/select.png','./assets/gamepad/xinput/start.png',
        './assets/gamepad/xinput/x.png','./assets/gamepad/xinput/y.png',

        // interface/armor
        './assets/interface/armor/barrel.png','./assets/interface/armor/black-plate-armor.png','./assets/interface/armor/graphic-tee.png',
        './assets/interface/armor/leather-armor.png','./assets/interface/armor/milanese-armor.png','./assets/interface/armor/nokia-mail.png',
        './assets/interface/armor/pectoral-mass.png',

        // interface/items
        './assets/interface/items/c4.png','./assets/interface/items/dowsing-rod.png','./assets/interface/items/hamms.png','./assets/interface/items/lean.png',
        './assets/interface/items/raisins.png','./assets/interface/items/toilet-water.png','./assets/interface/items/torch.png','./assets/interface/items/trombone.png',

        // interface/rings
        './assets/interface/rings/amp-audio.png','./assets/interface/rings/bloodstream-nosering.png','./assets/interface/rings/cockring.png',
        './assets/interface/rings/crack.png','./assets/interface/rings/escobar.png','./assets/interface/rings/french.png','./assets/interface/rings/gambler.png',
        './assets/interface/rings/pectoral-piercing.png','./assets/interface/rings/pinkytoe.png','./assets/interface/rings/sightliness.png',
        './assets/interface/rings/stinky.png','./assets/interface/rings/underwear.png','./assets/interface/rings/valentine.png',

        // interface/ui
        './assets/interface/ui/armor.png','./assets/interface/ui/attack.gif','./assets/interface/ui/confirm.png','./assets/interface/ui/down.png',
        './assets/interface/ui/item-border-small-bottom-left.png','./assets/interface/ui/item-border-small-bottom-right.png',
        './assets/interface/ui/item-border-small-top-left.png','./assets/interface/ui/item-border-small-top-right.png',
        './assets/interface/ui/item-border-small.png','./assets/interface/ui/item-border.png','./assets/interface/ui/items.png',
        './assets/interface/ui/left.png','./assets/interface/ui/next.png','./assets/interface/ui/persuade.gif','./assets/interface/ui/previous.png',
        './assets/interface/ui/right.png','./assets/interface/ui/rings.png','./assets/interface/ui/run.gif','./assets/interface/ui/scroll-down.png',
        './assets/interface/ui/scroll-up.png','./assets/interface/ui/settings.png','./assets/interface/ui/settings1.png','./assets/interface/ui/settings2.png',
        './assets/interface/ui/tardpad.png','./assets/interface/ui/tile1.gif','./assets/interface/ui/tile1.png','./assets/interface/ui/turn-left.png',
        './assets/interface/ui/turn-right.png','./assets/interface/ui/up.png','./assets/interface/ui/weapons.png',

        // interface/weapons
        './assets/interface/weapons/atlatl-spear.png','./assets/interface/weapons/bludgeon-mace.png','./assets/interface/weapons/crt.png',
        './assets/interface/weapons/dance-club.png','./assets/interface/weapons/fingernail.png','./assets/interface/weapons/golden-wang.gif',
        './assets/interface/weapons/magic-pencil.gif','./assets/interface/weapons/nunchucks.png','./assets/interface/weapons/pointy-stick.png',
        './assets/interface/weapons/wiffle-ball-bat.png',

        // transitions
        './assets/transitions/battle-transition.gif',

        // audio
        './audio/ash.mp3','./audio/attack.mp3','./audio/attacked.mp3','./audio/battle1.mp3','./audio/battle2.mp3','./audio/battle3.mp3','./audio/battle4.mp3',
        './audio/battle5.mp3','./audio/battleEnd.mp3','./audio/battleStart.mp3','./audio/breathe1.mp3','./audio/breathe2.mp3','./audio/explore1.mp3',
        './audio/explore2.mp3','./audio/explore3.mp3','./audio/explore4.mp3','./audio/explore5.mp3','./audio/explosion.mp3','./audio/floorBreakScreamDie.mp3',
        './audio/floorCrackSlight.mp3','./audio/footsteps.mp3','./audio/gamble.mp3','./audio/gamblers-theme.mp3','./audio/healTile.mp3','./audio/inventoryOpen.mp3',
        './audio/kaching.mp3','./audio/merchant.mp3','./audio/metalspoons.mp3','./audio/persuade.mp3','./audio/raisins.mp3','./audio/run.mp3',
        './audio/scream.mp3','./audio/tardedwarrior.mp3','./audio/title.mp3','./audio/torch.mp3','./audio/tromBONE.mp3','./audio/turn.mp3',
        './audio/uiCancel.mp3','./audio/uiOption.mp3','./audio/uiSelect.mp3'
    ];

    /* --------------------------------------------------------------------- *
     *  STATE
     * --------------------------------------------------------------------- */
    const assets = Object.create(null);         // url -> record
    const preloadedHint = new Set();            // Set of URLs already hinted with <link rel=preload>
    let deferredMediaQueue = [];                // Functions to start deferred audio/video
    let persistedSizes = {};                    // Cached size hints (bytes)
    let decodedImages = new Set();              // Warm decode tracking
    const decodePool = [];                      // Retained image objects to keep decode warm

    // Counts (fallback for progress when no byte data)
    let total = 0;
    let loaded = 0;

    // Byte-based progress
    let bytesTotal = 0;
    let bytesLoaded = 0;

    // Flags
    let finalized = false;
    let skipped = false;
    let quietTimer = null;
    let swReady = !WAIT_FOR_SERVICE_WORKER;     // If not waiting, treat as immediately ready

    /* --------------------------------------------------------------------- *
     *  PERSISTED SIZE CACHE (improves perceived progress stability)
     * --------------------------------------------------------------------- */
    try { persistedSizes = JSON.parse(localStorage.getItem(SIZE_CACHE_KEY) || '{}'); }
    catch(_e){ persistedSizes = {}; }

    /* --------------------------------------------------------------------- *
     *  UTILS
     * --------------------------------------------------------------------- */

    /**
     * Guess size for an asset when unknown. These heuristics are deliberately
     * coarse—only to maintain a stable progress bar.
     */
    function getInitialConcurrency(){
        try {
            const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (c){
                if (c.saveData) return 2;
                switch (c.effectiveType){
                    case 'slow-2g': return 1;
                    case '2g': return 2;
                    case '3g': return 4;
                    // 4g / unknown -> downlink heuristics
                }
                if (typeof c.downlink === 'number'){
                    if (c.downlink >= 20) return 12;
                    if (c.downlink >= 15) return 10;
                    if (c.downlink >= 10) return 8;
                    if (c.downlink >= 5)  return 6;
                    if (c.downlink >= 2)  return 5;
                    return 4;
                }
            }
        } catch(_e){}
        return 6; // optimistic default
    }
    function guessSize(url){
        if (/fonts\//.test(url)) return 80000;
        if (/\.woff2$/i.test(url)) return 60000;
        if (/cursors\//.test(url)) return 2000;
        if (/interface\/ui\//.test(url)) return 18000;
        if (/interface\/(items|armor|rings|weapons)\//.test(url)) return 22000;
        if (/fp-anim\//.test(url)) return 90000;
        if (/transitions\//.test(url)) return 120000;
        if (/\.(png|jpe?g|gif|webp|avif|svg)$/i.test(url)) return 25000;
        if (/\.(ogg|mp3|wav|m4a|flac)$/i.test(url)) return 350000;
        if (/\.(mp4|webm|ogv)$/i.test(url)) return 600000;
        return 30000;
    }

    function ensurePreloadLink(url, asType='image'){
        if (!url || preloadedHint.has(url)) return;
        preloadedHint.add(url);
        try{
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = asType;
            if (asType === 'font') link.crossOrigin = 'anonymous';
            link.href = url;
            document.head.appendChild(link);
        }catch(_e){}
    }

    function isImageUrl(u){ return /\.(png|jpe?g|gif|webp|avif|svg|bmp)$/i.test(u); }

    /**
     * Warm decode (optional) to reduce later layout or rendering hitch when image
     * first used. We intentionally cap retained objects.
     */
    function warmDecode(url){
        if (!ENABLE_DECODE_WARMUP || !isImageUrl(url) || decodedImages.has(url)) return;
        decodedImages.add(url);
        try{
            const img = new Image();
            img.decoding = 'sync'; // hint only
            img.src = url;
            if (img.decode) img.decode().catch(()=>{});
            decodePool.push(img);
            if (decodePool.length > DECODE_WARMUP_LIMIT) decodePool.shift();
        }catch(_e){}
    }

    function pct(){
        if (bytesTotal > 0) return Math.min(100, Math.round((bytesLoaded / bytesTotal) * 100));
        return total ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
    }

    function updateUI(){
        if (skipped) return;
        const bar = document.getElementById('loadingBar');
        const text = document.getElementById('loadingBarText');
        if (bar && total) bar.style.width = pct() + '%';
        if (text){
            if (finalized || skipped) text.textContent = 'READY';
            else if (total) text.textContent = `Downloading... ${pct()}%`;
            else text.textContent = 'Scanning...';
        }
    }

    function scheduleQuietCheck(){
        if (skipped) return;
        if (quietTimer) clearTimeout(quietTimer);
        quietTimer = setTimeout(finalizeAttempt, QUIET_MS);
    }

    /**
     * Add asset record & invoke loader.
     */
    function addAsset(url, loaderFn, opts = {}){
        if (!url || assets[url]) return;
        assets[url] = { state:'pending', bytesLoaded:0, bytesTotal:0 };
        total++;
        if (opts.critical && opts.type === 'image') ensurePreloadLink(url, 'image');
        try { loaderFn && loaderFn(url, opts.defer); }
        catch(_e){ markDone(url); }
        scheduleQuietCheck();
        updateUI();
    }

    /**
     * Mark asset finished. Handles counting & warm decode.
     */
    function markDone(url){
        const a = assets[url];
        if (!a || a.state === 'done') return;
        a.state = 'done';
        loaded++;
        warmDecode(url);
        updateUI();
        scheduleQuietCheck();
    }

    /**
     * Post-finalization handoff to game & SW.
     */
    function invokeGameReadyHooks(){
        // Inform SW of loaded assets for optional caching hints.
        try{
            if (navigator.serviceWorker && navigator.serviceWorker.controller){
                const loadedUrls = Object.keys(assets).filter(u => assets[u].state === 'done');
                navigator.serviceWorker.controller.postMessage({ type:'WARM_CACHE', urls: loadedUrls });
                navigator.serviceWorker.controller.postMessage({ type:'CACHE_PROBE', urls: STATIC_MANIFEST });
            }
        }catch(_e){}
        // Hook start button to existing title/hide handler if present.
        try{
            const btn = document.getElementById('startGameBtn');
            const hts = window.hideTitleScreen || window.hideTitleScreen?.bind?.(window);
            if (btn && typeof hts === 'function') btn.onclick = hts;
        }catch(_e){}
        // Game entry callback
        try{
            if (typeof window.onTardquestLoaded === 'function') window.onTardquestLoaded();
        }catch(_e){}
    }

    /**
     * Attempt to finalize (idempotent). Conditions:
     *   - All assets loaded
     *   - Service Worker ready (or timed out / not required)
     *   - Quiet period expired (triggered externally)
     */
    function finalizeAttempt(){
        if (finalized || skipped) return;
        if (loaded !== total) return;
        if (!swReady) return;
        finalized = true;

        // Snap bytes if partial
        if (bytesTotal > 0 && bytesLoaded < bytesTotal) bytesLoaded = bytesTotal;
        setTimeout(()=>{ decodePool.length = 0; }, 4000); // release warm decode references later
        updateUI();
        invokeGameReadyHooks();
    }

    /**
     * Public early exit (skips remaining work; marks everything done).
     */
    window.skipPreload = function(reason='manual'){
        if (finalized) return;
        skipped = true;

        // Ensure all manifest entries marked done
        STATIC_MANIFEST.forEach(url=>{
            if (!assets[url]){
                assets[url] = { state:'done', bytesLoaded:1, bytesTotal:1 };
                total++; loaded++;
            } else if (assets[url].state !== 'done'){
                assets[url].state='done'; loaded++;
            }
        });

        // Mark dynamically discovered ones done
        Object.keys(assets).forEach(u=>{
            if (assets[u].state !== 'done'){ assets[u].state='done'; loaded++; }
        });

        total = loaded;
        finalized = true;
        updateUI();
        invokeGameReadyHooks();
    };

    /* --------------------------------------------------------------------- *
     *  LOADERS
     * --------------------------------------------------------------------- */
    function loadImage(url){
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        img.onload = ()=>markDone(url);
        img.onerror = ()=>markDone(url);
        img.src = url;
    }

    function loadAudio(url, defer){
        const exec = ()=>{
            const a = new Audio();
            let done = false;
            const finish = ()=>{ if (!done){ done = true; markDone(url); } };
            a.preload = 'auto';
            a.addEventListener('canplaythrough', finish, { once:true });
            a.addEventListener('loadeddata', finish, { once:true });
            a.addEventListener('error', finish, { once:true });
            a.src = url;
        };
        if (defer) deferredMediaQueue.push(exec); else exec();
    }

    function loadVideo(url, defer){
        const exec = ()=>{
            const v = document.createElement('video');
            const finish = ()=>markDone(url);
            v.preload = 'auto';
            v.addEventListener('loadeddata', finish, { once:true });
            v.addEventListener('error', finish, { once:true });
            v.src = url;
        };
        if (defer) deferredMediaQueue.push(exec); else exec();
    }

    function loadFont(url){
        ensurePreloadLink(url, 'font');
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        link.href = url;
        link.onload = ()=>markDone(url);
        link.onerror = ()=>markDone(url);
        document.head.appendChild(link);
    }

    /**
     * MIME classification + dispatch to loader. Critical image detection
     * yields a preload hint to accelerate start.
     */
    function classify(url){
        if (!url) return;
        const clean = url.replace(/[#?].*$/,'');
        const isImage = /\.(png|jpe?g|gif|webp|avif|svg|bmp|ico|cur)$/i.test(clean);
        const isAudio = /\.(mp3|wav|ogg|m4a|flac)$/i.test(clean);
        const isVideo = /\.(mp4|webm|ogv)$/i.test(clean);
        const isFont  = /\.(woff2?|ttf|otf)$/i.test(clean);
        const critical = isImage && CRITICAL_IMG_REGEX.test(url);

        if (isImage) addAsset(url, loadImage, { type:'image', critical });
        else if (isAudio) addAsset(url, loadAudio, { type:'audio', defer:true });
        else if (isVideo) addAsset(url, loadVideo, { type:'video', defer:true });
        else if (isFont)  addAsset(url, loadFont,  { type:'font' });
    }

    /* --------------------------------------------------------------------- *
     *  CONSTRUCTOR WRAPPING (Image / Audio)
     *  Allows detection of assets created by game code during preload window.
     * --------------------------------------------------------------------- */
    function wrap(name, Original, type){
        if (!Original) return;
        try{
            const Wrapped = function(...args){
                const inst = new Original(...args);
                const protoDesc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(inst), 'src');
                if (protoDesc && protoDesc.set){
                    Object.defineProperty(inst, 'src', {
                        configurable:true,
                        enumerable:true,
                        get(){ return protoDesc.get.call(inst); },
                        set(v){
                            if (v) classify(v);
                            return protoDesc.set.call(inst, v);
                        }
                    });
                }
                if (type === 'image'){
                    inst.addEventListener('load', ()=>markDone(inst.currentSrc||inst.src), { once:true });
                    inst.addEventListener('error', ()=>markDone(inst.currentSrc||inst.src), { once:true });
                } else {
                    const done = ()=>markDone(inst.currentSrc||inst.src);
                    inst.addEventListener('loadeddata', done, { once:true });
                    inst.addEventListener('canplaythrough', done, { once:true });
                    inst.addEventListener('error', done, { once:true });
                }
                return inst;
            };
            Wrapped.prototype = Original.prototype;
            window[name] = Wrapped;
        }catch(_e){}
    }
    wrap('Image', window.Image, 'image');
    wrap('Audio', window.Audio, 'audio');

    /* --------------------------------------------------------------------- *
     *  CSS / DOM DISCOVERY
     * --------------------------------------------------------------------- */

    /**
     * Extract URLs from a CSS text fragment (url(...) patterns). Data URIs ignored.
     */
    function extractUrls(txt){
        if (!txt) return [];
        const out = [];
        txt.replace(/url\(\s*(['"]?)([^)"']+)\1\s*\)/g, (_m,_q,u)=>{
            if (!/^data:/i.test(u)) out.push(u);
        });
        return out;
    }

    // Early inline <style> tag scan (some rules may not yet be in styleSheets list)
    (function earlyInlineStyleScan(){
        try {
            document.querySelectorAll('style').forEach(tag=>{
                extractUrls(tag.textContent).forEach(classify);
            });
        } catch(_e){}
    })();

    function scanExistingTags(){
        document.querySelectorAll('img[src],audio[src],video[src]').forEach(el=>{
            const s = el.currentSrc || el.getAttribute('src');
            if (s) classify(s);
            if (el.tagName === 'IMG'){
                if (el.complete) markDone(s);
                else {
                    el.addEventListener('load', ()=>markDone(s), { once:true });
                    el.addEventListener('error', ()=>markDone(s), { once:true });
                }
            } else {
                const done = ()=>markDone(s);
                el.addEventListener('loadeddata', done, { once:true });
                el.addEventListener('canplaythrough', done, { once:true });
                el.addEventListener('error', done, { once:true });
            }
        });
    }

    function scanStyleSheets(){
        Array.from(document.styleSheets).forEach(ss=>{
            let rules;
            try { rules = ss.cssRules; } catch(_e){ return; }
            if (!rules) return;
            for (const r of rules){
                if (r.style && r.style.cssText) extractUrls(r.style.cssText).forEach(classify);
                if (r.constructor && /CSSFontFaceRule/i.test(r.constructor.name)){
                    const src = r.style && r.style.getPropertyValue('src');
                    extractUrls(src).forEach(classify);
                }
            }
        });
    }

    function scanComputedBackgrounds(){
        const all = Array.from(document.querySelectorAll('*'));
        let i = 0;
        (function batch(){
            const slice = all.slice(i, i + CSS_BG_SCAN_BATCH);
            slice.forEach(el=>{
                let bg;
                try { bg = getComputedStyle(el).backgroundImage; } catch(_e){ bg = null; }
                if (bg && bg !== 'none') extractUrls(bg).forEach(classify);
            });
            i += CSS_BG_SCAN_BATCH;
            if (i < all.length) requestAnimationFrame(batch);
            else scheduleQuietCheck();
        })();
    }

    /* --------------------------------------------------------------------- *
     *  MUTATION OBSERVER
     *  Catches late-inserted nodes & attribute changes (src/style).
     * --------------------------------------------------------------------- */
    const mo = new MutationObserver(muts=>{
        let found = false;
        muts.forEach(m=>{
            if (m.type === 'attributes' && m.attributeName === 'src'){
                const el = m.target;
                const s = el.currentSrc || el.getAttribute('src');
                if (s){ classify(s); found = true; }
            } else if (m.type === 'attributes' && m.attributeName === 'style'){
                extractUrls(m.target.getAttribute('style')).forEach(u=>{ classify(u); found = true; });
            } else if (m.type === 'childList'){
                m.addedNodes.forEach(n=>{
                    if (n.nodeType !== 1) return;
                    if (n.matches && n.matches('img[src],audio[src],video[src]')){
                        const s = n.currentSrc || n.getAttribute('src');
                        if (s){ classify(s); found = true; }
                    }
                    const style = n.getAttribute && n.getAttribute('style');
                    if (style){
                        extractUrls(style).forEach(u=>{ classify(u); found = true; });
                    }
                });
            }
        });
        if (found) scheduleQuietCheck();
    });

    /* --------------------------------------------------------------------- *
     *  ADAPTIVE SCHEDULER (Static Manifest Loader)
     *  Fetches assets with dynamic concurrency based on throughput samples.
     * --------------------------------------------------------------------- */
    const scheduler = {
        started:false,
        // CHANGED: dynamic optimistic initial concurrency
        concurrency: getInitialConcurrency(),
        active:0,
        queue:[],                // [{ url, priority }]
        throughputSamples:[],    // bytes/ms

        add(url, priority){
            if (assets[url]) return;
            assets[url] = { state:'pending', bytesLoaded:0, bytesTotal:0 };
            total++;
            this.queue.push({ url, priority });

            const hint = persistedSizes[url];
            if (hint && !isNaN(hint) && hint > 0){
                assets[url].bytesTotal = hint;
                bytesTotal += hint;
            } else {
                const ph = guessSize(url);
                assets[url].bytesTotal = ph;
                assets[url]._placeholder = true;
                bytesTotal += ph;
            }
        },

        rank(url){
            if (/fonts\//.test(url)) return 1;
            if (/cursors\//.test(url)) return 2;
            if (/interface\/ui\//.test(url)) return 3;
            if (/interface\/(items|armor|rings|weapons)\//.test(url)) return 4;
            if (/fp-anim\//.test(url)) return 5;
            if (/transitions\//.test(url)) return 6;
            if (/audio\//.test(url)) return MANIFEST_AUDIO_IMMEDIATE ? 10 : 100;
            return 50;
        },

        build(){ STATIC_MANIFEST.forEach(u => this.add(u, this.rank(u))); },
        sort(){ this.queue.sort((a,b)=> a.priority - b.priority); },

        adjust(){
            if (this.throughputSamples.length < 2) return;

            // Use the last few samples; median is more robust against spikes.
            const recent = this.throughputSamples.slice(-6).sort((a,b)=>a-b);
            const mid = recent[Math.floor(recent.length / 2)];
            const kbps = (mid * 1000) / 1024; // bytes/ms -> KB/s

            let target;
            if (kbps >= 1200)      target = 12;
            else if (kbps >= 900)  target = 11;
            else if (kbps >= 700)  target = 10;
            else if (kbps >= 500)  target = 9;
            else if (kbps >= 350)  target = 8;
            else if (kbps >= 250)  target = 7;
            else if (kbps >= 170)  target = 6;
            else if (kbps >= 110)  target = 5;
            else if (kbps >= 70)   target = 4;
            else if (kbps >= 40)   target = 3;
            else                   target = 2;

            // Clamp & only change if different
            if (target > MAX_CONCURRENCY) target = MAX_CONCURRENCY;

            // Prefer scaling up quickly; scaling down only if we are far off.
            const diff = target - this.concurrency;
            if (diff > 0 || (diff < 0 && Math.abs(diff) >= 2)){
                this.concurrency = target;
            }
        },

        pick(){ return this.queue.shift(); },

        pump(){
            if (!this.started || skipped || finalized) return;
            while (this.active < this.concurrency && this.queue.length){
                const job = this.pick();
                if (!job) break;
                this.fetchJob(job.url);
            }
        },

        fetchJob(url){
            if (skipped || finalized) return;
            const rec = assets[url];
            if (!rec) return;
            rec.state = 'loading';
            this.active++;
            const t0 = performance.now();

            fetch(url).then(resp=>{
                const len = parseInt(resp.headers.get('content-length') || '0', 10);

                // Update or correct placeholder totals
                if (len){
                    if (!rec.bytesTotal){
                        rec.bytesTotal = len; bytesTotal += len;
                    } else if (rec._placeholder && rec.bytesTotal !== len){
                        bytesTotal += (len - rec.bytesTotal);
                        rec.bytesTotal = len;
                        rec._placeholder = false;
                    }
                    persistedSizes[url] = rec.bytesTotal;
                }

                if (resp.body && 'getReader' in resp.body){
                    const reader = resp.body.getReader();
                    const read = ()=> reader.read().then(({done,value})=>{
                        if (done) return;
                        if (value){
                            rec.bytesLoaded += value.length;
                            bytesLoaded += value.length;
                            if (rec.bytesLoaded > rec.bytesTotal){
                                bytesTotal += (rec.bytesLoaded - rec.bytesTotal);
                                rec.bytesTotal = rec.bytesLoaded;
                                rec._placeholder = false;
                            }
                        }
                        updateUI();
                        return read();
                    });
                    return read().then(()=>resp);
                }

                // Fallback: consume entire body for correct length
                return resp.arrayBuffer().then(buf=>{
                    rec.bytesLoaded = buf.byteLength;
                    if (!rec.bytesTotal){
                        rec.bytesTotal = buf.byteLength; bytesTotal += buf.byteLength;
                    } else if (rec._placeholder && rec.bytesTotal !== buf.byteLength){
                        bytesTotal += (buf.byteLength - rec.bytesTotal);
                        rec.bytesTotal = buf.byteLength;
                        rec._placeholder = false;
                    }
                    persistedSizes[url] = rec.bytesTotal;
                    bytesLoaded += buf.byteLength;
                    updateUI();
                });
            }).catch(()=>{}).finally(()=>{
                const t1 = performance.now();
                if (rec.bytesLoaded){
                    this.throughputSamples.push(rec.bytesLoaded / (t1 - t0 + 1));
                }
                markDone(url);
                this.active--;
                this.adjust();
                this.pump();
            });
        },

        start(){
            if (this.started || skipped || finalized) return;
            this.started = true;
            this.sort();
            this.pump();
            // Extra early pump to fill any newly raised concurrency quickly.
            setTimeout(()=>this.pump(), 0);
        }
    };
    scheduler.build();

    /* --------------------------------------------------------------------- *
     *  DOM READY HOOK
     * --------------------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', ()=>{
        scanExistingTags();
        scanStyleSheets();
        scanComputedBackgrounds();
        try{
            mo.observe(document.documentElement, {
                childList:true,
                subtree:true,
                attributes:true,
                attributeFilter:['src','style']
            });
        }catch(_e){}
        scheduleQuietCheck();
        // Start deferred media after short delay
        setTimeout(()=>{
            deferredMediaQueue.splice(0).forEach(fn=>{ try{ fn(); }catch(_e){} });
        }, DEFERRED_MEDIA_DELAY_MS);
    });

    /* --------------------------------------------------------------------- *
     *  SERVICE WORKER READINESS
     * --------------------------------------------------------------------- */
    if (WAIT_FOR_SERVICE_WORKER && 'serviceWorker' in navigator){
        navigator.serviceWorker.ready
            .then(()=>{ swReady = true; scheduler.start(); finalizeAttempt(); })
            .catch(()=>{ swReady = true; scheduler.start(); finalizeAttempt(); });
        setTimeout(()=>{ if (!swReady){ swReady = true; scheduler.start(); finalizeAttempt(); } }, SW_READY_TIMEOUT_MS);
    } else {
        scheduler.start();
    }

    // Safety finalize attempt (ensures progress if quiet detection missed)
    setTimeout(scheduleQuietCheck, 1500);

    // Persist size hints before unload
    function persistSizes(){
        try { localStorage.setItem(SIZE_CACHE_KEY, JSON.stringify(persistedSizes)); }
        catch(_e){}
    }
    window.addEventListener('beforeunload', persistSizes);

    // Wrap finalize to persist immediately upon success
    const __origFinalizeAttempt = finalizeAttempt;
    finalizeAttempt = function(){
        __origFinalizeAttempt();
        if (finalized) persistSizes();
    };

    /* --------------------------------------------------------------------- *
     *  SERVICE WORKER MESSAGE HANDLERS (Cache audit & progress channel)
     * --------------------------------------------------------------------- */
    function logAuditResult(label, data){
        try{
            console.groupCollapsed('[Preloader][CacheAudit] ' + label);
            console.log(data);
            console.groupEnd();
        }catch(_e){
            console.log('[Preloader][CacheAudit]', label, data);
        }
    }

    if ('serviceWorker' in navigator){
        navigator.serviceWorker.addEventListener('message', ev=>{
            const msg = ev.data;
            if (!msg || typeof msg !== 'object') return;

            if (msg.type === 'WARM_CACHE_RESULT'){
                logAuditResult('Warm cache result', msg.summary || msg);
                return;
            }
            if (msg.type === 'CACHE_PROBE_RESULT'){
                logAuditResult('Probe', {
                    totalQueried: msg.total,
                    cached: msg.cachedCount,
                    missing: msg.missing,
                    sampleMissing: msg.missing && msg.missing.slice(0,8)
                });
                return;
            }
            if (msg.type === 'CACHE_LIST_RESULT'){
                logAuditResult('Cache contents', {
                    count: msg.urls.length,
                    urls: msg.urls.slice(0,50)
                });
                return;
            }

            // Progressive SW-driven fetch updates
            if (msg.type === 'SW_PROGRESS'){
                const rec = assets[msg.url];
                if (rec){
                    const key = msg.url.replace(location.origin+'/', './');
                    if (msg.total){
                        if (!rec.bytesTotal){
                            rec.bytesTotal = msg.total; bytesTotal += msg.total;
                        } else if (rec._placeholder && rec.bytesTotal !== msg.total){
                            bytesTotal += (msg.total - rec.bytesTotal);
                            rec.bytesTotal = msg.total;
                            rec._placeholder = false;
                        }
                        persistedSizes[key] = rec.bytesTotal;
                    }
                    if (msg.loadedDelta){
                        rec.bytesLoaded += msg.loadedDelta;
                        bytesLoaded += msg.loadedDelta;
                        if (rec.bytesLoaded > rec.bytesTotal){
                            bytesTotal += (rec.bytesLoaded - rec.bytesTotal);
                            rec.bytesTotal = rec.bytesLoaded;
                            rec._placeholder = false;
                        }
                    }
                    if (msg.done) markDone(msg.url);
                    updateUI();
                }
                return;
            }

            // Cached responses shortcut
            if (msg.type === 'SW_CACHE_HIT'){
                const rec = assets[msg.url];
                if (rec && rec.state !== 'done'){
                    const key = msg.url.replace(location.origin+'/', './');
                    if (msg.total){
                        if (!rec.bytesTotal){
                            rec.bytesTotal = msg.total; bytesTotal += msg.total;
                        } else if (rec._placeholder && rec.bytesTotal !== msg.total){
                            bytesTotal += (msg.total - rec.bytesTotal);
                            rec.bytesTotal = msg.total;
                            rec._placeholder = false;
                        }
                        persistedSizes[key] = rec.bytesTotal;
                    }
                    const add = (rec.bytesTotal - rec.bytesLoaded);
                    if (add > 0){
                        bytesLoaded += add;
                        rec.bytesLoaded = rec.bytesTotal;
                    }
                    markDone(msg.url);
                }
            }
        });
    }

    /* --------------------------------------------------------------------- *
     *  PUBLIC CACHE AUDIT API
     * --------------------------------------------------------------------- */
    function requestCacheProbe(urls){
        if (!(navigator.serviceWorker && navigator.serviceWorker.controller)) return;
        navigator.serviceWorker.controller.postMessage({
            type:'CACHE_PROBE',
            urls: urls || STATIC_MANIFEST
        });
}

    window.auditSWCache = function(urls){ requestCacheProbe(urls); };
})();