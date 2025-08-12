/**
 * Inventory handling system
 */
class Inventory {
    /**
     * The definitions for all of the inventory objects in the game
     */
    #objectDefinitions = {
        items: {},
        weapons: {},
        armor: {},
        rings: {},
    };

    /**
     * The contents of an entity's inventory, organized into categories
     *
     * Each entry is keyed by the object's ID in its respective category
     * Values are the number of those items that the entity owns
     */
    #contents = {
        items: {},
        weapons: {},
        armor: {},
        rings: {},
    };

    /**
     * The gear that an entity has equipped
     *
     * An entry will have the ID of the piece of gear that's equipped,
     * or null if nothing is equipped
     */
    #equipped = {
        weapon: null,
        armor: null,
        ring: {
            leftHand: null,
            rightHand: null,
        },
    };

    /**
     * Event handlers
     */
    #handlers = {
        // Item use
        // Fires after an item has been consumed
        onItemConsumed: null,

        // Equipment changes
        // Fires whenever any equipped objects change
        onEquip: null,
        // Fires whenever the active weapon changes
        onWeaponEquip: null,
        // Fires whenever the active armor changes
        onArmorEquip: null,
        // Fires whenever the active rings change
        onRingEquip: null,

        // Inventory count changes
        // Fires when the item count changes
        onItemCountChange: null,
        // Fires when the weapon count changes
        onWeaponCountChange: null,
        // Fires when the armor count changes
        onArmorCountChange: null,
        // Fires when the ring count changes
        onRingCountChange: null,
    };

    /**
     * Class constructor
     *
     * objectDefinitions
     *  The definitions of all objects in the game, organized into categories
     *
     * contents
     *  The entity's starting inventory, organized into categories
     *
     * equipped
     *  The immediate equipment configuration
     */
    constructor(
        objectDefinitions = {},
        contents = {},
        equipped = {},
        handlers = null,
    ) {
        this.initialize(objectDefinitions, contents, equipped, handlers);
    }

    initialize(objectDefinitions, contents, equipped, handlers) {
        this.#objectDefinitions = objectDefinitions;

        Object.keys(contents).forEach((category) => {
            if (! ["items", "weapons", "armor", "rings"].includes(category)) {
                console.warning(
                    "Unrecognized inventory category",
                    { contents, category }
                );
            }

            Object.keys(contents[category] || {}).forEach((id) => {
                const amount = contents[category][id];

                switch (category) {
                    case "items":
                        this.addItem(id, amount);
                        break;
                    case "weapons":
                        this.addWeapon(id, amount);
                        break;
                    case "armor":
                        this.addArmor(id, amount);
                        break;
                    case "rings":
                        this.addRing(id, amount);
                        break;
                }
            })
        });

        // Set any callback handlers before equipping starting gear
        this.setHandlers(handlers);
        this.#equipStartingGear(equipped);
    }

    setHandlers(handlers) {
        if (typeof handlers?.onItemConsumed === "function") {
            this.#handlers.onItemConsumed = handlers.onItemConsumed;
        }

        if (typeof handlers?.onEquip === "function") {
            this.#handlers.onEquip = handlers.onEquip;
        }

        if (typeof handlers?.onWeaponEquip === "function") {
            this.#handlers.onWeaponEquip = handlers.onWeaponEquip;
        }

        if (typeof handlers?.onArmorEquip === "function") {
            this.#handlers.onArmorEquip = handlers.onArmorEquip;
        }

        if (typeof handlers?.onRingEquip === "function") {
            this.#handlers.onRingEquip = handlers.onRingEquip;
        }

        if (typeof handlers?.onItemCountChange === "function") {
            this.#handlers.onItemCountChange = handlers.onItemCountChange;
        }

        if (typeof handlers?.onWeaponCountChange === "function") {
            this.#handlers.onWeaponCountChange = handlers.onWeaponCountChange;
        }

        if (typeof handlers?.onArmorCountChange === "function") {
            this.#handlers.onArmorCountChange = handlers.onArmorCountChange;
        }

        if (typeof handlers?.onRingCountChange === "function") {
            this.#handlers.onRingCountChange = handlers.onRingCountChange;
        }
    }

    #equipStartingGear(equipped) {
        if (equipped.weapon) {
            this.equipWeapon(equipped.weapon);
        }

        if (equipped.armor) {
            this.equipArmor(equipped.armor);
        }

        if (equipped.ring?.leftHand) {
            this.equipRing("leftHand", equipped.ring.leftHand);
        }

        if (equipped.ring?.rightHand) {
            this.equipRing("rightHand", equipped.ring.rightHand);
        }
    }

    /**
     * Returns true if the inventory is totally empty
     */
    isEmpty() {
        const { items, weapons, armor, rings } = this.#contents;
        return [items, weapons, armor, rings]
            .every(obj => Object.keys(obj).length === 0);
    }

    /**
     * Returns the total weight of the inventory's contents
     */
    getWeight() {
        let totalWeight = 0;

        for (const category in this.#contents) {
            const categoryContents = this.#contents[category];

            if (!this.#objectDefinitions[category]) {
                console.warn("Unknown inventory object category", { category });
                continue;
            }

            for (const id in categoryContents) {
                const count = categoryContents[id];
                const definition = this.#objectDefinitions[category][id];

                if (!definition || typeof definition.weight !== "number") {
                    continue;
                }

                totalWeight += definition.weight * count;
            }
        }

        return totalWeight;
    }

    /**
     * Returns true if an entry exists in a given category
     */
    #entryExists(category, id) {
        if (!Object.hasOwn(this.#contents, category)) {
            console.error(
                "Cannot get entry from unknown inventory category",
                { category }
            );
            return false;
        }

        if (!Object.hasOwn(this.#contents[category], id)) {
            return false;
        }

        return true;
    }

    /**
     * Returns a full entry from the inventory if it exists, or null
     * This includes the entry's ID, category, count, and full definition
     */
    #getEntry(category, id) {
        if (!this.#entryExists(category, id)) {
            return null;
        }

        const count = this.#contents[category][id];
        const definition = this.#objectDefinitions[category][id];

        return { id, category, count, ...definition };
    }

    /**
     * Returns true if the entry exists in the inventory
     */
    hasEntry(category, id) {
        return Boolean(
            this.#entryExists(category, id) &&
            this.#contents[category]?.[id]
        );
    }

    /**
     * Returns a category's entries, including ID and count for each entry
     */
    #getCategory(category) {
        const entries = {};
        if (!Object.hasOwn(this.#contents, category)) {
            console.error("Unknown inventory category", { category });
            return entries;
        }

        for (const id in this.#contents[category]) {
            const count = this.#contents[category][id];
            const definition = this.#objectDefinitions[category][id];

            if (definition) {
                entries[id] = { id, count, ...definition };
            }
        }

        return entries;
    }

    /**
     * Returns the sum of all elements in the input
     */
    #sum(input) {
        return Object.values(input).reduce((acc, val) => acc + val, 0);
    }

    // Items

    /**
     * Returns the requested item from the inventory if it is present
     */
    getItem(id) {
        return this.#getEntry("items", id);
    }

    /**
     * Returns all items in the inventory
     */
    getItems() {
        return this.#getCategory("items");
    }

    /**
     * Returns true if the inventory has any items at all
     */
    hasItems() {
        return this.#sum(this.#contents.items) > 0;
    }

    /**
     * Adds an item to the inventory
     */
    addItem(itemId, amount = 1) {
        this.#contents.items[itemId] = this.getItemCount(itemId) + amount;

        if (amount > 0) {
            this.#handlers.onItemCountChange?.(this.getItem(itemId));
        }
    }

    /**
     * Returns the number of times the requested item exists in the inventory
     */
    getItemCount(itemId) {
        return this.#contents.items[itemId] || 0;
    }

    /**
     * Returns true if there are at least [amount] items in the inventory
     */
    hasItem(itemId, amount = 1) {
        return this.getItemCount(itemId) >= amount;
    }

    /**
     * Subtracts instances of an item if they exist in the inventory
     * Returns true if [amount] number of items were subtracted
     */
    deductItem(itemId, amount = 1) {
        if (!this.hasItem(itemId, amount)) {
            return false;
        }

        this.#contents.items[itemId] -= amount;
        if (this.#contents.items[itemId] <= 0) {
            delete this.#contents.items[itemId];
        }

        if (typeof this.#handlers?.onItemConsumed === "function") {
            this.#handlers.onItemConsumed(this.getItem(itemId));
        }

        if (amount > 0) {
            this.#handlers.onItemCountChange?.(this.getItem(itemId));
        }

        return true;
    }

    /**
     * Consumes an item and calls its use() function if the item is present
     */
    useItem(itemId) {
        if (!this.hasItem(itemId)) {
            return false;
        }

        const item = this.#objectDefinitions.items[itemId];
        if (item && typeof item.use === "function") {
            // Deduct an item only if its use() function returned true
            // use() may return false if something prevented its use, such as
            // trying to burn a torch when one is already lit
            if (item.use()) {
                this.deductItem(itemId);
            }
        } else {
            this.deductItem(itemId);
            console.warn(
                "Used an item, but it has no functionality",
                { itemId, item }
            );
        }

        return true;
    }

    // Weapons

    /**
     * Returns true if the requested weapon is the one that is equipped
     */
    hasEquippedWeapon(id) {
        return this.#equipped.weapon === id;
    }

    /**
     * Returns the currently equipped weapon
     */
    getEquippedWeapon() {
        return this.#equipped.weapon
            ? this.getWeapon(this.#equipped.weapon)
            : null;
    }

    /**
     * Returns the ID of the currently-equipped weapon
     */
    getEquippedWeaponId() {
        return this.#equipped.weapon;
    }

    /**
     * Returns the matching weapon if it is present
     */
    getWeapon(id) {
        return this.#getEntry("weapons", id);
    }

    /**
     * Returns all weapons
     */
    getWeapons() {
        return this.#getCategory("weapons");
    }

    /**
     * Returns true if there are any weapons in the inventory
     */
    hasWeapons() {
        return this.#sum(this.#contents.weapons) > 0;
    }

    /**
     * Adds a weapon to the inventory [amount] number of times
     */
    addWeapon(weaponId, amount = 1) {
        this.#contents.weapons[weaponId] =
            this.getWeaponCount(weaponId) + amount;

        if (amount > 0) {
            this.#handlers.onWeaponCountChange?.(this.getWeapon(weaponId));
        }
    }

    /**
     * Returns the number of times the given weapon exists in the inventory
     */
    getWeaponCount(weaponId) {
        return this.#contents.weapons[weaponId] || 0;
    }

    /**
     * Returns true if the requested weapon exists in the inventory
     */
    hasWeapon(weaponId, amount = 1) {
        return this.getWeaponCount(weaponId) >= amount;
    }

    /**
     * Subtracts instances of a weapon if they exist in the inventory
     * Returns true if [amount] number of weapons were subtracted
     */
    deductWeapon(weaponId, amount = 1) {
        if (!this.hasWeapon(weaponId, amount)) {
            return false;
        }

        this.#contents.weapons[weaponId] -= amount;
        if (this.#contents.weapons[weaponId] <= 0) {
            delete this.#contents.weapons[weaponId];
        }

        if (amount > 0) {
            this.#handlers.onWeaponCountChange?.(this.getWeapon(weaponId));
        }

        return true;
    }

    /**
     * Returns true if the weapon was able to be equipped
     */
    equipWeapon(weaponId) {
        if (!this.hasWeapon(weaponId)) {
            return false;
        }

        if (this.#equipped.weapon !== weaponId) {
            this.#equipped.weapon = weaponId;
            this.#handlers.onWeaponEquip?.(this.getWeapon(weaponId));
            this.#handlers.onEquip?.(this.getWeapon(weaponId));
        }

        return true;
    }

    /**
     * Unequips any current weapon
     */
    unequipWeapon() {
        if (this.#equipped.weapon) {
            this.#equipped.weapon = null;
            this.#handlers.onWeaponEquip?.(this.getWeapon(weaponId));
            this.#handlers.onEquip?.(this.getWeapon(weaponId));
        }
    }

    // Armor

    /**
     * Returns true if the requested armor is equipped
     */
    hasEquippedArmor(id) {
        return this.#equipped.armor === id;
    }

    /**
     * Returns the currently equipped armor, or null if no armor is equipped
     */
    getEquippedArmor() {
        return this.#equipped.armor
            ? this.getArmor(this.#equipped.armor)
            : null;
    }

    /**
     * Returns the ID of the currently-equipped armor
     */
    getEquippedArmorId() {
        return this.#equipped.armor;
    }

    /**
     * Returns the requested armor if it is present in the inventory
     */
    getArmor(id) {
        return id ? this.#getEntry("armor", id) : this.#getCategory("armor");
    }

    /**
     * Adds instances of armor to the inventory
     */
    addArmor(armorId, amount = 1) {
        this.#contents.armor[armorId] = this.getArmorCount(armorId) + amount;

        if (amount > 0) {
            this.#handlers.onArmorCountChange?.(this.getArmor(armorId));
        }
    }

    /**
     * Returns the number of times the requested armor exists in the inventory
     */
    getArmorCount(armorId) {
        return this.#contents.armor[armorId] || 0;
    }

    /**
     * Returns true if the requested armor exists in the inventory
     */
    hasArmor(armorId, amount = 1) {
        return armorId
            ? this.getArmorCount(armorId) >= amount
            : this.#sum(this.#contents.armor) > 0;
    }

    /**
     * Subtracts instances of armor if they exist in the inventory
     * Returns true if [amount] armor were subtracted
     */
    deductArmor(armorId, amount = 1) {
        if (!this.hasArmor(armorId, amount)) {
            return false;
        }

        this.#contents.armor[armorId] -= amount;
        if (this.#contents.armor[armorId] <= 0) {
            delete this.#contents.armor[armorId];
        }

        if (amount > 0) {
            this.#handlers.onArmorCountChange?.(this.getArmor(armorId));
        }

        return true;
    }

    /**
     * Equips armor if it exists in the inventory
     * Returns true if the armor was equipped
     */
    equipArmor(armorId) {
        if (!this.hasArmor(armorId)) {
            return false;
        }

        if (this.#equipped.armor !== armorId) {
            this.#equipped.armor = armorId;
            this.#handlers.onArmorEquip?.(this.getArmor(armorId));
            this.#handlers.onEquip?.(this.getArmor(armorId));
        }

        return true;
    }

    /**
     * Unequips any equipped armor
     */
    unequipArmor() {
        if (this.#equipped.armor) {
            this.#equipped.armor = null;
            this.#handlers.onArmorEquip?.(this.getArmor(armorId));
            this.#handlers.onEquip?.(this.getArmor(armorId));
        }
    }

    // Rings

    /**
     * Returns true if the requested [ringId] is either on:
     *  - a given [hand] ("leftHand" or "rightHand")
     *  - either hand if [hand] is not provided
     */
    hasEquippedRing(ringId, hand) {
        if (hand === "leftHand" || hand === "rightHand") {
            return this.#equipped.ring[hand] === ringId;
        }

        if (hand) {
            console.error("Unknown hand", { hand });
            return false;
        }

        return (
            this.#equipped.ring.leftHand === ringId ||
            this.#equipped.ring.rightHand === ringId
        );
    }

    /**
     * Returns the equipped rings keyed by "leftHand" or "rightHand"
     */
    getEquippedRings() {
        const leftHand = this.#equipped.ring.leftHand
            ? this.getRing(this.#equipped.ring.leftHand)
            : null;

        const rightHand = this.#equipped.ring.rightHand
            ? this.getRing(this.#equipped.ring.rightHand)
            : null;

        return { leftHand, rightHand };
    }

    /**
     * Returns the currently equipped ring IDs, keyed by hand
     */
    getEquippedRingIds() {
        return this.#equipped.ring;
    }

    /**
     * Returns a given ring if it is present in the inventory
     */
    getRing(id) {
        return this.#getEntry("rings", id);
    }

    /**
     * Returns all rings in the inventory
     */
    getRings() {
        return this.#getCategory("rings");
    }

    /**
     * Returns true if any rings are present in the inventory
     */
    hasRings() {
        return this.#sum(this.#contents.rings) > 0;
    }

    /**
     * Adds a ring to the inventory
     */
    addRing(ringId, amount = 1) {
        this.#contents.rings[ringId] = this.getRingCount(ringId) + amount;

        if (amount > 0) {
            this.#handlers.onRingCountChange?.(this.getRing(ringId));
        }
    }

    /**
     * Returns the number of times a given ring exists in the inventory
     */
    getRingCount(ringId) {
        return this.#contents.rings[ringId] || 0;
    }

    /**
     * Returns true if the requested ring exists in the inventory
     */
    hasRing(ringId, amount = 1) {
        return this.getRingCount(ringId) >= amount;
    }

    /**
     * Subtracts instances of a ring if they exist in the inventory
     * Returns true if [amount] number of rings were subtracted
     */
    deductRing(ringId, amount = 1) {
        if (!this.hasRing(ringId, amount)) {
            return false;
        }

        this.#contents.rings[ringId] -= amount;
        if (this.#contents.rings[ringId] <= 0) {
            delete this.#contents.rings[ringId];
        }

        if (amount > 0) {
            this.#handlers.onRingCountChange?.(this.getRing(ringId));
        }

        return true;
    }

    /**
     * Equips a ring on a given hand if it exists in the inventory
     * [hand] must be either "leftHand" or "rightHand"
     * Returns true if the ring was equipped
     */
    equipRing(hand, ringId) {
        if (hand !== "leftHand" && hand !== "rightHand") {
            console.error(
                "Could not equip ring: Unknown hand",
                { hand, ringId }
            );
            return false;
        }

        if (!this.hasRing(ringId)) {
            return false;
        }

        if (this.#equipped.ring[hand] !== ringId) {
            this.#equipped.ring[hand] = ringId;
            this.#handlers.onRingEquip?.(hand, this.getRing(ringId));
            this.#handlers.onEquip?.(this.getRing(ringId));
        }

        return true;
    }

    /**
     * Unequips the ring that's currently on [hand]
     * [hand] must be either "leftHand" or "rightHand"
     */
    unequipRing(hand) {
        if (hand !== "leftHand" && hand !== "rightHand") {
            console.error("Could not unequip ring: Unknown hand", { hand });
            return;
        }

        if (this.#equipped.ring[hand]) {
            this.#equipped.ring[hand] = null;
            this.#handlers.onRingEquip?.(hand, this.getRing(ringId));
            this.#handlers.onEquip?.(this.getRing(ringId));
        }
    }
}
