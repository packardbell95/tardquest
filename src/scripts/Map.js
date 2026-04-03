"use strict";

class MapCell {
    constructor(type = "floor", options = {}) {
        const defaults = {
            $element: null,
            x: null,
            y: null,
            rerender: true,
            // @TODO Obviously change this
            sceneArtId: type === "floor"
                ? "void"
                : "wall",
            displayName: "Unknown",
            mapCharacter: "?",
            isWall: false,
            canBeRolledOverByBouldingBall: null,
            onEnter: null,
            onTouch: null,
            onExplode: null,
            isExplored: true,
        };

        this.$element = options?.$element || defaults.$element;
        this.x = Number.isInteger(options?.x) ? options.x : defaults.x;
        this.y = Number.isInteger(options?.y) ? options.y : defaults.y;
        this.rerender = typeof options?.rerender === "boolean"
            ? options.rerender
            : defaults.rerender;
        this.type = type;
        this.displayName = options?.displayName || defaults.displayName;
        this.mapCharacter = options?.mapCharacter || defaults.mapCharacter;
        this.isWall = typeof options?.isWall === "boolean"
            ? options.isWall
            : defaults.isWall;
        this.canBeRolledOverByBouldingBall =
            typeof options?.canBeRolledOverByBouldingBall === "boolean"
                ? options.canBeRolledOverByBouldingBall
                : ! this.isWall;
        this.onEnter = options?.onEnter || defaults.onEnter;
        this.onTouch = options?.onTouch || defaults.onTouch;
        this.onExplode = options?.onExplode || defaults.onExplode;
        this.isExplored = typeof options?.isExplored === "boolean"
            ? options.isExplored
            : defaults.isExplored;
    }

    refreshElement(cellEntities = []) {
        this.rerender = false;
        if (! this.$element) {
            console.warn("MapCell has no element to refresh");
            return;
        }

        if (this.isExplored) {
            // Try sorting by zIndex, but fall back to interaction presence
            cellEntities.sort((a, b) => {
                const aZIndex = a.zIndex ?? -1;
                const bZIndex = b.zIndex ?? -1;
                if (aZIndex < bZIndex) {
                    return 1;
                } else if (bZIndex < aZIndex) {
                    return -1;
                }

                function scoreEntity(e) {
                    if (typeof e.onTouch === "function") {
                        return 2;
                    }

                    return typeof e.onEnter === "function" ? 1 : 0;
                }

                const aFunctionIndex = scoreEntity(a);
                const bFunctionIndex = scoreEntity(b);

                if (aFunctionIndex < bFunctionIndex) {
                    return 1;
                } else if (bFunctionIndex < aFunctionIndex) {
                    return -1;
                }

                const aId = a.id ?? -1;
                const bId = b.id ?? -1;

                if (aId < bId) {
                    return 1;
                } else if (bId < aId) {
                    return -1;
                }

                // We should never reach this point since entities should at
                // least have unique integer IDs
                return 0;
            });
        }

        const cellProperties = cellEntities.length === 0
            ? {
                id: null,
                displayName: this.displayName,
                mapCharacter: this.mapCharacter,
                className: this.isExplored
                    ? (this.isWall ? "wall" : "floor")
                    : "unexplored",
                type: this.type,
                target: null,
            }
            : {
                id: cellEntities[0].id || "❌ NO ID",
                displayName: cellEntities[0].getDisplayName(),
                mapCharacter: cellEntities[0].getDisplayCharacter(),
                className: this.isExplored
                    ? cellEntities[0]?.getClassName()
                    : "unexplored",
                type: cellEntities[0].type,
                target: cellEntities[0]?.hasTarget?.()
                    ? cellEntities[0].target
                    : null,
            };

        this.$element.className = cellProperties.className || "unknown";

        const hasCoordinates =
            typeof this.x === "number" &&
            typeof this.y === "number";

        if (hasCoordinates) {
            TardQuestMinimapTooltipGenerator.setCellDetails(
                this,
                cellEntities[0] || null
            );
            this.$element.setAttribute("data-tooltipPosition", "right");
            this.$element.setAttribute("data-tooltipGroupId", "minimap");
        } else {
            console.warn("No coordinates found for cell", {
                cellProperties,
                x: this.x,
                y: this.y,
            });
            this.$element.removeAttribute("data-tooltipHtml");
            this.$element.removeAttribute("data-tooltipPosition");
        }

        this.$element.innerText =
            (this.isExplored && cellProperties.mapCharacter) || "?";
        Tooltip.initialize(this.$element);
    }

