"use strict";

/**
 * This object handles UI placement and display of the FF7-style middle finger
 * cursor that appears in various menus in the game
 */
const UiCursor = {
    _activeCursors: [],
    _flickerClass: "flicker",
    _cursorWidthPx: 44,
    _cursorHeightPx: 30,

    add: function($element, sectionName = "", position = null) {
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

        const cursorHorizontal =
            $element.dataset.cursorhorizontal ?? "left";

        const cursorVertical =
            $element.dataset.cursorvertical ?? "middle";

        const actualCursorHorizontal =
            cursorVertical === "middle" && cursorHorizontal === "middle"
                ? "left"
                : cursorHorizontal;

        const $cursor = this._create(sectionName, $element);
        const rect = $element.getBoundingClientRect();
        const cursorPositionSetSuccessfully =
            this._horizontal($cursor, rect, actualCursorHorizontal) &&
            this._vertical($cursor, rect, cursorVertical);

        if (cursorPositionSetSuccessfully) {
            $cursor.classList
                .add(`${actualCursorHorizontal}-${cursorVertical}`);
        }

        $cursor.classList.remove("hidden");
    },

    _horizontal: function($cursor, rect, position) {
        const horizontalOffsetPx = this._getHorizontalOffsetPx(position, rect);

        if (horizontalOffsetPx === null) {
            console.error("Unrecognized position", { position, $cursor, rect });
            return false;
        }

        $cursor.style.left = `${window.scrollX + horizontalOffsetPx}px`;
        return true;
    },

    _vertical: function($cursor, rect, position) {
        const verticalOffsetPx = this._getVerticalOffsetPx(position, rect);

        if (verticalOffsetPx === null) {
            console.error("Unrecognized position", { position, $cursor, rect });
            return false;
        }

        $cursor.style.top = `${window.scrollY + verticalOffsetPx}px`;
        return true;
    },

    _getHorizontalOffsetPx: function(position, rect) {
        switch (position) {
            case "left":
                return rect.x - this._cursorWidthPx;
            case "start":
                return rect.x;
            case "middle":
                return rect.x + (rect.width / 2) - (this._cursorWidthPx / 2);
            case "end":
                return rect.x + rect.width - this._cursorWidthPx;
            case "right":
                return rect.x + rect.width;
            default:
                return null;
        }
    },

    _getVerticalOffsetPx: function(position, rect) {
        switch (position) {
            case "top":
                return rect.y - this._cursorHeightPx;
            case "start":
                return rect.y;
            case "middle":
                return rect.y + (rect.height / 2) - (this._cursorHeightPx / 2);
            case "end":
                return rect.y + rect.height - this._cursorHeightPx;
            case "bottom":
                return rect.y + rect.height;
            default:
                return null;
        }
    },

    count: function() {
        return this._activeCursors.length;
    },

    previous: function(callback) {
        const cursors = this._activeCursors;

        const lastCursor = cursors.pop();
        if (lastCursor) {
            lastCursor.$element.remove();
        }

        const cursor = cursors.length < 1 ? null : cursors[cursors.length - 1];
        if (cursor) {
            cursor.$element.classList.remove(this._flickerClass);
        }

        if (typeof callback !== "function") {
            return;
        }

        callback(cursor);
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
            GameControl.BattleUi._activate(lastCursor.$pointingAt);
        }
    },

    flicker: function() {
        for (const cursor of this._activeCursors) {
            cursor.$element.classList.add(this._flickerClass);
        }
    },

    _create: function(sectionName, $pointingAt) {
        const className = "tq-ui-cursor hidden";

        const $existingCursor = this._activeCursors
            .find(e => e.sectionName === sectionName)
            ?.$element;

        if ($existingCursor) {
            $existingCursor.className = className;
            return $existingCursor;
        }

        const $cursor = document.createElement("div");
        $cursor.className = className;

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
