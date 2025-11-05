/**
 * @fileoverview Carrier Pigeon Messaging System for TardQuest
 * 
 * This module implements a messaging system that allows players to send and receive
 * messages using virtual carrier pigeons. Messages are sent to a remote API and
 * delivered asynchronously. The system includes:
 * 
 * - Message composition and sending
 * - Automatic polling for incoming messages
 * - LocalStorage persistence for pending messages
 * - Session-based authentication via VocaGuard
 * 
 */

(function(){
    /**
     * Logging utility for better console identification
     * @type {Object}
     */
    const log = {
        info: (...a)=>console.log('🐦 Pigeon:',...a),
        warn: (...a)=>console.warn('🐦 Pigeon:',...a),
        error: (...a)=>console.error('🐦 Pigeon:',...a),
        debug: (...a)=>console.debug('🐦 Pigeon:',...a)
    };

    /** @const {string} Current version of the messaging system */
    const VERSION = '1.1';
    
    /** @const {string} Base URL for the pigeon messaging API */
    const API_BASE = 'https://vocapepper.com:9601';
    
    /** @const {string} Placeholder text for the message input field */
    const PLACEHOLDER_PIGEON = "Message for the next adventurer...";
    
    /** @type {boolean} Flag indicating if the pigeon input mode is active */
    let pigeonInputMode = false;
    
    /** @type {number|null} Timer ID for the delivery polling interval */
    let pollTimer = null;
    
    /** @const {number} Interval in milliseconds between automatic delivery polls */
    const DELIVERY_POLL_INTERVAL_MS = 60000; // poll cadence
    
    /** @const {number} Minimum interval in milliseconds between forced delivery polls */
    const DELIVERY_MIN_INTERVAL_MS = 5000;   // min gap between forced polls
    
    /** @type {number} Timestamp of the last delivery attempt */
    let lastDeliveryAttempt = 0;
    
    /** @const {string} Local storage key for pending delivered messages */
    const LS_PENDING_KEY = 'pigeonPendingMessage';
    
    /** @type {HTMLInputElement|null} Reference to the persuasion input element */
    const inp = document.getElementById('persuadeInput');
    
    /**
     * Pending delivered message loaded from localStorage
     * Persists across page reloads to ensure messages aren't lost
     * @type {string|null}
     */
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

    /**
     * Retrieves the current VocaGuard session ID from sessionStorage
     * @returns {string|null} The session ID or null if not found
     */
    function getSessionId(){
        return sessionStorage.getItem('vocaguardSessionId');
    }

    /**
     * Checks if the player has a carrier pigeon item in their inventory
     * @returns {boolean} True if the player has a carrier pigeon, false otherwise
     */
    function haveLocalPigeon(){
        try {
            return player?.inventory?.hasEntry('items','carrierPigeon');
        } catch { return false; }
    }

    /**
     * Opens the pigeon message composition interface
     * Checks for required conditions (pigeon item, active session) before opening
     */
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
        if (inp) inp.placeholder = PLACEHOLDER_PIGEON;
        log.info('Compose opened');
    }

    /**
     * Sends a message via the carrier pigeon API
     * @param {string} message - The message to send
     * @returns {Promise<boolean>} True if sent successfully, false otherwise
     */
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
                log.info('Sent successfully!', j.id || 'Queue:', j.queue_length_pending, 'Remaining carrierPigeon:', j.carrierPigeon_remaining);
                if (typeof GameControl?.closePersuasionInputBox === "function") {
                    pigeonInputMode = false;
                    if (inp) inp.placeholder = "Say your piece...";
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

    /**
     * Stops the automatic delivery polling
     */
    function stopPolling() {
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
            log.debug('Delivery polling stopped');
        }
    }

    /**
     * Ensures that delivery polling is active
     * Starts polling if not already running and no pending message exists
     */
    function ensurePolling(){
        if (pollTimer || pendingDeliveredMessage) return; // Don't poll if a message is pending
        pollTimer = setInterval(()=>{
            if (pendingDeliveredMessage) return;
            requestDeliveryOnce();
        }, DELIVERY_POLL_INTERVAL_MS);
        setTimeout(()=>{
            if (!pendingDeliveredMessage) requestDeliveryOnce(true);
        }, 1500);
        log.debug('Delivery polling started');
    }

    /**
     * Displays a delivered message to the player
     * @param {string} [msg] - The message to display (uses pending message if not provided)
     */
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
            } else {
                setTimeout(show, 250);
            }
        }
        show();
    }

    /**
     * Requests delivery of any pending messages from the API
     * @param {boolean} [force=false] - Whether to force the request regardless of timing
     */
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
                if (pigeon) {
                    pigeon.isActiveOnFloor = true;
                    // Only place if not already on the map
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

    /**
     * Public API for the Carrier Pigeon Messaging System
     * @namespace PigeonMessaging
     */
    window.PigeonMessaging = {
        /** Opens the message composition interface */
        open: openPigeonInput,
        
        /** Sends a message via carrier pigeon */
        send: sendPigeon,
        
        /** Forces an immediate delivery check */
        pollNow: ()=>requestDeliveryOnce(true),
        
        /** Checks if the input mode is currently active */
        isActive: () => pigeonInputMode,
        
        /** Debug utilities and information */
        debug: { haveLocalPigeon, getSessionId, version: VERSION },
        
        /** Displays a delivered message */
        displayDeliveredMessage,
        
        /** Gets the current pending delivered message */
        get pendingDeliveredMessage() { return pendingDeliveredMessage; },
        
        /** Checks if there are any pending messages */
        hasPendingMessages: () => !!pendingDeliveredMessage,
        
        /** Ensures delivery polling is active */
        ensurePolling
    };
    log.info('Module loaded; autonomous delivery polling active.');
})();