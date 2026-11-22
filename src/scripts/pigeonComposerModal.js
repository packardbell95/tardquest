"use strict";

/**
 * @fileoverview Carrier pigeon composer: lets the player draw a handdrawn
 * picture and/or write a short message using the standard TardQuest modal.
 *
 * Drawing payloads are validated server-side (tardquest-api). The grid, palette
 * size, stroke/point limits, and per-stroke line width mirror that contract:
 * every stroke carries a per-stroke width `w` (one of PigeonDrawing.WIDTHS).
 */

const PigeonDrawing = {
    // Palette indices match the server's 0..COLORS.length-1 color range
    COLORS: [
        "#f8f8f0",
        "#e04b4b",
        "#4caf50",
        "#3a86ff",
        "#f4d35e",
        "#e04fd4",
        "#f08a24",
        "#39d3c3",
    ],

    GRID: 100,
    MAX_STROKES: 64,
    MAX_POINTS: 64,
    MAX_PAYLOAD_BYTES: 8192,

    // Payload format version; every stroke carries a per-stroke width `w`.
    PAYLOAD_VERSION: 2,

    // Line thickness, in grid units. Width is chosen per stroke and travels in
    // the payload; STROKE_WIDTH is the default selection.
    STROKE_WIDTH: 1.5,
    WIDTHS: [1, 1.5, 3],
    DOT_RADIUS: 0.6,

    // Render a payload as inline SVG for display in menus and modals
    toSvg: function(drawing) {
        const strokes = drawing?.strokes;
        if (! Array.isArray(strokes) || ! strokes.length) {
            return "";
        }

        const marks = strokes.map(stroke => {
            const color = this.COLORS[stroke.c] || this.COLORS[0];
            const p = stroke.p;

            if (p.length === 2) {
                return `<circle cx="${p[0]}" cy="${p[1]}" ` +
                    `r="${this.DOT_RADIUS}" fill="${color}"/>`;
            }

            const points = [];
            for (let i = 0; i + 1 < p.length; i += 2) {
                points.push(`${p[i]},${p[i + 1]}`);
            }

            const w = stroke.w;

            return `<polyline points="${points.join(" ")}" fill="none" ` +
                `stroke="${color}" stroke-width="${w}" ` +
                `stroke-linecap="round" stroke-linejoin="round"/>`;
        }).join("");

        return `<svg class="pigeon-picture" viewBox="0 0 100 100" ` +
            `xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" ` +
            `fill="#101018"/>${marks}</svg>`;
    },
};

window.PigeonDrawing = PigeonDrawing;

/**
 * Show a delivered picture, plus any words that came with it, in a modal.
 *
 * @param {Object|null} drawing The delivered drawing payload
 * @param {string} [message] The text that came with it, if any
 * @returns {boolean} false when there was no picture to show, so the caller
 *                    can fall back to its own handling
 */
const openPigeonPictureModal = function(drawing, message) {
    const picture = PigeonDrawing.toSvg(drawing);
    const words = typeof message === "string" ? message.trim() : "";

    if (! picture) {
        return false;
    }

    const bodyHtml =
        `<div class="pc-viewer">` +
        picture +
        `<div id="pcViewerMessage" class="pc-viewer-message"></div>` +
        `</div>`;

    Modal.open("THE LETTER", bodyHtml, [{ text: "Close", type: "primary" }], {
        onopen: () => {
            GameControl.awaitingPlayerText = true;

            const $message = document.getElementById("pcViewerMessage");

            // Somebody else's words go in as text, never as markup
            if (words) {
                $message.textContent = words;
            } else {
                $message.remove();
            }
        },

        onclose: () => {
            GameControl.awaitingPlayerText = false;
        },
    });

    return true;
};

window.openPigeonPictureModal = openPigeonPictureModal;

