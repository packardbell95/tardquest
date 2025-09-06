// Carrier Pigeon Messaging v1.1
(function(){
    const log = {
        info: (...a)=>console.log('🐦 Pigeon:',...a),
        warn: (...a)=>console.warn('🐦 Pigeon:',...a),
        error: (...a)=>console.error('🐦 Pigeon:',...a),
        debug: (...a)=>console.debug('🐦 Pigeon:',...a)
    };

    const VERSION = '1.1';
    const API_BASE = 'https://vocapepper.com:9601';
    const PLACEHOLDER_PIGEON = "Message for the next adventurer...";
    let pigeonInputMode = false;
    let pollTimer = null;
    const DELIVERY_POLL_INTERVAL_MS = 60000; // poll cadence
    const DELIVERY_MIN_INTERVAL_MS = 5000;   // min gap between forced polls
    let lastDeliveryAttempt = 0;
    const LS_PENDING_KEY = 'pigeonPendingMessage';
    // Load any pending message from storage (persist across reloads)
    let pendingDeliveredMessage = (function(){
        try { return localStorage.getItem(LS_PENDING_KEY) || null; } catch { return null; }
    })();
    if (pendingDeliveredMessage) {
        log.info('Restored pending message from localStorage.');
        // Re-surface pigeon so user can trigger reading, but don't duplicate if already placed
        if (window.pigeon && pigeon.isAlive === true) {
            pigeon.isActiveOnFloor = true;
            if (pigeon.x == null || pigeon.y == null) {
                pigeon.set();
            } else {
                log.debug('Pigeon already positioned at', pigeon.x, pigeon.y);
            }
        }
    }

    function getSessionId(){
        return sessionStorage.getItem('vocaguardSessionId');
    }

    function haveLocalPigeon(){
        try {
            return player?.inventory?.hasEntry('items','carrierPigeon');
        } catch { return false; }
    }

    function openPigeonInput(){
        log.debug('Attempt open compose. LocalHas?', haveLocalPigeon());
        if (!haveLocalPigeon()) {
            updateBattleLog('<span class="enemy">You have no carrier pigeon.</span>');
            log.warn('Blocked open: no local pigeon item');
            return;
        }
        const sid = getSessionId();
        if (!sid) {
            updateBattleLog('<span class="enemy">No active VocaGuard session.</span>');
            log.warn('Blocked open: missing session id');
            return;
        }
        pigeonInputMode = true;
        GameControl.openPersuasionInputBox();
        const inp = document.getElementById('persuadeInput');
        if (inp) inp.placeholder = PLACEHOLDER_PIGEON;
        log.info('Compose opened');
    }

    async function sendPigeon(message){
        log.debug('Send attempt len=%d', message?.length||0);
        const sid = getSessionId();
        if (!sid) {
            updateBattleLog('<span class="enemy">Cannot send: No active VocaGuard session.</span>');
            log.warn('Send aborted: no session id');
            return false;
        }
        try {
            const r = await fetch(`${API_BASE}/api/pigeon/send`, {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ session_id: sid, message })
            });
            const j = await r.json().catch(()=> ({}));
            if (r.ok && j.stored) {
                if (player?.inventory && typeof player.inventory.deductItem === "function") {
                    player.inventory.deductItem('carrierPigeon', 1);
                }
                if (typeof InventorySidebar?.refresh === 'function') {
                    InventorySidebar.refresh('items');
                }
                pigeon.say("Your message has been sent! Coo coo!");
                log.info('Sent successfully!', j.id || 'Queue:', j.queue_length, 'Remaining carrierPigeon:', j.carrierPigeon_remaining);
                if (typeof GameControl?.closePersuasionInputBox === "function") {
                    GameControl.closePersuasionInputBox();
                    render();
                }
                return true;
            } else {
                updateBattleLog(`<span class="enemy">Pigeon failed: ${j.error||'Unknown error'}</span>`);
                log.warn('Send failed!', r.status, j);
                return false;
            }
        } catch (e){
            updateBattleLog('<span class="enemy">Network error sending pigeon.</span>');
            log.error('Network error sending pigeon', e);
            return false;
        }
    }

    function stopPolling() {
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
            log.debug('Delivery polling stopped');
        }
    }

    function ensurePolling(){
        if (pollTimer || pendingDeliveredMessage) return; // Don't poll if a message is pending
        pollTimer = setInterval(()=>{
            if (isTitleScreenActive() || pendingDeliveredMessage) return;
            requestDeliveryOnce();
        }, DELIVERY_POLL_INTERVAL_MS);
        setTimeout(()=>{
            if (!isTitleScreenActive() && !pendingDeliveredMessage) requestDeliveryOnce(true);
        }, 1500);
        log.debug('Delivery polling started');
    }

    // Delivery display
    function displayDeliveredMessage(msg){
        if (!msg && pendingDeliveredMessage) {
            msg = pendingDeliveredMessage;
        }
        if (!msg) {
            if (typeof updateBattleLog === 'function') {
                log.debug('No message to display');
                ensurePolling();
            }
            return;
        }
        // Clear persisted state first (prevents duplicates if user reloads mid-display)
        pendingDeliveredMessage = null;
        try { localStorage.removeItem(LS_PENDING_KEY); } catch {}
        function show(){
            if (typeof updateBattleLog === 'function') {
                pigeon.say(`The message says: "${msg}" Message delivered! Coo coo!`);
                ensurePolling();
            } else {
                setTimeout(show, 250);
            }
        }
        show();
    }

    async function requestDeliveryOnce(force=false){
        const now = Date.now();
        if (!force && now - lastDeliveryAttempt < DELIVERY_MIN_INTERVAL_MS) return;
        if (pendingDeliveredMessage) return; // Don't fetch new if one is pending
        const sid = getSessionId();
        if (!sid) return;
        lastDeliveryAttempt = now;
        try {
            const r = await fetch(`${API_BASE}/api/pigeon/delivery`, {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ session_id: sid })
            });
            const data = await r.json().catch(()=>({}));
            if (data && data.pigeon_message) {
                log.info('Received Message ID:', data.pigeon_id || 'n/a');
                stopPolling(); // Pause polling until message is displayed
                pendingDeliveredMessage = data.pigeon_message;
                try { localStorage.setItem(LS_PENDING_KEY, pendingDeliveredMessage); } catch {}
                if (pigeon && pigeon.isAlive === true) {
                    pigeon.isActiveOnFloor = true;
                    // Only place if not already on the map (prevents second static spawn)
                    if (pigeon.x == null || pigeon.y == null) {
                        pigeon.set();
                    } else {
                        log.debug('Pigeon already active at', pigeon.x, pigeon.y, '- skipping new spawn');
                    }
                }
            }
        } catch (e){
            log.debug('Delivery request failed', e);
        }
    }

    function isTitleScreenActive(){
        const el = document.getElementById('titleScreen');
        if (!el) return false; // removed already
        // Consider active if visible (no display:none and still in DOM)
        const style = window.getComputedStyle(el);
        return style && style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
    }

    function armPollingGate(){
        // If title screen already gone, start now
        if (!isTitleScreenActive()) { ensurePolling(); return; }
        // Patch hideTitleScreen if present to trigger polling after close
        const existing = window.hideTitleScreen;
        if (typeof existing === 'function' && !existing.__pigeonPatched){
            window.hideTitleScreen = function patchedHideTitleScreen(...args){
                const r = existing.apply(this, args);
                // Defer a tick to let DOM update
                setTimeout(()=>ensurePolling(), 50);
                return r;
            };
            window.hideTitleScreen.__pigeonPatched = true;
        }
        const chk = setInterval(()=>{
            if (!isTitleScreenActive()) { clearInterval(chk); ensurePolling(); }
        }, 1000);
    }

    // Defer polling until title screen closes
    armPollingGate();

    // Public API
    window.PigeonMessaging = {
        open: openPigeonInput,
        send: sendPigeon,
        pollNow: ()=>requestDeliveryOnce(true),
        isActive: () => pigeonInputMode,
        debug: { haveLocalPigeon, getSessionId, version: VERSION },
        displayDeliveredMessage,
        get pendingDeliveredMessage() { return pendingDeliveredMessage; },
        hasPendingMessages: () => !!pendingDeliveredMessage
    };
    log.info('Module loaded; autonomous delivery polling active.');
})();