"use strict";

/**
 * @TODO: Incorporate the level into stats
 */
const MapEntityEnemyFactory = {
    randomEnemy: function(level, x, y, direction) {
        const possibleEnemies = [
            { id: "snailSentinel", minimumLevel: 0 },
            { id: "stupidDog", minimumLevel: 0 },
            { id: "wangRat", minimumLevel: 0 },
            { id: "keeperOfTheToiletBowl", minimumLevel: 6 },
            { id: "mysteriousScooter", minimumLevel: 2 },
            { id: "badassFlamingSkeleton", minimumLevel: 5 },
            { id: "fridgeOfForgottenLeftovers", minimumLevel: 4 },
            { id: "lughead", minimumLevel: 3 },
            { id: "pissedOffPoultry", minimumLevel: 0 },
            { id: "krampusElf", minimumLevel: 1 },
        ].filter(e => e.minimumLevel <= level).map(e => e.id);

        const index = Math.floor(Math.random() * possibleEnemies.length);

        switch (possibleEnemies[index]) {
            case "snailSentinel":
                return this.snailSentinel(level, x, y, direction);
            case "stupidDog":
                return this.stupidDog(level, x, y, direction);
            case "wangRat":
                return this.wangRat(level, x, y, direction);
            case "keeperOfTheToiletBowl":
                return this.keeperOfTheToiletBowl(level, x, y, direction);
            case "mysteriousScooter":
                return this.mysteriousScooter(level, x, y, direction);
            case "badassFlamingSkeleton":
                return this.badassFlamingSkeleton(level, x, y, direction);
            case "fridgeOfForgottenLeftovers":
                return this.fridgeOfForgottenLeftovers(level, x, y, direction);
            case "lughead":
                return this.lughead(level, x, y, direction);
            case "pissedOffPoultry":
                return this.pissedOffPoultry(level, x, y, direction);
            case "krampusElf":
                return this.krampusElf(level, x, y, direction);
            default:
                console.error(
                    "Tried to generate an unknown enemy",
                    { possibleEnemies, index }
                );
                return null;
        }
    },

    /**
     * SNAIL SENTINEL
     */
    snailSentinel: function(level, x, y, direction) {
        const snailSentinel = this._buildRoamingEnemy(x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(snailSentinel);
        snailSentinel.inventory.contents.bitcoins =
            Math.floor(4 * (Math.random() * 2 * level));
        snailSentinel.objectsOfInterest = ["player"];
        // Make the snail sentinel move more quickly if it's after an interest
        snailSentinel.isHastyMove = function() {
            return this.targetReason === "interest";
        };

        const maxPartyMembers =
            Math.max(1, Math.floor(Math.random() * level * 0.5) + 1);

        for (let i = 0; i < maxPartyMembers; i++) {
            snailSentinel.addPartyMember(
                TardQuestPartyMemberFactory.snailSentinel(level)
            );
        }

        /**
         * @TODO Replace these with the leader's name
         */
        snailSentinel.getDisplayName = function() {
            return "🐌 Snail Sentinel";
        };

        snailSentinel.getDisplayCharacter = function() {
            return ["▲", "▶", "▼", "◀"][this.direction] || "?";
        };

        snailSentinel.onTouch = function(gameMap, entity) {
            if (entity.type === "player") {
                const playerAdvantage =
                    this.isBeingAmbushedBy(entity) ? "player" : null;

                if (this.turnTowards(entity)) {
                    if (typeof this.prepareMovement === "function") {
                        this.prepareMovement(gameMap);
                    }

                    const html =
                        waveText("DON'T TOUCH THE SNAIL! >:(", "LUK").outerHTML;
                    updateBattleLog(html);

                    BattleSystem.startEncounter(entity, this, playerAdvantage);
                }
            } else {
                console.log(
                    `🐌 Touched by ${entity.id}`,
                    { gameMap, entity, touched: this }
                );
            }
        };

        snailSentinel.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("AIEEEE! YOU KILLED ME!", false);
            this.die(entity);
            MapEntityEnemyFactory._commonFunctions
                .afterExplode(gameMap, this.x, this.y);
        };

        return snailSentinel;
    },

    /**
     * STUPID DOG
     */
    stupidDog: function(level, x, y, direction) {
        const stupidDog = this._buildRoamingEnemy(x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(stupidDog);
        stupidDog.inventory.contents.bitcoins =
            Math.floor(3 * (Math.random() * 2 * level));
        stupidDog.objectsOfInterest = ["player"];
        // Make the stupid dog move more quickly if it's after an interest
        stupidDog.isHastyMove = function() {
            return this.targetReason === "interest";
        };

        stupidDog.addPartyMember(TardQuestPartyMemberFactory.stupidDog(level));

        if (level > 2 && Math.random() < 0.5) {
            const partyMember = Math.random() < 0.5
                ? TardQuestPartyMemberFactory.wangRat(level)
                : TardQuestPartyMemberFactory.stupidDog(level);
            stupidDog.addPartyMember(partyMember);
        }

        stupidDog.getDisplayName = function() {
            return "🐩 Stupid Dog";
        };

        stupidDog.getDisplayCharacter = function() {
            return ["▲", "▶", "▼", "◀"][this.direction] || "?";
        };

        stupidDog.onTouch = function(gameMap, entity) {
            if (entity.type === "player") {
                const playerAdvantage =
                    this.isBeingAmbushedBy(entity) ? "player" : null;

                if (this.turnTowards(entity)) {
                    if (typeof this.prepareMovement === "function") {
                        this.prepareMovement(gameMap);
                    }

                    const html = waveText("WOOF WOOF!", "LUK").outerHTML;
                    updateBattleLog(html);

                    BattleSystem.startEncounter(entity, this, playerAdvantage);
                }
            } else {
                console.log(
                    `🐩 Touched by ${entity.id}`,
                    { gameMap, entity, touched: this }
                );
            }
        };

        stupidDog.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("*Yelps loudly*", false);
            this.die(entity);
            MapEntityEnemyFactory._commonFunctions
                .afterExplode(gameMap, this.x, this.y);
        };

        return stupidDog;
    },

    /**
     * WANG RAT
     */
    wangRat: function(level, x, y, direction) {
        const wangRat = this._buildRoamingEnemy(x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(wangRat);
        wangRat.inventory.contents.bitcoins =
            Math.floor(2 * (Math.random() * 2 * level));
        wangRat.objectsOfInterest = ["player"];
        // Make the wang rat move more quickly if it's after an interest
        wangRat.isHastyMove = function() {
            return this.targetReason === "interest";
        };

        const maxRats =
            Math.min(6, Math.max(1, Math.floor(level * Math.random())));

        for (let i = 0; i < maxRats; i++) {
            wangRat.addPartyMember(TardQuestPartyMemberFactory.wangRat(level));
        }

        wangRat.getDisplayName = function() {
            return "🐀 Wang Rat";
        };

        wangRat.getDisplayCharacter = function() {
            return ["▲", "▶", "▼", "◀"][this.direction] || "?";
        };

        wangRat.onTouch = function(gameMap, entity) {
            if (entity.type === "player") {
                const playerAdvantage =
                    this.isBeingAmbushedBy(entity) ? "player" : null;

                if (this.turnTowards(entity)) {
                    if (typeof this.prepareMovement === "function") {
                        this.prepareMovement(gameMap);
                    }

                    const html = waveText("EEK!", "LUK").outerHTML;
                    updateBattleLog(html);

                    BattleSystem.startEncounter(entity, this, playerAdvantage);
                }
            } else {
                console.log(
                    `🐀 Touched by ${entity.id}`,
                    { gameMap, entity, touched: this }
                );
            }
        };

        wangRat.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("EEEEEEEEEEEEAAAAAHHHH!!!", false);
            this.die(entity);
            MapEntityEnemyFactory._commonFunctions
                .afterExplode(gameMap, this.x, this.y);
        };

        return wangRat;
    },

    /**
     * KEEPER OF THE TOILET BOWL
     */
    keeperOfTheToiletBowl: function(level, x, y, direction) {
        const keeperOfTheToiletBowl = this._buildRoamingEnemy(x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(keeperOfTheToiletBowl);
        keeperOfTheToiletBowl.inventory.contents.bitcoins =
            Math.floor(5 * (Math.random() * 2 * level));
        keeperOfTheToiletBowl.objectsOfInterest = ["player"];
        // Make the keeper move more quickly if it's after an interest
        keeperOfTheToiletBowl.isHastyMove = function() {
            return this.targetReason === "interest";
        };

        const maxPartyMembers = Math.floor(Math.random() * 6) + 1;
        const partyMembersAreDogs = Math.random() < 0.5;
        for (let i = 0; i < maxPartyMembers; i++) {
            keeperOfTheToiletBowl.addPartyMember(
                i > 0 && partyMembersAreDogs
                    ? TardQuestPartyMemberFactory.stupidDog(level)
                    : TardQuestPartyMemberFactory.keeperOfTheToiletBowl(level)
            );
        }

        keeperOfTheToiletBowl.addPartyMember(
            TardQuestPartyMemberFactory.keeperOfTheToiletBowl(level)
        );

        keeperOfTheToiletBowl.getDisplayName = function() {
            return "🚽 Keeper of the Toilet Bowl";
        };

        keeperOfTheToiletBowl.getDisplayCharacter = function() {
            return ["▲", "▶", "▼", "◀"][this.direction] || "?";
        };

        keeperOfTheToiletBowl.onTouch = function(gameMap, entity) {
            if (entity.type === "player") {
                const playerAdvantage =
                    this.isBeingAmbushedBy(entity) ? "player" : null;

                if (this.turnTowards(entity)) {
                    if (typeof this.prepareMovement === "function") {
                        this.prepareMovement(gameMap);
                    }

                    const html =
                        waveText("PREPARE FOR PORCELAIN DOOM", "LUK").outerHTML;
                    updateBattleLog(html);

                    BattleSystem.startEncounter(entity, this, playerAdvantage);
                }
            } else {
                console.log(
                    `🚽 Touched by ${entity.id}`,
                    { gameMap, entity, touched: this }
                );
            }
        };

        keeperOfTheToiletBowl.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("MY DIGNITY HAS BEEN FLUSHED AWAY!", false);
            this.die(entity);
            MapEntityEnemyFactory._commonFunctions
                .afterExplode(gameMap, this.x, this.y);
        };

        return keeperOfTheToiletBowl;
    },

    /**
     * MYSTERIOUS SCOOTER
     */
    mysteriousScooter: function(level, x, y, direction) {
        const mysteriousScooter = this._buildRoamingEnemy(x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(mysteriousScooter);
        mysteriousScooter.inventory.contents.bitcoins =
            Math.floor(4 * (Math.random() * 2 * level));
        mysteriousScooter.objectsOfInterest = ["player"];
        // Make the scooter move more quickly if it's after an interest
        mysteriousScooter.isHastyMove = function() {
            return this.targetReason === "interest";
        };

        mysteriousScooter.addPartyMember(
            TardQuestPartyMemberFactory.mysteriousScooter(level)
        );

        mysteriousScooter.getDisplayName = function() {
            return "🛴 Mysterious Scooter";
        };

        mysteriousScooter.getDisplayCharacter = function() {
            return ["▲", "▶", "▼", "◀"][this.direction] || "?";
        };

        mysteriousScooter.onTouch = function(gameMap, entity) {
            if (entity.type === "player") {
                const playerAdvantage =
                    this.isBeingAmbushedBy(entity) ? "player" : null;

                if (this.turnTowards(entity)) {
                    if (typeof this.prepareMovement === "function") {
                        this.prepareMovement(gameMap);
                    }

                    const html =
                        waveText("*Menacing bicycle bell sounds*", "LUK")
                            .outerHTML;
                    updateBattleLog(html);

                    BattleSystem.startEncounter(entity, this, playerAdvantage);
                }
            } else {
                console.log(
                    `🛴 Touched by ${entity.id}`,
                    { gameMap, entity, touched: this }
                );
            }
        };

        mysteriousScooter.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("GYROSCOPE MALFUNCTION", false);
            this.die(entity);
            MapEntityEnemyFactory._commonFunctions
                .afterExplode(gameMap, this.x, this.y);
        };

        return mysteriousScooter;
    },

    /**
     * BADASS FLAMING SKELETON
     */
    badassFlamingSkeleton: function(level, x, y, direction) {
        const badassFlamingSkeleton = this._buildRoamingEnemy(x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(badassFlamingSkeleton);
        badassFlamingSkeleton.inventory.contents.bitcoins =
            Math.floor(4 * (Math.random() * 2 * level));
        badassFlamingSkeleton.objectsOfInterest = ["player"];
        // Make the skeleton move more quickly if it's after an interest
        badassFlamingSkeleton.isHastyMove = function() {
            return this.targetReason === "interest";
        };

        badassFlamingSkeleton.addPartyMember(
            TardQuestPartyMemberFactory.badassFlamingSkeleton(level)
        );

        badassFlamingSkeleton.getDisplayName = function() {
            return "💀 Badass Flaming Skeleton";
        };

        badassFlamingSkeleton.getDisplayCharacter = function() {
            return ["▲", "▶", "▼", "◀"][this.direction] || "?";
        };

        badassFlamingSkeleton.onTouch = function(gameMap, entity) {
            if (entity.type === "player") {
                const playerAdvantage =
                    this.isBeingAmbushedBy(entity) ? "player" : null;

                if (this.turnTowards(entity)) {
                    if (typeof this.prepareMovement === "function") {
                        this.prepareMovement(gameMap);
                    }

                    const html = waveText(
                        "I GOT A HOT BONE TO PICK WITH YOU HEHEHE",
                        "LUK"
                    ).outerHTML;
                    updateBattleLog(html);

                    BattleSystem.startEncounter(entity, this, playerAdvantage);
                }
            } else {
                console.log(
                    `💀 Touched by ${entity.id}`,
                    { gameMap, entity, touched: this }
                );
            }
        };

        badassFlamingSkeleton.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say(
                "I'VE BEEN REDUCED TO BONES! ... wait a sec...",
                false
            );
            this.die(entity);
            MapEntityEnemyFactory._commonFunctions
                .afterExplode(gameMap, this.x, this.y);
        };

        return badassFlamingSkeleton;
    },

    /**
     * FRIDGE of FORGOTTEN LEFTOVERS
     */
    fridgeOfForgottenLeftovers: function(level, x, y, direction) {
        const fridgeOfForgottenLeftovers =
            this._buildRoamingEnemy(x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(fridgeOfForgottenLeftovers);
        fridgeOfForgottenLeftovers.inventory.contents.bitcoins =
            Math.floor(3 * (Math.random() * 2 * level));
        fridgeOfForgottenLeftovers.objectsOfInterest = ["player"];

        fridgeOfForgottenLeftovers.addPartyMember(
            TardQuestPartyMemberFactory.fridgeOfForgottenLeftovers(level)
        );

        fridgeOfForgottenLeftovers.getDisplayName = function() {
            return "🍲 Fridge of Forgotten Leftovers";
        };

        fridgeOfForgottenLeftovers.getDisplayCharacter = function() {
            return ["▲", "▶", "▼", "◀"][this.direction] || "?";
        };

        fridgeOfForgottenLeftovers.onTouch = function(gameMap, entity) {
            if (entity.type === "player") {
                const playerAdvantage =
                    this.isBeingAmbushedBy(entity) ? "player" : null;

                if (this.turnTowards(entity)) {
                    if (typeof this.prepareMovement === "function") {
                        this.prepareMovement(gameMap);
                    }

                    const html = waveText(
                        "*a repulsive moldy scent wafts through your nostrils*",
                        "LUK"
                    ).outerHTML;
                    updateBattleLog(html);

                    BattleSystem.startEncounter(entity, this, playerAdvantage);
                }
            } else {
                console.log(
                    `🍲 Touched by ${entity.id}`,
                    { gameMap, entity, touched: this }
                );
            }
        };

        fridgeOfForgottenLeftovers.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("*SPLAT*", false);
            this.die(entity);
            MapEntityEnemyFactory._commonFunctions
                .afterExplode(gameMap, this.x, this.y);
        };

        return fridgeOfForgottenLeftovers;
    },

    /**
     * LUGHEAD
     */
    lughead: function(level, x, y, direction) {
        const lughead = this._buildRoamingEnemy(x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(lughead);
        lughead.inventory.contents.bitcoins =
            Math.floor(4 * (Math.random() * 2 * level));
        lughead.objectsOfInterest = ["player"];
        // Make the lughead move more quickly if it's after an interest
        lughead.isHastyMove = function() {
            return this.targetReason === "interest";
        };

        lughead.addPartyMember(TardQuestPartyMemberFactory.lughead(level));

        lughead.getDisplayName = function() {
            return "🗿 Lughead";
        };

        lughead.getDisplayCharacter = function() {
            return ["▲", "▶", "▼", "◀"][this.direction] || "?";
        };

        lughead.onTouch = function(gameMap, entity) {
            if (entity.type === "player") {
                const playerAdvantage =
                    this.isBeingAmbushedBy(entity) ? "player" : null;

                if (this.turnTowards(entity)) {
                    if (typeof this.prepareMovement === "function") {
                        this.prepareMovement(gameMap);
                    }

                    const html = waveText("huh?", "LUK").outerHTML;
                    updateBattleLog(html);

                    BattleSystem.startEncounter(entity, this, playerAdvantage);
                }
            } else {
                console.log(
                    `🗿 Touched by ${entity.id}`,
                    { gameMap, entity, touched: this }
                );
            }
        };

        lughead.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("ow", false);
            this.die(entity);
            MapEntityEnemyFactory._commonFunctions
                .afterExplode(gameMap, this.x, this.y);
        };

        return lughead;
    },

    /**
     * PISSED-OFF POULTRY
     */
    pissedOffPoultry: function(level, x, y, direction) {
        const pissedOffPoultry = this._buildRoamingEnemy(x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(pissedOffPoultry);
        pissedOffPoultry.inventory.contents.bitcoins =
            Math.floor(2 * (Math.random() * 2 * level));
        pissedOffPoultry.objectsOfInterest = ["player"];
        // Make the chicken move more quickly if it's after an interest
        pissedOffPoultry.isHastyMove = function() {
            return this.targetReason === "interest";
        };

        pissedOffPoultry.addPartyMember(
            TardQuestPartyMemberFactory.pissedOffPoultry(level)
        );

        pissedOffPoultry.getDisplayName = function() {
            return "🐔 Pissed-Off Poultry";
        };

        pissedOffPoultry.getDisplayCharacter = function() {
            return ["▲", "▶", "▼", "◀"][this.direction] || "?";
        };

        pissedOffPoultry.onTouch = function(gameMap, entity) {
            if (entity.type === "player") {
                const playerAdvantage =
                    this.isBeingAmbushedBy(entity) ? "player" : null;

                if (this.turnTowards(entity)) {
                    if (typeof this.prepareMovement === "function") {
                        this.prepareMovement(gameMap);
                    }

                    const html = waveText("CLUCK", "LUK").outerHTML;
                    updateBattleLog(html);

                    BattleSystem.startEncounter(entity, this, playerAdvantage);
                }
            } else {
                console.log(
                    `🐔 Touched by ${entity.id}`,
                    { gameMap, entity, touched: this }
                );
            }
        };

        pissedOffPoultry.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("ACK!", false);
            this.die(entity);
            MapEntityEnemyFactory._commonFunctions
                .afterExplode(gameMap, this.x, this.y);
        };

        return pissedOffPoultry;
    },

    /**
     * KRAMPUS ELF
     */
    krampusElf: function(level, x, y, direction) {
        const krampusElf = this._buildRoamingEnemy(x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(krampusElf);
        krampusElf.inventory.contents.bitcoins =
            Math.floor(4 * (Math.random() * 2 * level));
        krampusElf.objectsOfInterest = ["player"];
        // Make the elf move more quickly if it's after an interest
        krampusElf.isHastyMove = function() {
            return this.targetReason === "interest";
        };

        krampusElf.addPartyMember(
            TardQuestPartyMemberFactory.krampusElf(level)
        );

        krampusElf.getDisplayName = function() {
            return "🧝 Krampus Elf";
        };

        krampusElf.getDisplayCharacter = function() {
            return ["▲", "▶", "▼", "◀"][this.direction] || "?";
        };

        krampusElf.onTouch = function(gameMap, entity) {
            if (entity.type === "player") {
                const playerAdvantage =
                    this.isBeingAmbushedBy(entity) ? "player" : null;

                if (this.turnTowards(entity)) {
                    if (typeof this.prepareMovement === "function") {
                        this.prepareMovement(gameMap);
                    }

                    const html = waveText("BAD TOUCH", "LUK").outerHTML;
                    updateBattleLog(html);

                    BattleSystem.startEncounter(entity, this, playerAdvantage);
                }
            } else {
                console.log(
                    `🧝 Touched by ${entity.id}`,
                    { gameMap, entity, touched: this }
                );
            }
        };

        krampusElf.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("AUGH!", false);
            this.die(entity);
            MapEntityEnemyFactory._commonFunctions
                .afterExplode(gameMap, this.x, this.y);
        };

        return krampusElf;
    },

    /**
     * MIMIC
     */
    mimic: function(level, x, y, direction) {
        const mimic = this._buildRoamingEnemy(x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(mimic);
        mimic.inventory.contents.bitcoins = 100;
        // No objects of interest because the mimic waits for victims

        mimic.addPartyMember(TardQuestPartyMemberFactory.mimic(level));

        mimic.getDisplayName = function() {
            return "🎁 Mimic";
        };

        mimic.getDisplayCharacter = function() {
            return ["▲", "▶", "▼", "◀"][this.direction] || "?";
        };

        mimic.onTouch = function(gameMap, entity) {
            if (entity.type === "player") {
                const playerAdvantage =
                    this.isBeingAmbushedBy(entity) ? "player" : null;

                if (this.turnTowards(entity)) {
                    if (typeof this.prepareMovement === "function") {
                        this.prepareMovement(gameMap);
                    }

                    const html = waveText("Open me up, heheh", "LUK").outerHTML;
                    updateBattleLog(html);

                    BattleSystem.startEncounter(entity, this, playerAdvantage);
                }
            } else {
                console.log(
                    `🎁 Touched by ${entity.id}`,
                    { gameMap, entity, touched: this }
                );
            }
        };

        mimic.spriteIds = [ "treasureChest", "circularShadow" ];

        mimic.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("CRAP!", false);
            this.die(entity);
            MapEntityEnemyFactory._commonFunctions
                .afterExplode(gameMap, this.x, this.y);
        };

        return mimic;
    },

    /**
     * VAMPIRE
     */
    vampire: function(level, x, y, direction) {
        const vampire = MapEntityBuilder("vampire", x, y, direction);
        vampire.spriteIds = ["vampireBat", "bobbingShadow"];

        MapEntityTrait_AttachMovement_Pursue(vampire);
        vampire.inventory.contents.bitcoins = 40;
        vampire.objectsOfInterest = ["player"];
        vampire.targetEntity(playerEntity.id); // Chase the player

        vampire.getMovementPriority = function() {
            return 50;
        };

        // The vampire is always moving hastily
        vampire.isHastyMove = function() {
            return true;
        };

        vampire.addPartyMember(TardQuestPartyMemberFactory.vampire(level));

        vampire.getDisplayName = function() {
            return this.encounteredByPlayer
                ? `🧛 <span class="gay">Gay Cocksucking Vampire</span>`
                : `🦇 <em>A menacing... fruit bat?</em>`;
        };

        vampire.getDisplayCharacter = function() {
            // The vampire's character is provided by a CSS animation
            return " ";
        };

        vampire.battleRestrictions = [
            "playerEntityPersuade",
            "playerEntityRun",
        ];

        vampire.onTouch = function(gameMap, entity) {
            if (entity.type === "player") {
                const playerAdvantage =
                    this.isBeingAmbushedBy(entity) ? "player" : null;

                if (this.turnTowards(entity)) {
                    if (typeof this.prepareMovement === "function") {
                        this.prepareMovement(gameMap);
                    }

                    const html =
                        waveText("Well hello, big boy!", "LUK").outerHTML;
                    updateBattleLog(html);

                    BattleSystem.startEncounter(entity, this, playerAdvantage);
                }
            } else {
                console.log(
                    `🧛 Touched by ${entity.id}`,
                    { gameMap, entity, touched: this }
                );
            }
        };

        vampire.onEncounter = function() {
            music.play("vampireBattleIntro", "battle");
        };

        vampire.onEncounterEnd = function() {
            this.explorationMusicId
                ? music.play(this.explorationMusicId, "exploration")
                : music.playRandom("exploration");
        };

        vampire.onDie = function() {
            this.getDisplayName =
                () => "☠️ Gay Cocksucking Vampire, post conversion therapy";
            this.getDisplayCharacter = () =>"◌";
            this.onTouch = null;
            this.onEnter = function(gameMap, actorEntity) {
                updateBattleLog(
                    `${actorEntity.leader.name} stepped in a sticky puddle ` +
                    `of glitter.`
                );
            };

            this.type = "corpse";
            this.isActive = false;
        };

        vampire.onExplode = function(gameMap, entity) {
            this.leader?.say("Tsk. You almost scratched my satin cape!", false);
        };

        /**
         * Shows the focal point of the vampire on the minimap if the vampire's
         * cell has previously been explored. Otherwise, just flashes the screen
         * giallo-style for maximum suspense
         *
         * @param Map gameMap The game's map object
         * @param function|null onAnimationEnd Optional post-animation callback
         */
        vampire.showFocalPoint = function(gameMap, onAnimationEnd) {
            const $vampireFocalPoint =
                document.getElementById("vampireFocalPoint");
            if (! $vampireFocalPoint) {
                console.error("Vampire focal point element was not found");
                return;
            }

            const $desaturationOverlay = document.getElementById(
                "vampireFocalPointDesaturationOverlay"
            );
            if (! $desaturationOverlay) {
                console.error(
                    "Focal point desaturation overlay element was not found"
                );
                return;
            }

            const vampireIsVisible = gameMap.isExplored(this.x, this.y);

            const $minimapCell =
                document.getElementById(`map_cell_${this.x}_${this.y}`);
            if (! $minimapCell) {
                console.error("Could not find the vampire on the minimap");
                return;
            }

            const rect = $minimapCell.getBoundingClientRect();
            const x = Math.round(rect.left + (rect.width / 2));
            const y = Math.round(rect.top + (rect.height / 2));

            const radiusStartPx = 2240;
            const radiusEndPx = vampireIsVisible ? 16 : 2240;
            const durationMs = 2000;
            const easingCss = vampireIsVisible
                ? "cubic-bezier(0.22, 1, 0.36, 1)"
                : "cubic-bezier(1, 0, 0.75, 1)";

            $vampireFocalPoint.style.setProperty("--center-x", `${x}px`);
            $vampireFocalPoint.style.setProperty("--center-y", `${y}px`);
            $vampireFocalPoint.style
                .setProperty("--radius-start", `${radiusStartPx}px`);
            $vampireFocalPoint.style
                .setProperty("--radius-end", `${radiusEndPx}px`);

            $desaturationOverlay.style.setProperty("--center-x", `${x}px`);
            $desaturationOverlay.style.setProperty("--center-y", `${y}px`);
            $desaturationOverlay.style
                .setProperty("--radius-start", `${radiusStartPx}px`);
            $desaturationOverlay.style
                .setProperty("--radius-end", `${radiusEndPx}px`);


            $vampireFocalPoint.style.animationDuration = `${durationMs}ms`;
            $vampireFocalPoint.style.animationTimingFunction = easingCss;
            $vampireFocalPoint.classList.remove("is-animating");
            $vampireFocalPoint.offsetWidth; // Force reflow
            $vampireFocalPoint.classList.add("is-animating");

            $desaturationOverlay.style.animationDuration =
                `${durationMs + 500}ms`;
            $desaturationOverlay.style.animationTimingFunction = easingCss;
            $desaturationOverlay.classList.remove("is-animating");
            $desaturationOverlay.offsetWidth; // Force reflow
            $desaturationOverlay.classList.add("is-animating");

            music.stop();
            playSFX("alert");

            setTimeout(
                () => {
                    vampire.explorationMusicId =
                        music.getLastTaggedTrackId("exploration");
                    music.play("vampireLurking", "exploration");
                },
                2000
            );

            function handleAnimationEnd(event) {
                if (event.target !== $desaturationOverlay) {
                    return;
                }

                $desaturationOverlay.removeEventListener(
                    "animationend",
                    handleAnimationEnd
                );

                $vampireFocalPoint.classList.remove("is-animating");
                $desaturationOverlay.classList.remove("is-animating");

                if (typeof onAnimationEnd === "function") {
                    onAnimationEnd();
                }
            }

            $desaturationOverlay.addEventListener(
                "animationend",
                handleAnimationEnd
            );
        };

        return vampire;
    },

    _buildRoamingEnemy: function(x, y, direction) {
        const entity = MapEntityBuilder("roamingEnemy", x, y, direction);
        this.spriteIds = [ "roamingEnemy", "circularShadow" ];
        entity.className = "roamingEnemy";

        entity.onStun = function() {
            this.spriteIds = [ "roamingEnemyStunned", "circularShadow" ];
        };

        entity.onStunEnd = function() {
            this.spriteIds = [ "roamingEnemy", "circularShadow" ];
        };

        entity.getSceneArtId = function(seenFromX, seenFromY) {
            const baseId = this.isStunned() ? "stunnedEnemy" : "roamingEnemy";

            const relativeDirectionTable = [
                [2, 1, 0, 3], // Entity facing north
                [1, 0, 3, 2], // Entity facing east
                [0, 3, 2, 1], // Entity facing south
                [3, 2, 1, 0], // Entity facing west
            ];

            const deltaX = seenFromX - this.x;
            const deltaY = seenFromY - this.y;

            const directionToVantagePoint =
                Math.abs(deltaX) > Math.abs(deltaY)
                    ? (deltaX > 0 ? 1 : 3)
                    : (deltaY > 0 ? 0 : 2);

            const direction =relativeDirectionTable
                [entity.direction][directionToVantagePoint];

            const directionName = ["Front", "Right", "Back", "Left"][direction];
            if (! directionName) {
                console.error("Unknown direction", { direction });
                return "void";
            }

            return [ baseId + directionName, "circularShadow" ];
        };

        entity.onEncounter = MapEntityEnemyFactory._commonFunctions.onEncounter;
        entity.onEncounterEnd =
            MapEntityEnemyFactory._commonFunctions.onEncounterEnd;

        return entity;
    },

    _commonFunctions: {
        onEncounter: function() {
            music.playRandom("battle");
        },

        onEncounterEnd: function() {
            music.resumeTag("exploration");
        },

        afterExplode: function(gameMap, x, y) {
            const bloodyCrater = MapEntityFeatureFactory.bloodyCrater(x, y);

            bloodyCrater.onEnter = function(gameMap, actorEntity) {
                if (actorEntity.leader) {
                    updateBattleLog(
                        `${actorEntity.leader.name} stepped in a gooey ` +
                        `puddle that was a former creature. Ew.`
                    );
                }
            };

            bloodyCrater.onExplode = function(gameMap, entity) {
                this.die(entity);
            };

            gameMap.addEntity(bloodyCrater);
        },
    },
}
