"use strict";

/**
 * Cheat codes for TardQuest
 *
 * These are intended to be used through the talk/persuade command.
 * During gameplay, press "T" and type a command, starting with a slash "/"
 *
 * All cheat codes are contained within the _command object
 *
 * CHEAT CODE LIST
 *   SPAWN AN NPC
 *   /spawn [letter], eg: /spawn g
 *     [letter] can be "m" (merchant) "g" (gambler), "d" (erok), "p" (pigeon) or
 *       "v" (vampire). Entities spawn in front of the player unless obstructed
 *
 *   GIVE BITCOINS
 *   /givebtc [amount], eg: /givebtc 696969
 *
 *   GIVE EXPERIENCE TO THE PARTY
 *   /giveexp [amount], eg: /giveexp 10000
 *
 *   REVEAL THE MAP
 *   /reveal
 *
 *   TELEPORT TO A MAP COORDINATE
 *   /t [x] [y], eg: /t 12 24
 *
 *   KERMIT SEWER SLIDE
 *   /k
 *
 *   SET A PLAYER STAT
 *   /set [stat] [value], eg: /set defense 40
 *     [stat] can be any progression or core stat name, eg "level" or "luck"
 *
 *   BECOME OVERPOWERED (and spawn a merchant and gambler if there's room)
 *   /debug
 *
 *   SET MAP FLOOR
 *   /setfloor [floor number], eg: /setfloor 13
 *
 *   DEMO MAP: HALLWAY of DOOM
 *   /demomap hod
 *
 *   DEMO MAP: MOSS DUNGEON
 *   /demomap moss
 *
 *   DEMO MAP: GO UNDER THE SEA
 *   /demomap bb
 */
