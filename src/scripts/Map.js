class MapCell {
    static getCellId(x, y) {
        return `map_cell_${x}_${y}`;
    }

    constructor(type = "floor", options = {}) {
        const defaults = {
            $element: null,
            x: null,
            y: null,
            displayName: "Unknown",
            mapCharacter: "?",
            isSolid: false,
            onEnter: null,
            onTouch: null,
            onExplode: null,
            isExplored: true,
            isVisible: null,
        };

        this.$element = options?.$element || defaults.$element;
        this.x = typeof(options?.x === "number") ? options.x : defaults.x;
        this.y = typeof(options?.y === "number") ? options.y : defaults.y;
        this.type = type;
        this.displayName = options?.displayName || defaults.displayName;
        this.mapCharacter = options?.mapCharacter || defaults.mapCharacter;
        this.isSolid = typeof options?.isSolid === "boolean"
            ? options.isSolid
            : defaults.isSolid;
        this.onEnter = options?.onEnter || defaults.onEnter;
        this.onTouch = options?.onTouch || defaults.onTouch;
        this.onExplode = options?.onExplode || defaults.onExplode;
        this.isExplored = typeof options?.isExplored === "boolean"
            ? options.isExplored
            : defaults.isExplored;
        this.isVisible = options?.isVisible || defaults.isVisible;
    }

    refreshElement(overrides) {
        if (!this.$element) {
            console.warn("MapCell has no element to refresh");
            return;
        }

        const cellProperties = {
            ...{
                displayName: this.displayName,
                isExplored: this.isExplored,
                isVisible: this.isVisible,
                mapCharacter: this.mapCharacter,
                type: this.type,
            },
            ...overrides,
        }

        let tile = '';
        let tileClass = '';
        let displayName = '';
        if (!cellProperties.isExplored) {
            tile = '?';
            tileClass = 'unexplored';
            displayName = "Unexplored";
        } else {
            // Use a visibility function if one is available
            // Otherwise, assume that the tile is visible
            const isVisible =
                typeof cellProperties.isVisible !== 'function' ||
                cellProperties.isVisible();

            if (isVisible) {
                tile = cellProperties.mapCharacter || '?';
                tileClass = cellProperties.type || 'unknown';
                tileClass = tileClass === 'mimic' ? 'treasureChest' : tileClass;
                displayName = cellProperties.displayName;
            } else {
                tile = ".";
                tileClass = "floor";
                displayName = "Floor";
            }
        }

        this.$element.className = tileClass;

        const hasCoordinates =
            typeof this.x === "number" &&
            typeof this.y === "number";

        if (hasCoordinates) {
            this.$element.setAttribute(
                'data-tooltipHtml',
                `<div class="mapCellDetails">
                    <div class="enlargedTile ${tileClass}">${tile}</div>
                    <div class="details">
                        <div class="name">${displayName}</div>
                        <div class="coordinates">(${this.x}, ${this.y})</div>
                    </div>
                </div>`
            );

            this.$element.setAttribute('data-tooltipPosition', 'right');
        } else {
            console.warn("No coordinates found for cell", {
                cellProperties,
                x: this.x,
                y: this.y,
            });
            this.$element.removeAttribute('data-tooltipHtml');
            this.$element.removeAttribute('data-tooltipPosition');
        }

        this.$element.innerText = tile;
        Tooltip.refresh(this.$element);
    }

    static defaultsByType(type) {
        /**
         * A MapCell can have the following properties:
         *
         * displayName
         *   The name that is displayed for the tile when hovering it on
         *   the minimap
         *
         * mapCharacter
         *   The character that represents the tile on the minimap
         *
         * isSolid
         *   If true, acts like a wall and does not allow the player to
         *   step onto it
         *
         * onEnter
         *   A function that runs when the player steps onto the tile.
         *   Always called with its own x, y coordinates. Won't work
         *   when isSolid = true
         *
         * onTouch
         *   A function that runs when the player touches the tile.
         *   Won't work when isSolid = false
         *
         * onExplode
         *   A function that runs when the player has blasted the tile
         *   with a brick of C4. Always called with its own x, y
         *   coordinates
         *
         * isExplored
         *   When false, the cell appears as "Unexplored" on the minimap
         *
         * isVisible
         *   A function that determines if the tile is visible. If it
         *   returns false, the tile appears as a generic floor instead
         */
        const defaults = {
            displayName: "Unknown",
            mapCharacter: "?",
            isSolid: false,
            onEnter: null,
            onTouch: null,
            onExplode: null,
            isExplored: true,
            isVisible: null,
        };

        return { ...defaults, ...(types[type] || {}) };
    }
}


