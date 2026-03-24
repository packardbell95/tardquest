"use strict";

/**
 * The PartyMemberBuilder creates party members
 *
 * Party members are typically contained within a MapEntity's party
 */
function PartyMemberBuilder(name, stats = {}) {
    PartyMemberBuilder.partyMemberId = PartyMemberBuilder.partyMemberId || 1;

    const partyMember = {
        id: PartyMemberBuilder.partyMemberId++,
        name: typeof name === "string" && name.length > 0
            ? name
            : "Anonymous",
        // statusConditions: {},
        statPoints: 0,
        equipped: {
            weapon: null,
            armor: null,
            ring: {
                left: null,
                right: null,
            },
        },
        persuadedBy: {
            partyMemberId: null,
            name: null,
            phrase: null,
        },

        getWeight: function() {
            return (
                (WEAPONS[this.equipped.weapon]?.weight || 0) +
                (ARMOR[this.equipped.armor]?.weight || 0) +
                (RINGS[this.equipped.ring.left]?.weight || 0) +
                (RINGS[this.equipped.ring.right]?.weight || 0)
            );
        },

        stats: { ...stats },

        isCoreStat: function(name) {
            return [
                "hp", "maxHp", "defense", "strength", "persuasion",
                "endurance", "speed", "luck",
            ].includes(name);
        },

        isProgressionStat: function(name) {
            return ["level", "experience"].includes(name);
        },

        statEventHandlers: {
            core: {},
            progression: {},
        },

        incrementCoreStat: function(name, amount = 1) {
            if (! this.isCoreStat(name)) {
                console.error("Unrecognized core stat", { name, amount });
                return;
            }

            if (! Number.isInteger(amount)) {
                console.error("Amount is not an integer", { name, amount });
                return;
            }

            this.stats.core[name] += amount;

            if (typeof this.statEventHandlers.core[name] === "function") {
                this.statEventHandlers.core[name](
                    this.getEffectiveCoreStat(name),
                    this.stats.core[name],
                );
            }
        },

        getEffectiveCoreStat: function(statName) {
            if (! this.isCoreStat(statName)) {
                console.error(
                    "Unrecognized core stat",
                    { statName, amount }
                );
                return;
            }

            // @TODO Add buffs/debuffs for status afflictions

            return this.stats.core[statName] +
                (
                    WEAPONS[this.equipped?.weapon]
                        ?.coreStatModifiers[statName] || 0
                ) + (
                    ARMOR[this.equipped?.armor]
                        ?.coreStatModifiers[statName] || 0
                ) + (
                    RINGS[this.equipped?.ring?.leftHand]
                        ?.coreStatModifiers[statName] || 0
                ) + (
                    RINGS[this.equipped?.ring?.rightHand]
                        ?.coreStatModifiers[statName] || 0
                );
        },

        getEffectiveStat: function(stat) {
            /**
             * @TODO Fill this in with actual functionality based on inventory
            const equippedArmor = player.inventory.getEquippedArmor();
            const equippedRings = player.inventory.getEquippedRings();

            function getRingEffect(stat) {
                return (
                    (equippedRings?.leftHand?.effects?.[stat] || 0) +
                    (equippedRings?.rightHand?.effects?.[stat] || 0)
                );
            }

            return {
                hp: player.hp,
                maxHp: player.maxHp + getRingEffect('maxHp'),
                defense:
                    player.defense +
                    (equippedArmor?.defense || 0) +
                    getRingEffect('defense'),
                strength: player.strength,
                persuasion: getEffectiveStat('persuasion'),
                maxPersuasionAttempts:
                    getEffectiveStat("persuasionAttempts"),
                speed: player.speed + getRingEffect('speed'),
                luck: player.luck + getRingEffect('luck'),
                endurance: player.endurance,
                carryWeight: player.inventory.getWeight(),
                carryWeightLimit: player.getCarryWeightLimit(),
            };
            */

            return this.stats.core[stat] || null;
        },

        traits: {
            sightRange: 2,
            sightSensitivity: 255,
            fieldOfView: 90,
            hearingRange: 5,
            persuasionAttempts: 0,
            hands: ["left", "right"],
            canAttack: true,
            canPersuade: false,
            canRun: true,
            canUse: true,
            canEquip: true,
        },

        rewards: {
            exp: {
                base: 10,
                levelMultiplier: 1.25,
            },
        },

        getEffectiveTrait: function(trait) {
            return this.traits?.[trait] || null;
        },

        release: function() {
            if (! this.parent) {
                return;
            }

            this.parent.releasePartyMember(this);
            this.onRelease?.();
        },

        isDead: function() {
            return this.stats.core.hp <= 0;
        },

        getExperienceRequiredForLevelUp: function() {
            return this.stats.progression.level * 10;
        },

        giveExperience: function(experiencePoints) {
            this.stats.progression.experience += experiencePoints;

            const shouldLevelUp =
                this.stats.progression.experience >=
                this.getExperienceRequiredForLevelUp();

            if (shouldLevelUp) {
                this.levelUp();
            }
        },

        levelUp: function() {
            // Unfinished
            const experienceRequired = this.getExperienceRequiredForLevelUp();
            const diff = this.stats.progression.experience - experienceRequired;
            const rolledOverExp = Math.max(0, diff);
            if (this.stats.progression.hasOwnProperty("totalExperience")) {
                this.stats.progression.totalExperience += experienceRequired;
            }

            this.stats.progression.level++;
            this.stats.progression.experience = rolledOverExp;
            this.stats.core.hp = this.getEffectiveCoreStat("maxHp");

            this.onLevelUp?.();
        },

        // @TODO Make these functions respect effective stats
        /**
         * Heals a living party member
         *
         * @param Number hp The number of hit points to heal by
         * @param bool refreshStats True if the stats should be auto-refreshed
         * @return bool True if the healing was effective
         */
        heal: function(hp, refreshStats = true) {
            if (this.isDead()) {
                return false;
            }

            this.stats.core.hp = Math.min(
                this.stats.core.hp + hp,
                this.stats.core.maxHp
            );

            if (refreshStats) {
                this.updateHp();
            }

            return true;
        },

        /**
         * Damages a living party member
         *
         * @param Number hp The number of hit points to deduct
         * @param bool refreshStats True if the stats should be auto-refreshed
         * @return bool True if the damage was effective
         */
        damage: function(hp, refreshStats = true) {
            if (this.isDead()) {
                return false;
            }

            this.stats.core.hp = Math.max(this.stats.core.hp - hp, 0);
            if (refreshStats) {
                this.updateHp();
            }

            return true;
        },

        updateHp: function() {
            const hasHpEventHandler =
                typeof this.statEventHandlers.core.hp === "function";
            if (hasHpEventHandler) {
                this.statEventHandlers.core.hp(
                    this.getEffectiveCoreStat("hp"),
                    this.stats.core.hp
                );
            }

            if (this.stats.core.hp <= 0) {
                if (this.parent) {
                    this.parent.checkForDeath();
                }

                this.onDie?.();
            }
        },

        refreshStats: function() {
            const handlers = this.statEventHandlers;

            // Core stats
            for (const key of Object.keys(this.stats?.core || {})) {
                const hasCallback = typeof handlers.core[key] === "function";

                if (hasCallback) {
                    handlers.core[key](
                        this.getEffectiveCoreStat(key),
                        this.stats.core[key],
                    );
                }
            }

            // Progression stats
            const hasExperienceCallback =
                typeof handlers.progression.experience === "function";
            if (hasExperienceCallback) {
                handlers.progression.experience(
                    this.stats.progression.experience,
                    this.getExperienceRequiredForLevelUp()
                );
            }

            const hasLevelCallback =
                typeof handlers.progression.level === "function";
            if (hasLevelCallback) {
                handlers.progression.level(this.stats.progression.level);
            }
        },

        useItem(itemId, target) {
            const item = ITEMS[itemId];
            if (! item) {
                console.error(
                    "Tried to use an item that doesn't exist",
                    { itemId }
                );
                return false;
            }

            if (! this.parent.inventory.hasItem(itemId)) {
                console.warn(
                    "Cannot use an item that the map entity doesn't have",
                    { itemId, target }
                );
                return false;
            }

            if (! ITEMS[itemId].use(this, target)) {
                console.log("Item could not be used", { itemId, target });
                return false;
            }

            if (! this.parent.inventory.deductItem(itemId)) {
                console.error(
                    "Could not deduct the item after using it",
                    { itemId }
                );
            }

            return true;
        },

        unequipWeapon() {
            if (! this.equipped.weapon) {
                return true;
            }

            const currentWeapon = this.equipped.weapon;
            this.parent.inventory.addWeapon(currentWeapon);
            this.equipped.weapon = null;

            return true;
        },

        equipWeapon(weaponId) {
            if (! this.parent.inventory.hasWeapon(weaponId)) {
                console.warn(
                    "Cannot equip a weapon that the map entity doesn't have",
                    { weaponId }
                );
                return false;
            }

            if (! this.unequipWeapon()) {
                return false;
            }

            partyMember.equipped.weapon = weaponId;
            return true;
        },

        unequipArmor() {
            if (! this.equipped.armor) {
                return true;
            }

            const currentArmor = this.equipped.armor;
            this.parent.inventory.addArmor(currentArmor);
            this.equipped.armor = null;

            return true;
        },

        equipArmor(armorId) {
            if (! this.parent.inventory.hasArmor(armorId)) {
                console.warn(
                    "Cannot equip armor that the map entity doesn't have",
                    { armorId }
                );
                return false;
            }

            if (! this.unequipArmor()) {
                return false;
            }

            if (! this.parent.inventory.deductArmor(armorId)) {
                console.error(
                    "Armor could not be taken from the inventory",
                    { armorId }
                );
                return false;
            }

            partyMember.equipped.armor = armorId;
            return true;
        },

        unequipRing(hand) {
            if (! ["left", "right"].includes(hand)) {
                console.warn(
                    "Tried to unequip a ring on an unknown hand",
                    { hand }
                );
                return false;
            }

            const currentRing = this.equipped.ring[hand];
            if (! currentRing) {
                return true;
            }

            this.parent.inventory.addRing(currentRing);
            this.equipped.ring[hand] = null;

            return true;
        },

        equipRing(hand, ringId) {
            if (! ["left", "right"].includes(hand)) {
                console.warn(
                    "Tried to equip a ring on an unknown hand",
                    { hand }
                );
                return false;
            }

            if (! this.parent.inventory.hasRing(ringId)) {
                console.warn(
                    "Cannot equip a ring that the map entity doesn't have",
                    { ringId }
                );
                return false;
            }

            if (! this.unequipRing(hand)) {
                return false;
            }

            if (! this.parent.inventory.deductRing(ringId)) {
                console.error(
                    "Ring could not be taken from the inventory",
                    { ringId }
                );
                return false;
            }

            partyMember.equipped.ring[hand] = ringId;
            return true;
        },

        voice: {
            pitch: 48,
            speed: 45,
            mouth: 163,
            throat: 160,
        },

        // @TODO Move voice-related stuff elsewhere (maybe? Might be fine here
        // since party member voices are associated with each instance)
        // This does a null check that defaults to [], but this should be
        // the talkSlots override, if any
        talkSlots: Array.isArray(null)
            ? []
            : [
                [
                    "You", "I", "What", "Hey", "Listen here, you", "They",
                    "He", "She"
                ],
                [
                    "are", "can't", "should", "will", "must", "need to",
                    "need", "needs", "needed"
                ],
                [
                    "go", "find a", "smack a", "kill the", "eat a",
                    "snack on a", "pick my", "pick your", "obey my",
                    "obey your"
                ],
                [
                    "pot roast", "many pot roasts", "total dumbass", "gay",
                    "friend", "sandwich", "nose", "orbital laser",
                    "Burnout Revenge on the PS2", "one big dandruff"
                ],
                [
                    "?", "!", "!!!", "?!", "...", ".",
                ],
            ],

        allowPlayerMessageTalkSlotOverride: true,

        generateStatement: function(playerMessage) {
            const chosen = this.talkSlots.map(slot => randomEntry(slot));
            const hasPlayerMessage = typeof playerMessage === "string";
            let statement = "";

            const playerMessageFragments =
                this.allowPlayerMessageTalkSlotOverride && hasPlayerMessage
                    ? shuffle(
                        playerMessage
                            .split(/\s+/)
                            // Remove trailing punctuation, convert to lowercase
                            .map(e => e.replace(/\p{P}+$/u, "").toLowerCase())
                            // Return anything that starts with a word character
                            .filter(e => /^\w/.test(e))
                    )
                    : [];

            for (let i = 0; i < chosen.length; i++) {
                if (i === 0) {
                    statement = chosen[i];
                    continue;
                }

                const usePlayerMessageFragment =
                    playerMessageFragments.length > 0 &&
                    Math.random() < 0.5;

                const fragment = usePlayerMessageFragment
                    ? playerMessageFragments.pop()
                    : chosen[i];

                // Add a space if the selected part starts with an alphanumeric
                if (/^\w/.test(fragment)) {
                    statement += " ";
                }

                if (usePlayerMessageFragment) {
                    statement += `<span class="player">${fragment}</span>`;
                } else {
                    statement += fragment;
                }
            }

            return statement;
        },

        say: function(message, showPortrait = true, onComplete = null) {
            if (this.voice) {
                if (showPortrait) {
                    const flipped = this.parent.id !== playerEntity.id;
                    Portrait.show(this.type, this.color, flipped);
                }

                const callback = () => {
                    showPortrait && Portrait.hide();
                    onComplete?.();
                };

                // Remove any syntax from the message before speaking it
                const $message = document.createElement("span");
                $message.innerHTML = message;
                const spokenMessage = $message.textContent;

                // @TODO Suppress speech synthesis as a flag on the speech
                // synthesizer itself
                SpeechSynthesizer.speak(spokenMessage, this.voice, callback);
            }

            const colorHtml = this.color ? ` style="color: ${this.color}"` : "";
            const nameHtml =
                `<span class="name"${colorHtml}>&lt;${this.name}&gt;</span>`;

            // @TODO: Ensure that updateBattleLog() can handle elements
            updateBattleLog(`${nameHtml} "${message}"`);
        },
    };

    Object.defineProperty(partyMember, "id", {
        writable: false,
        configurable: false,
    });

    return partyMember;
}
