"use strict";

/**
 * This object handles UI inputs and state changes for TardQuest
 *
 * This mostly involves enabling/disabling certain inputs and ensuring that the
 * correct UI elements are being displayed at appropriate times as well as
 * setting the correct input behavior
 *
 * GameControl has four modes that it uses to help determine what to show:
 *  - "title screen": The initial game mode, blocking game input
 *  - "navigation": Set when the player is wandering the map
 *  - "menu": Active when a menu is open
 *  - "combat": Active when the player is in a fight
 *
 * Calling GameControl.update() will look at the current state of the game and
 * determine which mode it should be in which will update the UI appropriately
 */
const GameControl = {
    mode: "title screen",
    enabled: true,
    awaitingPersuasionText: false,

    enableControls: () => {
        window._inputBlocked = false;
        GameControl.enabled = true;
        // Re-enable inventory sidebar buttons when controls are enabled
        if (typeof InventorySidebar !== "undefined") {
            InventorySidebar.setEnabled(true);
        }
        GameControl.update();
    },

    disableControls: () => {
        // Block input only if not awaiting persuasion text
        if (! GameControl.awaitingPersuasionText) {
            window._inputBlocked = true;
        }
        GameControl.enabled = false;
        // Disable inventory sidebar buttons while controls are disabled
        if (typeof InventorySidebar !== "undefined") {
            InventorySidebar.setEnabled(false);
        }
        GameControl.update();
    },

    enablePartyButtons: () => {
        const selector =
            "#partyMembers .party-member:not(.placeholder) " +
                "button.talk, " +
            "#partyMembers .party-member:not(.placeholder) " +
                "button.release";
        document.querySelectorAll(selector).forEach($button => {
            $button.removeAttribute("disabled");
        });
    },

    disablePartyButtons: () => {
        const selector =
            "#partyMembers .party-member:not(.placeholder) " +
                "button.talk, " +
            "#partyMembers .party-member:not(.placeholder) " +
                "button.release";
        document.querySelectorAll(selector).forEach($button => {
            $button.setAttribute("disabled", "true");
        });
    },

    enableInventorySidebarEquipmentButtons: () => {
        const $inventory = document.getElementById("inventory");
        const equipmentSections = ["weapons", "armor", "rings"];

        for (const $section of $inventory.children) {
            const sectionName = $section.getAttribute("name");

            if (equipmentSections.includes(sectionName)) {
                $section.setAttribute("disabled", "true");
            }
        }
    },

    disableInventorySidebarEquipmentButtons: () => {
        const $inventory = document.getElementById("inventory");
        const equipmentSections = ["weapons", "armor", "rings"];

        for (const $section of $inventory.children) {
            const sectionName = $section.getAttribute("name");

            if (equipmentSections.includes(sectionName)) {
                $section.removeAttribute("disabled");
            }
        }
    },

    getMode: () => {
        if (TITLE_SCREEN.isActive) {
            return "title screen";
        }

        return menu.isOpen()
            ? "menu"
            : (BattleSystem.isActive ? "combat" : "navigation");
    },


    updateMode: () => {
        const skipModeUpdate =
            ! TITLE_SCREEN.isActive &&
            ( GameControl.mode === "menu" && menu.isOpen()) ||
            ! menu.isOpen() && (
                ( GameControl.mode === "navigation" && ! BattleSystem.isActive ) ||
                ( GameControl.mode === "combat" && BattleSystem.isActive )
            );

        if (skipModeUpdate) {
            return;
        }

        GameControl.mode = GameControl.getMode();

        // Update the displayed buttons based on the mode
        document.querySelectorAll(`
            #playerInput .section.navigation,
            #mouseControl .navigation
        `).forEach($element => {
            $element.classList.toggle(
                "hidden",
                GameControl.mode !== "navigation"
            );
        });

        document.querySelectorAll(`
            #playerInput .section.battle,
            #mouseControl .combat
        `).forEach($element => {
            $element.classList.toggle(
                "hidden",
                GameControl.mode !== "combat"
            );
        });

        document.querySelectorAll(`
            #playerInput .section.menu
        `).forEach($element => {
            $element.classList.toggle(
                "hidden",
                GameControl.mode !== "menu"
            );
        });

        // Update the keyboard control display based on the mode
        const $controlsExploration =
            document.getElementById("controlsExploration");
        const $controlsCombat =
            document.getElementById("controlsCombat");
        const $controlsMenu =
            document.getElementById("controlsMenu");

        if (GameControl.mode === "menu") {
            $controlsMenu.classList.remove("hidden");
            $controlsExploration.classList.add("hidden");
            $controlsCombat.classList.add("hidden");
        } else if (GameControl.mode === "combat") {
            if (! GameControl.awaitingPersuasionText) {
                $controlsCombat.classList.remove("hidden");
                $controlsExploration.classList.add("hidden");
                $controlsMenu.classList.add("hidden");
            }
        } else {
            $controlsExploration.classList.remove("hidden");
            $controlsCombat.classList.add("hidden");
            $controlsMenu.classList.add("hidden");
        }
    },

    update: () => {
        if (gameOver) {
            const $mouseControl = document.getElementById("mouseControl");
            if ($mouseControl) {
                $mouseControl.style.display = "none";
            }
            return;
        } else {
            const $mouseControl = document.getElementById("mouseControl");
            if ($mouseControl) {
                $mouseControl.style.display = "block";
            }
        }

        GameControl.updateMode();

        switch (GameControl.mode) {
            case "title screen":
                // Nothing to do
                break;
            case "navigation":
                GameControl.updateNavigationControls();
                break;
            case "menu":
                GameControl.updateMenuControls();
                break;
            case "combat":
                GameControl.updateCombatControls();
                break;
            default:
                console.error(
                    "Unknown GameControl mode",
                    { mode: GameControl.mode }
                );
                break;
        }
    },

    updateNavigationControls: () => {
        const $playerInput = document.getElementById("playerInput");
        const $mouseControl = document.getElementById("mouseControl");

        // Move Forward
        const frontX = playerEntity.x + DX[playerEntity.direction];
        const frontY = playerEntity.y + DY[playerEntity.direction];
        const cellInFrontOfPlayer = MAP.getCell(frontX, frontY);
        const controlsEnabled =
            GameControl.enabled &&
            ! playerEntity.movementDisabled;

        const touchEnabled =
            controlsEnabled &&
            cellInFrontOfPlayer.entities
                .some(e => typeof e.onTouch === "function");

        // @TODO Replace this with tag check once entity tags are implemented
        const enemyIsInFrontOfPlayer =
            touchEnabled &&
            cellInFrontOfPlayer.entities.some(
                e => e.type === "vampire" || e.className === "roamingEnemy"
            );

        const moveForwardEnabled =
            controlsEnabled &&
            ! touchEnabled &&
            cellInFrontOfPlayer?.isWall === false;

        if (moveForwardEnabled || touchEnabled) {
            $playerInput.querySelector('[name="forward"]')
                ?.removeAttribute("disabled");
        } else {
            $playerInput.querySelector('[name="forward"]')
                ?.setAttribute("disabled", "true");
        }
        const $touch = $mouseControl.querySelector(".touch");
        $touch?.classList.toggle("hidden", ! touchEnabled);
        $touch?.classList.toggle("attack", enemyIsInFrontOfPlayer);

        $mouseControl.querySelector(".forward")?.classList
            .toggle("hidden", ! moveForwardEnabled);

        // Move Left
        const leftX = playerEntity.x + DX[(playerEntity.direction + 3) % 4];
        const leftY = playerEntity.y + DY[(playerEntity.direction + 3) % 4];
        const cellLeftOfPlayer = MAP.getCell(leftX, leftY);
        const strafeLeftEnabled =
            controlsEnabled &&
            cellLeftOfPlayer?.isWall === false;
        if (strafeLeftEnabled) {
            $playerInput.querySelector('[name="strafe-left"]')
                ?.removeAttribute("disabled");
        } else {
            $playerInput.querySelector('[name="strafe-left"]')
                ?.setAttribute("disabled", "true");
        }
        $mouseControl.querySelector(".strafe-left")?.classList
            .toggle("hidden", ! strafeLeftEnabled);

        // Move Right
        const rightX = playerEntity.x + DX[(playerEntity.direction + 1) % 4];
        const rightY = playerEntity.y + DY[(playerEntity.direction + 1) % 4];
        const cellRightOfPlayer = MAP.getCell(rightX, rightY);
        const strafeRightEnabled =
            controlsEnabled &&
            cellRightOfPlayer?.isWall === false;
        if (strafeRightEnabled) {
            $playerInput.querySelector('[name="strafe-right"]')
                ?.removeAttribute("disabled");
        } else {
            $playerInput.querySelector('[name="strafe-right"]')
                ?.setAttribute("disabled", "true");
        }
        $mouseControl.querySelector(".strafe-right")?.classList
            .toggle("hidden", !strafeRightEnabled);

        // Move Backward
        const backX = playerEntity.x - DX[playerEntity.direction];
        const backY = playerEntity.y - DY[playerEntity.direction];
        const cellBehindPlayer = MAP.getCell(backX, backY);
        const moveBackwardEnabled =
            controlsEnabled &&
            cellBehindPlayer?.isWall === false;
        if (moveBackwardEnabled) {
            $playerInput.querySelector('[name="backward"]')
                ?.removeAttribute("disabled");
        } else {
            $playerInput.querySelector('[name="backward"]')
                ?.setAttribute("disabled", "true");
        }
        $mouseControl.querySelector(".backward")?.classList
            .toggle("hidden", !moveBackwardEnabled);

        // Turn Left and Right - always enabled, never on SPD cooldown
        const turningEnabled = GameControl.enabled;
        $playerInput
            .querySelectorAll('[name="turn-left"], [name="turn-right"]')
            .forEach(($button) => turningEnabled
                ? $button.removeAttribute("disabled")
                : $button.setAttribute("disabled", "true")
            );

        // Wait functionality - always enabled during exploration
        const waitEnabled = controlsEnabled;
        $playerInput.querySelector('[name="wait"]')
            ?.removeAttribute("disabled");
        if (! waitEnabled) {
            $playerInput.querySelector('[name="wait"]')
                ?.setAttribute("disabled", "true");
        }
    },

    updateMenuControls: () => {
        const pagination = menu.getPagination();

        document
            .querySelectorAll('#playerInput .section.menu [name]')
            .forEach(($button) => {
                let enabled = true;
                switch ($button.getAttribute('name')) {
                    case "up":
                    case "down":
                        enabled = pagination.itemsOnCurrentPage > 1;
                        break;
                    case "previous-page":
                        enabled = pagination.hasPreviousPage;
                        break;
                    case "next-page":
                        enabled = pagination.hasNextPage;
                        break;
                }

                GameControl.enabled && enabled
                    ? $button.removeAttribute("disabled")
                    : $button.setAttribute("disabled", "true");
            });
    },

    updateCombatControls: () => {
        const index = BattleSystem.playerPartyMemberIndex;
        const activePartyMember = BattleSystem.playerEntity?.party?.[index];

        document
            .querySelectorAll("#playerInput .section.battle [name]")
            .forEach($button => {
                const buttonName = $button.getAttribute("name");
                let enabled = GameControl.enabled;

                switch (buttonName) {
                    case "attack":
                        const canAttack =
                            ! BattleSystem
                                .attackRestricted(activePartyMember) &&
                            activePartyMember?.getEffectiveTrait("canAttack");

                        if (! canAttack) {
                            enabled = false;
                        }

                        if (enabled) {
                            $button.dataset.tooltiphtml = `
                                <div class="genericTooltip">
                                    KILL THAT SUCKA!
                                </div>
                            `;
                        } else {
                            $button.dataset.tooltiphtml = `
                                <div class="genericTooltip warning">
                                    Can't attack!
                                </div>
                            `;
                        }
                        break;
                    case "persuade":
                        const canPersuade =
                            ! BattleSystem
                                .persuadeRestricted(activePartyMember) &&
                            activePartyMember?.getEffectiveTrait("canPersuade");

                        if (! canPersuade) {
                            enabled = false;
                        }

                        if (enabled) {
                            $button.dataset.tooltiphtml = `
                                <div class="genericTooltip">
                                    Persuade the enemy to join your party
                                </div>
                            `;
                        } else {
                            $button.dataset.tooltiphtml = `
                                <div class="genericTooltip warning">
                                    Can't persuade the enemy to join your party!
                                </div>
                            `;
                        }
                        break;
                    case "run":
                        const canRun =
                            ! BattleSystem.runRestricted(activePartyMember) &&
                            activePartyMember?.getEffectiveTrait("canRun");

                        if (! canRun) {
                            enabled = false;
                        }

                        if (enabled) {
                            $button.dataset.tooltiphtml = `
                                <div class="genericTooltip">
                                    Run away like a coward
                                </div>
                            `;
                        } else {
                            $button.dataset.tooltiphtml = `
                                <div class="genericTooltip warning">
                                    Can't run away!
                                </div>
                            `;
                        }
                        break;
                    default:
                        console.warn("Unknown button", { buttonName });
                        break;
                }

                enabled
                    ? $button.removeAttribute("disabled")
                    : $button.setAttribute("disabled", "true");
            });
    },

    initializeEnemyPartySection: (enemyEntity) => {
        const $enemyParty = document.getElementById("enemyParty");
        if (! $enemyParty) {
            console.error("Enemy party element not found");
            return;
        }

        const $totalPartyMembers =
            $enemyParty.querySelector(".total-party-members");
        if (! $totalPartyMembers) {
            console.error(
                "Total party members section not found",
                { $enemyParty }
            );
            return;
        }
        $totalPartyMembers.textContent = enemyEntity.party
            .filter(e => ! e.isDead()).length.toLocaleString(undefined);

        const $maxPartyMembers =
            $enemyParty.querySelector(".max-party-members");
        if (! $maxPartyMembers) {
            console.error(
                "Max party members section not found",
                { $enemyParty }
            );
            return;
        }
        $maxPartyMembers.textContent = enemyEntity.party.length
            .toLocaleString(undefined);

        const $partyMembers = $enemyParty.querySelector(".party-members");
        if (! $partyMembers) {
            console.error("Party members section not found", { $partyMembers });
            return;
        }

        $partyMembers.replaceChildren();

        for (const partyMember of enemyEntity.party) {
            const $partyMember = document.createElement("div");
            $partyMember.className = "party-member button";
            $partyMember.dataset.partyMemberId = partyMember.id;

            const $portrait = document.createElement("div");
            $portrait.classList.add("portrait", "flipped", partyMember.type);
            $portrait.style.setProperty("--tint-color", partyMember.color);
            $partyMember.appendChild($portrait);

            const $container = document.createElement("div");
            $container.className = "container";

            const $name = document.createElement("div");
            $name.className = "name";
            $container.appendChild($name);

            const $info = document.createElement("div");
            $info.className = "info";

            const $healthBar = document.createElement("progress-bar");
            $healthBar.className = "health-bar";
            $healthBar.setAttribute("data-stat-core", "hp");
            $healthBar.setAttribute("height", 20);
            $healthBar.setAttribute(
                "value",
                partyMember.getEffectiveCoreStat("hp")
            );
            $healthBar.setAttribute(
                "max",
                partyMember.getEffectiveCoreStat("maxHp")
            );
            $healthBar.setAttribute("cautionAtOrBelowPercentage", 25);
            $healthBar.setAttribute("dangerAtOrBelowPercentage", 10);
            $info.appendChild($healthBar);

            $container.appendChild($info);
            $partyMember.appendChild($container);

            $partyMembers.appendChild($partyMember);
            partyMember.$stats = $partyMember;

            partyMember.statEventHandlers = {
                core: {
                    hp: (effectiveHp) => {
                        partyMember.$stats
                            .querySelector(`[data-stat-core="hp"]`)
                            .setAttribute("value", effectiveHp);
                    },
                    maxHp: (effectiveMaxHp) => {
                        partyMember.$stats
                            .querySelector(`[data-stat-core="hp"]`)
                            .setAttribute("max", effectiveMaxHp);
                    },
                },
            };

            // Adjust letter spacing before filling in the name so it all fits
            const letterSpacingCh = GameControl._calculateLetterSpacingCh(
                $name, partyMember.name
            );

            if (letterSpacingCh !== null) {
                $name.style.letterSpacing = `${letterSpacingCh}ch`;
            }

            $name.textContent = partyMember.name;
        }
    },

    _calculateLetterSpacingCh: ($element, text) => {
        if (! ($element instanceof Element)) {
            console.error("$element must be a DOM element", { $element });
            return null;
        }

        if (typeof text !== "string") {
            console.error("text must be a string", { text });
            return null;
        }

        const targetWidthPx = $element.getBoundingClientRect().width;
        const characterCount = text.length;

        if (characterCount <= 1) {
            return null;
        }

        const gapCount = characterCount - 1;

        // Reuse a hidden measuring node so we get real DOM text metrics.
        const $measurementNode = document.createElement("span");
        const computedStyle = window.getComputedStyle($element);

        $measurementNode.textContent = text;
        Object.assign($measurementNode.style, {
            position: "absolute",
            visibility: "hidden",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            left: "-999999px",
            top: "0",

            font: computedStyle.font,
            fontKerning: computedStyle.fontKerning,
            fontFeatureSettings: computedStyle.fontFeatureSettings,
            fontVariationSettings: computedStyle.fontVariationSettings,
            fontStretch: computedStyle.fontStretch,
            fontStyle: computedStyle.fontStyle,
            fontVariant: computedStyle.fontVariant,
            fontWeight: computedStyle.fontWeight,
            fontSize: computedStyle.fontSize,
            fontFamily: computedStyle.fontFamily,
            textTransform: computedStyle.textTransform,
        });

        document.body.appendChild($measurementNode);
        let spacing;

        for (spacing = 0; spacing > -1; spacing -= 0.01) {
            $measurementNode.style.letterSpacing = `${spacing}ch`;

            const naturalWidthPx =
                $measurementNode.getBoundingClientRect().width;

            if (naturalWidthPx <= targetWidthPx) {
                $measurementNode.remove();
                return spacing;
            }
        }

        $measurementNode.remove();
        return spacing;
    },

    clearEnemyPartySection: (enemyEntity) => {
        // Remove stat element references
        for (const partyMember of enemyEntity.party) {
            delete partyMember.statEventHandlers;
            delete partyMember.$stats;
        }

        const $partyMembers =
            document.querySelector("#enemyParty .party-members");
        if (! $partyMembers) {
            console.error("Enemy party members element not found");
            return;
        }

        $partyMembers.replaceChildren();
    },

    showPlayerPartySection: (selectedEntityCallback = null, focus = false) => {
        GameControl._showPartySection(
            true,
            selectedEntityCallback,
            focus ? "player party" : null
        );
    },

    showEnemyPartySection: (selectedEntityCallback = null, focus = false) => {
        GameControl._showPartySection(
            false,
            selectedEntityCallback,
            focus ? "enemy party" : null
        );
    },

    _showPartySection: (
        showPlayerParty,
        selectedEntityCallback,
        gameControlFocus = null
    ) => {
        const $playerParty = document.getElementById("playerParty");
        if (! $playerParty) {
            console.error("Player party section not found");
            return;
        }

        const $enemyParty = document.getElementById("enemyParty");
        if (! $enemyParty) {
            console.error("Enemy party section not found");
            return;
        }

        const alreadyShowingRequestedSection =
            false && // @TODO Refactor this logic and check for relevance
            (showPlayerParty && $playerParty.classList.contains("active")) ||
            (! showPlayerParty && $enemyParty.classList.contains("active"));

        if (alreadyShowingRequestedSection) {
            if (gameControlFocus) {
                GameControl.BattleUi.initialize(gameControlFocus);
            }
            return;
        }

        if (gameControlFocus) {
            const focusCallback = () => {
                GameControl.BattleUi.initialize(gameControlFocus);
                $playerParty
                    .removeEventListener("transitionend", focusCallback);
            };

            $playerParty.addEventListener("transitionend", focusCallback);
        }

        if (showPlayerParty) {
            $playerParty.classList.add("active");
            $enemyParty.classList.remove("active");
        } else {
            $enemyParty.classList.add("active");
            $playerParty.classList.remove("active");
        }

        const addCallback =
            BattleSystem.isActive &&
            typeof selectedEntityCallback === "function";

        const $playerPartyMember = playerEntity.leader.$stats;
        $playerPartyMember.onclick = addCallback && showPlayerParty
            ? () => selectedEntityCallback(BattleSystem.playerEntity.leader)
            : null;

        const playerPartyMemberButtons = $playerParty.querySelectorAll(
            `.party-member[data-party-member-id]:not(.placeholder)`
        );

        for (const $partyMember of playerPartyMemberButtons) {
            const partyMemberId =
                parseInt($partyMember.dataset.partyMemberId, 10);

            const partyMember = BattleSystem.playerEntity.party
                .find(e => e.id === partyMemberId);

            const addClickHandler =
                addCallback && partyMember && showPlayerParty;

            $partyMember.onclick = addClickHandler
                ? () => selectedEntityCallback(partyMember)
                : null;
        }

        const enemyPartyMemberButtons = $enemyParty
            .querySelectorAll(`.party-member[data-party-member-id]`);

        for (const $partyMember of enemyPartyMemberButtons) {
            const partyMemberId =
                parseInt($partyMember.dataset.partyMemberId, 10);

            const partyMember = BattleSystem.enemyEntity.party
                .find(e => e.id === partyMemberId);

            const addClickHandler =
                addCallback && partyMember && ! showPlayerParty;

            $partyMember.onclick = addClickHandler
                ? () => selectedEntityCallback(partyMember)
                : null;
        }
    },

    /**
     * PERSUASION / TALK
     */
    persuasionCancelCallback: () => {},
    persuasionSubmitCallback: (playerMessage) => {},

    openPersuasionInputBox: (submitCallback, cancelCallback) => {
        GameControl.persuasionSubmitCallback =
            typeof submitCallback === "function" ? submitCallback : () => {};
        GameControl.persuasionCancelCallback =
            typeof cancelCallback === "function" ? cancelCallback : () => {};

        GameControl.awaitingPersuasionText = true;
        GameControl.disableControls();
        document.getElementById("inputBox").style.display = "flex";

        const $input = document.getElementById("persuadeInput");
        $input.value = "";

        // Delay the focus to ensure it's applied after rendering
        setTimeout(() => $input.focus(), 10);
    },

    cancelPersuasionInput: () => {
        GameControl.closePersuasionInputBox();
        GameControl.persuasionCancelCallback();
    },

    closePersuasionInputBox: () => {
        const $input = document.getElementById("inputBox");
        $input.style.display = "none";
        $input.value = "";

        setTimeout(() => {
            GameControl.awaitingPersuasionText = false;
            GameControl.enableControls();
        }, 200);
    },

    handlePersuasionInput: () => {
        const input =
            (document.getElementById("persuadeInput")?.value || "").trim();
        GameControl.closePersuasionInputBox();
        GameControl.persuasionSubmitCallback(input);
    },

    getInputDelayMs: () => {
        const minDelayMs = 1;
        const baseDelayMs = 2000;

        // 5% reduction per speed point
        const speedModifier =
            playerEntity.leader.getEffectiveCoreStat("speed") * 0.05;

        return Math.max(minDelayMs, baseDelayMs * (1 - speedModifier));
    },

    BattleUi: {
        activeClassname: "ui-active",

        _getParentSection: function($element) {
            if ($element?.id === "inventorySidebarCloseButton") {
                return document.querySelector("#inventory [name]:not(.hidden)");
            }

            const sectionSelector =
                "#stats, #battleInput, #enemyParty, #playerParty, " +
                "#inventory [name]:not(.hidden), #battleQueue";

            return $element?.closest(sectionSelector) || null;
        },

        _getCurrentActiveElement: function() {
            const $activeElement =
                document.querySelector(`.${this.activeClassname}`);

            return {
                $activeElement,
                $section: this._getParentSection($activeElement),
            };
        },

        initialize: function (sectionName) {
            switch (sectionName) {
                case "player party":
                    this._PlayerParty(null, "initialize");
                    break;
                case "enemy party":
                    this._EnemyParty(null, "initialize");
                    break;
                case "inventory":
                    this._Inventory(null, "initialize");
                    break;
                case "inventory items":
                    this._InventoryItems(null, "initialize");
                    break;
                case "battle queue":
                    this._BattleQueue(null, "initialize");
                    break;
                case "battle input":
                default:
                    this._BattleInput(null, "initialize");
                    break;
            }
        },
        back: function() {
            if (UiCursor.count() <= 1) {
                return;
            }

            UiCursor.previous(c =>
                c && this._activate(c.$pointingAt, c.sectionName)
            );
        },
        close: function() {
            UiCursor.remove();
            this.blur();
        },
        up: function () {
            this._nav("up");
        },
        down: function() {
            this._nav("down");
        },
        left: function() {
            this._nav("left");
        },
        right: function() {
            this._nav("right");
        },
        select: function() {
            const $selectedElement =
                document.querySelector(`.${this.activeClassname}`);

            if ($selectedElement) {
                playSFX("uiSelect");
                $selectedElement.click();
            }
        },
        blur: function() {
            document.querySelectorAll(`.${this.activeClassname}`)
                .forEach($e => $e.classList.remove(this.activeClassname));
        },
        _nav: function(direction) {
            const { $activeElement, $section } =
                this._getCurrentActiveElement();

            if (! $activeElement) {
                this._BattleInput(null, "initialize");
                return;
            }

            // @TODO Use an attribute other than ID to identify sections to
            //       consolidate these switch statements
            // Note that these switches return early instead of breaking
            switch ($section?.id) {
                case "stats":
                    this._Player($activeElement, direction);
                    return;
                case "battleInput":
                    this._BattleInput($activeElement, direction);
                    return;
                case "playerParty":
                    this._PlayerParty($activeElement, direction);
                    return;
                case "enemyParty":
                    this._EnemyParty($activeElement, direction);
                    return;
                case "inventory":
                    this._Inventory($activeElement, direction);
                    return;
                case "battleQueue":
                    this._BattleQueue($activeElement, direction);
                    return;
            }

            // Assume we're in the inventory section if we've reached this point
            switch ($section?.getAttribute("name")) {
                case "main":
                    this._Inventory($activeElement, direction);
                    return;
                case "items":
                    this._InventoryItems($activeElement, direction);
                    return;
            }

            console.warn(
                "Unknown section",
                { $section, $activeElement, direction }
            );
        },

        _activate: function ($element, sectionName = "", playSfx = true) {
            if (! $element) {
                return;
            }

            if ($element?.classList.contains(this.activeClassname)) {
                return;
            }

            if (playSfx) {
                playSFX("uiOption");
            }

            this.blur();
            $element.classList.add(this.activeClassname);

            if (GameControl.enabled) {
                UiCursor.add($element, sectionName);
            }
        },

        _BattleInput: function($activeElement, direction) {
            switch (direction) {
                case "initialize":
                case "enter from top":
                    const $firstButton = document
                        .querySelector("#battleInput [name]:not(:disabled)");

                    if ($firstButton) {
                        const playSfx = direction !== "initialize";
                        this._activate($firstButton, "", playSfx);
                    }
                    break;
                case "down":
                    let $next = $activeElement.nextElementSibling;

                    while ($next) {
                        if ($next.matches(":not(:disabled)")) {
                            this._activate($next);
                            break;
                        }

                        $next = $next.nextElementSibling;
                    }

                    break;
                case "up":
                    let previousSiblingMatched = false;
                    let $previous = $activeElement.previousElementSibling;

                    while ($previous) {
                        if ($previous.matches(":not(:disabled)")) {
                            this._activate($previous);
                            previousSiblingMatched = true;
                            break;
                        }

                        $previous = $previous.previousElementSibling;
                    }

                    if (! previousSiblingMatched) {
                        const activeInventorySection = document
                            .querySelector(`#inventory [name]:not(.hidden)`)
                            ?.getAttribute("name");

                        activeInventorySection === "items"
                            ? this._InventoryItems(
                                $activeElement,
                                "enter from bottom"
                            )
                            : this._Inventory(
                                $activeElement,
                                "enter from bottom"
                            );
                    }
                    break;
                case "left":
                    // Do nothing
                    break;
                case "right":
                    // Do nothing
                    break;
                case "enter from left":
                    UiCursor.remove();
                    GameControl.showPlayerPartySection();

                    const $attackButton =
                        document.querySelector(`#battleInput [name="attack"]`);

                    if (! $attackButton) {
                        console.error("Attack button not found");
                        break;
                    }

                    playSFX("uiCancel");
                    this._activate($attackButton, "", false);
                    break;
            }
        },

        _Player: function($activeElement, direction) {
            const sectionName = "party member";

            switch (direction) {
                case "initialize":
                case "enter from right":
                    this._activate(
                        document.querySelector("#stats .core"),
                        sectionName
                    );
                    break;
                case "right":
                case "down":
                    this._PlayerParty($activeElement, "enter from left");
                    break;
                case "left":
                case "up":
                    // Do nothing
                    break;
            }
        },

        _PlayerParty: function($activeElement, direction) {
            const sectionName = "party member";

            const index = $activeElement && Array
                .from($activeElement.parentElement.children)
                .indexOf($activeElement);

            switch (direction) {
                case "initialize":
                    const $firstPartyMember = document.querySelector(
                        "#playerParty .party-members [data-party-member-id]" +
                        ":not(.dead):not(.placeholder)"
                    );

                    $firstPartyMember
                        ? this._activate($firstPartyMember, sectionName)
                        : this._Player($activeElement, "initialize");
                    break;
                case "up":
                    let previousSiblingMatched = false;
                    let $previousSibling =
                        $activeElement.previousElementSibling;

                    while ($previousSibling) {
                        const siblingFound = $previousSibling
                            .matches(":not(.dead):not(.placeholder)");

                        if (siblingFound) {
                            this._activate($previousSibling, sectionName);
                            previousSiblingMatched = true;
                            break;
                        }

                        $previousSibling =
                            $previousSibling.previousElementSibling;
                    }

                    if (! previousSiblingMatched) {
                        this._Player($activeElement, "initialize");
                    }

                    break;
                case "down":
                    let $nextSibling = $activeElement.nextElementSibling;

                    while ($nextSibling) {
                        const siblingFound = $nextSibling
                            .matches(":not(.dead):not(.placeholder)");

                        if (siblingFound) {
                            this._activate($nextSibling, sectionName);
                            break;
                        }

                        $nextSibling = $nextSibling.nextElementSibling;
                    }

                    break;
                case "left":
                    this._Player($activeElement, "enter from right");
                    break;
                case "right":
                    this._BattleInput($activeElement, "enter from left");
                    break;
                case "enter from left":
                case "enter from right":
                    const $next = document.querySelector(
                        "#playerParty .party-members [data-party-member-id]" +
                        ":not(.dead):not(.placeholder)"
                    );

                    if ($next) {
                        this._activate($next, sectionName);
                        break;
                    }

                    direction === "enter from left"
                        ? this._BattleInput($activeElement, "enter from left")
                        : this._Player($activeElement, "enter from right")

                    break;
            }
        },

        _EnemyParty: function($activeElement, direction) {
            const sectionName = "party member";
            const index = $activeElement && Array
                .from($activeElement.parentElement.children)
                .indexOf($activeElement);

            const inLeftColumn = (index & 1) === 0;

            switch (direction) {
                case "initialize":
                    this._activate(
                        document.querySelector(
                            "#enemyParty .party-member:not(.dead)"
                        ),
                        sectionName,
                        false
                    );
                    break;
                case "up":
                    let previousSiblingMatched = false;
                    let $previousSibling = $activeElement
                        ?.previousElementSibling
                        ?.previousElementSibling;

                    while ($previousSibling) {
                        const siblingFound = $previousSibling
                            .matches(":not(.dead):not(.placeholder)");

                        if (siblingFound) {
                            this._activate($previousSibling, sectionName);
                            previousSiblingMatched = true;
                            break;
                        }

                        $previousSibling = $previousSibling
                            ?.previousElementSibling
                            ?.previousElementSibling;
                    }

                    if (! previousSiblingMatched && index > 1) {
                        let $previous = $activeElement?.previousElementSibling;
                        if (! inLeftColumn) {
                            $previous = $previous?.previousElementSibling;
                        }

                        while ($previous) {
                            const siblingFound = $previous
                                .matches(":not(.dead):not(.placeholder)");

                            if (siblingFound) {
                                this._activate($previous, sectionName);
                                break;
                            }

                            $previous = $previous?.previousElementSibling;
                        }
                    }

                    break;
                case "down":
                    let nextSiblingMatched = false;
                    let $nextSibling = $activeElement
                        ?.nextElementSibling
                        ?.nextElementSibling;

                    while ($nextSibling) {
                        const siblingFound = $nextSibling
                            .matches(":not(.dead):not(.placeholder)");

                        if (siblingFound) {
                            this._activate($nextSibling, sectionName);
                            nextSiblingMatched = true;
                            break;
                        }

                        $nextSibling = $nextSibling
                            ?.nextElementSibling
                            ?.nextElementSibling;
                    }

                    if (! nextSiblingMatched && index < 4) {
                        let $next = $activeElement?.nextElementSibling;
                        if (inLeftColumn) {
                            $next = $next?.nextElementSibling;
                        }

                        while ($next) {
                            const siblingFound =
                                $next.matches(":not(.dead):not(.placeholder)");

                            if (siblingFound) {
                                this._activate($next, sectionName);
                                break;
                            }

                            $next = $next?.nextElementSibling;
                        }
                    }

                    break;
                case "left":
                    if (inLeftColumn) {
                        break;
                    }

                    let leftSiblingFound = false;

                    for (let i = index - 1; i >= 0; i -= 2) {
                        const $sibling =
                            $activeElement.parentElement.children[i];
                        const siblingIsAvailable = $sibling
                            ?.matches(":not(.dead):not(.placeholder)");

                        if (siblingIsAvailable) {
                            leftSiblingFound = true;
                            this._activate($sibling, sectionName);
                            break;
                        }
                    }

                    if (leftSiblingFound) {
                        break;
                    }

                    for (let i = index + 1; i <= 4; i += 2) {
                        const $sibling =
                            $activeElement.parentElement.children[i];
                        const siblingIsAvailable = $sibling
                            ?.matches(":not(.dead):not(.placeholder)");

                        if (siblingIsAvailable) {
                            this._activate($sibling, sectionName);
                            break;
                        }
                    }

                    break;
                case "right":
                    if (! inLeftColumn) {
                        this._BattleInput($activeElement, "enter from left");
                        break;
                    }

                    let rightSiblingFound = false;

                    for (let i = index + 1; i >= 0; i -= 2) {
                        const $sibling =
                            $activeElement.parentElement.children[i];
                        const siblingIsAvailable = $sibling
                            ?.matches(":not(.dead):not(.placeholder)");

                        if (siblingIsAvailable) {
                            rightSiblingFound = true;
                            this._activate($sibling, sectionName);
                            break;
                        }
                    }

                    if (rightSiblingFound) {
                        break;
                    }

                    for (let i = index + 3; i <= 5; i += 2) {
                        const $sibling =
                            $activeElement.parentElement.children[i];
                        const siblingIsAvailable = $sibling
                            ?.matches(":not(.dead):not(.placeholder)");

                        if (siblingIsAvailable) {
                            rightSiblingFound = true;
                            this._activate($sibling, sectionName);
                            break;
                        }
                    }

                    if (! rightSiblingFound) {
                        this._BattleInput($activeElement, "enter from left");
                    }

                    break;
                case "enter from right":
                    for (const i of [1, 3, 5, 0, 2, 4]) {
                        const $sibling =
                            $activeElement.parentElement.children[i];
                        const siblingIsAvailable = $sibling
                            ?.matches(":not(.dead):not(.placeholder)");

                        if (siblingIsAvailable) {
                            this._activate($sibling, sectionName);
                            break;
                        }
                    }

                    break;
            }
        },

        _Inventory: function($activeElement, direction) {
            switch (direction) {
                case "initialize":
                case "enter from top":
                case "enter from bottom":
                    this._activate(
                        document.querySelector(`#inventory .items`),
                        "",
                        direction !== "initialize"
                    );
                    break;
                case "up":
                    this._BattleQueue($activeElement, "enter from bottom");
                    break;
                case "down":
                    this._BattleInput($activeElement, "enter from top");
                    break;
                case "left":
                    // Do nothing
                    break;
                case "right":
                    // Do nothing
                    break;
            }
        },

        _InventoryItems: function($activeElement, direction) {
            const activeElementIsItem = Boolean($activeElement?.dataset.id);

            switch (direction) {
                case "initialize":
                    this._activate(
                        document.querySelector(
                            `#inventory [name="items"] > button[data-id]` +
                            `:first-child:not(:disabled)`
                        ) ||
                            document
                                .getElementById("inventorySidebarCloseButton")
                    );
                    break;

                case "enter from top":
                    this._activate(
                        document.getElementById("inventorySidebarCloseButton")
                    );
                    break;

                case "enter from bottom":
                    const $lastItem =
                        document.querySelector(
                            `#inventory [name="items"] > button[data-id]` +
                            `:last-child:not(:disabled)`
                        ) ||
                        document.getElementById("inventorySidebarCloseButton");

                    if ($lastItem) {
                        $lastItem.scrollIntoView({
                            behavior: "instant",
                            block: "nearest",
                            inline: "nearest",
                        });

                        this._activate($lastItem);
                    }

                    break;

                case "up":
                    if ($activeElement.id === "inventorySidebarCloseButton") {
                        // Can't go up any further
                        break;
                    }

                    let $previous = $activeElement?.previousElementSibling;
                    let previousMatched = false;

                    while ($previous) {
                        if ($previous.matches(":not(:disabled)")) {
                            previousMatched = true;
                            $previous.scrollIntoView({
                                behavior: "instant",
                                block: "nearest",
                                inline: "nearest",
                            });

                            this._activate($previous);
                            break;
                        }

                        $previous = $previous?.previousElementSibling;
                    }

                    if (! previousMatched) {
                        const $closeButton = document
                            .getElementById("inventorySidebarCloseButton");
                        this._activate($closeButton);
                        break;
                    }

                    break;
                case "down":
                    const isOnCloseButton =
                        $activeElement.id === "inventorySidebarCloseButton";

                    let nextMatched = false;
                    let $next = isOnCloseButton
                        ? document.querySelector(
                            `#inventory [name="items"] > button[data-id]` +
                            `:first-child:not(:disabled)`
                        )
                        : $activeElement?.nextElementSibling;

                    while ($next) {
                        if ($next.matches(":not(:disabled)")) {
                            nextMatched = true;
                            $next.scrollIntoView({
                                behavior: "instant",
                                block: "nearest",
                                inline: "nearest",
                            });

                            this._activate($next);
                            break;
                        }

                        $next = $next?.nextElementSibling;
                    }

                    if (! nextMatched) {
                        this._BattleInput($activeElement, "enter from top");
                        break;
                    }

                    break;
                case "left":
                    // Do nothing
                    break;
                case "right":
                    // Do nothing
                    break;
            }
        },

        _BattleQueue: function($activeElement, direction) {
            const $battleQueue = document.getElementById("battleQueue");
            const totalPortraits = $battleQueue.children.length;
            const maxY = totalPortraits + 1 >> 1;
            const index = Number($activeElement.dataset.index);
            const x = Number($activeElement.dataset.x);
            const y = Number($activeElement.dataset.y);

            switch (direction) {
                case "initialize":
                    for (let i = 0; i < totalPortraits; i++) {
                        const $partyMember = $battleQueue
                            .querySelector(`[data-index="${i}"]:not(.dead)`);

                        if ($partyMember) {
                            this._activate($partyMember);
                            break;
                        }
                    }
                    break;
                case "enter from bottom":
                    let bottomYMatched = false;

                    for (let nextY = maxY - 1; nextY >= 0; nextY--) {
                        for (let nextX = 0; nextX < 2; nextX++) {
                            const $partyMember = $battleQueue.querySelector(
                                `[data-x="${nextX}"][data-y="${nextY}"]` +
                                `:not(.dead)`
                            );

                            if ($partyMember) {
                                bottomYMatched = true;
                                this._activate($partyMember);
                                break;
                            }
                        }

                        if (bottomYMatched) {
                            break;
                        }
                    }
                    break;
                case "up":
                    let upMatched = false;

                    for (const nextX of [x, Math.abs(x - 1)]) {
                        for (let nextY = y - 1; nextY >= 0; nextY--) {
                            const $partyMember = $battleQueue.querySelector(
                                `[data-x="${nextX}"][data-y="${nextY}"]` +
                                `:not(.dead)`
                            );

                            if ($partyMember) {
                                upMatched = true;
                                this._activate($partyMember);
                                break;
                            }
                        }

                        if (upMatched) {
                            break;
                        }
                    }

                    break;
                case "down":
                    let downMatched = false;

                    for (const nextX of [x, Math.abs(x - 1)]) {
                        for (let nextY = y + 1; nextY < maxY; nextY++) {
                            const $partyMember = $battleQueue.querySelector(
                                `[data-x="${nextX}"][data-y="${nextY}"]` +
                                `:not(.dead)`
                            );

                            if ($partyMember) {
                                downMatched = true;
                                this._activate($partyMember);
                                break;
                            }
                        }

                        if (downMatched) {
                            break;
                        }
                    }

                    if (downMatched) {
                        break;
                    }
                    /**
                    const $altNext = document.querySelector(
                        `#battleQueue > [data-x="${x - 1}"][data-y="${y + 1}"]`
                    );

                    if ($altNext) {
                        this._activate($altNext);
                        break;
                    }
                    **/

                    // @TODO If current party member can't open the inventory,
                    //       skip this section and move to the battle input

                    const activeSection = InventorySidebar
                        ?.getCurrentSectionElement().getAttribute("name");

                    switch (activeSection) {
                        case "main":
                            this._Inventory($activeElement, "enter from top");
                            break;

                        case "items":
                            this._InventoryItems(
                                $activeElement,
                                "enter from top"
                            );
                            break;
                    }

                    break;
                case "left":
                    if (x === 0) {
                        break;
                    }

                    let leftMatched = false;
                    for (let nextY = y; nextY >= 0; nextY--) {
                        const $partyMember = $battleQueue.querySelector(
                            `[data-x="${x - 1}"][data-y="${nextY}"]:not(.dead)`
                        );

                        if ($partyMember) {
                            leftMatched = true;
                            this._activate($partyMember);
                            break;
                        }
                    }

                    if (leftMatched) {
                        break;
                    }

                    for (let nextY = y + 1; nextY < maxY; nextY++) {
                        const $partyMember = $battleQueue.querySelector(
                            `[data-x="${x - 1}"][data-y="${nextY}"]:not(.dead)`
                        );

                        if ($partyMember) {
                            leftMatched = true;
                            this._activate($partyMember);
                            break;
                        }
                    }
                    break;
                case "right":
                    if (x === 1) {
                        break;
                    }

                    let rightMatched = false;
                    for (let nextY = y; nextY >= 0; nextY--) {
                        const $partyMember = $battleQueue.querySelector(
                            `[data-x="${x + 1}"][data-y="${nextY}"]:not(.dead)`
                        );

                        if ($partyMember) {
                            rightMatched = true;
                            this._activate($partyMember);
                            break;
                        }
                    }

                    if (rightMatched) {
                        break;
                    }

                    for (let nextY = y + 1; nextY < maxY; nextY++) {
                        const $partyMember = $battleQueue.querySelector(
                            `[data-x="${x + 1}"][data-y="${nextY}"]:not(.dead)`
                        );

                        if ($partyMember) {
                            rightMatched = true;
                            this._activate($partyMember);
                            break;
                        }
                    }
                    break;
            }
        },
    },
};