    static defaultsByType(type) {
        /**
         * A MapCell can have the following properties:
         *
         * displayName
         *   The name that is displayed for the cell when hovering it on
         *   the minimap
         *
         * mapCharacter
         *   The character that represents the cell on the minimap
         *
         * isWall
         *   If true, the cell is a wall and does not allow entities to
         *   step onto it
         *
         * onEnter
         *   A function that runs when the player steps onto the cell.
         *   Always called with its own x, y coordinates. Won't work
         *   when isWall = true
         *
         * onTouch
         *   A function that runs when the player touches the cell.
         *   Won't work when isWall = false
         *
         * onExplode
         *   A function that runs when the player has blasted the cell
         *   with a brick of C4. Always called with its own x, y
         *   coordinates
         *
         * isExplored
         *   When false, the cell appears as "Unexplored" on the minimap
         */
        const defaults = {
            displayName: "Unknown",
            mapCharacter: "?",
            isWall: false,
            onEnter: null,
            onTouch: null,
            onExplode: null,
            isExplored: true,
        };

        return { ...defaults, ...(types[type] || {}) };
    }
}


/**
 * The game's map
 */
class GameMap {
    // The EntityMovementPlanner instance used to plan entity movements
    #EntityMovementPlanner;

    // A counter to track how many times the map has been updated in a session
    #revision = 0;

    // How many spaces from the edge are expected in the map
    #margin = 2;

