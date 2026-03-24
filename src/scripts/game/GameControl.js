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
            typeof cellInFrontOfPlayer?.onTouch === "function";
        const moveForwardEnabled =
            controlsEnabled &&
            ! touchEnabled &&
            cellInFrontOfPlayer?.isWall === false;

        // No "Touch" or "Interact" on the button menu yet since it's the same
        // as moving forward anyways
        if (moveForwardEnabled) {
            $playerInput.querySelector('[name="forward"]')
                ?.removeAttribute("disabled");
        } else {
            $playerInput.querySelector('[name="forward"]')
                ?.setAttribute("disabled", "true");
        }
        $mouseControl.querySelector(".touch")?.classList
            .toggle("hidden", ! touchEnabled);
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
        const activePartyMember =
            BattleSystem.playerEntity?.party?.[index];

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

    openPersuasionInputBox: () => {
        GameControl.awaitingPersuasionText = true;
        GameControl.disableControls();
        const $inputBox = document.getElementById("inputBox");
        const $input = document.getElementById("persuadeInput");
        $inputBox.style.display = "flex";
        $input.value = "";

        // Delay the focus to ensure it's applied after rendering
        setTimeout(() => $input.focus(), 10);
    },

    closePersuasionInputBox: () => {
        document.getElementById("inputBox").style.display = "none";
        setTimeout(() => {
            GameControl.awaitingPersuasionText = false;
            GameControl.enableControls();
        }, 200);
    },

    getInputDelayMs: () => {
        const minDelayMs = 1;
        const baseDelayMs = 2000;

        // 5% reduction per speed point
        const speedModifier =
            playerEntity.leader.getEffectiveCoreStat("speed") * 0.05;

        return Math.max(minDelayMs, baseDelayMs * (1 - speedModifier));
    },
};