const Cheat = {
    isCheat: function (input) {
        const command = input.match?.(/^\/(\w+)/)?.[1];
        return command && (typeof this._command[command] === "function");
    },

    handle: function (input) {
        if (! this.isCheat(input)) {
            console.error("Input is not a command", { input });
            return;
        }

        const parts = input.match(/^\/(\w+)\s*(.*)$/);
        if (! parts) {
            console.error("Failed to parse command", { input });
            return;
        }

        const command = parts[1].toLowerCase();
        const args = parts[2].trim();

        this._command[command](args);
    },

    // Helper function to print prefixed success messages to the battle log
    _log: function(message) {
        updateBattleLog(`${waveText("CHEAT:", "gold").outerHTML} ${message}`);
    },

    // Helper function to print prefixed failure messages to the battle log
    _logError: function(message) {
        updateBattleLog(`<span class="bad">CHEAT ERROR:</span> ${message}`);
    },

    // Holds all of the cheat codes and their functionality
    _command: {
        // Spawns entities in front of you
        spawn: function(entityType) {
            if (typeof entityType !== "string") {
                console.error("entityType must be a string", { entityType });
                return;
            }

            const coordinate = playerEntity.getCoordinateInFront();
            const entityFunction = {
                m: MapEntityNpcFactory.merchant,
                g: MapEntityNpcFactory.gambler,
                d: MapEntityNpcFactory.erok,
                p: MapEntityFeatureFactory.pigeon,
                v: MapEntityEnemyFactory.vampire,
            }[entityType];

            if (! entityFunction) {
                Cheat._logError("Unknown entity. You suck at cheating.");
                return;
            }

            if (MAP.isObstructed(coordinate.x, coordinate.y)) {
                Cheat._logError(
                    "Could not spawn the entity! Try an empty spot first."
                );
                return;
            }

            const entity = entityType === "v"
                ? entityFunction(floor, coordinate.x, coordinate.y)
                : entityFunction(coordinate.x, coordinate.y);

            if (entity.type === "pigeon") {
                entity.message = randomEntry([
                    "Is mayonnaise an instrument?",
                    `You're about as ugly as ` +
                        `${waveText("homemade soup!", "END").outerHTML}`,
                    "Tardness isn't a virus, but it sure is spreading like " +
                        "one.",
                    "Always follow your heart unless your heart is bad with " +
                        "directions.",
                    "I can't see my forehead!",
                    "An eight-letter word for happiness: BITCOINS.",
                ]);
            }

            MAP.addEntity(entity);
            playSFX("healingTile");
            render();

            Cheat._log(
                `<span class="${entity?.type || ""}">` +
                `${entity.getDisplayName()}</span> spawned at ` +
                `<span class="good">(${entity.x}, ${entity.y}).</span>`
            );
        },

        // Adds bitcoins to your wallet
        givebtc: function(amount) {
            if (typeof amount !== "string") {
                console.error("amount must be a string", { amount });
                return;
            }

            const bitcoins = Number(amount);

            if (! playerEntity.inventory.giveBitcoins(bitcoins)) {
                Cheat._logError("Invalid bitcoin amount.");
                return;
            }

            playSFX("kaching");
            Cheat._log(
                `Added <span class="BTC">` +
                `₿ ${bitcoins.toLocaleString(undefined)}</span> to your ` +
                `worn out Kamen Rider wallet.`
            );
        },

        // Gives experience points
        giveexp: function(amount) {
            if (typeof amount !== "string") {
                console.error("amount must be a string", { amount });
                return;
            }

            const experience = Number(amount);
            if (isNaN(experience) || experience < 0) {
                Cheat._logError("Invalid experience amount.");
                return;
            }

            const livingMembers = playerEntity.party.filter(e => ! e.isDead());

            for (const partyMember of livingMembers) {
                partyMember.giveExperience(experience);
            }

            if (livingMembers.length === 0) {
                Cheat._logError(`Your party can't receive experience.`);
                return;
            }

            playSFX("healingTile");
            Cheat._log(
                `Gave <span class="EXP">` +
                `${experience.toLocaleString(undefined)} experience ` +
                `points</span> to each of your party members.`
            );
        },

        // Reveals the map
        reveal: function() {
            playSFX("torch");
            MAP.reveal();
            render();
            Cheat._log("The map has been revealed!");
        },

        t: function(args) {
            if (! typeof args === "string") {
                console.error("args must be a string", { args });
                return;
            }

            const parts = args.match(/^(\d+)\s+(\d+)$/);
            if (! parts) {
                updateBattleLog(
                    `<span class="persuasion">USAGE:</span> ` +
                    `/t [x] [y]. For example: /t 6 9`
                );
                return;
            }

            const x = parseInt(parts[1], 10);
            const y = parseInt(parts[2], 10);

            if (MAP.isObstructed(x, y)) {
                Cheat._logError("Destination is obstructed.");
                return;
            }

            playerEntity.x = x;
            playerEntity.y = y;
            playSFX("healingTile");

            // Fire onEnter events for anything that the player may land on
            const passableEntity = MAP.entities.find(e =>
                e.x === playerEntity.x &&
                e.y === playerEntity.y &&
                e.id !== playerEntity.id &&
                typeof e.onEnter === "function"
            );

            if (passableEntity) {
                passableEntity.onEnter(MAP, playerEntity);
            }

            render();
            Cheat._log(`Teleported to <span class="good">(${x}, ${y})!</span>`);
        },

        // Unalives your party by committing suicide on itself until it's dead
        k: function() {
            playSFX("scream");
            playerEntity.damageParty(Infinity);
            playerEntity.checkForDeath();
            Cheat._log("Yer fukkin ded.");
        },

        // Sets a core stat or the level of the player's character
        set: function(args) {
            if (! typeof args === "string") {
                console.error("args must be a string", { args });
                return;
            }

            const parts = args.match(/^(\w+)\s+(\d+)$/);
            if (! parts) {
                updateBattleLog(
                    `<span class="persuasion">USAGE:</span> ` +
                    `/set [stat] [value]. For example: /set strength 10`
                );
                return;
            }

            const stat = parts[1];
            const value = parseInt(parts[2], 10);

            if (value < 0) {
                Cheat._logError("Stat must be non-negative.");
                return;
            }

            if (playerEntity.leader.isProgressionStat(stat)) {
                if (stat === "level" && value < 1) {
                    Cheat._logError("Level must be at least 1.");
                    return;
                }

                playSFX("healingTile");
                playerEntity.leader.stats.progression[stat] = value;
                playerEntity.leader.refreshStats();

                if (stat === "level") {
                    document.getElementById("playerLevel").innerText =
                        value.toLocaleString(undefined);
                }

                Cheat._log(
                    `Player's ${stat} has been set to <span class="good">` +
                    `${value.toLocaleString(undefined)}.</span>`
                );

                return;
            }

            if (! playerEntity.leader.isCoreStat(stat)) {
                Cheat._logError("Unrecognized stat.");
                return;
            }

            playerEntity.leader.stats.core[stat] = value;

            // Make sure that HP and Max HP are updated together
            if (stat === "hp" || stat === "maxHp") {
                const key = stat === "hp" ? "maxHp" : "hp";
                playerEntity.leader.stats.core[key] = value;
            }

            playSFX("healingTile");
            playerEntity.leader.refreshStats();

            Cheat._log(
                `Player's core ${stat} stat has been set to ` +
                `<span class="good">${value.toLocaleString(undefined)}.</span>`
            );
        },

        // Mega-buffs the player, gives loot, and may spawn NPCs
        debug: function() {
            const yeahBoiii = 69999;
            const coreStat = playerEntity.leader.stats.core;
            coreStat.maxHp = yeahBoiii;
            coreStat.hp = yeahBoiii;
            coreStat.defense = yeahBoiii;
            coreStat.strength = yeahBoiii;
            coreStat.persuasion = yeahBoiii;
            coreStat.endurance = yeahBoiii;
            coreStat.speed = yeahBoiii;
            coreStat.luck = yeahBoiii;
            playerEntity.leader.refreshStats();

            playerEntity.inventory.contents.bitcoins = yeahBoiii;
            playerEntity.refreshBitcoins();

            for (const itemId of Object.keys(ITEMS)) {
                playerEntity.inventory.addItem(itemId, 10);
            }

            for (const weaponId of Object.keys(WEAPONS)) {
                playerEntity.inventory.addWeapon(weaponId);
            }

            for (const armorId of Object.keys(ARMOR)) {
                playerEntity.inventory.addArmor(armorId);
            }

            for (const ringId of Object.keys(RINGS)) {
                playerEntity.inventory.addRing(ringId);
            }

            const spawnedNpcNames = [];
            const npcs = [
                MapEntityNpcFactory.merchant,
                MapEntityNpcFactory.gambler,
            ];

            for (let i = 0; i < DX.length; i++) {
                const x = playerEntity.x + DX[i];
                const y = playerEntity.y + DY[i];
                if (MAP.isObstructed(x, y)) {
                    continue;
                }

                const npc = npcs.shift()(x, y);
                MAP.addEntity(npc);
                spawnedNpcNames.push(npc.getDisplayName());

                if (npcs.length === 0) {
                    break;
                }
            }

            if (spawnedNpcNames.length > 0) {
                render();
            }

            playSFX("healingTile");

            Cheat._log(
                `Debug mode activated! All stats and BTC set to ` +
                `<span class="good">${yeahBoiii}.</span>` +
                (spawnedNpcNames.length > 0
                    ? ` Spawned ${spawnedNpcNames.join(" and ")} next to you.`
                    : ""
                )
            );
        },

        // Sets the floor number and regenerates the map
        setfloor: function(value) {
            if (typeof value !== "string") {
                console.error("value must be a string", { value });
                return;
            }

            const floorNumber = Number(value);
            if (isNaN(floorNumber) || floorNumber < 1) {
                Cheat._logError("Try an actual floor number, retard.");
                return;
            }

            floor = floorNumber;
            generateMap();
            render();

            playSFX("footstepsDescending");

            Cheat._log(
                `Moved to Floor ${floorNumber.toLocaleString(undefined)}.`
            );
        },

        demomap: function(mapName) {
            if (mapName === "hod") {
                Cheat._log("Entering the Hallway of Doom.");
                TardQuestMapGenerator.generateHallwayOfDoom(MAP, 1);
                MAP.refreshMinimap(true);
                return;
            }

            if (mapName === "moss") {
                Cheat._log("Entering the mossy crypt.");
                TardQuestMapGenerator.generateRandomMossyDungeon(MAP, 1);
                MAP.refreshMinimap(true);
                return;
            }

            if (mapName === "bb") {
                Cheat._log("Entering Bikini Bottom.");
                TardQuestMapGenerator.generateBikiniBottom(MAP, 1);
                MAP.refreshMinimap(true);
                return;
            }

            Cheat._logError("Try naming a map that actually exists, DUMBASS.");
        },
    },
};
