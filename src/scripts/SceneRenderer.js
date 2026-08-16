"use strict";

/**
 * The Scene Renderer handles drawing the pseudo-3D environment in the viewport
 */
const SceneRenderer = {
    mapEntity: null,
    tileSize: 1,
    epsilon: 0.000001,
    $canvas: null,
    $enemyLayer: null,
    context: null,
    width: 0,
    height: 0,
    aspectRatio: 0,
    $backgroundImage: null,
    $backgroundCanvas: null,
    backgroundContext: null,
    backgroundImageData: null,
    $textureImage: null,
    displayWidth: 50,
    displayHeight: 28,
    stripWidth: 1,
    spriteStripWidth: 1,
    wallDepthByStrip: null,
    wallHeightStep: 1,
    maxViewDepth: 5,
    fovDegrees: 90,
    mapSpritesEnabled: true,
    sprites: [],
    battleSprites: [],
    battleRowDepths: [ 0.60, 1.00, 1.40 ],
    battleRowHorizontalOffset: 0.40,
    battleSpriteDimmedOpacity: 0.2,
    battleSpriteHighlightDurationMs: 150,
    battleSpriteTint: Object.freeze({
        red: 247,
        green: 128,
        blue: 128,
        amount: 1,
    }),

    battleSpriteEffectDefaults: Object.freeze({
        translateX: 0,
        translateY: 0,
        rotation: 0,
        skewX: 0,
        skewY: 0,
        scaleX: 1,
        scaleY: 1,
        brightness: 1,
        contrast: 1,
        hueRotation: 0,
        invert: 0,
        opacity: 1,
        tintRed: 255,
        tintGreen: 0,
        tintBlue: 0,
        tintAmount: 0,
    }),

    battleSpriteEffectProperties: Object.freeze([
        "translateX",
        "translateY",
        "rotation",
        "skewX",
        "skewY",
        "scaleX",
        "scaleY",
        "brightness",
        "contrast",
        "hueRotation",
        "invert",
        "opacity",
        "tintRed",
        "tintGreen",
        "tintBlue",
        "tintAmount",
    ]),

    battleSpriteEffects: Object.freeze({
        damageReaction: {
            durationMs: 168,
            interpolation: "smooth",

            keyframes: [
                {
                    offset: 0,
                    translateX: 0,
                    skewX: 0,
                    rotation: 0,
                    tintAmount: 1,
                },
                {
                    offset: 0.2,
                    translateX: -4,
                    skewX: -6,
                    rotation: -2,
                    tintAmount: 0.8,
                },
                {
                    offset: 0.4,
                    translateX: 4,
                    skewX: 6,
                    rotation: 2,
                    tintAmount: 0.6,
                },
                {
                    offset: 0.6,
                    translateX: -4,
                    skewX: -8,
                    rotation: -3,
                    tintAmount: 0.4,
                },
                {
                    offset: 0.8,
                    translateX: 4,
                    skewX: 8,
                    rotation: 3,
                    tintAmount: 0.2,
                },
                {
                    offset: 1,
                    translateX: 0,
                    skewX: 0,
                    rotation: 0,
                    tintAmount: 0,
                },
            ],
        },

        crtFlash: {
            durationMs: 500,
            interpolation: "step",

            keyframes: [
                { offset: 0, invert: 1 },
                { offset: 0.1, invert: 0 },
                { offset: 0.2, invert: 1 },
                { offset: 0.3, invert: 0 },
                { offset: 0.4, invert: 1 },
                { offset: 0.5, invert: 0 },
                { offset: 0.6, invert: 1 },
                { offset: 0.7, invert: 0 },
                { offset: 0.8, invert: 1 },
                { offset: 0.9, invert: 0 },
                { offset: 1, invert: 0 },
            ],
        },

        poke: {
            durationMs: 600,
            interpolation: "linear",

            keyframes: [
                {
                    offset: 0,
                    translateX: 1,
                    translateY: 1,
                    scaleX: 1,
                    scaleY: 1,
                    skewY: 0,
                    tintRed: 255,
                    tintGreen: 0,
                    tintBlue: 0,
                    tintAmount: 1,
                },
                {
                    offset: 0.1,
                    translateX: 0,
                    translateY: 0,
                    scaleX: 1,
                    scaleY: 1,
                    skewY: 0,
                    tintRed: 247,
                    tintGreen: 128,
                    tintBlue: 128,
                    tintAmount: 1,
                },
                {
                    offset: 0.2,
                    translateX: 0,
                    translateY: 0,
                    scaleX: 1,
                    scaleY: 1,
                    skewY: 0,
                    tintRed: 247,
                    tintGreen: 128,
                    tintBlue: 128,
                    tintAmount: 1,
                },
                {
                    offset: 0.49999,
                    translateX: 0,
                    translateY: 0,
                    scaleX: 1,
                    scaleY: 1,
                    skewY: 0,
                    tintRed: 247,
                    tintGreen: 128,
                    tintBlue: 128,
                    tintAmount: 1,
                },
                {
                    offset: 0.5,
                    translateX: 2,
                    translateY: 2,
                    scaleX: 0.7,
                    scaleY: 0.9,
                    skewY: 16,
                    tintRed: 255,
                    tintGreen: 0,
                    tintBlue: 0,
                    tintAmount: 1,
                },
                {
                    offset: 0.6,
                    translateX: 1,
                    translateY: 1,
                    scaleX: 0.85,
                    scaleY: 0.95,
                    skewY: 8,
                    tintRed: 247,
                    tintGreen: 128,
                    tintBlue: 128,
                    tintAmount: 1,
                },
                {
                    offset: 0.7,
                    translateX: 0,
                    translateY: 0,
                    scaleX: 1,
                    scaleY: 1,
                    skewY: 0,
                    tintRed: 247,
                    tintGreen: 128,
                    tintBlue: 128,
                    tintAmount: 1,
                },
                {
                    offset: 1,
                    translateX: 0,
                    translateY: 0,
                    scaleX: 1,
                    scaleY: 1,
                    skewY: 0,
                    tintRed: 247,
                    tintGreen: 128,
                    tintBlue: 128,
                    tintAmount: 1,
                },
            ],
        },

        danceClubHits: {
            durationMs: 1332,
            interpolation: "smooth",

            keyframes: [
                {
                    offset: 0,
                    translateX: 0,
                    skewX: 0,
                    scaleX: 1,
                    scaleY: 1,
                    contrast: 1,
                    brightness: 1,
                    hueRotation: 0,
                },
                {
                    offset: 0.1415,
                    translateX: 0,
                    skewX: 0,
                    scaleX: 1,
                    scaleY: 1,
                    contrast: 5,
                    brightness: 1,
                    hueRotation: 0,
                },
                {
                    offset: 0.1878,
                    translateX: -90,
                    skewX: 20,
                    scaleX: 1,
                    scaleY: 1,
                    contrast: 1,
                    brightness: 5,
                    hueRotation: 2000,
                },
                {
                    offset: 0.3385,
                    translateX: 0,
                    skewX: 0,
                    scaleX: 1,
                    scaleY: 1,
                    contrast: 1,
                    brightness: 3,
                    hueRotation: 1800,
                },
                {
                    offset: 0.3386,
                    translateX: 0,
                    skewX: 0,
                    scaleX: 1,
                    scaleY: 1,
                    contrast: 1,
                    brightness: 1,
                    hueRotation: 1340.2,
                },
                {
                    offset: 0.48,
                    translateX: 90,
                    skewX: -20,
                    scaleX: 1,
                    scaleY: 1,
                    contrast: 1,
                    brightness: 5,
                    hueRotation: 1340,
                },
                {
                    offset: 0.6245,
                    translateX: 0,
                    skewX: 0,
                    scaleX: 1,
                    scaleY: 1,
                    contrast: 1,
                    brightness: 3,
                    hueRotation: 1140,
                },
                {
                    offset: 0.6246,
                    translateX: 0,
                    skewX: 0,
                    scaleX: 1,
                    scaleY: 1,
                    contrast: 1,
                    brightness: 1,
                    hueRotation: 660.2,
                },
                {
                    offset: 0.7,
                    translateX: 0,
                    skewX: 0,
                    scaleX: 1,
                    scaleY: 1,
                    contrast: 1,
                    brightness: 5,
                    hueRotation: 660,
                },
                {
                    offset: 0.77515,
                    translateX: 0,
                    skewX: 0,
                    scaleX: -1,
                    scaleY: 1,
                    contrast: 1,
                    brightness: 3,
                    hueRotation: 460,
                },
                {
                    offset: 0.9249,
                    translateX: 0,
                    skewX: 0,
                    scaleX: 1,
                    scaleY: 1,
                    contrast: 1,
                    brightness: 1,
                    hueRotation: 260,
                },
                {
                    offset: 1,
                    translateX: 0,
                    skewX: 0,
                    scaleX: 1,
                    scaleY: 1,
                    contrast: 1,
                    brightness: 1,
                    hueRotation: 0,
                },
            ],
        },
    }),

    spriteCanvasById: {},
    rayCount: 0,
    rayAngles: [],
    rayScreenOffsets: [],
    rayStripStartXs: [],
    rayStripEndXs: [],
    viewDist: 0,
    baseBuffer: null,
    backBuffer: null,
    wallHitsByStrip: [],
    cameraPoseOverride: null,
    entityPoseOverrides: new Map(),

    ceilingHeight: 1,
    texturedFloorAndCeiling: true,

    textureSize: 200,
    wallImageData: null,

    surfaceTextures: Object.create(null),
    surfaceSpritesByCell: new Map(),
    wallSurfaceSpritesByFace: new Map(),
    spriteCanvasById: {},
    spriteImageDataById: {},

    environmentMap: {
        width: 0,
        height: 0,

        // Light values range from 0.0 to 1.0
        lightR: null,
        lightG: null,
        lightB: null,

        fogDensity: null,
        fogR: null,
        fogG: null,
        fogB: null,
    },
    environmentDynamics: [],
    dynamicLightsByCell: [],
    dynamicFogsByCell: [],
    dynamicLightVisibilityCache: new WeakMap(),

    fogSampleStep: 0.25,
    minimumFogLight: 0.05,
    fogProfilesByStrip: [],
    fogDistanceVisibilityBySample: null,
    ceilingFogSampleIndexByY: null,
    currentSightDistance: 5,
    currentSightSensitivity: 1,
    defaultLightVisibilityDistance: 10,
    currentVisibilityDistance: 5,
    frontCellLightBonus: 0.25,
    frontLightCellX: -1,
    frontLightCellY: -1,
    sightRangeOverride: null,

    $sceneCanvas: null,
    sceneContext: null,
    sceneDirty: true,
    animationFrameId: null,
    lastPresentationTimeMs: 0,
    presentationIntervalMs: 1000 / 20,

    profilingEnabled: false,
    profilingCountersEnabled: false,
    profilingReportEveryFrames: 120,
    profilingFrameCount: 0,
    profilingTotals: Object.create(null),
    profilingMaximums: Object.create(null),
    profilingCounters: Object.create(null),
    profilingLastFrameTimeMs: null,
    profilingLargestFrameGapMs: 0,
    profilingLastPresentationRenderMs: 0,
    profilingLargestFrameGapDetails: null,
    zeroTransmittanceSamples: 0,

    dynamicLightSampleScratch: { red: 0, green: 0, blue: 0, visibility: 0 },
    noDynamicLightSampleScratch: { red: 0, green: 0, blue: 0, visibility: 0 },
    dynamicFogLayersScratch: {
        uncapped: { density: 0, red: 0, green: 0, blue: 0 },
        ceiling: { density: 0, red: 0, green: 0, blue: 0 },
    },
    surfaceShadingScratch: {
        lightRed: 1,
        lightGreen: 1,
        lightBlue: 1,
        fogTransmittance: 1,
        fogRed: 0,
        fogGreen: 0,
        fogBlue: 0,
    },

    animatedSpritesPresent: false,
    nextSpriteAnimationTimeMs: Infinity,
    forceNextPresentation: false,
    effectTransitions: new Map(),
    effects: {
        drunkenness: 0,
        wallDarkness: 0,
    },

    initialize: async function(mapEntity) {
        if (typeof mapEntity !== "object") {
            console.error("mapEntity must be an object", { mapEntity });
            return;
        }

        this.mapEntity = mapEntity;
        this.fovRadians = this.fovDegrees * Math.PI / 180;
        this.viewDist = (this.displayWidth / 2) / Math.tan(this.fovRadians / 2);
        this.rayCount = Math.ceil(this.displayWidth / this.stripWidth);
        this.createRayAngles();

        if (this.$canvas) {
            this.rebuildProjection();
        }

        this.createEnvironmentMap(mapEntity.gameMap);

        this.surfaceTextures.default = this.generateDefaultTexture();
        this.surfaceTextures.floor =
            this.generateNoiseTexture("#533618", "#1a1a1a");
        this.surfaceTextures.ceiling =
            this.generateNoiseTexture("#3a0101", "#1e0101");
        this.surfaceTextures.stone =
            this.generateNoiseTexture("#555555", "#303030");
        this.surfaceTextures.moss =
            this.generateNoiseTexture("#27351f", "#10180d");

        await Promise.all([
            this.loadSurfaceTexture(
                "demo01ceiling01",
                "assets/textures/demo01/ceiling01.png"
            ),
            this.loadSurfaceTexture(
                "demo01floor01",
                "assets/textures/demo01/floor01.png"
            ),
            this.loadSurfaceTexture(
                "demo01wall01",
                "assets/textures/demo01/wall01.png"
            ),
            this.loadSurfaceTexture(
                "demo01wall02",
                "assets/textures/demo01/wall02.png"
            ),
            this.loadSurfaceTexture(
                "demo01wall03",
                "assets/textures/demo01/wall03.png"
            ),
            this.loadSurfaceTexture(
                "demo01kkext01",
                "assets/textures/demo01/kkext01.png"
            ),
            this.loadSurfaceTexture(
                "demo01kkext02",
                "assets/textures/demo01/kkext02.png"
            ),
            this.loadSurfaceTexture(
                "demo01kkext03",
                "assets/textures/demo01/kkext03.png"
            ),
            this.loadSurfaceTexture(
                "demo01kkext04",
                "assets/textures/demo01/kkext04.png"
            ),
            this.loadSurfaceTexture(
                "demo01kkextflags",
                "assets/textures/demo01/kkextflags.png"
            ),
        ]);
    },

    loadSurfaceTexture: function(textureId, src) {
        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = this.textureSize;
                canvas.height = this.textureSize;

                const ctx = canvas.getContext("2d");
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(image, 0, 0, this.textureSize, this.textureSize);
                this.surfaceTextures[textureId] =
                    ctx.getImageData(0, 0, this.textureSize, this.textureSize);

                resolve(this.surfaceTextures[textureId]);
            };

            image.onerror =
                () => reject(new Error(`Unable to load texture: ${src}`));
            image.src = src;
        });
    },

    createEnvironmentMap: function(gameMap) {
        this.invalidateDynamicLightVisibilityCache();

        const cellCount = gameMap.width * gameMap.height;

        this.environmentMap = {
            width: gameMap.width,
            height: gameMap.height,

            lightR: new Float32Array(cellCount),
            lightG: new Float32Array(cellCount),
            lightB: new Float32Array(cellCount),

            fogDensity: new Float32Array(cellCount),
            fogR: new Float32Array(cellCount),
            fogG: new Float32Array(cellCount),
            fogB: new Float32Array(cellCount),
        };

        this.environmentMap.lightR.fill(1);
        this.environmentMap.lightG.fill(1);
        this.environmentMap.lightB.fill(1);

        this.environmentMap.fogDensity.fill(0);
        this.environmentMap.fogR.fill(0);
        this.environmentMap.fogG.fill(0);
        this.environmentMap.fogB.fill(0);

        // for (let cellY = 8; cellY <= 12; cellY++) {
        //     for (let cellX = 10; cellX <= 14; cellX++) {
        //         const index = this.getEnvironmentIndex(cellX, cellY);
        //         if (index < 0) {
        //             continue;
        //         }

        //         this.environmentMap.fogDensity[index] = 2.65;
        //         this.environmentMap.fogR[index] = 0.85;
        //         this.environmentMap.fogG[index] = 0.25;
        //         this.environmentMap.fogB[index] = 0.8;
        //     }
        // }
    },

    getEnvironmentIndex: function(cellX, cellY) {
        const environmentMap = this.environmentMap;
        if (! environmentMap) {
            return -1;
        }

        const isOutOfBounds =
            cellX < 0 ||
            cellY < 0 ||
            cellX >= environmentMap.width ||
            cellY >= environmentMap.height;

        if (isOutOfBounds) {
            return -1;
        }

        return cellX + cellY * environmentMap.width;
    },

    ensureFogProfiles: function(maxDistance = this.maxViewDepth) {
        const safeMaxDistance = Math.max(this.fogSampleStep, maxDistance);
        const sampleCount = Math.ceil(safeMaxDistance / this.fogSampleStep) + 1;
        const profilesAreValid =
            this.fogProfilesByStrip.length === this.rayCount &&
            this.fogProfilesByStrip[0]?.transmittance.length === sampleCount &&
            this.fogProfilesByStrip[0]?.fogTransmittance.length ===
                sampleCount &&
            this.fogProfilesByStrip[0]?.ceilingFogTransmittance.length ===
                sampleCount;

        if (profilesAreValid) {
            return;
        }

        this.fogProfilesByStrip = Array.from(
            { length: this.rayCount },
            () => ({
                transmittance: new Float32Array(sampleCount),
                fogTransmittance: new Float32Array(sampleCount),
                red: new Float32Array(sampleCount),
                green: new Float32Array(sampleCount),
                blue: new Float32Array(sampleCount),
                uncappedFogTransmittance: new Float32Array(sampleCount),
                uncappedRed: new Float32Array(sampleCount),
                uncappedGreen: new Float32Array(sampleCount),
                uncappedBlue: new Float32Array(sampleCount),
                ceilingFogTransmittance: new Float32Array(sampleCount),
                ceilingRed: new Float32Array(sampleCount),
                ceilingGreen: new Float32Array(sampleCount),
                ceilingBlue: new Float32Array(sampleCount),
            })
        );
    },

    updateFogProfiles: function(cameraPose, sightDistance, timeMs) {
        this.ensureFogProfiles(this.currentVisibilityDistance);

        const firstProfile = this.fogProfilesByStrip[0];
        if (firstProfile) {
            this.updateFogDistanceVisibilitySamples(
                firstProfile.transmittance.length,
                sightDistance
            );
        }

        const environmentMap = this.environmentMap;
        const { x, y, angle } = cameraPose;

        for (let strip = 0; strip < this.rayCount; strip++) {
            const rayOffset = this.rayAngles[strip];
            const rayAngle = angle + rayOffset;

            this.updateFogProfile(
                this.fogProfilesByStrip[strip],
                x,
                y,
                rayAngle,
                rayOffset,
                environmentMap,
                timeMs
            );
        }
    },

    updateFogProfile: function(
        profile,
        originX,
        originY,
        rayAngle,
        rayOffset,
        environmentMap,
        timeMs
    ) {
        const sampleStep = this.fogSampleStep;
        const directionX = Math.cos(rayAngle);
        const directionY = -Math.sin(rayAngle);
        const cosineCorrection =
            Math.max(this.epsilon, Math.abs(Math.cos(rayOffset)));
        const raySampleStep = sampleStep / cosineCorrection;

        const worldStepX = directionX * raySampleStep;
        const worldStepY = directionY * raySampleStep;
        let perpendicularDistance = sampleStep * 0.5;
        let worldX = originX + directionX * raySampleStep * 0.5;
        let worldY = originY + directionY * raySampleStep * 0.5;

        const totalState = {
            transmittance: 1,
            red: 0,
            green: 0,
            blue: 0,
        };

        const uncappedState = {
            transmittance: 1,
            red: 0,
            green: 0,
            blue: 0,
        };

        const ceilingState = {
            transmittance: 1,
            red: 0,
            green: 0,
            blue: 0,
        };

        profile.transmittance[0] = 1;
        profile.fogTransmittance[0] = 1;

        profile.red[0] = 0;
        profile.green[0] = 0;
        profile.blue[0] = 0;

        profile.uncappedFogTransmittance[0] = 1;
        profile.uncappedRed[0] = 0;
        profile.uncappedGreen[0] = 0;
        profile.uncappedBlue[0] = 0;

        profile.ceilingFogTransmittance[0] = 1;
        profile.ceilingRed[0] = 0;
        profile.ceilingGreen[0] = 0;
        profile.ceilingBlue[0] = 0;

        let cachedCellX = Number.NaN;
        let cachedCellY = Number.NaN;
        let cachedEnvironmentIndex = -1;
        let cachedStaticDensity = 0;
        let cachedStaticFogRed = 0;
        let cachedStaticFogGreen = 0;
        let cachedStaticFogBlue = 0;
        let cachedStaticLightRed = 1;
        let cachedStaticLightGreen = 1;
        let cachedStaticLightBlue = 1;

        for (let i = 1; i < profile.transmittance.length; i++) {
            const cellX = Math.floor(worldX);
            const cellY = Math.floor(worldY);

            if (cellX !== cachedCellX || cellY !== cachedCellY) {
                cachedCellX = cellX;
                cachedCellY = cellY;
                cachedEnvironmentIndex = this.getEnvironmentIndex(cellX, cellY);

                if (cachedEnvironmentIndex >= 0) {
                    cachedStaticDensity = Math.max(
                        0,
                        environmentMap.fogDensity[cachedEnvironmentIndex] ?? 0
                    );

                    cachedStaticFogRed =
                        environmentMap.fogR[cachedEnvironmentIndex] ?? 0;
                    cachedStaticFogGreen =
                        environmentMap.fogG[cachedEnvironmentIndex] ?? 0;
                    cachedStaticFogBlue =
                        environmentMap.fogB[cachedEnvironmentIndex] ?? 0;
                    cachedStaticLightRed =
                        environmentMap.lightR[cachedEnvironmentIndex] ?? 1;
                    cachedStaticLightGreen =
                        environmentMap.lightG[cachedEnvironmentIndex] ?? 1;
                    cachedStaticLightBlue =
                        environmentMap.lightB[cachedEnvironmentIndex] ?? 1;
                } else {
                    cachedStaticDensity = 0;
                    cachedStaticFogRed = 0;
                    cachedStaticFogGreen = 0;
                    cachedStaticFogBlue = 0;
                    cachedStaticLightRed = 1;
                    cachedStaticLightGreen = 1;
                    cachedStaticLightBlue = 1;
                }
            }

            const environmentIndex = cachedEnvironmentIndex;
            const staticDensity = cachedStaticDensity;
            const staticFogRed = cachedStaticFogRed;
            const staticFogGreen = cachedStaticFogGreen;
            const staticFogBlue = cachedStaticFogBlue;

            const dynamicFog = this.getDynamicFogLayersAt(
                worldX,
                worldY,
                timeMs,
                environmentIndex
            );
            const uncappedDynamicFog = dynamicFog.uncapped;
            const ceilingDynamicFog = dynamicFog.ceiling;

            const uncappedDensity = staticDensity + uncappedDynamicFog.density;
            const ceilingDensity = ceilingDynamicFog.density;
            const totalDensity = uncappedDensity + ceilingDensity;

            let uncappedRed = 0;
            let uncappedGreen = 0;
            let uncappedBlue = 0;

            if (uncappedDensity > this.epsilon) {
                uncappedRed = (
                    staticFogRed *
                    staticDensity +
                    uncappedDynamicFog.red *
                    uncappedDynamicFog.density
                ) / uncappedDensity;

                uncappedGreen = (
                    staticFogGreen *
                    staticDensity +
                    uncappedDynamicFog.green *
                    uncappedDynamicFog.density
                ) / uncappedDensity;

                uncappedBlue = (
                    staticFogBlue *
                    staticDensity +
                    uncappedDynamicFog.blue *
                    uncappedDynamicFog.density
                ) / uncappedDensity;
            }

            let totalRed = 0;
            let totalGreen = 0;
            let totalBlue = 0;

            if (totalDensity > this.epsilon) {
                totalRed = (
                    uncappedRed *
                    uncappedDensity +
                    ceilingDynamicFog.red *
                    ceilingDensity
                ) / totalDensity;

                totalGreen = (
                    uncappedGreen *
                    uncappedDensity +
                    ceilingDynamicFog.green *
                    ceilingDensity
                ) / totalDensity;

                totalBlue = (
                    uncappedBlue *
                    uncappedDensity +
                    ceilingDynamicFog.blue *
                    ceilingDensity
                ) / totalDensity;
            }

            if (totalDensity > 0) {
                const uncappedSegmentTransmittance =
                    uncappedDensity > 0
                        ? Math.exp(-uncappedDensity * raySampleStep)
                        : 1;
                const ceilingSegmentTransmittance =
                    ceilingDensity > 0
                        ? Math.exp(-ceilingDensity * raySampleStep)
                        : 1;
                const totalSegmentTransmittance =
                    uncappedSegmentTransmittance * ceilingSegmentTransmittance;

                const dynamicLight = this.getDynamicLightSampleAt(
                    worldX,
                    worldY,
                    perpendicularDistance,
                    timeMs,
                    environmentIndex
                );
                const lightRed = Math.max(
                    this.minimumFogLight,
                    cachedStaticLightRed + dynamicLight.red
                );
                const lightGreen = Math.max(
                    this.minimumFogLight,
                    cachedStaticLightGreen + dynamicLight.green
                );
                const lightBlue = Math.max(
                    this.minimumFogLight,
                    cachedStaticLightBlue + dynamicLight.blue
                );

                const segmentVisibility = dynamicLight.visibility;

                this.accumulateFogState(
                    totalState,
                    totalSegmentTransmittance,
                    totalRed,
                    totalGreen,
                    totalBlue,
                    lightRed,
                    lightGreen,
                    lightBlue,
                    segmentVisibility
                );

                this.accumulateFogState(
                    uncappedState,
                    uncappedSegmentTransmittance,
                    uncappedRed,
                    uncappedGreen,
                    uncappedBlue,
                    lightRed,
                    lightGreen,
                    lightBlue,
                    segmentVisibility
                );

                this.accumulateFogState(
                    ceilingState,
                    ceilingSegmentTransmittance,
                    ceilingDynamicFog.red,
                    ceilingDynamicFog.green,
                    ceilingDynamicFog.blue,
                    lightRed,
                    lightGreen,
                    lightBlue,
                    segmentVisibility
                );
            }

            const backgroundVisibility = this.fogDistanceVisibilityBySample[i];

            profile.fogTransmittance[i] = totalState.transmittance;
            profile.transmittance[i] =
                totalState.transmittance * backgroundVisibility;
            profile.red[i] = totalState.red;
            profile.green[i] = totalState.green;
            profile.blue[i] = totalState.blue;
            profile.uncappedFogTransmittance[i] = uncappedState.transmittance;
            profile.uncappedRed[i] = uncappedState.red;
            profile.uncappedGreen[i] = uncappedState.green;
            profile.uncappedBlue[i] = uncappedState.blue;
            profile.ceilingFogTransmittance[i] = ceilingState.transmittance;
            profile.ceilingRed[i] = ceilingState.red;
            profile.ceilingGreen[i] = ceilingState.green;
            profile.ceilingBlue[i] = ceilingState.blue;

            worldX += worldStepX;
            worldY += worldStepY;
            perpendicularDistance += sampleStep;
        }
    },

    updateFogDistanceVisibilitySamples: function(profileLength, sightDistance) {
        const needsBuffer =
            ! this.fogDistanceVisibilityBySample ||
            this.fogDistanceVisibilityBySample.length !== profileLength;

        if (needsBuffer) {
            this.fogDistanceVisibilityBySample =
                new Float32Array(profileLength);
        }

        const visibility = this.fogDistanceVisibilityBySample;

        for (let i = 0; i < profileLength; i++) {
            visibility[i] = this
                .getDistanceVisibility(i * this.fogSampleStep, sightDistance);
        }
    },

    updateCeilingFogSampleIndexes: function(profileLength) {
        const initializeIndex =
            ! this.ceilingFogSampleIndexByY ||
            this.ceilingFogSampleIndexByY.length !== this.displayHeight;

        if (initializeIndex) {
            this.ceilingFogSampleIndexByY = new Uint16Array(this.displayHeight);
        }

        const indexes = this.ceilingFogSampleIndexByY;
        const maximumIndex = profileLength - 1;
        const centerY = this.displayHeight / 2;
        const eyeHeight = this.tileSize / 2;
        const ceilingWorldHeight = this.tileSize * this.ceilingHeight;
        const heightAboveEye = ceilingWorldHeight - eyeHeight;

        for (let screenY = 0; screenY < this.displayHeight; screenY++) {
            if (screenY >= centerY) {
                indexes[screenY] = maximumIndex;
                continue;
            }

            if (heightAboveEye <= 0) {
                indexes[screenY] = 0;
                continue;
            }

            const screenDistance = centerY - screenY;

            if (screenDistance <= this.epsilon) {
                indexes[screenY] = maximumIndex;
                continue;
            }

            const exitDistance =
                this.viewDist * heightAboveEye / screenDistance;

            indexes[screenY] = Math.min(
                maximumIndex,
                Math.floor(exitDistance / this.fogSampleStep)
            );
        }
    },

    getCeilingFogSampleIndex: function(profile, screenY) {
        const centerY = this.displayHeight / 2;

        // Horizontal and downward rays never leave floor-to-ceiling fog volume
        if (screenY >= centerY) {
            return profile.ceilingFogTransmittance.length - 1;
        }

        const eyeHeight = this.tileSize / 2;
        const ceilingWorldHeight = this.tileSize * this.ceilingHeight;
        const heightAboveEye = ceilingWorldHeight - eyeHeight;

        if (heightAboveEye <= 0) {
            return 0;
        }

        const screenDistance = centerY - screenY;
        if (screenDistance <= this.epsilon) {
            return profile.ceilingFogTransmittance.length - 1;
        }

        // Perpendicular distance when this ray rises above ceilingHeight
        const exitDistance = this.viewDist * heightAboveEye / screenDistance;

        return this.getFogSampleIndex(profile, exitDistance);
    },

    accumulateFogState: function(
        state,
        segmentTransmittance,
        fogRed,
        fogGreen,
        fogBlue,
        lightRed,
        lightGreen,
        lightBlue,
        visibility
    ) {
        if (segmentTransmittance >= 1) {
            return;
        }

        const segmentOpacity = 1 - segmentTransmittance;
        const fogWeight = state.transmittance * segmentOpacity;

        state.red += fogWeight * fogRed * lightRed * visibility;
        state.green += fogWeight * fogGreen * lightGreen * visibility;
        state.blue += fogWeight * fogBlue * lightBlue * visibility;
        state.transmittance *= segmentTransmittance;
    },

    getFogSampleIndex: function(profile, distance) {
        if (! profile || ! Number.isFinite(distance) || distance <= 0) {
            return 0;
        }

        return Math.min(
            profile.transmittance.length - 1,
            Math.floor(distance / this.fogSampleStep)
        );
    },

    collectEnvironmentDynamics: function(gameMap, timeMs) {
        const cellCount = gameMap.width * gameMap.height;
        this.environmentDynamics = [];
        this.dynamicLightsByCell = new Array(cellCount);
        this.dynamicFogsByCell = new Array(cellCount);

        for (const entity of gameMap.entities) {
            if (! Array.isArray(entity.environmentDynamics)) {
                continue;
            }

            const poseOverride = this.entityPoseOverrides.get(entity.id);
            const x = (poseOverride?.x ?? entity.x) + 0.5;
            const y = (poseOverride?.y ?? entity.y) + 0.5;

            for (const definition of entity.environmentDynamics) {
                const dynamic = { ...definition, x, y };

                if (dynamic.light) {
                    const light = dynamic.light;
                    const runtime =
                        this.prepareEnvironmentDynamicComponent(light, timeMs);

                    dynamic.lightRuntime = {
                        ...runtime,
                        red: (light.red ?? 255) / 255,
                        green: (light.green ?? 255) / 255,
                        blue: (light.blue ?? 255) / 255,
                        intensity: light.intensity ?? 1,
                        colorStrength: Math.max(
                            light.red ?? 255,
                            light.green ?? 255,
                            light.blue ?? 255
                        ) / 255,
                        visibilityDistance: Number(
                            light.visibilityDistance ??
                            this.defaultLightVisibilityDistance
                        ),
                    };

                    dynamic.lightVisibleCells =
                        this.getCachedDynamicLightVisibleCells(
                            definition,
                            dynamic,
                            gameMap
                        );

                    this.indexDynamicLightByCell(dynamic);
                }

                if (dynamic.fog) {
                    const fog = dynamic.fog;
                    const runtime =
                        this.prepareEnvironmentDynamicComponent(fog, timeMs);

                    dynamic.fogRuntime = {
                        ...runtime,
                        density: fog.density ?? 0,
                        red: (fog.red ?? 255) / 255,
                        green: (fog.green ?? 255) / 255,
                        blue: (fog.blue ?? 255) / 255,
                        cappedToCeiling: Boolean(fog.cappedToCeiling),
                    };

                    this.indexDynamicFogByCell(dynamic, gameMap);
                }

                this.environmentDynamics.push(dynamic);
            }
        }
    },

    invalidateDynamicLightVisibilityCache: function() {
        this.dynamicLightVisibilityCache = new WeakMap();
    },

    prepareEnvironmentDynamicComponent: function(component, timeMs) {
        const radius = Math.max(0, Number(component.radius ?? 1));
        const softness =
            Math.max(this.epsilon, Number(component.softness ?? radius));
        const edgeStart = Math.max(0, radius - softness);
        const pulseAmount = Math.max(0, Number(component.pulseAmount ?? 0));
        let pulseMultiplier = 1;

        if (pulseAmount > 0) {
            const pulseSpeed = Number(component.pulseSpeed ?? 1);
            const pulse = Math.sin(timeMs * 0.001 * Math.PI * 2 * pulseSpeed);
            pulseMultiplier = Math.max(0, 1 + pulse * pulseAmount);
        }

        return {
            radius,
            radiusSquared: radius * radius,
            edgeStart,
            edgeStartSquared: edgeStart * edgeStart,
            inverseSoftness: 1 / softness,
            pulseMultiplier,
        };
    },

    getEnvironmentDynamicAmount: function(worldX, worldY, dynamic, runtime) {
        if (this.profilingCountersEnabled) {
            this.incrementProfilingCounter("dynamicAmountQueries");
        }

        const deltaX = worldX - dynamic.x;
        const deltaY = worldY - dynamic.y;
        const distanceSquared = deltaX * deltaX + deltaY * deltaY;

        if (distanceSquared >= runtime.radiusSquared) {
            return 0;
        }

        let amount = 1;

        if (distanceSquared > runtime.edgeStartSquared) {
            const distance = Math.sqrt(distanceSquared);
            amount =
                1 - (distance - runtime.edgeStart) * runtime.inverseSoftness;
        }

        return Math.max(0, amount * runtime.pulseMultiplier);
    },

    applyDynamicSpriteLight: function(
        lightRed,
        lightGreen,
        lightBlue,
        dynamicLight
    ) {
        const dynamicMaximum = Math.max(
            dynamicLight.red,
            dynamicLight.green,
            dynamicLight.blue
        );

        if (dynamicMaximum <= this.epsilon) {
            return {
                red: lightRed,
                green: lightGreen,
                blue: lightBlue,
            };
        }

        const tintStrength = Math.min(1, dynamicMaximum);
        const dynamicRed = dynamicLight.red / dynamicMaximum;
        const dynamicGreen = dynamicLight.green / dynamicMaximum;
        const dynamicBlue = dynamicLight.blue / dynamicMaximum;

        // Retain some illumination and shift the color balance
        const brightness = 1 + Math.min(1, dynamicMaximum) * 0.5;
        const tintRed = 1 - tintStrength + dynamicRed * tintStrength;
        const tintGreen = 1 - tintStrength + dynamicGreen * tintStrength;
        const tintBlue = 1 - tintStrength + dynamicBlue * tintStrength;

        return {
            red: lightRed * tintRed * brightness,
            green: lightGreen * tintGreen * brightness,
            blue: lightBlue * tintBlue * brightness,
        };
    },

    getDynamicLightAt: function(worldX, worldY, timeMs) {
        if (this.profilingCountersEnabled) {
            this.incrementProfilingCounter("dynamicLightQueries");
        }

        let red = 0;
        let green = 0;
        let blue = 0;

        const cellX = Math.floor(worldX);
        const cellY = Math.floor(worldY);
        const environmentIndex = this.getEnvironmentIndex(cellX, cellY);

        if (environmentIndex < 0) {
            return { red, green, blue };
        }

        const dynamics = this.dynamicLightsByCell[environmentIndex];
        if (! dynamics) {
            return { red, green, blue };
        }

        for (const dynamic of dynamics) {
            const light = dynamic.light;

            const amount = this.getEnvironmentDynamicAmount(
                worldX,
                worldY,
                dynamic,
                light,
                timeMs
            ) * (light.intensity ?? 1);

            red += (light.red ?? 255) / 255 * amount;
            green += (light.green ?? 255) / 255 * amount;
            blue += (light.blue ?? 255) / 255 * amount;
        }

        return { red, green, blue };
    },

    getDynamicLightVisibilityAt: function(worldX, worldY, distance, timeMs) {
        if (this.profilingCountersEnabled) {
            this.incrementProfilingCounter("dynamicLightVisibilityQueries");
        }

        let visibility = 0;
        const cellX = Math.floor(worldX);
        const cellY = Math.floor(worldY);
        const environmentIndex = this.getEnvironmentIndex(cellX, cellY);

        if (environmentIndex < 0) {
            return 0;
        }

        const dynamics = this.dynamicLightsByCell[environmentIndex];
        if (! dynamics) {
            return 0;
        }

        for (const dynamic of dynamics) {
            const light = dynamic.light;

            const localAmount = this.getEnvironmentDynamicAmount(
                worldX,
                worldY,
                dynamic,
                light,
                timeMs
            );

            if (localAmount <= 0) {
                continue;
            }

            const colorStrength = Math.max(
                light.red ?? 255,
                light.green ?? 255,
                light.blue ?? 255
            ) / 255;

            const lightStrength = Math.min(
                1,
                localAmount * (light.intensity ?? 1) * colorStrength
            );

            if (lightStrength <= 0) {
                continue;
            }

            const visibilityDistance =
                Math.max(
                    this.currentSightDistance,
                    Number(
                        light.visibilityDistance ??
                        this.defaultLightVisibilityDistance
                    )
                );

            if (distance >= visibilityDistance) {
                continue;
            }

            let distanceVisibility = 1;

            if (distance > this.currentSightDistance) {
                const fadeLength =
                    visibilityDistance - this.currentSightDistance;

                if (fadeLength <= this.epsilon) {
                    continue;
                }

                const progress = Math.max(
                    0,
                    Math.min(
                        1,
                        (distance - this.currentSightDistance) / fadeLength
                    )
                );

                const smoothedProgress =
                    progress * progress * (3 - 2 * progress);

                distanceVisibility = 1 - smoothedProgress;
            }

            const lightVisibility = lightStrength * distanceVisibility;
            visibility = 1 - (1 - visibility) * (1 - lightVisibility);
        }

        return visibility;
    },

    getDynamicLightVisibleCells: function(dynamic, gameMap) {
        if (this.profilingCountersEnabled) {
            this.incrementProfilingCounter("lightVisibilityMaskBuilds");
        }

        const visibleCells = new Set();
        const radius = Math.ceil(dynamic.light?.radius ?? 1);
        const sourceCellX = Math.floor(dynamic.x);
        const sourceCellY = Math.floor(dynamic.y);
        const minimumX = Math.max(0, sourceCellX - radius);
        const maximumX = Math.min(gameMap.width - 1, sourceCellX + radius);
        const minimumY = Math.max(0, sourceCellY - radius);
        const maximumY = Math.min(gameMap.height - 1, sourceCellY + radius);

        for (let cellY = minimumY; cellY <= maximumY; cellY++) {
            for (let cellX = minimumX; cellX <= maximumX; cellX++) {
                const intersects = this.doesDynamicRadiusIntersectCell(
                    dynamic,
                    radius,
                    cellX,
                    cellY
                );

                if (! intersects) {
                    continue;
                }

                const hasPath = this
                    .hasClearDynamicLightPath(dynamic, cellX, cellY, gameMap);

                if (hasPath) {
                    const environmentIndex =
                        this.getEnvironmentIndex(cellX, cellY);

                    if (environmentIndex >= 0) {
                        visibleCells.add(environmentIndex);
                    }
                }
            }
        }

        return visibleCells;
    },

    getCachedDynamicLightVisibleCells: function(definition, dynamic, gameMap) {
        const radius = Math.ceil(Number(dynamic.light?.radius ?? 1));
        const cached = this.dynamicLightVisibilityCache.get(definition);

        const cacheIsValid =
            cached &&
            cached.gameMap === gameMap &&
            cached.x === dynamic.x &&
            cached.y === dynamic.y &&
            cached.radius === radius;

        if (cacheIsValid) {
            return cached.visibleCells;
        }

        const visibleCells = this.getDynamicLightVisibleCells(dynamic, gameMap);

        this.dynamicLightVisibilityCache.set(
            definition,
            { gameMap, x: dynamic.x, y: dynamic.y, radius, visibleCells }
        );

        return visibleCells;
    },

    indexDynamicLightByCell: function(dynamic) {
        for (const environmentIndex of dynamic.lightVisibleCells) {
            let dynamics = this.dynamicLightsByCell[environmentIndex];

            if (! dynamics) {
                dynamics = [];
                this.dynamicLightsByCell[environmentIndex] = dynamics;
            }

            dynamics.push(dynamic);
        }
    },

    indexDynamicFogByCell: function(dynamic, gameMap) {
        const radius = Math.ceil(dynamic.fog?.radius ?? 1);
        const sourceCellX = Math.floor(dynamic.x);
        const sourceCellY = Math.floor(dynamic.y);
        const minimumX = Math.max(0, sourceCellX - radius);
        const maximumX = Math.min(gameMap.width - 1, sourceCellX + radius);
        const minimumY = Math.max(0, sourceCellY - radius);
        const maximumY = Math.min(gameMap.height - 1, sourceCellY + radius);

        for (let cellY = minimumY; cellY <= maximumY; cellY++) {
            for (let cellX = minimumX; cellX <= maximumX; cellX++) {
                const intersects = this.doesDynamicRadiusIntersectCell(
                    dynamic,
                    radius,
                    cellX,
                    cellY
                );

                if (! intersects) {
                    continue;
                }

                const environmentIndex = this.getEnvironmentIndex(cellX, cellY);
                if (environmentIndex < 0) {
                    continue;
                }

                let dynamics = this.dynamicFogsByCell[environmentIndex];
                if (! dynamics) {
                    dynamics = [];
                    this.dynamicFogsByCell[environmentIndex] = dynamics;
                }

                dynamics.push(dynamic);
            }
        }
    },

    hasClearDynamicLightPath: function(
        dynamic,
        targetCellX,
        targetCellY,
        gameMap
    ) {
        const startX = dynamic.x;
        const startY = dynamic.y;
        const endX = targetCellX + 0.5;
        const endY = targetCellY + 0.5;
        let cellX = Math.floor(startX);
        let cellY = Math.floor(startY);

        if (cellX === targetCellX && cellY === targetCellY) {
            return true;
        }

        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const stepX = Math.sign(deltaX);
        const stepY = Math.sign(deltaY);
        const tDeltaX = stepX === 0 ? Infinity : Math.abs(1 / deltaX);
        const tDeltaY = stepY === 0 ? Infinity : Math.abs(1 / deltaY);
        const nextBoundaryX = stepX > 0 ? cellX + 1 : cellX;
        const nextBoundaryY = stepY > 0 ? cellY + 1 : cellY;

        let tMaxX = stepX === 0 ? Infinity : (nextBoundaryX - startX) / deltaX;
        let tMaxY = stepY === 0 ? Infinity : (nextBoundaryY - startY) / deltaY;
        const maximumSteps = gameMap.width + gameMap.height + 4;

        for (let step = 0; step < maximumSteps; step++) {
            if (tMaxX < tMaxY) {
                cellX += stepX;
                tMaxX += tDeltaX;
            } else if (tMaxY < tMaxX) {
                cellY += stepY;
                tMaxY += tDeltaY;
            } else {
                // The ray is passing through a corner. Prevent light leaking
                const sideXBlocked = this.isDynamicLightBlockingCell(
                    cellX + stepX,
                    cellY,
                    gameMap
                );

                const sideYBlocked = this.isDynamicLightBlockingCell(
                    cellX,
                    cellY + stepY,
                    gameMap
                );

                if (sideXBlocked || sideYBlocked) {
                    return false;
                }

                cellX += stepX;
                cellY += stepY;
                tMaxX += tDeltaX;
                tMaxY += tDeltaY;
            }

            // The target itself can be a wall
            // Let light illuminate the first surface that it reaches
            if (cellX === targetCellX && cellY === targetCellY) {
                return true;
            }

            if (this.isDynamicLightBlockingCell(cellX, cellY, gameMap)) {
                return false;
            }
        }

        return false;
    },

    isDynamicLightBlockingCell: function(cellX, cellY, gameMap) {
        const isOutOfBounds =
            cellX < 0 ||
            cellY < 0 ||
            cellX >= gameMap.width ||
            cellY >= gameMap.height;

        if (isOutOfBounds) {
            return true;
        }

        return Boolean(gameMap.getCell(cellX, cellY)?.isWall);
    },

    // @TODO Consider removing this since nothing references it
    isDynamicLightVisibleAt: function(dynamic, worldX, worldY) {
        if (! dynamic.lightVisibleCells) {
            return true;
        }

        const environmentIndex = this.getEnvironmentIndex(
            Math.floor(worldX),
            Math.floor(worldY)
        );

        if (environmentIndex < 0) {
            return false;
        }

        return dynamic.lightVisibleCells.has(environmentIndex);
    },

    getWorldVisibilityAt: function(worldX, worldY, distance, timeMs) {
        const sightVisibility =
            this.getDistanceVisibility(distance, this.currentSightDistance);
        const lightVisibility =
            this.getDynamicLightVisibilityAt(worldX, worldY, distance, timeMs);

        return Math.max(sightVisibility, lightVisibility);
    },

    getDynamicLightSampleAt: function(
        worldX,
        worldY,
        distance,
        timeMs,
        environmentIndex = null,
        sightVisibility = null
    ) {
        if (this.profilingCountersEnabled) {
            this.incrementProfilingCounter("dynamicLightSampleQueries");
        }

        if (sightVisibility === null) {
            sightVisibility =
                this.getDistanceVisibility(distance, this.currentSightDistance);
        }
        const needsLightVisibility = sightVisibility < 1;

        const result = this.dynamicLightSampleScratch;
        result.red = 0;
        result.green = 0;
        result.blue = 0;
        result.visibility = 0;

        let red = 0;
        let green = 0;
        let blue = 0;
        let lightVisibility = 0;

        if (environmentIndex === null) {
            environmentIndex = this.getEnvironmentIndex(
                Math.floor(worldX),
                Math.floor(worldY)
            );
        }

        if (environmentIndex < 0) {
            result.visibility = sightVisibility;
            return result;
        }

        const dynamics = this.dynamicLightsByCell[environmentIndex];
        if (! dynamics) {
            result.visibility = sightVisibility;
            return result;
        }

        this.incrementProfilingCounter(
            "dynamicLightCandidateChecks",
            dynamics.length
        );

        for (const dynamic of dynamics) {
            const light = dynamic.lightRuntime;
            const localAmount = this.getEnvironmentDynamicAmount(
                worldX,
                worldY,
                dynamic,
                light
            );

            if (localAmount <= 0) {
                continue;
            }

            const intensity = light.intensity;
            const amount = localAmount * intensity;
            red += light.red * amount;
            green += light.green * amount;
            blue += light.blue * amount;

            if (! needsLightVisibility) {
                continue;
            }

            const visibilityDistance = Math.max(
                this.currentSightDistance,
                light.visibilityDistance
            );

            if (distance >= visibilityDistance) {
                continue;
            }

            const lightStrength =
                Math.min(1, localAmount * intensity * light.colorStrength);
            if (lightStrength <= 0) {
                continue;
            }

            let distanceVisibility = 1;

            if (distance > this.currentSightDistance) {
                const fadeLength =
                    visibilityDistance - this.currentSightDistance;
                if (fadeLength <= this.epsilon) {
                    continue;
                }

                const progress = Math.max(0, Math.min(
                    1,
                    (distance - this.currentSightDistance) / fadeLength
                ));

                const smoothedProgress =
                    progress * progress * (3 - 2 * progress);
                distanceVisibility = 1 - smoothedProgress;
            }

            const localVisibility = lightStrength * distanceVisibility;

            lightVisibility = 1 - (1 - lightVisibility) * (1 - localVisibility);
        }

        result.red = red;
        result.green = green;
        result.blue = blue;
        result.visibility = Math.max(sightVisibility, lightVisibility);

        return result;
    },

    getEnvironmentVisibilityDistance: function(sightDistance) {
        let visibilityDistance = sightDistance;

        for (const dynamic of this.environmentDynamics) {
            const light = dynamic.light;
            if (! light) {
                continue;
            }

            const lightVisibilityDistance = Number(
                light.visibilityDistance ??
                this.defaultLightVisibilityDistance
            );

            if (Number.isFinite(lightVisibilityDistance)) {
                visibilityDistance =
                    Math.max(visibilityDistance, lightVisibilityDistance);
            }
        }

        return visibilityDistance;
    },

    // @TODO Remove timeMs
    getDynamicFogLayersAt: function(
        worldX,
        worldY,
        timeMs,
        environmentIndex = null
    ) {
        if (this.profilingCountersEnabled) {
            this.incrementProfilingCounter("dynamicFogQueries");
        }

        const result = this.dynamicFogLayersScratch;
        const uncapped = result.uncapped;
        const ceiling = result.ceiling;

        uncapped.density = 0;
        uncapped.red = 0;
        uncapped.green = 0;
        uncapped.blue = 0;

        ceiling.density = 0;
        ceiling.red = 0;
        ceiling.green = 0;
        ceiling.blue = 0;

        if (environmentIndex === null) {
            const cellX = Math.floor(worldX);
            const cellY = Math.floor(worldY);
            environmentIndex = this.getEnvironmentIndex(cellX, cellY);
        }

        if (environmentIndex < 0) {
            return result;
        }

        const dynamics = this.dynamicFogsByCell[environmentIndex];
        if (! dynamics) {
            return result;
        }

        for (const dynamic of dynamics) {
            const fog = dynamic.fogRuntime;
            const amount =
                this.getEnvironmentDynamicAmount(worldX, worldY, dynamic, fog);

            const localDensity = fog.density * amount;
            if (localDensity <= 0) {
                continue;
            }

            const layer = fog.cappedToCeiling ? ceiling : uncapped;

            layer.density += localDensity;
            layer.red += fog.red * localDensity;
            layer.green += fog.green * localDensity;
            layer.blue += fog.blue * localDensity;
        }

        if (uncapped.density > 0) {
            uncapped.red /= uncapped.density;
            uncapped.green /= uncapped.density;
            uncapped.blue /= uncapped.density;
        }

        if (ceiling.density > 0) {
            ceiling.red /= ceiling.density;
            ceiling.green /= ceiling.density;
            ceiling.blue /= ceiling.density;
        }

        return result;
    },

    hasAnimatedEnvironmentDynamics: function() {
        return this.environmentDynamics.some(dynamic =>
            (dynamic.light?.pulseAmount ?? 0) > 0 ||
            (dynamic.fog?.pulseAmount ?? 0) > 0
        );
    },

    doesDynamicRadiusIntersectCell: function(dynamic, radius, cellX, cellY) {
        const nearestX = Math.max(cellX, Math.min(dynamic.x, cellX + 1));
        const nearestY = Math.max(cellY, Math.min(dynamic.y, cellY + 1));
        const deltaX = dynamic.x - nearestX;
        const deltaY = dynamic.y - nearestY;

        return (deltaX * deltaX + deltaY * deltaY) <= radius * radius;
    },

    getSightRange: function(mapEntity) {
        const sightRange = Number(
            this.sightRangeOverride ??
            mapEntity.leader?.getEffectiveTrait?.("sightRange") ??
            mapEntity.getEffectiveTrait?.("sightRange") ??
            this.maxViewDepth
        );

        return (! Number.isFinite(sightRange) || sightRange <= 0)
            ? this.maxViewDepth
            : sightRange;
    },

    getSightDistance: function(mapEntity) {
        return this.getSightRange(mapEntity) * this.tileSize;
    },

    getSightSensitivity: function(mapEntity) {
        const sightSensitivity = Number(
            mapEntity.leader?.getEffectiveTrait?.("sightSensitivity") ??
            mapEntity.getEffectiveTrait?.("sightSensitivity") ??
            1
        );

        return Number.isFinite(sightSensitivity) && sightSensitivity > 0
            ? sightSensitivity
            : 1;
    },

    getDistanceVisibility: function(distance, sightDistance) {
        const distancesAreValid =
            Number.isFinite(distance) &&
            Number.isFinite(sightDistance) &&
            sightDistance > 0 &&
            distance < sightDistance;

        if (! distancesAreValid) {
            return 0;
        }

        const fadeStart = Math.min(
            sightDistance,
            this.currentSightSensitivity * this.tileSize
        );

        if (distance <= fadeStart) {
            return 1;
        }

        const fadeLength = sightDistance - fadeStart;
        if (fadeLength <= this.epsilon) {
            return 1;
        }

        const progress =
            Math.max(0, Math.min(1, (distance - fadeStart) / fadeLength));
        const smoothedProgress = progress * progress * (3 - 2 * progress);

        return 1 - smoothedProgress;
    },

    generateGradient: function(colors) {
        const width = this.textureSize;
        const height = this.textureSize;
        const $canvas = document.createElement("canvas");
        $canvas.width = width;
        $canvas.height = height;

        const ctx = $canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, width, 0);

        for (var i = 0; i < colors.length; i++) {
            gradient.addColorStop(i / (colors.length - 1), colors[i]);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        return ctx.getImageData(0, 0, width, height);
    },

    generateDefaultTexture: function() {
        const width = this.textureSize;
        const height = this.textureSize;
        const $canvas = document.createElement("canvas");
        $canvas.width = width;
        $canvas.height = height;

        const ctx = $canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, width, height);

        return ctx.getImageData(0, 0, width, height);
    },

    generateNoiseTexture: function(backgroundColor, foregroundColor) {
        const width = this.textureSize;
        const height = this.textureSize;
        const $canvas = document.createElement("canvas");
        $canvas.width = width;
        $canvas.height = height;

        const ctx = $canvas.getContext("2d");
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = foregroundColor;

        for (let i = 0; i < (width * height); i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            ctx.fillRect(x, y, 1, 1);
        }

        return ctx.getImageData(0, 0, width, height);
    },

    getCellKey: function(cellX, cellY) {
        return `${cellX},${cellY}`;
    },

    createRayAngles: function() {
        this.rayAngles = [];
        this.rayScreenOffsets = [];
        this.rayStripStartXs = [];
        this.rayStripEndXs = [];

        const projectionCenterX = this.displayWidth / 2;

        for (let strip = 0; strip < this.rayCount; strip++) {
            const stripStartX = strip * this.stripWidth;
            const stripEndX =
                Math.min(stripStartX + this.stripWidth, this.displayWidth);
            const stripCenterX = (stripStartX + stripEndX) / 2;
            const screenOffset = projectionCenterX - stripCenterX;
            const rayAngle = Math.atan2(screenOffset, this.viewDist);

            this.rayAngles.push(rayAngle);
            this.rayScreenOffsets.push(screenOffset);
            this.rayStripStartXs.push(stripStartX);
            this.rayStripEndXs.push(stripEndX);
        }
    },

    normalizeStripSize: function(sizePx) {
        return Math.max(1, Math.min(Math.round(sizePx), this.width));
    },

    setStripWidth: function(widthPx) {
        this.stripWidth = this.normalizeStripSize(widthPx);
        this.createRayAngles();
    },

    setStripSquare: function(sizePx) {
        this.setStripWidth(sizePx);
        this.wallHeightStep = this.normalizeStripSize(sizePx);
    },

    rebuildProjection: function() {
        this.fovRadians = this.fovDegrees * Math.PI / 180;
        this.viewDist = (this.displayWidth / 2) / Math.tan(this.fovRadians / 2);
        this.rayCount = Math.ceil(this.displayWidth / this.stripWidth);

        this.createRayAngles();
        this.rebuildBaseBuffer();
        this.rebuildBackgroundImageData();
        this.ensureFogProfiles();
        this.backBuffer = null;
    },

    rebuildBaseBuffer: function() {
        this.baseBuffer = this.context.createImageData(
            this.displayWidth,
            this.displayHeight
        );

        const data = this.baseBuffer.data;
        const horizonY = Math.floor(this.displayHeight / 2);

        for (let y = 0; y < this.displayHeight; y++) {
            const isFloor = y >= horizonY;
            const red = isFloor ? 55 : 64;
            const green = isFloor ? 180 : 145;
            const blue = isFloor ? 55 : 250;

            for (let x = 0; x < this.displayWidth; x++) {
                const index = (x + y * this.displayWidth) * 4;
                data[index] = red;
                data[index + 1] = green;
                data[index + 2] = blue;
                data[index + 3] = 255;
            }
        }
    },

    setCanvas: function($canvas) {
        if (! ($canvas instanceof Element)) {
            console.error("$canvas must be an element", { $canvas });
            return;
        }

        if (! $canvas.getContext) {
            console.error("This browser does not support canvas", { $canvas });
            return;
        }

        this.$canvas = $canvas;
        this.context = $canvas.getContext("2d");
        this.width = $canvas.width;
        this.height = $canvas.height;
        this.displayWidth = this.width;
        this.displayHeight = this.height;
        this.aspectRatio = this.width / this.height;
        this.$sceneCanvas = document.createElement("canvas");
        this.$sceneCanvas.width = this.displayWidth;
        this.$sceneCanvas.height = this.displayHeight;
        this.sceneContext = this.$sceneCanvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
        this.sceneContext.imageSmoothingEnabled = false;

        this.rebuildProjection();
    },

    setEnemyLayer: function($e) {
        if (! ($e instanceof Element)) {
            console.error("$e must be an element", { $e });
            return;
        }

        this.$enemyLayer = $e;
        console.log("setEnemyLayer(): Layer is set", { $e, $el: this.$enemyLayer });
    },

    setBackgroundImage: function($backgroundImage) {
        if (! ($backgroundImage instanceof Image)) {
            console.error(
                "$backgroundImage must be an Image",
                { $backgroundImage }
            );
            return;
        }

        this.$backgroundImage = $backgroundImage;

        const onImageReady = () => {
            if (this.$backgroundImage !== $backgroundImage) {
                return;
            }

            this.rebuildBackgroundImageData();
            this.sceneDirty = true;
        };

        if ($backgroundImage.complete && $backgroundImage.naturalWidth > 0) {
            onImageReady();
            return;
        }

        $backgroundImage.addEventListener("load", onImageReady, { once: true });
    },

    clearBackgroundImage: function() {
        this.$backgroundImage = null;
        this.backgroundImageData = null;
        this.sceneDirty = true;
    },

    rebuildBackgroundImageData: function() {
        const image = this.$backgroundImage;

        const imageIsReady =
            image instanceof Image &&
            image.complete &&
            image.naturalWidth > 0 &&
            image.naturalHeight > 0;

        if (! imageIsReady) {
            this.backgroundImageData = null;
            return;
        }

        const panoramaWidth = this.displayWidth * 4;
        const panoramaHeight = this.displayHeight;

        if (! this.$backgroundCanvas) {
            this.$backgroundCanvas = document.createElement("canvas");
            this.backgroundContext = this.$backgroundCanvas.getContext(
                "2d",
                { willReadFrequently: true }
            );
            this.backgroundContext.imageSmoothingEnabled = false;
        }

        this.$backgroundCanvas.width = panoramaWidth;
        this.$backgroundCanvas.height = panoramaHeight;
        this.backgroundContext.imageSmoothingEnabled = false;
        this.backgroundContext.clearRect(0, 0, panoramaWidth, panoramaHeight);

        this.backgroundContext.drawImage(
            image,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
            0,
            0,
            panoramaWidth,
            panoramaHeight
        );

        this.backgroundImageData = this.backgroundContext.getImageData(
            0,
            0,
            panoramaWidth,
            panoramaHeight
        );
    },

    drawBackgroundToBackBuffer: function(cameraPose) {
        const background = this.backgroundImageData;
        if (! background) {
            this.backBuffer.data.set(this.baseBuffer.data);
            return;
        }

        const fullRotation = Math.PI * 2;
        const clockwiseProgress =
            this.normalizeAngle(Math.PI / 2 - cameraPose.angle) / fullRotation;
        const panoramaWidth = background.width;
        const panoramaHeight = background.height;

        const sourceX =
            Math.round(clockwiseProgress * panoramaWidth) % panoramaWidth;

        const viewportWidth = this.displayWidth;
        const sourceData = background.data;
        const destinationData = this.backBuffer.data;
        const firstCopyWidth = Math.min(viewportWidth, panoramaWidth - sourceX);
        const secondCopyWidth = viewportWidth - firstCopyWidth;

        for (let y = 0; y < panoramaHeight; y++) {
            const sourceRowStart = y * panoramaWidth * 4;
            const destinationRowStart = y * viewportWidth * 4;
            const firstSourceStart = sourceRowStart + sourceX * 4;
            const firstCopyLength = firstCopyWidth * 4;

            destinationData.set(
                sourceData.subarray(
                    firstSourceStart,
                    firstSourceStart + firstCopyLength
                ),
                destinationRowStart
            );

            if (secondCopyWidth === 0) {
                continue;
            }

            const secondCopyLength = secondCopyWidth * 4;

            destinationData.set(
                sourceData.subarray(
                    sourceRowStart,
                    sourceRowStart + secondCopyLength
                ),
                destinationRowStart + firstCopyLength
            );
        }
    },

    drawFoggedBackground: function() {
        if (! this.backBuffer || ! this.fogProfilesByStrip.length) {
            return;
        }

        const firstProfile = this.fogProfilesByStrip[0];
        if (! firstProfile) {
            return;
        }

        this.updateCeilingFogSampleIndexes(firstProfile.transmittance.length);
        const ceilingIndexes = this.ceilingFogSampleIndexByY;
        const destinationData = this.backBuffer.data;
        const destinationWidth = this.backBuffer.width;
        const destinationHeight = this.backBuffer.height;

        for (let strip = 0; strip < this.fogProfilesByStrip.length; strip++) {
            const fogProfile = this.fogProfilesByStrip[strip];
            if (! fogProfile) {
                continue;
            }

            const fogSampleIndex = fogProfile.transmittance.length - 1;
            const uncappedTransmittance =
                fogProfile.uncappedFogTransmittance[fogSampleIndex] ?? 1;

            const ceilingFinalTransmittance =
                fogProfile.ceilingFogTransmittance[fogSampleIndex] ?? 1;
            const hasUncappedFog = uncappedTransmittance < 1 - this.epsilon;
            const hasCeilingFog = ceilingFinalTransmittance < 1 - this.epsilon;
            if (! hasUncappedFog && ! hasCeilingFog) {
                continue;
            }

            const uncappedRed = fogProfile.uncappedRed[fogSampleIndex] ?? 0;
            const uncappedGreen = fogProfile.uncappedGreen[fogSampleIndex] ?? 0;
            const uncappedBlue = fogProfile.uncappedBlue[fogSampleIndex] ?? 0;
            const startX = strip * this.stripWidth;
            const endX = Math.min(destinationWidth, startX + this.stripWidth);

            for (let screenY = 0; screenY < destinationHeight; screenY++) {
                const ceilingFogSampleIndex = ceilingIndexes[screenY];
                const ceilingTransmittance = fogProfile
                    .ceilingFogTransmittance[ceilingFogSampleIndex] ?? 1;
                const ceilingRed = fogProfile
                    .ceilingRed[ceilingFogSampleIndex] ?? 0;
                const ceilingGreen = fogProfile
                    .ceilingGreen[ceilingFogSampleIndex] ?? 0;
                const ceilingBlue = fogProfile
                    .ceilingBlue[ceilingFogSampleIndex] ?? 0;
                let di = (startX + screenY * destinationWidth) * 4;


                const combinedTransmittance =
                    uncappedTransmittance * ceilingTransmittance;

                const redAddition =
                    (uncappedRed * ceilingTransmittance + ceilingRed) * 255;
                const greenAddition =
                    (uncappedGreen * ceilingTransmittance + ceilingGreen) * 255;
                const blueAddition =
                    (uncappedBlue * ceilingTransmittance + ceilingBlue) *255;

                for (let screenX = startX; screenX < endX; screenX++, di += 4) {
                    destinationData[di] =
                        destinationData[di] *
                        combinedTransmittance +
                        redAddition;

                    destinationData[di + 1] =
                        destinationData[di + 1] *
                        combinedTransmittance +
                        greenAddition;

                    destinationData[di + 2] =
                        destinationData[di + 2] *
                        combinedTransmittance +
                        blueAddition;

                    destinationData[di + 3] = 255;
                }
            }
        }
    },

    setTextureImage: function($textureImage) {
        if (! ($textureImage instanceof Image)) {
            console.error(
                "$textureImage must be an Image",
                { $textureImage }
            );
            return;
        }

        this.$textureImage = $textureImage;
    },

    enableMapSprites: function() {
        if (! this.mapSpritesEnabled) {
            this.mapSpritesEnabled = true;
            this.sceneDirty = true;
        }
    },

    disableMapSprites: function() {
        if (this.mapSpritesEnabled) {
            this.mapSpritesEnabled = false;
            this.sceneDirty = true;
        }
    },

    presentFrame: function(timeMs) {
        const context = this.context;
        const intensity =
            Math.max(0, Math.min(1, this.effects.drunkenness)) * 5;

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.displayWidth, this.displayHeight);

        if (intensity === 0) {
            context.drawImage(this.$sceneCanvas, 0, 0);
            return;
        }

        const timeSeconds = timeMs / 1000;

        const swayXPx = (
            Math.sin(timeSeconds * 1.7) * 4 + Math.sin(timeSeconds * 0.61) * 2
        ) * intensity;

        const swayYPx = (
            Math.sin(timeSeconds * 1.13) * 3 + Math.sin(timeSeconds * 0.47)
        ) * intensity;

        const rotationRadians = (
            Math.sin(timeSeconds * 0.93) * 0.025 +
            Math.sin(timeSeconds * 0.39) * 0.012
        ) * intensity;

        const shearX = (
            Math.sin(timeSeconds * 0.71) * 0.025
        ) * intensity;

        const shearY = (
            Math.sin(timeSeconds * 0.53) * 0.012
        ) * intensity;

        const scale = 1 + intensity * 0.05;
        const centerX = this.displayWidth / 2;
        const centerY = this.displayHeight / 2;

        context.save();
        context.translate(centerX + swayXPx, centerY + swayYPx);
        context.rotate(rotationRadians);
        context.transform(1, shearY, shearX, 1, 0, 0);
        context.scale(scale, scale);
        context.drawImage(this.$sceneCanvas, -centerX, -centerY);
        context.restore();

        const tintAlpha = intensity * 0.12;
        context.fillStyle = `rgb(165 65 190 / ${tintAlpha})`;
        context.fillRect(0, 0, this.displayWidth, this.displayHeight);
    },

    getCameraPose: function(mapEntity) {
        return this.cameraPoseOverride ?? this.getPose(mapEntity);
    },

    setEntityPoseOverride: function(entityId, pose) {
        this.entityPoseOverrides.set(entityId, pose);
    },

    clearEntityPoseOverride: function(entityId) {
        this.entityPoseOverrides.delete(entityId);
    },

    getOriginOffsets: function(direction) {
        switch (direction) {
            case 0: return { x: 0.5, y: 0.8 }; // North
            case 1: return { x: 0.2, y: 0.5 }; // East
            case 2: return { x: 0.5, y: 0.2 }; // South
            case 3: return { x: 0.8, y: 0.5 }; // West
            default: return { x: 0.5, y: 0.5 };
        }
    },

    getPose: function(mapEntity) {
        const { id, x, y, direction } = mapEntity;
        const poseOverride = this.entityPoseOverrides.get(id);
        const angle =
            poseOverride?.angle ?? this.getCameraAngle(direction);
        const offsets = this.getOriginOffsets(direction);

        return {
            x: (poseOverride?.x ?? x ?? 0) + offsets.x,
            y: (poseOverride?.y ?? y ?? 0) + offsets.y,
            angle,
        };
    },

    normalizeAngle: function(angleRadians) {
        const fullRotationRadians = Math.PI * 2;

        return (
            angleRadians %
            fullRotationRadians +
            fullRotationRadians
        ) % fullRotationRadians;
    },

    interpolate: function(startValue, endValue, progress) {
        return startValue + (endValue - startValue) * progress;
    },

    resetProfiling: function() {
        this.profilingFrameCount = 0;
        this.profilingTotals = Object.create(null);
        this.profilingMaximums = Object.create(null);
        this.profilingCounters = Object.create(null);
        this.profilingLastFrameTimeMs = null;
        this.profilingLargestFrameGapMs = 0;
    },

    startProfilingSection: function() {
        return this.profilingEnabled ? performance.now() : 0;
    },

    endProfilingSection: function(name, startTimeMs) {
        if (! this.profilingEnabled) {
            return;
        }

        const elapsedMs = performance.now() - startTimeMs;

        this.profilingTotals[name] =
            (this.profilingTotals[name] ?? 0) + elapsedMs;
        this.profilingMaximums[name] =
            Math.max(this.profilingMaximums[name] ?? 0, elapsedMs);
    },

    incrementProfilingCounter: function(name, amount = 1) {
        if (! this.profilingEnabled || ! this.profilingCountersEnabled) {
            return;
        }

        this.profilingCounters[name] =
            (this.profilingCounters[name] ?? 0) + amount;
    },

    completeProfilingFrame: function() {
        if (! this.profilingEnabled) {
            return;
        }

        this.profilingFrameCount++;

        if (this.profilingFrameCount < this.profilingReportEveryFrames) {
            return;
        }

        this.reportProfiling();
        this.resetProfiling();
    },

    reportProfiling: function() {
        const frameCount = Math.max(1, this.profilingFrameCount);
        const renderSceneAverage =
            (this.profilingTotals.renderScene ?? 0) / frameCount;

        const timingRows = Object.keys(this.profilingTotals)
            .map(name => {
                const averageMs = this.profilingTotals[name] / frameCount;

                return {
                    section: name,
                    "average ms": Number(averageMs.toFixed(3)),
                    "maximum ms":
                        Number((this.profilingMaximums[name] ?? 0).toFixed(3)),
                    "% renderScene": renderSceneAverage > 0
                        ? Number(
                            (averageMs / renderSceneAverage * 100).toFixed(1)
                        )
                        : 0,
                };
            })
            .sort((firstRow, secondRow) =>
                    secondRow["average ms"] - firstRow["average ms"]
            );

        const counterRows = Object.keys(this.profilingCounters)
            .map(name => ({
                counter: name,
                "average / frame": Number(
                    (this.profilingCounters[name] / frameCount).toFixed(1)
                ),
            }))
            .sort((firstRow, secondRow) =>
                secondRow["average / frame"] - firstRow["average / frame"]
            );

        console.group(`SceneRenderer profiling: ${frameCount} frames`);
        console.table(timingRows);
        console.table(counterRows);
        console.table(this.profilingDiagnostics);
        console.log("Largest RAF gap:", this.profilingLargestFrameGapDetails);
        console.groupEnd();
    },

    renderScene: function(gameMap, timeMs = performance.now()) {
        this.zeroTransmittanceSamples = 0;
        const renderStartTimeMs = this.startProfilingSection();
        let sectionStartTimeMs = this.startProfilingSection();
        this.collectEnvironmentDynamics(gameMap, timeMs);
        this.endProfilingSection(
            "collectEnvironmentDynamics",
            sectionStartTimeMs
        );

        sectionStartTimeMs = this.startProfilingSection();
        this.raycast(gameMap, this.mapEntity, timeMs);
        this.endProfilingSection("raycast", sectionStartTimeMs);

        this.sceneDirty = false;
        this.endProfilingSection("renderScene", renderStartTimeMs);

        this.completeProfilingFrame();
    },

    render: function(gameMap) {
        const timeMs = performance.now();

        this.renderScene(gameMap, timeMs);
        this.presentFrame(timeMs);

        if (this.hasAnimatedEffects()) {
            this.startPresentationLoop();
        }

        // this.drawOverlays();
    },

    hasAnimatedEffects: function() {
        return (
            this.effects.drunkenness > 0 ||
            this.animatedSpritesPresent ||
            this.effectTransitions.size > 0 ||
            this.hasActiveBattleSpriteEffects() ||
            this.hasActiveBattleSpriteHighlightTransitions() ||
            this.hasAnimatedEnvironmentDynamics()
        );
    },

    startPresentationLoop: function() {
        if (this.animationFrameId !== null) {
            return;
        }

        const drawFrame = timeMs => {
            if (this.profilingEnabled && this.profilingLastFrameTimeMs !== null) {
                const frameGapMs = timeMs - this.profilingLastFrameTimeMs;

                if (frameGapMs > this.profilingLargestFrameGapMs) {
                    this.profilingLargestFrameGapMs = frameGapMs;
                    this.profilingLargestFrameGapDetails = {
                        gapMs: frameGapMs,
                        previousRenderMs: this.profilingLastPresentationRenderMs,
                    };
                }
            }

            if (this.profilingEnabled) {
                if (this.profilingLastFrameTimeMs !== null) {
                    const frameGapMs = timeMs - this.profilingLastFrameTimeMs;
                    this.profilingLargestFrameGapMs =
                        Math.max(this.profilingLargestFrameGapMs, frameGapMs);
                }

                this.profilingLastFrameTimeMs = timeMs;
            }

            const elapsedMs = timeMs - this.lastPresentationTimeMs;
            const shouldPresent =
                this.forceNextPresentation ||
                elapsedMs >= this.presentationIntervalMs;

            if (shouldPresent) {
                this.forceNextPresentation = false;
                this.lastPresentationTimeMs =
                    timeMs - elapsedMs % this.presentationIntervalMs;

                this.updateEffectTransitions(timeMs);

                const spriteFrameIsDue =
                    this.animatedSpritesPresent &&
                    timeMs >= this.nextSpriteAnimationTimeMs;

                const battleHighlightIsActive =
                    this.hasActiveBattleSpriteHighlightTransitions();

                const battleEffectIsActive =
                    this.hasActiveBattleSpriteEffects();

                const environmentDynamicsAreAnimated =
                    this.hasAnimatedEnvironmentDynamics();

                const shouldRender =
                    this.sceneDirty ||
                    spriteFrameIsDue ||
                    battleHighlightIsActive ||
                    battleEffectIsActive ||
                    environmentDynamicsAreAnimated;

                if (shouldRender) {
                    const renderStartMs = performance.now();
                    this.renderScene(this.mapEntity.gameMap, timeMs);

                    this.profilingLastPresentationRenderMs =
                        performance.now() - renderStartMs;
                } else {
                    this.profilingLastPresentationRenderMs = 0;
                }

                this.presentFrame(timeMs);
            }

            if (this.hasAnimatedEffects()) {
                this.animationFrameId = requestAnimationFrame(drawFrame);
                return;
            }

            this.animationFrameId = null;
        };

        this.animationFrameId = requestAnimationFrame(drawFrame);
    },

    setEffect: function(effectId, value) {
        if (! Object.hasOwn(this.effects, effectId)) {
            console.error("Unknown scene effect", { effectId });
            return;
        }

        const numericValue = Number(value);
        if (! Number.isFinite(numericValue)) {
            console.error(
                "Scene effect value must be numeric",
                { effectId, value }
            );
            return;
        }

        const finalValue = Math.max(0, Math.min(1, numericValue));
        this.effectTransitions.delete(effectId);
        if (this.effects[effectId] === finalValue) {
            return;
        }

        this.effects[effectId] = finalValue;
        this.sceneDirty = true;

        if (this.mapEntity?.gameMap) {
            this.render(this.mapEntity.gameMap);
        }
    },

    transitionEffect: function(effectId, targetValue, durationMs) {
        if (! Object.hasOwn(this.effects, effectId)) {
            console.error("Unknown scene effect", { effectId });
            return;
        }

        const numericTarget = Number(targetValue);
        const numericDuration = Number(durationMs);

        if (
            ! Number.isFinite(numericTarget) ||
            ! Number.isFinite(numericDuration)
        ) {
            console.error("Invalid scene effect transition", {
                effectId,
                targetValue,
                durationMs,
            });
            return;
        }

        const target = Math.max(0, Math.min(1, numericTarget));
        const duration = Math.max(0, numericDuration);

        if (duration === 0) {
            this.setEffect(effectId, target);
            return;
        }

        this.effectTransitions.set(effectId, {
            startValue: this.effects[effectId],
            targetValue: target,
            startTimeMs: performance.now(),
            durationMs: duration,
        });

        this.startPresentationLoop();
    },

    updateEffectTransitions: function(timeMs) {
        let effectsChanged = false;

        for (const [ effectId, transition ] of this.effectTransitions) {
            const elapsedMs = timeMs - transition.startTimeMs;
            const progress =
                Math.max(0, Math.min(1, elapsedMs / transition.durationMs));

            /*
             * Smoothstep avoids abrupt starts and stops.
             */
            const easedProgress =
                progress * progress * (3 - 2 * progress);

            const value =
                transition.startValue +
                ( transition.targetValue - transition.startValue) *
                easedProgress;

            if (value !== this.effects[effectId]) {
                this.effects[effectId] = value;
                effectsChanged = true;
            }

            if (progress >= 1) {
                this.effects[effectId] = transition.targetValue;
                this.effectTransitions.delete(effectId);
            }
        }

        if (effectsChanged) {
            this.sceneDirty = true;
        }

        return effectsChanged;
    },

    setDrunkenness: function(intensity) {
        const numericIntensity = Number(intensity);

        if (! Number.isFinite(numericIntensity)) {
            return;
        }

        this.effects.drunkenness = Math.max(0, Math.min(1, numericIntensity));
        this.forceNextPresentation = true;
        this.startPresentationLoop();
    },

    setWallDarkness: function(value) {
        this.setEffect("wallDarkness", value);
    },

    fadeWallDarkness: function(value, durationMs = 250) {
        this.transitionEffect("wallDarkness", value, durationMs);
    },

    raycast: function(gameMap, mapEntity, timeMs = performance.now()) {
        const rayHits = [];
        const cameraPose = this.getCameraPose(mapEntity);
        const sightDistance = this.getSightDistance(mapEntity);
        const sightSensitivity = this.getSightSensitivity(mapEntity);
        this.currentSightDistance = sightDistance;
        this.currentSightSensitivity = sightSensitivity;
        this.currentVisibilityDistance =
            this.getEnvironmentVisibilityDistance(sightDistance);
        this.updateFrontLightCell(mapEntity);

        let sectionStartTimeMs = this.startProfilingSection();
        this.syncSprites(cameraPose, timeMs);
        this.endProfilingSection("syncSprites", sectionStartTimeMs);

        sectionStartTimeMs = this.startProfilingSection();
        this.updateFogProfiles(cameraPose, sightDistance, timeMs);
        this.endProfilingSection("updateFogProfiles", sectionStartTimeMs);

        sectionStartTimeMs = this.startProfilingSection();
        this.castRays(mapEntity, rayHits, cameraPose);
        this.endProfilingSection("castRays", sectionStartTimeMs);

        sectionStartTimeMs = this.startProfilingSection();
        this.sortRayHits(rayHits);
        this.endProfilingSection("sortRayHits", sectionStartTimeMs);

        sectionStartTimeMs = this.startProfilingSection();
        this.drawWorld(rayHits, cameraPose, timeMs);
        this.endProfilingSection("drawWorld", sectionStartTimeMs);
    },

    updateFrontLightCell: function(mapEntity) {
        let offsetX = 0;
        let offsetY = 0;

        switch (mapEntity.direction) {
            case 0:
                offsetY = -1;
                break;
            case 1:
                offsetX = 1;
                break;
            case 2:
                offsetY = 1;
                break;
            case 3:
                offsetX = -1;
                break;
        }

        this.frontLightCellX = Math.floor(mapEntity.x) + offsetX;
        this.frontLightCellY = Math.floor(mapEntity.y) + offsetY;
    },

    getFrontCellLightBonus: function(x, y) {
        return x === this.frontLightCellX && y === this.frontLightCellY
            ? this.frontCellLightBonus
            : 0;
    },

    getSpriteLodDefinitions: function(definition) {
        if (Array.isArray(definition?.lods) && definition.lods.length > 0) {
            return definition.lods.map(lod => ({
                ...lod,
                frameWidth: lod.frameWidth ?? definition.frameWidth,
                frameHeight: lod.frameHeight ?? definition.frameHeight,
            }));
        }

        return [{
            src: definition?.src,
            frameWidth: definition?.frameWidth,
            frameHeight: definition?.frameHeight,
        }];
    },

    isDirectionalSprite: function(definition) {
        return (
            definition?.type === "billboard" &&
            definition?.directional === true
        );
    },

    getEntityCellDistance: function(entity, viewer) {
        const viewerCellX = Math.floor(viewer.x);
        const viewerCellY = Math.floor(viewer.y);
        const entityCellX = Math.floor(entity.x);
        const entityCellY = Math.floor(entity.y);

        return Math.max(
            Math.abs(entityCellX - viewerCellX),
            Math.abs(entityCellY - viewerCellY)
        );
    },

    getSpriteLodIndex: function(entity, definition, viewer) {
        const hasLods =
            Array.isArray(definition?.lods) &&
            definition.lods.length > 0;

        const lodCount = hasLods ? definition.lods.length : 1;
        if (lodCount <= 1) {
            return 0;
        }

        const cellDistance = this.getEntityCellDistance(entity, viewer);
        const bandWidth = Math.max(this.epsilon, this.currentSightSensitivity);
        const lodIndex = Math.max(0, Math.ceil(cellDistance / bandWidth) - 1);

        return Math.min(lodCount - 1, lodIndex);
    },

    getSpriteLodDefinition: function(sprite, definition) {
        if (sprite?.lodDefinition) {
            return sprite.lodDefinition;
        }

        const lods = this.getSpriteLodDefinitions(definition);
        const lodIndex = Math.max(
            0,
            Math.min(lods.length - 1, Math.floor(sprite?.lodIndex ?? 0))
        );

        return lods[lodIndex] ?? null;
    },

    getSpriteAnimationDefinition: function(definition, animationId) {
        const animations = definition?.animations;
        if (! animations) {
            return null;
        }

        return animations[animationId] ?? animations.idle ?? null;
    },

    getSpriteAnimationState: function(entity, definition, timeMs) {
        const animationId =
            entity.spriteAnimationId ?? definition.defaultAnimation ?? "idle";

        const animation =
            this.getSpriteAnimationDefinition(definition, animationId);

        if (! animation) {
            return {
                animationId: animationId,
                animationFrame: 0,
                isAnimated: false,
                nextFrameTimeMs: Infinity,
            };
        }

        const frameCount =
            Math.max(1, Math.floor(Number(animation.frameCount) || 1));
        const frameDurationMs =
            Math.max(0, Number(animation.frameDurationMs) || 0);

        if (frameCount <= 1 || frameDurationMs <= 0) {
            return {
                animationId: animationId,
                animationFrame: 0,
                isAnimated: false,
                nextFrameTimeMs: Infinity,
            };
        }

        const requestedStartTime = Number(entity.spriteAnimationStartedAtMs);
        const startTimeMs = Number.isFinite(requestedStartTime)
            ? requestedStartTime
            : 0;
        const elapsedMs = Math.max(0, timeMs - startTimeMs);
        const elapsedFrames = Math.floor(elapsedMs / frameDurationMs);
        const shouldLoop = animation.loop !== false;
        const animationFrame = shouldLoop
            ? elapsedFrames % frameCount
            : Math.min(frameCount - 1, elapsedFrames);
        const animationCompleted = ! shouldLoop && elapsedFrames >= frameCount;
        const nextFrameTimeMs = animationCompleted
            ? Infinity
            : startTimeMs + (elapsedFrames + 1) * frameDurationMs;

        return {
            animationId: animationId,
            animationFrame: animationFrame,
            isAnimated: ! animationCompleted,
            nextFrameTimeMs: nextFrameTimeMs,
        };
    },

    getSpriteFrameRowCount: function(definition) {
        const animations = definition?.animations;
        if (! animations) {
            return 1;
        }

        let frameRowCount = 1;

        for (const animation of Object.values(animations)) {
            const firstFrame =
                Math.max(0, Math.floor(Number(animation.firstFrame) || 0));
            const frameCount =
                Math.max(1, Math.floor(Number(animation.frameCount) || 1));

            frameRowCount = Math.max(frameRowCount, firstFrame + frameCount);
        }

        return frameRowCount;
    },

    getSpriteAnimationRow: function(sprite, definition) {
        const animation =
            this.getSpriteAnimationDefinition(definition, sprite.animationId);
        if (! animation) {
            return 0;
        }

        const firstFrame =
            Math.max(0, Math.floor(Number(animation.firstFrame) || 0));
        const frameCount =
            Math.max(1, Math.floor(Number(animation.frameCount) || 1));
        const frameOffset =
            Math.max(0, Math.floor(Number(sprite.animationFrame) || 0)) %
            frameCount;

        return firstFrame + frameOffset;
    },

    loadSpriteDefinitions: function(definitions) {
        return Promise.all(
            Object.entries(definitions).map(([ spriteId, definition ]) =>
                this.loadSpriteDefinition(spriteId, definition)
            )
        );
    },

    loadSpriteDefinition: function(spriteId, definition) {
        const lods = this.getSpriteLodDefinitions(definition);
        this.spriteCanvasById[spriteId] = [];
        this.spriteImageDataById[spriteId] = [];

        return Promise.all(lods.map((lod, lodIndex) =>
            this.loadSpriteLod(spriteId, definition, lod, lodIndex)
        ));
    },

    loadSpriteLod: function(spriteId, definition, lod, lodIndex) {
        return new Promise((resolve, reject) => {
            const hasValidDefinition =
                typeof lod.src === "string" &&
                Number.isFinite(lod.frameWidth) &&
                lod.frameWidth > 0 &&
                Number.isFinite(lod.frameHeight) &&
                lod.frameHeight > 0;

            if (! hasValidDefinition) {
                reject(new Error(
                    `Invalid LOD ${lodIndex} for sprite ${spriteId}`
                ));
                return;
            }

            const image = new Image();

            image.addEventListener(
                "load",
                () => {
                    const frameRowCount =
                        this.getSpriteFrameRowCount(definition);
                    this.setSpriteTextureImage(spriteId, image, lodIndex);
                    resolve();
                },
                { once: true }
            );

            image.addEventListener(
                "error",
                () => {
                    reject(new Error(
                        `Unable to load sprite ${spriteId} LOD ${lodIndex} ` +
                        `from ${lod.src}`
                    ));
                },
                { once: true }
            );

            image.src = lod.src;
        });
    },

    getSpriteDirectionCount: function(definition) {
        return this.isDirectionalSprite(definition) ? 8 : 1;
    },

    setSpriteTextureImage: function(
        textureId,
        image,
        lodIndex = 0
    ) {
        const validTextureId = typeof textureId === "string";
        if (! validTextureId) {
            console.error("textureId must be a string", { textureId });
            return;
        }

        if (! Number.isInteger(lodIndex) || lodIndex < 0) {
            console.error(
                "lodIndex must be a non-negative integer",
                { lodIndex }
            );
            return;
        }

        if (! (image instanceof Image)) {
            console.error("image must be an Image", { image });
            return;
        }

        if (! image.complete || image.naturalWidth === 0) {
            console.error(
                "Sprite image has not finished loading",
                { textureId, lodIndex, image }
            );
            return;
        }

        const $canvas = document.createElement("canvas");
        $canvas.width = image.naturalWidth;
        $canvas.height = image.naturalHeight;

        const context = $canvas.getContext("2d");
        context.imageSmoothingEnabled = false;
        context.drawImage(image, 0, 0);

        this.spriteCanvasById[textureId] ??= [];
        this.spriteCanvasById[textureId][lodIndex] = $canvas;

        this.spriteImageDataById[textureId] ??= [];
        this.spriteImageDataById[textureId][lodIndex] =
            context.getImageData(0, 0, $canvas.width, $canvas.height);
    },

    syncSprites: function(cameraPose, timeMs = performance.now()) {
        const viewer = this.mapEntity;
        const viewerPoseOverride = this.entityPoseOverrides.get(viewer?.id);
        const viewerX = (viewerPoseOverride?.x ?? viewer?.x ?? 0) + 0.5;
        const viewerY = (viewerPoseOverride?.y ?? viewer?.y ?? 0) + 0.5;
        this.sprites = [];
        this.surfaceSpritesByCell.clear();
        this.wallSurfaceSpritesByFace.clear();
        this.animatedSpritesPresent = false;
        this.nextSpriteAnimationTimeMs = Infinity;

        if (! Array.isArray(viewer?.gameMap?.entities)) {
            return;
        }

        for (const entity of viewer.gameMap.entities) {
            if (entity === viewer) {
                continue;
            }

            const spriteIds = entity.spriteIds;
            if (! spriteIds) {
                continue;
            }

            for (const spriteId of spriteIds) {
                const definition = TARDQUEST_SPRITES[spriteId];
                if (! definition) {
                    continue;
                }

                const lods = this.getSpriteLodDefinitions(definition);
                const lodIndex =
                    this.getSpriteLodIndex(entity, definition, viewer);
                const lodDefinition = lods[lodIndex];
                if (! lodDefinition) {
                    continue;
                }

                const animationState =
                    this.getSpriteAnimationState(entity, definition, timeMs);
                const poseOverride = this.entityPoseOverrides.get(entity.id);
                const visualX = poseOverride?.x ?? entity.x;
                const visualY = poseOverride?.y ?? entity.y;
                const sprite = {
                    entity: entity,
                    id: entity.id,
                    spriteId: spriteId,
                    x: visualX + 0.5,
                    y: visualY + 0.5,
                    cellX: Math.floor(visualX),
                    cellY: Math.floor(visualY),
                    direction: entity.direction ?? 0,

                    width: entity.spriteWidth ?? definition.worldWidth ?? 1,
                    height: entity.spriteHeight ?? definition.worldHeight ?? 1,
                    rotation: entity.spriteRotation ?? 0,
                    verticalOffset: entity.spriteVerticalOffset ?? 0,
                    layer: entity.spriteLayer ?? 0,
                    plane: definition.plane ?? null,
                    depthOffset: definition.depthOffset ?? null,
                    lodIndex: lodIndex,
                    lodDefinition: lodDefinition,
                    animationId: animationState.animationId,
                    animationFrame: animationState.animationFrame,
                };

                const cellDistance = this.getEntityCellDistance(entity, viewer);
                const visibilityRange =
                    Math.ceil(this.currentVisibilityDistance / this.tileSize);
                const animationIsRelevant =
                    animationState.isAnimated &&
                    cellDistance <= visibilityRange;

                if (animationIsRelevant) {
                    this.animatedSpritesPresent = true;
                    this.nextSpriteAnimationTimeMs = Math.min(
                        this.nextSpriteAnimationTimeMs,
                        animationState.nextFrameTimeMs
                    );
                }

                if (definition.type === "surface") {
                    if (definition.plane === "wall") {
                        this.indexWallSurfaceSprite(sprite);
                    } else {
                        if (definition.directional) {
                            sprite.rotation = this.normalizeAngle(
                                sprite.rotation +
                                this.getSurfaceFacingRotation(
                                    sprite,
                                    viewerX,
                                    viewerY
                                )
                            );
                        }

                        this.indexSurfaceSprite(sprite);
                    }

                    continue;
                }

                sprite.directionIndex = 0;

                if (this.isDirectionalSprite(definition)) {
                    const visualDirection =
                        poseOverride?.direction ??
                        entity.direction ??
                        0;
                    sprite.facingAngle = this.getCameraAngle(visualDirection);
                    sprite.directionIndex = this.getSpriteDirectionIndex(
                        sprite,
                        definition,
                        cameraPose
                    );
                }

                this.sprites.push(sprite);
            }
        }
    },

    getSurfaceCellKey: function(cellX, cellY) {
        return cellX + cellY * this.mapEntity.gameMap.width;
    },

    getWallSurfaceKey: function(x, y, face) {
        return `${x},${y},${face}`;
    },

    indexSurfaceSprite: function(sprite) {
        const minimumCellX = Math.floor(sprite.x - sprite.width / 2);
        const maximumCellX =
            Math.floor(sprite.x + sprite.width / 2 - this.epsilon);
        const minimumCellY = Math.floor(sprite.y - sprite.height / 2);
        const maximumCellY =
            Math.floor(sprite.y + sprite.height / 2 - this.epsilon);

        for (let cellY = minimumCellY; cellY <= maximumCellY; cellY++) {
            for (let cellX = minimumCellX; cellX <= maximumCellX; cellX++) {
                const key = this.getSurfaceCellKey(cellX, cellY);

                let sprites = this.surfaceSpritesByCell.get(key);
                if (! sprites) {
                    sprites = [];
                    this.surfaceSpritesByCell.set(key, sprites);
                }

                sprites.push(sprite);
                sprites.sort((firstSprite, secondSprite) =>
                    firstSprite.layer - secondSprite.layer
                );
            }
        }
    },

    getSurfaceSpriteSample: function(sprite, worldX, worldY) {
        const definition = TARDQUEST_SPRITES[sprite.spriteId];
        const lodIndex = sprite.lodIndex ?? 0;
        const imageData = this.spriteImageDataById[sprite.spriteId]?.[lodIndex];
        const sourceRectangle = this.getSpriteSourceRectangle(sprite, null);
        if (! definition || ! imageData || ! sourceRectangle) {
            return null;
        }

        const differenceX = worldX - sprite.x;
        const differenceY = worldY - sprite.y;
        const cosine = Math.cos(-sprite.rotation);
        const sine = Math.sin(-sprite.rotation);
        const localX = differenceX * cosine - differenceY * sine;
        const localY = differenceX * sine + differenceY * cosine;
        const textureU = localX / sprite.width + 0.5;
        const textureV = localY / sprite.height + 0.5;
        const outsideSprite =
            textureU < 0 || textureU >= 1 || textureV < 0 || textureV >= 1;

        if (outsideSprite) {
            return null;
        }

        const textureX = sourceRectangle.x + Math.min(
            sourceRectangle.width - 1,
            Math.floor(textureU * sourceRectangle.width)
        );

        const textureY = sourceRectangle.y + Math.min(
            sourceRectangle.height - 1,
            Math.floor(textureV * sourceRectangle.height)
        );

        const sourceIndex = (textureX + textureY * imageData.width) * 4;

        return {
            red: imageData.data[sourceIndex],
            green: imageData.data[sourceIndex + 1],
            blue: imageData.data[sourceIndex + 2],
            alpha: imageData.data[sourceIndex + 3],
        };
    },

    getSurfaceShadingSample: function(
        environmentIndex,
        dynamicLight,
        strip,
        fogSampleIndex,
        staticLightRed = null,
        staticLightGreen = null,
        staticLightBlue = null
    ) {
        const result = this.surfaceShadingScratch;

        if (staticLightRed === null) {
            staticLightRed =
                this.environmentMap.lightR?.[environmentIndex] ?? 1;
        }

        if (staticLightGreen === null) {
            staticLightGreen =
                this.environmentMap.lightG?.[environmentIndex] ?? 1;
        }

        if (staticLightBlue === null) {
            staticLightBlue =
                this.environmentMap.lightB?.[environmentIndex] ?? 1;
        }

        result.lightRed = staticLightRed + dynamicLight.red;
        result.lightGreen = staticLightGreen + dynamicLight.green;
        result.lightBlue = staticLightBlue + dynamicLight.blue;

        const fogProfile = this.fogProfilesByStrip[strip];
        result.fogTransmittance =
            (fogProfile?.fogTransmittance[fogSampleIndex] ?? 1) *
            dynamicLight.visibility;

        result.fogRed = (fogProfile?.red[fogSampleIndex] ?? 0) * 255;
        result.fogGreen = (fogProfile?.green[fogSampleIndex] ?? 0) * 255;
        result.fogBlue = (fogProfile?.blue[fogSampleIndex] ?? 0) * 255;

        return result;
    },

    getSurfaceFacingRotation: function(sprite, viewerX, viewerY) {
        const differenceX = viewerX - sprite.x;
        const differenceY = viewerY - sprite.y;

        const rotationNegligible =
            Math.abs(differenceX) < this.epsilon &&
            Math.abs(differenceY) < this.epsilon;
        if (rotationNegligible) {
            return 0;
        }

        const angleToViewer = Math.atan2(differenceY, differenceX);
        return angleToViewer + Math.PI / 2;
    },

    getSpriteSourceRectangle: function(sprite, cameraPose) {
        const definition = TARDQUEST_SPRITES[sprite.spriteId];
        if (! definition) {
            return null;
        }

        const lod = this.getSpriteLodDefinition(sprite, definition);
        if (! lod) {
            return null;
        }

        const animationRow = this.getSpriteAnimationRow(sprite, definition);
        const directionIndex = this.isDirectionalSprite(definition)
            ? (
                sprite.directionIndex ?? (
                    cameraPose
                        ? this.getSpriteDirectionIndex(
                            sprite,
                            definition,
                            cameraPose
                        )
                        : 0
                )
            )
            : 0;

        return {
            x: directionIndex * lod.frameWidth,
            y: animationRow * lod.frameHeight,
            width: lod.frameWidth,
            height: lod.frameHeight,
        };
    },

    getWallSurfaceAttachment: function(sprite) {
        switch (sprite.direction) {
            case 0:
                return { x: sprite.cellX, y: sprite.cellY - 1, face: "south" };
            case 1:
                return { x: sprite.cellX + 1, y: sprite.cellY, face: "west" };
            case 2:
                return { x: sprite.cellX, y: sprite.cellY + 1, face: "north" };
            case 3:
                return { x: sprite.cellX - 1, y: sprite.cellY, face: "east" };
            default:
                return null;
        }
    },

    indexWallSurfaceSprite: function(sprite) {
        const attachment = this.getWallSurfaceAttachment(sprite);
        if (! attachment) {
            return;
        }

        const key =
            this.getWallSurfaceKey(attachment.x, attachment.y, attachment.face);
        let sprites = this.wallSurfaceSpritesByFace.get(key);

        if (! sprites) {
            sprites = [];
            this.wallSurfaceSpritesByFace.set(key, sprites);
        }

        sprites.push(sprite);
        sprites.sort((a, b) => a.layer - b.layer);
    },

    sortRayHits: function(rayHits) {
        rayHits.sort((a, b) => a.distance > b.distance ? -1 : 1);
    },

    getCameraAngle: function(direction) {
        switch (direction) {
            case 0: return Math.PI / 2;
            case 1: return 0;
            case 2: return Math.PI * 1.5;
            case 3: return Math.PI;
            default:
                console.error("Unknown direction", { direction });
                return 0;
        }
    },

    castRays: function(mapEntity, rayHits, cameraPose) {
        for (let strip = 0; strip < this.rayAngles.length; strip++) {
            const rayOffset = this.rayAngles[strip];
            const rayAngle = cameraPose.angle + rayOffset;

            this.castRay(
                mapEntity,
                rayHits,
                rayAngle,
                rayOffset,
                strip,
                cameraPose
            );
        }
    },

    castRay: function(
        mapEntity,
        rayHits,
        rayAngle,
        rayOffset,
        stripIdx,
        cameraPose
    ) {
        const originX = cameraPose.x;
        const originY = cameraPose.y;
        const twoPi = Math.PI * 2;

        rayAngle %= twoPi;
        if (rayAngle < 0) {
            rayAngle += twoPi;
        }

        //   2  |  1
        //  ----+----
        //   3  |  4
        const right =
            // Quadrant 1
            (rayAngle < twoPi * 0.25 && rayAngle >= 0) ||
            // Quadrant 4
            (rayAngle > twoPi * 0.75);

        // Quadrants 1 and 2
        const up = rayAngle < twoPi * 0.5 && rayAngle >= 0;

        const ray = {
            originX: originX,
            originY: originY,
            // @TODO Rename rayAngle
            rayAngle: rayAngle,
            rayOffset: rayOffset,
            strip: stripIdx,
            cellX: Math.trunc(mapEntity.x / this.tileSize),
            cellY: Math.trunc(mapEntity.y / this.tileSize),
            rayHits: rayHits,
            right: right,
            up: up,
            vx: 0,
            vy: 0,
            hx: 0,
            hy: 0,
            vertical: false,
            horizontal: false,
            wallHit: {
                hitX: 0, // World coordinates of hit
                hitY: 0,
                lightCellX: 0,
                lightCellY: 0,
                textureOffset: 0,
                strip: 0, // Screen column
                distance: 0, // Distance between player and wall
                correctDistance: 0, // Distance to correct for fishbowl effect
                vertical: false, // Vertical cell hit
                horizontal: false, // Horizontal cell hit
                rayAngle: 0, // Angle of the ray hitting the wall
                sprite: null, // Save sprite hit
            },
        };

        const tangent = Math.tan(rayAngle);
        const verticalGridX = Math.floor(originX);
        const horizontalGridY = Math.floor(originY);

        ray.vx = verticalGridX + (right ? this.tileSize : -this.epsilon);
        ray.vy = originY + (originX - ray.vx) * tangent;
        ray.hy = horizontalGridY + (up ? -this.epsilon : this.tileSize);
        ray.hx = originX + (originY - ray.hy) / tangent;

        // Vector for next vertical line
        const stepvx = right ? this.tileSize : -this.tileSize;
        // tan() returns positive values in Quadrant 1 and Quadrant 4
        // But window coordinates need negative values for Y-axis. Reverse them
        const stepvy = (this.tileSize * Math.tan(rayAngle)) * (right ? -1 : 1);

        // Vector for next horizontal line
        const stephy = up ? -this.tileSize : this.tileSize;
        // tan() returns stepx as positive in quadrant 3 and negative in quadrant 4
        // This is the opposite of horizontal window coordinates so we need to reverse the values
        // when angle is facing down
        const stephx = (this.tileSize / Math.tan(rayAngle)) * (up ? 1 : -1);

        // Vertical lines
        ray.vertical = true;
        ray.horizontal = false;

        const mapWidth = this.mapEntity.gameMap.width;
        const mapHeight = this.mapEntity.gameMap.height;

        while (ray.vx >= 0 && ray.vx < mapWidth && ray.vy >=0 && ray.vy < mapHeight) {
            ray.cellX = Math.trunc(ray.vx / this.tileSize);
            ray.cellY = Math.trunc(ray.vy / this.tileSize);

            if (! this.onCellHit(ray)) {
                break;
            }

            ray.vx += stepvx;
            ray.vy += stepvy;
        }

        // Horizontal lines
        ray.vertical = false;
        ray.horizontal = true;
        while (ray.hx >= 0 && ray.hx < mapWidth && ray.hy >= 0 && ray.hy < mapHeight) {
            ray.cellX = Math.trunc(ray.hx / this.tileSize);
            ray.cellY = Math.trunc(ray.hy / this.tileSize);

            if (! this.onCellHit(ray)) {
                break;
            }

            ray.hx += stephx;
            ray.hy += stephy;
        }

        this.onRayEnd(ray);
    },

    onRayEnd: function(ray) {
        const { rayAngle, rayOffset, rayHits, strip, wallHit } = ray;

        if (! wallHit.distance) {
            return;
        }

        wallHit.distance = Math.sqrt(wallHit.distance);
        wallHit.correctDistance = wallHit.distance * Math.cos(rayOffset);
        wallHit.strip = strip;
        wallHit.rayAngle = rayAngle;

        rayHits.push(wallHit);
    },

    /* Minimap-only?
    drawRay(rayX, rayY) {
        let miniMapObjects = document.getElementById("minimapobjects");
        let objectCtx = miniMapObjects.getContext("2d");

        rayX = rayX / (this.mapWidth*this.tileSize) * 100;
        rayX = rayX/100 * Raycaster.MINIMAP_SCALE * this.mapWidth;
        rayY = rayY / (this.mapHeight*this.tileSize) * 100;
        rayY = rayY/100 * Raycaster.MINIMAP_SCALE * this.mapHeight;

        let playerX = this.player.x / (this.mapWidth*this.tileSize) * 100;
        playerX = playerX/100 * Raycaster.MINIMAP_SCALE * this.mapWidth;

        let playerY = this.player.y / (this.mapHeight*this.tileSize) * 100;
        playerY = playerY/100 * Raycaster.MINIMAP_SCALE * this.mapHeight;

        objectCtx.strokeStyle = "rgba(0,100,0,0.3)";
        objectCtx.lineWidth = 0.5;
        objectCtx.beginPath();
        objectCtx.moveTo(playerX, playerY);
        objectCtx.lineTo(
            rayX,
            rayY
        );
        objectCtx.closePath();
        objectCtx.stroke();
    }
    */

    onCellHit: function(ray) {
        const {
            vx, vy, hx, hy, up, right, cellX, cellY, wallHit, horizontal, strip,
            rayAngle, rayHits, originX, originY,
        } = ray;

        let wallFound = false;

        // Handle cell walls
        // @TODO Store `mapEntity: mapEntity` in the ray?
        // @TODO Use something more efficient than getCell()
        const cell = this.mapEntity.gameMap.getCell(cellX, cellY);
        const face = this.getWallFace(ray);

        let visualWallCellX = cellX;
        let visualWallCellY = cellY;
        let visualWallFace = face;
        let visualWallTextureId = ! cell.isWall
            ? cell.wallTextureIds?.[face]
            : null;

        if (! visualWallTextureId) {
            const previousCellX = horizontal
                ? cellX
                : cellX + (right ? -1 : 1);
            const previousCellY = horizontal
                ? cellY + (up ? 1 : -1)
                : cellY;
            const previousCell =
                this.mapEntity.gameMap.getCell(previousCellX, previousCellY);
            const previousFace = this.getOppositeWallFace(face);
            const hasVisualWall =
                previousCell &&
                ! previousCell.isWall &&
                previousCell.wallTextureIds?.[previousFace];

            if (hasVisualWall) {
                visualWallCellX = previousCellX;
                visualWallCellY = previousCellY;
                visualWallFace = previousFace;
                visualWallTextureId = previousCell.wallTextureIds[previousFace];
            }
        }

        if (visualWallTextureId) {
            this.addVisualWallHit(
                ray,
                visualWallTextureId,
                visualWallFace,
                visualWallCellX,
                visualWallCellY
            );
        }

        if (cell.isWall) {
            const hitX = horizontal ? hx : vx;
            const hitY = horizontal ? hy : vy;
            const distX = originX - hitX;
            const distY = originY - hitY;
            const squaredDistance = distX * distX + distY * distY;

            const isNearestWall =
                ! wallHit.distance ||
                squaredDistance < wallHit.distance;

            if (isNearestWall) {
                wallFound = true;

                wallHit.distance = squaredDistance;
                wallHit.horizontal = horizontal;
                wallHit.vertical = ! horizontal;
                wallHit.hitX = hitX;
                wallHit.hitY = hitY;
                wallHit.cellX = cellX;
                wallHit.cellY = cellY;

                if (horizontal) {
                    wallHit.lightCellX = cellX;
                    wallHit.lightCellY = cellY + (up ? 1 : -1);
                } else {
                    wallHit.lightCellX = cellX + (right ? -1 : 1);
                    wallHit.lightCellY = cellY;
                }
/*
                const directionX = Math.cos(rayAngle);
                const directionY = -Math.sin(rayAngle);
                const lightSampleX = hitX - directionX * this.epsilon;
                const lightSampleY = hitY - directionY * this.epsilon;
                wallHit.lightCellX = Math.floor(lightSampleX);
                wallHit.lightCellY = Math.floor(lightSampleY);
*/
                wallHit.face = this.getWallFace(ray);
                wallHit.textureId =
                    cell.wallTextureIds?.[wallHit.face] ??
                    cell.wallTextureId ??
                    "default";
                wallHit.textureOffset = this.getTextureOffset(ray);
            }
        }

        return ! wallFound;
    },

    getWallFace: function(ray) {
        return ray.horizontal
            ? (ray.up ? "south" : "north")
            : (ray.right ? "west" : "east");
    },

    getOppositeWallFace: function(face) {
        switch (face) {
            case "north": return "south";
            case "south": return "north";
            case "east":  return "west";
            case "west":  return "east";
        }
    },

    addVisualWallHit: function(
        ray,
        textureId,
        face,
        visualWallCellX,
        visualWallCellY
    ) {
        const {
            vx,
            vy,
            hx,
            hy,
            up,
            right,
            cellX,
            cellY,
            horizontal,
            strip,
            rayAngle,
            rayOffset,
            originX,
            originY,
            rayHits,
        } = ray;

        const hitX = horizontal ? hx : vx;
        const hitY = horizontal ? hy : vy;
        const distX = originX - hitX;
        const distY = originY - hitY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        let lightCellX;
        let lightCellY;

        if (horizontal) {
            lightCellX = cellX;
            lightCellY = cellY + (up ? 1 : -1);
        } else {
            lightCellX = cellX + (right ? -1 : 1);
            lightCellY = cellY;
        }

        rayHits.push({
            hitX,
            hitY,
            cellX: visualWallCellX,
            cellY: visualWallCellY,
            lightCellX,
            lightCellY,
            textureOffset: this.getTextureOffset(ray),
            strip,
            distance,
            correctDistance: distance * Math.cos(rayOffset),
            vertical: ! horizontal,
            horizontal,
            rayAngle,
            face,
            textureId,
            sprite: null,
            visualWall: true,
        });
    },

    getTextureOffset: function(ray) {
        const { horizontal, hx, vy, up, right } = ray;

        let textureOffset = horizontal
            ? hx - Math.floor(hx)
            : vy - Math.floor(vy);

        const shouldFlipTexture =
            (horizontal && ! up) ||
            (! horizontal && ! right);

        if (shouldFlipTexture) {
            textureOffset = 1 - textureOffset;
        }

        return Math.min(
            1 - Number.EPSILON,
            Math.max(0, textureOffset)
        );
    },

    drawWorld: function(rayHits, cameraPose, timeMs) {
        if (! this.backBuffer) {
            this.backBuffer = this.context.createImageData(
                this.displayWidth,
                this.displayHeight
            );
        }

        this.updateWallDepthByStrip(rayHits);

        let sectionStartTimeMs = this.startProfilingSection();
        this.drawBackgroundToBackBuffer(cameraPose);
        this.endProfilingSection("drawBackgroundImage", sectionStartTimeMs);

        sectionStartTimeMs = this.startProfilingSection();
        this.drawFoggedBackground();
        this.endProfilingSection("drawBackgroundFog", sectionStartTimeMs);

        if (this.texturedFloorAndCeiling) {
            sectionStartTimeMs = this.startProfilingSection();
            this.drawTexturedFloorAndCeiling(cameraPose, timeMs);
            this.endProfilingSection("drawFloorAndCeiling", sectionStartTimeMs);
        }

        sectionStartTimeMs = this.startProfilingSection();
        for (const rayHit of rayHits) {
            if (rayHit.sprite || rayHit.visualWall) {
                continue;
            }

            this.drawRayHit(rayHit, timeMs);
        }
        this.endProfilingSection("drawWalls", sectionStartTimeMs);

        sectionStartTimeMs = this.startProfilingSection();
        this.drawTransparentScene(rayHits, cameraPose, timeMs);
        this.endProfilingSection("drawTransparentScene", sectionStartTimeMs);

        sectionStartTimeMs = this.startProfilingSection();
        this.sceneContext.putImageData(this.backBuffer, 0, 0);
        this.drawBattleSprites(timeMs);
        this.endProfilingSection("presentSceneCanvas", sectionStartTimeMs);
    },

    drawRayHit: function(rayHit, timeMs) {
        const projectedWallHeight =
            this.viewDist / rayHit.correctDistance * this.tileSize;
        const centerY = Math.floor(this.displayHeight / 2);
        const halfWallHeight = projectedWallHeight / 2;
        const wallTopY = Math.floor(
            (centerY - halfWallHeight - this.epsilon) /
            this.wallHeightStep
        ) * this.wallHeightStep;
        const wallBottomY = Math.ceil(
            (centerY + halfWallHeight + this.epsilon) / this.wallHeightStep
        ) * this.wallHeightStep;
        const wallScreenHeight =
            Math.max(this.wallHeightStep, wallBottomY - wallTopY);
        const textureX = Math.min(
            this.textureSize - 1,
            Math.max(0, Math.floor(rayHit.textureOffset * this.textureSize))
        );
        const textureY = 0;

        let lightRed = 1;
        let lightGreen = 1;
        let lightBlue = 1;

        const environmentMap = this.environmentMap;
        if (environmentMap) {
            const lightCellIsInBounds =
                rayHit.lightCellX >= 0 &&
                rayHit.lightCellY >= 0 &&
                rayHit.lightCellX < environmentMap.width &&
                rayHit.lightCellY < environmentMap.height;

            if (lightCellIsInBounds) {
                const environmentIndex = rayHit.lightCellX +
                    rayHit.lightCellY * environmentMap.width;

                lightRed = environmentMap.lightR[environmentIndex];
                lightGreen = environmentMap.lightG[environmentIndex];
                lightBlue = environmentMap.lightB[environmentIndex];

                const frontCellLightBonus =
                    this.getFrontCellLightBonus(rayHit.cellX, rayHit.cellY);
                lightRed += frontCellLightBonus;
                lightGreen += frontCellLightBonus;
                lightBlue += frontCellLightBonus;
            }
        }

        const dynamicLight = this.getDynamicLightSampleAt(
            rayHit.hitX,
            rayHit.hitY,
            rayHit.correctDistance,
            timeMs
        );

        lightRed += dynamicLight.red;
        lightGreen += dynamicLight.green;
        lightBlue += dynamicLight.blue;

        const fogProfile = this.fogProfilesByStrip[rayHit.strip];
        const fogSampleIndex =
            this.getFogSampleIndex(fogProfile, rayHit.correctDistance);
        const visibility = dynamicLight.visibility;
        const fogTransmittance =
            (fogProfile?.fogTransmittance[fogSampleIndex] ?? 1) *
            visibility;
        const fogRed = fogProfile?.red[fogSampleIndex] ?? 0;
        const fogGreen = fogProfile?.green[fogSampleIndex] ?? 0;
        const fogBlue = fogProfile?.blue[fogSampleIndex] ?? 0;
        const wallBrightness = 1 - this.effects.wallDarkness;
        const wallLightRed = lightRed * wallBrightness;
        const wallLightGreen = lightGreen * wallBrightness;
        const wallLightBlue = lightBlue * wallBrightness;
        const wallFogRed = fogRed * wallBrightness;
        const wallFogGreen = fogGreen * wallBrightness;
        const wallFogBlue = fogBlue * wallBrightness;

        this.drawWallStrip(
            rayHit,
            textureX,
            textureY,
            wallTopY,
            wallScreenHeight,
            wallLightRed,
            wallLightGreen,
            wallLightBlue,
            fogTransmittance,
            wallFogRed,
            wallFogGreen,
            wallFogBlue
        );

        this.drawWallSurfaceSprites(
            rayHit,
            wallTopY,
            wallScreenHeight,
            wallLightRed,
            wallLightGreen,
            wallLightBlue,
            fogTransmittance,
            wallFogRed,
            wallFogGreen,
            wallFogBlue
        );
    },

    drawTransparentScene: function(rayHits, cameraPose, timeMs) {
        const renderItems = [];

        // Visual walls are individual ray strips, so add each strip separately.
        for (const rayHit of rayHits) {
            if (! rayHit.visualWall) {
                continue;
            }

            // Reject anything behind a real wall
            const solidWallDepth =
                this.wallDepthByStrip[rayHit.strip] ?? Infinity;

            if (rayHit.correctDistance >= solidWallDepth - this.epsilon) {
                continue;
            }

            renderItems.push({
                depth: rayHit.correctDistance,
                rayHit,
                sprite: null,
                screenRectangle: null,
            });
        }

        // Add ordinary billboard sprites to the same depth-sorted list
        if (this.mapSpritesEnabled) {
            for (const sprite of this.sprites) {
                const screenRectangle =
                    this.spriteScreenPosition(sprite, cameraPose);
                if (! screenRectangle) {
                    continue;
                }

                renderItems.push({
                    depth: screenRectangle.cameraDepth,
                    rayHit: null,
                    sprite,
                    screenRectangle,
                });
            }
        }

        // Alpha compositing requires back-to-front rendering
        renderItems.sort((a, b) => b.depth - a.depth);

        for (const renderItem of renderItems) {
            if (renderItem.rayHit) {
                this.drawRayHit(renderItem.rayHit, timeMs);
                continue;
            }

            this.drawSprite(
                renderItem.sprite,
                renderItem.screenRectangle,
                cameraPose,
                timeMs
            );
        }
    },

    drawSprite: function(sprite, screenRectangle, cameraPose, timeMs) {
        const lodIndex = sprite?.lodIndex ?? 0;
        const spriteImageData =
            this.spriteImageDataById[sprite?.spriteId]?.[lodIndex];
        if (! spriteImageData) {
            return;
        }

        const sourceRectangle =
            this.getSpriteSourceRectangle(sprite, cameraPose);
        if (! sourceRectangle) {
            return;
        }

        const spriteStartX = Math.max(0, Math.floor(screenRectangle.x));
        const spriteEndX = Math.min(
            this.displayWidth,
            Math.ceil(screenRectangle.x + screenRectangle.w)
        );

        const spriteCellX = Math.floor(sprite.x);
        const spriteCellY = Math.floor(sprite.y);
        const environmentIndex =
            this.getEnvironmentIndex(spriteCellX, spriteCellY);

        let lightRed = environmentIndex >= 0
            ? (this.environmentMap.lightR[environmentIndex] ?? 1)
            : 1;
        let lightGreen = environmentIndex >= 0
            ? (this.environmentMap.lightG[environmentIndex] ?? 1)
            : 1;
        let lightBlue = environmentIndex >= 0
            ? (this.environmentMap.lightB[environmentIndex] ?? 1)
            : 1;

        const dynamicLight = this.getDynamicLightSampleAt(
            sprite.x,
            sprite.y,
            screenRectangle.worldDistance,
            timeMs
        );

        const spriteLight = this.applyDynamicSpriteLight(
            lightRed,
            lightGreen,
            lightBlue,
            dynamicLight
        );

        lightRed = spriteLight.red;
        lightGreen = spriteLight.green;
        lightBlue = spriteLight.blue;

        const visibility = dynamicLight.visibility;

        for (let x = spriteStartX; x < spriteEndX; x += this.spriteStripWidth) {
            const destinationWidth =
                Math.min(this.spriteStripWidth, spriteEndX - x);
            const sampleScreenX = x + destinationWidth / 2;

            const environmentStrip = Math.min(
                this.rayCount - 1,
                Math.max(0, Math.floor(sampleScreenX / this.stripWidth))
            );

            const wallDepth =
                this.wallDepthByStrip[environmentStrip] ?? Infinity;

            const spriteIsBehindWall =
                screenRectangle.cameraDepth >= wallDepth - this.epsilon;
            if (spriteIsBehindWall) {
                continue;
            }

            const sourceRatioX =
                (sampleScreenX - screenRectangle.x) / screenRectangle.w;

            const localSourceX = Math.min(
                sourceRectangle.width - 1,
                Math.max(0, Math.floor(sourceRatioX * sourceRectangle.width))
            );

            const sourceX = sourceRectangle.x + localSourceX;
            const fogProfile = this.fogProfilesByStrip[environmentStrip];
            const fogSampleIndex =
                this.getFogSampleIndex(fogProfile, screenRectangle.cameraDepth);
            const fogTransmittance =
                (fogProfile?.fogTransmittance[fogSampleIndex] ?? 1) *
                visibility;
            const fogRed = fogProfile?.red[fogSampleIndex] ?? 0;
            const fogGreen = fogProfile?.green[fogSampleIndex] ?? 0;
            const fogBlue = fogProfile?.blue[fogSampleIndex] ?? 0;

            this.drawTexturedRect(
                spriteImageData,
                sourceX,
                sourceRectangle.y,
                1,
                sourceRectangle.height,
                x,
                screenRectangle.y,
                destinationWidth,
                screenRectangle.h,
                lightRed,
                lightGreen,
                lightBlue,
                fogTransmittance,
                fogRed,
                fogGreen,
                fogBlue,
                true
            );
        }
    },

    getSpriteDirectionIndex: function(sprite, definition, cameraPose) {
        const isDirectional =
            this.isDirectionalSprite(definition) &&
            cameraPose &&
            Number.isFinite(sprite.facingAngle);

        if (! isDirectional) {
            return 0;
        }

        const directionCount = 8;
        const angleToCamera = this.normalizeAngle(
            Math.atan2(sprite.y - cameraPose.y, cameraPose.x - sprite.x)
        );

        // Frame 0 is the sprite's face, frames increasingly rotating clockwise
        const relativeAngle =
            this.normalizeAngle(sprite.facingAngle - angleToCamera);

        const directionStep = Math.PI * 2 / directionCount;
        return Math.round(relativeAngle / directionStep) % directionCount;
    },

    drawTextureSampleToStrip: function(
        imageData,
        worldX,
        worldY,
        cellX,
        cellY,
        stripStartX,
        stripEndX,
        screenY,
        strip,
        distance,
        fogSampleIndex,
        sightVisibility,
        plane,
        timeMs,
        environmentIndex = null,
        dynamicLight = null,
        surfaceSprites = undefined,
        shading = null
    ) {
        if (this.profilingCountersEnabled) {
            this.incrementProfilingCounter("textureSamples");
        }

        if (! imageData) {
            return;
        }

        const textureOffsetX = worldX - cellX;
        const textureOffsetY = worldY - cellY;
        const textureX = Math.floor(textureOffsetX * imageData.width);
        const textureY = Math.floor(textureOffsetY * imageData.height);
        const sourceIndex = (textureX + textureY * imageData.width) * 4;
        const sourceData = imageData.data;
        const destinationData = this.backBuffer.data;
        const destinationWidth = this.backBuffer.width;
        const sourceAlpha = sourceData[sourceIndex + 3];

        if (environmentIndex === null) {
            environmentIndex = this.getEnvironmentIndex(cellX, cellY);
        }

        if (! dynamicLight) {
            dynamicLight = this.getDynamicLightSampleAt(
                worldX,
                worldY,
                distance,
                timeMs,
                environmentIndex,
                sightVisibility
            );
        }

        if (! shading) {
            shading = this.getSurfaceShadingSample(
                environmentIndex,
                dynamicLight,
                strip,
                fogSampleIndex
            );
        }

        // Avoid texture RGB reads if no surface color can survive fog/darkness
        if (shading.fogTransmittance <= this.epsilon && sourceAlpha === 255) {
            this.zeroTransmittanceSamples++;
            for (let screenX = stripStartX; screenX < stripEndX; screenX++) {
                const destinationIndex =
                    (screenX + screenY * destinationWidth) * 4;

                destinationData[destinationIndex] = shading.fogRed;
                destinationData[destinationIndex + 1] = shading.fogGreen;
                destinationData[destinationIndex + 2] = shading.fogBlue;
                destinationData[destinationIndex + 3] = 255;
            }

            return;
        }

        let red = sourceData[sourceIndex];
        let green = sourceData[sourceIndex + 1];
        let blue = sourceData[sourceIndex + 2];
        let alpha = sourceAlpha;

        if (surfaceSprites === undefined) {
            surfaceSprites =
                this.surfaceSpritesByCell.get(environmentIndex) ?? null;
        }

        if (surfaceSprites) {
            for (const surfaceSprite of surfaceSprites) {
                if (surfaceSprite.plane !== plane) {
                    continue;
                }

                const surfaceSample =
                    this.getSurfaceSpriteSample(surfaceSprite, worldX, worldY);

                if (! surfaceSample || surfaceSample.alpha === 0) {
                    continue;
                }

                const overlayAlpha = surfaceSample.alpha / 255;
                const underlyingAlpha = 1 - overlayAlpha;

                red = surfaceSample.red * overlayAlpha + red *
                    underlyingAlpha;
                green = surfaceSample.green * overlayAlpha + green *
                    underlyingAlpha;
                blue = surfaceSample.blue * overlayAlpha + blue *
                    underlyingAlpha;
                alpha = 255;
            }
        }

        const litRed = Math.min(255, red * shading.lightRed);
        const litGreen = Math.min(255, green * shading.lightGreen);
        const litBlue = Math.min(255, blue * shading.lightBlue);
        const finalRed =
            litRed * shading.fogTransmittance + shading.fogRed;
        const finalGreen =
            litGreen * shading.fogTransmittance + shading.fogGreen;
        const finalBlue =
            litBlue * shading.fogTransmittance + shading.fogBlue;

        for (let screenX = stripStartX; screenX < stripEndX; screenX++) {
            const destinationIndex = (screenX + screenY * destinationWidth) * 4;
            destinationData[destinationIndex] = finalRed;
            destinationData[destinationIndex + 1] = finalGreen;
            destinationData[destinationIndex + 2] = finalBlue;
            destinationData[destinationIndex + 3] = alpha;
        }
    },

    drawTexturedFloorAndCeiling: function(cameraPose, timeMs) {
        const mapEntity = this.mapEntity;
        const gameMap = mapEntity.gameMap;
        const centerY = Math.floor(this.displayHeight / 2);

        const originX = cameraPose.x;
        const originY = cameraPose.y;
        const eyeHeight = this.tileSize / 2;
        const ceilingWorldHeight = this.tileSize * this.ceilingHeight;
        const ceilingDistanceFromEye = ceilingWorldHeight - eyeHeight;
        const surfacesAreSymmetric =
            Math.abs(ceilingDistanceFromEye - eyeHeight) <= this.epsilon;
        const cameraAngle = cameraPose.angle;
        const cameraSine = Math.sin(cameraAngle);
        const cameraCosine = Math.cos(cameraAngle);
        const fogSampleCount =
            this.fogProfilesByStrip[0]?.fogTransmittance.length ?? 1;
        const maximumFogSampleIndex = fogSampleCount - 1;
        const maximumDistanceY =
            Math.max(centerY, this.displayHeight - centerY - 1);

        let visibleSurfaceSamples = 0;
        let wallCulledSurfaceSamples = 0;
        let beyondVisibilitySamples = 0;
        let dynamicLightSamples = 0;
        let dynamicLightCandidateChecks = 0;

        for (let distanceY = 1; distanceY <= maximumDistanceY; distanceY++) {
            const floorScreenY = centerY + distanceY;
            const ceilingScreenY = centerY - distanceY;
            const floorIsVisible = floorScreenY < this.displayHeight;
            const ceilingIsVisible = ceilingScreenY >= 0;

            if (! floorIsVisible && ! ceilingIsVisible) {
                break;
            }

            let floorScale = 0;
            let floorDistance = 0;
            let floorBaseX = 0;
            let floorBaseY = 0;
            let floorFogSampleIndex = 0;

            if (floorIsVisible) {
                floorScale = eyeHeight / distanceY;
                floorDistance = this.viewDist * floorScale;
                floorFogSampleIndex = Math.min(
                    maximumFogSampleIndex,
                    Math.floor(floorDistance / this.fogSampleStep)
                );
                floorBaseX = originX + floorDistance * cameraCosine;
                floorBaseY = originY - floorDistance * cameraSine;
            }

            const floorSightVisibility = this.getDistanceVisibility(
                floorDistance,
                this.currentSightDistance
            );

            let ceilingScale = 0;
            let ceilingDistance = 0;
            let ceilingBaseX = 0;
            let ceilingBaseY = 0;
            let ceilingFogSampleIndex = 0;

            if (ceilingIsVisible) {
                ceilingScale = ceilingDistanceFromEye / distanceY;
                ceilingDistance = this.viewDist * ceilingScale;
                ceilingFogSampleIndex = Math.min(
                    maximumFogSampleIndex,
                    Math.floor(ceilingDistance / this.fogSampleStep)
                );
                ceilingBaseX = originX + ceilingDistance * cameraCosine;
                ceilingBaseY = originY - ceilingDistance * cameraSine;
            }

            const sharedSurfacesAreVisible =
                surfacesAreSymmetric &&
                floorIsVisible &&
                ceilingIsVisible;

            let sharedWorldX = 0;
            let sharedWorldY = 0;

            let sharedWorldStepX = 0;
            let sharedWorldStepY = 0;

            if (sharedSurfacesAreVisible) {
                const firstScreenOffset = this.rayScreenOffsets[0];
                const firstLateralDistance = firstScreenOffset * floorScale;
                sharedWorldX = floorBaseX - firstLateralDistance * cameraSine;
                sharedWorldY = floorBaseY - firstLateralDistance * cameraCosine;

                if (this.rayCount > 1) {
                    const screenOffsetStep =
                        this.rayScreenOffsets[1] - this.rayScreenOffsets[0];
                    sharedWorldStepX =
                        -screenOffsetStep * floorScale * cameraSine;
                    sharedWorldStepY =
                        -screenOffsetStep * floorScale * cameraCosine;
                }
            }

            const ceilingSightVisibility = this.getDistanceVisibility(
                ceilingDistance,
                this.currentSightDistance
            );

            let cachedCellX = -1;
            let cachedCellY = -1;
            let cachedCell = null;
            let cachedEnvironmentIndex = -1;
            let cachedFloorImageData = null;
            let cachedCeilingImageData = null;
            let cachedSurfaceSprites = null;
            let cachedDynamicLights = null;
            let cachedStaticLightRed = 1;
            let cachedStaticLightGreen = 1;
            let cachedStaticLightBlue = 1;

            const lastStrip = this.rayCount - 1;
            const finalStripWidth =
                this.rayStripEndXs[lastStrip] - this.rayStripStartXs[lastStrip];
            const finalStripIsPartial =
                Math.abs(finalStripWidth - this.stripWidth) > this.epsilon;

            for (let strip = 0; strip < this.rayCount; strip++) {
                const screenOffset = this.rayScreenOffsets[strip];
                const stripStartX = this.rayStripStartXs[strip];
                const stripEndX = this.rayStripEndXs[strip];
                const wallDistance = this.wallDepthByStrip[strip] ?? Infinity;

                if (sharedSurfacesAreVisible) {
                    if (strip > 0) {
                        const shouldReanchor =
                            strip % 32 === 0 ||
                            (finalStripIsPartial && strip === lastStrip);

                        if (shouldReanchor) {
                            const lateralDistance = screenOffset * floorScale;
                            sharedWorldX =
                                floorBaseX - lateralDistance * cameraSine;
                            sharedWorldY =
                                floorBaseY - lateralDistance * cameraCosine;
                        } else {
                            sharedWorldX += sharedWorldStepX;
                            sharedWorldY += sharedWorldStepY;
                        }
                    }

                    if (floorDistance >= wallDistance) {
                        wallCulledSurfaceSamples++;
                        continue;
                    }

                    visibleSurfaceSamples++;

                    const worldX = sharedWorldX;
                    const worldY = sharedWorldY;
                    const isInBounds =
                        worldX >= 0 &&
                        worldY >= 0 &&
                        worldX < gameMap.width &&
                        worldY < gameMap.height;

                    if (! isInBounds) {
                        continue;
                    }

                    const cellX = Math.floor(worldX);
                    const cellY = Math.floor(worldY);

                    if (cellX !== cachedCellX || cellY !== cachedCellY) {
                        cachedCellX = cellX;
                        cachedCellY = cellY;
                        cachedCell = gameMap.getCell(cellX, cellY);
                        cachedEnvironmentIndex =
                            this.getEnvironmentIndex(cellX, cellY);
                        cachedDynamicLights =
                            this.dynamicLightsByCell[cachedEnvironmentIndex] ??
                            null;
                        cachedStaticLightRed = this.environmentMap.lightR
                            ?.[cachedEnvironmentIndex] ?? 1;
                        cachedStaticLightGreen = this.environmentMap.lightG
                            ?.[cachedEnvironmentIndex] ?? 1;
                        cachedStaticLightBlue = this.environmentMap.lightB
                            ?.[cachedEnvironmentIndex] ?? 1;
                        cachedFloorImageData =
                            this.surfaceTextures[cachedCell?.floorTextureId];
                        cachedCeilingImageData =
                            this.surfaceTextures[cachedCell?.ceilingTextureId];
                        cachedSurfaceSprites = this.surfaceSpritesByCell
                            .get(cachedEnvironmentIndex) ?? null;

                        if (this.profilingCountersEnabled) {
                            this.incrementProfilingCounter(
                                "floorCeilingCellChanges"
                            );
                        }
                    } else {
                        if (this.profilingCountersEnabled) {
                            this.incrementProfilingCounter(
                                "floorCeilingCellReuses"
                            );
                        }
                    }

                    let dynamicLight;

                    const surfaceIsBeyondVisibility =
                        floorDistance >= this.currentVisibilityDistance;

                    if (surfaceIsBeyondVisibility) {
                        beyondVisibilitySamples++;
                        dynamicLight = this.noDynamicLightSampleScratch;
                        dynamicLight.visibility = 0;
                    } else if (cachedDynamicLights) {
                        dynamicLightSamples++;
                        dynamicLightCandidateChecks +=
                            cachedDynamicLights.length;
                        dynamicLight = this.getDynamicLightSampleAt(
                            worldX,
                            worldY,
                            floorDistance,
                            timeMs,
                            cachedEnvironmentIndex,
                            floorSightVisibility
                        );
                    } else {
                        dynamicLight = this.noDynamicLightSampleScratch;
                        dynamicLight.visibility = floorSightVisibility;
                    }

                    const shading = this.getSurfaceShadingSample(
                        cachedEnvironmentIndex,
                        dynamicLight,
                        strip,
                        floorFogSampleIndex,
                        cachedStaticLightRed,
                        cachedStaticLightGreen,
                        cachedStaticLightBlue
                    );

                    if (cachedFloorImageData) {
                        this.drawTextureSampleToStrip(
                            cachedFloorImageData,
                            worldX,
                            worldY,
                            cellX,
                            cellY,
                            stripStartX,
                            stripEndX,
                            floorScreenY,
                            strip,
                            floorDistance,
                            floorFogSampleIndex,
                            floorSightVisibility,
                            "floor",
                            timeMs,
                            cachedEnvironmentIndex,
                            dynamicLight,
                            cachedSurfaceSprites,
                            shading
                        );
                    }

                    if (cachedCeilingImageData) {
                        this.drawTextureSampleToStrip(
                            cachedCeilingImageData,
                            worldX,
                            worldY,
                            cellX,
                            cellY,
                            stripStartX,
                            stripEndX,
                            ceilingScreenY,
                            strip,
                            floorDistance,
                            floorFogSampleIndex,
                            floorSightVisibility,
                            "ceiling",
                            timeMs,
                            cachedEnvironmentIndex,
                            dynamicLight,
                            cachedSurfaceSprites,
                            shading
                        );
                    }

                    continue;
                }

                if (floorIsVisible && floorDistance < wallDistance) {
                    const lateralDistance = screenOffset * floorScale;
                    const floorWorldX =
                        floorBaseX - lateralDistance * cameraSine;
                    const floorWorldY =
                        floorBaseY - lateralDistance * cameraCosine;

                    const floorIsInBounds =
                        floorWorldX >= 0 &&
                        floorWorldY >= 0 &&
                        floorWorldX < gameMap.width &&
                        floorWorldY < gameMap.height;

                    if (floorIsInBounds) {
                        const floorCellX = Math.floor(floorWorldX);
                        const floorCellY = Math.floor(floorWorldY);
                        const floorCell =
                            gameMap.getCell(floorCellX, floorCellY);
                        const floorImageData =
                            this.surfaceTextures[floorCell?.floorTextureId];

                        this.drawTextureSampleToStrip(
                            floorImageData,
                            floorWorldX,
                            floorWorldY,
                            floorCellX,
                            floorCellY,
                            stripStartX,
                            stripEndX,
                            floorScreenY,
                            strip,
                            floorDistance,
                            floorFogSampleIndex,
                            floorSightVisibility,
                            "floor",
                            timeMs
                        );
                    }
                }

                if (ceilingIsVisible && ceilingDistance < wallDistance) {
                    const lateralDistance = screenOffset * ceilingScale;
                    const ceilingWorldX =
                        ceilingBaseX - lateralDistance * cameraSine;
                    const ceilingWorldY =
                        ceilingBaseY - lateralDistance * cameraCosine;

                    const ceilingIsInBounds =
                        ceilingWorldX >= 0 &&
                        ceilingWorldY >= 0 &&
                        ceilingWorldX < gameMap.width &&
                        ceilingWorldY < gameMap.height;

                    if (ceilingIsInBounds) {
                        const ceilingCellX = Math.floor(ceilingWorldX);
                        const ceilingCellY = Math.floor(ceilingWorldY);
                        const ceilingCell =
                            gameMap.getCell(ceilingCellX, ceilingCellY);
                        const ceilingImageData =
                            this.surfaceTextures[ceilingCell?.ceilingTextureId];

                        this.drawTextureSampleToStrip(
                            ceilingImageData,
                            ceilingWorldX,
                            ceilingWorldY,
                            ceilingCellX,
                            ceilingCellY,
                            stripStartX,
                            stripEndX,
                            ceilingScreenY,
                            strip,
                            ceilingDistance,
                            ceilingFogSampleIndex,
                            ceilingSightVisibility,
                            "ceiling",
                            timeMs
                        );
                    }
                }
            }
        }

        if (this.profilingEnabled) {
            this.profilingDiagnostics = {
                visibleSurfaceSamples,
                wallCulledSurfaceSamples,
                beyondVisibilitySamples,
                dynamicLightSamples,
                dynamicLightCandidateChecks,
                zeroTransmittanceSamples: this.zeroTransmittanceSamples,
            };
        }
    },

    setPixel: function(imageData, x, y, r, g, b, a) {
        const index = (x + y * imageData.width) * 4;
        imageData.data[index + 0] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = a;
    },

    getPixel: function (imageData, x, y) {
        const index = (x + y * imageData.width) * 4;
        return {
            r: imageData.data[index + 0],
            g: imageData.data[index + 1],
            b: imageData.data[index + 2],
            a: imageData.data[index + 3],
        };
    },

    drawTexturedRect: function(
        imageData,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        destinationX,
        destinationY,
        destinationWidth,
        destinationHeight,
        lightRed = 1,
        lightGreen = 1,
        lightBlue = 1,
        fogTransmittance = 1,
        fogRed = 0,
        fogGreen = 0,
        fogBlue = 0,
        blendSourceAlpha = false
    ) {
        sourceX = Math.trunc(sourceX);
        sourceY = Math.trunc(sourceY);
        destinationX = Math.trunc(destinationX);
        destinationY = Math.trunc(destinationY);

        const destinationEndX = Math.trunc(destinationX + destinationWidth);
        const destinationEndY = Math.trunc(destinationY + destinationHeight);
        const drawnWidth = destinationEndX - destinationX;
        const drawnHeight = destinationEndY - destinationY;

        if (drawnWidth === 0 || drawnHeight === 0) {
            return;
        }

        const textureStepX = sourceWidth / drawnWidth;
        let screenStartX = destinationX;
        let screenStartY = destinationY;
        let textureStartX = sourceX;

        if (screenStartY < 0) {
            screenStartY = 0;
        }

        if (screenStartX < 0) {
            textureStartX += -screenStartX * textureStepX;
            screenStartX = 0;
        }

        const sourceData = imageData.data;
        const destinationData = this.backBuffer.data;
        const sourceDataWidth = imageData.width;
        const destinationDataWidth = this.backBuffer.width;

        for (
            let screenY = screenStartY;
            screenY < destinationEndY && screenY < this.displayHeight;
            screenY++
        ) {
            const localDestinationY = screenY - destinationY;

            const localSourceY = Math.min(
                sourceHeight - 1,
                Math.max(
                    0,
                    Math.floor(localDestinationY * sourceHeight / drawnHeight)
                )
            );

            const sampledY = sourceY + localSourceY;
            let textureX = textureStartX;

            for (
                let screenX = screenStartX;
                screenX < destinationEndX && screenX < this.displayWidth;
                screenX++, textureX += textureStepX
            ) {
                const sampledX = Math.trunc(textureX);
                const sourceIndex = (sampledX + sampledY * sourceDataWidth) * 4;

                const sourceAlphaByte = sourceData[sourceIndex + 3];
                if (sourceAlphaByte === 0) {
                    continue;
                }

                const destinationIndex = (
                    screenX +
                    screenY * destinationDataWidth
                ) * 4;

                const litRed = sourceData[sourceIndex] * lightRed;
                const litGreen = sourceData[sourceIndex + 1] * lightGreen;
                const litBlue = sourceData[sourceIndex + 2] * lightBlue;

                const finalRed =
                    litRed * fogTransmittance +
                    fogRed * 255;

                const finalGreen =
                    litGreen * fogTransmittance +
                    fogGreen * 255;

                const finalBlue =
                    litBlue * fogTransmittance +
                    fogBlue * 255;

                if (blendSourceAlpha && sourceAlphaByte < 255) {
                    const sourceAlpha = sourceAlphaByte / 255;
                    const destinationAlpha = 1 - sourceAlpha;

                    destinationData[destinationIndex] =
                        finalRed * sourceAlpha +
                        destinationData[destinationIndex] *
                        destinationAlpha;

                    destinationData[destinationIndex + 1] =
                        finalGreen * sourceAlpha +
                        destinationData[destinationIndex + 1] *
                        destinationAlpha;

                    destinationData[destinationIndex + 2] =
                        finalBlue * sourceAlpha +
                        destinationData[destinationIndex + 2] *
                        destinationAlpha;
                } else {
                    destinationData[destinationIndex] = finalRed;
                    destinationData[destinationIndex + 1] = finalGreen;
                    destinationData[destinationIndex + 2] = finalBlue;
                }

                destinationData[destinationIndex + 3] = 255;
            }
        }
    },

    getSignedAngleDifference: function(targetAngle, cameraAngle) {
        const fullRotation = Math.PI * 2;
        let difference = targetAngle - cameraAngle;

        difference = (difference + Math.PI) % fullRotation - Math.PI;
        if (difference < -Math.PI) {
            difference += fullRotation;
        }

        return difference;
    },

    spriteScreenPosition: function(sprite, cameraPose) {
        const originX = cameraPose.x;
        const originY = cameraPose.y;
        const angle = cameraPose.angle;
        const differenceX = sprite.x - originX;
        const differenceY = originY - sprite.y;
        const spriteWorldAngle = Math.atan2(differenceY, differenceX);
        const relativeAngle = this.getSignedAngleDifference(
            spriteWorldAngle,
            angle
        );

        const halfFieldOfView = this.fovRadians / 2;
        if (Math.abs(relativeAngle) > halfFieldOfView) {
            return null;
        }

        const distance = Math.hypot(differenceX, differenceY);
        const visualDistance = Math.max(
            this.epsilon,
            distance - 0.25 - (sprite.depthOffset ?? 0)
        );

        const correctedDistance = visualDistance * Math.cos(relativeAngle);
        if (correctedDistance <= 0) {
            return null;
        }

        const screenWidth = sprite.width * this.viewDist / correctedDistance;
        const screenHeight = sprite.height * this.viewDist / correctedDistance;
        const centerScreenX =
            this.displayWidth / 2 - Math.tan(relativeAngle) * this.viewDist;
        const heightDifference = (this.displayHeight - screenHeight) / 2;

        return {
            x: centerScreenX - screenWidth / 2,
            y: heightDifference - sprite.verticalOffset * screenHeight,
            w: screenWidth,
            h: screenHeight,
            cameraDepth: correctedDistance,
            worldDistance: visualDistance,
        };
    },

    updateWallDepthByStrip: function(rayHits) {
        const needsDepthBuffer =
            ! this.wallDepthByStrip ||
            this.wallDepthByStrip.length !== this.rayCount;

        if (needsDepthBuffer) {
            this.wallDepthByStrip = new Float32Array(this.rayCount);
        }

        this.wallDepthByStrip.fill(Infinity);

        for (const rayHit of rayHits) {
            if (rayHit.sprite || rayHit.visualWall) {
                continue;
            }

            const strip = rayHit.strip;
            if (rayHit.correctDistance < this.wallDepthByStrip[strip]) {
                this.wallDepthByStrip[strip] = rayHit.correctDistance;
            }
        }
    },

    drawWallStrip: function(
        rayHit,
        textureX,
        textureY,
        wallTopY,
        wallScreenHeight,
        lightRed,
        lightGreen,
        lightBlue,
        fogTransmittance,
        fogRed,
        fogGreen,
        fogBlue
    ) {
        const sWidth = 1;
        const sHeight = this.textureSize;
        const x = rayHit.strip * this.stripWidth;
        const y = wallTopY;
        const w = this.stripWidth;
        const h = wallScreenHeight;

        const texture =
            this.surfaceTextures[rayHit.textureId] ??
            this.surfaceTextures.default;

        this.drawTexturedRect(
            texture,
            textureX,
            textureY,
            sWidth,
            sHeight,
            x,
            y,
            w,
            h,
            lightRed,
            lightGreen,
            lightBlue,
            fogTransmittance,
            fogRed,
            fogGreen,
            fogBlue,
            true
        );

        for (let level = 1; level < this.ceilingHeight; level++) {
            this.drawTexturedRect(
                texture,
                textureX,
                textureY,
                sWidth,
                sHeight,
                x,
                y - level * wallScreenHeight,
                w,
                h,
                lightRed,
                lightGreen,
                lightBlue,
                fogTransmittance,
                fogRed,
                fogGreen,
                fogBlue,
                true
            );
        }
    },

    drawWallSurfaceSprites: function(
        rayHit,
        wallTopY,
        wallScreenHeight,
        lightRed,
        lightGreen,
        lightBlue,
        fogTransmittance,
        fogRed,
        fogGreen,
        fogBlue
    ) {
        const key =
            this.getWallSurfaceKey(rayHit.cellX, rayHit.cellY, rayHit.face);
        const sprites = this.wallSurfaceSpritesByFace.get(key);

        if (! sprites?.length) {
            return;
        }

        for (const sprite of sprites) {
            this.drawWallSurfaceSprite(
                sprite,
                rayHit,
                wallTopY,
                wallScreenHeight,
                lightRed,
                lightGreen,
                lightBlue,
                fogTransmittance,
                fogRed,
                fogGreen,
                fogBlue
            );
        }
    },

    drawWallSurfaceSprite: function(
        sprite,
        rayHit,
        wallTopY,
        wallScreenHeight,
        lightRed,
        lightGreen,
        lightBlue,
        fogTransmittance,
        fogRed,
        fogGreen,
        fogBlue
    ) {
        const lodIndex = sprite.lodIndex ?? 0;
        const imageData = this.spriteImageDataById[sprite.spriteId]?.[lodIndex];
        if (! imageData) {
            return;
        }

        const sourceRectangle = this.getSpriteSourceRectangle(sprite, null);
        if (! sourceRectangle) {
            return;
        }

        // wallU uses the same orientation as the wall texture itself
        const wallU = rayHit.textureOffset;
        const spriteWidth = Math.max(this.epsilon, sprite.width);
        const spriteHeight = Math.max(this.epsilon, sprite.height);

        // Wall decals are currently centered horizontally on the face
        const left = 0.5 - spriteWidth / 2;
        const right = 0.5 + spriteWidth / 2;

        if (wallU < left || wallU >= right) {
            return;
        }

        const localU = (wallU - left) / spriteWidth;

        const localSourceX = Math.min(
            sourceRectangle.width - 1,
            Math.max(0, Math.floor(localU * sourceRectangle.width))
        );

        const sourceX = sourceRectangle.x + localSourceX;
        const destinationHeight = wallScreenHeight * spriteHeight;

        // verticalOffset is in wall-height units. Positive values move upward
        const centerY =
            wallTopY + wallScreenHeight / 2 -
            sprite.verticalOffset * wallScreenHeight;

        const destinationY = centerY - destinationHeight / 2;
        const destinationX = rayHit.strip * this.stripWidth;

        this.drawTexturedRect(
            imageData,

            sourceX,
            sourceRectangle.y,
            1,
            sourceRectangle.height,

            destinationX,
            destinationY,
            this.stripWidth,
            destinationHeight,

            lightRed,
            lightGreen,
            lightBlue,

            fogTransmittance,
            fogRed,
            fogGreen,
            fogBlue,

            true
        );
    },

    // Battle mode enemy displays

    getBattleSpriteSlots: function(memberCount) {
        const count = Math.max(0, Math.min(6, Math.floor(memberCount)));
        const slots = [];
        let memberIndex = 0;

        for (let rowIndex = 0; memberIndex < count; rowIndex++) {
            const remainingMembers = count - memberIndex;
            const frontMemberIsAlone = rowIndex === 0 && count % 2 === 1;
            const membersInRow = frontMemberIsAlone
                ? 1
                : Math.min(2, remainingMembers);
            const depth =
                this.battleRowDepths[rowIndex] ??
                this.battleRowDepths.at(-1);

            if (membersInRow === 1) {
                slots.push({ x: 0, depth });
                memberIndex++;
                continue;
            }

            slots.push({ x: -this.battleRowHorizontalOffset, depth  });
            slots.push({ x:  this.battleRowHorizontalOffset, depth });
            memberIndex += 2;
        }

        return slots;
    },

    setBattleParty: function(enemyEntity) {
        const party = Array.isArray(enemyEntity?.party)
            ? enemyEntity.party.slice(0, 6)
            : [];
        const slots = this.getBattleSpriteSlots(party.length);
        this.battleSprites = [];

        for (let index = 0; index < party.length; index++) {
            const partyMember = party[index];
            const spriteId = partyMember.battleSpriteId;
            const definition = TARDQUEST_SPRITES[spriteId];

            if (! definition) {
                console.error(
                    "Could not find battle sprite definition",
                    { partyMember, spriteId }
                );
                continue;
            }

            const lods = this.getSpriteLodDefinitions(definition);
            const memberIsDead = partyMember.isDead?.() === true;

            this.battleSprites.push({
                memberId: partyMember.id,
                partyMember: partyMember,
                spriteId: spriteId,
                slot: slots[index],
                visible: ! memberIsDead,
                lodIndex: 0,
                lodDefinition: lods[0],
                spriteAnimationId: definition.defaultAnimation ?? "idle",
                spriteAnimationStartedAtMs: performance.now(),
                animationId: definition.defaultAnimation ?? "idle",
                animationFrame: 0,
                highlightOpacity: 1,
                highlightTransition: null,
                effectId: null,
                effectStartedAtMs: null,
            });
        }

        this.sceneDirty = true;
    },

    getBattleSprite: function(memberId) {
        return this.battleSprites.find(s => s.memberId === memberId) ?? null;
    },

    setBattleSpriteAnimation: function(memberId, animationId) {
        const sprite = this.getBattleSprite(memberId);
        if (! sprite) {
            console.warn("Could not find battle sprite", { memberId });
            return false;
        }

        const definition = TARDQUEST_SPRITES[sprite.spriteId];
        const animation = definition?.animations?.[animationId];
        if (! animation) {
            console.warn(
                "Could not find battle sprite animation",
                { memberId, spriteId: sprite.spriteId, animationId }
            );
            return false;
        }

        if (sprite.spriteAnimationId === animationId) {
            return true;
        }

        sprite.spriteAnimationId = animationId;
        sprite.spriteAnimationStartedAtMs = performance.now();

        this.sceneDirty = true;
        if (this.mapEntity?.gameMap) {
            this.render(this.mapEntity.gameMap);
        }

        return true;
    },

    resetBattleSpriteAnimation: function(memberId) {
        const sprite = this.getBattleSprite(memberId);
        if (! sprite) {
            return false;
        }

        const definition = TARDQUEST_SPRITES[sprite.spriteId];
        const animationId = definition?.defaultAnimation ?? "idle";

        return this.setBattleSpriteAnimation(memberId, animationId);
    },

    playBattleSpriteReaction: function(
        memberId,
        animationId,
        effectId,
        startedAtMs = performance.now()
    ) {
        const sprite = this.getBattleSprite(memberId);
        if (! sprite) {
            console.warn("Could not find battle sprite", { memberId });
            return false;
        }

        const spriteDefinition = TARDQUEST_SPRITES[sprite.spriteId];
        const animation = spriteDefinition?.animations?.[animationId];
        const effect = this.battleSpriteEffects[effectId];

        if (! animation || ! effect) {
            console.warn(
                "Could not play battle sprite reaction",
                { memberId, animationId, effectId }
            );
            return false;
        }

        sprite.spriteAnimationId = animationId;
        sprite.spriteAnimationStartedAtMs = startedAtMs;
        sprite.effectId = effectId;
        sprite.effectStartedAtMs = startedAtMs;
        this.sceneDirty = true;
        this.forceNextPresentation = true;
        this.startPresentationLoop();

        return true;
    },

    clearBattleParty: function() {
        this.battleSprites = [];
        this.sceneDirty = true;
    },

    getBattleSpriteScreenRectangle: function(sprite) {
        const definition = TARDQUEST_SPRITES[sprite.spriteId];
        if (! definition || ! sprite.slot) {
            return null;
        }

        const depth = Math.max(this.epsilon, sprite.slot.depth);
        const worldWidth = definition.worldWidth ?? 1;
        const worldHeight = definition.worldHeight ?? 1;
        const screenWidth = worldWidth * this.viewDist / depth;
        const screenHeight = worldHeight * this.viewDist / depth;
        const centerX =
            this.displayWidth / 2 + sprite.slot.x * this.viewDist / depth;

        return {
            x: centerX - screenWidth / 2,
            y: (this.displayHeight - screenHeight) / 2,
            w: screenWidth,
            h: screenHeight,
            cameraDepth: depth,
        };
    },

    drawBattleSprite: function(
        sprite,
        screenRectangle,
        highlightOpacity,
        effectState
    ) {
        const lodIndex = sprite.lodIndex ?? 0;
        const spriteCanvas = this.spriteCanvasById[sprite.spriteId]?.[lodIndex];

        if (! spriteCanvas) {
            return;
        }

        const sourceRectangle = this.getSpriteSourceRectangle(sprite, null);
        if (! sourceRectangle) {
            return;
        }

        const $battleSpriteCanvas = this.prepareBattleSpriteFrame(
            spriteCanvas,
            sourceRectangle,
            effectState
        );

        const $drawCanvas = $battleSpriteCanvas;
        const drawSourceRectangle = {
            x: 0,
            y: 0,
            width: $battleSpriteCanvas.width,
            height: $battleSpriteCanvas.height,
        };

        const context = this.sceneContext;
        const centerX = screenRectangle.x + screenRectangle.w / 2;
        const centerY = screenRectangle.y + screenRectangle.h / 2;
        const degreesToRadians = Math.PI / 180;
        const skewX = Math.tan(effectState.skewX * degreesToRadians);
        const skewY = Math.tan(effectState.skewY * degreesToRadians);
        context.save();

        context.imageSmoothingEnabled = false;
        context.translate(
            centerX + effectState.translateX,
            centerY + effectState.translateY
        );

        context.transform(1, skewY, skewX, 1, 0, 0);
        context.rotate(effectState.rotation * degreesToRadians);
        context.scale(effectState.scaleX, effectState.scaleY);

        const finalOpacity = effectState.opacity * highlightOpacity;
        context.globalAlpha = Math.max(0, Math.min(1, finalOpacity));

        context.filter =
            `brightness(${Math.max(0, effectState.brightness)}) ` +
            `contrast(${Math.max(0, effectState.contrast)}) ` +
            `hue-rotate(${effectState.hueRotation}deg) ` +
            `invert(${Math.max(0, Math.min(1, effectState.invert))})`;

        context.drawImage(
            $drawCanvas,
            drawSourceRectangle.x,
            drawSourceRectangle.y,
            drawSourceRectangle.width,
            drawSourceRectangle.height,
            -screenRectangle.w / 2,
            -screenRectangle.h / 2,
            screenRectangle.w,
            screenRectangle.h
        );

        context.restore();
    },

    drawBattleSprites: function(timeMs = performance.now()) {
        if (this.battleSprites.length === 0) {
            return;
        }

        const visibleSprites = [];

        for (const sprite of this.battleSprites) {
            if (! sprite.visible) {
                continue;
            }

            const definition = TARDQUEST_SPRITES[sprite.spriteId];
            if (! definition) {
                continue;
            }

            const animationState =
                this.getSpriteAnimationState(sprite, definition, timeMs);
            sprite.animationId = animationState.animationId;
            sprite.animationFrame = animationState.animationFrame;

            if (animationState.isAnimated) {
                this.animatedSpritesPresent = true;

                this.nextSpriteAnimationTimeMs = Math.min(
                    this.nextSpriteAnimationTimeMs,
                    animationState.nextFrameTimeMs
                );
            }

            const screenRectangle = this.getBattleSpriteScreenRectangle(sprite);
            if (! screenRectangle) {
                continue;
            }

            const highlightOpacity =
                this.getBattleSpriteHighlightOpacity(sprite, timeMs);
            const effectState = this.getBattleSpriteEffectState(sprite, timeMs);

            visibleSprites.push({
                sprite,
                screenRectangle,
                highlightOpacity,
                effectState
            });
        }

        // Draw the furthest party members first
        visibleSprites.sort((first, second) =>
            second.screenRectangle.cameraDepth -
            first.screenRectangle.cameraDepth
        );

        for (const v of visibleSprites) {
            this.drawBattleSprite(
                v.sprite,
                v.screenRectangle,
                v.highlightOpacity,
                v.effectState
            );
        }
    },

    sampleBattleSpriteEffect: function(definition, progress) {
        const defaultState = { ...this.battleSpriteEffectDefaults };
        const keyframes = definition?.keyframes ?? [];

        if (keyframes.length === 0) {
            return defaultState;
        }

        if (definition.interpolation === "step") {
            let activeKeyframe = keyframes[0];

            for (const keyframe of keyframes) {
                if (keyframe.offset > progress) {
                    break;
                }

                activeKeyframe = keyframe;
            }

            return { ...defaultState, ...activeKeyframe };
        }

        let previousKeyframe = keyframes[0];
        let nextKeyframe = keyframes[keyframes.length - 1];

        for (let index = 1; index < keyframes.length; index++) {
            if (progress <= keyframes[index].offset) {
                previousKeyframe = keyframes[index - 1];
                nextKeyframe = keyframes[index];
                break;
            }
        }

        const keyframeDistance = nextKeyframe.offset - previousKeyframe.offset;
        let segmentProgress = keyframeDistance > this.epsilon
            ? (progress - previousKeyframe.offset) / keyframeDistance
            : 1;

        segmentProgress = Math.max(0, Math.min(1, segmentProgress));

        if (definition.interpolation === "smooth") {
            segmentProgress =
                segmentProgress * segmentProgress * (3 - 2 * segmentProgress);
        }

        const state = { ...defaultState };

        for (const property of this.battleSpriteEffectProperties) {
            const startingValue =
                previousKeyframe[property] ??
                defaultState[property];

            const endingValue =
                nextKeyframe[property] ??
                defaultState[property];

            state[property] =
                startingValue + (endingValue - startingValue) * segmentProgress;
        }

        return state;
    },

    getBattleSpriteEffectState: function(sprite, timeMs) {
        const defaultState = { ...this.battleSpriteEffectDefaults };
        if (! sprite.effectId) {
            return defaultState;
        }

        const definition = this.battleSpriteEffects[sprite.effectId];
        if (! definition) {
            sprite.effectId = null;
            sprite.effectStartedAtMs = null;
            return defaultState;
        }

        const elapsedMs = Math.max(0, timeMs - sprite.effectStartedAtMs);
        const progress = elapsedMs / definition.durationMs;

        // All given CSS effect release their properties when the animation ends
        if (progress >= 1) {
            sprite.effectId = null;
            sprite.effectStartedAtMs = null;
            return defaultState;
        }

        return this.sampleBattleSpriteEffect(definition, progress);
    },

    playBattleSpriteEffect: function(memberId, effectId) {
        const sprite = this.getBattleSprite(memberId);
        const definition = this.battleSpriteEffects[effectId];

        if (! sprite || ! definition) {
            console.warn(
                "Could not play battle sprite effect",
                { memberId, effectId }
            );
            return false;
        }

        sprite.effectId = effectId;
        sprite.effectStartedAtMs = performance.now();
        this.sceneDirty = true;
        this.forceNextPresentation = true;
        this.startPresentationLoop();

        return true;
    },

    clearBattleSpriteEffect: function(memberId) {
        const sprite = this.getBattleSprite(memberId);
        if (! sprite) {
            return false;
        }

        sprite.effectId = null;
        sprite.effectStartedAtMs = null;
        this.sceneDirty = true;

        return true;
    },

    hasActiveBattleSpriteEffects: function() {
        return this.battleSprites.some(sprite => Boolean(sprite.effectId));
    },

    tintBattleSpriteFrame: function(
        context,
        width,
        height,
        red,
        green,
        blue,
        amount
    ) {
        const finalAmount = Math.max(0, Math.min(1, amount ?? 0));
        if (finalAmount <= 0) {
            return;
        }

        context.save();
        context.globalCompositeOperation = "source-atop";
        context.globalAlpha = finalAmount;
        context.fillStyle =
            `rgb(${Math.round(red)},${Math.round(green)},${Math.round(blue)})`;
        context.fillRect(0, 0, width, height);
        context.restore();
    },

    multiplyBattleSpriteFrame: function(
        context,
        spriteCanvas,
        sourceRectangle,
        width,
        height,
        red,
        green,
        blue,
        amount
    ) {
        const finalAmount = Math.max(0, Math.min(1, amount ?? 0));
        if (finalAmount <= 0) {
            return;
        }

        context.save();
        context.globalCompositeOperation = "multiply";
        context.globalAlpha = finalAmount;
        context.fillStyle =
            `rgb(${Math.round(red)},${Math.round(green)},${Math.round(blue)})`;
        context.fillRect(0, 0, width, height);

        // Multiply fill includes transparency. Restore the original alpha
        context.globalAlpha = 1;
        context.globalCompositeOperation = "destination-in";

        context.drawImage(
            spriteCanvas,
            sourceRectangle.x,
            sourceRectangle.y,
            sourceRectangle.width,
            sourceRectangle.height,
            0,
            0,
            width,
            height
        );

        context.restore();
    },

    prepareBattleSpriteFrame: function(
        spriteCanvas,
        sourceRectangle,
        effectState
    ) {
        if (! this.$battleSpriteEffectCanvas) {
            this.$battleSpriteEffectCanvas = document.createElement("canvas");
            this.battleSpriteEffectContext =
                this.$battleSpriteEffectCanvas.getContext("2d", { alpha: true });
        }

        const $canvas = this.$battleSpriteEffectCanvas;
        const context = this.battleSpriteEffectContext;
        const width = Math.max(1, Math.round(sourceRectangle.width));
        const height = Math.max(1, Math.round(sourceRectangle.height));

        if ($canvas.width !== width || $canvas.height !== height) {
            $canvas.width = width;
            $canvas.height = height;
        }

        context.clearRect(0, 0, width, height);
        context.imageSmoothingEnabled = false;

        context.drawImage(
            spriteCanvas,
            sourceRectangle.x,
            sourceRectangle.y,
            sourceRectangle.width,
            sourceRectangle.height,
            0,
            0,
            width,
            height
        );

        const battleTint = this.battleSpriteTint;

        this.multiplyBattleSpriteFrame(
            context,
            spriteCanvas,
            sourceRectangle,
            width,
            height,
            battleTint.red,
            battleTint.green,
            battleTint.blue,
            battleTint.amount
        );

        // Apply a transient tinting to allow damage flashes
        this.tintBattleSpriteFrame(
            context,
            width,
            height,
            effectState.tintRed,
            effectState.tintGreen,
            effectState.tintBlue,
            effectState.tintAmount
        );

        return $canvas;
    },

    getBattleSpriteHighlightOpacity: function(sprite, timeMs) {
        const transition = sprite.highlightTransition;
        if (! transition) {
            return sprite.highlightOpacity ?? 1;
        }

        const elapsedMs = timeMs - transition.startTimeMs;
        const progress =
            Math.max(0, Math.min(1, elapsedMs / transition.durationMs)
        );

        const easedProgress = progress * progress * (3 - 2 * progress);
        const opacity = transition.startOpacity +
            (transition.targetOpacity - transition.startOpacity) *
            easedProgress;

        sprite.highlightOpacity = opacity;

        if (progress >= 1) {
            sprite.highlightOpacity = transition.targetOpacity;
            sprite.highlightTransition = null;
        }

        return sprite.highlightOpacity;
    },

    highlightEntities: function(entityIds = []) {
        const ids = Array.isArray(entityIds)
            ? entityIds
            : [ entityIds ];

        const highlightedIds =
            new Set(ids.filter(id => id !== null && id !== undefined));
        const hasHighlight = highlightedIds.size > 0;
        const timeMs = performance.now();

        let transitionStarted = false;

        for (const sprite of this.battleSprites) {
            // Resolve existing transitions first to stop visible jumps
            const currentOpacity =
                this.getBattleSpriteHighlightOpacity(sprite, timeMs);
            const targetOpacity =
                ! hasHighlight ||
                highlightedIds.has(sprite.memberId)
                    ? 1
                    : this.battleSpriteDimmedOpacity;

            if (Math.abs(currentOpacity - targetOpacity) <= this.epsilon) {
                sprite.highlightOpacity = targetOpacity;
                sprite.highlightTransition = null;
                continue;
            }

            sprite.highlightTransition = {
                startOpacity: currentOpacity,
                targetOpacity,
                startTimeMs: timeMs,
                durationMs: this.battleSpriteHighlightDurationMs,
            };

            transitionStarted = true;
        }

        if (! transitionStarted) {
            return;
        }

        this.sceneDirty = true;
        this.forceNextPresentation = true;
        this.startPresentationLoop();
    },

    hasActiveBattleSpriteHighlightTransitions: function() {
        return this.battleSprites.some(s => Boolean(s.highlightTransition));
    },

    setBattleSpriteVisibility: function(memberId, visible) {
        const sprite = this.getBattleSprite(memberId);
        if (! sprite) {
            return false;
        }

        const finalVisibility = Boolean(visible);
        if (sprite.visible === finalVisibility) {
            return true;
        }

        sprite.visible = finalVisibility;
        this.sceneDirty = true;

        if (this.mapEntity?.gameMap) {
            this.render(this.mapEntity.gameMap);
        }

        return true;
    },

    hideBattleSprite: function(memberId) {
        return this.setBattleSpriteVisibility(memberId, false);
    },

    showBattleSprite: function(memberId) {
        return this.setBattleSpriteVisibility(memberId, true);
    },
};

