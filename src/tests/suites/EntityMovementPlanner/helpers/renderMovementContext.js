// Renders a GameMap object with entity movements as a DOM element
const renderMovementContext = (
    mapObject,
    movements = [],
    plan = [],
    corridorList = null,
) => {
    const $container = document.createElement("div");
    $container.classList.add("entity-movement-container");

    $container.gameMap = [];
    for (let y = 0; y < mapObject.height; y++) {

        const row = [];
        for (let x = 0; x < mapObject.width; x++) {
            row.push(Boolean(mapObject.getCell(x, y).isWall));
        }

        $container.gameMap.push(row);
    }

    $container.mapObject = mapObject;
    $container.movements = [...movements];
    $container.plan = [...plan];

    $container.character = function(
        x,
        y,
        corridorList,
        selectedMove,
        selectedEntity
    ) {
        const coord = `(${x}, ${y})`;
        const $character = document.createElement("span");
        const moveIndex = selectedMove !== ""
            ? parseInt(selectedMove, 10)
            : null;
        const entityId = selectedEntity !== ""
            ? parseInt(selectedEntity, 10)
            : null;

        if (moveIndex !== null) {
            const entity =
                this.movements.length > moveIndex &&
                this.movements[moveIndex].find(e => e.x === x && e.y === y);

            if (entity) {
                $character.setAttribute(
                    "title",
                    `${coord} Entity ${entity.id}`
                );

                const entityHasDisplayCharacter =
                    typeof entity.displayCharacter === "string" &&
                    entity.displayCharacter.length > 0;

                if (entityHasDisplayCharacter) {
                    $character.textContent = entity.displayCharacter;
                } else {
                    $character.textContent = Number.isInteger(entity?.direction)
                        ? ["🔼", "▶️", "🔽", "◀️"][entity.direction % 4]
                        : "@";
                }

                if (Number.isInteger(entity.id)) {
                    if (entityId === entity.id) {
                        $character.style.color = "yellow";
                    } else if (entityId === null) {
                        $character.style.color = [
                            "#CF9", "#F3A", "#1F9", "#F80", "#1FF",
                            "#3F1", "#88F", "#F88", "#C1F", "#69F",
                        ][entity.id % 10];
                    }
                }

                return $character;
            }
        }

        if (entityId !== null) {
            for (let i = 0; i < this.plan.length; i++) {
                const isStep = this.plan[i].some(e =>
                    e.entityId === entityId &&
                    e.x === x &&
                    e.y === y
                );

                if (isStep) {
                    $character.setAttribute(
                        "title",
                        `${coord} Step ${i + 1} for Entity ${entityId}`
                    );
                    $character.textContent = (i % 10).toString();
                    const highlightCharacter =
                        moveIndex !== null &&
                        moveIndex >= i + 2;

                    $character.style.color = highlightCharacter
                        ? "#085544"
                        : "#1a8";

                    return $character;
                }
            }
        }

        const corridorId = this.getCorridorId(x, y, corridorList);

        if (this.gameMap[y][x]) {
            $character.setAttribute("title", `${coord} Wall`);
            $character.textContent = "#";
            $character.style.color = "firebrick";
        } else if (corridorId !== null) {
            $character.setAttribute(
                "title",
                `${coord} Corridor "${corridorId}"`
            );

            const useMutedColors = moveIndex !== null || entityId !== null;
            const color = "#fff";
            const backgroundColor = [
                "#109", "#065", "#809", "#600", "#142",
                "#621", "#479", "#922", "#538", "#168", 
            ][(corridorId.charCodeAt(0) - 97) % 10];

            $character.style.color = useMutedColors
                ? this.getFractionalHexColor(color)
                : color;

            $character.style.backgroundColor = useMutedColors
                ? this.getFractionalHexColor(backgroundColor)
                : backgroundColor;

            $character.textContent = corridorId;
        } else {
            $character.setAttribute("title", `${coord} Floor`);
            $character.textContent = "\u00A0";
        }

        return $character;
    };

    $container.getFractionalHexColor = function(hexColor) {
        if (! /^#?[0-9a-fA-F]{3}$/.test(hexColor)) {
            console.error(
                "hexColor is not a three-digit hex code, eg: #777",
                { hexColor }
            );
            return hexColor;
        }

        const fractionalDigits = hexColor
            .replace(/^#/, '')
            .split("")
            .map((hexDigit) => Math.floor(parseInt(hexDigit, 16) / 2).toString(16));

        return `#${fractionalDigits.join("")}`;
    }


    $container.getCorridorId = function(x, y, corridorList) {
        const canPerformCheck =
            Number.isInteger(x) &&
            Number.isInteger(y) &&
            corridorList !== null &&
            typeof corridorList === "object";

        if (! canPerformCheck) {
            return null;
        }

        const corridorIds = Object.keys(corridorList);
        for (const id of corridorIds) {
            const entry = corridorList[id];
            if (! Array.isArray(entry)) {
                console.warning(
                    "Corridor entry is not an array",
                    { entry, id, corridorList }
                );
                continue;
            }

            if (entry.some(e => e.x === x && e.y === y)) {
                return id;
            }
        }

        return null;
    }

    $container.draw = function() {
        const $map = this.querySelector(".game-map");
        if (! $map) {
            console.error("Cannot find game map element");
            return;
        }

        const showCorridors =
            (this.querySelector('[name="corridors"]')?.value || "") === "show";
        const selectedMove =
            this.querySelector('[name="movements"]')?.value || "";
        const selectedEntity =
            this.querySelector('[name="entities"]')?.value || "";

        $map.replaceChildren();

        for (let y = 0; y < this.gameMap.length; y++) {
            for (let x = 0; x < this.gameMap[y].length; x++) {
                $map.appendChild(this.character(
                    x,
                    y,
                    showCorridors ? corridorList : null,
                    selectedMove,
                    selectedEntity
                ));
            }

            $map.appendChild(document.createElement("br"));
        }

        const moveIndex = parseInt(selectedMove, 10);
        const message = this.movements?.[moveIndex]?.find(e =>
            typeof e.message === "string"
        )?.message || null;

        if (message !== null) {
            const $message = document.createElement("span");
            $message.className = "message";
            $message.textContent = message;
            $map.appendChild($message);
        }
    }

    const $map = document.createElement("div");
    $map.className = "game-map blocky cellular";
    $map.style.backgroundColor = "#000";
    $container.appendChild($map);

    const columnHeight = `${(mapObject.height + 1) * 14}px`;

    // Corridor selection
    if (corridorList !== null && typeof corridorList === "object") {
        const $corridorList = document.createElement("select");
        $corridorList.name = "corridors";
        $corridorList.size = "10";
        $corridorList.style.height = columnHeight;

        const $hideCorridorsOption = document.createElement("option");
        $hideCorridorsOption.value = "hide";
        $hideCorridorsOption.textContent = "Hide Corridors";
        $corridorList.appendChild($hideCorridorsOption);

        const $showCorridorsOption = document.createElement("option");
        $showCorridorsOption.value = "show";
        $showCorridorsOption.textContent = "Show Corridors";
        $corridorList.appendChild($showCorridorsOption);

        $corridorList.value = "hide";
        $corridorList.addEventListener("change", function(e) {
            $container.draw();
        });

        $container.appendChild($corridorList);
    }

    if (movements.length > 0) {
        const $movementList = document.createElement("select");
        $movementList.name = "movements";
        $movementList.size = "10";
        $movementList.style.height = columnHeight;

        const $boardOnlyOption = document.createElement("option");
        $boardOnlyOption.value = "";
        $boardOnlyOption.textContent = "Board Only";
        $movementList.appendChild($boardOnlyOption);

        for (let i = 0; i < movements.length; i++) {
            const $option = document.createElement("option");
            $option.value = i.toString();
            $option.textContent = i === 0
                ? "Initial Positions"
                : `Movement ${i}`;
            $movementList.appendChild($option);
        }

        $movementList.value = "";
        $movementList.addEventListener("change", function(e) {
            $container.draw();
        });

        $container.appendChild($movementList);
    }

    if (plan.length > 0) {
        const $entityList = document.createElement("select");
        $entityList.name = "entities";
        $entityList.size = "10";
        $entityList.style.height = columnHeight;

        const $noEntityOption = document.createElement("option");
        $noEntityOption.value = "";
        $noEntityOption.textContent = "No Paths";
        $entityList.appendChild($noEntityOption);

        const entityIds = [];

        for (let i = 0; i < plan.length; i++) {
            const currentIds = plan[i].map(e => e.entityId);

            for (const id of currentIds) {
                if (! entityIds.some(e => e === id)) {
                    entityIds.push(id);
                }
            }
        }

        for (const entityId of entityIds) {
            const $option = document.createElement("option");
            $option.value = entityId.toString();
            $option.textContent = `Entity ${entityId}'s Path`;
            $entityList.appendChild($option);
        }

        $entityList.value = "";
        $entityList.addEventListener("change", function(e) {
            $container.draw();
        });

        $container.appendChild($entityList);
    }

    $container.draw();

    return $container;
};
