"use strict";

const menu = new Menu();
menu.setMenuElement(document.getElementById("menu"));
menu.setDefaultItemsPerPage(15);
menu.setOnOpen(() => {
    document.getElementById("game").classList.add("hidden");
    InventorySidebar.close();
    GameControl.update();
    updateViewportHeader();
    pauseAmbientSfx();
});
menu.setOnPageChange(() => GameControl.update());
menu.setOnHighlight(() => playSFX("uiOption"));
menu.setOnSelect(() => {
    playSFX("uiSelect");
    GameControl.update();
    updateViewportHeader();
});
menu.setOnCancel(() => {
    playSFX("uiCancel");
    GameControl.update();
    updateViewportHeader();
});
menu.setOnClose(() => {
    document.getElementById("game").classList.remove("hidden");
    InventorySidebar.open("main");
    GameControl.update();
    updateViewportHeader();
    render();
    if (! BattleSystem.isActive && ! TITLE_SCREEN.isActive) {
        resumeAmbientSfx();
    }
});

menu.setMenus({
    gameSettings: {
        title: "GAME SETTINGS",
        onOpen: () => {
            GameSettingsButton.opened();
            Portrait.show("settings");
        },
        onClose: () => {
            GameSettingsButton.closed();
            Portrait.hide();
        },
        getOptions: () => [
            {
                id: "_back",
                displayText: "Return to the game",
                description: "Continue your quest",
            },
            {
                id: "toggleMusic",
                displayText:
                    `${music.isEnabled() ? "Disable" : "Enable"} music`,
                description: tromboneIsPlaying
                    ? "Wait for the trom-BONE to stop playing first"
                    : `Turn ${music.isEnabled() ? "off" : "on"} the ` +
                        `in-game music`,
                className: tromboneIsPlaying ? "muted" : undefined,
            },
            {
                id: "musicSettings",
                displayText: "Music selection",
                description:
                    "Choose which music tracks are able to play at " +
                    "random",
            },
            {
                id: "toggleSFX",
                displayText:
                    `${sfxEnabled ? "Disable" : "Enable"} SFX`,
                description:
                    `${sfxEnabled ? "Disable" : "Enable"} sound effects`
            },
            {
                id: "toggleSpeech",
                displayText:
                    `${SpeechSynthesizer.enabled ? "Disable" : "Enable"} speech`,
                description:
                    `${SpeechSynthesizer.enabled ? "Disable" : "Enable"} the ` +
                    `party member and NPC speaking voices`,
            },
            {
                id: "toggleSkipTitleScreen",
                displayText: skipTitleScreen
                    ? "Disable quickstart"
                    : "Enable quickstart",
                description: skipTitleScreen
                    ? "Enable the title screen upon starting the game " +
                        "(enables preloader by default)"
                    : "Skip the title screen automatically upon starting the " +
                        "game (disables preloader by default)",
            },
            {
                id: "toggleEatRatAnimation",
                displayText: eatRatAnimationEnabled
                    ? "Disable level up animation"
                    : "Enable level up animation",
                description: eatRatAnimationEnabled
                    ? "Disable rat consumption animation on level up"
                    : "Enable rat consumption animation on level up",
            },
            {
                id: "toggleBattleTransitionAnimations",
                displayText: battleTransitionAnimationsEnabled
                    ? "Disable battle transitions"
                    : "Enable battle transitions",
                description: battleTransitionAnimationsEnabled
                    ? "Disable the curtain animation when entering/leaving " +
                        "battles"
                    : "Enable the curtain animation when entering/leaving " +
                        "battles",
            },
            {
                id: "toggleAutoDiceroll",
                displayText: autoDicerollEnabled
                    ? "Disable auto diceroll"
                    : "Enable auto diceroll",
                description: autoDicerollEnabled
                    ? "Disable automatic random stat allocation"
                    : "Automatically roll stats on character creation and " +
                        "level up",
            },
            {
                id: "togglePreloader",
                displayText: preloaderEnabled
                    ? "Disable preloader"
                    : "Enable preloader",
                description: preloaderEnabled
                    ? "Disable preloading assets (not recommended)"
                    : "Enable preloading assets (recommended)" ,
            },
            {
                id: "resetGame",
                displayText: "Reset the game",
                description:
                    "Abandon your current game and return to the title screen",
            },
        ],
        select: (selectedOptionId) => {
            switch (selectedOptionId) {
                case "toggleMusic":
                    if (tromboneIsPlaying) {
                        break;
                    }
                    music.toggle();
                    saveSettings();
                    menu.render();
                    break;
                case "musicSettings":
                    menu.open("musicSettings");
                    break;
                case "toggleSFX":
                    sfxEnabled = ! sfxEnabled;
                    sfxEnabled
                        ? ViewportAnimation.unmute()
                        : ViewportAnimation.mute();
                    saveSettings();
                    menu.render();
                    break;
                case "toggleSpeech":
                    SpeechSynthesizer.enabled =
                        ! SpeechSynthesizer.enabled;
                    saveSettings();
                    menu.render();
                    break;
                case "toggleSkipTitleScreen":
                    skipTitleScreen = ! skipTitleScreen;
                    preloaderEnabled = ! skipTitleScreen;
                    saveSettings();
                    menu.render();
                    break;
                case "toggleEatRatAnimation":
                    eatRatAnimationEnabled = ! eatRatAnimationEnabled;
                    saveSettings();
                    menu.render();
                    break;
                case "toggleBattleTransitionAnimations":
                    battleTransitionAnimationsEnabled =
                        ! battleTransitionAnimationsEnabled;
                    saveSettings();
                    menu.render();
                    break;
                case "toggleAutoDiceroll":
                    autoDicerollEnabled = ! autoDicerollEnabled;
                    saveSettings();
                    menu.render();
                    break;
                case "togglePreloader":
                    preloaderEnabled = ! preloaderEnabled;
                    saveSettings();
                    menu.render();
                    break;
                case "resetGame":
                    menu.open("resetGameConfirmation");
                    break;
            }
        },
    },

    musicSettings: {
        title: "MUSIC SETTINGS",
        getOptions: () => [
            {
                id: "explorationMusicSettings",
                displayText: "Exploration music",
                description: "Pick which songs play during exploration",
            },
            {
                id: "battleMusicSettings",
                displayText: "Battle music",
                description: "Pick which songs play during battle",
            },
            {
                id: "_back",
                displayText: "[Back]",
                description: "Return to game settings",
            },
        ],
        select: (selectedMenuId) => menu.open(selectedMenuId),
    },

    explorationMusicSettings: {
        title: "EXPLORATION MUSIC",
        landingHtml: () =>
            "Select which exploration tracks to include in rotation",
        getOptions: () => {
            const tracks = music.getTracks("exploration");
            const options = tracks.map(track => {
                const verb = track.enabled ? "disable" : "enable";
                const description = `Select to ${verb} this track`
                const className = track.enabled ? undefined : "muted";

                return {
                    id: track.id,
                    displayText: `${track.title} - ${track.artist}`,
                    description,
                    className,
                };
            });

            options.push({
                id: "_back",
                displayText: "[Back]",
                description: "Return to music settings",
            });

            return options;
        },
        select: (trackId) => {
            music.tagToggle("exploration", trackId);
            saveSettings();
            menu.render();
        },
    },

    battleMusicSettings: {
        title: "BATTLE MUSIC",
        landingHtml: () => "Select which battle tracks to include in rotation",
        getOptions: () => {
            const options = music.getTracks("battle").map(track => {
                const verb = track.enabled ? "disable" : "enable";
                const description = `Select to ${verb} this track`
                const className = track.enabled ? undefined : "muted";

                return {
                    id: track.id,
                    displayText: `${track.title} - ${track.artist}`,
                    description,
                    className,
                };
            });

            options.push({
                id: "_back",
                displayText: "[Back]",
                description: "Return to music settings",
            });

            return options;
        },
        select: (trackId) => {
            music.tagToggle("battle", trackId);
            saveSettings();
            menu.render();
        },
    },

    resetGameConfirmation: {
        title: "RESET GAME",
        landingHtml: () =>
            "Are you sure you want to reset the game?",
        getOptions: () => [
            {
                id: "_back",
                displayText: "NO! Do not reset the game!",
                description: "Go back to the previous menu",
            },
            {
                id: "reset",
                displayText: "Yes, waste my progress",
                description:
                    "Abandon the current game and start again from the first " +
                    "floor",
            },
        ],
        select: () => window.location.reload(),
    },

    inventory: {
        title: "INVENTORY",
        landingHtml: () => {
            return playerEntity.inventory.isEmpty()
                ? "You own nothing. Klaus Schwab would be proud"
                : null;
        },
        getOptions: () => [
            {
                id: "inventoryItems",
                displayText: "Items",
                description: "View your consumable items.",
            },
            {
                id: "inventoryEquipment",
                displayText: "Equipment",
                description: "View and change your equipped weapon and armor.",
                className: BattleSystem.isActive
                    ? "tooExpensive"
                    : undefined,
            },
            {
                id: "_back",
                displayText: "[Back]",
                description: "Get back to playing the game",
            }
        ],
        select: (selectedOptionId) => {
            // When in battle, disable equipment submenus
            const submenuDisabled =
                selectedOptionId === "inventoryEquipment" &&
                BattleSystem.isActive;

            if (submenuDisabled) {
                updateBattleLog(
                    `Your foe's <span class="action">deathly stare</span> ` +
                    `prevents you from wanting to strip down into a new set ` +
                    `of equipment!`
                );
                return;
            }
            menu.open(selectedOptionId);
        },
        onOpen: () => {
            Portrait.show("inventory");
        },
        onClose: () => {
            Portrait.hide();
        },
    },

    inventoryItems: {
        title: "ITEMS",
        landingHtml: () => {
            return ! playerEntity.inventory.hasAnyItem()
                ? "You own nothing. Klaus Schwab would be proud"
                : null;
        },
        getOptions: () => {
            const itemKeys =
                Object.keys(playerEntity.inventory.contents.items);
            const options = [];

            for (const key of itemKeys) {
                const definition = ITEMS[key];
                if (! definition) {
                    console.warn("Item definition not found", { key });
                    continue;
                }

                const className =
                    ! BattleSystem.isActive ||
                    definition.battleUsage.available
                        ? undefined
                        : "muted";

                options.push({
                    id: key,
                    displayText: definition?.name || "Unknown Item",
                    description: definition?.description || "???",
                    trailText:
                        playerEntity.inventory.contents.items[key]
                            .toLocaleString(undefined),
                    className,
                });
            }

            options.push({
                id: "_back",
                displayText: "[Back]",
                description: "Return to the inventory menu",
            });

            return options;
        },
        select: (selectedOptionId) => {
            const item = ITEMS[selectedOptionId];

            // @TODO Allow party member selection so items can be used on others
            if (BattleSystem.isActive) {
                if (! item.battleUsage.available) {
                    console.warn(
                        "Item is not available for use during battle",
                        { selectedOptionId }
                    );
                    return;
                }

                const index = BattleSystem.playerPartyMemberIndex;
                const activePartyMember =
                    BattleSystem.playerEntity?.party?.[index];
                if (! activePartyMember) {
                    console.warn(
                        "No active party members can queue item usage"
                    );
                    return;
                }

                menu.closeAll();

                BattleSystem.useItem(
                    activePartyMember,
                    selectedOptionId,
                    item.battleUsage.offensive
                        ? BattleSystem.enemyEntity.leader
                        : activePartyMember
                );

                return;
            }

            const itemUsed = playerEntity.leader.useItem(
                selectedOptionId,
                playerEntity.leader
            );

            ! itemUsed
                ? console.error("Failed to use an item", { selectedOptionId })
                : menu.closeAll();
        },
    },

    inventoryEquipment: {
        title: "EQUIPMENT",
        getOptions: () => {
            const equipment = playerEntity.leader.equipped;

            const weapon = equipment.weapon
                ? WEAPONS[equipment.weapon]
                : null;
            const armor = equipment.armor
                ? ARMOR[equipment.armor]
                : null;
            const rings = {
                leftHand: equipment.ring.left
                    ? RINGS[equipment.ring.left]
                    : null,
                rightHand: equipment.ring.right
                    ? RINGS[equipment.ring.right]
                    : null,
            };

            return [
                {
                    id: "equipHand",
                    displayText: `Hand:   ${weapon?.name || "None"}`,
                    description: "View and equip your weapons.",
                },
                {
                    id: "equipBody",
                    displayText: `Body:   ${armor?.name || "None"}`,
                    description: "View and equip your armor.",
                },
                {
                    id: "equipRings",
                    // The second line is deliberately offset because
                    // the cursor adds two spaces to the first line
                    displayText:
                        `Rings:  ${rings.leftHand?.name || "None"}\n` +
                        `        ${rings.rightHand?.name || "None"}`,
                    description: "View and equip your rings.",
                },
                {
                    id: "_back",
                    displayText: "[Back]",
                    description: "Return to the inventory menu",
                }
            ];
        },
        select: (selectedOptionId) => {
            menu.open(selectedOptionId);
        },
    },

    equipHand: {
        title: "EQUIP WEAPON",
        getOptions: () => {
            const equippedWeaponId = playerEntity.leader.equipped.weapon;
            const ownedWeapons = Object.keys(playerEntity.getPartyWeapons());

            return ownedWeapons.map(weaponId => {
                const weapon = WEAPONS[weaponId];
                if (! weapon) {
                    console.error(
                        "Player is holding an unknown weapon",
                        { weaponId }
                    );
                    return null;
                }

                const isEquipped = weaponId === equippedWeaponId;
                const requiredStrength = weapon.requiredStr || 0;
                const playerMeetsReqirements =
                    playerEntity.leader.stats.core.strength >= requiredStrength;
                const requirementClass =
                    playerMeetsReqirements ? "friendly" : "enemy";
                const requiredStrengthHtml =
                    `<span class="${requirementClass}">` +
                    `STR ${requiredStrength}</span>`;

                return {
                    id: weaponId,
                    displayText:
                        weapon.name + (isEquipped ? " (Equipped)" : ""),
                    description:
                        `${weapon.description}\n` +
                        `Base Damage: ${weapon.damage.base}, ` +
                        `Random Multiplier: ` +
                            `${weapon.damage.randomMultiplier}\n` +
                        `LOAD: ${weapon.weight}\n` +
                        `Stat Requirement: ${requiredStrengthHtml}`,
                    className: playerMeetsReqirements
                        ? (isEquipped ? "friendly" : undefined)
                        : "tooExpensive",
                };
            }).concat([{
                id: "_back",
                displayText: "[Back]",
                description: "Return to equipment menu",
            }]);
        },
        select: (selectedOptionId) => {
            const weapon = WEAPONS[selectedOptionId];
            if (! weapon) {
                console.error(
                    "Selected an inventory weapon that does not exist",
                    { selectedOptionId }
                );
                return;
            }

            const requiredStrength = weapon.requiredStr || 0;
            const hasRequiredStrength =
                playerEntity.leader.stats.core.strength >=
                requiredStrength
            if (! hasRequiredStrength) {
                updateBattleLog(
                    `You <span class="enemy">require</span> ` +
                    `<span class="STR">${requiredStrength} STR` +
                    `</span> to handle this weapon!`
                );
                return;
            }

            if (! playerEntity.leader.equipWeapon(selectedOptionId)) {
                console.error(
                    "Could not equip the selected weapon",
                    { selectedOptionId }
                );
            } else {
                menu.close();
            }
        },
    },

    equipBody: {
        title: "EQUIP ARMOR",
        getOptions: () => {
            const equippedArmorId = playerEntity.leader.equipped.armor;
            const ownedArmor = Object.keys(playerEntity.getPartyArmor());

            return ownedArmor.map(armorId => {
                const armor = ARMOR[armorId];
                if (! armor) {
                    console.error(
                        "Player is holding an unknown piece of armor",
                        { armorId }
                    );
                    return null;
                }

                const isEquipped = armorId === equippedArmorId;
                const requiredEndurance = armor.requiredEnd || 0;
                const meetsRequirements =
                    playerEntity.leader.stats.core.endurance >=
                    requiredEndurance;
                const requirementClass = meetsRequirements
                    ? "friendly" : "enemy";
                const requiredEnduranceHtml =
                    `<span class="${requirementClass}">END ` +
                    `${requiredEndurance}</span>`;
                return {
                    id: armorId,
                    displayText:
                        armor.name + (isEquipped ? " (Equipped)" : ""),
                    description:
                        `${armor.description}\n` +
                        `Defense: ${armor.defense}\n` +
                        `LOAD: ${armor.weight}\n` +
                        `Stat Requirement: ${requiredEnduranceHtml}`,
                    className: ! meetsRequirements
                        ? "tooExpensive"
                        : (isEquipped ? "friendly" : undefined),
                };
            }).concat([{
                id: "_back",
                displayText: "[Back]",
                description: "Return to equipment menu",
            }]);
        },
        select: (selectedOptionId) => {
            const armor = ARMOR[selectedOptionId];
            if (! armor) {
                console.error(
                    "Selected inventory armor that does not exist",
                    { selectedOptionId }
                );
                return;
            }

            const requiredEndurance = armor.requiredEnd || 0;
            if (playerEntity.leader.stats.core.endurance < requiredEndurance) {
                updateBattleLog(
                    `You need <span class="END">${requiredEndurance} ` +
                    `END</span> to wear this garment!`
                );
                return;
            }

            if (! playerEntity.leader.equipArmor(selectedOptionId)) {
                console.error(
                    "Could not equip the selected armor",
                    { selectedOptionId }
                );
            } else {
                menu.close();
            }
        },
    },

    equipRings: {
        title: "EQUIP RINGS",
        getOptions: () => {
            const rings = playerEntity.leader.equipped.ring;
            const leftRing = RINGS[rings.left];
            const rightRing = RINGS[rings.right];

            return [
                {
                    id: "ringLeftHand",
                    displayText: "Left Hand:  " + (leftRing?.name || "None"),
                    description: "Equip a ring on your left hand",
                },
                {
                    id: "ringRightHand",
                    displayText: "Right Hand: " + (rightRing?.name || "None"),
                    description: "Equip a ring on your right hand",
                },
                {
                    id: "_back",
                    displayText: "[Back]",
                    description: "Return to equipment menu",
                }
            ];
        },
        select: (selectedOptionId) => {
            if (selectedOptionId === "ringLeftHand") {
                menu.open("ringLeftHandSelect");
            } else if (selectedOptionId === "ringRightHand") {
                menu.open("ringRightHandSelect");
            } else {
                const shouldHeal = playerEntity.leader.stats.core.hp >
                    getEffectiveStat("maxHp");

                if (shouldHeal) {
                    playerEntity.leader.stats.core.hp =
                        getEffectiveStat("maxHp");
                }
                menu.close();
            }
        },
    },

    ringLeftHandSelect: {
        title: "LEFT HAND",
        getOptions: () => {
            const equippedRingId = playerEntity.leader.equipped.ring.left;
            const ownedRings = Object.keys(playerEntity.getPartyRings());

            const options = ownedRings.map(ringId => {
                const ring = RINGS[ringId];
                if (! ring) {
                    console.error(
                        "Player is holding an unknown ring",
                        { ringId }
                    );
                    return null;
                }

                const isEquipped = Object
                    .values(playerEntity.leader.equipped.ring)
                    .includes(ringId);
                const displayText =
                    ring.name + (isEquipped ? " (Equipped)" : "");
                const className = isEquipped
                    ? (isEquipped ? "friendly" : "muted")
                    : undefined;

                return {
                    id: ringId,
                    displayText,
                    description: ring.description,
                    className,
                };
            });

            options.unshift({
                id: null,
                displayText: "None",
                description: "Unequip this ring slot",
            });

            options.push({
                id: "_back",
                displayText: "[Back]",
                description: "Return to rings menu",
            });

            return options;
        },
        select: (selectedOptionId) => {
            if (! selectedOptionId) {
                // Only update if a ring has been equipped
                ! playerEntity.leader.unequipRing("left")
                    ? console.error("Could not unequip ring")
                    : menu.close();

                return;
            }

            const ring = RINGS[selectedOptionId];
            if (! ring) {
                console.error(
                    "Selected an inventory ring that does not exist",
                    { selectedOptionId }
                );
                return;
            }

            const ringIsAlreadyEquippedOnOppositeHand =
                playerEntity.leader.equipped.ring.right === selectedOptionId;
            if (ringIsAlreadyEquippedOnOppositeHand) {
                const articleText = ring.article ? "the " : "";
                updateBattleLog(
                    `You are <span class="action">already wearing` +
                    `</span> ${articleText}<span class="friendly">` +
                    `${ring.name}</span> on your right hand, fool!`
                );
                return;
            }

            if (! playerEntity.leader.equipRing("left", selectedOptionId)) {
                console.error(
                    "Could not equip the selected ring",
                    { selectedOptionId }
                );
            } else {
                menu.close();
            }
        },
    },

    ringRightHandSelect: {
        title: "RIGHT HAND",
        getOptions: () => {
            const equippedRingId = playerEntity.leader.equipped.ring.right;
            const ownedRings = Object.keys(playerEntity.getPartyRings());

            const options = ownedRings.map(ringId => {
                const ring = RINGS[ringId];
                if (! ring) {
                    console.error(
                        "Player is holding an unknown ring",
                        { ringId }
                    );
                    return null;
                }

                const isEquipped = Object
                    .values(playerEntity.leader.equipped.ring)
                    .includes(ringId);
                const displayText =
                    ring.name + (isEquipped ? " (Equipped)" : "");
                const className = isEquipped
                    ? (isEquipped ? "friendly" : "muted")
                    : undefined;

                return {
                    id: ringId,
                    displayText,
                    description: ring.description,
                    className,
                };
            });

            options.unshift({
                id: null,
                displayText: "None",
                description: "Unequip this ring slot",
            });

            options.push({
                id: "_back",
                displayText: "[Back]",
                description: "Return to rings menu",
            });

            return options;
        },
        select: (selectedOptionId) => {
            if (! selectedOptionId) {
                // Only update if a ring has been equipped
                ! playerEntity.leader.unequipRing("right")
                    ? console.error("Could not unequip ring")
                    : menu.close();

                return;
            }

            const ring = RINGS[selectedOptionId];
            if (! ring) {
                console.error(
                    "Selected an inventory ring that does not exist",
                    { selectedOptionId }
                );
                return;
            }

            const ringIsAlreadyEquippedOnOppositeHand =
                playerEntity.leader.equipped.ring.left === selectedOptionId;
            if (ringIsAlreadyEquippedOnOppositeHand) {
                const articleText = ring.article ? "the " : "";
                updateBattleLog(
                    `You are <span class="action">already wearing` +
                    `</span> ${articleText}<span class="friendly">` +
                    `${ring.name}</span> on your left hand, fool!`
                );
                return;
            }

            if (! playerEntity.leader.equipRing("right", selectedOptionId)) {
                console.error(
                    "Could not equip the selected ring",
                    { selectedOptionId }
                );
            } else {
                menu.close();
            }
        },
    },

    merchant: {
        title: "MERCHANT",
        onOpen: (menuData) => {
            Portrait.show("merchant", menuData.merchant.leader.color);
            menuData.merchant.leader.say("Welcome to SlobMart!", false);
        },
        onClose: (menuData) => {
            menuData.merchant.leader.say("Thank you. Come again!", false);
            Portrait.hide();
            music.resumeTag("exploration");
        },
        landingHtml: () => {
            const bitcoins = playerEntity.inventory.contents.bitcoins;
            return bitcoins > 0
                ?
                    `You have <span class="BTC">` +
                    `₿ ${bitcoins.toLocaleString(undefined)}</span> in your ` +
                    `wallet`
                :
                    "Your wallet is emptier than a lughead's skull. " +
                    "But you can still look around";
        },
        getOptions: () => [
            {
                id: "merchantItems",
                displayText: "Items",
                description: "See what consumable items are for sale",
            },
            {
                id: "merchantWeapons",
                displayText: "Weapons",
                description: "Look at some weapon upgrades",
            },
            {
                id: "merchantArmor",
                displayText: "Armor",
                description: "Get some thicker skin",
            },
            {
                id: "merchantRings",
                displayText: "Rings",
                description: "Jewelry that will probably turn you gay",
            },
            {
                id: "merchantSell",
                displayText: "[Sell]",
                description: "Sell your items, filthy garb, and dangerous arms",
            },
            {
                id: "_back",
                displayText: "[Leave]",
                description: "Get back to spelunking",
            },
        ],
        select: (selectedOptionId) => {
            console.log("SELECTED", { selectedOptionId, data: menu.getMenuData()});
            menu.open(selectedOptionId, menu.getMenuData());
        },
    },

    merchantItems: {
        title: "ITEMS",
        landingHtml: () => {
            const bitcoins = playerEntity.inventory.contents.bitcoins;
            return bitcoins > 0
                ?
                    `You have <span class="BTC">` +
                    `₿ ${bitcoins.toLocaleString(undefined)}</span> in your ` +
                    `wallet`
                :
                    "Your wallet is emptier than a lughead's skull. " +
                    "But you can still look around";
        },
        getOptions: (menuData) => {
            const bitcoins = playerEntity.inventory.contents.bitcoins;
            const merchantItems = menuData?.wares?.items || [];
            const options = merchantItems.map(itemId => {
                const displayText = ITEMS[itemId].name;
                let className = ITEMS[itemId].price > bitcoins
                    ? "tooExpensive"
                    : undefined;

                if (itemId === "carrierPigeon") {
                    const pigeonCount =
                        playerEntity.inventory.items?.["carrierPigeon"] || 0;
                    const pigeonLimitReached = pigeonCount >= 10;

                    if (pigeonLimitReached) {
                        className = "muted";
                    }
                }

                const quantity =
                    playerEntity.inventory.contents.items[itemId] || 0;

                return {
                    id: itemId,
                    displayText,
                    description:
                        `${ITEMS[itemId].description}\n\nOwned: ${quantity}`,
                    trailText: `₿ ${ITEMS[itemId].price}`,
                    className,
                };
            });

            options.push({
                id: "_back",
                displayText: "[Back]",
                description: "Return to the merchant menu",
            });

            return options;
        },
        select: (id) => {
            const item = ITEMS[id];
            console.log("Buying item", { id, item });
            if (! item) {
                console.error("Item does not exist", { id });
                return;
            }

            const merchant = menu.getMenuData().merchant;

            if (playerEntity.inventory.contents.bitcoins < item.price) {
                merchant.leader.say(
                    "Too bad, kid. Come back when you get some coin!",
                    false
                );
                return;
            }

            if (id === "carrierPigeon") {
                // === LIMIT TO 10 PIGEONS LOCALLY, ENFORCED SERVER SIDE ===
                const pigeonCount =
                    playerEntity.inventory.contents.items.carrierPigeon;
                if (pigeonCount >= 10) {
                    merchant.leader.say(
                        "You've run out of space in your Pigeon Pouch!",
                        false
                    );
                    return;
                }

                const sessionId = sessionStorage.getItem("tardquestSID");
                if (! sessionId) {
                    merchant.leader.say(
                        "Can't buy pigeons without an ID, kid.",
                        false
                    );
                    return;
                }

                // Inform player we're attempting a server purchase
                merchant.leader.say("Hold on, checking the coop...", false);

                fetch(
                    `${TardAPI.API_BASE}/api/pigeon/purchase`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ session_id: sessionId })
                    }
                )
                .then(r =>
                    r.json().catch(() => ({})).then(
                        data => ({ ok: r.ok, status: r.status, data }))
                )
                .then(({ ok, data }) => {
                    if (! ok || ! data?.purchased) {
                        console.warn(
                            "🐦 Pigeon: Purchase rejected",
                            { ok, data }
                        );
                        console.error(
                            data?.error ||
                            "No pigeons for you right now!"
                        );
                        return;
                    }

                    if (playerEntity.inventory.takeBitcoins(item.price)) {
                        playSFX("kaching");
                        playerEntity.inventory.addItem(id);

                        merchant.leader.say(
                            randomEntry([
                                "Fresh from the loft!",
                                "Don't eat it all at once!",
                                "Treat it nice, it carries words.",
                            ]),
                            false
                        );
                    }

                    merchant.printTransactionMessage(
                        "bought",
                        item,
                        item.price
                    );
                    render();
                })
                .catch(err => {
                    console.error("🐦 Pigeon: Purchase error", err);
                    merchant.leader.say(
                        "The coop collapsed. Try later.",
                        false
                    );
                });

                // Exit early; normal flow handled in async chain
                return;
            }

            if (playerEntity.inventory.takeBitcoins(item.price)) {
                playSFX("kaching");
                playerEntity.inventory.addItem(id);
                merchant.leader.say(
                    randomEntry([
                        "HAHA! You won't regret it!",
                        "Don't forget: NO REFUNDS!",
                        "You won't find a better deal than this!",
                    ]),
                    false
                );
            } else {
                console.log("You didn't buy anything", { item });
            }
        },
    },

    merchantWeapons: {
        title: "WEAPONS",
        landingHtml: () => {
            const bitcoins = playerEntity.inventory.contents.bitcoins;
            const message = bitcoins > 0
                ?
                    `You have <span class="BTC">` +
                    `₿ ${bitcoins.toLocaleString(undefined)}</span> in your ` +
                    `wallet`
                :
                    "Your wallet is emptier than a lughead's skull. " +
                    "But you can still look around";

            const currentWeapon = WEAPONS[playerEntity.leader.equipped.weapon];
            const article = currentWeapon?.article
                ? `${currentWeapon.article} `
                : "";
            const currentWeaponDisplay = article + currentWeapon.name;
            const wieldingMessage =
                `You are currently wielding ${currentWeaponDisplay}`;

            return `${message}\n\n${wieldingMessage}`;
        },
        getOptions: (menuData) => {
            const bitcoins = playerEntity.inventory.contents.bitcoins;
            const merchantWeapons = menuData?.wares?.weapons || [];
            const options = merchantWeapons.map(weaponId => {
                const weapon = WEAPONS[weaponId];
                const tooExpensive = weapon.price > bitcoins;
                const alreadyOwned = playerEntity.partyOwnsWeapon(weaponId);
                const requiredStrength = weapon.requiredStr || 0;
                const requirementClass =
                    playerEntity.leader.stats.core.strength >= requiredStrength
                        ? "friendly"
                        : "enemy";
                const requiredStrengthHtml =
                    `<span class="${requirementClass}">STR ` +
                    `${requiredStrength}</span>`;

                return {
                    id: weaponId,
                    displayText: weapon.name,
                    description:
                        `${weapon.description}\n` +
                        `Base Damage: ${weapon.damage.base}, ` +
                        `Random Multiplier: ` +
                            `${weapon.damage.randomMultiplier}\n` +
                        `LOAD: ${weapon.weight}\n` +
                        `Stat Requirement: ${requiredStrengthHtml}`,
                    trailText:
                        `₿ ${weapon.price.toLocaleString(undefined)}`,
                    className: alreadyOwned
                        ? "muted"
                        : (tooExpensive ? "tooExpensive" : undefined),
                };
            });

            options.push({
                id: "_back",
                displayText: "[Back]",
                description: "Return to the merchant menu",
            });

            return options;
        },
        select: (id) => {
            const weapon = WEAPONS[id];
            if (! weapon) {
                console.error("Weapon does not exist", { id });
                return;
            }

            const merchant = menu.getMenuData().merchant;

            if (playerEntity.inventory.contents.bitcoins < weapon.price) {
                merchant.leader.say(
                    "Too bad, kid. Come back when you get some coin!",
                    false
                );
                return;
            }

            if (playerEntity.partyOwnsWeapon(id)) {
                merchant.leader.say("You already own that, stupid!", false);
                return;
            }

            if (playerEntity.inventory.takeBitcoins(weapon.price)) {
                playSFX("kaching");
                playerEntity.inventory.addWeapon(id);
                merchant.leader.say(
                    randomEntry([
                        "HAHA! You won't regret it!",
                        "Don't forget: NO REFUNDS!",
                        "You won't find a better deal than this!",
                    ]),
                    false
                );
            }
        },
    },

    merchantArmor: {
        title: "ARMOR",
        landingHtml: () => {
            const bitcoins = playerEntity.inventory.contents.bitcoins;
            const message = bitcoins > 0
                ?
                    `You have <span class="BTC">` +
                    `₿ ${bitcoins.toLocaleString(undefined)}</span> in your ` +
                    `wallet`
                :
                    "Your wallet is emptier than a lughead's skull. " +
                    "But you can still look around";

            const currentArmor = ARMOR[playerEntity.leader.equipped.armor];
            const article =
                currentArmor?.article ? `${currentArmor.article} ` : "";
            const armorName =
                currentArmor?.name || "NOTHING. Have you no shame?";
            const currentArmorDisplay = article + armorName;
            const wearingMessage =
                `You are currently wearing ${currentArmorDisplay}`;

            return `${message}\n\n${wearingMessage}`;
        },
        getOptions: (menuData) => {
            const bitcoins = playerEntity.inventory.contents.bitcoins;
            const merchantArmor = menuData?.wares?.armor || [];
            const options = merchantArmor.map(armorId => {
                const armor = ARMOR[armorId];
                const tooExpensive = armor.price > bitcoins;
                const alreadyOwned = playerEntity.partyOwnsArmor(armorId);
                const requiredEndurance = armor.requiredEnd || 0;
                const requirementClass =
                    playerEntity.leader.stats.core.endurance >=
                    requiredEndurance
                        ? "friendly"
                        : "enemy";
                const requiredEnduranceHtml =
                    `<span class="${requirementClass}">END ` +
                    `${requiredEndurance}</span>`;
                return {
                    id: armorId,
                    displayText: armor.name,
                    description:
                        `${armor.description}\n` +
                        `Defense: ${armor.defense}\n` +
                        `LOAD: ${armor.weight}\n` +
                        `Stat Requirement: ${requiredEnduranceHtml}`,
                    trailText: `₿ ${armor.price}`,
                    className: alreadyOwned
                        ? "muted"
                        : (tooExpensive ? "tooExpensive" : undefined),
                };
            });

            options.push({
                id: "_back",
                displayText: "[Back]",
                description: "Return to the merchant menu",
            });

            return options;
        },
        select: (id) => {
            const armor = ARMOR[id];
            if (! armor) {
                console.error("Armor does not exist", { id });
                return;
            }

            const merchant = menu.getMenuData().merchant;

            if (playerEntity.inventory.contents.bitcoins < armor.price) {
                merchant.leader.say(
                    "Too bad, kid. Come back when you get some coin!",
                    false
                );
                return;
            }

            if (playerEntity.partyOwnsArmor(id)) {
                merchant.leader.say("You already own that, stupid!", false);
                return;
            }

            if (playerEntity.inventory.takeBitcoins(armor.price)) {
                playSFX("kaching");
                playerEntity.inventory.addArmor(id);
                merchant.leader.say(
                    randomEntry([
                        "HAHA! You won't regret it!",
                        "Don't forget: NO REFUNDS!",
                        "You won't find a better deal than this!",
                    ]),
                    false
                );
            }
        },
    },

    merchantRings: {
        title: "RINGS",
        landingHtml: () => {
            const bitcoins = playerEntity.inventory.contents.bitcoins;
            return bitcoins > 0
                ? `You have <span class="BTC">` +
                    `₿ ${bitcoins.toLocaleString(undefined)}` +
                    `</span> in your wallet`
                : "Your wallet is emptier than a lughead's skull. " +
                    "But you can still look around";
        },
        getOptions: (menuData) => {
            const bitcoins = playerEntity.inventory.contents.bitcoins;
            const merchantRings = menuData?.wares?.rings || [];
            const options = merchantRings.map(ringId => {
                const ring = RINGS[ringId];
                const tooExpensive = ring.price > bitcoins;
                const alreadyOwned = playerEntity.partyOwnsRing(ringId);

                return {
                    id: ringId,
                    displayText: ring.name,
                    description: ring.description,
                    trailText:
                        `₿ ${ring.price.toLocaleString(undefined)}`,
                    className: alreadyOwned
                        ? "muted"
                        : (tooExpensive ? "tooExpensive" : undefined),
                };
            });

            options.push({
                id: "_back",
                displayText: "[Back]",
                description: "Return to the merchant menu",
            });

            return options;
        },
        select: (id) => {
            const ring = RINGS[id];
            if (! ring) {
                console.error("Ring does not exist", { id });
                return;
            }

            const merchant = menu.getMenuData().merchant;

            if (playerEntity.inventory.contents.bitcoins < ring.price) {
                merchant.leader.say(
                    "Too bad, kid. Come back when you get some coin!",
                    false
                );
                return;
            }

            if (playerEntity.partyOwnsRing(id)) {
                merchant.leader.say("You already own that, stupid!", false);
                return;
            }

            if (playerEntity.inventory.takeBitcoins(ring.price)) {
                playSFX("kaching");
                playerEntity.inventory.addRing(id);
                merchant.leader.say(
                    randomEntry([
                        "HAHA! You won't regret it!",
                        "Don't forget: NO REFUNDS!",
                        "You won't find a better deal than this!",
                    ]),
                    false
                );
            }
        },
    },

    merchantSell: {
        title: "SELL",
        landingHtml: () => {
            const bitcoins = playerEntity.inventory.contents.bitcoins;

            return (
                `Sell your unwanted inventory for a small sum.\n\n` +
                `You have <span class="BTC">` +
                `₿ ${bitcoins.toLocaleString(undefined)}</span> in your ` +
                `wallet.`
            );
        },
        getOptions: () => {
            const playerItems = playerEntity.inventory.contents.items;
            const itemOptions = Object
                .keys(playerItems)
                .map(itemId => {
                    const item = ITEMS[itemId];
                    const quantity = playerItems[itemId];
                    const sellPrice = Math
                        .max(1, Math.floor(item.price / 5))
                        .toLocaleString(undefined);

                    return {
                        id: `sell_item_${itemId}`,
                        displayText: `[Item] ${item.name}`,
                        description:
                            `Sell for <span class="BTC">₿ ${sellPrice}</span>`,
                        trailText: `${quantity.toLocaleString(undefined)}x`,
                    };
                });

            const playerWeapons = playerEntity.inventory.contents.weapons;
            const weaponOptions = Object
                .keys(playerWeapons)
                .map(weaponId => {
                    const weapon = WEAPONS[weaponId];
                    const quantity = playerWeapons[weaponId];
                    const sellPrice = Math
                        .max(1, Math.floor(weapon.price / 10))
                        .toLocaleString(undefined);
                    const isEquipped =
                        playerEntity.leader.equipped.weapon === weaponId;

                    return {
                        id: `sell_weapon_${weaponId}`,
                        displayText: `[Weapon] ${weapon.name}`,
                        description:
                            `Sell for <span class="BTC">₿ ${sellPrice}</span>`,
                        trailText: `${quantity.toLocaleString(undefined)}x`,
                        className: isEquipped ? "muted" : undefined,
                    };
                });

            const playerArmor = playerEntity.inventory.contents.armor;
            const armorOptions = Object
                .keys(playerArmor)
                .map(armorId => {
                    const armor = ARMOR[armorId];
                    const quantity = playerArmor[armorId];
                    const sellPrice = Math
                        .max(1, Math.floor(armor.price / 10))
                        .toLocaleString(undefined);
                    const isEquipped =
                        playerEntity.leader.equipped.armor === armorId;

                    return {
                        id: `sell_armor_${armorId}`,
                        displayText: `[Armor] ${armor.name}`,
                        description:
                            `Sell for <span class="BTC">₿ ${sellPrice}</span>`,
                        trailText: `${quantity.toLocaleString(undefined)}x`,
                        className: isEquipped ? "muted" : undefined,
                    };
                });

            const playerRings = playerEntity.inventory.contents.rings;
            const ringOptions = Object
                .keys(playerRings)
                .map(ringId => {
                    const ring = RINGS[ringId];
                    const quantity = playerRings[ringId];
                    const sellPrice = Math
                        .max(1, Math.floor(ring.price / 5))
                        .toLocaleString(undefined);
                    const isEquipped =
                        playerEntity.leader.equipped.ring.left === ringId ||
                        playerEntity.leader.equipped.ring.right === ringId;

                    return {
                        id: `sell_ring_${ringId}`,
                        displayText: `[Ring] ${ring.name}`,
                        description:
                            `Sell for <span class="BTC">₿ ${sellPrice}</span>`,
                        trailText: `${quantity.toLocaleString(undefined)}x`,
                        className: isEquipped ? "muted" : undefined,
                    }
                });

            return [
                ...weaponOptions,
                ...armorOptions,
                ...ringOptions,
                ...itemOptions,
                {
                    id: "_back",
                    displayText: "[Back]",
                    description: "Return to the merchant menu",
                }
            ];
        },
        select: (selectedOptionId) => {
            const merchant = menu.getMenuData().merchant;
            const [_, type, id] = selectedOptionId.split("_");
            let soldObject, value = 0;

            if (type === "weapon") {
                if (playerEntity.leader.equipped.weapon === id) {
                    merchant.leader.say(
                        "You sure you wanna point that thing at me? I've got " +
                        "a 12 gauge hidden under my sleeve, you know...",
                        false
                    );
                    return;
                }

                if (playerEntity.inventory.hasWeapon(id)) {
                    soldObject = WEAPONS[id];
                    value = merchant.getSalePrice("weapon", WEAPONS[id].price);

                    playerEntity.inventory.deductWeapon(id)
                        ? playerEntity.inventory.giveBitcoins(value)
                        : console.error(
                            "Could not deduct weapon during sale",
                            { id }
                        );
                } else {
                    console.error(
                        "Tried to sell an item that the player does not have",
                        { id }
                    );
                    return;
                }
            } else if (type === "armor") {
                if (playerEntity.leader.equipped.armor === id) {
                    merchant.leader.say(
                        "What are you, a Lughead? You gotta strip down " +
                        "before you go selling that!",
                        false
                    );
                    return;
                }

                if (playerEntity.inventory.hasArmor(id)) {
                    soldObject = ARMOR[id];
                    value = merchant.getSalePrice("armor", ARMOR[id].price);

                    playerEntity.inventory.deductArmor(id)
                        ? playerEntity.inventory.giveBitcoins(value)
                        : console.error(
                            "Could not deduct armor during sale",
                            { id }
                        );
                } else {
                    console.error(
                        "Tried to sell armor that the player does not have",
                        { id }
                    );
                    return;
                }
            } else if (type === "ring") {
                const playerHasRingEquipped =
                    playerEntity.leader.equipped.ring.left === id ||
                    playerEntity.leader.equipped.ring.right === id;
                if (playerHasRingEquipped) {
                    merchant.leader.say(
                        "I don't swing that way, kid, but if you really " +
                        "wanna propose you gotta take the damn ring off.",
                        false
                    );
                    return;
                }

                if (playerEntity.inventory.hasRing(id)) {
                    soldObject = RINGS[id];
                    value = merchant.getSalePrice("ring", RINGS[id].price);

                    playerEntity.inventory.deductRing(id)
                        ? playerEntity.inventory.giveBitcoins(value)
                        : console.error(
                            "Could not deduct armor during sale",
                            { id }
                        );
                } else {
                    console.error(
                        "Tried to sell a ring that the player does not have",
                        { id }
                    );
                    return;
                }
            } else if (type === "item") {
                if (playerEntity.inventory.hasItem(id)) {
                    soldObject = ITEMS[id];
                    value = merchant.getSalePrice("item", ITEMS[id].price);

                    playerEntity.inventory.deductItem(id)
                        ? playerEntity.inventory.giveBitcoins(value)
                        : console.error(
                            "Could not deduct item during sale",
                            { id }
                        );
                } else {
                    console.error(
                        "Tried to sell an item that the player does not have",
                        { id }
                    );
                    return;
                }
            } else {
                console.error(
                    "Could not sell: unknown type",
                    { type, selectedOptionId }
                );
                return;
            }

            playSFX("kaching");
            merchant.printTransactionMessage("sold", soldObject, value);
            menu.render();
            render();
        },
    },

    gambler: {
        title: "GAMBLER",
        onOpen: () => {
            const gambler = menu.getMenuData()?.gambler;
            if (! gambler) {
                console.error(
                    "The gambler is not present",
                    { menuData: menu.getMenuData() }
                );
                menu.closeAll();
                return;
            }

            Portrait.show("gambler", gambler.leader.color);
            const playerHasGamblerRingEquipped = Object
                .values(playerEntity.leader.equipped.ring)
                .includes("ringGamble");

            const greeting = playerHasGamblerRingEquipped
                ? "Cheesed to meet you!"
                : "Place yer bets!";

            gambler.leader.say(greeting, false);
            music.play("gamblerTheme");
        },
        onClose: () => {
            music.resumeTag("exploration");
            Portrait.hide();
        },
        landingHtml: () => {
            const gambler = menu.getMenuData()?.gambler;
            if (! gambler) {
                console.error(
                    "The gambler is not present",
                    { menuData: menu.getMenuData() }
                );
                menu.closeAll();
                return;
            }

            const bitcoins = playerEntity.inventory.contents.bitcoins;

            return (
                `<span class="gambler">&lt;GAMBLER&gt;</span> ` +
                `"Welcome, dungeon dweller! ` +
                `<span class="friendly">Roll a 12</span> and ` +
                `<span class="BTC">boost one of yer stats.</span> ` +
                `Just <span class="tooExpensive">` +
                `₿ ${gambler.playPrice}</span> to play!"\n\n` +
                `You have <span class="BTC">₿ ` +
                `${bitcoins.toLocaleString(undefined)}</span> in your wallet`
            );
        },
        getOptions: () => {
            const gambler = menu.getMenuData()?.gambler;
            if (! gambler) {
                console.error(
                    "The gambler is not present",
                    { menuData: menu.getMenuData() }
                );
                menu.closeAll();
                return;
            }

            return [
                {
                    id: "play",
                    displayText: "Play the game",
                    trailText: `₿ ${gambler.playPrice}`,
                    description: "Take your chance with the gambler",
                },
                {
                    id: "_back",
                    displayText: "[Leave]",
                    description: "Leave this crusty fool",
                },
            ];
        },
        select: () => {
            const gambler = menu.getMenuData()?.gambler;
            if (! gambler) {
                console.error(
                    "The gambler is not present",
                    { menuData: menu.getMenuData() }
                );
                menu.closeAll();
                return;
            }

            gambler.gamble(() => {
                updateBattleLog("The gambler escapes into the shadows");
                gambler.die();
                menu.close();
            });
        },
    },

    erok: {
        title: "EROK",
        escapeDisabled: () => menu.getMenuData()?.erok?.isPetting,
        onOpen: () => {
            const erok = menu.getMenuData().erok;
            if (! erok.isPetting) {
                Portrait.show("erokIdle", erok.leader.color);
            }

            music.play("erokTheme");
            erok.leader.say(
                "oh my god oh my god hi stranger i love motorcycles",
                false
            );
        },
        onClose: (menuData) => {
            const erok = menuData.erok;
            erok.leader.say("I am barking happily, stranger!", false);
            Portrait.hide();
            music.resumeTag("exploration");
            erok.die();
        },
        landingHtml: () => {
            return (
                "You've approached a dog named Erok. " +
                "Seems friendly enough... for a dog!"
            );
        },
        getOptions: () => {
            const erok = menu.getMenuData().erok;

            return [
                {
                    id: "pet",
                    displayText:
                        "give the dog motivation to give you motivation",
                    description: ":)",
                    className: erok.isPetting ? "muted" : undefined,
                },
                {
                    id: "leave",
                    displayText: "make the dog sad",
                    description: "... :(",
                    className: erok.isPetting ? "muted" : undefined,
                },
            ];
        },
        select: (selectedOptionId) => {
            const erok = menu.getMenuData().erok;
            if (erok.isPetting) {
                return;
            }

            if (selectedOptionId === "pet") {
                erok.isPetting = true;
                Portrait.show("erokPet", erok.leader.color);
                erok.leader.say(
                    "holy crap oh my god pet me pet me oh my god holy shit " +
                    "oh god oh fuck oh god",
                    false
                );
                setTimeout(() => {
                    erok.isPetting = false;
                    const showErok =
                        menu.isOpen() &&
                        // @TODO Use a flag instead of the title text
                        menu.getCurrentMenuData()?.title === "EROK";

                    if (showErok) {
                        Portrait.show("erokIdle", erok.leader.color);
                    }
                    menu.render();
                }, 2000);
            } else if (selectedOptionId === "leave") {
                menu.close();
            }
        },
    },

    pigeon: {
        title: "CARRIER PIGEON",
        onOpen: () => {
            const pigeon = menu.getMenuData().pigeon;
            Portrait.show("pigeon", pigeon.leader.color);
            pigeon.leader.say(
                "Coo coo! " + (
                    pigeon.checkForMessages()
                        ? "You have a message from another adventurer!"
                        : "No adventurers have sent out any messages."
                ),
                false
            );
        },
        onClose: () => {
            Portrait.hide();
            pigeon.isActiveOnFloor = false;
            // @TODO Remove pigeon
        },
        landingHtml: () => pigeon.checkForMessages()
            ? "You see a sealed letter below the carrier pigeon's big stinky " +
                "feet."
            : "You notice a carrier pigeon. It seems lost.",
        getOptions: () => {
            const options = [];

            if (pigeon.checkForMessages()) {
                options.push({
                    id: "readMessages",
                    displayText: "Read the letter",
                    description:
                        "Read the letter sent out by a fellow adventurer",
                });
            }

            options.push({
                id: "leave",
                displayText: "Back away from the beast",
                description: "Let the beast roam free",
            });

            return options;
        },
        select: (selectedOptionId) => {
            if (selectedOptionId === "readMessages") {
                const displayMessage =
                    typeof PigeonMessaging?.displayDeliveredMessage ===
                        "function";
                if (displayMessage) {
                    // displayDeliveredMessage() will use the pending delivered
                    // message (if any)
                    PigeonMessaging.displayDeliveredMessage();
                } else {
                    updateBattleLog(
                        `<span class="enemy">Pigeon messaging system not ` +
                        `available.</span>`
                    );
                }
            }
            menu.close();
        },
    },

    treasureChest: {
        title: "TREASURE CHEST",
        defaultCloseOption: "resistTemptation",
        onOpen: () => {
            Portrait.show("chest");
        },
        onClose: () => {
            Portrait.hide();
        },
        landingHtml: () =>
            `\n\n\nYou found a treasure chest! Do you want to open it?`,
        getOptions: () => [
            {
                id: "open",
                displayText: "Hell yeah! Fondle that booty!",
                description: "Claim your succulent reward!",
            },
            {
                id: "resistTemptation",
                displayText: "Resist your burning temptation...",
                description: "DON'T claim your succulent reward!",
            },
        ],
        select: (selectedOptionId) => {
            if (selectedOptionId === "open") {
                const treasureChest = menu.getMenuData()?.treasureChest;
                if (treasureChest) {
                    treasureChest.open(playerEntity);
                } else {
                    updateBattleLog("The treasure chest isn't real..?");
                    console.error(
                        "No treasure chest entity was provided in the menu",
                        { menuData: menu.getMenuData() }
                    );
                }
            } else if (selectedOptionId === "resistTemptation") {
                updateBattleLog(
                    "You decide to walk away from the treasure chest"
                );
            }

            menu.close();
        },
    },

    statAllocation: {
        itemsPerPage: 12,
        // Prevent menu from being closed with the Escape key
        escapeDisabled: true,
        title: () => isLevelUpAllocation
            ? "Level Up"
            : "Stat Allocation",
        landingHtml: () => {
            const statPointDisplay = playerEntity.leader.statPoints
                .toLocaleString(undefined);

            return isLevelUpAllocation
                ?   `You leveled up! Allocate <span class="action">` +
                    `${statPointDisplay}</span> points to your stats.`
                :   `Build your character using the ` +
                    `<span class="action">${statPointDisplay}</span> ` +
                    `points you have been allotted. Use them wisely...`;
        },
        getOptions: () => {
            // Helper to determine if a stat should be red
            function isStatCapped(statKey) {
                return isLevelUpAllocation &&
                    levelUpStatPointsAllocated[statKey] >= 2;
            }
            return [
                {
                    id: "rollDice",
                    displayText: "[Diceroll]",
                    description: "Randomly allocate your points.",
                },
                {
                    id: "hp",
                    displayText:
                        `HP: ${playerEntity.leader.stats.core.maxHp}`,
                    className: isStatCapped("maxHp")
                        ? "tooExpensive"
                        : (
                            playerEntity.leader.statPoints < 1
                                ? "tooExpensive"
                                : undefined
                        ),
                    description: "Increases Health Points.",
                },
                {
                    id: "defense",
                    displayText:
                        `DEF: ${playerEntity.leader.stats.core.defense}`,
                    className: isStatCapped("defense")
                        ? "tooExpensive"
                        : (
                            playerEntity.leader.statPoints < 1
                                ? "tooExpensive"
                                : undefined
                        ),
                    description: "Increases defense against enemy attacks.",
                },
                {
                    id: "strength",
                    displayText:
                        `STR: ${playerEntity.leader.stats.core.strength}`,
                    className: isStatCapped("strength")
                        ? "tooExpensive"
                        : (
                            playerEntity.leader.statPoints < 1
                                ? "tooExpensive"
                                : undefined
                        ),
                    description:
                        "Increases your base ATK by 1 and allows you to " +
                        "equip higher grade weapons.",
                },
                {
                    id: "persuasion",
                    displayText:
                        `PRS: ${playerEntity.leader.stats.core.persuasion}`,
                    className: isStatCapped("persuasion")
                        ? "tooExpensive"
                        : (
                            playerEntity.leader.statPoints < 1
                                ? "tooExpensive"
                                : undefined
                        ),
                    description:
                        "Increases your chances at persuading monsters to " +
                        "join your party.",
                },
                {
                    id: "endurance",
                    displayText:
                        `END: ${playerEntity.leader.stats.core.endurance}`,
                    className: isStatCapped("endurance")
                        ? "tooExpensive"
                        : (
                            playerEntity.leader.statPoints < 1
                                ? "tooExpensive"
                                : undefined
                        ),
                    description:
                        "Increases your carry load and allows you to equip " +
                        "higher grade armor.",
                },
                {
                    id: "speed",
                    displayText:
                        `SPD: ${playerEntity.leader.stats.core.speed}`,
                    className: isStatCapped("speed")
                        ? "tooExpensive"
                        : (
                            playerEntity.leader.statPoints < 1
                                ? "tooExpensive"
                                : undefined
                        ),
                    description:
                        "Increases your movement speed. Each point allows " +
                        "you to move 5% faster.",
                },
                {
                    id: "luck",
                    displayText:
                        `LUK: ${playerEntity.leader.stats.core.luck}`,
                    className: isStatCapped("luck")
                        ? "tooExpensive"
                        : (
                            playerEntity.leader.statPoints < 1
                                ? "tooExpensive"
                                : undefined
                        ),
                    description:
                        "Increases crit rates and BTC rewards from chests.",
                },
                {
                    id: "reset",
                    displayText: "[Reset]",
                    description: isLevelUpAllocation
                        ? "Reset your level up stat allocation."
                        : "Reset your stat allocation.",
                },
                {
                    id: "confirm",
                    displayText: "[Confirm]",
                    className: playerEntity.leader.statPoints > 0
                        ? "tooExpensive"
                        : undefined,
                    description: isLevelUpAllocation
                        ? "Finish your level up and continue your adventure!"
                        : "Begin YOUR TardQuest!",
                },
            ];
        },
        select: (selectedOptionId) => {
            function resetStats() {
                playerEntity.leader.statPoints = PLAYER_STARTING_STAT_POINTS;
                playerEntity.leader.stats.core = { ...baseStats.core };
                playerEntity.leader.refreshStats();
                updateBattleLog("Stat allocation has been reset. Start over!");
            }

            function rollDiceForStats() {
                resetStats();
                const stats = [
                    "hp", "defense", "strength", "persuasion", "endurance",
                    "speed", "luck"
                ];

                while (playerEntity.leader.statPoints > 0) {
                    const stat = randomEntry(stats);
                    switch (stat) {
                        case "hp":
                            playerEntity.leader.incrementCoreStat("maxHp");
                            // Intentional fallthrough
                        case "defense":
                        case "strength":
                        case "persuasion":
                        case "endurance":
                        case "speed":
                        case "luck":
                            playerEntity.leader.incrementCoreStat(stat);
                            break;
                    }
                    playerEntity.leader.statPoints--;
                }
                updateBattleLog(
                    "Points have been randomly allocated. Good luck!"
                );
            }

            function rollDiceForLevelUp() {
                playerEntity.leader.stats.core.hp =
                    playerEntity.leader.stats.core.maxHp =
                    levelUpAllocatedStats.base.maxHp;
                playerEntity.leader.stats.core.defense =
                    levelUpAllocatedStats.base.defense;
                playerEntity.leader.stats.core.strength =
                    levelUpAllocatedStats.base.strength;
                playerEntity.leader.stats.core.persuasion =
                    levelUpAllocatedStats.base.persuasion;
                playerEntity.leader.stats.core.endurance =
                    levelUpAllocatedStats.base.endurance;
                playerEntity.leader.stats.core.speed =
                    levelUpAllocatedStats.base.speed;
                playerEntity.leader.stats.core.luck =
                    levelUpAllocatedStats.base.luck;
                playerEntity.leader.statPoints = 6;

                levelUpStatPointsAllocated = {
                    maxHp: 0,
                    defense: 0,
                    strength: 0,
                    persuasion: 0,
                    endurance: 0,
                    speed: 0,
                    luck: 0
                };

                const stats = [
                    "hp",
                    "defense",
                    "strength",
                    "persuasion",
                    "endurance",
                    "speed",
                    "luck"
                ];

                while (playerEntity.leader.statPoints > 0) {
                    const availableStats = stats.filter(stat => {
                        const statKey = stat === "hp" ? "maxHp" : stat;
                        return levelUpStatPointsAllocated[statKey] < 2;
                    });

                    if (availableStats.length === 0) {
                        break;
                    }

                    const stat = randomEntry(availableStats);
                    const statKey = stat === "hp" ? "maxHp" : stat;

                    if (stat === "hp") {
                        playerEntity.leader.stats.core.maxHp++;
                        playerEntity.leader.stats.core.hp =
                            playerEntity.leader.stats.core.maxHp;
                    } else {
                        playerEntity.leader.stats.core[stat]++;
                    }

                    levelUpStatPointsAllocated[statKey]++;
                    playerEntity.leader.statPoints--;
                }

                playerEntity.leader.refreshStats();

                updateBattleLog(
                    "Level up points have been randomly allocated. Good luck!"
                );
            }

            if (selectedOptionId === "confirm") {
                if (playerEntity.leader.statPoints > 0) {
                    updateBattleLog(
                        "You must allocate all points before continuing!"
                    );
                    return;
                }

                if (isLevelUpAllocation) {
                    isLevelUpAllocation = false;
                    updateBattleLog(
                        "Stats increased! You consume an unsuspecting rat to " +
                        "restore your health. Poor feller..."
                    );
                } else {
                    updateBattleLog(
                        `Stat allocation complete! You consume an ` +
                        `unsuspecting rat to ensure you are in good health, ` +
                        `and <span class="friendly">your adventure begins` +
                        `...</span>`
                    );
                }
                menu.close();
                // render();
                if (eatRatAnimationEnabled) {
                    GameControl.disableControls();

                    const gameLayers =
                        document.querySelectorAll("#viewport .layer");
                    gameLayers.forEach(layer => {
                        layer.classList.remove(
                            "lightening",
                            "darkening",
                            "dark"
                        );
                        layer.classList.add("dark");
                    });

                    ViewportAnimation.play(
                        "rat-chomp.webm",
                        {
                            onChomped: () => {
                                console.log("🐁 Rat has been consumed");
                            },
                            onEnd: () => {
                                console.info("Playback complete!");
                                gameLayers.forEach(layer => {
                                    layer.classList.remove('dark');
                                    layer.classList.add('lightening');
                                });

                                setTimeout(() => {
                                    gameLayers.forEach(layer => {
                                        layer.classList.remove('lightening');
                                    });

                                    GameControl.enableControls();
                                    render();
                                }, 600);
                            },
                        }
                    );
                }
            } else if (selectedOptionId === "reset") {
                if (isLevelUpAllocation) {
                    const coreStats = levelUpAllocatedStats.base;
                    playerEntity.leader.stats.core.hp =
                        playerEntity.leader.stats.core.maxHp =
                        coreStats.maxHp;
                    playerEntity.leader.stats.core.defense =
                        coreStats.defense;
                    playerEntity.leader.stats.core.strength =
                        coreStats.strength;
                    playerEntity.leader.stats.core.persuasion =
                        coreStats.persuasion;
                    playerEntity.leader.stats.core.endurance =
                        coreStats.endurance;
                    playerEntity.leader.stats.core.speed =
                        coreStats.speed;
                    playerEntity.leader.stats.core.luck =
                        coreStats.luck;
                    playerEntity.leader.statPoints = 6;

                    // Reset the per-stat allocation tracker
                    levelUpStatPointsAllocated = {
                        maxHp: 0,
                        defense: 0,
                        strength: 0,
                        persuasion: 0,
                        endurance: 0,
                        speed: 0,
                        luck: 0,
                    };

                    playerEntity.leader.refreshStats();

                    updateBattleLog(
                        "Level up stat allocation has been reset."
                    );
                } else {
                    resetStats();
                }
                // menu.render();
                // render();
            } else if (selectedOptionId === "rollDice") {
                isLevelUpAllocation
                    ? rollDiceForLevelUp()
                    : rollDiceForStats();

                // menu.render();
                // render();
            } else if (playerEntity.leader.statPoints > 0) {
                // Only restrict during level up, not initial allocation
                if (isLevelUpAllocation) {
                    // @TODO Simplify this
                    let statKey = null;
                    switch (selectedOptionId) {
                        case "hp": statKey = "maxHp"; break;
                        case "defense": statKey = "defense"; break;
                        case "strength": statKey = "strength"; break;
                        case "persuasion": statKey = "persuasion"; break;
                        case "endurance": statKey = "endurance"; break;
                        case "speed": statKey = "speed"; break;
                        case "luck": statKey = "luck"; break;
                    }
                    if (statKey && levelUpStatPointsAllocated[statKey] >= 2) {
                        updateBattleLog(
                            `<span class="action">You are only allowed 2 ` +
                            `points per stat at a time!</span>`
                        );
                        return;
                    }
                    if (statKey) {
                        playerEntity.leader.stats.core[statKey]++;

                        if (statKey === "maxHp") {
                            // Heal before setting the max to ensure that HP
                            // is adjusted before refreshing UI health bars
                            playerEntity.leader.stats.core.hp =
                                playerEntity.leader.stats.core.maxHp + 1;
                        }

                        playerEntity.leader.incrementCoreStat(statKey);

                        levelUpStatPointsAllocated[statKey]++;
                        playerEntity.leader.statPoints--;
                        // menu.render();
                        // render();
                        return;
                    }
                } else {
                    switch (selectedOptionId) {
                        case "hp":
                            playerEntity.leader.incrementCoreStat("maxHp");
                            // Intentional fallthrough
                        case "defense":
                        case "strength":
                        case "persuasion":
                        case "endurance":
                        case "speed":
                        case "luck":
                            playerEntity.leader
                                .incrementCoreStat(selectedOptionId);
                            break;
                    }

                    playerEntity.leader.statPoints--;
                    // menu.render();
                    // render();
                }
            } else {
                updateBattleLog("No points remaining to allocate!");
            }
        },
    }
});
