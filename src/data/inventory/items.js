"use strict";

// Definitions for all consumable items in the game
const ITEMS = Object.freeze({
    canOfHamms: {
        article: "a",
        name: "CAN OF HAMM'S",
        description:
            "A warm can of beer. Delicious..?",
        usage: {
            availability: ["exploration", "battle"],
            uiRoute: null,
            consumedAfterUse: true,
        },
        use: (actorMember, targetMember, context = {}) => {
            const target = targetMember ?? actorMember;
            if (! target || target.isDead()) {
                console.warn("Dead don't drink", { actorMember, targetMember });
                return false;
            }

            const healAmount = 5;

            if (! target.heal(healAmount)) {
                console.warn(
                    "Failed to heal party member with a delicious beverage",
                    { actorMember, target }
                );
                return false;
            }

            const usedOnSelf = actorMember.id === target.id;
            let message = "";

            if (playerEntity.leader.id === actorMember.id) {
                message = usedOnSelf
                    ?   `You <span class="action">chug a can,</span> filling ` +
                        `your mouth with `
                    :   `You <span class="action">force-feed</span> ` +
                        `<span class="friendly">${target.name}</span>, ` +
                        `filling the poor feller's mouth with `;
            } else {
                message = usedOnSelf
                    ?   `<span class="friendly">${actorMember.name}</span> ` +
                        `chugs a can of Hamm's, eagerly guzzling `
                    :   `<span class="friendly">${actorMember.name}</span> ` +
                        `pops the tab and slams the can into ` +
                        `<span class="friendly">` +
                        `${target.name}'s</span> face, its gullet ` +
                        `flooding with `;
            }

            message += `the flavor of ` +
                `${waveText("boiled socks.", "END").outerHTML} ` +
                `<span class="good">+${healAmount} HP</span>`

            updateBattleLog(message);

            if (BattleSystem.isActive) {
                BattleSystem.nextMove();
            }

            return true;
        },
        merchantStockChance: 0.9,
        chestDrop: true,
        weight: 0.4,
        price: 10,
    },
    cupOfLean: {
        article: "a",
        name: "CUP OF LEAN",
        description:
            "A crusty styrofoam cup filled with a strange purple syrup.",
        usage: {
            availability: ["exploration", "battle"],
            uiRoute: null,
            consumedAfterUse: true,
        },
        use: (actorMember, targetMember, context = {}) => {
            const target = targetMember ?? actorMember;
            if (! target || target.isDead()) {
                console.warn("Dead don't drink", { actorMember, targetMember });
                return false;
            }

            const healAmount = 20;

            if (! target.heal(healAmount)) {
                console.warn(
                    "Failed to heal party member with a cup of syrup",
                    { actorMember, target }
                );
                return false;
            }

            playSFX("lean");

            const usedOnSelf = actorMember.id === target.id;
            const healHtml = `<span class="good">+${healAmount} HP</span>`;
            let message = "";

            // Trigger the 20-second visual effect if the player is the target
            // @TODO Tie this into a time-based status effect
            if (target.id === playerEntity.leader.id) {
                const $game = document.getElementById("game");
                $game.classList.add("lean-effect");
                setTimeout(() => $game.classList.remove("lean-effect"), 20000);
            }

            if (playerEntity.leader.id === actorMember.id) {
                message = usedOnSelf
                    ?   `Your stomach feels nauseous, but your head ` +
                        `feels great! ${healHtml}`
                    :   `You <span class="action">double dare</span> ` +
                        `<span class="friendly">` +
                        `${target.name}</span> to drink the ` +
                        `styrofoam's syrup, and they actually did it. Damn. ` +
                        `${healHtml}`;
            } else {
                message = usedOnSelf
                    ?   `Like a true believer of The Peoples Temple, ` +
                        `<span class="friendly">${actorMember.name}</span> ` +
                        `<span class="action">drinks the lean</span> without ` +
                        `a second thought! ${healHtml}`
                    :   `<span class="friendly">${actorMember.name}</span> ` +
                        `forces <span class="friendly">${target.name}` +
                        `</span> to sip the sauce! ${healHtml}`;
            }

            updateBattleLog(message);

            if (BattleSystem.isActive) {
                BattleSystem.nextMove();
            }

            return true;
        },
        merchantStockChance: 0.6,
        chestDrop: true,
        weight: 0.8,
        price: 20,
    },
    glassOfToiletWater: {
        article: "a",
        name: "GLASS OF TOILET WATER",
        description:
            "A glass filled to the rim with toilet water, extracted from the " +
            "toilet bowl belonging to a Keeper. The glass has a rather " +
            "badass sticker of a skeleton riding a motorcycle neatly " +
            "applied...",
        usage: {
            availability: ["exploration", "battle"],
            uiRoute: null,
            consumedAfterUse: true,
        },
        use: (actorMember, targetMember, context = {}) => {
            const target = targetMember ?? actorMember;
            if (! target || target.isDead()) {
                console.warn("Dead don't drink", { actorMember, targetMember });
                return false;
            }

            const healAmount = 50;

            if (! target.heal(healAmount)) {
                console.warn(
                    "Failed to heal party member with a cup of syrup",
                    { actorMember, target }
                );
                return false;
            }

            const usedOnSelf = actorMember.id === target.id;
            const healHtml = `<span class="good">+${healAmount} HP</span>`;
            let message = "";

            if (playerEntity.leader.id === actorMember.id) {
                message = usedOnSelf
                    ?   `Sickeningly delicious...? You question your current ` +
                        `state of mind for a moment. ${healHtml}`
                    :   `You hand the cup of toilet tonic over to ` +
                        `<span class="friendly">${target.name}</span> ` +
                        `who drinks it without a second thought. ${healHtml}`;
            } else {
                message = usedOnSelf
                    ?   `<span class="friendly">${actorMember.name}</span> ` +
                        `<span class="action">sups the cup</span> without ` +
                        `throwing up! ${healHtml}`
                    :   `<span class="friendly">${actorMember.name}</span> ` +
                        `<span class="action">throws the cup of toilet water` +
                        `</span> into <span class="friendly">` +
                        `${target.name}'s</span> slack-jawed mouth! ` +
                        `${healHtml}`;
            }

            updateBattleLog(message);

            if (BattleSystem.isActive) {
                BattleSystem.nextMove();
            }

            return true;
        },
        merchantStockChance: .4,
        chestDrop: true,
        weight: 1.2,
        price: 30,
    },
    alaskaRaisins: {
        article: "some",
        name: "ALASKA RAISINS",
        description:
            "Holy shit! It's the Alaska Raisins!",
        usage: {
            availability: ["exploration", "battle"],
            uiRoute: null,
            consumedAfterUse: true,
        },
        use: (actorMember, targetMember, context = {}) => {
            const target = targetMember ?? actorMember;
            if (! target || target.isDead()) {
                console.warn("Dead don't drink", { actorMember, targetMember });
                return false;
            }

            const healAmount = 70;

            if (! target.heal(healAmount)) {
                console.warn(
                    "Failed to heal party member with a box of dried grapes",
                    { actorMember, target }
                );
                return false;
            }

            const usedOnSelf = actorMember.id === target.id;
            const healHtml = `<span class="good">+${healAmount} HP</span>`;
            let message = "";

            if (playerEntity.leader.id === actorMember.id) {
                message = usedOnSelf
                    ?   `The Alaska Raisins sing a lovely song about how ` +
                        `epic igloos are as you pop them into your mouth one ` +
                        `by one. You can still hear them singing in your ` +
                        `stomach... ${healHtml}`
                    :   `You hand the box of raisins over to ` +
                        `<span class="friendly">${target.name}</span> ` +
                        `who eats them promptly, cardboard and all! ` +
                        `${healHtml}`;
            } else {
                message = usedOnSelf
                    ?   `<span class="friendly">${actorMember.name}</span> ` +
                        `<span class="action">devours the raisins</span> in ` +
                        `an instant! You could swear you heard tiny little ` +
                        `screams... ${healHtml}`
                    :   `<span class="friendly">${actorMember.name}</span> ` +
                        `presents the raisins to <span class="friendly">` +
                        `${target.name}</span>. The raisins look and ` +
                        `taste like clay, but they are consumed anyways. ` +
                        `${healHtml}`;
            }

            updateBattleLog(message);

            if (BattleSystem.isActive) {
                BattleSystem.nextMove();
            }

            return true;
        },
        merchantStockChance: .35,
        chestDrop: true,
        weight: 1.5,
        price: 45,
    },
    dowsingRod: {
        article: "a",
        name: "DOWSING ROD",
        description:
            "A Y-shaped stick. Reveals the exit of the current floor.",
        usage: {
            availability: ["exploration"],
            uiRoute: null,
            consumedAfterUse: true,
        },
        use: (actorMember, targetMember, context = {}) => {
            const exit = MAP.entities.find(e => e.type === "exit");
            if (! exit) {
                updateBattleLog(`The dowsing rods fail to point anywhere.`);
                return false;
            }

            if (MAP.isExplored(exit.x, exit.y)) {
                updateBattleLog(
                    `You should try looking a little bit closer at your map, ` +
                    `bub. <span class="action">The exit is already visible!` +
                    `</span>`
                );
                return false;
            }

            MAP.revealSpot(exit.x, exit.y, 1);
            updateBattleLog(
                `<span class="friendly">The exit has been revealed!</span>`
            );
            render();

            if (BattleSystem.isActive) {
                BattleSystem.nextMove();
            }

            return true;
        },
        merchantStockChance: 0.8,
        chestDrop: true,
        weight: 1.2,
        price: 15,
    },
    torch: {
        article: "a",
        name: "TORCH",
        description:
            "An unlit torch. Using it will reveal the map of the current " +
            "floor.",
        usage: {
            availability: ["exploration"],
            uiRoute: null,
            consumedAfterUse: true,
        },
        use: (actorMember, targetMember, context = {}) => {
            if (playerEntity.isHoldingTorch) {
                updateBattleLog(
                    `Uh, do you not <em>SEE</em> the torch that ` +
                    `<span class="action">you are already holding?</span>`
                );
                return false;
            }

            playSFX("torch");
            MAP.reveal();
            updateBattleLog(
                `<span class="friendly">Lo, the way has been made clear!</span>`
            );
            animTorchStart();
            render();

            if (BattleSystem.isActive) {
                BattleSystem.nextMove();
            }

            return true;
        },
        merchantStockChance: 0.8,
        chestDrop: true,
        weight: 0.9,
        price: 40,
    },
    brickOfC4: {
        article: "a",
        name: "BRICK OF C-4",
        description:
            "An incendiary plastic explosive. Great for turning anything " +
            "into nothing real quick!",
        usage: {
            availability: ["exploration", "battle"],
            uiRoute: null,
            consumedAfterUse: true,
        },
        // @TODO Make this work on all enemies
        use: (actorMember, targetMember, context = {}) => {
            const onExplode = BattleSystem.isActive
                // Brick of C4's battle usage
                ? () => {
                    const damagePoints = Math.max(
                        20,
                        Math.round(Math.random() * 10) * 5
                    );

                    const targetWasDamaged = targetMember?.damage(damagePoints);

                    if (targetWasDamaged) {
                        const actorIsEnemy =
                            actorMember.parent.id !== playerEntity.id;
                        const attackedOwnTeammate =
                            actorMember.parent.id === targetMember.parent.id;

                        const damageHtml =
                            `<span class="bad">${damagePoints} HP</span>`;

                        if (actorIsEnemy) {
                            const message = attackedOwnTeammate
                                ?   `Like a déjà vu 9/11, ` +
                                    `<span class="action">` +
                                    `${actorMember.name} blows up their own ` +
                                    `teammate!</span> <span class="enemy">` +
                                    `${targetMember.name}</span> suffers ` +
                                    `${damageHtml}!`
                                :   `${actorMember.name} exploded the shit ` +
                                    `out of <span class="friendly">` +
                                    `${targetMember.name}</span> for ` +
                                    `${damageHtml}!!!`;

                            updateBattleLog(message);
                        } else {
                            const actorIsPlayer =
                                actorMember.id === playerEntity.leader.id;

                            if (actorIsPlayer) {
                                const message = attackedOwnTeammate
                                    ?   `Good job, asshole! ` +
                                        `<span class="action">You blew up ` +
                                        `your own teammate!</span> ` +
                                        `<span class="friendly">` +
                                        `${targetMember.name}</span> suffers ` +
                                        `${damageHtml}!`
                                    :   `<span class="friendly">You</span> ` +
                                        `exploded the shit out of ` +
                                        `<span class="enemy">` +
                                        `${targetMember.name}</span> for ` +
                                        `${damageHtml}!!!`;

                                updateBattleLog(message);
                            } else {
                                const message = attackedOwnTeammate
                                    ?   `<span class="friendly">` +
                                        `${actorMember.name}</span> blew up ` +
                                        `<span class="enemy">their own ` +
                                        `teammate!</span> ` +
                                        `<span class="friendly">` +
                                        `${targetMember.name}</span> suffers ` +
                                        `${damageHtml}!`
                                    :   `${actorName} exploded the shit out ` +
                                        `of <span class="enemy">` +
                                        `${targetMember.name}</span> for ` +
                                        `${damageHtml}!!!`;

                                updateBattleLog(message);
                            }
                        }
                    } else {
                        updateBattleLog(
                            `${actorMember.name} set off a bomb, but managed ` +
                            `to not affect anything in range. How do you ` +
                            `even <em>do</em> that?`
                        );
                    }

                    if (targetMember.isDead()) {
                        playSFX("scream");
                    }
                }
                // Brick of C4's normal usage outside of battle
                : () => {
                    const explosionDepth = 3;
                    let xMin = playerEntity.x;
                    let xMax = playerEntity.x;
                    let yMin = playerEntity.y;
                    let yMax = playerEntity.y;

                    switch (DIRECTIONS[playerEntity.direction]) {
                        case "N":
                            xMin--;
                            xMax++;
                            yMin -= explosionDepth;
                            break;
                        case "E":
                            yMin--;
                            yMax++;
                            xMax += explosionDepth;
                            break;
                        case "S":
                            xMin--;
                            xMax++;
                            yMax += explosionDepth;
                            break;
                        case "W":
                            yMin--;
                            yMax++;
                            xMin -= explosionDepth;
                            break;
                    }

                    for (let y = yMin; y <= yMax; y++) {
                        for (let x = xMin; x <= xMax; x++) {
                            const cell = MAP.getCell(x, y);
                            cell.onExplode?.(MAP, playerEntity);
                            cell.isExplored = true;
                        }
                    }

                    GameControl.update();
                    updateBattleLog(
                        `<span class="action">KABOOM!</span> The dungeon ` +
                        `walls crumble like charred toast!`
                    );
                    render();
                };

            ViewportAnimation.play(
                "explosion.webm",
                {
                    onExplode,
                    onEnd: () => {
                        console.info("Playback complete!");
                        render();

                        if (BattleSystem.isActive) {
                            BattleSystem.nextMove();
                        }
                    },
                }
            );

            return true;
        },
        merchantStockChance: 0.7,
        chestDrop: true,
        weight: 2,
        price: 120,
    },

    tromBone: {
        article: "a",
        name: "TROM-BONE",
        description:
            "A trom-BONE. It sounds like a trombone, looks like a trombone, " +
            "but is somehow... on the bonier side of things.",
        usage: {
            availability: ["exploration"],
            uiRoute: null,
            consumedAfterUse: true,
        },
        use: (actorMember, targetMember, context = {}) => {
            // @TODO Add this as a game flag
            if (tromboneIsPlaying) {
                updateBattleLog(
                    `<span class="action">You're already playing the fucking ` +
                    `trom-BONE!</span>`
                );
                return false;
            }

            tromboneIsPlaying = true;
            const tromboneShouldReenableMusic = music.isEnabled();
            if (tromboneShouldReenableMusic) {
                music.disable();
            }

            animTromboneStart();
            sfx.tromBone.currentTime = 0;
            sfx.tromBone.play();
            sfx.tromBone.onended = () => {
                tromboneIsPlaying = false;
                animTromboneEnd();

                if (tromboneShouldReenableMusic) {
                    music.enable();
                }

                if (BattleSystem.isActive) {
                    // @TODO Fix the music
                    /*
                    currentEnemy?.id === "vampire"
                        ? music.play(
                            "vampireBattleMainLoop",
                            "battle"
                        )
                        : music.playRandom("battle");
                    */
                } else {
                    music.resumeTag("exploration");
                }
            };
            updateBattleLog(
                "You play a trom-BONE. It sounds like a  trombone, but " +
                "somehow... bonier. Not very strong bone though. It shatters " +
                "in your hands after you play your song. It was good while " +
                "it lasted."
            );

            return true;
        },
        merchantStockChance: 1.0,
        chestDrop: true,
        weight: 1.3,
        price: 5,
    },

    carrierPigeon: {
        article: "a",
        name: "CARRIER PIGEON",
        description:
            "A pigeon trained to carry messages. Sends a message to the next " +
            "adventurer.",
        usage: {
            availability: ["exploration"],
            uiRoute: {
                path: "inputBox",
                options: {
                    placeholder: "Your message to the next adventurer...",
                    maxLength: 100,
                },
            },
            consumedAfterUse: true,
        },
        use: async (actorMember, targetMember, context = {}) => {
            if (BattleSystem.isActive) {
                updateBattleLog(
                    `<span class="enemy">You cannot send a carrier pigeon ` +
                    `during combat.</span>`
                );

                return false;
            }

            if (! context.message) {
                updateBattleLog(
                    `<span class="enemy">You cannot send an empty message!` +
                    `</span> Try typing something first.`
                );
                return false;
            }

            const messageSent = await PigeonMessaging.send(context.message);

            if (! messageSent) {
                updateBattleLog(
                    `<span class="enemy">Failed to send the pigeon message!` +
                    `</span> Your message of <span class="good">&quot;` +
                    `${context.message}&quot;</span> could not be delivered. ` +
                    `Try again later.`
                );
                return false;
            }

            // @TODO Add the pigeon voice. Voices require party members
            updateBattleLog(
                `<span class="good">Your message has been sent!</span> ` +
                `${waveText("Coo coo!", "friendly").outerHTML}`
            );

            return true;
        },
        merchantStockChance: 1,
        chestDrop: false,
        weight: 1,
        price: 10,
    },

    phialOfSeed: {
        article: "a",
        name: "PHIAL OF SEED",
        description:
            "Seed that you can inject into your humble friends! Heals a " +
            "party member by 40% of their max HP.",
        usage: {
            availability: ["exploration", "battle"],
            uiRoute: {
                path: "playerPartyPicker",
                options: {
                    includeLeader: false,
                    partyMemberFilter: e =>
                        ! e.isDead() &&
                        e.stats.core.hp < e.stats.core.maxHp
                },
            },
            consumedAfterUse: true,
        },
        // @TODO Implement functionality, including both the onscreen UI and
        //       the menu system
        use: (actorMember, targetMember, context = {}) => {
            if (! targetMember) {
                // @TODO Handle party member selection if the actor is the player
                return false;
            }

            if (targetMember.id === playerEntity.leader.id) {
                const messagePrefix = actorMember.id === playerEntity.leader.id
                    ? "You consider chugging the phial,"
                    : `${actorMember.name} tries to feed you a phial of seed,`;

                updateBattleLog(
                    `${messagePrefix} but the smell alone makes your stomach ` +
                    `${waveText("churn in disgust.", "END").outerHTML}`
                );

                return false;
            }

            // % of max HP gained from consuming PHIAL OF SEED
            const healAmount = Math.ceil(targetMember.stats.core.maxHp * 0.4);
            targetMember.heal(healAmount);
            const targetIsAtFullHealth =
                targetMember.stats.core.hp === targetMember.stats.core.maxHp;

            const actorIsPlayer = actorMember.id === playerEntity.leader.id;
            const actorPrefix = actorIsPlayer
                ? `You give`
                : `${actorMember.name} gives`;

            const healDescriptionHtml = targetIsAtFullHealth
                ? `<span class="good">${actorIsPlayer ? "bring" : "brings"} ` +
                    `them to full health!</span>`
                : `<span class="HP">heal them</span> by <span class="good">` +
                    `+${healAmount} HP!</span>`;

            playSFX("healParty");

            updateBattleLog(
                `${actorPrefix} ${ITEMS.phialOfSeed.article} ` +
                `<span class="friendly">${ITEMS.phialOfSeed.name}</span> to ` +
                `<span class="friendly">${targetMember.name}</span> and ` +
                `${healDescriptionHtml}`
            );

            return true;
        },
        merchantStockChance: 0.8,
        chestDrop: true,
        weight: 0.4,
        price: 15,
    },

    lodeGun: {
        article: "a",
        name: "LODE GUN",
        description:
            "A single-shot cannon that fires a heavy projectile. With almost "+
            "no range, this is impractical as a weapon. But it is great for " +
            "blasting holes in floors, I guess.",
        usage: {
            availability: ["exploration"],
            uiRoute: null,
            consumedAfterUse: true,
        },
        use: (actorMember, targetMember, context = {}) => {
            if (BattleSystem.isActive) {
                updateBattleLog(
                    `You want to use a gun in battle? Don't be ridiculous!`
                );

                return false;
            }

            const actorEntity = actorMember.parent;
            const { x, y } = actorEntity.getCoordinateInFront();
            const targetCell = MAP.getCell(x, y);

            const specialBlockedType = targetCell.entities.find(e =>
                ["exit", "pit", "sigil"].includes(e.type)
            )?.type;

            switch (specialBlockedType) {
                case "exit":
                    updateBattleLog(
                        `You reconsider your brillian decision of trying ` +
                        `to <span class="enemy">destroy the fucking exit.` +
                        `</span>`
                    );
                    return false;
                case "pit":
                    updateBattleLog(
                        `<span class="enemy">There's already a hole</span> ` +
                        `in front of you, <em>genius.</em>`
                    );
                    return false;
                case "sigil":
                    updateBattleLog(
                        `<span class="enemy">A mysterious force</span> ` +
                        `prevents you from firing the ` +
                        `<span class="friendly">Lode Gun</span> here.`
                    );
                    return false;
            }

            const canFireLodeGun =
                ! targetCell.isWall &&
                ! targetCell.entities.some(e =>
                    e.type !== "bouldingBall" &&
                    typeof e.onTouch === "function"
                );

            if (! canFireLodeGun) {
                updateBattleLog(
                    `There <span class="action">isn't enough clearance` +
                    `</span> to use the <span class="friendly">Lode Gun!</span>`
                );

                return false;
            }

            ViewportAnimation.play(
                "lode-gun.webm",
                {
                    onGroundImpact: () => {
                        document.getElementById("interface")?.classList
                            .add("rumble");
                        const pit = MapEntityFeatureFactory.pit(x, y);
                        pit.closeAfterTurns = 3;
                        actorEntity.gameMap.addEntity(pit);
                        actorEntity.gameMap.triggerOnEnterEvent(pit);
                    },
                    onHoleFormed: () => {
                        render();
                    },
                    onEnd: () => {
                        document.getElementById("interface")?.classList
                            .remove("rumble");
                    },
                }
            );

            return true;
        },
        merchantStockChance: 1.0,
        chestDrop: true,
        weight: 3,
        price: 20,
    },
});