    // The map's dimensions
    #width = null;
    #height = null;

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
            isWall: true,
        },
        floor: {
            displayName: "Floor",
            mapCharacter: ".",
        },
    };

    // Entities that exist within the map that are not fixed in place, such as
    // the player or any wandering NPCs
    #entities = [];

    // The reference to the game's minimap element, set by setMinimap()
    #$minimap = null;

    constructor(width, height) {
        if (! Number.isInteger(width) || ! Number.isInteger(height)) {
            console.error(
                "Map dimensions must be provided as integers",
                { width, height }
            );
            return;
        }

        const minSize = (this.#margin * 2) + 1;
        if (width < minSize || width < minSize) {
            throw new Error(
                `GameMap size must be at least ${minSize}x${minSize}`
            );
        }

        this.#EntityMovementPlanner = EntityMovementPlanner;
        this.#width = width;
        this.#height = height;
        this.#cells = [];

        for (let y = 0; y < height; y++) {
            this.#cells[y] = [];
            for (let x = 0; x < width; x++) {
                const isMapEdge =
                    x === 0 || y === 0 ||
                    x === width - 1 || y === height - 1;
                const cellType = isMapEdge ? "wall" : "floor";

                this.#cells[y][x] = this.generateCell(
                    cellType,
                    { x, y, isExplored: false }
                );
            }
        }
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }

    get cells() {
        return this.#cells;
    }

    get revision() {
        return this.#revision;
    }

    // Sets the reference to the game's minimap element
    setMinimap($element) {
        this.#$minimap = $element instanceof Element ? $element : null;

        if (this.#$minimap !== null) {
            this.initializeMinimap();
        }
    }

    // Sets the types of cells available in the map
    setCellTypes(cellTypes) {
        this.#cellTypes = { ...this.#cellTypes, ...cellTypes };
    }

    /**
     * Determines if a coordinate is obstructed
     * Obstruction means that the cell is impassible due to it being a wall or
     * if there is an entity that's occupying it
     *
     * @param x Map coordinate
     * @param y Map coordinate
     * @return bool True if the map is impassible at the given coordinates
     */
    isObstructed(x, y) {
        return Boolean(
            this.getCell(x, y).isWall ||
            this.#entities.some(e =>
                e.x === x &&
                e.y === y &&
                e.isAlive &&
                typeof e.onTouch === "function"
            )
        );
    }

    isExplored(x, y) {
        return this.#cells?.[y]?.[x].isExplored || true;
    }

    // Returns a cell at a given coordinate
    // Will return a wall if out of bounds/undefined to simulate blocking
    getCell(x, y) {
        const cell = this.#cells[y]?.[x] || this.generateCell('wall');
        cell.entities = this.getEntitiesAt(x, y);

        cell.onTouch = function(gameMap, actorEntity) {
            for (const entity of this.entities) {
                const canTouch =
                    entity.isActive &&
                    typeof entity.onTouch === "function";

                if (canTouch) {
                    entity.onTouch(gameMap, actorEntity);
                }
            }
        };

        cell.onEnter = function(gameMap, actorEntity) {
            for (const entity of this.entities) {
                const canEnter =
                    entity.isActive &&
                    typeof entity.onEnter === "function";

                if (canEnter) {
                    entity.onEnter(gameMap, actorEntity);
                }
            }
        }

        cell.onExplode = function(gameMap, actorEntity) {
            for (const entity of this.entities) {
                const canExplode =
                    entity.isActive &&
                    typeof entity.onExplode === "function";

                if (canExplode) {
                    entity.onExplode(gameMap, actorEntity);
                }
            }

            // @TODO Add overrides or settings for how the wall should crumble
            // and for how floors should be affected
            if (this.isWall) {
                this.isWall = false;
                this.type = "floor";
                this.sceneArtId = "floor";
                this.displayName = "Floor";
                this.mapCharacter = ".";
            }

            this.rerender = true;
        };

        return cell;
    }

    inBounds(x, y) {
        return (
            Number.isInteger(x) &&
            Number.isInteger(y) &&
            Boolean(this.#cells?.[y]?.[x])
        );
    }

    coordinateInBounds(coordinate) {
        return (
            Number.isInteger(coordinate.x) &&
            Number.isInteger(coordinate.y) &&
            Boolean(this.#cells?.[coordinate.y]?.[coordinate.x])
        );
    }

    // @TODO Remove this debug code
    rerenderCoordinate(x, y) {
        this.#rerenderCoordinate(x, y);
    }

    #rerenderCoordinate(x, y) {
        const cell = this.#cells?.[y]?.[x];
        if (cell) {
            cell.rerender = true;
        }
    }

    // Sets a cell on the map at a given coordinate
    // This can only overwrite cells in locations that already exist on the map
    setCell(x, y, type = "floor", options = {}) {
        if (! this.inBounds(x, y)) {
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

        this.#revision++;
        this.#rerenderCoordinate(x, y);
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

    // @TODO Ensure that not all entities contribute to a cell being occupied
    cellIsOccupied(x, y) {
        return Boolean(
            this.#entities.some(e =>
                e?.x === x &&
                e?.y === y &&
                e.isAlive &&
                typeof e.onTouch === "function"
            ) ||
            this.getCell(x, y)?.type !== "floor"
        );
    }

    getEmptyCellCoordinates() {
        const coordinates = [];

        for (let y = 0; y < this.#cells.length; y++) {
            for (let x = 0; x < this.#cells[y].length; x++) {
                if (! this.cellIsOccupied(x, y)) {
                    coordinates.push({ x, y });
                }
            }
        }

        return coordinates;
    }

    addEntity(entity) {
        this.#entities.push(entity);
    }

    purgeInactiveEntities() {
        this.#entities = this.#entities.filter(e => e.isActive);
    }

    sortEntities(entities = []) {
        return entities.sort((a, b) => {
            const aIsPlayer = a.type === "player";
            const bIsPlayer = b.type === "player";

            if (aIsPlayer && ! bIsPlayer) {
                return -1;
            } else if (! aIsPlayer && bIsPlayer) {
                return 1;
            }

            const aIsTangible = typeof a.onTouch === "function";
            const bIsTangible = typeof b.onTouch === "function";

            if (aIsTangible && ! bIsTangible) {
                return -1;
            } else if (! aIsTangible && bIsTangible) {
                return 1;
            }

            const aIsEnterable = typeof a.onEnter === "function";
            const bIsEnterable = typeof b.onEnter === "function";

            if (aIsEnterable && ! bIsEnterable) {
                return -1;
            } else if (! aIsEnterable && bIsEnterable) {
                return 1;
            }

            if (a.id > b.id) {
                return -1;
            } else if (a.id < b.id) {
                return 1;
            }

            return 0;
        });
    }

    getEntitiesAt(x, y) {
        const out = this.#entities.filter(e =>
            e.x === x &&
            e.y === y &&
            e.isActive
        );

        if (out.length === 0) {
            return [];
        }

        return this.sortEntities(out);
    }

    get entities() {
        return this.#entities;
    }

    filterEntities(preserveTypes = []) {
        if (! Array.isArray(preserveTypes)) {
            console.error("preserveTypes must be an array", { preserveTypes });
            return;
        }

        this.#entities =
            this.#entities.filter(e => preserveTypes.includes(e.type));
    }

    updateEntities() {
        this.moveEntities();
        this.tickEntities();
    }

    moveEntities() {
        this.clearDeactivatedEntities();

        this.#EntityMovementPlanner.planMovement(this);
        const moves = this.#EntityMovementPlanner.getNextPlannedMove();

        const plan = this.#EntityMovementPlanner.currentPlan;
        if (plan.length === 0) {
            return;
        }

        const entityIdsToMove = plan[0].map(e => e.entityId);

        for (const id of entityIdsToMove) {
            const entity =
                this.#entities.find(e => e.id === id);
            if (! entity) {
                console.error(
                    "Entity disappeared before move!",
                    { entityId: move.entityId }
                );
                continue;
            }

            for (let i = 0; i < entity.movesPerTurn && i < plan.length; i++) {
                const move = plan[i].find(e => e.entityId === id);
                if (! move) {
                    console.log("Entity ran out of moves", { entity, plan });
                    break;
                }

                const hasCoordinate =
                    Number.isInteger(move.x) &&
                    Number.isInteger(move.y);

                if (! hasCoordinate) {
                    console.error(
                        "No coordinate set for move",
                        { move, moves }
                    );
                    return;
                }

                this.#rerenderCoordinate(entity.x, entity.y);
                entity.moveTowards(move, this);

                // If the entity actually moved instead of just turned, make
                // sure that the coordinate is also rerendered
                if (move.x !== entity.x || move.y !== entity.y) {
                    this.#rerenderCoordinate(entity.x, entity.y);
                }
            }
        }

        this?.onMoveEntitiesEnd?.();
    }

    tickEntities() {
        for (const entity of this.entities) {
            entity.tick?.(this);
        }
    }

    moveRealtimeEntities() {
        this.clearDeactivatedEntities();

        const entities =
            this.entities.filter(e => e.isAlive && e.isActive && e.isRealtime);

        for (const entity of entities) {
            entity.move(this);
        }
    }

    clearDeactivatedEntities() {
        this.#entities = this.#entities.filter(e => e.isActive);
    }

    /**
     * Helper function to force an onEnter() event on behalf of a given entity
     * for any other entities that are on top of it
     *
     * Used for instances where a new enterable entity is placed on the map
     * beneath other entities, eg: the pit of spikes
     *
     * @param Object entity The entity whose onEnter event should be fired
     */
    triggerOnEnterEvent(entity) {
        if (! entity.isActive) {
            console.error("Entity is inactive", { entity });
            return;
        }

        if (typeof entity.onEnter !== "function") {
            console.error("Entity has no onEnter() function", { entity });
            return;
        }

        const actorEntities = this.#entities.filter(e =>
            e.isActive &&
            e.x === entity.x &&
            e.y === entity.y &&
            e.id !== entity.id
        );

        for (const actorEntity of actorEntities) {
            entity.onEnter(this, actorEntity);
        }
    }

    // Generates the map
    // playerStartX and playerStartY point to where the player resides, so this
    // spot should not be filled in
    // @TODO Replace playerStart position with entities
    generate(playerStartX, playerStartY) {
        const playerPositionOutOfBounds =
            playerStartX < 0 || playerStartX >= this.width ||
            playerStartY < 0 || playerStartY >= this.height;

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
            playerStartX,
            playerStartY
        );

        // Fill in walls
        this.fill(0, 0, this.width, this.height, "wall");

        // Carve out a path
        let position = { x: playerStartX, y: playerStartY };
        let stack = null;

        do {
            stack = this.carvePath(
                this.width,
                this.height,
                exitPosition,
                [position]
            );
        } while (stack === null);

        for (const coordinate of stack) {
            if (! this.inBounds(coordinate.x, coordinate.y)) {
                console.warn("Out of bounds", { coordinate, width: this.width, height: this.height, });
                continue;
            }

            this.#cells[coordinate.y][coordinate.x] = this.generateCell(
                'floor',
                { x: coordinate.x, y: coordinate.y, isExplored: false }
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

        const dx = Math.abs(endX - startX);
        const dy = Math.abs(endY - startY);
        const sx = startX < endX ? 1 : -1;
        const sy = startY < endY ? 1 : -1;
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

    /**
     * @TODO Rename to rect?
     */
    fill(startX, startY, endX, endY, cellType = "wall") {
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (! this.inBounds(x, y)) {
                    continue;
                }

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


    // Fisher–Yates shuffle
    shuffleInPlace(arr, rng) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = (rng() * (i + 1)) | 0;
            const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        }
    }

    // Create a single cell opening on a border and ensure it meets a corridor
    carveCenteredOpening(bx, by, dx, dy, floorCellType) {
        // bx,by is on the border; step one inward until we hit non-wall or go out of bounds
        const x1 = bx + dx, y1 = by + dy;
        if (! this.inBounds(bx, by)) {
            return;
        }

        this.setCell(bx, by, floorCellType);
        if (this.inBounds(x1, y1)) {
            this.setCell(map, x1, y1, floorCell);
        }
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
            .filter(p => this.inBounds(p.x, p.y));

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
     * Always 4-connected as a region (walkable if cell.isWall === false).
     */
    fillCircle(cx, cy, r, options = {}) {
        const { cellType = "wall" } = options;
        if (r < 0) {
            return;
        }

        const r2 = r * r;
        for (let y = cy - r; y <= cy + r; y++) {
            for (let x = cx - r; x <= cx + r; x++) {
                if (! this.inBounds(x, y)) {
                    continue;
                }

                const dx = x - cx, dy = y - cy;
                if (dx * dx + dy * dy <= r2) {
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

    manhattan(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    coordinatedManhattan(start, end) {
        return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
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
                if (! this.inBounds(x, y)) {
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
                if (! this.inBounds(x, y)) {
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
            .filter(p => this.inBounds(p.x, p.y));

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
    #getExitPosition(playerStartX, playerStartY) {
        const margin = this.#margin;
        const exit = {
            x: this.width - margin,
            y: this.height - margin,
        };
        const possiblePositions = [['x', 'y'], ['x'], ['y']];
        const positions = possiblePositions[
            Math.floor(Math.random() * possiblePositions.length)
        ];

        for (let p in positions) {
            if (positions[p] === 'x') {
                const exitOffsetX =
                    Math.round(Math.random() * Math.round(this.width / 10));
                exit.x = playerStartX < this.width / margin
                    ? this.width - margin - exitOffsetX
                    : margin + exitOffsetX;
            } else {
                const exitOffsetY =
                    Math.round(Math.random() * Math.round(this.height / 10));
                exit.y = playerStartY < this.height / margin
                    ? this.height - margin - exitOffsetY
                    : margin + exitOffsetY;
            }
        }

        if (exit.x === playerStartX && exit.y === playerStartY) {
            return null;
        }

        return exit;
    }

    carvePath(mapSizeX, mapSizeY, exitPosition, stack) {
        const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
        const step = Math.random() < 0.5 ? -1 : 1;
        let lastPosition = stack[stack.length - 1];

        for (let i = 0; i < 2; i++) {
            const nextPosition = {
                x: lastPosition.x + (direction === "horizontal" ? step : 0),
                y: lastPosition.y + (direction === "vertical" ? step : 0),
            };

            const atMapEdge =
                nextPosition.x === 0 ||
                nextPosition.y === 0 ||
                nextPosition.x === mapSizeX - 1 ||
                nextPosition.y === mapSizeY - 1;

            if (atMapEdge) {
                return null;
            }

            const alreadyVisited = stack.find(seenPosition =>
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
        for (let i = 0; i<100; i++) {
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
    getMapDissolvePoints() {
        const margin = this.#margin;
        const dissolvePoints = [];

        for (let y = margin; y < this.#cells.length - margin; y++) {
            for (let x = margin; x < this.#cells[0].length - margin; x++) {
                const isDissolvePoint = this.#cells[y][x]?.type === 'wall' && (
                    (this.#cells[y - 1][x]?.isWall ? 1 : 0) +
                    (this.#cells[y + 1][x]?.isWall ? 1 : 0) +
                    (this.#cells[y][x - 1]?.isWall ? 1 : 0) +
                    (this.#cells[y][x + 1]?.isWall ? 1 : 0)
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
        if (! this.#$minimap) {
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
                $cell.id = `map_cell_${x}_${y}`;
                this.#$minimap.append($cell);

                // Track the minimap element in the corresponding map cell
                this.#cells[y][x].$element = $cell;

                // Make sure we render the cell
                this.#rerenderCoordinate(x, y);
            }

            this.#$minimap.append(document.createElement("br"));
        }
    }

    #getRerenderCoordinates(forceFullRefresh = true) {
        const coordinates = [];

        for (let y = 0; y < this.#cells.length; y++) {
            for (let x = 0; x < this.#cells[y].length; x++) {
                if (forceFullRefresh || this.#cells[y][x].rerender) {
                    coordinates.push({ x, y });
                }
            }
        }

        return coordinates;
    }

    // Updates the cells on the minimap
    // @TODO See if we can set forceFullRefresh back to false
    refreshMinimap(forceFullRefresh = true) {
        if (! this.#$minimap) {
            console.warn("No minimap defined. Cannot rerender");
            return;
        }

        this.#getRerenderCoordinates(forceFullRefresh).forEach(coordinate => {
            const { x, y } = coordinate;
            const cell = this.#cells[y]?.[x];

            if (! cell) {
                console.error("Could not find cell to rerender", {
                    coordinate,
                    cells: this.#cells,
                });
                return;
            }

            const cellEntities =
                this.#entities.filter(e =>
                    e.isActive &&
                    e.x === x &&
                    e.y === y
                );

            cell.refreshElement(cellEntities);
        });
    }

    isExplored(x, y) {
        return this.#cells?.[y]?.[x].isExplored ?? false;
    }

    // Reveals a spot on the map, regardless of walls
    revealSpot(spotX, spotY, radius = 0) {
        for (let y = spotY - radius; y <= spotY + radius; y++) {
            for (let x = spotX - radius; x <= spotX + radius; x++) {
                if (typeof this.#cells[y]?.[x] !== "undefined") {
                    this.#cells[y][x].isExplored = true;
                    this.#rerenderCoordinate(x, y);
                }
            }
        }
    }

    // Hides the entire map
    conceal() {
        this.#changeCellVisibility(false);
    }

    // Reveals the entire map
    reveal() {
        this.#changeCellVisibility(true);
    }

    #changeCellVisibility(isExplored) {
        for (let y = 0; y < this.#cells.length; y++) {
            for (let x = 0; x < this.#cells[y].length; x++) {
                this.#cells[y][x].isExplored = isExplored;
                this.#rerenderCoordinate(x, y);
            }
        }
    }

    // Reveals the field of view around a point
    // Does not reveal anything obscured by solid surfaces
    revealFieldOfView(x, y, radius) {
        // Reveal the player's own cell
        this.revealSpot(x, y, 0);

        for (let angle = 0; angle < 360; angle += 5) {
            const rad = angle * Math.PI / 180;
            for (let r = 1; r <= radius; r++) {
                const tx = Math.round(x + Math.cos(rad) * r);
                const ty = Math.round(y + Math.sin(rad) * r);
                const cell = this.getCell(tx, ty);
                if (! cell) {
                    break;
                }

                this.revealSpot(tx, ty, 0);
                if (cell.isWall) {
                    break;
                }
            }
        }
    }

    #seeFrom(x, y, direction, visionDistance, fieldOfView, returnEntities) {
        const defaultFieldOfView = 90;
        const seen = [];
        const mappedEntities = returnEntities
            ? Object.entries(this.#entities).map(e => {
                const o = e[1];
                // @TODO It should not be necessary to set IDs here
                if (! o.id) {
                    o.id = e[0];
                }

                return o;
            })
            : [];

        const isValidFov =
            typeof fieldOfView === "number" &&
            fieldOfView > 0 &&
            fieldOfView <= 360;

        const fov = isValidFov ? fieldOfView : defaultFieldOfView;
        const halfFov = fov / 2;

        // The direction is an integer from 0-3 starting north, moving clockwise
        // 0 => N, 1 => E, 2 => S, W => 4
        const startingDirection = -90 + (90 * (direction % 4));
        const angleStart = startingDirection - halfFov;
        const angleEnd = startingDirection + halfFov;

        for (let angle = angleStart; angle <= angleEnd; angle++) {
            const rad = angle * Math.PI / 180;
            let previousX = x;
            let previousY = y;

            for (let d = 1; d <= visionDistance; d++) {
                const tx = Math.round(x + Math.cos(rad) * d);
                const ty = Math.round(y + Math.sin(rad) * d);
                if (tx === previousX && ty === previousY) {
                    continue;
                }

                const deltaX = tx - previousX;
                const deltaY = ty - previousY;

                // Prevent rays from moving between touching corners
                if (deltaX !== 0 && deltaY !== 0) {
                    const side1 = this.getCell(previousX + deltaX, previousY);
                    const side2 = this.getCell(previousX, previousY + deltaY);

                    const isBlockedByCorner = side1.isWall && side2.isWall;
                    if (isBlockedByCorner) {
                        break;
                    }
                }

                if (! returnEntities) {
                    if (! seen.find(e => e.x === tx && e.y === ty)) {
                        seen.push({ x: tx, y: ty });
                    }
                } else {
                    if (seen.find(e => e.x === tx && e.y === ty)) {
                        continue;
                    }

                    const seenEntities =
                        mappedEntities.filter(e => e.x === tx && e.y === ty);

                    if (seenEntities.length > 0) {
                        seen.push(...seenEntities);
                    }
                }

                if (this.getCell(tx, ty).isWall) {
                    break;
                }

                previousX = tx;
                previousY = ty;
            }
        }

        return seen;
    }

    seeFrom(x, y, direction, visionDistance, fieldOfView) {
        return this.#seeFrom(
            x,
            y,
            direction,
            visionDistance,
            fieldOfView,
            false
        );
    }

    seeEntitiesFrom(x, y, direction, visionDistance, fieldOfView) {
        return this.#seeFrom(
            x,
            y,
            direction,
            visionDistance,
            fieldOfView,
            true
        );
    }

    /**
     * @TODO Make sure this can handle ignoring entities
     * @TODO Also consolidate this with findPathCoordinated() which should be
     *       used instead
     *
     * Find a path with the A* pathfinding algorithm
     * - this.#cells[y][x].isWall === true  -> wall (blocked)
     * - this.#cells[y][x].isWall === false -> floor (walkable)
     *
     * Returns: Array<[x, y]> path from start to goal (inclusive),
     *          or null if unreachable.
     *
     * Movement: 4-directional (no diagonals)
     * Heuristic: Manhattan distance (admissible for 4-directional movement)
     *
     * @param start An array of the starting coordinates ([x, y])
     * @param goal An array of the target coordinates ([x, y])
     * @param blockedCoordinates Pairs of X, Y coordinates that are inaccessible
     * @return array|null Array of [x, y] steps, or null if path is impossible
     */
    findPath(start, goal, blockedCoordinates = []) {
        const width = this.#cells[0]?.length ?? 0;
        const height = this.#cells.length;

        if (width === 0 || height === 0) {
            console.error("The map is empty", { width, height });
            return null;
        }

        const [sx, sy] = start;
        const [gx, gy] = goal;
        if (
            ! this.inBounds(sx, sy, width, height) ||
            ! this.inBounds(gx, gy, width, height)
        ) {
            console.error(
                "Coordinates are not in bounds",
                { start, goal, mapDimensions: [width, height] }
            );
            return null;
        }

        if (sx === gx && sy === gy) {
            console.info("Target acquired", {sx, sy});
            return [[sx, sy]];
        }

        // Exit early if the start or end is a wall
        const isObstructed =
            this.#cells[sy][sx].isWall ||
            this.#cells[gy][gx].isWall ||
            blockedCoordinates.some(e =>
                (e.x === sx && e.y === sy) ||
                (e.x === gx && e.y === gy)
            );

        if (isObstructed) {
            console.info(
                "Hit an obstruction",
                {
                    start: `(${sx}, ${sy})`,
                    goal: `(${gx}, ${gy})`,
                }
            );
            return null;
        }

        // Index helper
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
        fScore[sIndex] = this.manhattan(sx, sy, gx, gy);

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

                if (! this.inBounds(nx, ny, width, height)) {
                    continue;
                }

                if (this.#cells?.[ny]?.[nx]?.isWall ?? true) {
                    continue;
                }

                const nIndex = idx(nx, ny);
                if (closedSet[nIndex]) {
                    continue;
                }

                // Uniform cost for 4-directional grid
                const tentativeG = gScore[current] + 1;

                if (tentativeG < gScore[nIndex]) {
                    cameFrom[nIndex] = current;
                    gScore[nIndex] = tentativeG;
                    fScore[nIndex] =
                        tentativeG + this.manhattan(nx, ny, gx, gy);

                    if (!openSetFlag[nIndex]) {
                        heap.push(nIndex);
                        openSetFlag[nIndex] = 1;
                    } else {
                        // Decrease-key
                        heap.rescore(nIndex);
                    }
                }
            }
        }

        // No path was found
        return null;

        function reconstructPath(cameFrom, currentIndex, width) {
            const path = [];
            let current = currentIndex;
            while (current !== -1) {
                const x = current % width;
                const y = (current / width) | 0;
                path.push([x, y]);
                current = cameFrom[current];
            }
            path.reverse();
            return path;
        }
    }

    findPathCoordinated(
        start,
        goal,
        claimedSpacesInTime = [],
        corridors = {},
        availableCorridorEntrances = {},
        entity
    ) {
        const width = this.#cells[0]?.length ?? 0;
        const height = this.#cells.length;

        if (width === 0 || height === 0) {
            console.error("The map is empty", { width, height });
            return null;
        }

        if (
            ! this.coordinateInBounds(start) ||
            ! this.coordinateInBounds(goal)
        ) {
            console.error(
                "Coordinates are not in bounds",
                { start, goal, mapDimensions: [width, height] }
            );
            return null;
        }

        if (start.x === goal.x && start.y === goal.y) {
            console.info("Already on the goal", { start, goal });
            return null;
        }

        // Planning horizon: we only reason about reservations inside this window.
        // If window is 8, valid times are 0..7 and moves advance time by +1.
        const maxTime = Math.max(0, claimedSpacesInTime.length - 1);
        if (maxTime < 1) {
            console.info("Planning horizon is empty");
            return null;
        }

        const cellCount = width * height;
        const stateCount = cellCount * (maxTime + 1);

        function cellIndex(coordinate) {
            return coordinate.y * width + coordinate.x;
        }

        function stateIndex(cellIdx, time) {
            return time * cellCount + cellIdx;
        }

        function decodeStateIndex(index) {
            const time = (index / cellCount) | 0;
            const cellIdx = index - (time * cellCount);
            const x = cellIdx % width;
            const y = (cellIdx / width) | 0;
            return { x, y, time, cellIdx };
        }

        function isClaimedAt(time, x, y) {
            if (time < 0 || time >= claimedSpacesInTime.length) {
                return false;
            }

            return claimedSpacesInTime[time].some(e =>
                e.x === x &&
                e.y === y &&
                e.entityId !== entity?.id &&
                e.entityId !== entity?.targetEntityId
            );
        }

        function reconstructPath(cameFrom, endStateIndex) {
            const path = [];
            let current = endStateIndex;

            while (current !== -1) {
                const decoded = decodeStateIndex(current);
                path.push({ x: decoded.x, y: decoded.y });
                current = cameFrom[current];
            }

            path.reverse();

            return path;
        }

        // Scores & bookkeeping
        const gScore = new Float32Array(stateCount);
        const fScore = new Float32Array(stateCount);
        const openSetFlag = new Uint8Array(stateCount);
        const closedSet = new Uint8Array(stateCount);
        const cameFrom = new Int32Array(stateCount);

        cameFrom.fill(-1);
        gScore.fill(Infinity);
        fScore.fill(Infinity);

        const startCellIdx = cellIndex(start);
        const goalCellIdx = cellIndex(goal);

        const startState = stateIndex(startCellIdx, 0);
        gScore[startState] = 0;
        fScore[startState] = this.coordinatedManhattan(start, goal);

        const heap = new MinHeap((a, b) => fScore[a] - fScore[b]);
        heap.push(startState);
        openSetFlag[startState] = 1;

        // 4-directional + wait
        const dirs = [
            [ 1,  0],
            [-1,  0],
            [ 0,  1],
            [ 0, -1],
            [ 0,  0],
        ];

        let expansions = 0;
        let bestState = startState;
        let bestH = Infinity; // this.coordinatedManhattan(start, goal);

        while (heap.size() > 0 && expansions++ < 100000) {
            const currentState = heap.pop();
            openSetFlag[currentState] = 0;

            if (closedSet[currentState]) {
                continue;
            }

            closedSet[currentState] = 1;

            const currentDecoded = decodeStateIndex(currentState);
            const currentCoordinate = {
                x: currentDecoded.x,
                y: currentDecoded.y
            };
            const currentTime = currentDecoded.time;
            const h = this.coordinatedManhattan(currentDecoded, goal);

            if (h < bestH) {
                bestH = h;
                bestState = currentState;
            }

            // If we reached the goal at any time within the horizon, we're done
            if (currentDecoded.cellIdx === goalCellIdx) {
                return reconstructPath(cameFrom, currentState);
            }

            // We can't expand beyond the horizon
            if (currentTime >= maxTime) {
                continue;
            }

            const currentCorridorId = this.identifyCorridor(
                currentCoordinate.x,
                currentCoordinate.y,
                corridors
            );

            for (const dir of dirs) {
                const nextX = currentCoordinate.x + dir[0];
                const nextY = currentCoordinate.y + dir[1];
                const nextTime = currentTime + 1;

                if (
                    nextX < 0 ||
                    nextY < 0 ||
                    nextX >= width ||
                    nextY >= height
                ) {
                    continue;
                }

                const cell = this.getCell(nextX, nextY);
                if (cell.isWall) {
                    continue;
                }

                // Blocked at the time we would arrive
                if (isClaimedAt(nextTime, nextX, nextY)) {
                    continue;
                }

                // Prevent edge-swap collisions:
                // If someone is in (nextX, nextY) at currentTime and is in the
                // current cell at nextTime, entities would be swapping
                const wouldSwap =
                    isClaimedAt(currentTime, nextX, nextY) &&
                    isClaimedAt(
                        nextTime,
                        currentCoordinate.x,
                        currentCoordinate.y
                    );

                if (wouldSwap) {
                    continue;
                }

                const nextCorridorId = this.identifyCorridor(
                    nextX,
                    nextY,
                    corridors
                );

                const isEnteringCorridor =
                    currentCorridorId === null &&
                    nextCorridorId !== null;

                const corridorOpeningIsBlocked =
                    isEnteringCorridor &&
                    availableCorridorEntrances.hasOwnProperty(nextCorridorId) &&
                    (
                        availableCorridorEntrances[nextCorridorId].x !==
                            nextX ||
                        availableCorridorEntrances[nextCorridorId].y !==
                            nextY
                    );

                if (corridorOpeningIsBlocked) {
                    continue;
                }

                const nextCellIdx = nextY * width + nextX;
                const nextState = stateIndex(nextCellIdx, nextTime);

                if (closedSet[nextState]) {
                    continue;
                }

                const tentativeG = gScore[currentState] + 1;

                if (tentativeG < gScore[nextState]) {
                    cameFrom[nextState] = currentState;
                    gScore[nextState] = tentativeG;

                    fScore[nextState] =
                        tentativeG +
                        this.coordinatedManhattan({ x: nextX, y: nextY }, goal);

                    if (! openSetFlag[nextState]) {
                        heap.push(nextState);
                        openSetFlag[nextState] = 1;
                    } else {
                        heap.rescore(nextState);
                    }
                }
            }
        }

        // If we didn't reach the goal within the horizon, still return a partial route
        const bestPath = reconstructPath(cameFrom, bestState);

        // If the best path is just "stand still", treat as no move
        if (bestPath.length <= 1) {
            console.warn("The best path is to stand still apparently", { cameFrom, bestState, bestPath });
            return null;
        }

        console.info("Returning the best path", { bestPath });
        return bestPath;
    }



    identifyCorridor(x, y, corridors) {
        const corridorIds = Object.keys(corridors);

        for (const id of corridorIds) {
            const corridor = corridors[id];
            if (! Array.isArray(corridor)) {
                console.error("Corridor is not an array", { corridor, id });
                continue;
            }

            if (corridor.some(e => e.x === x && e.y === y)) {
                return id;
            }
        }

        return null;
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
