// Renders a GameMap object as a DOM element with points
//
// The points can either be an array of objects or an object itself with:
// x, y: Integer coordinates for where the point appears on the map
// character: A single character that visually identifies the point (default: •)
// color: The color of the character (default: #1a8)
// titleSuffix: A name or label to display for the point when hovered
//
// Note that if an object is supplied for points and a titleSuffix is not
// explicitly provided, the titleSuffix will be derived from the element's key
const renderGameMapPoints = (mapObject, points = []) => {
    const $map = document.createElement("div");
    $map.className = "blocky cellular";
    $map.style.backgroundColor = "#000";

    const pts = (function(points) {
        if (typeof points === "array") {
            return points;
        }

        if (typeof points === "object") {
            const pts = [];
            const keys = Object.keys(points);
            for (key of keys) {
                pts.push({
                    titleSuffix: points[key]?.titleSuffix || key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase())
                        .trim(),
                    ...points[key],
                });
            }
            return pts;
        }

        console.warn("Points are neither an array nor object", { points });
        return [];
    })(points);

    for (let y = 0; y < mapObject.height; y++) {
        for (let x = 0; x < mapObject.width; x++) {
            const coordinates = `(${x}, ${y})`;

            const presentPoints = pts.filter(e => e?.x === x && e?.y === y);
            if (presentPoints.length === 1) {
                const point = presentPoints[0];
                const $cell = document.createElement("span");
                const titleSuffix = point?.titleSuffix || "(Untitled Cell)";
                $cell.setAttribute("title", `${coordinates} ${titleSuffix}`);
                $cell.textContent = point?.character || "•";
                $cell.style.color = point?.color || "#1a8";
                $map.appendChild($cell);
                continue;
            } else if (presentPoints.length > 0) {
                const $cell = document.createElement("span");
                const titleSuffix = `${presentPoints.length} Points`;
                const title =
                    `${coordinates} ${titleSuffix}:\n` +
                    presentPoints.map(e =>
                        `${e?.character || "•"} ` +
                        `${e?.titleSuffix || "(Untitled Cell)"}`
                    ).join("\n");
                $cell.setAttribute("title", title);
                $cell.textContent = presentPoints.length <= 9
                    ? presentPoints.length
                    : "∞";
                $cell.style.color = "#1a8";
                $map.appendChild($cell);
                continue;
            }

            // @TODO Remove this check after entities are tracked as arrays only
            const cellEntities = Array.isArray(mapObject.entities)
                ? mapObject.getEntitiesAt(x, y)
                : [];
            if (cellEntities.length > 0) {
                const $cell = document.createElement("span");
                const titleSuffix = `${cellEntities.length} Entities`;
                const title =
                    `${coordinates} ${titleSuffix}:\n` +
                    cellEntities.map(e => e.type).join("\n");
                $cell.setAttribute("title", title);
                $cell.textContent = cellEntities.length <= 9
                    ? cellEntities.length
                    : "∞";
                $cell.style.color = "#a18";
                $map.appendChild($cell);
                continue;
            }

            const cell = mapObject.getCell(x, y);

            if (cell.type === "wall") {
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
