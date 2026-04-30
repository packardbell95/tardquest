"use strict";

/**
 * This object handles UI placement and display of the FF7-style middle finger
 * cursor that appears in various menus in the game
 */
const UiCursor = {
    _activeCursors: [],
    _flickerClass: "flicker",
    _cursorWidthPx: 44,
    _verticalOffsetPx: 22,

    add: function($element, sectionName = "") {
        if (! $element instanceof Element) {
            console.error(
                "$element must be a DOM element",
                { sectionName, $element }
            );
            return;
        }

        if (! typeof sectionName === "string") {
            console.error(
                "sectionName must be a string",
                { sectionName, $element }
            );
            return;
        }

        const $cursor = this._create(sectionName, $element);
        const targetRect = $element.getBoundingClientRect();

        const leftPlacement =
            window.scrollX + targetRect.x - this._cursorWidthPx;
        if (leftPlacement >= 0) {
            $cursor.classList.remove("flipped");
            $cursor.style.left = `${leftPlacement}px`;
        } else {
            const rightPlacement =
                window.scrollX + targetRect.x + targetRect.width;
            $cursor.classList.add("flipped");
            $cursor.style.left = `${rightPlacement}px`;
        }

        const relativeY = -(this._verticalOffsetPx - targetRect.height) / 2;
        $cursor.style.top = `${window.scrollY + targetRect.y + relativeY}px`;
        $cursor.classList.remove("hidden");
    },

    remove: function(sectionName) {
        const index = sectionName
            ? this._activeCursors.indexOf(e => e.sectionName === sectionName)
            : 0;

        if (index < 0) {
            console.warn(
                "Tried to remove a cursor from a section that doesn't have one",
                { sectionName }
            );
            return;
        }

        for (let i = this._activeCursors.length - 1; i >= index; i--) {
            this._activeCursors[i].$element.remove();
        }

        this._activeCursors = this._activeCursors.slice(0, index);

        const lastCursor =
            this._activeCursors?.[this._activeCursors.length - 1];
        if (lastCursor) {
            lastCursor.$element.classList.remove(this._flickerClass);
        }
    },

    flicker: function() {
        for (const cursor of this._activeCursors) {
            cursor.$element.classList.add(this._flickerClass);
        }
    },

    _create: function(sectionName, $pointingAt) {
        const $existingCursor = this._activeCursors
            .find(e => e.sectionName === sectionName)
            ?.$element;

        if ($existingCursor) {
            return $existingCursor;
        }

        const $cursor = document.createElement("div");
        $cursor.classList.add("tq-ui-cursor", "hidden");

        this.flicker();

        this._activeCursors.push({
            sectionName,
            $element: $cursor,
            $pointingAt,
        });
        document.body.appendChild($cursor);

        return $cursor;
    },
};