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
        exit.getSceneArtId = () => "exit";
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
        healingTile.getSceneArtId = () => "healingTile";
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
     * CRATER
     */
    crater: function(x, y) {
        const crater = MapEntityBuilder("crater", x, y);
        crater.getDisplayName = () => "⚫️ Crater";
        crater.getDisplayCharacter = () => "●";
        crater.getSceneArtId = () => "crater";

        return crater;
    },

    /**
     * BLOODY CRATER
     */
    bloodyCrater: function(x, y) {
        const bloodyCrater = MapEntityBuilder("bloodyCrater", x, y);
        bloodyCrater.getDisplayName = () => "🔴 Bloody Crater";
        bloodyCrater.getDisplayCharacter = () => "◌";
        bloodyCrater.getSceneArtId = () => "bloodyCrater";

        return bloodyCrater;
    },

    /**
     * TREASURE CHEST
     */
    treasureChest: function(x, y) {
        const treasureChest = MapEntityBuilder("treasureChest", x, y);
        treasureChest.getDisplayName = () => "🎁 Treasure Chest";
        treasureChest.getDisplayCharacter = () => "T";
        treasureChest.getSceneArtId = () => "treasureChest";
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

        treasureChest.onExplode = function(gameMap, entity) {
            const treasureChestWasMimic = this.leader?.type === "mimic";
            const killedByPlayer = entity.id === playerEntity.id;

            if (treasureChestWasMimic) {
                const treasure = this.getFullInventoryContents();
                playSFX("scream");

                if (killedByPlayer) {
                    updateBattleLog(
                        `<span class="action">WHAT THE FUCK? That was a ` +
                        `mimic?!</span> You obtained <span class="BTC">₿ ` +
                        `${treasure.bitcoins}</span> from the intestines ` +
                        `spilled from its gaping maw.`
                    );
                }

                entity.inventory.giveBitcoins(treasure.bitcoins);

                const bloodyCrater =
                    MapEntityFeatureFactory.bloodyCrater(this.x, this.y);
                gameMap.addEntity(bloodyCrater);
            } else {
                if (killedByPlayer) {
                    updateBattleLog(
                        `Gee willikers! You just <span class="action">` +
                        `destroyed</span> a <span class="friendly">perfectly ` +
                        `good treasure chest!</span> Oh well.</span>`
                    );
                }

                const crater = MapEntityFeatureFactory.crater(this.x, this.y);
                gameMap.addEntity(crater);
            }

            this.die(entity);
        };

        return treasureChest;
    },

    /**
     * DESTROYED TREASURE CHEST
     */
    destroyedTreasureChest: function(x, y) {
        const destroyedTreasureChest =
            MapEntityBuilder("destroyedTreasureChest", x, y);
        destroyedTreasureChest.getDisplayName =
            () => "🪹 Destroyed Treasure Chest";
        destroyedTreasureChest.getDisplayCharacter = () => "◌";
        destroyedTreasureChest.getSceneArtId = () => "destroyedTreasureChest";

        destroyedTreasureChest.onExplode = function(gameMap, entity) {
            this.die(entity);
        };

        return destroyedTreasureChest;
    },

    /**
     * SIGIL
     */
    sigil: function(x, y) {
        const sigil = MapEntityBuilder("sigil", x, y);
        sigil.getDisplayName = () => "✡️ Sigil";
        sigil.getDisplayCharacter = () => "✡";
        sigil.getSceneArtId = () => "sigil";

        return sigil;
    },

    /**
     * PIT
     */
    pit: function(x, y) {
        const pit = MapEntityBuilder("pit", x, y);
        pit.getDisplayName = () => "🕳️ Pit";
        pit.getDisplayCharacter = () => "●";
        pit.getSceneArtId = () => "pit";
        pit.onEnter = function(gameMap, entity) {
            if (entity.leader.traits.isFlying) {
                return;
            }

            console.log("onEnter()", { entity });
            if (entity?.type === "player") {
                music.stop();
                animTorchEnd();
                Portrait.show("death");
                GameControl.disableControls();

                document.getElementById("game").classList
                    .add("descendingIntoFloor");
                document.getElementById("viewport").classList
                    .add("playerFellIntoAPitAndDied");
                updateBattleLog(
                    `<span class="action">AUUUUUGH!</span> You scream out as ` +
                    `you plunge into a pit waiting beneath!`
                );

                playSFX("floorBreakScreamDie");
                playerEntity.die(this);
            } else {
                playSFX("pitDrop");
                const interfaceClassList =
                    document.getElementById("interface")?.classList;

                // @TODO Maybe make this its own weaker rumble
                if (interfaceClassList) {
                    setTimeout(() => interfaceClassList.add("rumble"), 700);
                    setTimeout(() => interfaceClassList.remove("rumble"), 1600);
                }

                console.log(
                    `🕳️ ${entity.leader.name} fell into a pit`,
                    { entity, gameMap }
                );
                entity.die(this);
            }
        };

        return pit;
    },

    /**
     * CRACKED FLOOR
     */
    crackedFloor: function(x, y) {
        const crackedFloor = MapEntityBuilder("crackedFloor", x, y);

        crackedFloor.crackedLevel = 1;
        crackedFloor.getDisplayName = function() {
            switch (this.crackedLevel) {
                case 1:
                    return "🚧 Slightly-Cracked Floor";
                case 2:
                    return "⚠️ Cracked Floor";
                case 3:
                    return "⚠️ Severely-Cracked Floor";
                default:
                    return "🚧 Ambiguously-Cracked Floor";
            }
        };

        crackedFloor.getDisplayCharacter = function() {
            return this.crackedLevel === 3 ? "✖" : "✕";
        };

        crackedFloor.getSceneArtId = function() {
            switch (this.crackedLevel) {
                case 1:
                    return "crackedFloorSlight";
                case 2:
                    return "crackedFloor";
                case 3:
                    return "crackedFloorSevere";
                default:
                    return "crackedFloorSlight";
            }
        };

        crackedFloor.onEnter = function(gameMap, entity) {
            if (entity.leader.traits.isFlying) {
                return;
            }

            console.log("onEnter()", { entity });

            this.crackedLevel += ({
                normal: 1,
                warning: 2,
                danger: 3,
            })[entity.getWeightLevel()] || 0;

            if (this.crackedLevel > 3) {
                const pitOfSpikes =
                    MapEntityFeatureFactory.pitOfSpikes(this.x, this.y);

                if (entity?.type === "player") {
                    updateBattleLog(
                        `The flimsy floor collapses beneath your feet!`
                    );
                }

                gameMap.addEntity(pitOfSpikes);
                this.die(entity);

                gameMap.triggerOnEnterEvent(pitOfSpikes);
            } else if (entity?.type === "player") {
                const cautionText = this.crackedLevel > 1
                    ? " It would be a good idea to avoid stepping here again."
                    : "";
                const message =
                    `<span class="action">The floor cracks under your feet!` +
                    `</span>${cautionText}`;

                updateBattleLog(message);
            }
        };

        return crackedFloor;
    },

    /**
     * BOULDING BALL
     */
    bouldingBall: function(x, y) {
        const bouldingBall = MapEntityBuilder("bouldingBall", x, y);
        MapEntityTrait_AttachRealtimeMovement_BackAndForth(bouldingBall);

        bouldingBall.getDisplayName = () => "🪨 Boulding Ball";
        // Empty character because this is styled by a CSS rule
        bouldingBall.getDisplayCharacter = () => " ";
        bouldingBall.getSceneArtId = () => "bouldingBall";

        bouldingBall.onTouch = function(gameMap, entity) {
            if (entity.leader?.traits.isFlying) {
                return;
            }

            if (entity.type === "bouldingBall") {
                this.turnAround();
                entity.turnAround();
            }
        };

        bouldingBall.onEnter = function(gameMap, entity) {
            if (entity.leader?.traits.isFlying) {
                return;
            }

            console.log("onEnter()", { entity });

            if (entity?.type === "player") {
                playSFX("bouldingBallStrike");
                animBouldingBallStrike();

                const damageValues = entity.damagePartyFractional(1 / 3);
                const damageMessage =
                    `<span class="action">YEOUCH!</span> A vicious, ` +
                    `bloodthirsty Boulding Ball takes 1/3rd of your party's ` +
                    `health!`;

                const damageList = `<ul>` + (
                    damageValues.map(e => {
                        const { partyMemberId, damageHp } = e;

                        const partyMember = playerEntity.party
                            .find(p => e.id === partyMemberId);

                        if (! partyMember) {
                            return "";
                        }

                        const hpMessage = `${partyMember.name} lost ` +
                            `<span class="enemy">${damageHp}</span>`;

                        const diedMessage = partyMember.isDead()
                            ? ` and <strong>died!</strong>`
                            : "";

                        return `<li>${hpMessage}${diedMessage}</li>`;
                    }).filter(e => e).join("")
                ) + `</ul>`;
            } else if (entity.leader) {
                // Calculate distance-based scream volume
                const distance =
                    Math.abs(playerEntity.x - entity.x) +
                    Math.abs(playerEntity.y - entity.y);

                    const maxRange = 10;
                    const maxVolume = 1;
                    const minVolume = 0.1;

                const volume = distance <= maxRange
                    ? Math.max(
                        minVolume,
                        maxVolume -
                            ((distance - 1) / (maxRange - 1)) *
                                (maxVolume - minVolume))
                    : 0; // No sound if too far

                playSFX("scream", volume);
                playSFX("bouldingBallStrike", volume);

                entity.die(this);
            } else if (entity.type === "treasureChest") {
                const destroyedTreasureChest = MapEntityFeatureFactory
                    .destroyedTreasureChest(entity.x, entity.y);
                entity.gameMap.addEntity(destroyedTreasureChest);
                entity.die(this);
            }
        };

        bouldingBall.onExplode = function(gameMap, entity) {
            const killedByPlayer = entity.id === playerEntity.id;

            if (killedByPlayer) {
                updateBattleLog(
                    `You reduced the boulding ball into ` +
                    `<span class="action">dust!</span>`
                );
            }

            this.die(entity);
        };

        return bouldingBall;
    },
}
