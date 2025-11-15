// ============================================================================
// TardBoard (Leaderboard + Captcha Integration)
// ============================================================================

/**
 * @fileoverview TardBoard - Leaderboard and Captcha Integration System for TardQuest
 *
 * This module provides a comprehensive leaderboard system with captcha verification
 * for highscore submissions. It includes:
 *
 * - Cloudflare Turnstile captcha integration for bot protection
 * - Modal dialog system for user interaction
 * - Automatic game state monitoring and reporting via TardAPI
 * - Highscore submission with validation
 * - Game reset interception for leaderboard entry
 *
 * The system works by:
 * 1. Delegating session creation to TardAPI when the game loads
 * 2. Monitoring game progress (floor/level changes) via TardAPI
 * 3. Intercepting game resets to show leaderboard submission dialog
 * 4. Validating sessions before allowing highscore submissions
 * 5. Using captcha to prevent automated submissions
 *
 * Dependencies:
 * - tardAPI.js (for session management and progress updates)
 */
// --- Logging Utility ---

/**
 * Logging utility for consistent console output
 * @type {Object}
 */
const log = {
    info: (...args) => console.log('🏆 TardBoard:', ...args),
    warn: (...args) => console.warn('🏆 TardBoard:', ...args),
    error: (...args) => console.error('🏆 TardBoard:', ...args),
    debug: (...args) => console.debug('🏆 TardBoard:', ...args)
};

// Ensure TardAPI is loaded
if (typeof TardAPI === 'undefined') {
    log.error('TardAPI module is required! Load tardAPI.js before tardboard.js');
    throw new Error('TardAPI dependency missing');
}

// --- Constants --------------------------------------

/** @type {Promise|null} Promise that resolves when Turnstile script is loaded */
let _turnstileReadyPromise = null;

/** @const {string} Cloudflare Turnstile site key for captcha verification */
const TURNSTILE_SITE_KEY = '0x4AAAAAABzv0mtUXvveSKgW';

/**
 * Ensures the Cloudflare Turnstile captcha script is loaded and ready
 * @returns {Promise} Promise that resolves when Turnstile is available
 */
function ensureTurnstileScript() {
    if (_turnstileReadyPromise) return _turnstileReadyPromise;
    _turnstileReadyPromise = new Promise((resolve, reject) => {
        if (window.turnstile && typeof window.turnstile.render === 'function') return resolve();
        const existing = document.querySelector('script[data-turnstile-loaded]');
        if (existing) {
            const check = setInterval(() => {
                if (window.turnstile && typeof window.turnstile.render === 'function') { clearInterval(check); resolve(); }
            }, 100);
            setTimeout(() => { clearInterval(check); if (!(window.turnstile && window.turnstile.render)) reject(new Error('Turnstile script timeout')); }, 10000);
            return;
        }
        const s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        s.async = true; s.defer = true; s.setAttribute('data-turnstile-loaded', '1');
        s.onload = () => (window.turnstile && typeof window.turnstile.render === 'function') ? resolve() : reject(new Error('Turnstile global missing after load'));
        s.onerror = () => reject(new Error('Failed to load Turnstile script'));
        document.head.appendChild(s);
        const poll = setInterval(() => { if (window.turnstile && typeof window.turnstile.render === 'function') { clearInterval(poll); resolve(); } }, 120);
        setTimeout(() => clearInterval(poll), 10000);
    });
    return _turnstileReadyPromise;
}

// --- State ------------------------------------------------------------------

/**
 * Updates the API status indicator in the dialog
 * @param {Document|Element} [root=document] - Root element to search for status indicator
 */
function updateApiIndicator(root = document) {
    TardAPI.checkApiStatus().then(connected => {
        const status = root.querySelector('#tardboard-api-status');
        if (!status) return;
        if (connected) {
            status.textContent = 'API Connected';
            status.style.color = '#0f0';
        } else {
            status.textContent = 'API Offline';
            status.style.color = '#f00';
        }
    });
}

/**
 * Injects shared CSS styles for TardBoard dialogs
 * Only injects once to avoid duplicate styles
 */
