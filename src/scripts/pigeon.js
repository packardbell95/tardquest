/**
 * @fileoverview Carrier Pigeon Messaging System for TardQuest
 *
 * This module implements a messaging system that allows players to send and
 * receive messages using virtual carrier pigeons. Messages are sent to a remote
 * API and delivered asynchronously.
 *
 * The system includes:
 * - Message composition and sending
 * - Automatic polling for incoming messages
 * - LocalStorage persistence for pending messages
 * - Session-based authentication via TardAPI
 *
 * Dependencies:
 * - tardAPI.js (for session management and API access)
 */

(function() {
    /**
     * Logging utility for better console identification
     * @type {Object}
     */
    const log = {
        info: (...a) => console.log("🐦 Pigeon:", ...a),
        warn: (...a) => console.warn("🐦 Pigeon:", ...a),
        error: (...a) => console.error("🐦 Pigeon:", ...a),
        debug: (...a) => console.debug("🐦 Pigeon:", ...a)
    };

    /** @const {string} Current version of the messaging system */
    const VERSION = "2.0";

    // Ensure TardAPI is loaded
    if (typeof TardAPI === "undefined") {
        log.error(
            "TardAPI module is required! Load tardAPI.js before pigeon.js"
        );
        return;
    }
    /** @const {string} Placeholder text for the message input field */
    const PLACEHOLDER_PIGEON = "Message for the next adventurer...";

    /** @type {boolean} Flag indicating if the pigeon input mode is active */
    let pigeonInputMode = false;

    /** @type {number|null} Timer ID for the delivery polling interval */
    let pollTimer = null;

    /** @const {number} Interval in milliseconds between automatic delivery
     *                  polls */
    const DELIVERY_POLL_INTERVAL_MS = 60000; // poll cadence

    /** @const {number} Minimum interval in milliseconds between forced delivery
     *                  polls */
    const DELIVERY_MIN_INTERVAL_MS = 5000;   // min gap between forced polls

    /** @type {number} Timestamp of the last delivery attempt */
    let lastDeliveryAttempt = 0;

    /** @const {string} Local storage key for pending delivered messages */
    const LS_PENDING_KEY = "pigeonPendingMessage";

    /**
     * Pending delivered message loaded from localStorage
     * Persists across page reloads to ensure messages aren't lost
     * @type {string|null}
     */
    let pendingDeliveredMessage = (function() {
        try {
            return localStorage.getItem(LS_PENDING_KEY) || null;
        } catch {
            return null;
        }
    })();

    if (pendingDeliveredMessage) {
        log.info("Restored pending message from localStorage.");
        // Re-surface pigeon so user can trigger reading, but don't duplicate if
        // already placed

        placePigeon();
    }

    // @TODO Move this outside of pigeon.js since this file should only be
    //       responsible for handling API data and not for interfacing directly
    //       with the game
    function placePigeon() {
        if (! pendingDeliveredMessage) {
            log.warn("Not placing pigeon because there is no message");
            return;
        }

        const trimmedMessage =
            typeof pendingDeliveredMessage === "string" &&
            pendingDeliveredMessage.trim();

        if (! trimmedMessage) {
            log.warn(
                "Message must be a non-empty string",
                { pendingDeliveredMessage }
            );
            return;
        }

        if (typeof MAP === "undefined") {
            log.warn("Cannot place pigeon: MAP is not available");
            return;
        }

        if (MAP.entities.some(e => e.type === "pigeon")) {
            log.warn("A pigeon is already on the map");
            return;
        }

        const exit = MAP.entities.find(e => e.type === "exit");
        if (! exit) {
            log.error("The map has no exit", { MAP });
            return;
        }

        const pigeon = MapEntityFeatureFactory.pigeon();
        pigeon.message = pendingDeliveredMessage;
        pendingDeliveredMessage = null;

        MAP.addEntity(pigeon, exit.x, exit.y);
    }

    /**
     * Retrieves the current VocaGuard session ID from TardAPI
     * @returns {string|null} The session ID or null if not found
     */
    function getSessionId() {
        return TardAPI.sessionId || sessionStorage.getItem("tardquestSID");
    }

    /**
     * Checks if the player has a carrier pigeon item in their inventory
     * @returns {boolean} True if the player has a carrier pigeon
     */
    function haveLocalPigeon() {
        return (playerEntity.inventory.contents.items.carrierPigeon || 0) > 0;
    }

    /**
     * Sends a message via the carrier pigeon API
     * @param {string} message - The message to send
     * @returns {Promise<boolean>} True if sent successfully
     */
    async function sendPigeon(message) {
        // log.debug("Sending...");
        const sid = getSessionId();
        if (! sid) {
            updateBattleLog(
                `<span class="enemy">Cannot send: No active session. ` +
                `Start a new game first.</span>`
            );
            log.warn("Send aborted: no session id");
            return false;
        }
        try {
            const r = await fetch(`${TardAPI.API_BASE}/pigeon/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ session_id: sid, message })
            });
            const j = await r.json().catch(() => ({}));
            if (r.ok && j.stored) {
                log.info(
                    "Sent successfully!",
                    j.id || "Queue:",
                    j.queue_length_pending
                );

                return true;
            } else {
                if (TardAPI.isSessionInvalidError(j.error)) {
                    log.warn(
                        "Session invalid during send, clearing stale session"
                    );
                    TardAPI.clearSession();
                }
                updateBattleLog(
                    `<span class="enemy">Pigeon failed: ` +
                    `${j.error || "Unknown error"}</span>`
                );
                log.warn("Send failed!", r.status, j);
                return false;
            }

            updateBattleLog(
                `<span class="enemy">Pigeon failed:</span> ` +
                `${j.error || `${r.status}: ${r.statusText}`}`
            );
            log.warn("Send failed!", r.status, j);
            return false;
        } catch (e) {
            updateBattleLog(
                `<span class="enemy">Network error sending pigeon.</span>`
            );
            log.error("Network error sending pigeon", e);
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
            // log.debug("Delivery polling stopped");
        }
    }

    /**
     * Ensures that delivery polling is active
     * Starts polling if not already running and no pending message exists
     */
    function ensurePolling() {
        if (pollTimer || pendingDeliveredMessage) {
            return; // Don't poll if a message is pending
        }
        pollTimer = setInterval(() => {
            if (pendingDeliveredMessage) {
                return;
            }
            requestDeliveryOnce();
        }, DELIVERY_POLL_INTERVAL_MS);
        setTimeout(() => {
            if (! pendingDeliveredMessage) {
                requestDeliveryOnce(true);
            }
        }, 1500);
        // log.debug("Delivery polling started");
    }

    function reportMurder() {
        const sid = getSessionId();
        if (! sid) {
            log.warn("Murder report aborted: missing session id");
            return Promise.resolve(false);
        }

        return fetch(`${TardAPI.API_BASE}/pigeon/murder`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ SID: sid, session_id: sid })
        })
        .then(r => r.json().catch(() => ({})).then(j => ({ ok: r.ok, j })))
        .then(({ ok, j }) => {
            if (! ok) {
                if (TardAPI.isSessionInvalidError(j.error)) {
                    log.warn(
                        "Session invalid during murder report, clearing " +
                        "stale session"
                    );
                    TardAPI.clearSession();
                }
                log.warn("Murder report failed", j);
                return false;
            }
            log.info("Murder reported");
            return true;
        })
        .catch(e => {
            log.error("Murder report network error", e);
            return false;
        });
    }

    /**
     * Requests delivery of any pending messages from the API
     * @param {boolean} [force=false] - Whether to force the request regardless
     *                                  of timing
     */
    async function requestDeliveryOnce(force = false) {
        const now = Date.now();
        if (! force && now - lastDeliveryAttempt < DELIVERY_MIN_INTERVAL_MS) {
            return;
        }

        if (pendingDeliveredMessage) {
            return; // Don't fetch new if one is pending
        }

        const sid = getSessionId();
        if (! sid) {
            return;
        }

        lastDeliveryAttempt = now;
        try {
            const r = await fetch(`${TardAPI.API_BASE}/pigeon/delivery`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ session_id: sid })
            });

            const data = await r.json().catch(() => ({}));

            if (TardAPI.isSessionInvalidError(data.error)) {
                // Don't clear the session here — pigeon delivery is background
                // polling and the session may still be valid for other
                // endpoints. The main updateProgress/submitScore flows will
                // handle stale-session cleanup.
                log.warn(
                    "Delivery failed (session not found on server) — " +
                    "will retry later"
                );
                return;
            }

            if (data && data.pigeon_message) {
                log.info("Received Message ID:", data.pigeon_id || "n/a");
                stopPolling(); // Pause polling until message is displayed
                pendingDeliveredMessage = data.pigeon_message;
                try {
                    localStorage.setItem(
                        LS_PENDING_KEY,
                        pendingDeliveredMessage
                    );
                } catch {}; // @TODO Log or handle the error

                placePigeon();
            }
        } catch (e) {
            // log.debug("Delivery request failed", e);
        }
    }

    /**
     * Public API for the Carrier Pigeon Messaging System
     * @namespace PigeonMessaging
     */
    window.PigeonMessaging = {
        /** Sends a message via carrier pigeon */
        send: sendPigeon,

        /** Forces an immediate delivery check */
        pollNow: () => requestDeliveryOnce(true),

        /** Checks if the input mode is currently active */
        isActive: () => pigeonInputMode,

        /** Debug utilities and information */
        debug: { haveLocalPigeon, getSessionId, version: VERSION },

        /** Gets the current pending delivered message */
        get pendingDeliveredMessage() {
            return pendingDeliveredMessage;
        },

        /** Checks if there are any pending messages */
        hasPendingMessages: () => !! pendingDeliveredMessage,

        /** Ensures delivery polling is active */
        ensurePolling,

        /** Reports a pigeon murder */
        reportMurder,
    };
})();

// Module initialization complete
if (typeof console !== "undefined") {
    console.log("🐦 Pigeon: Module loaded!");
}
