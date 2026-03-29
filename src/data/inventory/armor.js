// Definitions for all armor in the game
const ARMOR = Object.freeze({
    pectoralMass: {
        article: "a",
        name: "PECTORAL MASS",
        description:
            "Your totally big, meaty pectorals! You're not fat at all...",
        coreStatModifiers: {
            defense: 1,
        },
        coreTraitModifiers: {},
        price: 0,
        weight: 0,
        requiredEnd: 0,
    },
    graphicTee: {
        article: "a",
        name: "GRAPHIC TEE",
        description:
            "A t-shirt that says 'Normal people scare me.'",
        coreStatModifiers: {
            defense: 5,
        },
        coreTraitModifiers: {},
        price: 20,
        weight: 3,
        requiredEnd: 6,
    },
    barrelWithSuspenders: {
        article: "a",
        name: "BARREL (with suspenders)",
        description:
            "An empty barrel that sort of covers your torso and legs. Smells " +
            "like whisky too!",
        coreStatModifiers: {
            defense: 8,
        },
        coreTraitModifiers: {},
        price: 50,
        weight: 5,
        requiredEnd: 10,
    },
    leatherArmor: {
        article: "",
        name: "LEATHER ARMOR",
        description:
            "The finest in leather, fitted with a tight top, codpiece, cat " +
            "o' nine tails... (uh, are you sure this is actually armor?)",
        coreStatModifiers: {
            defense: 13,
        },
        coreTraitModifiers: {},
        price: 100,
        weight: 6,
        requiredEnd: 14,
    },
    milaneseArmor: {
        article: "",
        name: "MILANESE ARMOR",
        description:
            "A classic suit of armor. Looks kind of like a Renaissance-era " +
            "Robocop if you squint hard enough.",
        coreStatModifiers: {
            defense: 18,
        },
        coreTraitModifiers: {},
        price: 130,
        weight: 8,
        requiredEnd: 20,
    },
    blackPlateArmor: {
        article: "",
        name: "BLACK PLATE ARMOR",
        description:
            "Literally a giant black dinner plate. Deceptively protective.",
        coreStatModifiers: {
            defense: 25,
        },
        coreTraitModifiers: {},
        price: 200,
        weight: 13,
        requiredEnd: 25,
    },
    nokiaMail: {
        article: "",
        name: "NOKIA MAIL",
        description:
            "A Nokia branded mail. No, not like an email. More like a " +
            "chainmail. But Nokia.",
        coreStatModifiers: {
            defense: 35,
        },
        coreTraitModifiers: {},
        price: 500,
        weight: 15,
        requiredEnd: 35,
    },
});