function injectSharedStyles() {
    if (document.getElementById('tardboard-shared-styles')) return;
    const style = document.createElement('style');
    style.id = 'tardboard-shared-styles';
    style.textContent = `
    .tardboard-backdrop {position:fixed;inset:0;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);z-index:9999;font-family:'DejaVuSansMono',monospace;}
    .tardboard-box {background:#000;padding:2em 2.5em;border:2px solid #fff;max-width:95vw;max-height:95vh;overflow:auto;text-align:center;box-shadow:0 2px 16px #0003;font-family:'DejaVuSansMono',monospace;}
    .tardboard-buttons {display:flex;gap:1em;justify-content:center;margin-top:1em;}
    .tardboard-btn {padding:0.8em 2em;font-size:1em;border: 2px solid;border-color: #fff transparent transparent #fff;background:#000;color:#fff;cursor:pointer;height:2.8em;font-family:'DejaVuSansMono',monospace;transition:all .2s;}
    .tardboard-btn:hover {background:#fff !important;color:#000 !important;}
    .tardboard-initials-field {position:relative;display:inline-block;margin-bottom:1.2em;}
    .tardboard-input {font-size:1.2em;padding:0.5em 0.4em;margin:0;width:12ch;text-align:center;border: 2px solid;border-color: transparent #fff #fff transparent;background:transparent;color:transparent;caret-color:transparent;font-family:'DejaVuSansMono',monospace;outline:none;height:2.5em;letter-spacing:1.1ch;}
    .tardboard-input:focus {background:transparent;border: 2px solid;border-color: transparent #fff #fff transparent;caret-color:transparent;}
    .tardboard-initials-overlay {pointer-events:none;position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:0.6ch;padding:0.5em 0.4em;font-size:1.2em;}
    .tardboard-initials-overlay span {display:inline-block;width:1ch;text-align:center;border-bottom:2px solid #444;line-height:1.2em;color:#fff;transition:border-color 0.1s,background 0.1s;}
    .tardboard-initials-overlay span.filled {border-bottom-color:#fff;}
    .tardboard-initials-overlay span.active {border-bottom-color:#0f0;background:#0f02;color:#0f0;}
    .tardboard-gamepad-hints {display:flex;justify-content:center;gap:2.5em;margin-top:0.5em;margin-bottom:0.1em;align-items:center;opacity:0.85;}
    .tardboard-gamepad-hint {display:flex;gap:0.25em;font-size:0.92em;color:#aaa;}
    .tardboard-gamepad-hint img {height:10px;width:10px;vertical-align:middle;opacity:0.85;}
    .tardboard-api {margin-bottom:.5em;text-align:left;}
    `;
    document.head.appendChild(style);
}

/**
 * Creates and displays a modal dialog for TardBoard
 * @param {Object} options - Dialog configuration options
 * @param {string} options.bodyHtml - HTML content for the dialog body
 * @param {boolean} [options.showApi=true] - Whether to show API status indicator
 * @param {Array} [options.buttons=[]] - Array of button configurations
 * @param {Function} [options.afterRender] - Callback function called after dialog is rendered
 * @returns {HTMLElement} The dialog wrapper element
 */
function createDialog({ bodyHtml, showApi = true, buttons = [], afterRender }) {
    injectSharedStyles();
    const wrap = document.createElement('div');
    wrap.id = 'tardboard-dialog-backdrop';
    wrap.className = 'tardboard-backdrop';
    wrap.innerHTML = `
        <div class="tardboard-box">
            ${showApi ? `<div class="tardboard-api"><span id="tardboard-title">🏆 TardBoard: </span><span id="tardboard-api-status" style="color:#aaa;font-size:.95em;">Checking API...</span></div>` : ''}
            <div class="tardboard-body" style="color:#fff;">${bodyHtml}</div>
            <div class="tardboard-buttons"></div>
            <div id="hcaptcha-wrapper" style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;">
                <div id="hcaptcha-container"></div>
            </div>
        </div>`;
    document.body.appendChild(wrap);
    const btnContainer = wrap.querySelector('.tardboard-buttons');
    buttons.forEach(b => {
        const btn = document.createElement('button');
        btn.className = 'tardboard-btn';
        btn.id = b.id;
        btn.textContent = b.text;
        btn.addEventListener('click', () => b.onClick && b.onClick());
        btnContainer.appendChild(btn);
    });
    if (showApi) updateApiIndicator(wrap);
    afterRender && afterRender(wrap);
    return wrap;
}

/**
 * Removes the TardBoard dialog from the DOM
 */
function removeDialog() {
    const el = document.getElementById('tardboard-dialog-backdrop');
    if (el) el.remove();
}

