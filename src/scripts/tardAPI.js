/**
 * @fileoverview TardAPI - Centralized Session Management for TardQuest
 * 
 * This module provides a unified API client for the TardQuest backend services.
 * It handles:
 * 
 * - Session creation and management with version validation
 * - Proof-of-Work (PoW) challenges for anti-cheat
 * - Game progress updates with anti-cheat validation
 * - Session persistence and state management
 * - Global API configuration
 * 
 * All other game modules (tardboard.js, pigeon.js) depend on this for API access.
 */

/**
 * TardAPI Singleton
 * @type {Object}
 */
const TardAPI = (function() {
    'use strict';

    // --- Configuration ---

    /** @const {string} Base URL for all API endpoints */
    const API_BASE = 'https://vocapepper.com:9601';

    /** @const {string} Client API version (major.minor must match server) */
    const CLIENT_API_VERSION = '3.0.251113';

    /** @const {string} LocalStorage key for session ID persistence */
    const LS_SESSION_KEY = 'tardquestSID';

    /** @const {string} LocalStorage key for PoW challenge data */
    const LS_CHALLENGE_KEY = 'vocaguardChallengeData';

    // --- Logging Utility ---

    const log = {
        info: (...args) => console.log('🌎 TardAPI:', ...args),
        warn: (...args) => console.warn('🌎 TardAPI:', ...args),
        error: (...args) => console.error('🌎 TardAPI:', ...args),
        debug: (...args) => console.debug('🌎 TardAPI:', ...args)
    };

    // --- State Management ---

    /** @type {string|null} Current session ID */
    let sessionId = sessionStorage.getItem(LS_SESSION_KEY) || null;

    /** @type {Object|null} Current PoW challenge data */
    let challengeData = null;

    /** @type {number} Last known floor for change detection */
    let lastFloor = 1;

    /** @type {number} Last known level for change detection */
    let lastLevel = 1;

    /** @type {boolean} Whether an update is currently in flight */
    let updateInFlight = false;

    // Load challenge data from storage if it exists
    try {
        const stored = sessionStorage.getItem(LS_CHALLENGE_KEY);
        if (stored) {
            challengeData = JSON.parse(stored);
            // log.debug('Loaded challenge data from storage');
        }
    } catch (e) {
        log.warn('Failed to load challenge data from storage:', e);
    }

    // --- Utility Functions ---

    /**
     * Retrieves current game state (floor, level, and total experience)
     * @returns {Object} Game state with floor, level, and totalExp properties
     */
    function getGameState() {
        const floorNum = (typeof floor !== 'undefined' && typeof floor === 'number' && !isNaN(floor)) ? floor : 1;
        const levelNum = (typeof player !== 'undefined' && typeof player.level === 'number' && !isNaN(player.level)) ? player.level : 1;
        const totalExpNum = (typeof player !== 'undefined' && typeof player.totalExp === 'number' && !isNaN(player.totalExp)) ? player.totalExp : 0;
        return { floor: floorNum, level: levelNum, totalExp: totalExpNum };
    }

    /**
     * Computes SHA256 hash using SubtleCrypto API
     * @param {string} text - Text to hash
     * @returns {Promise<string>} Hex-encoded SHA256 hash
     */
    async function computeSHA256(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Computes PoW proof for challenge submission
     * Formula: SHA256(challenge_secret + session_id)
     * @param {string} secret - Challenge secret from server
     * @param {string} sid - Session ID
     * @returns {Promise<string>} Challenge proof
     */
    async function computePoWProof(secret, sid) {
        return computeSHA256(secret + sid);
    }

    /**
     * Checks if the API server is reachable
     * @returns {Promise<boolean>} True if API is accessible
     */
    async function checkApiStatus() {
        try {
            const res = await fetch(`${API_BASE}/api/status`, { method: 'GET', mode: 'cors' });
            return res.ok;
        } catch {
            return false;
        }
    }

    // --- Session Management ---

    /**
     * Creates a new session with the API server
     * Initiates PoW challenge if enabled on server
     * @returns {Promise<Object>} Session creation result with session_id and optionally challenge data
     */
    async function createSession() {
        // Check if we already have an active session
        if (sessionId) {
            // log.debug('Session already active:', sessionId);
            return {
                success: true,
                session_id: sessionId,
                challenge_id: challengeData?.challenge_id || null,
                server_version: null
            };
        }

        try {
            log.info('Creating new session...');
            const res = await fetch(`${API_BASE}/api/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ version: CLIENT_API_VERSION })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }

            const data = await res.json();

            // Validate response contains required fields
            if (!data.session_id) {
                throw new Error('Server did not return session_id');
            }

            // Store session ID
            sessionId = data.session_id;
            sessionStorage.setItem(LS_SESSION_KEY, sessionId);
            log.info('Session created:', sessionId);

            // Store PoW challenge if provided
            if (data.challenge_id && data.challenge_secret) {
                challengeData = {
                    challenge_id: data.challenge_id,
                    challenge_secret: data.challenge_secret
                };
                sessionStorage.setItem(LS_CHALLENGE_KEY, JSON.stringify(challengeData));
                log.info('PoW challenge received');
            }

            // Reset game state tracking
            const state = getGameState();
            lastFloor = state.floor;
            lastLevel = state.level;

            return {
                success: true,
                session_id: sessionId,
                challenge_id: data.challenge_id || null,
                server_version: data.server_version || null
            };
        } catch (err) {
            log.error('Session creation failed:', err.message);
            return {
                success: false,
                error: err.message
            };
        }
    }

    /**
     * Validates current session with the API
     * Returns the session data if valid
     * @returns {Promise<Object>} Validation result with session status
     */
    async function validateSession() {
        if (!sessionId) {
            return { success: false, error: 'No active session' };
        }

        try {
            const { floor, level } = getGameState();
            const res = await fetch(`${API_BASE}/api/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, floor, level })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                return { success: false, error: data.error || `HTTP ${res.status}` };
            }

            const data = await res.json();
            return { success: true, data };
        } catch (err) {
            log.error('Session validation failed:', err.message);
            return { success: false, error: err.message };
        }
    }

    /**
     * Updates game progress on the server
     * Automatically starts a session if none exists
     * @returns {Promise<Object>} Update result
     */
    async function updateProgress() {
        if (updateInFlight) {
            // log.debug('Update already in flight, skipping');
            return { success: false, error: 'Update in flight' };
        }

        const { floor, level, totalExp } = getGameState();

        // Skip if state hasn't changed
        if (floor === lastFloor && level === lastLevel) {
            return { success: true, skipped: true };
        }

        try {
            updateInFlight = true;

            // Create session if needed
            if (!sessionId) {
                // log.debug('No session, creating one...');
                const createResult = await createSession();
                if (!createResult.success) {
                    return createResult;
                }
            }

            // Update server
            const res = await fetch(`${API_BASE}/api/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, floor, level, exp: totalExp })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }

            const data = await res.json();

            // Update local tracking
            lastFloor = floor;
            lastLevel = level;

            // log.debug('Progress updated: floor', floor, 'level', level);

            return { success: true, data };
        } catch (err) {
            log.error('Progress update failed:', err.message);
            return { success: false, error: err.message };
        } finally {
            updateInFlight = false;
        }
    }

    /**
     * Submits a leaderboard score with optional PoW validation
     * @param {string} name - Player name (max 5 characters)
     * @param {Object} options - Additional submission options
     * @param {string} [options.captcha_token] - Captcha token for verification
     * @returns {Promise<Object>} Submission result
     */
    async function submitScore(name, options = {}) {
        if (!sessionId) {
            return { success: false, error: 'No active session' };
        }

        try {
            const { floor, level } = getGameState();
            const body = {
                session_id: sessionId,
                name,
                floor,
                level
            };

            // Add PoW proof if challenge exists
            if (challengeData) {
                const proof = await computePoWProof(
                    challengeData.challenge_secret,
                    sessionId
                );
                body.challenge_id = challengeData.challenge_id;
                body.challenge_proof = proof;
            }

            // Add captcha token if provided
            if (options.captcha_token) {
                body.captcha_token = options.captcha_token;
            }

            const res = await fetch(`${API_BASE}/api/leaderboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                return { success: false, error: data.error || `HTTP ${res.status}` };
            }

            const data = await res.json();

            // Clear challenge after successful submission (single-use)
            challengeData = null;
            sessionStorage.removeItem(LS_CHALLENGE_KEY);

            log.info('Score submitted successfully');
            return { success: true, data };
        } catch (err) {
            log.error('Score submission failed:', err.message);
            return { success: false, error: err.message };
        }
    }

    /**
     * Gets the leaderboard from the server
     * @param {Object} options - Query options
     * @param {number} [options.limit] - Number of entries to retrieve
     * @returns {Promise<Object>} Leaderboard data
     */
    async function getLeaderboard(options = {}) {
        try {
            const params = new URLSearchParams();
            if (options.limit) params.append('limit', options.limit);

            const url = params.toString()
                ? `${API_BASE}/api/leaderboard?${params.toString()}`
                : `${API_BASE}/api/leaderboard`;

            const res = await fetch(url, { method: 'GET', mode: 'cors' });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                return { success: false, error: data.error || `HTTP ${res.status}` };
            }

            const data = await res.json();
            return { success: true, leaderboard: data.leaderboard || [] };
        } catch (err) {
            log.error('Leaderboard fetch failed:', err.message);
            return { success: false, error: err.message };
        }
    }

    // --- Session Persistence ---

    /**
     * Loads session from storage if it exists
     * @returns {boolean} True if session was loaded
     */
    function loadSessionFromStorage() {
        const stored = sessionStorage.getItem(LS_SESSION_KEY);
        if (stored) {
            sessionId = stored;
            log.info('Session loaded from storage:', sessionId);
            return true;
        }
        return false;
    }

    /**
     * Clears all session data from storage and memory
     */
    function clearSession() {
        sessionId = null;
        challengeData = null;
        lastFloor = 1;
        lastLevel = 1;
        sessionStorage.removeItem(LS_SESSION_KEY);
        sessionStorage.removeItem(LS_CHALLENGE_KEY);
        log.info('Session cleared');
    }

    // --- Public API ---

    return {
        // Configuration
        API_BASE,
        CLIENT_API_VERSION,

        // Session management
        createSession,
        validateSession,
        updateProgress,
        submitScore,
        getLeaderboard,
        loadSessionFromStorage,
        clearSession,

        // Utilities
        checkApiStatus,
        getGameState,
        computeSHA256,
        computePoWProof,

        // State getters
        get sessionId() { return sessionId; },
        get hasActiveSession() { return !!sessionId; },
        get hasChallenge() { return !!challengeData; },
        get challenge() { return challengeData; },

        // Debug
        debug: {
            getSessionId: () => sessionId,
            getChallengeData: () => challengeData,
            getGameState
        }
    };
})();

// Module initialization complete
if (typeof console !== 'undefined') {
    console.log('🌎 TardAPI: Module loaded!');
}
