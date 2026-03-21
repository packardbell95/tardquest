// @deprecated
const InventoryObjectDefinitions = Object.freeze({
    // Inventory object category: Consumable Items
    items: Object.freeze({
        potion: {
            article: "a",
            name: "Potion",
            description: "A healthy drink",
            use: () => {
                console.log("You quaff the potion. Nothing happens");
                return true;
            },
            merchantStockChance: 1.0,
            chestDrop: true,
            weight: 0.4,
            price: 10,
        },

        scroll: {
            article: "a",
            name: "Scroll",
            description: "An old parchment with ancient writing",
            use: () => {
                console.log("You read the scroll");
                return true;
            },
            merchantStockChance: 0.25,
            chestDrop: false,
            weight: 0.1,
            price: 25,
        },
    }),

    // Inventory object category: Weapons
    weapons: Object.freeze({
        sword: {
            article: 'a',
            name: "Sword",
            description: "A steel blade forged in the fires of Cerro Azul",
            damage: { base: 100, randomMultiplier: 1.25 },
            price: 10000,
            weight: 40,
            requiredStr: 10,
        },
    }),

    // Inventory object category: Armor
    armor: Object.freeze({
        mithrilCoat: {
            article: 'the',
            name: "Mithril Coat",
            description: "A vest of mithril-mail",
            defense: 60,
            price: 92000,
            weight: 2,
            requiredEnd: 1,
        },
    }),

    // Inventory object category: Rings
    rings: Object.freeze({
        jade: {
            article: 'a',
            name: "Jade Ring",
            description: "Gleans of a vibrant green nephrite",
            effects: { maxHp: 20 },
            price: 125,
            merchantStockChance: 0.1,
            chestDrop: true,
            weight: 0.4,
        },
    }),
});