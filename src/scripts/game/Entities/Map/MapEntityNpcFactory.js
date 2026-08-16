"use strict";

/**
 * This factory is used to create TardQuest's NPCs
 * @TODO Give NPCs the ability to face in different directions
 */
const MapEntityNpcFactory = {
    /**
     * MERCHANT
     */
    merchant: function(x, y) {
        const merchant = MapEntityBuilder("merchant", x, y);

        merchant.getDisplayName = function() {
            return "🧙 Merchant";
        };

        merchant.getDisplayCharacter = () => "M";
        merchant.addPartyMember(TardQuestPartyMemberFactory.merchant());

        // Wares are not the same as the merchant's personal inventory
        merchant.wares = {
            items: [],
            weapons: Object.keys(WEAPONS),
            armor: Object.keys(ARMOR),
            rings: [],
        };

        let attempts = 0;

        do {
            merchant.wares.items = [];
            merchant.wares.rings = [];

            for (const key in ITEMS) {
                const item = ITEMS[key];
                const stockChance = item.merchantStockChance || 0;
                const merchantHasItem = Math.random() < stockChance;

                if (merchantHasItem) {
                    merchant.wares.items.push(key);
                }
            }

            for (const key in RINGS) {
                const ring = RINGS[key];
                const stockChance = ring.merchantStockChance || 0;
                const merchantHasRing = Math.random() < stockChance;

                if (merchantHasRing) {
                    merchant.wares.rings.push(key);
                }
            }

            if (attempts++ > 100) {
                console.error("Failed to stock merchant items", { attempts });
                break;
            }
        } while (
            merchant.wares.items.length === 0 ||
            merchant.wares.rings.length === 0
        );

        console.log("🧙 Merchant wares", { wares: merchant.wares });

        merchant.onTouch = function(gameMap, entity) {
            if (entity?.type === "player") {
                const merchant = this;
                menu.open("merchant", { merchant, wares: this.wares });
            } else {
                console.log(
                    `🏁 Touched by ${entity.id}`,
                    { gameMap, entity, touched: this }
                );
            }
        };

        merchant.getSalePrice = function(itemType, price) {
            if (typeof price !== "number") {
                console.error("Price is not a number", { itemType, price });
                return 0;
            }

            const factors = {
                weapon: 10,
                armor: 10,
                item: 5,
                ring: 5,
            };

            // Default to 10% of the original price
            const factor = factors[itemType] || 10;
            if (! Object.hasOwn(factors, itemType)) {
                console.error("Unknown item type", { itemType });
            }

            return Math.max(1, Math.floor(price / factor));
        };

        merchant.printTransactionMessage = function(
            transactionType,
            merchandise,
            priceBtc
        ) {
            if (! ["bought", "sold"].includes(transactionType)) {
                console.error(
                    "Unknown transaction type",
                    { transactionType, merchandise, priceBtc }
                );
                return;
            }

            // Add a space if an article is present
            const article =
                merchandise?.article ? `${merchandise.article} ` : '';

            const priceHtml = 
                `<span class="BTC">₿ ${priceBtc.toLocaleString(undefined)}` +
                `</span>`;

            updateBattleLog(
                `You ${transactionType} ${article}` +
                `<span class="friendly">${merchandise.name}</span> for ` +
                `${priceHtml}.`
            );
        };

        merchant.onExplode = function(gameMap, entity) {
            playSFX("scream");
            this.leader.say("AIEEEEEEEEEEEEEE!", false);

            const killedByPlayer = entity.id === playerEntity.id;

            if (killedByPlayer) {
                updateBattleLog(
                    `You <span class="action">fucking vaporized</span> the ` +
                    `<span class="friendly">merchant</span>!`
                );
            }

            const bloodyCrater =
                MapEntityFeatureFactory.bloodyCrater(this.x, this.y);
            bloodyCrater.getDisplayName = () =>
                "🔴 <em>Cleanup on aisle three...</em>";
            gameMap.addEntity(bloodyCrater);

            this.die(entity);
        };

        return merchant;
    },

    /**
     * GAMBLER
     */
    gambler: function(x, y) {
        const gambler = MapEntityBuilder("gambler", x, y);

        gambler.getDisplayName = function() {
            return "🐀 Gambler";
        };

        gambler.getDisplayCharacter = () => "G";
        gambler.addPartyMember(TardQuestPartyMemberFactory.gambler());

        gambler.onTouch = function(gameMap, entity) {
            if (entity?.type === "player") {
                const gambler = this;
                menu.open("gambler", { gambler });
            } else {
                console.log(
                    `🏁 Touched by ${entity.id}`,
                    { gameMap, entity, touched: this }
                );
            }
        };

        gambler.playPrice = 200;

        gambler.gamble = function(onFinish) {
            if (! playerEntity.inventory.takeBitcoins(this.playPrice)) {
                updateBattleLog(
                    `You need <span class="BTC">₿ ${this.playPrice}</span> ` +
                    `to play!`
                );

                onFinish?.();
                return;
            }

            updateBattleLog(
                `You hand the gambler <span class="BTC">₿ ${this.playPrice}` +
                `</span>. Let's hope it was worth it.`
            );

            document.getElementById("menu")?.classList.add("hidden");

            // Luck affects chance to roll a 12
            // Luck now works like persuasion: 0-100% chance to win (roll a 12)
            // Example: 32 luck = 32% chance at success
            const winChance =
                playerEntity.leader.getEffectiveCoreStat("luck") / 100;
            const roll12 = Math.random() < winChance;

            const dice = [6, 6];

            // Roll, but avoid double sixes
            if (! roll12) {
                do {
                    dice[0] = numberBetween(1, 6);
                    dice[1] = numberBetween(1, 6);
                } while (dice[0] === 6 && dice[1] === 6);
            }

            this.gambleAnimation(dice, () => {
                const sum = dice[0] + dice[1];
                const win = sum === 12;
                const sumClass = win ? "friendly" : "enemy";

                updateBattleLog(
                    `You rolled a ` +
                    `<span class="gambler">${dice[0]}</span> and a ` +
                    `<span class="gambler">${dice[1]}</span> for a sum of ` +
                    `<span class="${sumClass}">${sum}</span>`
                );

                if (win) {
                    const stat = randomEntry(["hp", "defense", "persuasion"]);

                    switch (stat) {
                        case "hp": {
                            const healthBoost =
                                5 + (Math.floor(Math.random() * 2) * 5);
                            playerEntity.leader.stats.core.maxHp += healthBoost;
                            playerEntity.leader.heal(healthBoost);
                            updateBattleLog(
                                `<span class="LV">You scored a health boost! ` +
                                `+${healthBoost} HP!</span>`
                            );
                            break;
                        }
                        case "defense": {
                            const defenseBoost =
                                1 + Math.floor(Math.random() * 2);
                            playerEntity.leader.stats.core.defense +=
                                defenseBoost;
                            updateBattleLog(
                                `<span class="LV">You won a defense boost! ` +
                                `+${defenseBoost} DEF!</span>`
                            );
                            break;
                        }
                        case "persuasion": {
                            const persuasionBoost =
                                1 + Math.floor(Math.random() * 2);
                            playerEntity.leader.stats.core.persuasion +=
                                persuasionBoost;
                            updateBattleLog(
                                `<span class="LV">You won a persuasion ` +
                                `boost! +${persuasionBoost} PRS!</span> ` +
                                `(Actually the gambler just handed you a ` +
                                `beat-up copy of "How to Win Friends and ` +
                                `Influence People", but whatever.)`
                            );
                            break;
                        }
                    }
                    this.leader.say(
                        "Ah, whatever. Fucker. You win this time...",
                        false,
                        () => playSFX("ran")
                    );
                } else {
                    this.leader.say(
                        "Tough luck, kid! Heh heh heh!",
                        false,
                        () => playSFX("ran")
                    );
                }

                onFinish?.();
            });
            playSFX("gamble");
        };

        /**
         * This animates the hand throwing dice when gambling
         *
         * The animation works by calling the gambleFrames in sequence. The
         * number of defined frames is actually more than the number of the
         * available frames in the animation. This is because the final frame is
         * held and displays random digits to emphasize the roll
         *
         * @TODO Replace this with image frames
         */
        gambler.gambleAnimation = function (dice, callback, frame) {
            const maxFrames = 24;
            const frameNumber = frame || 0;
            const displayFrame = Math.min(frameNumber, gambleFrames.length - 1);
            const isFinalFrame = frameNumber >= maxFrames - 1;

            if (frameNumber === 0) {
                animationActive = true;
                document.getElementById("animation").classList.remove("hidden");
                document.getElementById("menu").classList.add("hidden");
            }

            // Set random dice digits before displaying the actual outcome
            const d = isFinalFrame ? dice : [
                numberBetween(1, 6),
                numberBetween(1, 6),
            ];

            if (frameNumber < maxFrames) {
                // Add some padding to center the animation
                let frameText = gambleFrames[displayFrame].replace(
                    /^/gm,
                    "       "
                );

                if (frameNumber >= gambleFrames.length - 4) {
                    // Draw digits on the bones
                    frameText = frameText.replace(
                        /(^[ |]+\n^ +\|   ) {5}( +\| +\|   ) {5}(.+\n^ +\|   ) {5}( +\| +\|   ) {5}(.+\n^ +\|   ) {5}( +\| +\|   ) {5}/m,
                        `$1${dieDigit[d[0] - 1][0]}$2${dieDigit[d[1] - 1][0]}$3${dieDigit[d[0] - 1][1]}$4${dieDigit[d[1] - 1][1]}$5${dieDigit[d[0] - 1][2]}$6${dieDigit[d[1] - 1][2]}`,
                    );
                }

                document.getElementById("animation").textContent = frameText;
                setTimeout(
                    () => this.gambleAnimation(dice, callback, frameNumber + 1),
                    ! isFinalFrame ? 50 : 3000
                );
            } else {
                document.getElementById('animation').classList.add('hidden');
                document.getElementById("menu").classList.remove("hidden");
                animationActive = false;
                typeof callback === "function" && callback();
            }
        }

        gambler.onExplode = function(gameMap, entity) {
            playSFX("scream");
            this.leader.say("AUGH!!", false);

            const killedByPlayer = entity.id === playerEntity.id;

            if (killedByPlayer) {
                const rewardBtc = (5 + Math.round(Math.random() * 5)) * 10;
                playerEntity.inventory.giveBitcoins(rewardBtc);
                updateBattleLog(
                    `The <span class="gambler">gambler</span> has been ` +
                    `<span class="action">reduced to a confetti of shrapnel ` +
                    `and bone!</span> You find <span class="BTC">` +
                    `${rewardBtc} BTC</span> among the remains. Awesome!`
                );
            }

            const bloodyCrater =
                MapEntityFeatureFactory.bloodyCrater(this.x, this.y);
            bloodyCrater.getDisplayName = () => "🔴 Post-Explodent Rodent";
            gameMap.addEntity(bloodyCrater);

            this.die(entity);
        };

        return gambler;
    },

    /**
     * EROK
     */
    erok: function(x, y) {
        const erok = MapEntityBuilder("erok", x, y);

        erok.getDisplayName = function() {
            return "🐕️ Erok";
        };

        erok.getDisplayCharacter = () => "E";
        erok.addPartyMember(TardQuestPartyMemberFactory.erok());

        erok.onTouch = function(gameMap, entity) {
            if (entity?.type === "player") {
                const erok = this;
                menu.open("erok", { erok });
            } else {
                console.log(
                    `🏁 Touched by ${entity.id}`,
                    { gameMap, entity, touched: this }
                );
            }
        };

        erok.onExplode = function(gameMap, entity) {
            playSFX("scream");
            this.leader.say("i died oh noes", false);

            const killedByPlayer = entity.id === playerEntity.id;

            if (killedByPlayer) {
                // You better believe there's a price to pay
                const previousLuck = playerEntity.leader.stats.core.luck;
                const badLuck = -Math.min(10, previousLuck - 1);
                playerEntity.leader.incrementCoreStat("luck", badLuck);

                updateBattleLog(
                    `OH NO! <span class="friendly">Erok</span> has been ` +
                    `<span class="action">blown the fuck up!</span> ` +
                    `You monster... ` +
                    `<strong class="enemy">${badLuck} LUCK</strong>`
                );
            }

            const bloodyCrater =
                MapEntityFeatureFactory.bloodyCrater(this.x, this.y);
            gameMap.addEntity(bloodyCrater);

            this.die(entity);
        };

        return erok;
    },
}
