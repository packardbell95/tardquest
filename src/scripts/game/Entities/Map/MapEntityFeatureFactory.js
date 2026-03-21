"use strict";

/**
 * This factory is used to create map features, such as exits, signs, special
 * tiles, or whatever else
 */
const MapEntityFeatureFactory = {
    /**
     * EXIT
     */
    exit: function(x, y) {
        const exit = MapEntityBuilder("exit", x, y);

        exit.getDisplayName = () => "🏁 Exit";
        exit.getDisplayCharacter = () => "E";

        // @TODO Put targeting and movement logic elsewhere so that this does
        // not have to be reset for immobile entities
        exit.targetCheck = () => {};

        exit.onEnter = function(gameMap, entity) {
            console.log("onEnter()", { entity });
            if (entity?.type === "player") {
                descend();
            } else {
                console.log(
                    `🏁 Entered by ${entity.id}`,
                    { gameMap, entity, entered: this }
                );
            }
        };

        return exit;
    },

    /**
     * HEALING TILE
     */
    healingTile: function(x, y) {
        const healingTile = MapEntityBuilder("healingTile", x, y);
        healingTile.getDisplayName = () => "🟩 Healing Tile";
        healingTile.getDisplayCharacter = () => "H";
        healingTile.targetCheck = () => {};

        healingTile.onEnter = function(gameMap, entity) {
            function performHeal() {
                const results = {
                    leaderHealed: false,
                    partyHealed: false,
                };

                for (let i = 0; i < entity.party.length; i++) {
                    const partyMember = entity.party[i];
                    const isLeader = i === 0;

                    const healAmount = Math.ceil(
                        partyMember.getEffectiveCoreStat("maxHp") *
                        (isLeader ? 0.3 : 0.1)
                    );

                    const willHeal =
                        partyMember.getEffectiveCoreStat("hp") <
                        partyMember.getEffectiveCoreStat("maxHp");

                    if (willHeal) {
                        const key = isLeader ? "leaderHealed" : "partyHealed";
                        results[key] = true;
                    }

                    partyMember.heal(healAmount);
                }

                return results;
            }

            console.log("onEnter()", { entity });
            if (entity?.type === "player") {
                // @TODO Update the video player to handle video interruptions
                // so that effects like this don't have to be locked
                GameControl.disableControls();

                ViewportAnimation.play(
                    "heal.webm",
                    {
                        onFlashed: () => {
                            const { leaderHealed, partyHealed } = performHeal();

                            if (! leaderHealed && ! partyHealed) {
                                updateBattleLog(
                                    `The strange glowing floor tile ` +
                                    `<span class="enemy">simply evaporates` +
                                    `</span> as your toes graze the ` +
                                    `dungeon floor. <em>Whelp...</em>`
                                );

                                return;
                            }

                            const healed =
                                ( leaderHealed ? "you" : "" ) +
                                ( leaderHealed && partyHealed ? " and " : "") +
                                ( partyHealed ? "your party" : "");

                            updateBattleLog(
                                `An oddly colored, perfectly square ` +
                                `floor tile <span class="friendly">` +
                                `heals ${healed}!</span>`
                            );
                        },
                        onEnd: () => {
                            console.info("Playback complete!");
                            GameControl.enableControls();
                            this.die();
                            render();
                        },
                    }
                );
            } else {
                console.log(
                    `🏁 Entered by ${entity.id}`,
                    { gameMap, entity, entered: this }
                );

                // @TODO Make this a proximity sound
                playSFX("healingTile");
                performHeal();
                this.die();
            }
        };

        return healingTile;
    },

    /**
     * TREASURE CHEST
     */
    treasureChest: function(x, y) {
        const treasureChest = MapEntityBuilder("treasureChest", x, y);
        treasureChest.getDisplayName = () => "🎁 Treasure Chest";
        treasureChest.getDisplayCharacter = () => "T";
        treasureChest.targetCheck = () => {};

        treasureChest.onTouch = function(gameMap, entity) {
            if (entity?.type === "player") {
                const treasureChest = this;
                menu.open("treasureChest", { treasureChest });
            } else {
                console.log(
                    `🏁 Touched by ${entity.id}`,
                    { gameMap, entity, touched: this }
                );
            }
        };

        treasureChest.open = function(entity) {
            if (this.party.length > 0) {
                if (entity?.type === "player") {
                    menu.closeAll();
                    updateBattleLog(
                        `Holy shit! It was actually a <span class="enemy">` +
                        `MIMIC</span>!!!`
                    );

                    BattleSystem.startEncounter(
                        entity,
                        this,
                        // Surprise attack unless the player already knows that
                        // this is a mimic from a previous encounter
                        this.encounteredByPlayer ? null : "enemy"
                    );
                } else {
                    entity.die();
                }
            } else {
                this.plunder(entity);
            }
        };

        // @TODO Handle phrasing for multiple of the same item/weapon/etc
        // Eg: "12 cups of lean"
        treasureChest.plunder = function(entity) {
            const actorInventory = entity.inventory.contents;
            const treasure = this.getFullInventoryContents();
            const transferredContents = [];

            if (treasure?.bitcoins > 0) {
                transferredContents.push(
                    `<span class="BTC">₿ ${treasure.bitcoins}</span>`
                );
                entity.inventory.giveBitcoins(treasure.bitcoins);
            }

            for (const weaponId in treasure.weapons) {
                const weapon = WEAPONS?.[weaponId];
                if (! weapon) {
                    console.error(
                        "Treasure chest has an unknown weapon",
                        { weaponId }
                    );
                    continue;
                }

                transferredContents.push(
                    `${weapon.article} <span class="friendly">${weapon.name}` +
                    `</span>`
                );

                actorInventory.weapons[weaponId] =
                    (actorInventory.weapons[weaponId] || 0) +
                    treasure.weapons[weaponId];
            }

            for (const armorId in treasure.armor) {
                const armor = ARMOR[armorId];
                if (! armor) {
                    console.error(
                        "Treasure chest has an unknown piece of armor",
                        { armorId }
                    );
                    continue;
                }

                transferredContents.push(
                    `${armor.article} <span class="friendly">${armor.name}` +
                    `</span>`
                );

                actorInventory.armor[armorId] =
                    (actorInventory.armor[armorId] || 0) +
                    treasure.armor[armorId];
            }

            for (const ringId in treasure.rings) {
                const ring = RINGS[ringId];
                if (! ring) {
                    console.error(
                        "Treasure chest has an unknown ring",
                        { ringId }
                    );
                    continue;
                }

                transferredContents.push(
                    `${ring.article} <span class="friendly">${ring.name}` +
                    `</span>`
                );

                actorInventory.rings[ringId] =
                    (actorInventory.rings[ringId] || 0) +
                    treasure.rings[ringId];
            }

            if (entity?.type === "player") {
                if (transferredContents.length === 0) {
                    updateBattleLog(randomEntry([
                        `Inside the chest, you find a piece of paper that ` +
                            `says: "IOU one piece of treasure."`,
                        `The chest is full of nothing but crusty issues of ` +
                            `Hustler Magazine. You decide to just close the ` +
                            `lid.`,
                        `You discover that the chest has been pre-plundered. ` +
                            `How convenient!`,
                    ]));
                } else if (transferredContents.length === 1) {
                    updateBattleLog(
                        `Inside the chest, you find ${transferredContents[0]}!`
                    );
                } else {
                    const contentsList = `<ul>` +
                        transferredContents.map(e => `<li>${e}</li>`) + `</ul>`;

                    updateBattleLog(
                        `<div>Inside the chest, you find:${contentsList}</div>`
                    );
                }
            }

            this.die(entity);
        }

        return treasureChest;
    },
}
