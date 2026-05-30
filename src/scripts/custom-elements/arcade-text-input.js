"use strict";

/**
 * Arcade Text Input Element for TardQuest
 *
 * This is a custom HTML element that displays an arcade-style text input.
 * Characters can be entered directly from the keyboard, cycled with the up
 * and down arrows, and selected with the left and right arrows
 *
 * Empty positions are displayed as dashes. The current cursor position is
 * highlighted, and the cursor cannot move beyond the next unset character
 *
 * @element arcade-text-input
 *
 * Values
 * @attribute {string} [value=""] - Current text value entered by the player
 * @attribute {number} [maxLength=3] - Maximum number of characters allowed
 * @attribute {string} [characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"] -
 *  Available characters that can be entered or cycled through
 *
 * Special Attributes
 * @attribute {boolean} [disabled] - If set, prevents focus and input
 *
 * Properties
 * @property {string} value - Current text value entered by the player
 * @property {string} characters - Available characters that can be entered or
 *  cycled through
 * @property {number} maxLength - Maximum number of characters allowed
 * @property {boolean} disabled - Whether the input is disabled
 *
 * Methods
 * @method focus - Moves focus to the internal input control
 * @method blur - Removes focus from the internal input control
 * @method setCursorIndex - Moves the cursor to a specific valid position
 * @method moveCursor - Moves the cursor by a relative amount
 * @method cycleCharacter - Cycles the current character by a relative amount
 *
 * Events
 * @fires input when the value changes
 * @fires change when the value changes after focus is lost
 */
class ArcadeTextInput extends HTMLElement {
    static formAssociated = true;

    static observedAttributes = [
        "characters",
        "disabled",
        "maxLength",
        "value"
    ];

    #characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    #$control = null;
    #$display = null;
    #cursorIndex = 0;
    #defaultValue = "";
    #internals = null;
    #maxLength = 3;
    #valueCharacters = [];
    #valueOnFocus = "";

    constructor() {
        super();

        try {
            if (this.attachInternals) {
                this.#internals = this.attachInternals();
            }
        } catch (error) {
            this.#internals = null;
        }

        const shadowRoot = this.attachShadow({
            mode: "open"
        });

        shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    font-family: monospace;
                    font-size: 2rem;
                    line-height: 1;
                    user-select: none;
                }

                :host([disabled]) {
                    opacity: 0.5;
                    pointer-events: none;
                }

                .control {
                    appearance: none;
                    background: transparent;
                    border: 0;
                    color: inherit;
                    cursor: pointer;
                    font: inherit;
                    margin: 0;
                    padding: 0;
                }

                .wrapper {
                    display: inline-flex;
                    gap: 0.25em;
                    padding: 0.25em 0.35em;
                    border: 2px solid currentColor;
                    border-radius: 0.25em;
                }

                .control:focus {
                    outline: none;
                }

                .control:focus .wrapper,
                :host(:focus-within) .wrapper {
                    outline: 2px solid currentColor;
                    outline-offset: 4px;
                }

                .character {
                    display: inline-block;
                    min-width: 1ch;
                    text-align: center;
                }

                :focus .character.current {
                    color: #32cd32;
                }

                .control:not(:focus) .character.empty {
                    filter: brightness(.5);
                }
            </style>

