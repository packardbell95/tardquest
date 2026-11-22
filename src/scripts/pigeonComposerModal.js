"use strict";

/**
 * @fileoverview Carrier pigeon composer: lets the player draw a handdrawn
 * picture and/or write a short message using the standard TardQuest modal.
 *
 * Drawing payloads are validated server-side. The grid, palette size, and
 * stroke/point limits here mirror the server's drawing contract.
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
    MAX_STROKES: 24,
    MAX_POINTS: 64,
    MAX_PAYLOAD_BYTES: 8192,

    // Line geometry, in grid units, shared by the composer canvas and the
    // SVG viewer so the player sees the picture they will deliver.
    STROKE_WIDTH: 1.5,
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

            return `<polyline points="${points.join(" ")}" fill="none" ` +
                `stroke="${color}" stroke-width="${this.STROKE_WIDTH}" ` +
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
    let drawingStroke = null;
    let drawingActive = false;
    let onResize = null;
    let sending = false;
    const strokes = [];

    const swatchHtml = palette
        .map((c, i) =>
            `<button type="button" class="pc-swatch${i === 0 ? " active" : ""}" ` +
            `data-color="${i}" style="--pc:${c}" ` +
            `aria-label="Color ${i + 1}"></button>`
        )
        .join("");

    const bodyHtml =
        `<div class="pigeon-composer">` +
        `<canvas id="pcCanvas" width="${GRID}" height="${GRID}" ` +
        `class="pc-canvas"></canvas>` +
        `<div class="pc-palette" id="pcPalette">${swatchHtml}</div>` +
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
            ctx.lineWidth = PigeonDrawing.STROKE_WIDTH;
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
            ? { v: 1, strokes }
            : null;
    }

    const setButtonsDisabled = disabled => {
        document.querySelectorAll(
            ".modal .header button, .modal .footer button"
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
        hint.textContent = "The pigeon turned back. Try again.";
        // Pull focus back so the player can hit Enter and try again.
        document.getElementById("pcMessage").focus();
        return false;
    }

    const buttons = [
        // doSend() returns false to keep the modal open if sending fails.
        { text: "Send", type: "primary", onclick: () => { doSend(); return false; } },
        {
            text: "Clear",
            type: "secondary",
            onclick: () => {
                strokes.length = 0;
                drawingStroke = null;
                drawingActive = false;
                document.getElementById("pcHint").textContent = "";
                render(document.getElementById("pcCanvas"));
                return false; // Keep the modal open
            },
        },
        { text: "Cancel", type: "danger" },
    ];

    Modal.open("SEND A CARRIER PIGEON", bodyHtml, buttons, {
        onopen: () => {
            GameControl.awaitingPlayerText = true;

            const canvas = document.getElementById("pcCanvas");
            const messageInput = document.getElementById("pcMessage");

            render(canvas);
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
                    document.querySelectorAll("#pcPalette .pc-swatch")
                        .forEach($s => $s.classList.remove("active"));
                    $swatch.classList.add("active");
                });
            });

            canvas.addEventListener("pointerdown", e => {
                if (strokes.length >= PigeonDrawing.MAX_STROKES) {
                    document.getElementById("pcHint").textContent =
                        "That's plenty of lines. Send it!";
                    return;
                }

                const [x, y] = toCell(canvas, e);
                drawingStroke = { c: color, p: [x, y] };
                strokes.push(drawingStroke);
                drawingActive = true;
                canvas.setPointerCapture(e.pointerId);
                render(canvas);
            });

            canvas.addEventListener("pointermove", e => {
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
                    drawingStroke = { c: color, p };
                    strokes.push(drawingStroke);
                }

                const [x, y] = toCell(canvas, e);
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
                        strokes.pop();
                    }
                    document.getElementById("pcHint").textContent =
                        "That's plenty of detail. Send it!";
                    endStroke();
                }

                render(canvas);
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
