"use strict";

/**
 * Modal system for TardQuest
 *
 * Open a modal easily:
 * Modal.open("My Title", "<p>Hello world!</p>");
 *
 * Modals do not stack, so any modal that is opened will close any other modal
 */
const Modal = {
    // Active modal element
    _$modal: null,

    // Backdrop element
    _$backdrop: null,

    // The different types of button styles available in the modal
    // Names are inspired by IBM's Carbon Design system
    // - Primary
    //     The principal call to action. Should only appear once per modal
    // - Secondary
    //     A generic button. This is the default button type
    // - Danger
    //     For actions that may be dangerous or unwanted
    // - Ghost
    //     Intended for de-emphasized interactions. This is a borderless button
    _buttonTypes:
        ["primary", "secondary", "danger", "ghost"],

    // Default values if none are provided when opening
    _defaultTitle: "",
    _defaultBodyHtml: "",
    _defaultButtons: [
        {
            text: "Ok",
            type: "primary",
        },
    ],

    _navigateBody: null,
    _uiCursorSectionName: "modal",
    _onclose: null,
    _onclosebuttonclicked: null,

    /**
     * Open a new modal
     * This will close any currently-opened modals
     * Any buttons that are clicked will automatically close the modal
     *
     * @param string title The title of the modal
     * @param string bodyHtml The HTML contents of the modal
     * @param array buttons An array of objects that contain the following:
     *  - string text - The display text of the button, eg: "Ok"
     *  - ?string type The button's type. @see _buttonTypes
     *  - ?boolean disabled True if the button is disabled
     *  - ?function onclick A function to fire when the button is clicked
     * @param Object events An object of event handlers to fire
     * @param {(() => void)|null} [events.onopen] Fires when modal opens
     * @param {(() => void)|null} [events.onclose] Fires when modal closes
     * @param {(() => void)|null} [events.onclosebuttonclicked] Fires when the
     *    player clicks the modal's close button
     * @param ?function navigateBodyFunction Handles body navigation inputs
     */
    open: function (
        title,
        bodyHtml,
        buttons,
        events = {},
        navigateBodyFunction = null
    ) {
        this.close(); // Close any open modals

        const modalTitle = typeof title === "string"
            ? title
            : this._defaultTitle;

        const modalBodyHtml = typeof bodyHtml === "string"
            ? bodyHtml
            : this._defaultBodyHtml;

        const modalButtons = Array.isArray(buttons)
            ? buttons
            : this._defaultButtons;

        if (typeof navigateBodyFunction === "function") {
            this._navigateBody = navigateBodyFunction;
        }

        this._$backdrop = this._backdrop();
        document.body.appendChild(this._$backdrop);

        this._$modal = this._create(
            modalTitle,
            modalBodyHtml,
            modalButtons
        );

        this._onclosebuttonclicked =
            typeof events.onclosebuttonclicked === "function"
                ? events.onclosebuttonclicked : null;

        this._onclose = typeof events.onclose === "function"
            ? events.onclose
            : null;

        this._$modal.show();

        events.onopen?.();
    },

    // Returns true if the modal is open
    isOpen: function() {
        return this._$modal !== null;
    },

    _backdrop: function() {
        const $backdrop = document.createElement("div");
        $backdrop.classList.add("modal-backdrop");

        return $backdrop;
    },

    // Helper function to create the modal element and attach it to the DOM
    // This should not be called directly
    _create: function (title, bodyHtml, buttons) {
        const $modal = document.createElement("dialog");
        $modal.className = "modal";

        const $header = document.createElement("div");
        $header.className = "header";

        const $title = document.createElement("div");
        $title.className = "title";
        $title.innerText = title;
        $header.appendChild($title);

        const $closeButton = document.createElement("button");
        $closeButton.className = "close";
        $closeButton.title = "Close";
        $closeButton.onclick = () => {
            playSFX("uiCancel");
            Modal.close(true);
        };
        $header.appendChild($closeButton);

        $modal.appendChild($header);

        const $bodyContainer = document.createElement("div");
        $bodyContainer.className = "bodyContainer";

        const $body = document.createElement("div");
        $body.className = "body";
        $body.innerHTML = bodyHtml;
        $bodyContainer.appendChild($body);

        const $footer = document.createElement("div");
        $footer.className = "footer";

        Object.keys(buttons).forEach(key => {
            const button = buttons[key];
            const $button = document.createElement("button");
            $button.innerText =
                (typeof button?.text === "string" ? button.text : "");
            $button.className = this._buttonTypes.includes(button.type)
                ? button.type
                : "secondary";

            if (button.disabled) {
                $button.setAttribute("disabled", "disabled");
            }

            $button.onclick = () => {
                playSFX("uiSelect");

                if (typeof button.onclick !== "function" || button.onclick()) {
                    Modal.close();
                }
            };

            $footer.appendChild($button);
        });

        $bodyContainer.appendChild($footer);
        $modal.appendChild($bodyContainer);
        document.body.appendChild($modal);

        return $modal;
    },

    // Closes any opened modal
    close: function (closeButtonOrBackdropClicked = false) {
        UiCursor.remove(this._uiCursorSectionName);
        this._navigateBody = null;
        this._$backdrop?.remove();
        this._$modal?.remove();
        this._$modal = null;

        closeButtonOrBackdropClicked && this._onclosebuttonclicked?.();
        this._onclose?.();
    },

    togglePrimaryButtons: function(enable) {
        this._$modal?.querySelectorAll(".footer button.primary").forEach($e =>
            enable
                ? $e.removeAttribute("disabled")
                : $e.setAttribute("disabled", "disabled")
        );
    },

    // Handles modal inputs. Called by PlayerInput
    navigate: {
        up: function() {
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
            this._nav("select");
        },

        // @TODO Set handling for this action
        back: function() {
            this._nav("back");
        },

        _nav: function(action) {
            if (! Modal.isOpen()) {
                console.warn("Cannot navigate a closed modal", { action });
                return;
            }

            const { $activeElement, $section } = this._getActiveElement();

            if (! $activeElement) {
                this._Footer(null, "initialize");
                return;
            }

            const sectionName = this._getSectionName($section);

            // Handle select early for anything other than the body since the
            // header and footer will always activate it in the same way
            if (sectionName !== "body" && action === "select") {
                const $selectedElement =
                    Modal._$modal.querySelector(`.${this._activeClassname}`);

                if ($selectedElement) {
                    playSFX("uiSelect");
                    $selectedElement.click();
                }
            }

            switch (sectionName) {
                case "header":
                    this._Header($activeElement, action);
                    break;
                case "body":
                    this._Body($activeElement, action);
                    break;
                case "footer":
                    this._Footer($activeElement, action);
                    break;
                default:
                    console.error(
                        "Unknown section",
                        { sectionName, $activeElement, action }
                    );
                    break;
            }
        },

        _getSectionName: function($element) {
            if ($element instanceof Element) {
                if ($element.classList.contains("header")) {
                    return "header";
                }

                if ($element.classList.contains("body")) {
                    return "body";
                }
            }

            return "footer";
        },

        _activeClassname: "ui-active",

        _getActiveElement: function() {
            const $activeElement =
                Modal._$modal?.querySelector(`.${this._activeClassname}`);

            return {
                $activeElement,
                $section: this._getParentSection($activeElement),
            };
        },

        _getParentSection: function($element) {
            return $element?.closest(".header, .body, .footer") || null;
        },

        blur: function() {
            document.querySelectorAll(`.${this._activeClassname}`)
                .forEach($e => $e.classList.remove(this._activeClassname));
        },

        _activate: function ($element, playSfx = true, flicker = false) {
            if (! $element) {
                return;
            }

            if ($element?.classList.contains(this._activeClassname)) {
                return;
            }

            if (playSfx) {
                playSFX("uiOption");
            }

            this.blur();
            $element.classList.add(this._activeClassname);

            UiCursor.add($element, Modal._uiCursorSectionName);

            if (flicker) {
                UiCursor.flicker();
            }
        },

        _activateSelector: function(selector, playSfx, flicker) {
            if (typeof selector !== "string") {
                console.error(
                    "Selector must be a string",
                    { selector, playSfx, flicker }
                );
                return;
            }

            const $e = Modal._$modal.querySelector(selector);
            if ($e) {
                this._activate($e, playSfx, flicker);
            }
        },

        _Header: function($activeElement, direction) {
            switch (direction) {
                case "initialize":
                case "enter from bottom":
                    this._activateSelector(
                        ".header button.close:not(:disabled)",
                        direction !== "initialize"
                    );
                    break;
                case "down":
                    this._Body($activeElement, "enter from top");
                    break;
                case "up":
                case "left":
                case "right":
                    // Do nothing
                    break;
            }
        },

        _Body: function($activeElement, direction) {
            if (typeof Modal._navigateBody !== "function") {
                direction === "enter from bottom"
                    ? this._Header($activeElement, "enter from bottom")
                    : this._Footer($activeElement, "enter from top");
                return;
            }

            const navigationTarget =
                Modal._navigateBody($activeElement, direction);

            if (typeof navigationTarget !== "string") {
                return;
            }

            const parts =
                navigationTarget.split(",").map(e => e.trim()).filter(e => e);

            if (parts.length < 1) {
                console.error(
                    "Returned navigation was empty",
                    { navigationTarget }
                );
                return;
            }

            switch (parts[0]) {
                case "header":
                    this._Header(
                        $activeElement,
                        parts[1] || "enter from bottom"
                    );
                    break;
                case "footer":
                    this._Footer(
                        $activeElement,
                        parts[1] || "enter from top"
                    );
                    break;
                default:
                    // Nowhere to go; do nothing
                    break;
            }
        },

        _Footer: function($activeElement, direction) {
            const index = $activeElement && Array
                .from($activeElement.parentElement.children)
                .indexOf($activeElement);

            if (direction.startsWith("button")) {
                const buttonType = direction.replace(/^button\s+/i, "");
                for (const type of Modal._buttonTypes) {
                    if (type !== buttonType) {
                        continue;
                    }

                    this._activateSelector(
                        `.footer button.${type}:not(:disabled)`
                    );

                    return;
                }

                this._activateSelector(".footer button:not(:disabled)");
                return;
            }

            switch (direction) {
                case "initialize":
                case "enter from top":
                    this._activateSelector(`
                        .footer button.primary:not(:disabled),
                        .footer button.secondary:not(:disabled),
                        .footer button:not(.danger):not(:disabled),
                        .footer button:not(:disabled)
                    `);
                    break;

                case "up":
                    this._Body($activeElement, "enter from bottom");
                    break;

                case "left":
                    for (let i = index - 1; i >= 0; i--) {
                        const $sibling =
                            $activeElement.parentElement.children[i];

                        if ($sibling?.matches(":not(:disabled)")) {
                            this._activate($sibling);
                            break;
                        }
                    }
                    break;

                case "right":
                    const totalChildren =
                        $activeElement.parentElement.children.length;

                    for (let i = index + 1; i < totalChildren; i++) {
                        const $sibling =
                            $activeElement.parentElement.children[i];

                        if ($sibling?.matches(":not(:disabled)")) {
                            this._activate($sibling);
                            break;
                        }
                    }
                    break;

                case "down":
                    // Do nothing
                    break;

                case "back":
                    this._activateSelector(
                        ".footer button.danger:not(:disabled)"
                    );
                    break;
            }
        },
    },
};
