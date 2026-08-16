"use strict";

/**
 * Handles portrait displays and their animations
 */
const Portrait = {
    FRAME_WIDTH: 220,
    FRAME_HEIGHT: 168,

    animationDefinitions: {},
    $container: null,
    $canvas: null,
    context: null,
    $header: null,
    images: {},
    tintedImages: new Map(),

    onShow: null,
    onHide: null,

    animationName: null,
    animationDefinition: null,
    animationImage: null,
    frame: 0,
    frameDirection: 1,
    frameStartedAtMs: null,
    animationRequestId: null,
    running: false,
    tint: null,
    flipped: false,
    nextAnimation: null,

    initialize: async function ($container, animationDefinitions) {
        if (! ($container instanceof Element)) {
            console.error("The $container must be an element", { $container });
            return;
        }

        this.$container = $container;

        const $header = $container.querySelector(".ui-header");
        $header
            ? this.$header = $header
            : console.warn("Container has no UI header", { $container });

        const $canvas = $container.querySelector("canvas");
        if (! $canvas) {
            console.error("The container has no canvas", { $container });
            return;
        }

        this.$canvas = $canvas;
        this.$canvas.width = this.FRAME_WIDTH;
        this.$canvas.height = this.FRAME_HEIGHT;

        this.context = $canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;

        if (typeof animationDefinitions !== "object") {
            console.error(
                "Animation definitions must be an object",
                { animationDefinitions }
            );
            return;
        }

        this.animationDefinitions = animationDefinitions;

        await this.preloadImages();
    },

    preloadImages: async function () {
        const promises = Object.keys(this.animationDefinitions).map(
            animationName => this.preloadImage(animationName)
        );

        const results = await Promise.allSettled(promises);

        for (const result of results) {
            if (result.status === "rejected") {
                console.error(result.reason);
            }
        }
    },

    preloadImage: function (animationName) {
        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = () => {
                const isValid =
                    image.naturalWidth === this.FRAME_WIDTH &&
                    image.naturalHeight % this.FRAME_HEIGHT === 0;

                if (! isValid) {
                    reject(new Error(
                        `Invalid portrait sheet dimensions for ` +
                        `${animationName}: ` +
                        `${image.naturalWidth}x${image.naturalHeight}`
                    ));
                    return;
                }

                this.images[animationName] = image;
                resolve();
            };

            image.onerror = () => {
                reject(new Error(
                    `Could not load portrait animation: ${animationName}`
                ));
            };

            image.src = `assets/sprite-sheets/portraits/${animationName}.png`;
        });
    },

    show: function(animationName, options = {}) {
        this._show(animationName, options);
    },

    showPartyMember: function(partyMember) {
        const portrait = partyMember.portrait;
        if (typeof portrait !== "object") {
            console.error("Party member has no portrait", { partyMember });
            return;
        }

        this._show(portrait.name, {
            text: partyMember.name,
            tint: portrait.tint,
            flipped: portrait.flipped
        });
    },

    _show: function (
        portraitName,
        {
            text = "",
            tint = null,
            flipped = false,
        }
    ) {
        if (! this.$canvas) {
            console.error("Portrait has not been initialized");
            return;
        }

        const image = this.images[portraitName];
        if (! image) {
            console.error("Portrait was not preloaded", { portraitName });
            return;
        }

        const started = this.startAnimation(
            portraitName,
            { tint, flipped }
        );

        if (! started) {
            return;
        }

        this.setHeader(text);
        this.onShow?.();
        this.$container.classList.remove("hidden");
    },

    hide: function () {
        this.stopAnimation();
        this.$container?.classList.add("hidden");
        this.onHide?.();
    },

    setHeader: function(text) {
        if (! this.$header) {
            console.warn("No header element was identified", { text });
            return;
        }

        if (typeof text !== "string" || text.trim() === "") {
            console.error("text must be a populated string", { text });
            this.$header.textContent = "???";
            return;
        }

        this.$header.textContent = text;
    },

    startAnimation: function (
        animationName,
        { tint = null, flipped = false } = {}
    ) {
        const definition = this.animationDefinitions[animationName];
        const image = this.images[animationName];

        if (! definition || ! image) {
            console.error(
                "Could not start portrait animation",
                { animationName }
            );
            return false;
        }

        if (! this.validateDefinition(animationName, definition, image)) {
            return false;
        }

        this.stopAnimation();

        this.animationName = animationName;
        this.animationDefinition = definition;
        this.animationImage = this.getTintedImage(animationName, image, tint);

        this.frame = 0;
        this.frameDirection = 1;
        this.frameStartedAtMs = performance.now();

        this.tint = tint;
        this.flipped = flipped;
        this.nextAnimation = definition.nextAnimation;

        this.running = true;

        this.drawFrame();

        this.animationRequestId =
            requestAnimationFrame(timestampMs => this.animate(timestampMs));

        return true;
    },

    stopAnimation: function () {
        if (this.animationRequestId !== null) {
            cancelAnimationFrame(this.animationRequestId);
            this.animationRequestId = null;
        }

        this.running = false;
        this.frameStartedAtMs = null;
    },

    animate: function (timestampMs) {
        if (! this.running) {
            return;
        }

        let transitions = 0;

        while (this.running) {
            const frameDelayMs = this.getFrameDelayMs();
            const elapsedMs = timestampMs - this.frameStartedAtMs;
            if (elapsedMs < frameDelayMs) {
                break;
            }

            this.frameStartedAtMs += frameDelayMs;

            const result = this.advanceFrame(timestampMs);
            if (result === "finished") {
                break;
            }

            this.drawFrame();

            if (result === "transitioned") {
                break;
            }

            transitions++;

            if (transitions >= 20) {
                console.warn(
                    "Portrait animation exceeded catch-up limit",
                    { animationName: this.animationName }
                );

                this.frameStartedAtMs = timestampMs;
                break;
            }
        }

        if (! this.running) {
            this.animationRequestId = null;
            return;
        }

        this.animationRequestId = requestAnimationFrame(
            nextTimestampMs => this.animate(nextTimestampMs)
        );
    },

    advanceFrame: function (timestampMs) {
        const frameCount = this.getFrameCount();
        const playbackMode = this.animationDefinition.playbackMode;

        if (playbackMode === "repeat") {
            this.frame = (this.frame + 1) % frameCount;
            return "advanced";
        }

        if (playbackMode === "bidirectional") {
            if (frameCount === 1) {
                return "advanced";
            }

            this.frame += this.frameDirection;

            if (this.frame === frameCount - 1) {
                this.frameDirection = -1;
            } else if (this.frame === 0) {
                this.frameDirection = 1;
            }

            return "advanced";
        }

        if (this.frame < frameCount - 1) {
            this.frame++;

            return "advanced";
        }

        if (this.nextAnimation) {
            const nextAnimation = this.nextAnimation;
            const nextDefinition = this.animationDefinitions[nextAnimation];
            const tint = this.tint;
            const flipped = this.flipped;

            const animationStateSet = this.setAnimationState(
                nextAnimation,
                { tint, flipped, nextAnimation: nextDefinition.nextAnimation },
                timestampMs
            );

            if (animationStateSet) {
                return "transitioned";
            }

            this.running = false;
            return "finished";
        }

        this.running = false;
        return "finished";
    },

    setAnimationState: function (
        animationName,
        {
            tint = null,
            flipped = false,
            nextAnimation = null,
        } = {},
        timestampMs = performance.now()
    ) {
        const definition = this.animationDefinitions[animationName];
        const image = this.images[animationName];

        if (! definition || ! image) {
            console.error("Could not transition portrait", { animationName });
            return false;
        }

        if (! this.validateDefinition(animationName, definition, image)) {
            return false;
        }

        this.animationName = animationName;
        this.animationDefinition = definition;
        this.animationImage = this.getTintedImage(animationName, image, tint);

        this.frame = 0;
        this.frameDirection = 1;
        this.frameStartedAtMs = timestampMs;

        this.tint = tint;
        this.flipped = flipped;
        this.nextAnimation = nextAnimation;

        this.running = true;

        return true;
    },

    getFrameCount: function () {
        const image = this.animationImage;
        return (image.naturalHeight || image.height) / this.FRAME_HEIGHT;
    },

    getFrameDelayMs: function () {
        const frameDelayMs = this.animationDefinition.frameDelayMs;

        return Array.isArray(frameDelayMs)
            ? frameDelayMs[this.frame]
            : frameDelayMs;
    },

    drawFrame: function () {
        if (! this.animationImage) {
            return;
        }

        const sourceY = this.frame * this.FRAME_HEIGHT;
        this.context.clearRect(0, 0, this.FRAME_WIDTH, this.FRAME_HEIGHT);
        this.context.save();

        if (this.flipped) {
            this.context.translate(this.FRAME_WIDTH, 0);
            this.context.scale(-1, 1);
        }

        this.context.drawImage(
            this.animationImage,
            0,
            sourceY,
            this.FRAME_WIDTH,
            this.FRAME_HEIGHT,
            0,
            0,
            this.FRAME_WIDTH,
            this.FRAME_HEIGHT
        );

        this.context.restore();
    },

    getTintedImage: function (animationName, image, tint) {
        if (! tint) {
            return image;
        }

        const normalizedTint = tint.toLowerCase();
        const cacheKey = `${animationName}:${normalizedTint}`;
        const cachedImage = this.tintedImages.get(cacheKey);
        if (cachedImage) {
            return cachedImage;
        }

        const tintRgb = this.parseHexColor(normalizedTint);
        if (! tintRgb) {
            console.error("Invalid portrait tint", { tint });
            return image;
        }

        const $tintedCanvas = document.createElement("canvas");
        $tintedCanvas.width = image.naturalWidth;
        $tintedCanvas.height = image.naturalHeight;

        const context =
            $tintedCanvas.getContext("2d", { willReadFrequently: true });

        context.imageSmoothingEnabled = false;
        context.drawImage(image, 0, 0);

        const imageData = context
            .getImageData(0, 0, $tintedCanvas.width, $tintedCanvas.height);

        const pixels = imageData.data;

        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] === 0) {
                continue;
            }

            // Tint based on RGB luminance
            const intensity = (
                pixels[i] * 0.2126 +
                pixels[i + 1] * 0.7152 +
                pixels[i + 2] * 0.0722
            ) / 255;

            pixels[i] = Math.round(tintRgb.red * intensity);
            pixels[i + 1] = Math.round(tintRgb.green * intensity);
            pixels[i + 2] = Math.round(tintRgb.blue * intensity);
        }

        context.putImageData(imageData, 0, 0);
        this.tintedImages.set(cacheKey, $tintedCanvas);

        return $tintedCanvas;
    },

    parseHexColor: function (color) {
        const shortHexMatch = /^#([0-9a-f]{3})$/i.exec(color);

        if (shortHexMatch) {
            const [red, green, blue] = shortHexMatch[1];
            return {
                red: parseInt(red + red, 16),
                green: parseInt(green + green, 16),
                blue: parseInt(blue + blue, 16),
            };
        }

        const hexMatch = /^#([0-9a-f]{6})$/i.exec(color);
        if (! hexMatch) {
            return null;
        }

        return {
            red: parseInt(hexMatch[1].slice(0, 2), 16),
            green: parseInt(hexMatch[1].slice(2, 4), 16),
            blue: parseInt(hexMatch[1].slice(4, 6), 16),
        };
    },

    validateDefinition: function (animationName, definition, image) {
        const frameCount = image.naturalHeight / this.FRAME_HEIGHT;
        const validPlaybackModes = ["repeat", "once", "bidirectional" ];

        if (! validPlaybackModes.includes(definition.playbackMode)) {
            console.error("Invalid playback mode", { definition });
            return false;
        }

        const delays = definition.frameDelayMs;

        if (Array.isArray(delays)) {
            const validDelayCount = delays.length === frameCount;
            const validDelays = delays
                .every(delayMs => Number.isFinite(delayMs) && delayMs > 0);

            if (! validDelayCount || ! validDelays) {
                console.error(
                    "Invalid portrait frame delays",
                    { animationName, frameCount, delays }
                );
                return false;
            }

            return true;
        }

        if (! Number.isFinite(delays) || delays <= 0) {
            console.error(
                "Invalid portrait frame delay",
                { animationName, frameDelayMs: delays, }
            );
            return false;
        }

        return true;
    },
};
