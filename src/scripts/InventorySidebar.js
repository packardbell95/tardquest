"use strict";

/**
 * Manages the inventory sidebar on the right side of the viewport
 *
 * @TODO Add styling and messaging to buttons and tooltips to show when gear
 *       cannot be equipped
 */
const InventorySidebar = {
    // Whether sidebar buttons are interactive
    enabled: true,

    // Sections of the sidebar, keyed by name
    sections: {
        main: {
            title: "Inventory",
            showCloseButton: false,
            allowScrolling: false,
        },
        items: {
            title: "Items",
            showCloseButton: true,
            allowScrolling: true,
        },
        weapons: {
            title: "Weapons",
            showCloseButton: true,
            allowScrolling: true,
        },
        armor: {
            title: "Armor",
            showCloseButton: true,
            allowScrolling: true,
        },
        rings: {
            title: "Rings",
            showCloseButton: true,
            allowScrolling: true,
        },
    },

    // Scrolling sensitivity when using the mouse wheel to scroll a section
    scrollAmountPx: 58,

    // Enable/disable all buttons within the sidebar without hiding it
    setEnabled: (enabled) => {
        InventorySidebar.enabled = Boolean(enabled);

        const buttons = [
            ...document.querySelectorAll('#inventory button'),
            document.getElementById('inventorySidebarCloseButton'),
            document.getElementById('inventorySidebarScrollUp'),
            document.getElementById('inventorySidebarScrollDown'),
        ].filter(Boolean);

        buttons.forEach(btn => {
            InventorySidebar.enabled
                ? btn.removeAttribute('disabled')
                : btn.setAttribute('disabled', 'true');
        });
    },

    scrollUp: () => {
        document.querySelector(`#inventory [name]:not(.hidden)`).scrollTop -=
            InventorySidebar.scrollAmountPx;
    },

    scrollDown: () => {
        document.querySelector(`#inventory [name]:not(.hidden)`).scrollTop +=
            InventorySidebar.scrollAmountPx;
    },

    showScrollButtons: () => {
        document
            .getElementById("inventorySidebarScrollUp")
            .classList
            .remove("hidden");

        document
            .getElementById("inventorySidebarScrollDown")
            .classList
            .remove("hidden");
    },

    hideScrollButtons: () => {
        document
            .getElementById("inventorySidebarScrollUp")
            .classList
            .add("hidden");

        document
            .getElementById("inventorySidebarScrollDown")
            .classList
            .add("hidden");
    },

    // Conceals buttons that should not be available during a fight
    enterCombat: () => {
        const currentMenu = document
            .querySelector(`#inventory [name]:not(.hidden)`)
            ?.getAttribute("name") || null;

        // If the player is on an equipment submenu, close it
        if (! ["main", "items"].includes(currentMenu)) {
            InventorySidebar.open("main");
        }

        document
            .querySelectorAll(`#inventory [name="main"] > button`)
            .forEach($button => {
                const hideButton =
                    $button.classList.contains("weapons") ||
                    $button.classList.contains("armor") ||
                    $button.classList.contains("rings");

                if (hideButton) {
                    $button.classList.add("hidden");
                }
            });

        InventorySidebar.updateScrollButtons(currentMenu);
    },

    // Reveals all buttons concealed during battle
    leaveCombat: () => {
        document
            .querySelectorAll(
                `#inventory [name="main"] > button.hidden`
            )
            .forEach($button => {
                $button.classList.remove("hidden");
            });

        playerEntity.movementDisabled = false;

        const $currentlyOpenedSection =
            InventorySidebar?.getCurrentSectionElement();
        const currentSectionName =
            $currentlyOpenedSection?.getAttribute("name");

        InventorySidebar.updateScrollButtons(currentSectionName);
    },

    updateScrollButtons: (sectionName) => {
        InventorySidebar.sections[sectionName]?.allowScrolling || false
            ? InventorySidebar.showScrollButtons()
            : InventorySidebar.hideScrollButtons();
    },

    // Changes the title text of the inventory sidebar
    changeTitle: (sectionName) => {
        document.getElementById("inventorySidebarTitle").innerText =
            InventorySidebar.sections[sectionName]?.title ||
            "[ ? ? ? ]";
    },

    // Shows/hides the close button depending on the requested section
    updateCloseButton: (sectionName) => {
        const $closeButton =
            document.getElementById("inventorySidebarCloseButton");

        const showCloseButton =
            InventorySidebar.sections[sectionName]?.showCloseButton ||
            false;

        showCloseButton
            ? $closeButton.classList.remove("hidden")
            : $closeButton.classList.add("hidden");
    },

    // Returns the currently-opened section's element
    getCurrentSectionElement: () =>
        document.querySelector("#inventory > [name]:not(.hidden)"),

    // Returns the requested section's element
    getSectionElement: (sectionName) =>
        document.querySelector(`#inventory > [name="${sectionName}"]`),

    close: () => {
        InventorySidebar
            .getCurrentSectionElement()
            ?.classList
            .add("hidden");

        document
            .getElementById("inventorySidebarCloseButton")
            .classList
            .add("hidden");

        InventorySidebar.hideScrollButtons();

        if (BattleSystem.isActive) {
            GameControl.BattleUi.initialize("inventory");
        }
    },

    // Shows the requested section in the sidebar
    open: (sectionName) => {
        InventorySidebar.changeTitle(sectionName);
        InventorySidebar.updateCloseButton(sectionName);
        InventorySidebar.updateScrollButtons(sectionName);

        const $currentlyOpenedSection =
            InventorySidebar?.getCurrentSectionElement();
        if ($currentlyOpenedSection) {
            const currentSectionName =
                $currentlyOpenedSection.getAttribute("name");

            if (currentSectionName === sectionName) {
                return;
            }

            $currentlyOpenedSection.classList.add("hidden");
        }

        const $section =
            InventorySidebar.getSectionElement(sectionName);
        if (! $section) {
            console.error(
                "Could not find the requested sidebar section",
                { sectionName }
            );
            return;
        }

        InventorySidebar.updateRightSidebar(sectionName);

        if (sectionName === "items" && BattleSystem.isActive) {
            GameControl.BattleUi.initialize("inventory items");
        }

        playSFX(sectionName === "main" ? "uiCancel" : "inventoryOpen");
        $section.classList.remove("hidden");
    },

    updateRightSidebar: (sectionName) => {
        if (! BattleSystem.isActive) {
            return;
        }

        const $battleQueueSection =
            document.getElementById("battleQueueSection");

        if (! $battleQueueSection) {
            console.error("No element for the battle queue section was found");
            return;
        }

        sectionName === "main"
            ? $battleQueueSection.classList.add("open")
            : $battleQueueSection.classList.remove("open");
    },

    // Refreshes items in a given section or all sections if no name is provided
    refresh: (sectionName) => {
        if (! sectionName) {
            Object.keys(InventorySidebar.sections).forEach(name => {
                InventorySidebar.refresh(name);
            });

            return;
        }

        switch (sectionName) {
            case "main":
                // The main section never changes
                return;
            case "items":
                InventorySidebar.refreshItems();
                return;
            case "weapons":
                InventorySidebar.refreshWeapons();
                return;
            case "armor":
                InventorySidebar.refreshArmor();
                return;
            case "rings":
                InventorySidebar.refreshRings();
                return;
        }

        console.error(
            "Inventory sidebar tried to refresh an unknown section",
            { sectionName }
        );
    },

    getStatsHtml: function(definition) {
        const stats = {};
        if (definition.damage) {
            stats["Base Damage"] = {
                value: definition.damage.base,
                className: "",
            };
            stats["Random Damage Multiplier"] = {
                value: definition.damage.multiplier,
                className: "",
            };
        }

        if (definition.coreStatModifiers?.defense) {
            stats["Defense"] = {
                value: definition.coreStatModifiers.defense,
                className: "",
            };
        }

        if (definition.weight) {
            stats["Load"] = {
                value: definition.weight,
                className: "",
            };
        }

        const keys = Object.keys(stats);
        if (keys.length < 1) {
            return "";
        }

        const tableRows = [];
        for (const key of keys) {
            if (typeof stats[key].value === "undefined") {
                console.error("Undefined value", { key, stat: stats[key] });
            }

            const displayValue =
                (stats[key].value || 0).toLocaleString(undefined);
            const rowHtml = `<tr>
                <td>${key}</td>
                <td class="value ${stats[key].className}">${displayValue}</td>
            </tr>`;

            tableRows.push(rowHtml);
        }

        return `<div class="stats-container"><table>
            <caption>Stats</caption>
            <tbody>${tableRows.join("")}</tbody>
        </table></div>`;
    },

    getRequirementsHtml: function(definition) {
        const requirements = definition?.coreStatRequirements || {};
        const stats = Object.keys(requirements);
        if (stats.length < 1) {
            return "";
        }

        const tableRows = [];
        for (const stat of stats) {
            const statName = stat.slice(0, 1).toLocaleUpperCase() +
                stat.slice(1);
            const value = requirements[stat];
            const playerValue = playerEntity.leader.stats.core[stat];
            const displayValue = value.toLocaleString(undefined);
            const displayPlayerValue = playerValue.toLocaleString(undefined);
            const playerMeetsRequirement = playerValue >= value;
            const requirementClass = playerMeetsRequirement
                ? "good"
                : "tooExpensive";

            const rowHtml = `<tr>
                <td>${statName}</td>
                <td class="value">${displayValue}</td>
                <td class="value ${requirementClass}">${displayPlayerValue}</td>
            </tr>`;

            tableRows.push(rowHtml);
        }

        return `<div class="stats-container"><table>
            <caption>Requirements</caption>
            <thead>
                <tr>
                    <th></th>
                    <th>Needed</th>
                    <th>Have</th>
                </tr>
            </thead>
            <tbody>${tableRows.join("")}</tbody>
        </table></div>`;
    },

    setButtonTooltip: ($button, definition, equippedText = "") => {
        const requirementsSection =
            InventorySidebar.getRequirementsHtml(definition);
        const statsSection = InventorySidebar.getStatsHtml(definition);

        const infoSection = (requirementsSection || statsSection)
            ? `<div class="info">${requirementsSection}${statsSection}</div>`
            : "";

        $button.setAttribute(
            "data-tooltipHtml",
            `<div class="inventoryTooltip">
                <div class="header">
                    <div class="name">${definition.name}</div>
                    <div class="friendly">${equippedText}</div>
                </div>
                <div class="details">
                    ${definition.description}
                </div>
                ${infoSection}
            </div>`
        );
        $button.setAttribute("data-tooltipPosition", "left");
        $button.setAttribute("data-tooltipGroupId", "inventorySidebar");
        Tooltip.refresh($button);
    },

    createButton: (sectionName, id, definition, quantity) => {
        const $button = document.createElement("button");
        $button.className = `${sectionName}-${id}`;
        $button.dataset.id = id;

        // Reflect current enabled state on creation
        if (! InventorySidebar.enabled) {
            $button.setAttribute("disabled", "true");
        }

        const $container = document.createElement("div");
        $container.className = "container";

        const $icon = document.createElement("div");
        $icon.className = "icon";

        const $label = document.createElement("div");
        $label.className = "label";
        $label.innerText = sectionName === "items"
            ? `${quantity.toLocaleString(undefined)}x`
            : "";

        $container.appendChild($icon);
        $container.appendChild($label);
        $button.appendChild($container);
        // Tooltip.initialize($button);

        return $button;
    },

    updateTooltip: ($button, sectionName, id, definition) => {
        function getEquippedText(sectionName, id) {
            const equipped = playerEntity.leader.equipped;

            switch(sectionName) {
                case "weapons":
                    return equipped.weapon === id
                        ? "Equipped"
                        : "";

                case "armor":
                    return equipped.armor === id
                        ? "Equipped"
                        : "";

                case "rings":
                    if (equipped.ring.left === id) {
                        return "Equipped, left hand";
                    }

                    if (equipped.ring.right === id) {
                        return "Equipped, right hand";
                    }

                    return "";

                case "items":
                default:
                    return "";
            }
        }

        const equippedText = getEquippedText(sectionName, id);
        InventorySidebar.setButtonTooltip($button, definition, equippedText);
    },

    /**
     * Items
     */
    refreshItems: () => {
        const $items = document.querySelector(`#inventory [name="items"]`);

        // Create and update item buttons
        for (const itemId of Object.keys(ITEMS)) {
            InventorySidebar.refreshItem(itemId);
        }
    },

    refreshItem: (itemId) => {
        const $items = document.querySelector(`#inventory [name="items"]`);
        let $button = $items.querySelector(`[data-id="${itemId}"]`);

        const quantity = InventorySidebar.getItemQuantity(itemId);
        if (! $button && quantity > 0) {
            // Create the item entry in the list
            $button = InventorySidebar.createItemButton(itemId);
            if (! $button) {
                console.error("Unable to create item button", { itemId });
                return;
            }
            $items.appendChild($button);
        } else if (quantity > 0) {
            // Update the count of the item entry in the list
            $button.querySelector(".label").innerText =
                `${quantity.toLocaleString(undefined)}x`;
        } else if ($button && quantity <= 0) {
            // Remove the button and its tooltip if the player doesn't
            // have the item
            const tooltipId = $button?.dataset?.tooltipid;
            $button.remove();

            if (tooltipId) {
                document.getElementById(tooltipId)?.remove();
            }

            return;
        }

        if (! $button) {
            return;
        }

        InventorySidebar.updateTooltip(
            $button,
            "items",
            itemId,
            ITEMS[itemId]
        );
    },

    getItemQuantity: (itemId) => {
        return itemId
            ? (playerEntity.inventory.contents.items[itemId] || 0)
            : 0;
    },

    createItemButton: (itemId) => {
        const item = ITEMS[itemId];
        if (! item) {
            console.error("Unknown item", { itemId });
            return null;
        }

        const quantity = InventorySidebar.getItemQuantity(itemId);
        if (quantity <= 0) {
            console.error(
                "Cannot create a button for an item that the player doesn't " +
                "have",
                { itemId }
            );
            return null;
        }

        const $button = InventorySidebar.createButton(
            "items",
            itemId,
            item,
            quantity
        );

        $button.onclick = function () {
            // Stop any keyboard presses from hitting the button again
            this.blur();

            playSFX("uiSelect");

            if (BattleSystem.isActive) {
                // const index = BattleSystem.playerPartyMemberIndex;
                // const activePartyMember =
                //     BattleSystem.playerEntity?.party?.[index];
                // if (! activePartyMember) {
                //     console.warn(
                //         "No active party members can queue item usage"
                //     );
                //     return;
                // }

                GameControl.BattleUi.currentAction = "useItem";

                const index = BattleSystem.playerPartyMemberIndex;
                const actor = BattleSystem.playerEntity.party?.[index];

                if (! actor?.getEffectiveTrait("canUse")) {
                    console.warn("Party member cannot use items", { actor });
                    return;
                }

                const useItemCallback = target =>
                    BattleSystem.useItem(actor, itemId, target);

                if (item.battleUsage.offensive) {
                    GameControl.BattleUi.initialize("enemy party");
                    GameControl.showEnemyPartySection(useItemCallback, true);
                } else {
                    GameControl.BattleUi.initialize("player party");
                    GameControl.showPlayerPartySection(useItemCallback, true);
                }
            } else {
                // @TODO Fix party selection here
                // GameControl.showPlayerPartySection();
                const usageTarget = ! item.battleUsage.offensive
                    ? playerEntity.leader
                    : null;

                const itemUsed = playerEntity.leader.useItem(
                    itemId,
                    usageTarget
                );
            }

            InventorySidebar.refreshItem(itemId);
        };

        return $button;
    },

    /**
     * Weapons
     */
    refreshWeapons: () => {
        const $weapons = document.querySelector(`#inventory [name="weapons"]`);

        // Create and update weapon buttons
        for (const weaponId of Object.keys(WEAPONS)) {
            InventorySidebar.refreshWeapon(weaponId);
        }
    },

    refreshWeapon: (weaponId) => {
        const $weapons = document.querySelector(`#inventory [name="weapons"]`);
        let $button = $weapons.querySelector(`[data-id="${weaponId}"]`);

        const quantity = InventorySidebar.getWeaponQuantity(weaponId);
        if (! $button && quantity > 0) {
            // Create the weapon entry in the list
            $button = InventorySidebar.createWeaponButton(weaponId);
            if (! $button) {
                console.error("Unable to create weapon button", { weaponId });
                return;
            }
            $weapons.appendChild($button);
        } else if ($button && quantity <= 0) {
            // Remove the button and its tooltip if the player doesn't own the
            // weapon
            const tooltipId = $button?.dataset?.tooltipid;
            $button.remove();

            if (tooltipId) {
                document.getElementById(tooltipId)?.remove();
            }

            return;
        }

        if (! $button) {
            return;
        }

        const weaponIsEquipped =
            playerEntity.leader.equipped.weapon === weaponId;

        if (weaponIsEquipped) {
            $button.classList.add("equipped");
        } else {
            $button.classList.remove("equipped");
        }

        InventorySidebar.updateTooltip(
            $button,
            "weapons",
            weaponId,
            WEAPONS[weaponId]
        );
    },

    getWeaponQuantity: (weaponId) => {
        if (! weaponId) {
            return 0;
        }

        return (
            (playerEntity.inventory.contents.weapons[weaponId] || 0) +
            (playerEntity.leader.equipped.weapon === weaponId ? 1 : 0)
        );
    },

    createWeaponButton: (weaponId) => {
        const weapon = WEAPONS[weaponId];
        if (! weapon) {
            console.error("Unknown weapon", { weaponId });
            return null;
        }

        const quantity = InventorySidebar.getWeaponQuantity(weaponId);
        if (quantity <= 0) {
            console.error(
                "Cannot create a button for a weapon that the player doesn't " +
                "have",
                { weaponId }
            );
            return null;
        }

        const $button = InventorySidebar.createButton(
            "weapons",
            weaponId,
            weapon,
            quantity
        );

        if (! playerEntity.leader.canEquipWeapon(weaponId)) {
            $button.classList.add("unequippable");
        }

        $button.onclick = function () {
            // Stop any keyboard presses from hitting the button again
            this.blur();

            playSFX("uiSelect");
            let previouslyEquippedWeaponId = null;

            if (BattleSystem.isActive) {
                const index = BattleSystem.playerPartyMemberIndex;
                const activePartyMember =
                    BattleSystem.playerEntity?.party?.[index];
                if (! activePartyMember) {
                    console.warn(
                        "No active party members can queue weapon equips"
                    );
                    return;
                }

                previouslyEquippedWeaponId = activePartyMember.equipped.weapon;

                BattleSystem.equipWeapon(activePartyMember, weaponId);
            } else if (! playerEntity.leader.canEquipWeapon(weaponId)) {
                const article = weapon.article === "" ? "" : "the";
                updateBattleLog(
                    `You are <span class="action">too wimpy</span> to wield ` +
                    `${article} <span class="friendly">${weapon.name}</span>.`
                );
                return;
            } else {
                previouslyEquippedWeaponId = playerEntity.leader.equipped.weapon;

                if (! playerEntity.leader.equipWeapon(weaponId)) {
                    console.error(
                        "Could not equip the selected weapon",
                        { weaponId }
                    );
                }
            }

            if (previouslyEquippedWeaponId) {
                InventorySidebar.refreshWeapon(previouslyEquippedWeaponId);
            }

            InventorySidebar.refreshWeapon(weaponId);
            render();
        };

        return $button;
    },

    /**
     * Armor
     */
    refreshArmor: () => {
        const $armor = document.querySelector(`#inventory [name="armor"]`);

        // Create and update armor buttons
        for (const armorId of Object.keys(ARMOR)) {
            InventorySidebar.refreshArmorPiece(armorId);
        }
    },

    refreshArmorPiece: (armorId) => {
        const $armor = document.querySelector(`#inventory [name="armor"]`);
        let $button = $armor.querySelector(`[data-id="${armorId}"]`);

        const quantity = InventorySidebar.getArmorQuantity(armorId);
        if (! $button && quantity > 0) {
            // Create the armor entry in the list
            const $button = InventorySidebar.createArmorButton(armorId);
            if (! $button) {
                console.error("Unable to create armor button", { armorId });
                return;
            }
            $armor.appendChild($button);
        } else if ($button && quantity <= 0) {
            // Remove the button and its tooltip if the player doesn't own the
            // armor
            const tooltipId = $button?.dataset?.tooltipid;
            $button.remove();

            if (tooltipId) {
                document.getElementById(tooltipId)?.remove();
            }

            return;
        }

        if (! $button) {
            return;
        }

        const armorIsEquipped = playerEntity.leader.equipped.armor === armorId;

        if (armorIsEquipped) {
            $button.classList.add("equipped");
        } else {
            $button.classList.remove("equipped");
        }

        InventorySidebar.updateTooltip(
            $button,
            "armor",
            armorId,
            ARMOR[armorId]
        );
    },

    getArmorQuantity: (armorId) => {
        if (! armorId) {
            return 0;
        }

        return (
            (playerEntity.inventory.contents.armor[armorId] || 0) +
            (playerEntity.leader.equipped.armor === armorId ? 1 : 0)
        );
    },

    createArmorButton: (armorId) => {
        const armor = ARMOR[armorId];
        if (! armor) {
            console.error("Unknown armor", { armorId });
            return null;
        }

        const quantity = InventorySidebar.getArmorQuantity(armorId);
        if (quantity <= 0) {
            console.error(
                "Cannot create a button for armor that the player doesn't have",
                { armorId }
            );
            return null;
        }

        const $button = InventorySidebar.createButton(
            "armor",
            armorId,
            armor,
            quantity
        );

        if (! playerEntity.leader.canEquipArmor(armorId)) {
            $button.classList.add("unequippable");
        }

        $button.onclick = function () {
            // Stop any keyboard presses from hitting the button again
            this.blur();

            playSFX("uiSelect");
            let previouslyEquippedArmorId = null;

            if (BattleSystem.isActive) {
                const index = BattleSystem.playerPartyMemberIndex;
                const activePartyMember =
                    BattleSystem.playerEntity?.party?.[index];
                if (! activePartyMember) {
                    console.warn(
                        "No active party members can queue armor equips"
                    );
                    return;
                }

                previouslyEquippedArmorId = activePartyMember.equipped.armor;

                BattleSystem.equipArmor(activePartyMember, armorId);
            } else if (! playerEntity.leader.canEquipArmor(armorId)) {
                updateBattleLog(
                    `You are <span class="action">too basic</span> to wear ` +
                    `the <span class="friendly">${armor.name}</span>.`
                );
                return;
            } else {
                previouslyEquippedArmorId = playerEntity.leader.equipped.armor;

                if (! playerEntity.leader.equipArmor(armorId)) {
                    console.error(
                        "Could not equip the selected armor",
                        { armorId }
                    );
                }
            }

            if (previouslyEquippedArmorId) {
                InventorySidebar.refreshArmorPiece(previouslyEquippedArmorId);
            }

            InventorySidebar.refreshArmorPiece(armorId);
            render();
        };

        return $button;
    },

    /**
     * Rings
     */
    refreshRings: () => {
        const $rings = document.querySelector(`#inventory [name="rings"]`);

        // Create and update ring buttons
        for (const ringId of Object.keys(RINGS)) {
            InventorySidebar.refreshRing(ringId);
        }
    },

    refreshRing: (ringId) => {
        const $ring = document.querySelector(`#inventory [name="rings"]`);
        let $button = $ring.querySelector(`[data-id="${ringId}"]`);

        const quantity = InventorySidebar.getRingQuantity(ringId);
        if (! $button && quantity > 0) {
            // Create the ring entry in the list
            $button = InventorySidebar.createRingButton(ringId);
            if (! $button) {
                console.error("Unable to create ring button", { ringId });
                return;
            }
            $ring.appendChild($button);
        } else if ($button && quantity <= 0) {
            // Remove the button and its tooltip if the player doesn't own the
            // ring
            const tooltipId = $button?.dataset?.tooltipid;
            $button.remove();

            if (tooltipId) {
                document.getElementById(tooltipId)?.remove();
            }

            return;
        }

        if (! $button) {
            return;
        }

        const ringIsEquipped =
            Object.values(playerEntity.leader.equipped.ring).includes(ringId);

        ringIsEquipped
            ? $button.classList.add("equipped")
            : $button.classList.remove("equipped");

        InventorySidebar.updateTooltip($button, "rings", ringId, RINGS[ringId]);
    },

    getRingQuantity: function (ringId) {
        if (! ringId) {
            return 0;
        }

        return (
            (playerEntity.inventory.contents.rings[ringId] || 0) +
            (playerEntity.leader.equipped.ring.left === ringId ? 1 : 0) +
            (playerEntity.leader.equipped.ring.right === ringId ? 1 : 0)
        );
    },

    createRingButton: (ringId) => {
        const ring = RINGS[ringId];
        if (! ring) {
            console.error("Unknown ring", { ringId });
            return null;
        }

        const quantity = InventorySidebar.getRingQuantity(ringId);
        if (quantity <= 0) {
            console.error(
                "Cannot create a button for a ring that the player doesn't " +
                "have",
                { ringId }
            );
            return null;
        }

        const $button = InventorySidebar.createButton(
            "rings",
            ringId,
            ring,
            quantity
        );

        if (! playerEntity.leader.canEquipRing(ringId)) {
            $button.classList.add("unequippable");
        }

        $button.onclick = function () {
            // Stop any keyboard presses from hitting the button again
            this.blur();

            playSFX("uiSelect");

            if (BattleSystem.isActive) {
                const index = BattleSystem.playerPartyMemberIndex;
                const activePartyMember =
                    BattleSystem.playerEntity?.party?.[index];
                if (! activePartyMember) {
                    console.warn(
                        "No active party members can queue ring equips"
                    );
                    return;
                }

                InventorySidebar.promptForRingHand(
                    activePartyMember,
                    ringId,
                    (partyMember, hand, newRingId) => newRingId
                        ? BattleSystem.equipRing(partyMember, hand, newRingId)
                        : BattleSystem.unequipRing(partyMember, hand)
                );

                return;
            }

            if (! playerEntity.leader.canEquipRing(ringId)) {
                const article = ring.article === "" ? "" : "the";
                updateBattleLog(
                    `You are <span class="action">too cheugy</span> to wear ` +
                    `${article} <span class="friendly">${ring.name}</span>.`
                );
                return;
            }

            InventorySidebar.promptForRingHand(
                playerEntity.leader,
                ringId,
                (partyMember, hand, newRingId) => {
                    const previousRingId = partyMember.equipped.ring[hand];
                    newRingId
                        ? partyMember.equipRing(hand, newRingId)
                        : partyMember.unequipRing(hand);

                    if (previousRingId) {
                        InventorySidebar.refreshRing(previousRingId);
                    }

                    InventorySidebar.refreshRing(newRingId);
                    render();
                }
            );
        };

        return $button;
    },

    promptForRingHand: (partyMember, ringId, callback) => {
        const ring = RINGS[ringId];
        if (! ring) {
            console.error("Ring does not exist", { ringId });
            return false;
        }

        const partyMemberIsPlayer = partyMember.id === playerEntity.leader.id;
        const partyMemberHasRingEquipped =
            ringId &&
            Object.values(partyMember.equipped.ring).includes(ringId);

        if (partyMemberHasRingEquipped) {
            const partyMemberPronoun = partyMemberIsPlayer ? "your" : "their";
            const partyMemberDisplayName = partyMemberIsPlayer
                ? ""
                : ` <span class="friendly">${partyMember.name}</span>`;

            const hand = partyMember.equipped.ring.left === ringId
                ? "left"
                : "right";

            const titleText = `Unequip ${ring.article} ${ring.name}?`;

            const modalMessageHtml =
                `Do you want ${partyMemberDisplayName} to ` +
                `<span class="action">unequip</span> ${ring.article} ` +
                `<span class="friendly">${ring.name}</span> from ` +
                `${partyMemberPronoun} <span class="friendly">${hand} hand` +
                `</span>?`;

            Modal.open(
                titleText,
                modalMessageHtml,
                [
                    {
                        text: "No",
                        type: "danger",
                    },
                    {
                        text: "Yes",
                        type: "primary",
                        onclick: () => callback(partyMember, hand, null),
                    },
                ]
            );

            return;
        }

        const leftRing = RINGS[partyMember.equipped.ring.left] || null;
        const rightRing = RINGS[partyMember.equipped.ring.right] || null;
        const displayName = partyMemberIsPlayer
            ? "Your"
            : `<span class="friendly">${partyMember.name}'s</span>`

        const leftHtml = leftRing
            ?   `${displayName} <span class="friendly">left ` +
                `hand</span> is currently wearing ${leftRing.article} ` +
                `<span class="action">${leftRing.name}</span>`
            : null;

        const rightHtml = rightRing
            ?   `${displayName} <span class="friendly">right ` +
                `hand</span> is currently wearing ${rightRing.article} ` +
                `<span class="action">${rightRing.name}</span>`
            : null;

        const currentlyEquippedHtml =
            [leftHtml, rightHtml].filter(e => e).join("<br>");

        const titleText = `Equip ${ring.article} ${ring.name}`;

        // Adjust the article to refer to a singular, eg: "a pinky toe ring"
        // becomes "the pinky toe ring", but "Pablo Escobar's Golden Ring" stays
        // unchanged
        const article = ring?.article !== "" ? "the" : "";

        const modalMessageHtml =
            `<p>Which hand should wear ${article} ` +
            `<span class="friendly">${ring.name}</span>?` +
            (
                currentlyEquippedHtml
                    ? `<p>${currentlyEquippedHtml}</p>`
                    : ""
            );

        Modal.open(
            titleText,
            modalMessageHtml,
            [
                {
                    text: "Left Hand",
                    onclick: () => callback(partyMember, "left", ringId),
                },
                {
                    text: "Right Hand",
                    onclick: () => callback(partyMember, "right", ringId),
                },
            ]
        );
    },
};