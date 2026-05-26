"use strict";

/**
 * PlayerInput calls the correct handlers for the player's keyboard and gamepad
 * interactions
 *
 * In other words, any keyboard, gamepad, or other type of controller inputs
 * should call this object's methods rather than try to interface with the game
 * themselves
 */
const PlayerInput = {
    pause: function() {
        this._handleInput("pause");
    },
    menu: function() {
        this._handleInput("menu");
    },
    inventory: function() {
        this._handleInput("inventory");
    },
    primary: function() {
        this._handleInput("primary");
    },
    cancel: function() {
        this._handleInput("cancel");
    },
    talk: function() {
        this._handleInput("talk");
    },
    up: function() {
        this._handleInput("up");
    },
    down: function() {
        this._handleInput("down");
    },
    left: function() {
        this._handleInput("left");
    },
    right: function() {
        this._handleInput("right");
    },
    strafeLeft: function() {
        this._handleInput("strafeLeft");
    },
    strafeRight: function() {
        this._handleInput("strafeRight");
    },

    _handleInput(action) {
        if (gameOver) {
            return;
        }

        const activateTitleScreen = TITLE_SCREEN.isActive &&
            ["pause", "menu", "primary"].includes(action);

        if (activateTitleScreen) {
            hideTitleScreen();
        }

        if (Modal.isOpen && action === "cancel") {
            playSFX("uiCancel");
            Modal.close();
            return;
        }

        const talkToParty =
            action === "talk" &&
            ! GameControl.awaitingPlayerText &&
            ! BattleSystem.isActive &&
            ! menu.isOpen();

        if (talkToParty) {
            GameControl.openPlayerTextInputBox(playerInput => {
                GameControl.disableControls();
                const message = playerInput || "...";

                playerEntity.leader.say(message, true, () => {
                    playerEntity.talk(null, playerInput);
                });
            });
            return;
        }

        if (GameControl.awaitingPlayerText) {
            return;
        }

        if (menu.isFocused()) {
            if (! animationActive) {
                menu.handleInput(action);
            }

            return;
        }

        if (action === "inventory") {
            playSFX("inventoryOpen");
            menu.open("inventory");

            return;
        }

        if (GameControl.CursorUi.isActive) {
            switch (action) {
                case "up":
                    GameControl.CursorUi.up();
                    break;
                case "down":
                    GameControl.CursorUi.down();
                    break;
                case "left":
                    GameControl.CursorUi.left();
                    break;
                case "right":
                    GameControl.CursorUi.right();
                    break;
                case "primary":
                    GameControl.CursorUi.select();
                    break;
                case "cancel":
                    GameControl.CursorUi.back();
                    break;
            }

            return;
        }

        switch (action) {
            case "up":
                move("forward");
                break;
            case "down":
                move("backward");
                break;
            case "left":
                turnLeft();
                break;
            case "right":
                turnRight();
                break;
            case "strafeLeft":
                move("strafeLeft");
                break;
            case "strafeRight":
                move("strafeRight");
                break;
            case "primary":
                wait();
                break;
            case "talk":
                speakingOutsideCombat = true;
                tryPersuade(e);
                break;
            case "cancel":
                // @TODO Make this escape-key specific (does this do anything else?)
                if (! GameControl.awaitingPlayerText) {
                    menu.open("gameSettings");
                }
                break;
            case "pause":
                menu.isOpenInBreadcrumbs("gameSettings")
                    ? menu.closeThrough("gameSettings")
                    : menu.open("gameSettings");
                break;
        }
    }
};
