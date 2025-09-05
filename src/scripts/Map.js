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
            this.$element.setAttribute('data-tooltipGroupId', 'minimap');
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
        Tooltip.initialize(this.$element);
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
class GameMap {
    // How many spaces from the edge are expected in the map
    #margin = 2;

    // The 2D array of map data, initialized by generate()
    #cells = [];

    // The entry point of the current floor
    #entrance = { x: null, y: null };

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

    getWidth() {
        return this.#cells[0]?.length || 0;
    }

    getHeight() {
        return this.#cells.length;
    }

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

    #inBounds(x, y) {
        return Boolean(this.#cells?.[y]?.[x]);
    }

    // Sets a cell on the map at a given coordinate
    // This can only overwrite cells in locations that already exist on the map
    setCell(x, y, type = "floor", options = {}) {
        if (!this.#inBounds(x, y)) {
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

    countPassableCells() {
        let total = 0;

        for (let y=0; y<this.#cells.length; y++) {
            for (let x=0; x<this.#cells[y].length; x++) {
                if (! this.#cells[y][x]?.isSolid) {
                    total++;
                }
            }
        }

        return total;
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

            // Entity has been removed
            if (newCoordinates === undefined) {
                if (!isDuplicate(acc, oldCoordinates)) {
                    acc.push(oldCoordinates);
                }
                return acc;
            }

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
            } else if (
                oldCoordinates.x !== newCoordinates.x ||
                oldCoordinates.y !== newCoordinates.y
            ) {
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
        const minSize = (this.#margin * 2) + 1;
        if (sizeX < minSize || sizeY < minSize) {
            throw new Error(
                `GameMap size must be at least ${minSize}x${minSize}`
            );
        }

        const playerPositionOutOfBounds =
            playerStartX < 0 || playerStartX >= sizeX ||
            playerStartY < 0 || playerStartY >= sizeY;

        if (playerPositionOutOfBounds) {
            throw new Error(
                "Player coordinates are outside of the map's boundaries"
            );
        }

        this.#entrance = {
            x: playerStartX,
            y: playerStartY
        };

        const exitPosition = this.#getExitPosition(
            sizeX,
            sizeY,
            playerStartX,
            playerStartY
        );

        // Fill in walls
        this.fill(0, 0, sizeX, sizeY, "wall");

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

    getEntrance() {
        return this.#entrance;
    }

    // Tiny PRNG method in case we want to seed for reproducible mazes
    mulberry32(seed) {
        return function() {
            let t = seed += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967295;
        };
    }

    line(startX, startY, endX, endY, options = {}) {
        const {
            fourConnected = false, // If true, the line is fully traversible
            splitOrder = "auto", // "horizontal-first" | "vertical-first" | "auto"
            cellType = "wall",
        } = options;

        let dx = Math.abs(endX - startX);
        let dy = Math.abs(endY - startY);
        let sx = startX < endX ? 1 : -1;
        let sy = startY < endY ? 1 : -1;
        let err = dx - dy;

        // Decide preferred split direction if needed
        const chooseSplitOrder = () => {
            if (["horizontal-first", "vertical-first"].includes(splitOrder)) {
                return splitOrder;
            }

            // auto: prefer the dominant axis
            return dx >= dy ? "horizontal-first" : "vertical-first";
        };

        while (true) {
            this.setCell(startX, startY, cellType);

            if (startX === endX && startY === endY) {
                break;
            }

            let e2 = 2 * err;

            if (fourConnected && e2 > -dy && e2 < dx) {
                // A diagonal would occur; split into two orthogonal steps.
                const order = chooseSplitOrder();

                if (order === "horizontal-first") {
                    // Step X
                    err -= dy;
                    startX += sx;
                    this.setCell(startX, startY, cellType);
                    if (startX === endX && startY === endY) {
                        break;
                    }

                    // Step Y
                    err += dx;
                    startY += sy;
                    // next loop iteration will draw (startX,startY)
                    continue;
                } else {
                    // vertical-first
                    err += dx;
                    startY += sy;
                    this.setCell(startX, startY, cellType);
                    if (startX === endX && startY === endY) {
                        break;
                    }

                    err -= dy;
                    startX += sx;
                    continue;
                }
            }

            if (e2 > -dy) {
                err -= dy;
                startX += sx;
            }

            if (e2 < dx) {
                err += dx;
                startY += sy;
            }
        }
    }

    fill(startX, startY, endX, endY, cellType = "wall") {
        for (let y = startY; y < endY; y++) {
            this.#cells[y] = [];
            for (let x = startX; x < endX; x++) {
                this.#cells[y][x] = this.generateCell(
                    cellType,
                    { x, y, isExplored: false }
                );
            }
        }
    }

    room(x, y, w, h, options = {}) {
        const {
            wallCellType = "wall",
            floorCellType = "floor",
        } = options;

        const x2 = x + w - 1;
        const y2 = y + h - 1;

        // Draw walls (outline)
        for (let cx = x; cx <= x2; cx++) {
            this.setCell(cx, y,  wallCellType);
            this.setCell(cx, y2, wallCellType);
        }
        for (let cy = y; cy <= y2; cy++) {
            this.setCell(x,  cy, wallCellType);
            this.setCell(x2, cy, wallCellType);
        }

        // Fill interior with floor
        for (let cy = y + 1; cy <= y2 - 1; cy++) {
            for (let cx = x + 1; cx <= x2 - 1; cx++) {
                this.setCell(cx, cy, floorCellType);
            }
        }

        const center = {
            x: Math.floor((x + x2) / 2),
            y: Math.floor((y + y2) / 2),
        };

        return { x, y, w, h, center };
    }

    // --- Corridors -----------------------------------------------------------
    /**
     * Carves a 4-connected corridor of FLOOR cells between two points/rooms.
     * By default, prefers the dominant axis first ("auto").
     */
    connectPoints(ax, ay, bx, by, options = {}) {
        const {
            splitOrder = "auto",
            floorCellType = "floor",
        } = options;

        this.line(ax, ay, bx, by, {
            fourConnected: true,
            splitOrder,
            cellType: floorCellType,
        });
    }

    /**
     * Connects two rooms from center-to-center (or accepts overrides),
     * carving a walkable corridor.
     */
    connectRooms(roomA, roomB, options = {}) {
        const {
            from = roomA.center,
            to   = roomB.center,
            splitOrder = "auto",
            floorCellType  = "floor",
        } = options;

        connectPoints(
            from.x,
            from.y,
            to.x,
            to.y,
            { splitOrder, floorCellType }
        );
    }

    // --- Door carving --------------------------------------------------------
    /**
     * Carves a single-tile doorway by turning a wall tile into a floor tile.
     * Optionally thickens the notch by 1 extra tile outward (useful for emphasis).
     */
    carveDoor(x, y, options = {}) {
        const {
            floorCellType = "floor",
            outwardDir = null, // {dx, dy} if you want to thicken outward
            thickness = 1,     // how many tiles to carve, including the wall
        } = options;

        // Always carve the wall tile itself into a floor.
        this.setCell(x, y, floorCell);

        if (outwardDir && (outwardDir.dx || outwardDir.dy)) {
            let cx = x, cy = y;
            for (let i = 1; i < thickness; i++) {
                cx += outwardDir.dx;
                cy += outwardDir.dy;

                if (! this.#inBounds(cx, cy)) {
                    break;
                }

                this.setCell(cx, cy, floorCell);
            }
        }
    }

    // --- Finding sensible wall-to-wall connection points ---------------------
    /**
     * Return candidate doorway cells along a room's perimeter where:
     *   - The perimeter cell is WALL
     *   - The tile immediately inside the room is FLOOR
     *   - The tile immediately outside is not FLOOR (so corridor will carve)
     * Each candidate includes the outward direction vector {dx, dy}.
     * You can ignore corners if you don't want diagonal corner doors.
     */
    findRoomDoorCandidates(room, options = {}) {
        const {
            ignoreCorners = true,
        } = options;

        const { x, y, w, h } = room;
        const x2 = x + w - 1;
        const y2 = y + h - 1;
        const results = [];

        const pushIfDoor = (
            wx, wy, inx, iny, outx, outy, dx, dy, isCorner = false
        ) => {
            if (ignoreCorners && isCorner) {
                return;
            }
            const wall = this.getCell(wx, wy);
            const inside = this.getCell(inx, iny);
            const outside = this.getCell(outx, outy);
            if (wall?.isSolid && !inside?.isSolid && outside?.isSolid) {
                results.push({ x: wx, y: wy, outward: { dx, dy } });
            }
        };

        // Top edge (y), inside is (y+1), outside is (y-1)
        for (let cx = x; cx <= x2; cx++) {
            const isCorner = (cx === x) || (cx === x2);
            pushIfDoor(cx, y,  cx, y + 1, cx, y - 1, 0, -1, isCorner);
        }

        // Bottom edge (y2), inside is (y2-1), outside is (y2+1)
        for (let cx = x; cx <= x2; cx++) {
            const isCorner = (cx === x) || (cx === x2);
            pushIfDoor(cx, y2, cx, y2 - 1, cx, y2 + 1, 0, 1, isCorner);
        }

        // Left edge (x), inside is (x+1), outside is (x-1)
        for (let cy = y; cy <= y2; cy++) {
            const isCorner = (cy === y) || (cy === y2);
            pushIfDoor(x, cy,  x + 1, cy, x - 1, cy, -1, 0, isCorner);
        }

        // Right edge (x2), inside is (x2-1), outside is (x2+1)
        for (let cy = y; cy <= y2; cy++) {
            const isCorner = (cy === y) || (cy === y2);
            pushIfDoor(x2, cy, x2 - 1, cy, x2 + 1, cy, 1, 0, isCorner);
        }

        return results;
    }

    /**
     * Choose the "best" pair of doorway candidates between two rooms.
     * Strategy: minimize Manhattan distance between door tiles (simple & effective).
     * Returns { a, b } or null if no candidates.
     */
    chooseBestDoorPair(candsA, candsB) {
        if (!candsA.length || !candsB.length) {
            return null;
        }

        let best = null;
        let bestDist = Infinity;

        for (const a of candsA) {
            for (const b of candsB) {
                const d = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
                if (d < bestDist) {
                    bestDist = d;
                    best = { a, b };
                }
            }
        }

        return best;
    }

    /**
     * Connect rooms by:
     *   1) Finding plausible doorway cells on each perimeter
     *   2) Picking the closest pair
     *   3) Carving both doors (+ optional outward thickening)
     *   4) Carving a 4-connected corridor between the doors
     */
    connectRoomsSmart(roomA, roomB, options = {}) {
        const {
            splitOrder = "auto",
            doorThickness = 1, // 1 means just the wall tile; >1 thickens outward
            carveOutward = true,
        } = options;

        const candsA = this.findRoomDoorCandidates(roomA);
        const candsB = this.findRoomDoorCandidates(roomB);
        const pair = this.chooseBestDoorPair(candsA, candsB);
        if (!pair) {
            return false;
        }

        // Carve the door tiles (turn wall -> floor)
        this.carveDoor(pair.a.x, pair.a.y, {
            outwardDir: carveOutward ? pair.a.outward : null,
            thickness: Math.max(1, doorThickness),
        });
        this.carveDoor(pair.b.x, pair.b.y, {
            outwardDir: carveOutward ? pair.b.outward : null,
            thickness: Math.max(1, doorThickness),
        });

        // Corridor from door to door
        this.connectPoints(pair.a.x, pair.a.y, pair.b.x, pair.b.y, { splitOrder });

        return true;
    }

    // --- Maze carving (recursive backtracker on a 2D cell lattice) -----------
    /**
     * Carves a 4-connected maze inside the rectangle [x, y, w, h].
     * The region is treated as a lattice with corridors on odd coordinates.
     * - Ensures outer border stays walls (good for rooms/corridors connection later).
     * - Optionally "braids" the maze to remove some dead-ends (adds loops).
     *
     * Options:
     *  - floorCell:    cell used for passages (default FLOOR)
     *  - wallCell:     cell used for walls (default WALL)
     *  - seed:         number; if provided, carving is deterministic
     *  - braid:        0..1; probability to remove each detected dead-end (default 0)
     *  - entryExit:    { openTop?:boolean, openBottom?:boolean, openLeft?:boolean, openRight?:boolean }
     *                  If set, will punch a single-tile opening centered on that side.
     *  - mask:         (x,y)=>boolean; return true to allow carving at that tile, false to keep wall.
     *                  (Mask is applied to *cells* not walls; walls still kept as walls.)
     */
    carveMazeRegion(x, y, w, h, options = {}) {
        const {
            floorCellType = "floor",
            wallCellType = "wall",
            seed = null,
            braid = 0,
            entryExit = null,
            mask = null,
        } = options;

        const rng = seed == null ? Math.random : this.mulberry32(seed);

        // Clamp and ensure region big enough for a maze
        if (w < 3 || h < 3) {
            return;
        }

        // 1) Initialize region as solid walls
        for (let yy = y; yy < y + h; yy++) {
            for (let xx = x; xx < x + w; xx++) {
                this.setCell(xx, yy, wallCellType);
            }
        }

        // 2) Lattice coordinates: carve only on odd offsets inside the border
        const xMin = x + 1, yMin = y + 1;
        const xMax = x + w - 2, yMax = y + h - 2;

        // Visited set for lattice cells (odd grid)
        const visited = new Set();
        const key = (cx, cy) => `${cx},${cy}`;

        // Pick a random valid starting cell on odd coords that passes mask (if any)
        const candidates = [];
        for (let cy = yMin; cy <= yMax; cy += 2) {
            for (let cx = xMin; cx <= xMax; cx += 2) {
                if (! this.#inBounds(cx, cy)) {
                    continue;
                }

                if (mask && !mask(cx, cy)) {
                    continue;
                }

                candidates.push({ cx, cy });
            }
        }

        if (candidates.length === 0) {
            return;
        }

        const start = candidates[(rng() * candidates.length) | 0];

        // Depth-first search (recursive backtracker via explicit stack)
        const stack = [start];
        visited.add(key(start.cx, start.cy));
        this.setCell(start.cx, start.cy, floorCellType);

        const dirs = [
            { dx:  2, dy:  0 }, // right
            { dx: -2, dy:  0 }, // left
            { dx:  0, dy:  2 }, // down
            { dx:  0, dy: -2 }, // up
        ];

        while (stack.length) {
            const cur = stack[stack.length - 1];
            // Shuffle directions each step for good randomness
            this.shuffleInPlace(dirs, rng);

            // Find an unvisited neighbor two steps away (on odd coords)
            let advanced = false;
            for (const { dx, dy } of dirs) {
                const nx = cur.cx + dx;
                const ny = cur.cy + dy;

                if (nx < xMin || nx > xMax || ny < yMin || ny > yMax) {
                    continue;
                }

                if (mask && !mask(nx, ny)) {
                    continue;
                }

                const k = key(nx, ny);
                if (visited.has(k)) {
                    continue;
                }

                // Carve wall between (step of 1) and the neighbor cell
                const wx = cur.cx + dx / 2;
                const wy = cur.cy + dy / 2;
                this.setCell(wx, wy, floorCellType); // corridor
                this.setCell(nx, ny, floorCellType); // new cell

                visited.add(k);
                stack.push({ cx: nx, cy: ny });
                advanced = true;
                break;
            }

            if (!advanced) {
                stack.pop();
            }
        }

        // 3) Optional braiding: remove some dead ends to make loops
        if (braid > 0) {
            this.braidDeadEnds(x, y, w, h, braid, floorCellType);
        }

        // 4) Optional entry/exit openings on the region border (one-tile notches)
        if (entryExit) {
            const midX = Math.floor((x + (x + w - 1)) / 2);
            const midY = Math.floor((y + (y + h - 1)) / 2);

            if (entryExit.openTop) {
                // find nearest floor beneath the top border and connect
                this.carveCenteredOpening(map, midX, y, 0, 1, floorCellType);
            }
            if (entryExit.openBottom) {
                this.carveCenteredOpening(map, midX, y + h - 1, 0, -1, floorCellType);
            }
            if (entryExit.openLeft) {
                this.carveCenteredOpening(map, x, midY, 1, 0, floorCellType);
            }
            if (entryExit.openRight) {
                this.carveCenteredOpening(map, x + w - 1, midY, -1, 0, floorCellType);
            }
        }
    }

    // Fisher–Yates shuffle
    shuffleInPlace(arr, rng) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = (rng() * (i + 1)) | 0;
            const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        }
    }

    // Create a single-tile opening on a border and ensure it meets a corridor
    carveCenteredOpening(bx, by, dx, dy, floorCellType) {
        // bx,by is on the border; step one inward until we hit non-wall or go out of bounds
        const x1 = bx + dx, y1 = by + dy;
        if (! this.#inBounds(bx, by)) {
            return;
        }

        this.setCell(bx, by, floorCellType);
        if (this.#inBounds(x1, y1)) {
            this.setCell(map, x1, y1, floorCell);
        }
    }

    // Remove some dead ends with probability p (0..1) by punching through one adjacent wall
    braidDeadEnds(x, y, w, h, p, floorCellType) {
        const ends = [];
        for (let yy = y + 1; yy < y + h - 1; yy++) {
            for (let xx = x + 1; xx < x + w - 1; xx++) {
                if (getCell(map, xx, yy)?.isSolid) {
                    continue;
                }

                const neighbors = this.countFloorNeighbors(xx, yy);
                if (neighbors === 1) {
                    ends.push({ xx, yy });
                }
            }
        }

        for (const d of ends) {
            if (Math.random() <= p) {
                // Try punch one adjacent wall into a second floor (avoid backtracking into the single neighbor if possible)
                const dirs = [
                    { dx:  1, dy:  0 },
                    { dx: -1, dy:  0 },
                    { dx:  0, dy:  1 },
                    { dx:  0, dy: -1 },
                ];

                this.shuffleInPlace(dirs, Math.random); // braiding can be non-deterministic unless you want to seed this too

                for (const { dx, dy } of dirs) {
                    const wx = d.xx + dx;
                    const wy = d.yy + dy;
                    const bx = d.xx + 2 * dx;
                    const by = d.yy + 2 * dy;
                    if (! this.#inBounds(bx, by)) {
                        continue;
                    }

                    // Punch through wall if beyond it is floor (creates a loop)
                    if (getCell(wx, wy)?.isSolid && ! getCell(bx, by)?.isSolid) {
                        this.setCell(wx, wy, floorCellType);
                        break;
                    }
                }
            }
        }
    }

    countFloorNeighbors(x, y) {
        return (
            ! this.getCell(x + 1, y)?.isSolid +
            ! this.getCell(x - 1, y)?.isSolid +
            ! this.getCell(x, y + 1)?.isSolid +
            ! this.getCell(x, y - 1)?.isSolid
        );
    }

    // --- Utilities to build masks from rooms ---------------------------------
    /**
     * Creates a mask function that DISALLOWS carving inside the given rectangles.
     * By default, it protects the whole room including its perimeter walls.
     *
     * Options:
     *  - padding: number >= 0 -> expand the protected rectangle by this many tiles
     *                             (useful to keep corridors from hugging walls)
     *  - protectInteriorOnly: boolean -> if true, protects only the interior (not walls)
     */
    makeRoomMask(rooms, options = {}) {
        const {
            padding = 0,
            protectInteriorOnly = false,
        } = options;

        // Normalize rectangles; each room is { x, y, w, h }
        const rects = rooms.map(r => {
            // include walls by default; interior-only shrinks by 1 each side
            const offset = protectInteriorOnly ? 1 : 0;

            // perimeter-inclusive bounds
            let x1 = r.x - padding + offset;
            let y1 = r.y - padding + offset;
            let x2 = (r.x + r.w - 1) + padding - offset;
            let y2 = (r.y + r.h - 1) + padding - offset;

            // If interior-only and padding over-shrinks, clamp back to empty exclusion
            if (x1 > x2 || y1 > y2) {
                // Nothing to protect for this rect
                return null;
            }

            return { x1, y1, x2, y2 };
        }).filter(Boolean);

        // Return a mask: true -> allowed to carve; false -> keep wall (protected)
        return function mask(x, y) {
            for (const r of rects) {
                if (x >= r.x1 && x <= r.x2 && y >= r.y1 && y <= r.y2) {
                    return false; // disallow carving in protected area
                }
            }

            return true; // carving allowed elsewhere
        };
    }

    /**
     * Combines multiple mask functions with logical AND.
     * Carving is allowed only if EVERY mask allows it.
     */
    combineMasks(...masks) {
        return function combined(x, y) {
            for (const m of masks) {
                if (m && ! m(x, y)) {
                    return false;
                }
            }
            return true;
        };
    }

    /**
     * Connects a room to the nearest existing floor (e.g., maze corridor)
     * that lies OUTSIDE the protected mask (e.g., room + padding).
     *
     * Options:
     *  - mask:        function(x,y)->boolean  // true = allowed to carve (outside rooms/padding)
     *  - splitOrder:  "auto" | "horizontal-first" | "vertical-first"
     *  - doorThickness: number >= 1           // outward thickening
     *  - carveOutward: boolean                // apply outward thickening along candidate's outward vector
     *
     * Returns true on success, false if no connection was made.
     */
    connectRoomToNearestMaze(room, options = {}) {
        const {
            mask = null,
            splitOrder = "auto",
            doorThickness = 1,
            carveOutward = true,
        } = options;

        // 1) Gather room door candidates (perimeter wall cells with floor inside).
        const cands = this.findRoomDoorCandidates(room, { ignoreCorners: true });
        if (!cands.length) {
            return false;
        }

        // 2) Build a list of all eligible target floor tiles (maze corridors)
        //    We only target tiles for which mask(x,y) === true (i.e., not inside protected areas).
        const targets = [];
        for (let y = 0; y < this.#cells.length; y++) {
            for (let x = 0; x < this.#cells[y].length; x++) {
                if (! this.#inBounds(x, y)) {
                    continue;
                }

                // skip protected zones (room + padding)
                if (mask && !mask(x, y)) {
                    continue;
                }

                if (! this.getCell(x, y)?.isSolid) {
                    targets.push({ x, y });
                }
            }
        }

        if (! targets.length) {
            return false;
        }

        // 3) Choose (door, target) pair minimizing Manhattan distance
        let best = null;
        let bestDist = Infinity;

        for (const d of cands) {
            for (const t of targets) {
                const dist = Math.abs(d.x - t.x) + Math.abs(d.y - t.y);
                if (dist < bestDist) {
                    bestDist = dist;
                    best = { door: d, target: t };
                }
            }
        }

        if (! best) {
            return false;
        }

        // 4) Carve the door notch (wall -> floor), optionally thickening outward
        this.carveDoor(best.door.x, best.door.y, {
            outwardDir: carveOutward ? best.door.outward : null,
            thickness: Math.max(1, doorThickness),
        });

        // 5) Carve a 4-connected corridor from the door tile to the chosen target
        this.connectPoints(best.door.x, best.door.y, best.target.x, best.target.y, {
            splitOrder,
        });

        return true;
    }

    /**
     * Midpoint circle: collect unique perimeter points at integer radius r.
     * Returns an array of {x, y}.
     */
    circlePerimeterPoints(cx, cy, r) {
        const pts = new Map(); // key "x,y" -> {x,y}
        let x = r;
        let y = 0;
        let err = 1 - r;

        const put8 = (px, py) => {
            const add = (ax, ay) => {
                pts.set(`${ax},${ay}`, { x: ax, y: ay });
            };

            add(cx + px, cy + py);
            add(cx + py, cy + px);
            add(cx - py, cy + px);
            add(cx - px, cy + py);
            add(cx - px, cy - py);
            add(cx - py, cy - px);
            add(cx + py, cy - px);
            add(cx + px, cy - py);
        };

        while (x >= y) {
            put8(x, y);
            y++;
            if (err < 0) {
                err += 2 * y + 1;
            } else {
                x--;
                err += 2 * (y - x) + 1;
            }
        }

        return Array.from(pts.values());
    }

    /**
     * Draw a thin circle outline.
     * Options:
     *   - cell:        cell object to place (default CELL.WALL)
     *   - fourConnected: boolean; if true, stitches perimeter into a 4-connected loop
     *   - splitOrder:  "auto" | "horizontal-first" | "vertical-first" (used when stitching)
     */
    circleOutline(cx, cy, r, options = {}) {
        const {
            cellType = "wall",
            fourConnected = false,
            splitOrder = "auto",
        } = options;

        if (r < 0) {
            return;
        }

        const pts = this.circlePerimeterPoints(cx, cy, r)
            .filter(p => this.#inBounds(p.x, p.y));

        if (!fourConnected) {
            for (const p of pts) {
                this.setCell(p.x, p.y, cellType);
            }
            return;
        }

        // To guarantee 4-connected traversal, sort by angle and connect neighbors.
        const ordered = pts
            .map(p => ({ ...p, angle: Math.atan2(p.y - cy, p.x - cx) }))
            .sort((a, b) => a.angle - b.angle);

        for (let i = 0; i < ordered.length; i++) {
            const a = ordered[i];
            const b = ordered[(i + 1) % ordered.length];
            // Stitch between successive perimeter points using 4-connected lines.
            this.line(a.x, a.y, b.x, b.y, {
                fourConnected: true,
                splitOrder,
                cellType,
            });
        }
    }

    /**
     * Fill a solid disk of radius r.
     * Always 4-connected as a region (walkable if cell.isSolid === false).
     */
    fillCircle(cx, cy, r, options = {}) {
        const { cellType = "wall" } = options;
        if (r < 0) {
            return;
        }

        const r2 = r * r;
        for (let y = cy - r; y <= cy + r; y++) {
            for (let x = cx - r; x <= cx + r; x++) {
                if (! this.#inBounds(x, y)) {
                    continue;
                }

                const dx = x - cx, dy = y - cy;
                if (dx * dx + dy * dy <= r2) {
                    this.setCell(x, y, cellType);
                }
            }
        }
    }

    /**
     * Draw a thick ring (annulus) centered at (cx, cy) with "thickness" tiles.
     * thickness = 1 approximates a thin ring; >1 makes a chunkier band.
     * This produces a continuous 4-connected band as a region.
     *
     * Options:
     *   - cell:   cell object to place (default CELL.WALL)
     *   - mode:   "centered" | "outer" | "inner"
     *             where the thickness is centered on r, or extends outward, or inward.
     */
    ring(cx, cy, r, thickness = 1, options = {}) {
        const {
            cellType = "wall",
            mode = "centered",
        } = options;

        if (r < 0 || thickness < 1) {
            return;
        }

        // Determine inner/outer radius (integer) for the annulus
        let rIn, rOut;
        if (mode === "outer") {
            rIn = Math.max(0, r);
            rOut = r + thickness - 1;
        } else if (mode === "inner") {
            rIn = Math.max(0, r - thickness + 1);
            rOut = Math.max(r, rIn);
        } else { // centered
            const half = (thickness - 1) / 2;
            rIn = Math.max(0, Math.floor(r - half));
            rOut = Math.floor(r + Math.ceil(half));
        }

        const rIn2  = rIn * rIn;
        const rOut2 = rOut * rOut;

        // Rasterize by distance check within bounding box
        for (let y = cy - rOut; y <= cy + rOut; y++) {
            for (let x = cx - rOut; x <= cx + rOut; x++) {
                if (! this.#inBounds(x, y)) {
                    continue;
                }

                const dx = x - cx, dy = y - cy;
                const d2 = dx * dx + dy * dy;
                if (d2 >= rIn2 && d2 <= rOut2) {
                    this.setCell(x, y, cellType);
                }
            }
        }
    }

    // --- Metric helpers ------------------------------------------------------
    metricDistance(dx, dy, metric) {
        switch (metric) {
            case "manhattan":
                // L1
                return Math.abs(dx) + Math.abs(dy);
            case "chebyshev":
                // L∞
                return Math.max(Math.abs(dx), Math.abs(dy));
            default:
                // L2 (euclidean)
                return Math.hypot(dx, dy);
        }
    }

    perimeterPointsMetric(cx, cy, r, metric = "euclidean") {
        if (r < 0) {
            return [];
        }

        const pts = new Map();
        const put = (x, y) => pts.set(`${x},${y}`, { x, y });

        if (metric === "euclidean") {
            // Use midpoint circle for crisp round outlines
            let x = r, y = 0, err = 1 - r;
            const put8 = (px, py) => {
                put(cx + px, cy + py);
                put(cx + py, cy + px);
                put(cx - py, cy + px);
                put(cx - px, cy + py);
                put(cx - px, cy - py);
                put(cx - py, cy - px);
                put(cx + py, cy - px);
                put(cx + px, cy - py);
            };
            while (x >= y) {
                put8(x, y);
                y++;
                if (err < 0) {
                    err += 2 * y + 1;
                } else {
                    x--;
                    err += 2 * (y - x) + 1;
                }
            }
        } else if (metric === "manhattan") {
            // Diamond perimeter: |dx| + |dy| == r
            for (let t = -r; t <= r; t++) {
                const k = r - Math.abs(t);
                put(cx + t, cy + k);
                put(cx + t, cy - k);
            }
            for (let t = -r + 1; t <= r - 1; t++) {
                const k = r - Math.abs(t);
                put(cx + k, cy + t);
                put(cx - k, cy + t);
            }
        } else {
            // Chebyshev square perimeter: max(|dx|,|dy|) == r
            for (let x = cx - r; x <= cx + r; x++) {
                put(x, cy - r);
                put(x, cy + r);
            }
            for (let y = cy - r + 1; y <= cy + r - 1; y++) {
                put(cx - r, y);
                put(cx + r, y);
            }
        }

        return Array.from(pts.values());
    }

    // --- Filled / ring rasterizers for any metric -------------------------------
    fillCircleMetric(cx, cy, r, { cellType = "wall", metric = "euclidean" } = {}) {
        if (r < 0) {
            return;
        }

        const rBox = r; // bounding square half-size
        for (let y = cy - rBox; y <= cy + rBox; y++) {
            for (let x = cx - rBox; x <= cx + rBox; x++) {
                if (! this.#inBounds(x, y)) {
                    continue;
                }

                const d = metricDistance(x - cx, y - cy, metric);
                if (d <= r + 1e-9) {
                    this.setCell(x, y, cell);
                }
            }
        }
    }

    ringMetric(cx, cy, r, thickness = 1, {
        cellType = "wall",
        metric = "euclidean",
        mode = "centered",
    } = {}) {
        if (r < 0 || thickness < 1) {
            return;
        }

        let rIn, rOut;
        if (mode === "outer") {
            rIn = Math.max(0, r);
            rOut = r + thickness - 1;
        } else if (mode === "inner") {
            rIn = Math.max(0, r - thickness + 1);
            rOut = Math.max(r, rIn);
        } else {
            const half = (thickness - 1) / 2;
            rIn = Math.max(0, Math.floor(r - half));
            rOut = Math.floor(r + Math.ceil(half));
        }

        const rBox = rOut;
        for (let y = cy - rBox; y <= cy + rBox; y++) {
            for (let x = cx - rBox; x <= cx + rBox; x++) {
                if (! this.#inBounds(x, y)) {
                    continue;
                }

                const d = this.metricDistance(x - cx, y - cy, metric);
                if (d >= rIn - 1e-9 && d <= rOut + 1e-9) {
                    this.setCell(x, y, cellType);
                }
            }
        }
    }

    // --- Thin outline with optional 4-connected stitching --------------------
    circleOutlineMetric(cx, cy, r, {
        cellType = "wall",
        metric = "euclidean",
        fourConnected = false,
        splitOrder = "auto",
    } = {}) {
        const pts = this.perimeterPointsMetric(cx, cy, r, metric)
            .filter(p => this.#inBounds(p.x, p.y));

        if (!fourConnected) {
            for (const p of pts) {
                this.setCell(p.x, p.y, cellType);
            }

            return;
        }

        // Stitch successive perimeter points (sorted by angle) with 4-connected lines
        const ordered = pts
            .map(p => ({ ...p, angle: Math.atan2(p.y - cy, p.x - cx) }))
            .sort((a, b) => a.angle - b.angle);

        for (let i = 0; i < ordered.length; i++) {
            const a = ordered[i];
            const b = ordered[(i + 1) % ordered.length];
            this.line(a.x, a.y, b.x, b.y, {
                fourConnected: true,
                splitOrder,
                cellType,
            });
        }
    }

    // --- Unified convenience wrapper ---
    circle(cx, cy, r, options = {}) {
        const {
            filled = false,
            traversable = false,
            thickness = 1,
            splitOrder = "auto",
            cellType = "wall",
            mode = "centered",
            metric = "euclidean", // "euclidean" | "manhattan" | "chebyshev"
        } = options;

        if (filled) {
            this.fillCircleMetric(cx, cy, r, { cellType, metric });
            return;
        }

        if (thickness > 1) {
            this.ringMetric(cx, cy, r, thickness, { cellType, metric, mode });
            return;
        }

        this.circleOutlineMetric(cx, cy, r, {
            cellType,
            metric,
            fourConnected: traversable,
            splitOrder,
        });
    }

    // Generates and returns a set of coordinates for where the exit should be
    #getExitPosition(sizeX, sizeY, playerStartX, playerStartY) {
        const margin = this.#margin;
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
                const exitOffsetX =
                    Math.round(Math.random() * Math.round(sizeX / 10));
                exit.x = playerStartX < sizeX / margin
                    ? sizeX - margin - exitOffsetX
                    : margin + exitOffsetX;
            } else {
                const exitOffsetY =
                    Math.round(Math.random() * Math.round(sizeY / 10));
                exit.y = playerStartY < sizeY / margin
                    ? sizeY - margin - exitOffsetY
                    : margin + exitOffsetY;
            }
        }

        if (exit.x === playerStartX && exit.y === playerStartY) {
            return null;
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
                        this.#cells[dissolvePoint.y][dissolvePoint.x]
                            .isExplored,
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
        const margin = this.#margin;
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

    // Reveals the field of view around a point
    // Does not reveal anything obscured by solid surfaces
    revealFieldOfView(px, py, radius) {
        // Reveal the player's own tile
        this.revealSpot(px, py, 0);

        for (let angle = 0; angle < 360; angle += 5) {
            const rad = angle * Math.PI / 180;
            let blocked = false;
            for (let r = 1; r <= radius; r++) {
                const tx = Math.round(px + Math.cos(rad) * r);
                const ty = Math.round(py + Math.sin(rad) * r);
                const cell = this.getCell(tx, ty);
                if (!cell) {
                    break;
                }

                this.revealSpot(tx, ty, 0);
                if (cell.isSolid) {
                    break;
                }
            }
        }
    }

    /**
     * Find a path with the A* pathfinding algorithm
     * - this.#cells[y][x].isSolid === true  -> wall (blocked)
     * - this.#cells[y][x].isSolid === false -> floor (walkable)
     *
     * Returns: Array<[x, y]> path from start to goal (inclusive),
     *          or null if unreachable.
     *
     * Movement: 4-directional (no diagonals)
     * Heuristic: Manhattan distance (admissible for 4-directional movement)
     *
     * @param start An array of the starting coordinates ([x, y])
     * @param goal An array of the target coordinates ([x, y])
     */
    findPath(start, goal) {
        const width = this.#cells[0]?.length ?? 0;
        const height = this.#cells.length;

        // Basic validation
        if (width === 0 || height === 0) {
            return null;
        }

        const [sx, sy] = start;
        const [gx, gy] = goal;
        if (
            !inBounds(sx, sy, width, height) ||
            !inBounds(gx, gy, width, height)
        ) {
            return null;
        }

        // Exit early if the start or end is a fall
        if (this.#cells[sy][sx].isSolid || this.#cells[gy][gx].isSolid) {
            return null;
        }

        if (sx === gx && sy === gy) {
            return [[sx, sy]];
        }

        // Helpers
        function inBounds(x, y, w, h) {
            return x >= 0 && y >= 0 && x < w && y < h;
        }

        function manhattan(x1, y1, x2, y2) {
            return Math.abs(x1 - x2) + Math.abs(y1 - y2);
        }

        function idx(x, y) {
            return y * width + x;
        }

        // Scores & bookkeeping
        const total = width * height;
        const gScore = new Float32Array(total);
        const fScore = new Float32Array(total);
        const openSetFlag = new Uint8Array(total);   // 0/1 flags if a node is currently in the heap
        const closedSet = new Uint8Array(total);     // 0/1 visited (finalized)
        const cameFrom = new Int32Array(total);      // stores predecessor index or -1
        cameFrom.fill(-1);
        gScore.fill(Infinity);
        fScore.fill(Infinity);

        const sIndex = idx(sx, sy);
        const gIndex = idx(gx, gy);
        gScore[sIndex] = 0;
        fScore[sIndex] = manhattan(sx, sy, gx, gy);

        // Min-heap priority queue by fScore
        const heap = new MinHeap((a, b) => fScore[a] - fScore[b]);
        heap.push(sIndex);
        openSetFlag[sIndex] = 1;

        // 4-directional neighbors
        const dirs = [
            [ 1,  0],
            [-1,  0],
            [ 0,  1],
            [ 0, -1],
        ];

        while (heap.size() > 0) {
            const current = heap.pop();
            openSetFlag[current] = 0;

            if (current === gIndex) {
                return reconstructPath(cameFrom, current, width);
            }

            if (closedSet[current]) {
                continue;
            }

            closedSet[current] = 1;

            const cx = current % width;
            const cy = (current / width) | 0;

            for (let i = 0; i < 4; i++) {
                const nx = cx + dirs[i][0];
                const ny = cy + dirs[i][1];

                if (!inBounds(nx, ny, width, height)) {
                    continue;
                }

                if (this.#cells?.[ny]?.[nx]?.isSolid ?? true) {
                    continue;
                }

                const nIndex = idx(nx, ny);
                if (closedSet[nIndex]) {
                    continue;
                }

                const tentativeG = gScore[current] + 1; // uniform cost for 4-dir grid

                if (tentativeG < gScore[nIndex]) {
                    cameFrom[nIndex] = current;
                    gScore[nIndex] = tentativeG;
                    fScore[nIndex] = tentativeG + manhattan(nx, ny, gx, gy);

                    if (!openSetFlag[nIndex]) {
                        heap.push(nIndex);
                        openSetFlag[nIndex] = 1;
                    } else {
                        heap.rescore(nIndex); // decrease-key
                    }
                }
            }
        }

        // No path
        return null;

        function reconstructPath(cameFrom, currentIndex, width) {
            const path = [];
            let cur = currentIndex;
            while (cur !== -1) {
                const x = cur % width;
                const y = (cur / width) | 0;
                path.push([x, y]);
                cur = cameFrom[cur];
            }
            path.reverse();
            return path;
        }
    }

    /**
     * Helper function to only grab the next step coordinates from a starting
     * point towards a target goal without returning the full list of steps
     * @see findPath()
     *
     * @param start An array of the starting coordinates ([x, y])
     * @param goal An array of the target coordinates ([x, y])
     */
    findNextStep(start, goal) {
        return this.findPath(start, goal)?.[1] ?? null;
    }
}