// --- Dialog / Submission Flow ----------------------------------------------

/**
 * Shows the initials entry dialog with captcha verification
 * @param {Function} submitCallback - Callback function called with submission data or null
 */
function showInitialsDialog(submitCallback) {
    let widgetId = null;
    let captchaToken = null;
    let pendingSubmit = false;
            createDialog({
            bodyHtml: `Enter your initials (up to 5)<br><br>
                <div class="tardboard-initials-field">
                    <input id="tardboard-initials-input" class="tardboard-input" maxlength="5" autocomplete="off" autocorrect="off" spellcheck="false" autofocus />
                    <div class="tardboard-initials-overlay" id="tardboard-initials-slots"></div>
                </div>`,
        buttons: [
            { id: 'tardboard-dialog-ok', text: ' Submit ', onClick: onOk },
            { id: 'tardboard-dialog-cancel', text: ' Cancel ', onClick: onCancel }
        ],
                afterRender: (root) => {
                        setTimeout(() => root.querySelector('#tardboard-initials-input')?.focus(), 50);
                        const btns = root.querySelector('.tardboard-buttons');
                        if (btns) {
                                const hints = document.createElement('div');
                                hints.className = 'tardboard-gamepad-hints';
                                hints.innerHTML = `
                                    <div class="tardboard-gamepad-hint">
                                        [<img src="assets/gamepad/xinput/a.png" alt="A" />]<span> or </span>[<img src="assets/gamepad/playstation/cross.png" alt="X" />]
                                    </div>
                                    <div class="tardboard-gamepad-hint">
                                        [<img src="assets/gamepad/xinput/b.png" alt="B" />]<span> or </span>[<img src="assets/gamepad/playstation/circle.png" alt="O" />]
                                    </div>
                                `;
                                btns.parentNode.insertBefore(hints, btns.nextSibling);
                        }
                }
    });

    let initialsValue = '';
    function proceedIfReady() {
        if (!pendingSubmit || !captchaToken) return;
        removeDialog();
        let val = initialsValue.trim().toUpperCase();
        if (!val) {
            submitCallback(null);
            sessionStorage.removeItem('tardquestSID');
            window.location.reload();
        } else {
            // log.debug('Submitting initials:', val);
            submitCallback({ initials: val, captcha: captchaToken });
        }
    }

    function onCaptchaSuccess(token) {
        captchaToken = token;
        log.info('Captcha verified');
        proceedIfReady();
    }

    ensureTurnstileScript()
        .then(() => {
            try {
                widgetId = window.turnstile.render('#hcaptcha-container', {
                    sitekey: TURNSTILE_SITE_KEY,
                    size: 'invisible',
                    callback: onCaptchaSuccess,
                    'error-callback': () => log.warn('Captcha error'),
                    'timeout-callback': () => log.warn('Captcha timeout')
                });
            } catch { log.error('Captcha render error'); }
        })
        .catch(err => { log.error('Turnstile load failure', err); });

    const input = document.getElementById('tardboard-initials-input');
    // Build slot overlay for visual feedback
    const slotContainer = document.getElementById('tardboard-initials-slots');
    if (slotContainer && slotContainer.childElementCount === 0) {
        for (let i = 0; i < 5; i++) {
            const s = document.createElement('span');
            s.dataset.idx = i;
            slotContainer.appendChild(s);
        }
    }

    function refreshSlots() {
        initialsValue = input.value || '';
        const val = initialsValue.toUpperCase();
        const spans = slotContainer?.querySelectorAll('span') || [];
        let caret = input.selectionStart ?? val.length;
        // Clamp caret to [0, 5]
        caret = Math.max(0, Math.min(4, caret));
        spans.forEach((sp, i) => {
            const ch = val[i] || '';
            sp.textContent = ch;
            if (ch) sp.classList.add('filled'); else sp.classList.remove('filled');
            if (i === caret) sp.classList.add('active'); else sp.classList.remove('active');
        });
    }

    input.addEventListener('input', refreshSlots);
    input.addEventListener('keyup', refreshSlots);
    // Also update overlay on value change from controller/gamepad
    const observer = new MutationObserver(refreshSlots);
    observer.observe(input, { attributes: true, attributeFilter: ['value'] });
    // Fallback: periodic refresh in case of direct value assignment
    let slotInterval = setInterval(refreshSlots, 50);
    // Clean up observer/interval when dialog closes
    const cleanup = () => { observer.disconnect(); clearInterval(slotInterval); };
    input.closest('.tardboard-backdrop')?.addEventListener('remove', cleanup);
    refreshSlots();
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') onOk();
        if (e.key === 'Escape') onCancel();
    });

    function onOk() {
        if (pendingSubmit) return;
        const val = input.value.trim();
        if (!val) { alert('Enter initials first.'); return; }
        pendingSubmit = true;
        // Grey out the Submit button if validation is pending
        const okBtn = document.getElementById('tardboard-dialog-ok');
        if (okBtn) {
            okBtn.disabled = true;
            okBtn.style.opacity = '0.5';
            okBtn.style.pointerEvents = 'none';
        }
        if (captchaToken) { proceedIfReady(); return; }
        // log.debug('Verifying captcha...');
        if (window.turnstile && widgetId !== null) {
            try { window.turnstile.execute(widgetId); } catch { log.error('Captcha error'); }
        } else log.warn('Captcha unavailable');
    }
    function onCancel() {
        removeDialog();
        submitCallback(null);
        TardAPI.clearSession();
        window.location.reload();
    }
}