            <button
                class="control"
                part="control"
                type="button"
            >
                <span class="wrapper" part="wrapper"></span>
            </button>
        `;

        this.#$control = shadowRoot.querySelector(".control");
        this.#$display = shadowRoot.querySelector(".wrapper");

        this.#$control.addEventListener("keydown", event => {
            this.#handleKeyDown(event);
        });

        this.#$control.addEventListener("focus", () => {
            this.#valueOnFocus = this.value;
        });

        this.#$control.addEventListener("blur", () => {
            if (this.value === this.#valueOnFocus) {
                return;
            }

            this.dispatchEvent(new Event("change", {
                bubbles: true
            }));
        });

        this.#$control.addEventListener("pointerdown", () => {
            this.#$control.focus();
        });
    }

    connectedCallback() {
        this.setAttribute("role", "textbox");
        this.#syncFromAttributes();
        this.#render();
    }

    attributeChangedCallback() {
        this.#syncFromAttributes();
        this.#render();
    }

    formResetCallback() {
        this.value = this.#defaultValue;
    }

    focus(options) {
        this.#$control.focus(options);
    }

    blur() {
        this.#$control.blur();
    }

    get value() {
        return this.#valueCharacters.join("");
    }

    set value(newValue) {
        this.#setValueFromString(newValue);
        this.#render();
    }

    get characters() {
        return this.#characters;
    }

    set characters(newCharacters) {
        this.setAttribute("characters", String(newCharacters));
    }

    get maxLength() {
        return this.#maxLength;
    }

    set maxLength(newMaxLength) {
        this.setAttribute("maxLength", String(newMaxLength));
    }

    get disabled() {
        return this.hasAttribute("disabled");
    }

    set disabled(isDisabled) {
        this.toggleAttribute("disabled", Boolean(isDisabled));
    }

    setCursorIndex(cursorIndex) {
        const maximumCursorIndex = this.#getMaximumCursorIndex();
        this.#cursorIndex = Math.max(
            0,
            Math.min(cursorIndex, maximumCursorIndex)
        );

        this.#render();
    }

    #syncFromAttributes() {
        const characters = this.getAttribute("characters");
        if (characters !== null && characters.length > 0) {
            this.#characters = this.#dedupeCharacters(characters);
        }

        const maxLength =
            Number.parseInt(this.getAttribute("maxLength") || "", 10);

        if (Number.isInteger(maxLength) && maxLength > 0) {
            this.#maxLength = maxLength;
        }

        const attributeValue = this.getAttribute("value");

        if (attributeValue !== null) {
            this.#defaultValue = attributeValue;
            this.#setValueFromString(attributeValue);
        }

        if (! this.#$control) {
            return;
        }

        this.#$control.disabled = this.disabled;
        this.setAttribute("aria-disabled", String(this.disabled));
    }

    #dedupeCharacters(characters) {
        let result = "";

        for (const character of characters) {
            if (result.includes(character)) {
                continue;
            }

            result += character;
        }

        return result;
    }

    #setValueFromString(newValue) {
        const value = String(newValue).toUpperCase();
        const nextValueCharacters = [];

        for (const character of value) {
            const canUseCharacter = this.#characters.includes(character);
            if (! canUseCharacter) {
                continue;
            }

            nextValueCharacters.push(character);

            if (nextValueCharacters.length >= this.#maxLength) {
                break;
            }
        }

        this.#valueCharacters = nextValueCharacters;

        this.#cursorIndex = Math.min(
            this.#cursorIndex,
            this.#getMaximumCursorIndex()
        );

        this.#updateFormValue();
    }

    #handleKeyDown(event) {
        if (this.disabled) {
            return;
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            this.moveCursor(-1);
            return;
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            this.moveCursor(1);
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            this.cycleCharacter(1);
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            this.cycleCharacter(-1);
            return;
        }

        if (event.key === "Backspace") {
            event.preventDefault();
            this.#backspace();
            return;
        }

        if (event.key === "Delete") {
            event.preventDefault();
            this.#delete();
            return;
        }

        const character = event.key.toUpperCase();
        const isSingleCharacter = character.length === 1;
        const canUseCharacter = this.#characters.includes(character);

        if (! isSingleCharacter || ! canUseCharacter) {
            return;
        }

        event.preventDefault();
        this.#setCharacter(character);
        this.moveCursor(1);
    }

    #setCharacter(character) {
        const isNextEmptySlot =
            this.#cursorIndex === this.#valueCharacters.length;

        if (isNextEmptySlot) {
            this.#valueCharacters.push(character);
        } else {
            this.#valueCharacters[this.#cursorIndex] = character;
        }

        this.#emitInput();
    }

    cycleCharacter(direction) {
        const currentCharacter =
            this.#valueCharacters[this.#cursorIndex];
        let currentIndex = this.#characters.indexOf(currentCharacter);

        if (currentIndex === -1) {
            currentIndex = direction > 0 ? -1 : 0;
        }

        const nextIndex = this.#wrapIndex(
            currentIndex + direction,
            this.#characters.length
        );

        this.#setCharacter(this.#characters[nextIndex]);
    }

    #wrapIndex(index, length) {
        return ((index % length) + length) % length;
    }

    moveCursor(direction) {
        const maximumCursorIndex = this.#getMaximumCursorIndex();
        const nextCursorIndex = this.#cursorIndex + direction;
        this.#cursorIndex =
            Math.max(0, Math.min(nextCursorIndex, maximumCursorIndex));

        this.#render();
    }

    #getMaximumCursorIndex() {
        const isFull = this.#valueCharacters.length >= this.#maxLength;

        if (isFull) {
            return this.#maxLength - 1;
        }

        return this.#valueCharacters.length;
    }

    #backspace() {
        const isAtNextEmptySlot = this.#cursorIndex ===
            this.#valueCharacters.length;

        if (isAtNextEmptySlot && this.#cursorIndex > 0) {
            this.#cursorIndex--;
            this.#valueCharacters.splice(this.#cursorIndex, 1);
            this.#emitInput();
            return;
        }

        if (this.#valueCharacters[this.#cursorIndex] === undefined) {
            return;
        }

        this.#valueCharacters.splice(this.#cursorIndex, 1);
        this.#emitInput();
    }

    #delete() {
        if (this.#valueCharacters[this.#cursorIndex] === undefined) {
            return;
        }

        this.#valueCharacters.splice(this.#cursorIndex, 1);
        this.#emitInput();
    }

    #emitInput() {
        this.#updateFormValue();
        this.#render();

        this.dispatchEvent(new Event("input", {
            bubbles: true,
            composed: true
        }));
    }

    #updateFormValue() {
        if (! this.#internals) {
            return;
        }

        this.#internals.setFormValue(this.value);
    }

    #render() {
        if (! this.#$display || ! this.#$control) {
            return;
        }

        this.#$display.replaceChildren();

        for (let i = 0; i < this.#maxLength; i++) {
            const $character = document.createElement("span");
            $character.textContent = this.#valueCharacters[i] || "-";
            $character.className = "character" +
                (this.#valueCharacters[i] ? "" : " empty");
            $character.setAttribute("part", "character");

            if (i === this.#cursorIndex) {
                $character.classList.add("current");
                $character.setAttribute("part", "character current");
            }

            this.#$display.append($character);
        }

        this.#$control.setAttribute(
            "aria-label",
            `Arcade text input, value ${this.value || "blank"}, position ` +
                `${this.#cursorIndex + 1} of ${this.#maxLength}`
        );

        this.#updateFormValue();
    }
}

customElements.define("arcade-text-input", ArcadeTextInput);