const TARDQUEST_BATTLE_SPRITE_EFFECTS = {
    damaged: {
        durationMs: 168,

        keyframes: [
            {
                offset: 0,
                translateX: 0,
                skewX: 0,
                rotation: 0,
                tint: "#ff0000",
                tintAmount: 1,
            },
            {
                offset: 0.2,
                translateX: -4,
                skewX: -6,
                rotation: -2,
                tint: "#ff0000",
                tintAmount: 0.8,
            },
            {
                offset: 0.4,
                translateX: 4,
                skewX: 6,
                rotation: 2,
                tint: "#ff0000",
                tintAmount: 0.6,
            },
            {
                offset: 0.6,
                translateX: -4,
                skewX: -8,
                rotation: -3,
                tint: "#ff0000",
                tintAmount: 0.4,
            },
            {
                offset: 0.8,
                translateX: 4,
                skewX: 8,
                rotation: 3,
                tint: "#ff0000",
                tintAmount: 0.2,
            },
            {
                offset: 1,
                translateX: 0,
                skewX: 0,
                rotation: 0,
                tint: "#ff0000",
                tintAmount: 0,
            },
        ],
    },

    crtFlashed: {
        durationMs: 500,

        keyframes: [
            { offset: 0, invert: 1, hold: true },
            { offset: 0.1, invert: 0, hold: true },
            { offset: 0.2, invert: 1, hold: true },
            { offset: 0.3, invert: 0, hold: true },
            { offset: 0.4, invert: 1, hold: true },
            { offset: 0.5, invert: 0, hold: true },
            { offset: 0.6, invert: 1, hold: true },
            { offset: 0.7, invert: 0, hold: true },
            { offset: 0.8, invert: 1, hold: true },
            { offset: 0.9, invert: 0, hold: true },
            { offset: 1, invert: 0 },
        ],
    },
};
