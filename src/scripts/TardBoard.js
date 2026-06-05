"use strict";

/**
 * Handles leaderboard API calls for TardQuest high score submissions
 *
 * This module loads the Cloudflare Turnstile when requested and submits high
 * scores through the TardAPI
 */
const TardBoard = {
    // Cloudflare Turnstile site key for captcha verification
    turnstileSiteKey: "0x4AAAAAABzv0mtUXvveSKgW",

    // Cloudflare Turnstile script URL
    turnstileScriptUrl:
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",

    // Attribute used to identify the injected Turnstile script element
    turnstileScriptAttribute: "data-tardboard-turnstile-loaded",

    // Cached promise so repeated calls do not inject duplicate scripts
    turnstileScriptPromise: null,

    // Reference of the player's initials that will persist between modal opens
    _playerInitials: null,

    openModal: () => {
        GameControl.enableControls();

        Modal.open(
            "TardBoard High Score!",
            `
                <div class="tardboard">
                    <div>
                        Enter your initials
                    </div>
                    <arcade-text-input
                        maxlength="5"
                        oninput="Modal.togglePrimaryButtons(this.value !== '')"
                    ></arcade-text-input>
                </div>
            `,
            [
                {
                    text: "Submit",
                    type: "primary",
                    disabled: true,
                    onclick: () => {
                        TardBoard.handleSubmitClick(
                            TardBoard.getModalPlayerInitials()
                        );
                        return false;
                    },
                },
                {
                    text: "Cancel",
                    type: "danger",
                    onclick: () => TardBoard.clearSessionAndReload(),
                },
            ],
            {
                onopen: () => Modal._navigateBody(),
                onclosebuttonclicked: () => TardBoard.clearSessionAndReload(),
            },
            function($activeElement, direction = "initialize") {
                const $input = Modal._$modal.querySelector(
                    ".body arcade-text-input"
                );

                if ($activeElement === $input) {
                    switch (direction) {
                        case "down":
                            $input.cycleCharacter(-1);
                            break;
                        case "up":
                            $input.cycleCharacter(1);
                            break;
                        case "left":
                            $input.moveCursor(-1);
                            break;
                        case "right":
                            $input.moveCursor(1);
                            break;
                        case "select":
                            $input.blur();
                            return "footer, button primary";
                        case "back":
                            if ($input.value === "") {
                                $input.blur();
                                return "footer, button danger";
                            }
                            $input.backspace();
                            break;
                    }
                    return;
                }

                switch (direction) {
                    case "initialize":
                    case "enter from bottom":
                    case "enter from top":
                        const $body = Modal._$modal.querySelector(".body");
                        Modal.navigate._activate($body);
                        break;
                    case "down":
                        return "footer";
                    case "up":
                        return "header";
                    case "left":
                    case "right":
                        // Do nothing
                        break;
                    case "select":
                        if ($input) {
                            const playSfx = direction !== "initialize";
                            Modal.navigate._activate($input, playSfx, true);
                            $input.focus();
                        }
                        break;
                    case "back":
                        $input.blur();
                        return "footer, button danger";
                }
            }
        );
    },

    /**
     * Handles high score submission from the open TardBoard modal
     *
     * @return Promise<object|null> The submission result or null on failure
     */
    handleSubmitClick: async (playerInitials) => {
        GameControl.disableControls();
        console.log("handleSubmitClick called", { playerInitials });

        if (! playerInitials) {
            console.error("No initials were captured");
            TardBoard.clearSessionAndReload();
            return null;
        }

        TardBoard._playerInitials = playerInitials;

        Modal.open(
            `Submitting High Score for ${playerInitials}...`,
            `
                <div class="tardboard">
                    <div id="tardboard-turnstile-container"></div>
                    <div class="loading-spinner">
                </div>
            `,
            [],
            { onclosebuttonclicked: () => TardBoard.clearSessionAndReload() },
        );

        try {
            await TardBoard.ensureTurnstileScript();

            const captchaToken = await TardBoard.createCaptchaToken();
            const result = await TardBoard.submitHighScore({
                playerInitials,
                captchaToken,
                onSuccess: TardBoard.handleSubmissionSuccess,
                onFailure: TardBoard.handleSubmissionFailure,
            });

            console.log({ result });

            return result;
        } catch (error) {
            const result = TardBoard.createFailureResult(error);

            console.error("TardBoard submission failed", { error });
            TardBoard.handleSubmissionFailure(result);

            return result;
        } finally {
            // @TODO Enable this properly
            // TardBoard.clearSessionAndReload();
            console.log("THE END");
        }
    },

    getModalPlayerInitials: () => {
        const $input = Modal._$modal.querySelector(".body arcade-text-input");
        return String($input?.value || "").trim();
    },

    createCaptchaToken: () => new Promise((resolve, reject) => {
        const $container = Modal._$modal.querySelector(
            "#tardboard-turnstile-container"
        );

        if (! $container) {
            reject(new Error("Turnstile container is unavailable"));
            return;
        }

        let widgetId = null;
        const timeoutId = window.setTimeout(() => {
            reject(new Error("Timed out while verifying Turnstile"));
        }, 30000);

        try {
            widgetId = window.turnstile.render($container, {
                sitekey: TardBoard.turnstileSiteKey,
                size: "invisible",
                callback: (captchaToken) => {
                    window.clearTimeout(timeoutId);
                    resolve(captchaToken);
                },
                "error-callback": () => {
                    window.clearTimeout(timeoutId);
                    reject(new Error("Turnstile verification failed"));
                },
                "timeout-callback": () => {
                    window.clearTimeout(timeoutId);
                    reject(new Error("Turnstile verification timed out"));
                },
            });

            window.turnstile.execute(widgetId);
        } catch (error) {
            window.clearTimeout(timeoutId);
            reject(error);
        }
    }),

    handleSubmissionSuccess: (result) => {
        console.log("TardBoard high score submitted", { result });

        Modal.open(
            "High Score Posted!",
            `
                <div class="tardboard">
                    <h3>🏆️ High Score Posted</h3>
                    Your high score has been successfully recorded!
                </div>
            `,
            [
                {
                    text: "Ok",
                    type: "primary",
                    onclick: () => TardBoard.clearSessionAndReload(),
                },
            ],
            { onclosebuttonclicked: () => TardBoard.clearSessionAndReload() },
        );
    },

    handleSubmissionFailure: (result) => {
        console.error("TardBoard high score submission failed", { result });

        Modal.open(
            "Failed to Post High Score",
            `
                <div class="tardboard">
                    <h3>❌ Failed to Submit Your High Score</h3>
                    <tt>${result?.error || "Unknown error"}</tt>
                </div>
            `,
            [
                {
                    text: "Retry",
                    type: "primary",
                    onclick: () => {
                        TardBoard.handleSubmitClick(TardBoard._playerInitials);
                        return false;
                    },
                },
                {
                    text: "Quit",
                    type: "danger",
                    onclick: () => TardBoard.clearSessionAndReload(),
                },
            ],
            { onclosebuttonclicked: () => TardBoard.clearSessionAndReload() },
        );
    },

    clearSessionAndReload: () => {
        const clearSession =
            typeof TardAPI !== "undefined" &&
            typeof TardAPI.clearSession === "function";

        if (clearSession) {
            TardAPI.clearSession();
        }

        window.location.reload();
    },

    /**
     * Ensures the Cloudflare Turnstile script has been loaded
     *
     * @return Promise<object> Resolves with the global Turnstile object
     */
    ensureTurnstileScript: () => {
        if (TardBoard.isTurnstileReady()) {
            return Promise.resolve(window.turnstile);
        }

        if (TardBoard.turnstileScriptPromise) {
            return TardBoard.turnstileScriptPromise;
        }

        TardBoard.turnstileScriptPromise = new Promise((resolve, reject) => {
            const $existingScript = document.querySelector(
                `script[${TardBoard.turnstileScriptAttribute}]`
            );

            if ($existingScript) {
                TardBoard.waitForTurnstile(resolve, reject);
                return;
            }

            const $script = document.createElement("script");
            $script.src = TardBoard.turnstileScriptUrl;
            $script.async = true;
            $script.defer = true;
            $script.setAttribute(TardBoard.turnstileScriptAttribute, "true");

            $script.addEventListener("load", () => {
                if (TardBoard.isTurnstileReady()) {
                    resolve(window.turnstile);
                    return;
                }

                reject(new Error("Turnstile was loaded but is unavailable"));
            });

            $script.addEventListener("error", () => {
                reject(new Error("Unable to load the Turnstile script"));
            });

            document.head.appendChild($script);
        }).catch(error => {
            TardBoard.turnstileScriptPromise = null;
            console.error("Unable to load the Turnstile script", { error });

            throw error;
        });

        return TardBoard.turnstileScriptPromise;
    },

    /**
     * Submits a high score through TardAPI.
     *
     * @param Object options
     * @param string options.playerInitials Initials to submit with the score
     * @param string [options.captchaToken] Turnstile verification token
     * @param Function [options.onSuccess] Called when submission succeeds
     * @param Function [options.onFailure] Called when submission fails
     * @param Function [options.onComplete] Called after success or failure
     * @return Promise<object> The TardAPI score-submission response
     */
    submitHighScore: async ({
        playerInitials,
        captchaToken = null,
        onSuccess = null,
        onFailure = null,
        onComplete = null,
    }) => {
        try {
            TardBoard.assertTardApiIsAvailable();

            const result = await TardAPI.submitScore(
                TardBoard.normalizePlayerInitials(playerInitials),
                TardBoard.createSubmitScorePayload(captchaToken)
            );

            const callback = result?.success ? onSuccess : onFailure;
            TardBoard.runCallback(callback, result);
            TardBoard.runCallback(onComplete, result);

            return result;
        } catch (error) {
            const result = TardBoard.createFailureResult(error);

            console.error("TardBoard score submission failed", { error });
            TardBoard.runCallback(onFailure, result);
            TardBoard.runCallback(onComplete, result);

            return result;
        }
    },

    /**
     * Backwards-compatible alias for older call sites
     *
     * @param Object options
     * @return Promise<object>
     */
    submitHighscore: (options) => TardBoard.submitHighScore(options),

    isTurnstileReady: () => Boolean(
        typeof window.turnstile?.render === "function"
    ),

    waitForTurnstile: (resolve, reject) => {
        const startedAtMs = Date.now();
        const timeoutMs = 10000;
        const intervalMs = 100;

        const intervalId = window.setInterval(() => {
            if (TardBoard.isTurnstileReady()) {
                window.clearInterval(intervalId);
                resolve(window.turnstile);
                return;
            }

            const elapsedMs = Date.now() - startedAtMs;
            if (elapsedMs >= timeoutMs) {
                window.clearInterval(intervalId);
                reject(new Error("Timed out while loading Turnstile"));
            }
        }, intervalMs);
    },

    assertTardApiIsAvailable: () => {
        const tardApiIsMissing = typeof TardAPI?.submitScore !== "function";

        if (tardApiIsMissing) {
            throw new Error(
                "TardAPI.submitScore() is required to submit high scores."
            );
        }
    },

    normalizePlayerInitials: (playerInitials) => {
        const normalizedInitials = String(playerInitials || "")
            .trim()
            .toUpperCase();

        if (! normalizedInitials) {
            throw new Error("Player initials are required.");
        }

        return normalizedInitials.slice(0, 5);
    },

    createSubmitScorePayload: (captchaToken) => {
        return captchaToken ? { captcha_token: captchaToken } : {};
    },

    createFailureResult: (error) => ({
        success: false,
        error: error?.message || "Unknown score-submission error.",
    }),

    runCallback: (callback, result) => {
        if (typeof callback !== "function") {
            return;
        }

        callback(result);
    },
};
