"use strict";

window.TARDQUEST_PORTRAIT_ANIMATIONS = {
    badassFlamingSkeleton: {
        frameDelayMs: 250,
        playbackMode: "repeat",
    },

    chest: {
        frameDelayMs: 140,
        playbackMode: "once",
    },

    death: {
        frameDelayMs: 100,
        playbackMode: "repeat",
    },

    deathVampire: {
        frameDelayMs: 100,
        playbackMode: "repeat",
    },

    erokIdle: {
        frameDelayMs: 220,
        playbackMode: "repeat",
    },

    erokPet: {
        frameDelayMs: 70,
        playbackMode: "once",
        nextAnimation: "erokIdle",
    },

    fridgeOfForgottenLeftovers: {
        frameDelayMs: [
            200, 100, 100, 100, 100, 100, 100, 1200, 100, 100, 100, 100
        ],
        playbackMode: "bidirectional",
    },

    gambler: {
        frameDelayMs: 180,
        playbackMode: "repeat",
    },

    inventory: {
        frameDelayMs: 110,
        playbackMode: "once",
    },

    keeperOfTheToiletBowl: {
        frameDelayMs: 2000,
        playbackMode: "repeat",
    },

    krampusElf: {
        frameDelayMs: 800,
        playbackMode: "repeat",
    },

    lughead: {
        frameDelayMs: 400,
        playbackMode: "repeat",
    },

    merchant: {
        frameDelayMs: 250,
        playbackMode: "repeat",
    },

    mimic: {
        frameDelayMs: 800,
        playbackMode: "repeat",
    },

    mysteriousScooter: {
        frameDelayMs: [ 2000, 100, 100, 600 ],
        playbackMode: "bidirectional",
    },

    pissedOffPoultry: {
        frameDelayMs: 800,
        playbackMode: "repeat",
    },

    player: {
        frameDelayMs: [ 3600, 110, 110, 110 ],
        playbackMode: "bidirectional",
    },

    settings: {
        frameDelayMs: 140,
        playbackMode: "repeat",
    },

    snailSentinel: {
        frameDelayMs: [ 4400, 800 ],
        playbackMode: "repeat",
    },

    stupidDog: {
        frameDelayMs: 2000,
        playbackMode: "repeat",
    },

    vampire: {
        frameDelayMs: [ 2400, 1200, 200 ],
        playbackMode: "bidirectional",
    },

    wangRat: {
        frameDelayMs: 1200,
        playbackMode: "repeat",
    },
};
