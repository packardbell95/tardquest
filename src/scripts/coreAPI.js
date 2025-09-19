/**
 * @fileoverview Core API for TardQuest API Modules
 *
 * This provides shared API utilities for all TardQuest API modules.
 *
 * Features:
 * - Global API_BASE configuration
 * - VocaGuard session management
 * - Game state monitoring and reporting
 * - API status checking
 *
 * @author VocaPepper
 */

// --- Global Configuration --------------------------------------------------

/** @const {string} Base URL for all TardQuest API endpoints */
window.API_BASE = 'https://vocapepper.com:9601';

// --- State ------------------------------------------------------------------

/** @type {string|null} Current VocaGuard anti-cheat session ID */
window.vocaguardSessionId = sessionStorage.getItem('vocaguardSessionId') || null;

/** @type {number|null} Interval ID for the VocaGuard update loop */
let vocaguardIntervalId = null;

// --- Utilities --------------------------------------------------------------

/**
 * Retrieves the current game state (floor and level)
 * @returns {Object} Game state object with floor and level properties
 * @property {number} floor - Current floor number (defaults to 1)
 * @property {number} level - Current player level (defaults to 1)
 */
function getGameState() {
    const floorNum = (typeof floor !== 'undefined' && typeof floor === 'number' && !isNaN(floor)) ? floor : 1;
    const levelNum = (typeof player !== 'undefined' && typeof player.level === 'number' && !isNaN(player.level)) ? player.level : 1;
    return { floor: floorNum, level: levelNum };
}

/**
 * Checks if the API is reachable and responding
 * @returns {Promise<boolean>} True if API is connected, false otherwise
 */
async function checkApiStatus() {
    try {
        const res = await fetch(`${window.API_BASE}/api/leaderboard/status`, { method: 'GET', mode: 'cors' });
        return res.ok;
    } catch {
        return false;
    }
}

// --- VocaGuard Session Management -------------------------------------------

/**
 * Starts a new VocaGuard anti-cheat session
 * Creates a session ID and stores it in sessionStorage
 */
function startVocaGuardSession() {
    fetch(`${window.API_BASE}/api/vocaguard/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(data => {
            window.vocaguardSessionId = data.session_id;
            sessionStorage.setItem('vocaguardSessionId', window.vocaguardSessionId);
            console.log('🛡️ VocaGuard: New session created.');
            startVocaGuard();
        })
        .catch(err => console.warn('⚠️ VocaGuard: Could not create session!', err));
}

/**
 * Starts the periodic anti-cheat monitoring system
 * Monitors game state changes and reports them to the server
 */
function startVocaGuard() {
    if (vocaguardIntervalId !== null) return; // Already running
    checkApiStatus().then(on => console[on ? 'log' : 'warn'](`🛡️ VocaGuard: Anti-Cheat is ${on ? 'ON' : 'OFF'}.`));
    let lf = (typeof floor !== 'undefined') ? floor : null;
    let ll = (typeof player !== 'undefined' && typeof player.level === 'number' && !isNaN(player.level)) ? player.level : 1;
    vocaguardIntervalId = setInterval(() => {
        const { floor: f, level: l } = getGameState();
        if (f !== lf || l !== ll) {
            lf = f; ll = l;
            fetch(`${window.API_BASE}/api/vocaguard/update`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: window.vocaguardSessionId, floor: f, level: l })
            });
        }
    }, 1000);
}

// --- Initialization ---------------------------------------------------------

// Initialize anti-cheat session on script load
if (!window.vocaguardSessionId) startVocaGuardSession(); else startVocaGuard();

// --- Public API -------------------------------------------------------------

/**
 * Core API utilities for TardQuest API Modules
 * @namespace CoreAPI
 */
window.CoreAPI = {
    /** Gets the current VocaGuard session ID */
    getSessionId: () => window.vocaguardSessionId,

    /** Gets the current game state */
    getGameState,

    /** Checks API connectivity */
    checkApiStatus,

    /** Starts a new VocaGuard session */
    startVocaGuardSession,

    /** Starts VocaGuard monitoring */
    startVocaGuard
};

console.log('⚙️ CoreAPI: Module loaded!');