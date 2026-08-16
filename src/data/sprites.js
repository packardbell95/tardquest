"use strict";

/**
 * Definitions for all of the sprites that can appear in the game
 *
 * Key
 * The sprite's unique identifier
 *
 * Object
 * - type ("billboard"|"directional"|"surface"): The type of sprite
 *      "billboard" refers to a sprite that will only ever face the player
 *      "directional" refers to a sprite sheet containing 8 directional faces
 *      "surface" refers to a sprite that's on the floor or ceiling
 * - src (string): The relative path to the sprite sheet
 * - frameWidth (number): How wide a frame of the sheet is
 * - frameHeight (number): How tall a frame of the sheet is
 * - worldWidth (number): Default display width
 * - worldHeight (number): Default display height
 * - depthOffset (number): How deep into a cell the sprite is displayed
 */

const TARDQUEST_SPRITES = {
    bloodyCrater: {
        type: "surface",
        plane: "floor",
        src: "assets/sprite-sheets/surfaces/bloody-crater.png",
        frameWidth: 8,
        frameHeight: 8,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
    },

    burialPlot: {
        type: "surface",
        plane: "floor",
        directional: true,
        src: "assets/sprite-sheets/surfaces/burial-plot.png",
        frameWidth: 16,
        frameHeight: 16,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
    },

    bouldingBall: {
        type: "billboard",
        directional: true,
        src: "assets/sprite-sheets/boulding-ball.png",
        frameWidth: 34,
        frameHeight: 34,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,

        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 8,
                frameDurationMs: 500,
            },
        },
    },

    circularShadow: {
        type: "surface",
        plane: "floor",
        src: "assets/sprite-sheets/surfaces/circular-shadow.png",
        frameWidth: 8,
        frameHeight: 8,
        worldWidth: 1,
        worldHeight: 1,
    },

    bobbingShadow: {
        type: "surface",
        plane: "floor",
        src: "assets/sprite-sheets/surfaces/bobbing-shadow.png",
        frameWidth: 8,
        frameHeight: 8,
        worldWidth: 1,
        worldHeight: 1,

        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 4,
                frameDurationMs: 100,
            },
        },
    },

    crackedFloorSlight: {
        type: "surface",
        plane: "floor",
        src: "assets/sprite-sheets/surfaces/cracked-floor/slight.png",
        frameWidth: 16,
        frameHeight: 16,
        worldWidth: 1,
        worldHeight: 1,
    },

    crackedFloorModerate: {
        type: "surface",
        plane: "floor",
        src: "assets/sprite-sheets/surfaces/cracked-floor/moderate.png",
        frameWidth: 16,
        frameHeight: 16,
        worldWidth: 1,
        worldHeight: 1,
    },

    crackedFloorSevere: {
        type: "surface",
        plane: "floor",
        src: "assets/sprite-sheets/surfaces/cracked-floor/severe.png",
        frameWidth: 16,
        frameHeight: 16,
        worldWidth: 1,
        worldHeight: 1,
    },

    crater: {
        type: "surface",
        plane: "floor",
        src: "assets/sprite-sheets/surfaces/crater.png",
        frameWidth: 20,
        frameHeight: 20,
        worldWidth: 1,
        worldHeight: 1,
    },

    demo01Krabs: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/billboards/demo01/krabs.png",
        frameWidth: 36,
        frameHeight: 36,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
    },

    demo01Patty: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/billboards/demo01/patty.png",
        frameWidth: 200,
        frameHeight: 200,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 20,
                frameDurationMs: 20,
            },
        },
    },

    erok: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/erok.png",
        frameWidth: 30,
        frameHeight: 30,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
    },

    exitArrow: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/exit-arrow.png",
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,

        lods: [
            {
                src: "assets/sprite-sheets/billboards/exit-arrow/near.png",
                frameWidth: 42,
                frameHeight: 42,
            },
            {
                src: "assets/sprite-sheets/billboards/exit-arrow/far.png",
                frameWidth: 21,
                frameHeight: 21,
            },
        ],

        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 8,
                frameDurationMs: 100,
            },
        },
    },

    gambler: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/gambler.png",
        frameWidth: 178,
        frameHeight: 178,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
    },

    gravestone: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/billboards/gravestone.png",
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: -0.4,

        lods: [
            {
                src: "assets/sprite-sheets/billboards/gravestone/near.png",
                frameWidth: 154,
                frameHeight: 154,
            },
            {
                src: "assets/sprite-sheets/billboards/gravestone/far.png",
                frameWidth: 77,
                frameHeight: 77,
            },
        ],
    },

    healingTile: {
        type: "surface",
        plane: "floor",
        src: "assets/sprite-sheets/surfaces/healing-tile.png",
        frameWidth: 8,
        frameHeight: 8,
        worldWidth: 1,
        worldHeight: 1,

        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 32,
                frameDurationMs: 125,
            },
        },
    },

    merchant: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/merchant.png",
        frameWidth: 260,
        frameHeight: 260,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0,
    },

    pigeon: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/pigeon.png",
        frameWidth: 178,
        frameHeight: 178,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
    },

    roamingEnemy: {
        type: "billboard",
        directional: true,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,

        lods: [
            {
                src: "assets/sprite-sheets/directionals/roaming-enemy/near.png",
                frameWidth: 40,
                frameHeight: 40,
            },
            {
                src: "assets/sprite-sheets/directionals/roaming-enemy/mid.png",
                frameWidth: 20,
                frameHeight: 20,
            },
            {
                src: "assets/sprite-sheets/directionals/roaming-enemy/far.png",
                frameWidth: 10,
                frameHeight: 10,
            },
        ],

        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 2,
                frameDurationMs: 1000,
            },
        },
    },

    roamingEnemyStunned: {
        type: "billboard",
        directional: true,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,

        lods: [
            {
                src: "assets/sprite-sheets/directionals/roaming-enemy-stunned/near.png",
                frameWidth: 40,
                frameHeight: 40,
            },
            {
                src: "assets/sprite-sheets/directionals/roaming-enemy-stunned/mid.png",
                frameWidth: 20,
                frameHeight: 20,
            },
            {
                src: "assets/sprite-sheets/directionals/roaming-enemy-stunned/far.png",
                frameWidth: 10,
                frameHeight: 10,
            },
        ],

        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 16,
                frameDurationMs: 100,
            },
        },
    },

    sigil: {
        type: "surface",
        plane: "floor",
        src: "assets/sprite-sheets/surfaces/sigil.png",
        frameWidth: 20,
        frameHeight: 20,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,

        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 4,
                frameDurationMs: 250,
            },
        },
    },

    skeleton: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/billboards/skeleton.png",
        frameWidth: 38,
        frameHeight: 38,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
    },

    tardspireBanner: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/tardspire-banner.png",
        frameWidth: 266,
        frameHeight: 266,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
    },

    treasureChest: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/treasure-chest.png",
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,

        lods: [
            {
                src: "assets/sprite-sheets/billboards/treasure-chest/near.png",
                frameWidth: 42,
                frameHeight: 42,
            },
            {
                src: "assets/sprite-sheets/billboards/treasure-chest/far.png",
                frameWidth: 21,
                frameHeight: 21,
            },
        ],

        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 8,
                frameDurationMs: 100,
            },
        },
    },

    vampireBat: {
        type: "billboard",
        directional: false,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,

        lods: [
            {
                src: "assets/sprite-sheets/billboards/vampire-bat/near.png",
                frameWidth: 18,
                frameHeight: 18,
            },
            {
                src: "assets/sprite-sheets/billboards/vampire-bat/mid.png",
                frameWidth: 9,
                frameHeight: 9,
            },
            {
                src: "assets/sprite-sheets/billboards/vampire-bat/far.png",
                frameWidth: 5,
                frameHeight: 5,
            },
        ],

        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 24,
                frameDurationMs: 100,
            },
        },
    },

    badassFlamingSkeleton: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/billboards/enemies/badassFlamingSkeleton.png",
        frameWidth: 612,
        frameHeight: 612,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 1,
                frameDurationMs: 100,
            },
            hurt: {
                firstFrame: 1,
                frameCount: 1,
                frameDurationMs: 100,
            },
        },
    },
    fridgeOfForgottenLeftovers: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/billboards/enemies/fridgeOfForgottenLeftovers.png",
        frameWidth: 612,
        frameHeight: 612,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 1,
                frameDurationMs: 100,
            },
            hurt: {
                firstFrame: 1,
                frameCount: 1,
                frameDurationMs: 100,
            },
        },
    },
    gayCocksuckingVampire: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/billboards/enemies/vampire.png",
        frameWidth: 612,
        frameHeight: 612,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 1,
                frameDurationMs: 100,
            },
            hurt: {
                firstFrame: 1,
                frameCount: 1,
                frameDurationMs: 100,
            },
        },
    },
    keeperOfTheToiletBowl: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/billboards/enemies/keeperOfTheToiletBowl.png",
        frameWidth: 612,
        frameHeight: 612,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 1,
                frameDurationMs: 100,
            },
            hurt: {
                firstFrame: 1,
                frameCount: 1,
                frameDurationMs: 100,
            },
        },
    },
    krampusElf: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/billboards/enemies/krampusElf.png",
        frameWidth: 612,
        frameHeight: 612,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 1,
                frameDurationMs: 100,
            },
            hurt: {
                firstFrame: 1,
                frameCount: 1,
                frameDurationMs: 100,
            },
        },
    },
    lughead: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/billboards/enemies/lughead.png",
        frameWidth: 612,
        frameHeight: 612,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 1,
                frameDurationMs: 100,
            },
            hurt: {
                firstFrame: 1,
                frameCount: 1,
                frameDurationMs: 100,
            },
        },
    },
    mimic: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/billboards/enemies/mimic.png",
        frameWidth: 612,
        frameHeight: 612,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 1,
                frameDurationMs: 100,
            },
            hurt: {
                firstFrame: 1,
                frameCount: 1,
                frameDurationMs: 100,
            },
        },
    },
    mysteriousScooter: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/billboards/enemies/mysteriousScooter.png",
        frameWidth: 612,
        frameHeight: 612,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 1,
                frameDurationMs: 100,
            },
            hurt: {
                firstFrame: 1,
                frameCount: 1,
                frameDurationMs: 100,
            },
        },
    },
    pissedOffPoultry: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/billboards/enemies/pissedOffPoultry.png",
        frameWidth: 612,
        frameHeight: 612,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 1,
                frameDurationMs: 100,
            },
            hurt: {
                firstFrame: 1,
                frameCount: 1,
                frameDurationMs: 100,
            },
        },
    },
    snailSentinel: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/billboards/enemies/snailSentinel.png",
        frameWidth: 612,
        frameHeight: 612,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 1,
                frameDurationMs: 100,
            },
            hurt: {
                firstFrame: 1,
                frameCount: 1,
                frameDurationMs: 100,
            },
        },
    },
    stupidDog: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/billboards/enemies/stupidDog.png",
        frameWidth: 612,
        frameHeight: 612,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 1,
                frameDurationMs: 100,
            },
            hurt: {
                firstFrame: 1,
                frameCount: 1,
                frameDurationMs: 100,
            },
        },
    },
    torches: {
        type: "surface",
        plane: "wall",
        src: "assets/sprite-sheets/surfaces/torches.png",
        frameWidth: 256,
        frameHeight: 256,
        worldWidth: 1,
        worldHeight: 1,
        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 5,
                frameDurationMs: 200,
            },
        },
    },
    wangRat: {
        type: "billboard",
        directional: false,
        src: "assets/sprite-sheets/billboards/enemies/wangRat.png",
        frameWidth: 630,
        frameHeight: 630,
        worldWidth: 1,
        worldHeight: 1,
        depthOffset: 0.0,
        animations: {
            idle: {
                firstFrame: 0,
                frameCount: 1,
                frameDurationMs: 100,
            },
            hurt: {
                firstFrame: 1,
                frameCount: 1,
                frameDurationMs: 100,
            },
        },
    },
};
