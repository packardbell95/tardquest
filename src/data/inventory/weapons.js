// Definitions for all weapons in the game
const WEAPONS = Object.freeze({
    fingerNail: {
        article: "a",
        name: "FINGERNAIL",
        description:
            "Your very own fingernail! Careful not to break it!",
        damage: { base: 1, randomMultiplier: 4 },
        coreStatModifiers: {
            strength: 1,
        },
        coreTraitModifiers: {},
        maxRandomDamageBonus: 4,
        price: 0,
        weight: 0,
        requiredStr: 0,
    },
    pointyStick: {
        article: "a",
        name: "POINTY STICK",
        description:
            "A stick that fell off of a tree somewhere.",
        damage: { base: 4, randomMultiplier: 6 },
        coreStatModifiers: {
            strength: 4,
        },
        coreTraitModifiers: {},
        maxRandomDamageBonus: 6,
        price: 20,
        weight: 3,
        requiredStr: 7,
    },
    wiffleBallBat: {
        article: "a",
        name: "WIFFLE BALL BAT",
        description:
            "A hollow bat made of plastic.",
        damage: { base: 6, randomMultiplier: 8 },
        coreStatModifiers: {
            strength: 6,
        },
        coreTraitModifiers: {},
        maxRandomDamageBonus: 8,
        price: 30,
        weight: 5,
        requiredStr: 11,
    },
    nunchucks: {
        article: "",
        name: "NUNCHUCKS",
        description:
            "Two pieces of wood connected by a chain.",
        damage: { base: 9, randomMultiplier: 12 },
        coreStatModifiers: {
            strength: 9,
        },
        coreTraitModifiers: {},
        maxRandomDamageBonus: 12,
        price: 70,
        weight: 7,
        requiredStr: 14,
    },
    atlatlSpear: {
        article: "an",
        name: "ATLATL SPEAR",
        description:
            "A spear with a throwing lever.",
        damage: { base: 13, randomMultiplier: 16 },
        coreStatModifiers: {
            strength: 13,
        },
        coreTraitModifiers: {},
        maxRandomDamageBonus: 16,
        price: 90,
        weight: 10,
        requiredStr: 17,
    },
    bludgeoningMace: {
        article: "a",
        name: "BLUDGEONING MACE",
        description:
            "A stick with a spikey metal ball at the end.",
        damage: { base: 16, randomMultiplier: 19 },
        coreStatModifiers: {
            strength: 16,
        },
        coreTraitModifiers: {},
        maxRandomDamageBonus: 19,
        price: 150,
        weight: 12,
        requiredStr: 20,
    },
    danceClub: {
        article: "a",
        name: "DANCE CLUB",
        description:
            "A club long enough to pole dance on. Maybe it is one? You don't " +
            "know. Legend has it, an obscure forum user once wielded one...",
        damage: { base: 20, randomMultiplier: 23 },
        coreStatModifiers: {
            strength: 20,
        },
        coreTraitModifiers: {},
        maxRandomDamageBonus: 23,
        price: 200,
        weight: 13,
        requiredStr: 24,
    },
    cathodeRayTubeMonitor: {
        article: "a",
        name: "CATHODE RAY TUBE MONITOR",
        description:
            "A CRT monitor. Heavy as piss.",
        damage: { base: 30, randomMultiplier: 35 },
        coreStatModifiers: {
            strength: 30,
        },
        coreTraitModifiers: {
            sightRange: 1,
            sightSensitivity: 64,
        },
        maxRandomDamageBonus: 35,
        price: 400,
        weight: 20,
        requiredStr: 32,
    },
    magicPencil: {
        article: "a",
        name: "MAGIC PENCIL",
        description:
            "SpongeBob SquarePants - Season 2, Episode 14B - Frankendoodle.",
        damage: { base: 12, randomMultiplier: 50 },
        coreStatModifiers: {
            strength: 12,
        },
        coreTraitModifiers: {},
        maxRandomDamageBonus: 50,
        price: 700,
        weight: 3,
        requiredStr: 38,
    },
    goldenWang: {
        article: "a",
        name: "GOLDEN WANG",
        description:
            "With the power of the Golden Wang, the Discordian parasite " +
            "shall perish!",
        damage: { base: 69, randomMultiplier: 69 },
        coreStatModifiers: {
            strength: 69,
        },
        coreTraitModifiers: {},
        maxRandomDamageBonus: 69,
        price: 6900,
        weight: 69,
        requiredStr: 69,
    },
});
