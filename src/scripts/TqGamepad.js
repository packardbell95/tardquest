"use strict";

/**
 * TqGamepad handles controller detection and routes gamepad inputs to
 * PlayerInput. Game-specific behavior should live in PlayerInput.
 */
const TqGamepad = {
    animationFrameId: null,
    activeGamepadIndex: null,
    connected: false,
    buttonStates: [],
    directionStates: {},
    captureRequest: null,

    buttonPressThreshold: 0.5,
    joystickDeadzone: 0.25,
    directionInitialRepeatDelayMs: 280,
    fastDirectionalRepeatMs: 120,
    slowDirectionalRepeatMs: 260,

    inputMap: {
        primary: 0,
        cancel: 1,
        talk: 2,
        inventory: 3,
        strafeLeft: 4,
        strafeRight: 5,
        menu: 9,
        up: 12,
        down: 13,
        left: 14,
        right: 15,
    },

    start: function() {
        if (this.animationFrameId !== null) {
            return;
        }

        window.addEventListener(
            "gamepadconnected",
            this.handleGamepadConnected.bind(this)
        );

        window.addEventListener(
            "gamepaddisconnected",
            this.handleGamepadDisconnected.bind(this)
        );

        this.tick();
    },

    tick: function() {
        this.poll();

        this.animationFrameId = window.requestAnimationFrame(() => {
            this.tick();
        });
    },

    stop: function() {
        if (this.animationFrameId === null) {
            return;
        }

        window.cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    },

    getGamepads: function() {
        if (typeof navigator.getGamepads !== "function") {
            return [];
        }

        try {
            return Array.from(navigator.getGamepads()).filter(gamepad => {
                return this.isUsableGamepad(gamepad);
            });
        } catch (error) {
            console.warn("Unable to read gamepads", { error });
            return [];
        }
    },

    isUsableGamepad: function(gamepad) {
        if (! gamepad || ! gamepad.connected) {
            return false;
        }

        const hasButtons = gamepad.buttons && gamepad.buttons.length >= 4;
        const hasAxes = gamepad.axes && gamepad.axes.length >= 2;

        return hasButtons || hasAxes;
    },

    selectGamepad: function(gamepads) {
        const activeGamepad = gamepads.find(gamepad => {
            return gamepad.index === this.activeGamepadIndex;
        });

        if (activeGamepad) {
            return activeGamepad;
        }

        const nextGamepad = gamepads[0] || null;
        this.activeGamepadIndex = nextGamepad ? nextGamepad.index : null;

        return nextGamepad;
    },

    poll: function() {
        const gamepad = this.selectGamepad(this.getGamepads());
        this.updateStatus(gamepad);

        if (! gamepad) {
            return;
        }

        if (this.captureRequest) {
            this.routeCapture(gamepad);
            return;
        }

        this.routeInputs(gamepad);
    },

    routeCapture: function(gamepad) {
        const captureRequest = this.captureRequest;
        const currentTimeMs = performance.now();
        const elapsedTimeMs = currentTimeMs - captureRequest.startedTimeMs;

        if (elapsedTimeMs > captureRequest.timeoutMs) {
            this.cancelCapture();
            return;
        }

        this.releaseIgnoredCaptureButtons(captureRequest, gamepad);

        for (let i = 0; i < gamepad.buttons.length; i++) {
            const isIgnoredButton = captureRequest.ignoredButtons.includes(i);
            if (isIgnoredButton) {
                continue;
            }

            // Ignore directional buttons, though we may want to remove this
            const isDirectionalButton = this.isDirectionalButtonIndex(i);
            if (isDirectionalButton) {
                continue;
            }

            if (! this.wasButtonJustPressed(gamepad, i)) {
                continue;
            }

            const input = {
                type: "button",
                index: i,
                label: this.getButtonLabel(i),
            };

            this.captureRequest = null;

            if (typeof captureRequest.onCapture === "function") {
                captureRequest.onCapture(input);
            }

            return;
        }
    },

    getButtonLabel: function(buttonIndex) {
        const labels = {
            0: "Bottom Face Button",
            1: "Right Face Button",
            2: "Left Face Button",
            3: "Top Face Button",
            4: "Left Shoulder",
            5: "Right Shoulder",
            6: "Left Trigger",
            7: "Right Trigger",
            8: "Select / Back",
            9: "Start / Menu",
            10: "Left Stick Button",
            11: "Right Stick Button",
            12: "D-Pad Up",
            13: "D-Pad Down",
            14: "D-Pad Left",
            15: "D-Pad Right",
            16: "Home / Guide",
        };

        return labels[buttonIndex] || `Button ${buttonIndex}`;
    },

    isDirectionalButtonIndex: function(buttonIndex) {
        return (
            buttonIndex === this.inputMap.up ||
            buttonIndex === this.inputMap.down ||
            buttonIndex === this.inputMap.left ||
            buttonIndex === this.inputMap.right
        );
    },

    getMappedButtonLabel(action) {
        if (typeof action !== "string") {
            console.log("Invalid action", { action });
            return "(Invalid action)";
        }

        if (! this.inputMap.hasOwnProperty(action)) {
            console.log("Unknown action", { action });
            return "(Unknown action)";
        }

        if (this.inputMap[action] === null) {
            return "Unmapped";
        }

        return this.getButtonLabel(this.inputMap[action]);
    },

    isMapped: function(action) {
        return Number.isInteger(this.inputMap?.[action]);
    },

    updateStatus: function(gamepad) {
        const isConnected = Boolean(gamepad);

        if (this.connected !== isConnected) {
            this.connected = isConnected;
            this.buttonStates = [];
            this.directionStates = {};
        }

        const controllerBox = document.getElementById("controller");
        const controllerStatusButton = document.getElementById(
            "controllerStatusButton"
        );

        if (controllerBox) {
            controllerBox.className = isConnected
                ? "connected"
                : "disconnected";
        }

        if (controllerStatusButton) {
            controllerStatusButton.classList.toggle("connected", isConnected);
        }
    },

    handleGamepadConnected: function(event) {
        if (this.activeGamepadIndex !== null) {
            return;
        }

        this.activeGamepadIndex = event.gamepad.index;
    },

    handleGamepadDisconnected: function(event) {
        if (event.gamepad.index !== this.activeGamepadIndex) {
            return;
        }

        this.activeGamepadIndex = null;
        this.buttonStates = [];
        this.directionStates = {};
    },

    captureNextButton: function(options) {
        this.captureRequest = {
            action: options.action || null,
            onCapture: options.onCapture,
            onCancel: options.onCancel || null,
            startedTimeMs: performance.now(),
            timeoutMs: options.timeoutMs || 10000,
            ignoredButtons: this.getCurrentlyPressedButtonIndexes(),
        };
    },

    releaseIgnoredCaptureButtons: function(captureRequest, gamepad) {
        const stillIgnoredButtons = [];

        for (const buttonIndex of captureRequest.ignoredButtons) {
            if (this.isButtonPressed(gamepad, buttonIndex)) {
                stillIgnoredButtons.push(buttonIndex);
                continue;
            }

            this.buttonStates[buttonIndex] = false;
        }

        captureRequest.ignoredButtons = stillIgnoredButtons;
    },

    cancelCapture: function() {
        const captureRequest = this.captureRequest;
        this.captureRequest = null;

        const fireOnCancel = captureRequest &&
            typeof captureRequest.onCancel === "function";

        if (fireOnCancel) {
            captureRequest.onCancel();
        }
    },

    exportControllerMapping: function() {
        return JSON.stringify(this.inputMap);
    },

    importControllerMapping: function(jsonControllerMapping) {
        const bindings = this._decodeMapping(jsonControllerMapping);
        if (! bindings) {
            return false;
        }

        Object.assign(this.inputMap, bindings);
        return true;
    },

    _decodeMapping: function(jsonControllerMapping) {
        try {
            const mapping = JSON.parse(jsonControllerMapping);
            if (typeof mapping !== "object") {
                console.warn(
                    "Controller mapping did not decode to an object",
                    { jsonControllerMapping, decodedMapping }
                );
                return null;
            }

            for (const key of Object.keys(this.inputMap)) {
                if (! mapping.hasOwnProperty(key)) {
                    console.error(
                        "Controller mapping is incomplete",
                        { missingKey: key, jsonControllerMapping }
                    );
                    return null;
                }

                if (! Number.isInteger(mapping[key])) {
                    console.error(
                        "Controller mapping has an unexpected value",
                        {
                            key,
                            unexpectedValue: mapping[key],
                            jsonControllerMapping,
                        }
                    );
                    return null;
                }
            }

            return mapping;
        } catch (error) {
            console.warn("Unable to decode controller mapping", { error });
            return null;
        }
    },

    getCurrentlyPressedButtonIndexes: function() {
        const gamepad = this.selectGamepad(this.getGamepads());
        if (! gamepad) {
            return [];
        }

        return gamepad.buttons.map((button, index) =>
            this.isButtonPressed(gamepad, index) ? index : null,
        ).filter(index => index !== null);
    },

    routeInputs: function(gamepad) {
        this.routeButtonEdges(gamepad);
        this.routeDirectionalInputs(gamepad);
    },

    routeButtonEdges: function(gamepad) {
        this.routeButtonEdge(gamepad, "primary");
        this.routeButtonEdge(gamepad, "cancel");
        this.routeButtonEdge(gamepad, "inventory");
        this.routeButtonEdge(gamepad, "talk");
        this.routeButtonEdge(gamepad, "strafeLeft");
        this.routeButtonEdge(gamepad, "strafeRight");
        this.routeButtonEdge(gamepad, "menu");
    },

    routeButtonEdge: function(gamepad, action) {
        const buttonIndex = this.inputMap[action];

        if (this.wasButtonJustPressed(gamepad, buttonIndex)) {
            PlayerInput[action]();
        }
    },

    routeDirectionalInputs: function(gamepad) {
        const directions = this.getDirections(gamepad);

        this.routeDirection("up", directions.up);
        this.routeDirection("down", directions.down);
        this.routeDirection("left", directions.left);
        this.routeDirection("right", directions.right);
    },

    routeDirection: function(action, strength) {
        const previousState = this.directionStates[action] || {
            active: false,
            lastInputTimeMs: 0,
            startedTimeMs: 0,
        };

        if (strength <= 0) {
            this.directionStates[action] = {
                active: false,
                lastInputTimeMs: 0,
                startedTimeMs: 0,
            };

            return;
        }

        const currentTimeMs = performance.now();

        if (! previousState.active) {
            this.directionStates[action] = {
                active: true,
                lastInputTimeMs: currentTimeMs,
                startedTimeMs: currentTimeMs,
            };

            PlayerInput[action]();

            return;
        }

        const heldTimeMs = currentTimeMs - previousState.startedTimeMs;

        if (heldTimeMs < this.directionInitialRepeatDelayMs) {
            return;
        }

        const repeatIntervalMs = this.getRepeatIntervalMs(strength);
        const elapsedTimeMs = currentTimeMs - previousState.lastInputTimeMs;

        if (elapsedTimeMs < repeatIntervalMs) {
            return;
        }

        this.directionStates[action] = {
            active: true,
            lastInputTimeMs: currentTimeMs,
            startedTimeMs: previousState.startedTimeMs,
        };

        PlayerInput[action]();
    },

    getRepeatIntervalMs: function(strength) {
        const clampedStrength = Math.max(0, Math.min(1, strength));
        const intervalRangeMs = this.slowDirectionalRepeatMs -
            this.fastDirectionalRepeatMs;

        return this.slowDirectionalRepeatMs - intervalRangeMs * clampedStrength;
    },

    getDirections: function(gamepad) {
        const dpadDirections = this.getDPadDirections(gamepad);
        const joystickDirections = this.getJoystickDirections(gamepad);
        const hatDirections = this.getHatDirections(gamepad.axes[9]);

        return {
            up: Math.max(
                dpadDirections.up,
                joystickDirections.up,
                hatDirections.up
            ),
            down: Math.max(
                dpadDirections.down,
                joystickDirections.down,
                hatDirections.down
            ),
            left: Math.max(
                dpadDirections.left,
                joystickDirections.left,
                hatDirections.left
            ),
            right: Math.max(
                dpadDirections.right,
                joystickDirections.right,
                hatDirections.right
            ),
        };
    },

    getDPadDirections: function(gamepad) {
        return {
            up: this.isButtonPressed(gamepad, this.inputMap.up) ? 1 : 0,
            down: this.isButtonPressed(gamepad, this.inputMap.down) ? 1 : 0,
            left: this.isButtonPressed(gamepad, this.inputMap.left) ? 1 : 0,
            right: this.isButtonPressed(gamepad, this.inputMap.right) ? 1 : 0,
        };
    },

    getJoystickDirections: function(gamepad) {
        const horizontalAxis = gamepad.axes[0] || 0;
        const verticalAxis = gamepad.axes[1] || 0;

        return {
            up: this.getNegativeAxisStrength(verticalAxis),
            down: this.getPositiveAxisStrength(verticalAxis),
            left: this.getNegativeAxisStrength(horizontalAxis),
            right: this.getPositiveAxisStrength(horizontalAxis),
        };
    },

    getHatDirections: function(hatAxis) {
        if (typeof hatAxis !== "number" || Number.isNaN(hatAxis)) {
            return {
                up: 0,
                down: 0,
                left: 0,
                right: 0,
            };
        }

        const isNear = function(value, target) {
            return Math.abs(value - target) < 0.25;
        };

        return {
            up: isNear(hatAxis, -1) || isNear(hatAxis, 1) ? 1 : 0,
            down: isNear(hatAxis, -0.142) || isNear(hatAxis, 0.142) ? 1 : 0,
            left: isNear(hatAxis, 0.428) || isNear(hatAxis, 0.714) ? 1 : 0,
            right: isNear(hatAxis, -0.714) || isNear(hatAxis, -0.428)
                ? 1
                : 0,
        };
    },

    getPositiveAxisStrength: function(value) {
        if (value <= this.joystickDeadzone) {
            return 0;
        }

        return (value - this.joystickDeadzone) / (1 - this.joystickDeadzone);
    },

    getNegativeAxisStrength: function(value) {
        if (value >= -this.joystickDeadzone) {
            return 0;
        }

        return (Math.abs(value) - this.joystickDeadzone) /
            (1 - this.joystickDeadzone);
    },

    wasButtonJustPressed: function(gamepad, buttonIndex) {
        const isPressed = this.isButtonPressed(gamepad, buttonIndex);
        const wasPressed = Boolean(this.buttonStates[buttonIndex]);
        this.buttonStates[buttonIndex] = isPressed;

        return isPressed && ! wasPressed;
    },

    isButtonPressed: function(gamepad, buttonIndex) {
        const button = gamepad.buttons[buttonIndex];
        if (! button) {
            return false;
        }

        return button.pressed || button.value > this.buttonPressThreshold;
    },
};
