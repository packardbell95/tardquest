// Renders a GameMap object as a DOM element
const renderGameMapContext = (mapObject, path) => {
    const $map = document.createElement("div");
    $map.className = "blocky cellular";
    $map.style.backgroundColor = "#000";

    for (let y = 0; y < mapObject.getHeight(); y++) {
        for (let x = 0; x < mapObject.getWidth(); x++) {
            const coordinates = `(${x}, ${y})`;
            const cell = mapObject.getCell(x, y);
            const pathIndex = Array.isArray(path) &&
                path.findIndex((c) => c[0] === x && c[1] === y);

            if (pathIndex >= 0) {
                const $step = document.createElement("span");
                const isStart = pathIndex === 0;
                const isEnd = pathIndex === path.length - 1;
                const title = `${coordinates} Step`;


                if (isStart) {
                    $step.textContent = "🚩";
                    $step.style.textShadow = "2px 2px 2px #c00";
                    $step.setAttribute("title", `${title} (Start)`);
                } else if (isEnd) {
                    $step.textContent = "🏁";
                    $step.style.textShadow = "2px 2px 2px #333";
                    $step.setAttribute("title", `${title} (End)`);
                } else {
                    $step.style.color = "#1a8";
                    $step.textContent = "•";
                    $step.setAttribute("title", title);
                }

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
