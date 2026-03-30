// Definitions for all rings in the game
const RINGS = Object.freeze({
    // Persuasion boosters
    ringOfSexyUnderwear: {
        article: "a",
        name: "RING OF SEXY UNDERWEAR",
        description:
            "A ring with an engraving of a pair of strangely attractive " +
            "undergarments.",
        coreStatRequirements: {},
        coreStatModifiers: {
            persuasion: 5,
        },
        coreTraitModifiers: {},
        price: 60,
        merchantStockChance: 0.5,
        chestDrop: true,
        weight: 1,
    },

    ringOfFrenchAccent: {
        article: "a",
        name: "FRENCHLY ACCENTED RING",
        description:
            "A ring that somehow magically forces you to speak in a French " +
            "accent. VERY sexy!",
        coreStatRequirements: {},
        coreStatModifiers: {
            persuasion: 7,
        },
        coreTraitModifiers: {},
        price: 100,
        merchantStockChance: 0.3,
        chestDrop: true,
        weight: 1,
    },

    // HP boosters
    ringValentines: {
        article: "a",
        name: "VALENTINE'S DAY RING",
        description:
            "A ring that was given to somebody by their Valentine... and " +
            "dumped down a hole. You see 'Amy' engraved onto a heart. How sad.",
        coreStatRequirements: {},
        coreStatModifiers: {
            maxHp: 5,
        },
        coreTraitModifiers: {},
        price: 60,
        merchantStockChance: 0.5,
        chestDrop: true,
        weight: 1,
    },
    ringBloodstream: {
        article: "a",
        name: "BLOODSTREAM NOSERING",
        description:
            "A nosering that injects blood into your veins. Sounds painful...",
        coreStatRequirements: {},
        coreStatModifiers: {
            maxHp: 8,
        },
        coreTraitModifiers: {},
        price: 100,
        merchantStockChance: 0.3,
        chestDrop: true,
        weight: 1,
    },

    // Defense boosters
    ringOfHardening: {
        article: "a",
        name: "COCKRING OF HARDENING",
        description:
            "A piercing for your cock that doubles as a sort of penis pill. " +
            "One size fits all!",
        coreStatRequirements: {},
        coreStatModifiers: {
            defense: 2,
        },
        coreTraitModifiers: {},
        price: 60,
        merchantStockChance: 0.4,
        chestDrop: true,
        weight: 1,
    },
    ringPectoralPiercing: {
        article: "a",
        name: "PECTORAL PIERCING",
        description:
            "A piercing that can fit anywhere on your big, juicy pectorals.",
        coreStatRequirements: {},
        coreStatModifiers: {
            defense: 5,
        },
        coreTraitModifiers: {},
        price: 100,
        merchantStockChance: 0.3,
        chestDrop: true,
        weight: 1,
    },

    // Speed boosters
    ringPinkyToe: {
        article: "a",
        name: "PINKY TOE RING",
        description:
            "A ring for your pinky toe. The only way for this to work is by " +
            "putting it directly through the toenail... kinda like that " +
            "SpongeBob episode!",
        coreStatRequirements: {},
        coreStatModifiers: {
            speed: 1,
        },
        coreTraitModifiers: {},
        price: 60,
        merchantStockChance: 0.4,
        chestDrop: true,
        weight: 1,
    },
    ringCrack: {
        article: "a",
        name: "CRACK INFUSED RING",
        description:
            "A ring infused with crack cocaine.",
        coreStatRequirements: {},
        coreStatModifiers: {
            speed: 2,
        },
        coreTraitModifiers: {},
        price: 100,
        merchantStockChance: 0.3,
        chestDrop: true,
        weight: 1,
    },

    // Luck boosters
    ringGamble: {
        article: "the",
        name: "GAMBLER'S RING",
        description:
            "A cheap looking ring with a 240p image of a slot machine on it.",
        coreStatRequirements: {},
        coreStatModifiers: {
            luck: 5,
        },
        coreTraitModifiers: {},
        price: 150,
        merchantStockChance: 0.1,
        chestDrop: true,
        weight: 1,
    },
    ringEscobar: {
        article: "",
        name: "PABLO ESCOBAR'S GOLDEN RING",
        description:
            "A golden ring that once belonged to Pablo Escobar. It smells " +
            "rather illegal, but who give a shit?",
        coreStatRequirements: {},
        coreStatModifiers: {
            luck: 10,
        },
        coreTraitModifiers: {},
        price: 200,
        merchantStockChance: 0.07,
        chestDrop: true,
        weight: 1,
    },

    // Special ability rings
    ringOfSightliness: {
        article: "a",
        name: "RING OF SIGHTLINESS",
        description:
            "A ring with an eyeball so realistic looking, it could actually " +
            "be real. Allows you to see better in the Tardspire.",
        coreStatRequirements: {},
        coreStatModifiers: {},
        coreTraitModifiers: {
            sightRange: 3,
            sightSensitivity: 128,
        },
        price: 180,
        merchantStockChance: 0.2,
        chestDrop: false,
        weight: 2,
    },
    ringOfStinky: {
        article: "a",
        name: "RING OF STINKY",
        description:
            "A ring so stinky, SO putrid, that even monsters will reconsider " +
            "confronting you. Causes enemies to move away from you more often.",
        coreStatRequirements: {},
        coreStatModifiers: {},
        coreTraitModifiers: {},
        price: 200,
        merchantStockChance: 0.2,
        chestDrop: false,
        weight: 2,
    },
    ringOfAmplifiedAudio: {
        article: "a",
        name: "RING OF AMPLIFIED AUDIO",
        description:
            "A ring with a tiny, yet deceptively loud megaphone. Miniphone? " +
            "idk. Grants an additional persuasion attempt in battles.",
        coreStatRequirements: {},
        coreStatModifiers: {
            persuasion: 10,
        },
        coreTraitModifiers: {},
        price: 130,
        merchantStockChance: 0.2,
        chestDrop: false,
        weight: 2,
    },
});