/**
 * Shows an informational dialog with optional auto-close
 * @param {string} message - HTML message to display
 * @param {Function} [onOk] - Callback function called when OK is clicked or auto-close occurs
 * @param {number} [autoCloseMs] - Auto-close delay in milliseconds (no buttons if specified)
 */
function showInfoDialog(message, onOk, autoCloseMs) {
    createDialog({
        bodyHtml: message,
        buttons: autoCloseMs ? [] : [{ id: 'tardboard-dialog-ok', text: 'OK', onClick: () => { removeDialog(); onOk && onOk(); } }]
    });
    if (autoCloseMs) {
        setTimeout(() => { removeDialog(); onOk && onOk(); }, autoCloseMs);
    }
}

/**
 * Shows a dialog when anti-cheat validation fails
 * @param {string} [reason] - Reason for validation failure
 */
function showValidationFailDialog(reason) {
    createDialog({
        bodyHtml: `Score submission failed:<br><span style="color:#f55;">${reason || 'Unknown reason'}</span><br>The game will reset as normal.`,
        buttons: [{ id: 'tardboard-dialog-ok', text: 'OK', onClick: () => { removeDialog(); TardAPI.clearSession(); window.location.reload(); } }]
    });
}

/**
 * Validates anti-cheat session and submits highscore to leaderboard
 * @param {string} playerInitials - Player's initials (max 5 characters)
 * @param {string} captchaToken - Captcha verification token
 */
async function submitHighscore(playerInitials, captchaToken) {
    try {
        // Use TardAPI to submit the score with PoW proof if available
        const result = await TardAPI.submitScore(playerInitials, { captcha_token: captchaToken });

        if (result.success) {
            showInfoDialog('<br>Highscore saved!<br>', () => {
                TardAPI.clearSession();
                window.location.reload();
            }, 2000);
        } else {
            showInfoDialog(`Failed to save highscore: ${result.error}<br>The game will reset as normal.`, () => {
                TardAPI.clearSession();
                window.location.reload();
            });
        }
    } catch (err) {
        log.error('Submission error:', err);
        showInfoDialog(`Error submitting score: ${err.message}<br>The game will reset as normal.`, () => {
            TardAPI.clearSession();
            window.location.reload();
        });
    }
}

// --- Game Integration Hooks ------------------------------------------------

/**
 * Intercepts setTimeout calls to catch game reset events (death)
 * Shows leaderboard dialog when game is about to reset
 */
(function interceptReset() {
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = function(cb, delay) {
        const str = cb && cb.toString ? cb.toString() : '';
        if (str.includes('window.location.reload') || str.includes('location.reload')) {
            const replacement = function() {
                if (typeof window._inputBlocked !== 'undefined') window._inputBlocked = false;
                showInitialsDialog(data => {
                    if (data && data.initials) submitHighscore(data.initials, data.captcha);
                });
            };
            return originalSetTimeout(replacement, delay);
        }
        return originalSetTimeout.apply(this, arguments);
    };
})();

// Module initialization complete
if (typeof console !== 'undefined') {
    console.log('🏆 TardBoard: Module loaded!');
}