/**
 * The game's map
 */
class Map {
    // The 2D array of map data, initialized by generate()
    #cells = [];

    // The types of cells that the map supports. Walls and floors are a minimum
    // This is overwritten by setCellTypes()
    #cellTypes = {
        wall: {
            displayName: "Wall",
            mapCharacter: "#",
            isSolid: true,
        },
        floor: {
            displayName: "Floor",
            mapCharacter: ".",
        },
    };

    // Entities that exist within the map that are not fixed in place, such as
    // the player or any wandering NPCs
    #entities = {};

    // The reference to the game's minimap element, set by setMinimap()
    #$minimap = null;

    // A list of object coordinates for cells that need to be rerendered
    #rerenderList = [];

    // Sets the reference to the game's minimap element
    setMinimap($element) {
        this.#$minimap = $element instanceof Element ? $element : null;
    }

    // Sets the types of cells available in the map
    setCellTypes(cellTypes) {
        this.#cellTypes = { ...this.#cellTypes, ...cellTypes };
    }

    // Returns a cell at a given coordinate
    // Will return a wall if out of bounds/undefined to simulate blocking
    getCell(x, y) {
        return this.#cells[y]?.[x] || this.generateCell('wall');
    }

    // Sets a cell on the map at a given coordinate
    // This can only overwrite cells in locations that already exist on the map
    setCell(x, y, type = "floor", options = {}) {
        if (!this.#cells?.[y]?.[x]) {
            console.warn(
                "Cell is outside of map boundaries and cannot be set",
                { x, y, type, options }
            );
            return;
        }

        this.#cells[y][x] = this.generateCell(type, {
            // Preserve the existing element for this space
            $element: this.#cells[y][x].$element,
            isExplored: typeof this.#cells[y][x].isExplored === "boolean"
                ? this.#cells[y][x].isExplored
                : true,
            x,
            y,
            ...options
        });

        this.#rerenderList.push({x, y});
    }

    // Helper function to set up MapCell objects based on defined cell types
    generateCell(type = "floor", options = {}) {
        return new MapCell(
            type,
            { ...(this.#cellTypes[type] || {}), ...options }
        );
    }

    // Finds and returns the coordinates of the first instance of a cell by type
    // This does not return the positions of entities (eg: the player)
    locate(cellType) {
        for (let y = 0; y < this.#cells.length; y++) {
            for (let x = 0; x < this.#cells[y].length; x++) {
                if (this.#cells[y][x]?.type === cellType) {
                    return { x, y };
                }
            }
        }

        return null;
    }

    cellIsOccupied(x, y) {
        return Boolean(Object.entries(this.#entities).find(
            ([id, entity]) => entity.x === x && entity.y === y
        ) || this.getCell(x, y)?.type !== "floor");
    }

    getEmptyCellCoordinates() {
        const coordinates = [];

        for (let y=0; y<this.#cells.length; y++) {
            for (let x=0; x<this.#cells[y].length; x++) {
                if (!this.cellIsOccupied(x, y)) {
                    coordinates.push({ x, y });
                }
            }
        }

        return coordinates;
    }

    // Sets details for entities, such as the player or any wandering NPCs
    setEntities(entities) {
        const changedCoordinates = this.getChangedCoordinates(
            this.#entities,
            entities
        );

        this.#rerenderList.push(...changedCoordinates);
        this.#entities = entities;
    }

    // Given two sets of entities, returns a list of coordinates of spots that
    // have changed on the map. Used to determine which entity cells to rerender
    getChangedCoordinates(oldEntities, newEntities) {
        const allKeys = new Set([
            ...Object.keys(oldEntities),
            ...Object.keys(newEntities)
        ]);

        const isDuplicate = (arr, coordinates) =>
            arr.some(c => c.x === coordinates.x && c.y === coordinates.y);

        return Array.from(allKeys).reduce((acc, key) => {
            const oldCoordinates = oldEntities[key];
            const newCoordinates = newEntities[key];

            if (newCoordinates.forceRefresh) {
                if (!isDuplicate(acc, newCoordinates)) {
                    acc.push(newCoordinates);
                }
            }

            if (!oldCoordinates && newCoordinates) {
                if (!isDuplicate(acc, newCoordinates)) {
                    acc.push(newCoordinates);
                }
            } else if (oldCoordinates && !newCoordinates) {
                if (!isDuplicate(acc, oldCoordinates)) {
                    acc.push(oldCoordinates);
                }
            } else if (oldCoordinates.x !== newCoordinates.x || oldCoordinates.y !== newCoordinates.y) {
                if (!isDuplicate(acc, oldCoordinates)) {
                    acc.push(oldCoordinates);
                }

                if (!isDuplicate(acc, newCoordinates)) {
                    acc.push(newCoordinates);
                }
            }

            return acc;
        }, []);
    }

    // Generates the map
    // sizeX and sizeY determine the width and height of the map
    // playerStartX and playerStartY point to where the player resides, so this
    // spot should not be filled in
    generate(sizeX, sizeY, playerStartX, playerStartY) {
        const exitPosition = this.getExitPosition(
            sizeX,
            sizeY,
            playerStartX,
            playerStartY
        );

        // Fill in walls
        for (let y = 0; y < sizeY; y++) {
            this.#cells[y] = [];
            for (let x = 0; x < sizeX; x++) {
                this.#cells[y][x] = this.generateCell(
                    'wall',
                    { x, y, isExplored: false }
                );
            }
        }

        // Carve out a path
        let position = { x: playerStartX, y: playerStartY };
        let stack = null;

        do {
            stack = this.carvePath(sizeX, sizeY, exitPosition, [position]);
        } while (stack === null);

        for (let i in stack) {
            this.#cells[stack[i].y][stack[i].x] = this.generateCell(
                'floor',
                { x: stack[i].x, y: stack[i].y, isExplored: false }
            );
        }

        const dissolveIterations = 10;
        for (let i = 0; i < dissolveIterations; i++) {
            this.dissolveMap();
        }

        this.#cells[playerStartY][playerStartX] = this.generateCell('floor', {
            x: playerStartX,
            y: playerStartY,
        });

        this.#cells[exitPosition.y][exitPosition.x] = this.generateCell(
            'exit',
            {
                x: exitPosition.x,
                y: exitPosition.y,
                isExplored: false,
            }
        );

        this.initializeMinimap();
    }

    // Generates and returns a set of coordinates for where the exit should be
    getExitPosition(sizeX, sizeY, playerStartX, playerStartY) {
        const margin = 2;
        const exit = {
            x: sizeX - margin,
            y: sizeY - margin,
        };
        const possiblePositions = [['x', 'y'], ['x'], ['y']];
        const positions = possiblePositions[
            Math.floor(Math.random() * possiblePositions.length)
        ];

        for (let p in positions) {
            if (positions[p] === 'x') {
                const exitOffsetX = Math.round(Math.random() * Math.round(sizeX / 10));
                exit.x = playerStartX < sizeX / margin
                    ? sizeX - margin - exitOffsetX
                    : margin + exitOffsetX;
            } else {
                const exitOffsetY = Math.round(Math.random() * Math.round(sizeY / 10));
                exit.y = playerStartY < sizeY / margin
                    ? sizeY - margin - exitOffsetY
                    : margin + exitOffsetY;
            }
        }

        return exit;
    }

    carvePath(mapSizeX, mapSizeY, exitPosition, stack) {
        const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const step = Math.random() < 0.5 ? -1 : 1;
        let lastPosition = stack[stack.length - 1];

        for (let i=0; i<2; i++) {
            const nextPosition = {
                x: lastPosition.x + (direction === 'horizontal' ? step : 0),
                y: lastPosition.y + (direction === 'vertical' ? step : 0),
            };

            const atMapEdge =
                nextPosition.x === 0 ||
                nextPosition.y === 0 ||
                nextPosition.x === mapSizeX - 1 ||
                nextPosition.y === mapSizeY - 1;

            if (atMapEdge) {
                return null;
            }

            const alreadyVisited = stack.find((seenPosition) =>
                seenPosition.x === nextPosition.x &&
                seenPosition.y === nextPosition.y
            );
            if (alreadyVisited) {
                return null;
            }

            stack.push(nextPosition);

            const reachedEnd =
                nextPosition.x === exitPosition.x &&
                nextPosition.y === exitPosition.y;

            if (reachedEnd) {
                return stack;
            }

            lastPosition = nextPosition;
        }

        let result;
        for (let i=0; i<100; i++) {
            result = this.carvePath(mapSizeX, mapSizeY, exitPosition, stack);
            if (result) {
                break;
            }
        }

        return result;
    }

    // Carves hallways and dead ends into the map
    dissolveMap() {
        let dissolvePoints = this.getMapDissolvePoints();
        const totalPointsToDissolve = Math.floor(dissolvePoints.length / 2);
        if (totalPointsToDissolve < 1) {
            return;
        }

        for (let i = 0; i < totalPointsToDissolve; i++) {
            const index = Math.floor(Math.random() * dissolvePoints.length);
            const dissolvePoint = dissolvePoints[index];
            this.#cells[dissolvePoint.y][dissolvePoint.x] = this.generateCell(
                'floor',
                {
                    x: dissolvePoint.x,
                    y: dissolvePoint.y,
                    isExplored:
                        this.#cells[dissolvePoint.y][dissolvePoint.x].isExplored,
                }
            );
            dissolvePoints = dissolvePoints.splice(index, 1);
        }
    }

    // Returns a list of coordinates where the map could be dissolved
    // A dissolve point is any spot on the map that's not at the map's edge, but
    // is a wall that has three surrounding walls
    // @TODO Make sure this works for other types of walls, eg iceWall
    //       Maybe check for isSolid instead of type === 'wall'
    getMapDissolvePoints() {
        const margin = 2;
        const dissolvePoints = [];

        for (let y = margin; y < this.#cells.length - margin; y++) {
            for (let x = margin; x < this.#cells[0].length - margin; x++) {
                const isDissolvePoint = this.#cells[y][x]?.type === 'wall' && (
                    (this.#cells[y - 1][x]?.type === 'wall' ? 1 : 0) +
                    (this.#cells[y + 1][x]?.type === 'wall' ? 1 : 0) +
                    (this.#cells[y][x - 1]?.type === 'wall' ? 1 : 0) +
                    (this.#cells[y][x + 1]?.type === 'wall' ? 1 : 0)
                ) === 3;

                if (isDissolvePoint) {
                    dissolvePoints.push({x, y});
                }
            }
        }

        return dissolvePoints;
    }

    // Sets up the minimap element if the element has been defined
    initializeMinimap() {
        if (!this.#$minimap) {
            console.debug(
                "Cannot generate minimap because no minimap element has " +
                "been defined"
            );
            return;
        }

        this.#$minimap.replaceChildren();

        for (let y = 0; y < this.#cells.length; y++) {
            for (let x = 0; x < this.#cells[y].length; x++) {
                const $cell = document.createElement('span');
                $cell.id = MapCell.getCellId(x, y);
                this.#$minimap.append($cell);

                // Track the minimap element in the corresponding map cell
                this.#cells[y][x].$element = $cell;

                // Make sure we render the cell
                this.#rerenderList.push({x, y});
            }

            this.#$minimap.append(document.createElement('br'));
        }
    }

    // Updates the cells on the minimap based on coordinates in the rerenderList
    refreshMinimap() {
        if (!this.#$minimap) {
            console.warn("No minimap defined. Cannot rerender");
            return;
        }

        this.#rerenderList.forEach((cellCoords) => {
            const cell = this.#cells[cellCoords.y]?.[cellCoords.x];

            if (!cell) {
                console.error("Could not find cell to rerender", {
                    cellCoords,
                    cells: this.#cells,
                });
                return;
            }

            const overrides = Object.entries(this.#entities).find(
                ([id, entity]) =>
                    entity.x === cellCoords.x &&
                    entity.y === cellCoords.y
            )?.[1] || {};

            cell.refreshElement(overrides);
        });

        this.#rerenderList = [];
    }

    // Reveals a spot on the map, regardless of walls
    revealSpot(spotX, spotY, radius) {
        for (let y=spotY-radius; y<=spotY+radius; y++) {
            for (let x=spotX-radius; x<=spotX+radius; x++) {
                if (typeof this.#cells[y]?.[x] !== "undefined") {
                    this.#cells[y][x].isExplored = true;
                    this.#rerenderList.push({x, y});
                }
            }
        }
    }

    // Reveals the entire map
    reveal() {
        for (let y=0; y<this.#cells.length; y++) {
            for (let x=0; x<this.#cells[y].length; x++) {
                this.#cells[y][x].isExplored = true;
                this.#rerenderList.push({x, y});
            }
        }
    }
}
