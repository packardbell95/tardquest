"use strict";

/**
 * @TODO: Incorporate the level into stats
 */
const MapEntityEnemyFactory = {
    randomEnemy: function(level, x, y, direction) {
        const possibleEnemies = [
            "snailSentinel",
            "stupidDog",
            "wangRat",
            "keeperOfTheToiletBowl",
            "mysteriousScooter",
            "badassFlamingSkeleton",
            "fridgeOfForgottenLeftovers",
            "lughead",
            "pissedOffPoultry",
            "krampusElf",
        ];

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
        const snailSentinel =
            this._buildRoamingEnemy("snailSentinel", x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(snailSentinel);
        snailSentinel.inventory.contents.bitcoins = 4;
        snailSentinel.objectsOfInterest = ["player"];
        // Make the snail sentinel move more quickly if it's after an interest
        snailSentinel.isHastyMove = function() {
            return this.targetReason === "interest";
        };

        snailSentinel.addPartyMember(
            TardQuestPartyMemberFactory.snailSentinel(level)
        );
        snailSentinel.addPartyMember(
            TardQuestPartyMemberFactory.snailSentinel(level)
        );
        snailSentinel.addPartyMember(
            TardQuestPartyMemberFactory.snailSentinel(level)
        );

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

        snailSentinel.onDie = MapEntityEnemyFactory._commonFunctions.onDie;

        snailSentinel.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("AIEEEE! YOU KILLED ME!", false);
            this.die(entity);
        };

        return snailSentinel;
    },

    /**
     * STUPID DOG
     */
    stupidDog: function(level, x, y, direction) {
        const stupidDog = this._buildRoamingEnemy("stupidDog", x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(stupidDog);
        stupidDog.inventory.contents.bitcoins = 3;
        stupidDog.objectsOfInterest = ["player"];
        // Make the stupid dog move more quickly if it's after an interest
        stupidDog.isHastyMove = function() {
            return this.targetReason === "interest";
        };

        stupidDog.addPartyMember(TardQuestPartyMemberFactory.stupidDog(level));
        stupidDog.addPartyMember(TardQuestPartyMemberFactory.wangRat(level));

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

        stupidDog.onDie = MapEntityEnemyFactory._commonFunctions.onDie;

        stupidDog.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("*Yelps loudly*", false);
            this.die(entity);
        };

        return stupidDog;
    },

    /**
     * WANG RAT
     */
    wangRat: function(level, x, y, direction) {
        const wangRat = this._buildRoamingEnemy("wangRat", x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(wangRat);
        wangRat.inventory.contents.bitcoins = 2;
        wangRat.objectsOfInterest = ["player"];
        // Make the wang rat move more quickly if it's after an interest
        wangRat.isHastyMove = function() {
            return this.targetReason === "interest";
        };

        const maxPartyMembers = Math.floor(Math.random() * 6) + 1;
        for (let i = 0; i < maxPartyMembers; i++) {
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

        wangRat.onDie = MapEntityEnemyFactory._commonFunctions.onDie;

        wangRat.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("EEEEEEEEEEEEAAAAAHHHH!!!", false);
            this.die(entity);
        };

        return wangRat;
    },

    /**
     * KEEPER OF THE TOILET BOWL
     */
    keeperOfTheToiletBowl: function(level, x, y, direction) {
        const keeperOfTheToiletBowl =
            this._buildRoamingEnemy("keeperOfTheToiletBowl", x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(keeperOfTheToiletBowl);
        keeperOfTheToiletBowl.inventory.contents.bitcoins = 5;
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

        keeperOfTheToiletBowl.onDie =
            MapEntityEnemyFactory._commonFunctions.onDie;

        keeperOfTheToiletBowl.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("MY DIGNITY HAS BEEN FLUSHED AWAY!", false);
            this.die(entity);
        };

        return keeperOfTheToiletBowl;
    },

    /**
     * MYSTERIOUS SCOOTER
     */
    mysteriousScooter: function(level, x, y, direction) {
        const mysteriousScooter =
            this._buildRoamingEnemy("mysteriousScooter", x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(mysteriousScooter);
        mysteriousScooter.inventory.contents.bitcoins = 4;
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

        mysteriousScooter.onDie = MapEntityEnemyFactory._commonFunctions.onDie;

        mysteriousScooter.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("GYROSCOPE MALFUNCTION", false);
            this.die(entity);
        };

        return mysteriousScooter;
    },

    /**
     * BADASS FLAMING SKELETON
     */
    badassFlamingSkeleton: function(level, x, y, direction) {
        const badassFlamingSkeleton =
            this._buildRoamingEnemy("badassFlamingSkeleton", x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(badassFlamingSkeleton);
        badassFlamingSkeleton.inventory.contents.bitcoins = 4;
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

        badassFlamingSkeleton.onDie =
            MapEntityEnemyFactory._commonFunctions.onDie;

        badassFlamingSkeleton.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say(
                "I'VE BEEN REDUCED TO BONES! ... wait a sec...",
                false
            );
            this.die(entity);
        };

        return badassFlamingSkeleton;
    },

    /**
     * FRIDGE of FORGOTTEN LEFTOVERS
     */
    fridgeOfForgottenLeftovers: function(level, x, y, direction) {
        const fridgeOfForgottenLeftovers = this._buildRoamingEnemy(
            "fridgeOfForgottenLeftovers",
            x,
            y,
            direction
        );
        MapEntityTrait_AttachMovement_Patrol(fridgeOfForgottenLeftovers);
        fridgeOfForgottenLeftovers.inventory.contents.bitcoins = 3;
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

        fridgeOfForgottenLeftovers.onDie =
            MapEntityEnemyFactory._commonFunctions.onDie;

        fridgeOfForgottenLeftovers.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("*SPLAT*", false);
            this.die(entity);
        };

        return fridgeOfForgottenLeftovers;
    },

    /**
     * LUGHEAD
     */
    lughead: function(level, x, y, direction) {
        const lughead = this._buildRoamingEnemy("lughead", x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(lughead);
        lughead.inventory.contents.bitcoins = 4;
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

        lughead.onDie = MapEntityEnemyFactory._commonFunctions.onDie;

        lughead.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("ow", false);
            this.die(entity);
        };

        return lughead;
    },

    /**
     * PISSED-OFF POULTRY
     */
    pissedOffPoultry: function(level, x, y, direction) {
        const pissedOffPoultry =
            this._buildRoamingEnemy("pissedOffPoultry", x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(pissedOffPoultry);
        pissedOffPoultry.inventory.contents.bitcoins = 2;
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

        pissedOffPoultry.onDie = MapEntityEnemyFactory._commonFunctions.onDie;

        pissedOffPoultry.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("ACK!", false);
            this.die(entity);
        };

        return pissedOffPoultry;
    },

    /**
     * KRAMPUS ELF
     */
    krampusElf: function(level, x, y, direction) {
        const krampusElf =
            this._buildRoamingEnemy("krampusElf", x, y, direction);
        MapEntityTrait_AttachMovement_Patrol(krampusElf);
        krampusElf.inventory.contents.bitcoins = 4;
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

        krampusElf.onDie = MapEntityEnemyFactory._commonFunctions.onDie;

        krampusElf.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("AUGH!", false);
            this.die(entity);
        };

        return krampusElf;
    },

    /**
     * MIMIC
     */
    mimic: function(level, x, y, direction) {
        const mimic = this._buildRoamingEnemy("mimic", x, y, direction);
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

        mimic.onDie = MapEntityEnemyFactory._commonFunctions.onDie;

        mimic.onExplode = function(gameMap, entity) {
            console.log({ boom: this });
            this.leader?.say("CRAP!", false);
            this.die(entity);
        };

        return mimic;
    },

    /**
     * VAMPIRE
     */
    vampire: function(level, x, y, direction) {
        const vampire = MapEntityBuilder("vampire", x, y, direction);
        MapEntityTrait_AttachMovement_Pursue(vampire);
        vampire.inventory.contents.bitcoins = 40;
        vampire.objectsOfInterest = ["player"];
        // @TODO Call the vampire's .targetEntity() when spawned

        // The vampire is always moving hastily
        vampire.isHastyMove = function() {
            return true;
        };

        vampire.addPartyMember(TardQuestPartyMemberFactory.vampire(level));

        vampire.getDisplayName = function() {
            return "🧛 Gay Cocksucking Vampire";
        };

        vampire.getDisplayCharacter = function() {
            return ["▲", "▶", "▼", "◀"][this.direction] || "?";
        };

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
        };

        vampire.onExplode = function(gameMap, entity) {
            this.leader?.say("Tsk. You almost scratched my satin cape!", false);
        };

        return vampire;
    },

    _buildRoamingEnemy: function(type, x, y, direction) {
        const entity = MapEntityBuilder(type, x, y, direction);
        entity.className = "roamingEnemy";

        return entity;
    },

    _commonFunctions: {
        onDie: function() {
            this.type = "corpse";

            if (! this.leader) {
                this.isActive = false;
                return;
            }

            this.getDisplayName = () => "☠️ Former Creature";
            this.getDisplayCharacter = () => "◌";
            this.onTouch = null;
            this.onEnter = function(gameMap, actorEntity) {
                updateBattleLog(
                    `${actorEntity.leader.name} stepped in a gooey puddle ` +
                    `that was a former creature. Ew.`
                );
            };
            this.onExplode = function() {
                this.isActive = false;
            };
        },
    },
}