/** Simple binary min-heap with decrease-key support via rescore(node). */
class MinHeap {
    constructor(compareFn) {
        this._cmp = compareFn;
        this._data = [];
        this._pos = new Map(); // node -> index
    }
    size() {
        return this._data.length;
    }
    push(node) {
        this._data.push(node);
        this._pos.set(node, this._data.length - 1);
        this._siftUp(this._data.length - 1);
    }
    pop() {
        const data = this._data;
        const last = data.pop();
        if (data.length === 0) {
            this._pos.delete(last);
            return last;
        }
        const top = data[0];
        data[0] = last;
        this._pos.set(last, 0);
        this._pos.delete(top);
        this._siftDown(0);
        return top;
    }
    rescore(node) {
        // Node's priority decreased; fix heap position both ways just in case
        const i = this._pos.get(node);
        if (i === undefined) {
            return;
        }

        this._siftUp(i);
        this._siftDown(i);
    }
    _siftUp(i) {
        const data = this._data;
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (this._cmp(data[i], data[p]) < 0) {
                this._swap(i, p);
                i = p;
            } else break;
        }
    }
    _siftDown(i) {
        const data = this._data;
        const n = data.length;
        while (true) {
            let smallest = i;
            const l = (i << 1) + 1;
            const r = l + 1;
            if (l < n && this._cmp(data[l], data[smallest]) < 0) smallest = l;
            if (r < n && this._cmp(data[r], data[smallest]) < 0) smallest = r;
            if (smallest !== i) {
                this._swap(i, smallest);
                i = smallest;
            } else break;
        }
    }
    _swap(i, j) {
        const d = this._data;
        const ni = d[i], nj = d[j];
        d[i] = nj; d[j] = ni;
        this._pos.set(nj, i);
        this._pos.set(ni, j);
    }
}
