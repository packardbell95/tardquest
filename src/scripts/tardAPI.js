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
    const API_BASE = 'https://gateway.tardquest.online';

    /** @const {string} Client API version (major.minor must match server) */
    const CLIENT_API_VERSION = '4.0.2606';

    /** @const {string} LocalStorage key for session ID persistence */
    const LS_SESSION_KEY = 'tardquestSID';

    /** @const {string} LocalStorage key for PoW challenge data */
    const LS_CHALLENGE_KEY = 'vocaguardChallengeData';

    /** @const {string} LocalStorage key for API feature toggle */
    const LS_API_FEATURES_KEY = 'tardquestApiFeaturesEnabled';

    /** @const {string} LocalStorage key for authenticated account username */
    const LS_ACCOUNT_KEY = 'tardquestAccountUser';

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

    /** @type {string|null} Authenticated account username (null for guest sessions) */
    let authUsername = (function() {
        try { return localStorage.getItem(LS_ACCOUNT_KEY) || null; } catch { return null; }
    })();

    /** @type {Object|null} Current PoW challenge data */
    let challengeData = null;

    /** @type {number} Last known floor for change detection */
    let lastFloor = 1;

    /** @type {number} Last known level for change detection */
    let lastLevel = 1;

    /** @type {boolean} Whether an update is currently in flight */
    let updateInFlight = false;

    /** @const {number} Maximum number of session creation attempts */
    const MAX_SESSION_ATTEMPTS = 3;

    /** @const {number} Milliseconds to wait before giving up on API (30 seconds) */
    const API_TIMEOUT_MS = 30000;

    /** @type {number} Number of failed session creation attempts */
    let sessionAttempts = 0;

    /** @type {number} Timestamp of first session attempt */
    let firstSessionAttemptTime = null;

    /** @type {boolean} Whether API has failed permanently */
    let apiFailedPermanently = false;

    /** @type {boolean} Global API feature kill switch */
    let apiFeaturesEnabled = (function() {
        try {
            return localStorage.getItem(LS_API_FEATURES_KEY) !== 'false';
        } catch {
            return true;
        }
    })();

    function getApiDisabledResult() {
        return { success: false, error: 'API features disabled' };
    }

    function setApiFeaturesEnabled(enabled) {
        apiFeaturesEnabled = !!enabled;

        try {
            localStorage.setItem(
                LS_API_FEATURES_KEY,
                apiFeaturesEnabled ? 'true' : 'false'
            );
        } catch {
            // Ignore storage failures (private mode, blocked storage, etc.)
        }

        if (!apiFeaturesEnabled) {
            clearSession();
            apiFailedPermanently = false;
            sessionAttempts = 0;
            firstSessionAttemptTime = null;
            updateInFlight = false;
            return;
        }

        // Reset failure/attempt state when re-enabled.
        apiFailedPermanently = false;
        sessionAttempts = 0;
        firstSessionAttemptTime = null;
    }

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
     * Computes PoW proof by finding a nonce whose hash satisfies
     * leading-zero difficulty.
     * Formula: SHA256(`${sid}:${challenge_id}:${challenge_salt}:${nonce}`)
     * Output format: nonce:hash
     *
     * @param {Object} challenge - Challenge object
     * @param {string} challenge.challenge_id - Challenge identifier
     * @param {string} challenge.challenge_salt - Challenge salt
     * @param {number} challenge.challenge_difficulty - Leading-zero hex difficulty
     * @param {string} sid - Session ID
     * @param {Object} [options] - Mining options
     * @param {number} [options.maxAttempts=200000] - Attempt ceiling before fallback/fail
     * @param {number} [options.yieldEvery=250] - Event-loop yield cadence
     * @returns {Promise<string>} Modern proof in nonce:hash format
     */
    async function computeModernPoWProof(challenge, sid, options = {}) {
        const challengeId = String(challenge?.challenge_id || '');
        const challengeSalt = String(challenge?.challenge_salt || '');
        const difficultyRaw = Number(challenge?.challenge_difficulty ?? 4);
        const difficulty = Math.max(1, Math.min(8, Number.isFinite(difficultyRaw) ? Math.floor(difficultyRaw) : 4));

        if (!challengeId || !challengeSalt || !sid) {
            throw new Error('Missing PoW challenge fields');
        }

        const maxAttemptsRaw = Number(options.maxAttempts ?? 200000);
        const maxAttempts = Math.max(1, Number.isFinite(maxAttemptsRaw) ? Math.floor(maxAttemptsRaw) : 200000);
        const yieldEveryRaw = Number(options.yieldEvery ?? 250);
        const yieldEvery = Math.max(1, Number.isFinite(yieldEveryRaw) ? Math.floor(yieldEveryRaw) : 250);
        const prefix = '0'.repeat(difficulty);

        const nonceSeedArray = new Uint32Array(1);
        crypto.getRandomValues(nonceSeedArray);
        const nonceSeed = nonceSeedArray[0];

        for (let i = 0; i < maxAttempts; i++) {
            const nonce = (nonceSeed + i).toString(36);
            const payload = `${sid}:${challengeId}:${challengeSalt}:${nonce}`;
            const hash = await computeSHA256(payload);

            if (hash.startsWith(prefix)) {
                return `${nonce}:${hash}`;
            }

            if ((i + 1) % yieldEvery === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        throw new Error('Modern PoW attempt limit exceeded');
    }

    /**
     * Computes PoW proof for challenge submission.
     *
     * @param {Object} challenge - Challenge object
     * @param {string} sid - Session ID
     * @param {Object} [options] - Additional options
     * @returns {Promise<string>} Challenge proof
     */
    async function computePoWProof(challenge, sid, options = {}) {
        if (!challenge || !sid) {
            throw new Error('Missing challenge data or session id for PoW');
        }

        const hasModernFields = !!(challenge.challenge_id && challenge.challenge_salt);
        if (!hasModernFields) {
            throw new Error('Challenge object missing PoW fields');
        }

        return computeModernPoWProof(challenge, sid, options);
    }

    /**
     * Checks if the API server is reachable
     * @returns {Promise<boolean>} True if API is accessible
     */
    async function checkApiStatus() {
        if (!apiFeaturesEnabled) {
            return false;
        }

        try {
            const res = await fetch(`${API_BASE}/status`, { method: 'GET', mode: 'cors' });
            return res.ok;
        } catch {
            return false;
        }
    }

    // --- Session Management ---

    /**
     * Creates a new session with the API server
     * Initiates PoW challenge if enabled on server
     * Stops retrying after MAX_SESSION_ATTEMPTS or API_TIMEOUT_MS
     * @returns {Promise<Object>} Session creation result with session_id and optionally challenge data
     */
    async function createSession() {
        if (!apiFeaturesEnabled) {
            return getApiDisabledResult();
        }

        // Prevent endless retry loops if API is unavailable
        if (apiFailedPermanently) {
            return { success: false, error: 'API unavailable (giving up after timeout)' };
        }

        // Check if we've exceeded timeout window
        if (firstSessionAttemptTime !== null) {
            const elapsedTime = Date.now() - firstSessionAttemptTime;
            if (elapsedTime > API_TIMEOUT_MS) {
                apiFailedPermanently = true;
                log.error('API timeout exceeded - stopping retry attempts');
                return { success: false, error: 'API unavailable (timeout)' };
            }
        } else {
            firstSessionAttemptTime = Date.now();
        }

        // Check if we've exceeded attempt count
        if (sessionAttempts >= MAX_SESSION_ATTEMPTS) {
            apiFailedPermanently = true;
            log.error(`Max session attempts (${MAX_SESSION_ATTEMPTS}) exceeded - stopping`);
            return { success: false, error: `Failed to create session after ${MAX_SESSION_ATTEMPTS} attempts` };
        }

        sessionAttempts++;
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
            const res = await fetch(`${API_BASE}/start`, {
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

            storeChallengeFromResponse(data);

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
    /**
     * Checks whether an error string indicates an invalid or expired session.
     * @param {string} errorMsg - Error message from the API response
     * @returns {boolean} True if the session is invalid/expired
     */
    function isSessionInvalidError(errorMsg) {
        if (!errorMsg) return false;
        const lower = String(errorMsg).toLowerCase();
        return lower.includes('invalid session') || lower.includes('session expired');
    }

    /**
     * Validates current session with the API
     * Returns the session data if valid
     * @returns {Promise<Object>} Validation result with session status
     */
    async function validateSession() {
        if (!apiFeaturesEnabled) {
            return getApiDisabledResult();
        }

        if (!sessionId) {
            return { success: false, error: 'No active session' };
        }

        try {
            const { floor, level, totalExp } = getGameState();
            const res = await fetch(`${API_BASE}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, floor, level, exp: totalExp })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                const errMsg = data.error || `HTTP ${res.status}`;
                if (isSessionInvalidError(errMsg)) {
                    log.warn('Session invalid/expired, clearing for re-creation');
                    clearSession();
                }
                return { success: false, error: errMsg };
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
        if (!apiFeaturesEnabled) {
            return getApiDisabledResult();
        }

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

            // Double-check API hasn't failed during createSession
            if (apiFailedPermanently) {
                return { success: false, error: 'API unavailable' };
            }

            // Update server
            const res = await fetch(`${API_BASE}/update`, {
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

            // Success - reset attempt counter
            sessionAttempts = 0;
            firstSessionAttemptTime = null;
            return { success: true, data };
        } catch (err) {
            if (isSessionInvalidError(err.message)) {
                log.warn('Session invalid/expired, clearing for re-creation');
                clearSession();
            }
            log.error(`Session creation failed (attempt ${sessionAttempts}/${MAX_SESSION_ATTEMPTS}):`, err.message);
            return { success: false, error: err.message };
        } finally {
            updateInFlight = false;
        }
    }

    /**
     * Submits a leaderboard score with PoW validation
     * @param {string} name - Player name (max 5 characters)
     * @returns {Promise<Object>} Submission result
     */
    async function submitScore(name) {
        if (!apiFeaturesEnabled) {
            return getApiDisabledResult();
        }

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
                const proof = await computePoWProof(challengeData, sessionId);
                body.challenge_id = challengeData.challenge_id;
                body.challenge_proof = proof;
            }

            const res = await fetch(`${API_BASE}/leaderboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                const errMsg = data.error || `HTTP ${res.status}`;
                if (isSessionInvalidError(errMsg)) {
                    log.warn('Session invalid/expired, clearing for re-creation');
                    clearSession();
                }
                return { success: false, error: errMsg };
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
     * @param {boolean} [options.force] - Ignore apiFailedPermanently flag
     * @returns {Promise<Object>} Leaderboard data { success, leaderboard } or { success:false, error }
     */
    async function getLeaderboard(options = {}) {
        if (!apiFeaturesEnabled) {
            return getApiDisabledResult();
        }

        const { limit, force = false } = options;

        if (apiFailedPermanently && !force) {
            log.warn('getLeaderboard: API marked as permanently failed, returning empty');
            return { success: false, error: 'API unavailable' };
        }

        try {
            const params = new URLSearchParams();
            if (limit) params.append('limit', String(limit));

            const url = params.toString()
                ? `${API_BASE}/leaderboard?${params.toString()}`
                : `${API_BASE}/leaderboard`;

            log.info('Fetching leaderboard from', url);
            const res = await fetch(url, { method: 'GET', mode: 'cors' });

            // Read raw text first so we can recover from non-JSON responses gracefully
            const text = await res.text();

            let data;
            try {
                data = text ? JSON.parse(text) : null;
            } catch (jsonErr) {
                log.warn('getLeaderboard: Failed to parse JSON, returning error', jsonErr);
                return { success: false, error: 'Invalid JSON response from leaderboard' };
            }

            if (!res.ok) {
                const error = (data && (data.error || data.message)) || `HTTP ${res.status}`;
                log.warn('getLeaderboard: response not OK', res.status, error);
                return { success: false, error };
            }

            // Normalize leaderboard: accept either an array of entries or a single-entry object
            let leaderboard = [];
            if (Array.isArray(data)) {
                leaderboard = data;
            } else if (data && typeof data === 'object') {
                // If server returned a single entry like {floor:69, level:69, name:"GAY"} wrap it. Unlikely outside of the development server.
                if (typeof data.name === 'string' && (typeof data.floor === 'number' || typeof data.level === 'number')) {
                    leaderboard = [data];
                }
            }

            log.info('getLeaderboard: fetched entries', leaderboard.length);
            return { success: true, leaderboard };
        } catch (err) {
            log.error('Leaderboard fetch failed:', err.message || err);
            return { success: false, error: err.message || String(err) };
        }
    }

    // --- Session Persistence ---

    /**
     * Loads session from storage if it exists
     * @returns {boolean} True if session was loaded
     */
    function loadSessionFromStorage() {
        if (!apiFeaturesEnabled) {
            return false;
        }

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
        authUsername = null;
        lastFloor = 1;
        lastLevel = 1;
        sessionStorage.removeItem(LS_SESSION_KEY);
        sessionStorage.removeItem(LS_CHALLENGE_KEY);
        try { localStorage.removeItem(LS_ACCOUNT_KEY); } catch {}
        log.info('Session cleared');
    }

    // --- Account / Auth ---

    function storeChallengeFromResponse(data) {
        const challengeSalt = data.challenge_salt || null;
        const challengeDifficulty = Number.isFinite(Number(data.challenge_difficulty))
            ? Math.max(1, Math.min(8, Math.floor(Number(data.challenge_difficulty))))
            : 4;

        if (data.challenge_id && challengeSalt) {
            challengeData = {
                challenge_id: data.challenge_id,
                challenge_salt: challengeSalt,
                challenge_difficulty: challengeDifficulty
            };
            sessionStorage.setItem(LS_CHALLENGE_KEY, JSON.stringify(challengeData));
            log.info('PoW challenge received (difficulty', challengeDifficulty + ')');
        }
    }

    /**
     * Logs in with an account credential. Creates an authenticated API session.
     * @param {string} username - Account username
     * @param {string} password - Account password
     * @returns {Promise<Object>} { success, session_id?, username?, error? }
     */
    async function login(username, password) {
        if (!apiFeaturesEnabled) {
            return getApiDisabledResult();
        }
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                return { success: false, error: data.error || `HTTP ${res.status}` };
            }
            if (!data.session_id) {
                return { success: false, error: 'Server did not return session_id' };
            }
            sessionId = data.session_id;
            sessionStorage.setItem(LS_SESSION_KEY, sessionId);
            authUsername = data.username || username;
            try { localStorage.setItem(LS_ACCOUNT_KEY, authUsername); } catch {}
            storeChallengeFromResponse(data);
            log.info('Account login successful:', authUsername);
            return { success: true, session_id: sessionId, username: authUsername };
        } catch (err) {
            log.error('Login failed:', err.message);
            return { success: false, error: err.message };
        }
    }

    /**
     * Registers a new account. Does NOT auto-login.
     * @param {string} username - Desired username
     * @param {string} password - Desired password
     * @returns {Promise<Object>} { success, error? }
     */
    async function register(username, password) {
        if (!apiFeaturesEnabled) {
            return getApiDisabledResult();
        }
        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                return { success: false, error: data.error || `HTTP ${res.status}` };
            }
            log.info('Account registered:', username);
            return { success: true };
        } catch (err) {
            log.error('Registration failed:', err.message);
            return { success: false, error: err.message };
        }
    }

    /**
     * Logs out: clears the local session and account state.
     */
    function logout() {
        clearSession();
        log.info('Account logged out');
    }

    /**
     * Verifies the current session's auth status with the server.
     * @returns {Promise<Object>} { success, authenticated, username? }
     */
    async function checkAuth() {
        if (!sessionId) {
            return { success: false, authenticated: false };
        }
        try {
            const res = await fetch(`${API_BASE}/auth/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                if (data.error && (data.error.includes('expired') || data.error.includes('Invalid'))) {
                    clearSession();
                }
                return { success: false, authenticated: false };
            }
            if (data.authenticated && data.username) {
                authUsername = data.username;
                try { localStorage.setItem(LS_ACCOUNT_KEY, authUsername); } catch {}
            } else if (!data.authenticated) {
                authUsername = null;
                try { localStorage.removeItem(LS_ACCOUNT_KEY); } catch {}
            }
            return { success: true, authenticated: !!data.authenticated, username: data.username || null };
        } catch (err) {
            log.error('Auth check failed:', err.message);
            return { success: false, authenticated: false };
        }
    }

    /**
     * Rotates (regenerates) recovery codes for the authenticated account.
     * @param {string} password - Current account password for re-verification
     * @returns {Promise<Object>} { success, codes?, error? }
     */
    async function rotateRecoveryCodes(password) {
        if (!apiFeaturesEnabled) {
            return getApiDisabledResult();
        }
        if (!sessionId) {
            return { success: false, error: 'No active session' };
        }
        try {
            const res = await fetch(`${API_BASE}/auth/recovery-codes/rotate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, password })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                return { success: false, error: data.error || `HTTP ${res.status}` };
            }
            return { success: true, codes: data.codes || [] };
        } catch (err) {
            log.error('Recovery code rotation failed:', err.message);
            return { success: false, error: err.message };
        }
    }

    /**
     * Resets password using a recovery code.
     * @param {string} username - Account username
     * @param {string} recoveryCode - One-time recovery code
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} { success, error? }
     */
    async function recoverPassword(username, recoveryCode, newPassword) {
        if (!apiFeaturesEnabled) {
            return getApiDisabledResult();
        }
        try {
            const res = await fetch(`${API_BASE}/auth/recover`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, recovery_code: recoveryCode, new_password: newPassword })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                return { success: false, error: data.error || `HTTP ${res.status}` };
            }
            return { success: true };
        } catch (err) {
            log.error('Password recovery failed:', err.message);
            return { success: false, error: err.message };
        }
    }

    // --- Public API ---

    return {
        // Configuration
        API_BASE,
        CLIENT_API_VERSION,
        LS_API_FEATURES_KEY,

        // Session management
        createSession,
        validateSession,
        updateProgress,
        submitScore,
        getLeaderboard,
        loadSessionFromStorage,
        clearSession,
        setApiFeaturesEnabled,

        // Account / auth
        login,
        register,
        logout,
        checkAuth,
        rotateRecoveryCodes,
        recoverPassword,

        // Utilities
        checkApiStatus,
        getGameState,
        computeSHA256,
        computePoWProof,
        isSessionInvalidError,

        // State getters
        get sessionId() { return sessionId; },
        get apiFeaturesEnabled() { return apiFeaturesEnabled; },
        get hasActiveSession() { return !!sessionId; },
        get hasChallenge() { return !!challengeData; },
        get challenge() { return challengeData; },
        get isLoggedIn() { return !!authUsername; },
        get username() { return authUsername; },

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

if (typeof window !== 'undefined' && typeof window.TardAPI === 'undefined') {
    window.TardAPI = TardAPI;
}
