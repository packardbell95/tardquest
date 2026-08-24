// Renders a GameMap object as a DOM element
const renderGameMapContext = (mapObject, path = [], mode, extraData) => {
    const modeSettings = {
        path: {
            start: {
                character: "🚩",
                shadowColor: "#c00",
                titleSuffix: "Start",
            },
            end: {
                character: "🏁",
                shadowColor: "#333",
                titleSuffix: "End",
            },
        },
        fov: {
            step: {
                character: "•",
                color: "#FFC800",
                titleSuffix: "(Observed Space)",
            },
        },
    };

    const defaultCell = {
        character: "•",
        color: "#1a8",
        titleSuffix: "(Step)",
    };

    const availableModes = Object.keys(modeSettings);
    const activeModeKey = availableModes.includes(mode) ? mode : "path";
    const activeMode = modeSettings[activeModeKey];

    const $map = document.createElement("div");
    $map.className = "blocky cellular margin-auto";
    $map.style.backgroundColor = "#000";

    for (let y = 0; y < mapObject.height; y++) {
        for (let x = 0; x < mapObject.width; x++) {
            const coordinates = `(${x}, ${y})`;

            const drawFovArrow =
                mode === "fov" &&
                extraData?.x === x &&
                extraData?.y === y;
            if (drawFovArrow) {
                const $fovArrow = document.createElement("span");
                const titleText =
                    `${coordinates} Viewing Position; ` +
                    (
                        Number.isInteger(extraData?.visionDistance)
                            ? `Vision Distance: ${extraData.visionDistance}`
                            : "Unknown vision distance"
                    ) +
                    "; " +
                    (
                        Number.isInteger(extraData?.direction)
                            ? `Direction: ${extraData.direction}`
                            : "Unknown direction"
                    ) +
                    "; " +
                    (
                        typeof extraData?.fov === "number"
                            ? `FOV: ${extraData.fov} degrees`
                            : "Default FOV"
                    );

                $fovArrow.setAttribute("title", titleText);
                $fovArrow.textContent = Number.isInteger(extraData?.direction)
                    ? ["🔼", "▶️", "🔽", "◀️"][extraData.direction % 4]
                    : "❓️";

                $map.appendChild($fovArrow);
                continue;
            }

            const cell = mapObject.getCell(x, y);
            const pathIndex = Array.isArray(path) &&
                path.findIndex((c) => c[0] === x && c[1] === y);

            if (pathIndex >= 0) {
                const $step = document.createElement("span");
                const isStart = pathIndex === 0;
                const isEnd = pathIndex === path.length - 1;

                const styleSource = (() => {
                    if (isStart && activeMode?.start) {
                        return activeMode.start;
                    }

                    if (isEnd && activeMode?.end) {
                        return activeMode.end;
                    }

                    return activeMode.step;
                })();

                $step.textContent =
                    styleSource?.character ||
                    defaultCell.character;

                $step.style.color =
                    styleSource?.color ||
                    defaultCell.color;

                if (typeof styleSource?.shadowColor === "string") {
                    $step.style.textShadow =
                        `2px 2px 2px ${styleSource.shadowColor}`;
                }

                const suffix =
                    styleSource?.titleSuffix ||
                    defaultCell.titleSuffix;
                const title = `${coordinates} ${suffix}`.trim();
                $step.setAttribute("title", title);

                $map.appendChild($step);
            } else if (cell.type === "wall") {
                const $wall = document.createElement("span");
                $wall.setAttribute("title", `${coordinates} Wall`);
                $wall.textContent = "#";
                $wall.style.color = "firebrick";
                $map.appendChild($wall);
            } else if (cell.type === "floor") {
                const $floor = document.createElement("span");
                $floor.setAttribute("title", `${coordinates} Floor`);
                $floor.textContent = " ";
                $map.appendChild($floor);
            }
        }

        const $lineBreak = document.createElement("br");
        $map.appendChild($lineBreak);
    }

    return $map;
};