const openPigeonComposerModal = function(onSend, options = {}) {
    const GRID = PigeonDrawing.GRID;
    const palette = PigeonDrawing.COLORS;
    const placeholder =
        options.placeholder || "Message for the next adventurer...";
    const maxLength = options.maxLength || 100;

    let color = 0;
    let strokeWidth = PigeonDrawing.STROKE_WIDTH;
    let drawingStroke = null;
    let drawingActive = false;
    let onResize = null;
    let sending = false;
    let erasing = false;
    const strokes = [];
    const undoStack = [];
    const redoStack = [];
    const ERASER_RADIUS = 5; // grid units; forgiving so clicks catch thin lines

    const swatchHtml = palette
        .map((c, i) =>
            `<button type="button" class="pc-swatch${i === 0 ? " active" : ""}" ` +
            `data-color="${i}" style="--pc:${c}" ` +
            `aria-label="Color ${i + 1}"></button>`
        )
        .join("");

    const thicknessHtml = PigeonDrawing.WIDTHS
        .map(w =>
            `<button type="button" class="pc-thick${w === PigeonDrawing.STROKE_WIDTH ? " active" : ""}" ` +
            `data-w="${w}" style="--w:${w * 2}px" ` +
            `aria-label="Line width ${w}"><span></span></button>`
        )
        .join("");

    const bodyHtml =
        `<div class="pigeon-composer">` +
        `<div class="pc-edit">` +
        `<span class="pc-edit-label">Edit</span>` +
        `<button type="button" id="pcUndo" class="pc-editbtn" disabled>Undo</button>` +
        `<button type="button" id="pcRedo" class="pc-editbtn" disabled>Redo</button>` +
        `<button type="button" id="pcClear" class="pc-editbtn">Clear</button>` +
        `</div>` +
        `<div class="pc-stage">` +
        `<div class="pc-toolbox">` +
        `<button type="button" id="pcPen" class="pc-tool active">Pen</button>` +
        `<button type="button" id="pcEraser" class="pc-tool">Erase</button>` +
        `<div class="pc-thickness" id="pcThickness">${thicknessHtml}</div>` +
        `</div>` +
        `<canvas id="pcCanvas" width="${GRID}" height="${GRID}" ` +
        `class="pc-canvas"></canvas>` +
        `<div class="pc-palette" id="pcPalette">${swatchHtml}</div>` +
        `</div>` +
        `<div class="pc-status">` +
        `<span id="pcCount" class="pc-count"></span>` +
        `<span id="pcCoords" class="pc-coords"></span>` +
        `</div>` +
        `<input id="pcMessage" class="pc-message" type="text" ` +
        `maxlength="${maxLength}" placeholder="${placeholder}">` +
        `<div id="pcHint" class="pc-hint"></div>` +
        `</div>`;

    // The canvas keeps the payload grid as its coordinate system but gets a
    // backing store sized to its CSS box and the display, so a 100x100 bitmap
    // is not stretched (blurry/uneven) to the larger display size.
    const FALLBACK_SIZE = 220; // Keep in sync with .pc-canvas in styles.css

    function drawContext(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const cssSize = canvas.getBoundingClientRect().width || FALLBACK_SIZE;
        const px = Math.max(GRID, Math.round(cssSize * dpr));

        if (canvas.width !== px || canvas.height !== px) {
            canvas.width = px;
            canvas.height = px;
        }

        const ctx = canvas.getContext("2d");
        const scale = px / GRID;
        ctx.setTransform(scale, 0, 0, scale, 0, 0);

        return ctx;
    }

    function render(canvas) {
        const ctx = drawContext(canvas);
        ctx.clearRect(0, 0, GRID, GRID);
        ctx.fillStyle = "#101018";
        ctx.fillRect(0, 0, GRID, GRID);

        strokes.forEach(stroke => {
            const c = PigeonDrawing.COLORS[stroke.c] || PigeonDrawing.COLORS[0];
            const p = stroke.p;

            if (p.length === 2) {
                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.arc(p[0], p[1], PigeonDrawing.DOT_RADIUS, 0, Math.PI * 2);
                ctx.fill();
                return;
            }

            ctx.strokeStyle = c;
            ctx.lineWidth = stroke.w;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(p[0], p[1]);
            for (let i = 2; i + 1 < p.length; i += 2) {
                ctx.lineTo(p[i], p[i + 1]);
            }
            ctx.stroke();
        });
    }

    function toCell(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / rect.width * GRID);
        const y = Math.floor((event.clientY - rect.top) / rect.height * GRID);
        return [
            Math.max(0, Math.min(GRID - 1, x)),
            Math.max(0, Math.min(GRID - 1, y)),
        ];
    }

    function buildPayload() {
        return strokes.length
            ? { v: PigeonDrawing.PAYLOAD_VERSION, strokes }
            : null;
    }

    // Each undoStack entry is one line of the drawing, so undoing it frees a
    // slot against MAX_STROKES. A fresh line makes any undone branch invalid.
    function recordAdd(stroke) {
        strokes.push(stroke);
        undoStack.push({ type: "add", stroke });
        redoStack.length = 0;
    }

    // Cancel a line the payload check just rejected: it was the last recorded
    // add, so undo it without touching the redo history.
    function recordRemove() {
        strokes.pop();
        undoStack.pop();
    }

    // Reverse the top action. "clear" restores every line it removed; an "add"
    // is always the current last line, so popping strokes reverses it.
    function undo() {
        const action = undoStack.pop();

        if (! action) {
            return;
        }

        if (action.type === "clear") {
            action.strokes.forEach(s => strokes.push(s));
        } else if (action.type === "erase") {
            strokes.splice(action.index, 0, action.stroke);
        } else {
            strokes.pop();
        }

        redoStack.push(action);
        repaint();
    }

    function redo() {
        const action = redoStack.pop();

        if (! action) {
            return;
        }

        if (action.type === "clear") {
            strokes.length -= action.strokes.length;
        } else if (action.type === "erase") {
            const i = strokes.indexOf(action.stroke);
            strokes.splice(i >= 0 ? i : action.index, 1);
        } else {
            strokes.push(action.stroke);
        }

        undoStack.push(action);
        repaint();
    }

    // Point-to-segment distance in grid units, so a click counts as hitting a
    // line when it is near it rather than exactly on it.
    function distToSegment(px, py, ax, ay, bx, by) {
        const dx = bx - ax;
        const dy = by - ay;
        const len2 = dx * dx + dy * dy;

        if (len2 === 0) {
            return Math.hypot(px - ax, py - ay);
        }

        const t =
            Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
        return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    }

    function nearStroke(stroke, x, y) {
        const p = stroke.p;

        if (p.length === 2) {
            return distToSegment(x, y, p[0], p[1], p[0], p[1]) <= ERASER_RADIUS;
        }

        for (let i = 0; i + 3 < p.length; i += 2) {
            if (distToSegment(x, y, p[i], p[i + 1], p[i + 2], p[i + 3]) <=
                ERASER_RADIUS) {
                return true;
            }
        }

        return false;
    }

    // Remove the whole topmost line under the click and record it so Undo can
    // restore it at its original index.
    function eraseAt(x, y) {
        for (let i = strokes.length - 1; i >= 0; i--) {
            if (nearStroke(strokes[i], x, y)) {
                const stroke = strokes[i];
                strokes.splice(i, 1);
                undoStack.push({ type: "erase", stroke, index: i });
                redoStack.length = 0;
                repaint();
                return;
            }
        }
    }

    // Surfaces the MAX_STROKES cap live, rather than only in the "plenty of
    // lines" hint once the player hits it.
    function updateLineCount() {
        document.getElementById("pcCount").textContent =
            `${strokes.length} / ${PigeonDrawing.MAX_STROKES} lines`;
    }

    function repaint() {
        render(document.getElementById("pcCanvas"));
        updateHistoryButtons();
        updateLineCount();
    }

    // Undo/Redo live in the body Edit toolbar now, not the modal footer.
    function updateHistoryButtons() {
        const $undo = document.getElementById("pcUndo");
        const $redo = document.getElementById("pcRedo");

        if ($undo) {
            $undo.toggleAttribute("disabled", ! undoStack.length);
        }

        if ($redo) {
            $redo.toggleAttribute("disabled", ! redoStack.length);
        }
    }

    // Paint-style exclusive tool modes: Pen draws, Erase deletes whole lines.
    function setTool(isErasing) {
        erasing = isErasing;
        document.getElementById("pcEraser")
            .classList.toggle("active", isErasing);
        document.getElementById("pcPen")
            .classList.toggle("active", ! isErasing);
    }

    function clearAll() {
        undoStack.push({ type: "clear", strokes: [...strokes] });
        strokes.length = 0;
        drawingStroke = null;
        drawingActive = false;
        document.getElementById("pcHint").textContent = "";
        repaint();
    }

    function showCoords(x, y) {
        const $c = document.getElementById("pcCoords");

        if ($c) {
            $c.textContent = `x:${x} y:${y}`;
        }
    }

    const setButtonsDisabled = disabled => {
        document.querySelectorAll(
            ".modal .header button, .modal .footer button, .pc-edit button"
        ).forEach($b =>
            disabled
                ? $b.setAttribute("disabled", "disabled")
                : $b.removeAttribute("disabled")
        );
    };

    async function doSend() {
        if (sending) {
            return false;
        }

        const messageInput = document.getElementById("pcMessage");
        const hint = document.getElementById("pcHint");
        const message = messageInput.value.trim();
        const drawing = buildPayload();

        if (! message && ! drawing) {
            hint.textContent = "Write a message or draw a picture first.";
            return false;
        }

        sending = true;
        setButtonsDisabled(true);
        hint.textContent = "Releasing the pigeon...";

        let sent = false;

        try {
            sent = await onSend({ message: messageInput.value, drawing });
        } catch {
            sent = false;
        }

        if (sent) {
            Modal.close();
            return false;
        }

        sending = false;
        setButtonsDisabled(false);
        updateHistoryButtons();
        hint.textContent = "The pigeon turned back. Try again.";
        // Pull focus back so the player can hit Enter and try again.
        document.getElementById("pcMessage").focus();
        return false;
    }

    const buttons = [
        // doSend() returns false to keep the modal open if sending fails.
        // Undo/Redo/Clear moved to the body Edit toolbar (Paint-style).
        { text: "Send", type: "primary", onclick: () => { doSend(); return false; } },
        { text: "Cancel", type: "danger" },
    ];

    Modal.open("SEND A CARRIER PIGEON", bodyHtml, buttons, {
        onopen: () => {
            GameControl.awaitingPlayerText = true;

            const canvas = document.getElementById("pcCanvas");
            const messageInput = document.getElementById("pcMessage");

            repaint();
            messageInput.focus();

            // Browser zoom changes devicePixelRatio, which the canvas
            // resolution follows; redraw so the picture stays sharp.
            onResize = () => {
                const $canvas = document.getElementById("pcCanvas");

                if ($canvas) {
                    render($canvas);
                }
            };
            window.addEventListener("resize", onResize);

            messageInput.addEventListener("keydown", e => {
                e.stopPropagation();

                if (e.key === "Enter") {
                    doSend();
                } else if (e.key === "Escape" && ! sending) {
                    Modal.close(true);
                }
            });
            messageInput.addEventListener("keypress", e => {
                e.stopPropagation();
            });

            document.querySelectorAll("#pcPalette .pc-swatch").forEach($swatch => {
                $swatch.addEventListener("click", () => {
                    color = Number($swatch.dataset.color);
                    setTool(false);
                    document.querySelectorAll("#pcPalette .pc-swatch")
                        .forEach($s => $s.classList.remove("active"));
                    $swatch.classList.add("active");
                });
            });

            document.querySelectorAll("#pcThickness .pc-thick").forEach($t => {
                $t.addEventListener("click", () => {
                    strokeWidth = Number($t.dataset.w);
                    document.querySelectorAll("#pcThickness .pc-thick")
                        .forEach($x => $x.classList.remove("active"));
                    $t.classList.add("active");
                });
            });

            document.getElementById("pcPen").addEventListener("click", () => setTool(false));
            document.getElementById("pcEraser").addEventListener("click", () => setTool(true));

            document.getElementById("pcUndo").addEventListener("click", () => undo());
            document.getElementById("pcRedo").addEventListener("click", () => redo());
            document.getElementById("pcClear").addEventListener("click", () => clearAll());

            canvas.addEventListener("pointerdown", e => {
                const [x, y] = toCell(canvas, e);
                showCoords(x, y);

                if (erasing) {
                    eraseAt(x, y);
                    return;
                }

                if (strokes.length >= PigeonDrawing.MAX_STROKES) {
                    document.getElementById("pcHint").textContent =
                        "That's plenty of lines. Send it!";
                    return;
                }

                drawingStroke = { c: color, w: strokeWidth, p: [x, y] };
                recordAdd(drawingStroke);
                drawingActive = true;
                canvas.setPointerCapture(e.pointerId);
                repaint();
            });

            canvas.addEventListener("pointermove", e => {
                const [x, y] = toCell(canvas, e);
                showCoords(x, y);

                if (! drawingActive || ! drawingStroke) {
                    return;
                }

                let p = drawingStroke.p;
                if (p.length / 2 >= PigeonDrawing.MAX_POINTS) {
                    if (strokes.length >= PigeonDrawing.MAX_STROKES) {
                        document.getElementById("pcHint").textContent =
                            "That's plenty of lines. Send it!";
                        endStroke();
                        return;
                    }

                    // Stroke point budget is a payload cap, not a drawing
                    // limit: continue the line as a new segment.
                    p = [p[p.length - 2], p[p.length - 1]];
                    drawingStroke = { c: color, w: strokeWidth, p };
                    recordAdd(drawingStroke);
                }

                if (x === p[p.length - 2] && y === p[p.length - 1]) {
                    return;
                }

                p.push(x, y);

                if (JSON.stringify(buildPayload()).length >
                    PigeonDrawing.MAX_PAYLOAD_BYTES) {
                    // Undo the point that doesn't fit, or the whole
                    // segment if that point was only its seed.
                    if (p.length > 2) {
                        p.splice(-2);
                    } else {
                        recordRemove();
                    }
                    document.getElementById("pcHint").textContent =
                        "That's plenty of detail. Send it!";
                    endStroke();
                }

                repaint();
            });

            const endStroke = () => {
                drawingActive = false;
                drawingStroke = null;
            };
            canvas.addEventListener("pointerup", endStroke);
            canvas.addEventListener("pointercancel", endStroke);
        },

        onclose: () => {
            if (onResize) {
                window.removeEventListener("resize", onResize);
                onResize = null;
            }

            GameControl.awaitingPlayerText = false;
        },
    });
};

window.openPigeonComposerModal = openPigeonComposerModal;
