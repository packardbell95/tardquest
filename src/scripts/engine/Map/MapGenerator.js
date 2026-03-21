"use strict";

const MapGenerator = {
    generate: {
        /**
         * 1: initialize chance of changing direction Pc=5
         * 2: initialize chance of adding room Pr=5
         * 3: place the digger at a dungeon tile and randomize its direction
         * 4: dig along that direction
         * 5: roll a random number Nc between 0 and 100
         * 6: if Nc below Pc:
         * 7:    randomize the agent’s direction
         * 8:    set Pc=0
         * 9: else:
         * 10:    set Pc=Pc+5
         * 11:roll a random number Nr between 0 and 100
         * 12:if Nr below Pr:
         * 13:    randomize room width and room length between 3 and 7
         * 14:    place room around current agent position
         * 14:    set Pr=0
         * 15:else:
         * 16:    set Pr=Pr+5
         * 17:if the dungeon is not large enough:
         * 18:    go to step 4
         */
        agentBasedDungeonGrowing: function(
            width = 30,
            height = 11,
            targetEmptyPercent = 40
        ) {
            const roomSize = { min: 3, max: 7 };

            if (targetEmptyPercent < 10 || targetEmptyPercent > 80) {
                console.error(
                    "Empty percentage is out of range",
                    { targetEmptyPercent }
                );
                return null;
            }

            const validDimensions =
                Number.isInteger(width) &&
                Number.isInteger(height) &&
                width > 4 &&
                height > 4;

            if (! validDimensions) {
                console.error("Game map must be greater than 4x4", { width, height });
                return null;
            }

            const gameMap = Array.from(
                { length: height },
                e => Array.from({ length: width }, e => true)
            );

            let changeDirectionChancePercent = 5;
            let addingRoomChancePercent = 5;

            const digger = {
                x: Math.floor(Math.random() * (width - 2)) + 1,
                y: Math.floor(Math.random() * (height - 2)) + 1,
                direction: Math.floor(Math.random() * 4),
                dig: function(gameMap) {
                    gameMap[this.y][this.x] = false;
                },
                digRoom: function(gameMap, width, height) {
                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {
                            const targetX = Math.floor(this.x - (width / 2) + x);
                            const targetY = Math.floor(this.y - (height / 2) + y);
                            const isInBounds =
                                targetY > 1 && targetY < gameMap.length - 1 &&
                                targetX > 1 && targetX < gameMap[targetY].length - 1;

                            if (isInBounds) {
                                gameMap[targetY][targetX] = false;
                            }
                        }
                    }
                },
                move: function(gameMap) {
                    const movementMatrix = [[0, -1], [1, 0], [0, 1], [-1, 0]];
                    const offset = movementMatrix[this.direction];
                    const nextX = this.x + offset[0];
                    const nextY = this.y + offset[1];
                    const inBounds =
                        nextY > 1 && nextY < gameMap.length - 1 &&
                        nextX > 1 && nextX < gameMap[nextY].length - 1;

                    if (inBounds) {
                        this.x = nextX;
                        this.y = nextY;
                        this.dig(gameMap);
                    } else {
                        this.randomizeDirection();
                    }
                },
                randomizeDirection: function() {
                    this.direction = Math.floor(Math.random() * 4);
                },
            };

            digger.dig(gameMap);

            while (true) {
                digger.move(gameMap);

                if (Math.floor(Math.random() * 100) < changeDirectionChancePercent) {
                    digger.randomizeDirection();
                    changeDirectionChancePercent = 0;
                } else {
                    changeDirectionChancePercent += 5;
                }

                if (Math.floor(Math.random() * 100) < addingRoomChancePercent) {
                    const roomWidth =
                        Math.floor(Math.random() * (roomSize.max - roomSize.min + 1)) +
                        roomSize.min;
                    const roomHeight =
                        Math.floor(Math.random() * (roomSize.max - roomSize.min + 1)) +
                        roomSize.min;

                    digger.digRoom(gameMap, roomWidth, roomHeight);
                    addingRoomChancePercent = 0;
                } else {
                    addingRoomChancePercent += 5;
                }

                const cellCount = gameMap.reduce((a, c) => ({
                    dug: a.dug + c.filter(f => ! f).length,
                    total: a.total + c.length,
                }), { dug: 0, total: 0 });

                const dugPercent = Math.round((cellCount.dug / cellCount.total) * 100);
                if (dugPercent >= targetEmptyPercent) {
                    break;
                }
            }

            return gameMap;
        },


        /**
         * Same as above, but with this:
         *
         * 1: place the digger at a dungeon tile
         * 2: set helper variables Fr=0 and Fc=0
         * 3: for all possible room sizes:
         * 3:    if a potential room will not intersect existing rooms:
         * 4:    place the room
         * 5:    Fr=1
         * 6:    break from for loop
         * 7: for all possible corridors of any direction and length 3 to 7:
         * 8:    if a potential corridor will not intersect existing rooms:
         * 9:    place the corridor
         * 10:   Fc=1
         */
        agentBasedDungeonGrowingWithoutIntersectingRooms: function(
            width = 30,
            height = 11,
            targetEmptyPercent = 40
        ) {
            const roomSize = { min: 5, max: 7 };

            if (targetEmptyPercent < 10 || targetEmptyPercent > 80) {
                console.error(
                    "Empty percentage is out of range",
                    { targetEmptyPercent }
                );
                return null;
            }

            const validDimensions =
                Number.isInteger(width) &&
                Number.isInteger(height) &&
                width > 4 &&
                height > 4;

            if (! validDimensions) {
                console.error("Game map must be greater than 4x4", { width, height });
                return null;
            }

            const gameMap = Array.from(
                { length: height },
                e => Array.from({ length: width }, e => true)
            );

            let changeDirectionChancePercent = 5;
            let addingRoomChancePercent = 5;

            const digger = {
                x: Math.floor(Math.random() * (width - 2)) + 1,
                y: Math.floor(Math.random() * (height - 2)) + 1,
                direction: Math.floor(Math.random() * 4),
                dugRooms: [],
                dig: function(gameMap) {
                    gameMap[this.y][this.x] = false;
                },
                getMaxPossibleRoomSize: function(gameMap, minSize, maxSize) {
                    let currentWidth = maxSize, currentHeight = maxSize;

                    while (currentWidth >= minSize && currentHeight >= minSize) {
                        const targetX = Math.floor(this.x - (currentWidth / 2));
                        const targetY = Math.floor(this.y - (currentHeight / 2));

                        const isInBounds =
                            targetY > 1 &&
                            targetY + currentHeight < gameMap.length - 1 &&
                            targetX > 1 &&
                            targetX + currentWidth < gameMap[targetY].length - 1;

                        if (isInBounds) {
                            const willIntersect = this.dugRooms.some(e =>
                                e.x <= targetX + currentWidth  &&
                                e.x + e.width >= targetX  &&
                                e.y <= targetY + currentHeight &&
                                e.y + e.height >= targetY
                            );

                            if (! willIntersect) {
                                return {
                                    x: targetX,
                                    y: targetY,
                                    width: currentWidth,
                                    height: currentHeight,
                                };
                            }
                        }

                        if (currentWidth <= minSize) {
                            currentHeight--;
                        } else if (currentHeight <= minSize) {
                            currentWidth--;
                        } else {
                            Math.random() < 0.5 ? currentWidth-- : currentHeight--;
                        }
                    }

                    return null;
                },
                digRoom: function(gameMap, minSize, maxSize) {
                    const roomDimensions =
                        this.getMaxPossibleRoomSize(gameMap, minSize, maxSize);

                    if (roomDimensions === null) {
                        return;
                    }

                    const maxY = roomDimensions.y + roomDimensions.height;

                    for (let y = roomDimensions.y; y < maxY; y++) {
                        const maxX = roomDimensions.x + roomDimensions.width;

                        for (let x = roomDimensions.x; x < maxX; x++) {
                            gameMap[y][x] = false;
                        }
                    }

                    this.dugRooms.push(roomDimensions);
                },
                move: function(gameMap) {
                    const movementMatrix = [[0, -1], [1, 0], [0, 1], [-1, 0]];
                    const offset = movementMatrix[this.direction];
                    const nextX = this.x + offset[0];
                    const nextY = this.y + offset[1];
                    const inBounds =
                        nextY > 1 && nextY < gameMap.length - 1 &&
                        nextX > 1 && nextX < gameMap[nextY].length - 1;

                    if (inBounds) {
                        this.x = nextX;
                        this.y = nextY;
                        this.dig(gameMap);
                    } else {
                        this.randomizeDirection();
                    }
                },
                randomizeDirection: function() {
                    this.direction = Math.floor(Math.random() * 4);
                },
            };

            digger.dig(gameMap);

            while (true) {
                digger.move(gameMap);

                if (Math.floor(Math.random() * 100) < changeDirectionChancePercent) {
                    digger.randomizeDirection();
                    changeDirectionChancePercent = 0;
                } else {
                    changeDirectionChancePercent += 5;
                }

                if (Math.floor(Math.random() * 100) < addingRoomChancePercent) {
                    digger.digRoom(gameMap, roomSize.min, roomSize.max);
                    addingRoomChancePercent = 0;
                } else {
                    addingRoomChancePercent += 5;
                }

                const cellCount = gameMap.reduce((a, c) => ({
                    dug: a.dug + c.filter(f => ! f).length,
                    total: a.total + c.length,
                }), { dug: 0, total: 0 });

                const dugPercent = Math.round((cellCount.dug / cellCount.total) * 100);
                if (dugPercent >= targetEmptyPercent) {
                    break;
                }
            }

            return gameMap;
        },


        spatialExpansionDungeonGrowing: function(
            width = 30,
            height = 11,
            pointCount = 5,
            pointPlacementJitter = 0.35,
            targetFillRatio = 0.38, // How much of the map to turn into floor
        ) {
            const wall = true;
            const floor = false;

            const validDimensions =
                Number.isInteger(width) &&
                Number.isInteger(height) &&
                width > 4 &&
                height > 4;

            if (! validDimensions) {
                console.error("Game map must be greater than 4x4", { width, height });
                return null;
            }

            const validPointCount =
                Number.isInteger(pointCount) &&
                pointCount > 0 &&
                pointCount < width * height;

            if (! validPointCount) {
                console.error("Point count is out of range", { pointCount });
                return null;
            }

            const gameMap = Array.from(
                { length: height },
                () => Array.from({ length: width }, () => wall)
            );

            function halton(index, base) {
                let result = 0;
                let fraction = 1;
                let i = index;

                while (i > 0) {
                    fraction /= base;
                    result += fraction * (i % base);
                    i = Math.floor(i / base);
                }

                return result;
            }

            function clampInt(value, minValue, maxValue) {
                if (value < minValue) {
                    return minValue;
                }

                if (value > maxValue) {
                    return maxValue;
                }

                return value;
            }

            function randomFloat(minValue, maxValue) {
                return minValue + Math.random() * (maxValue - minValue);
            }

            function carveCell(x, y) {
                const inBounds =
                    x > 0 && x < width - 1 &&
                    y > 0 && y < height - 1;

                if (inBounds) {
                    gameMap[y][x] = floor;
                }
            }

            function carveLine(x1, y1, x2, y2) {
                // Axis-aligned inclusive lines (we only use these for corridors).
                if (x1 === x2) {
                    const startY = Math.min(y1, y2);
                    const endY = Math.max(y1, y2);

                    for (let y = startY; y <= endY; y++) {
                        carveCell(x1, y);
                    }

                    return;
                }

                if (y1 === y2) {
                    const startX = Math.min(x1, x2);
                    const endX = Math.max(x1, x2);

                    for (let x = startX; x <= endX; x++) {
                        carveCell(x, y1);
                    }

                    return;
                }
            }

            function carveCorridor(pointA, pointB) {
                const goHorizontalFirst = Math.random() < 0.5;

                if (goHorizontalFirst) {
                    carveLine(pointA.x, pointA.y, pointB.x, pointA.y);
                    carveLine(pointB.x, pointA.y, pointB.x, pointB.y);

                    return;
                }

                carveLine(pointA.x, pointA.y, pointA.x, pointB.y);
                carveLine(pointA.x, pointB.y, pointB.x, pointB.y);
            }

            function haltonPointsOnGridWithJitter() {
                const used = new Set();
                const points = [];

                // Avoid borders if we’re keeping a perimeter wall
                const minX = 1;
                const minY = 1;
                const maxX = width - 2;
                const maxY = height - 2;

                let index = 1;
                let attempts = 0;
                const maxAttempts = pointCount * 200;

                while (points.length < pointCount && attempts < maxAttempts) {
                    const u = halton(index, 2);
                    const v = halton(index, 3);

                    // Continuous position + jitter, then snap to grid.
                    const xFloat = u * width + randomFloat(
                        -pointPlacementJitter,
                        pointPlacementJitter
                    );

                    const yFloat = v * height + randomFloat(
                        -pointPlacementJitter,
                        pointPlacementJitter
                    );

                    const x = clampInt(Math.floor(xFloat), minX, maxX);
                    const y = clampInt(Math.floor(yFloat), minY, maxY);

                    const key = `${x},${y}`;
                    if (! used.has(key)) {
                        used.add(key);
                        points.push({ id: points.length, x, y });
                    }

                    index++;
                    attempts++;
                }

                return points;
            }

            // Organic multi-source expansion:
            // we claim cells gradually from multiple seed frontiers.
            function growRegions(points) {
                const owner = Array.from(
                    { length: height },
                    () => Array.from({ length: width }, () => -1)
                );

                const frontiers = points.map(p => [{ x: p.x, y: p.y }]);

                for (const p of points) {
                    owner[p.y][p.x] = p.id;
                }

                const totalCells = width * height;
                const targetFloorCells = Math.floor(totalCells * targetFillRatio);
                let carvedCount = 0;

                // Seed cells count as carved floors.
                for (const p of points) {
                    carveCell(p.x, p.y);
                    carvedCount++;
                }

                const neighbors4 = [
                    { dx: 1, dy: 0 },
                    { dx: -1, dy: 0 },
                    { dx: 0, dy: 1 },
                    { dx: 0, dy: -1 },
                ];

                let activeIds = points.map(p => p.id);

                while (activeIds.length > 0 && carvedCount < targetFloorCells) {
                    // Pick a random active region each step to keep growth balanced.
                    const activeIndex = Math.floor(Math.random() * activeIds.length);
                    const regionId = activeIds[activeIndex];
                    const frontier = frontiers[regionId];

                    if (frontier.length === 0) {
                        activeIds.splice(activeIndex, 1);
                        continue;
                    }

                    // Pop a random frontier cell
                    const cellIndex = Math.floor(Math.random() * frontier.length);
                    const cell = frontier[cellIndex];
                    frontier[cellIndex] = frontier[frontier.length - 1];
                    frontier.pop();

                    // Shuffle neighbor order slightly for more organic shapes
                    for (let i = neighbors4.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        const temp = neighbors4[i];
                        neighbors4[i] = neighbors4[j];
                        neighbors4[j] = temp;
                    }

                    for (const n of neighbors4) {
                        const nx = cell.x + n.dx;
                        const ny = cell.y + n.dy;

                        const inBounds =
                            nx > 0 && nx < width - 1 &&
                            ny > 0 && ny < height - 1;

                        if (! inBounds || owner[ny][nx] !== -1) {
                            continue;
                        }

                        owner[ny][nx] = regionId;
                        carveCell(nx, ny);
                        carvedCount++;

                        frontier.push({ x: nx, y: ny });

                        if (carvedCount >= targetFloorCells) {
                            break;
                        }
                    }
                }

                return owner;
            }

            function manhattan(a, b) {
                return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
            }

            // Connect all points by a simple Prim MST and carve corridors.
            function connectSeeds(points) {
                if (points.length <= 1) {
                    return;
                }

                const inTree = new Set([points[0].id]);
                const remaining = new Set(points.slice(1).map(p => p.id));

                while (remaining.size > 0) {
                    let bestEdge = null;

                    for (const treeId of inTree) {
                        const a = points[treeId];

                        for (const remId of remaining) {
                            const b = points[remId];
                            const d = manhattan(a, b);

                            if (! bestEdge || d < bestEdge.d) {
                                bestEdge = { a, b, d };
                            }
                        }
                    }

                    carveCorridor(bestEdge.a, bestEdge.b);
                    inTree.add(bestEdge.b.id);
                    remaining.delete(bestEdge.b.id);
                }
            }

            const points = haltonPointsOnGridWithJitter();
            growRegions(points);
            connectSeeds(points);

            return gameMap;
        },


        partitionBasedDungeonGeneration: function(
            width = 30,
            height = 11,
            minSubsectionWidth = 9,
            minSubsectionHeight = 4,
            offsetX = 0,
            offsetY = 0
        ) {
            const wall = true;
            const floor = false;

            // Smallest room we’ll allow inside a leaf.
            // Keeping these at 3 tends to look decent (walls around rooms still possible).
            const minRoomWidth = 3;
            const minRoomHeight = 3;

            // Hard stop to prevent runaway recursion if inputs are odd.
            const maxDepth = 256;

            function randomIntInclusive(minValue, maxValue) {
                if (maxValue < minValue) {
                    throw new Error(
                        "Invalid random range",
                        { minValue, maxValue }
                    );
                    // return minValue;
                }

                const span = maxValue - minValue + 1;
                return minValue + Math.floor(Math.random() * span);
            }

            function carveCell(gameMap, x, y) {
                const mapHeight = gameMap.length;
                const mapWidth = gameMap[0].length;

                // Keep a 1-tile perimeter wall (immutable).
                const isOnPerimeter =
                    x <= 0 ||
                    y <= 0 ||
                    x >= mapWidth - 1 ||
                    y >= mapHeight - 1;

                if (isOnPerimeter) {
                    return;
                }

                gameMap[y][x] = floor;
            }

            function carveRect(gameMap, x1, y1, x2Exclusive, y2Exclusive) {
                for (let y = y1; y < y2Exclusive; y++) {
                    for (let x = x1; x < x2Exclusive; x++) {
                        carveCell(gameMap, x, y);
                    }
                }
            }

            function carveLine(gameMap, x1, y1, x2, y2) {
                // Axis-aligned inclusive line
                if (x1 === x2) {
                    const startY = Math.min(y1, y2);
                    const endY = Math.max(y1, y2);

                    for (let y = startY; y <= endY; y++) {
                        carveCell(gameMap, x1, y);
                    }

                    return;
                }

                if (y1 === y2) {
                    const startX = Math.min(x1, x2);
                    const endX = Math.max(x1, x2);

                    for (let x = startX; x <= endX; x++) {
                        carveCell(gameMap, x, y1);
                    }

                    return;
                }

                // Not expected; corridors are built as L-shapes using axis-aligned segments.
            }

            function carveCorridorL(gameMap, pointA, pointB) {
                const { x: x1, y: y1 } = pointA;
                const { x: x2, y: y2 } = pointB;

                const goHorizontalFirst = Math.random() < 0.5;

                if (goHorizontalFirst) {
                    carveLine(gameMap, x1, y1, x2, y1);
                    carveLine(gameMap, x2, y1, x2, y2);
                    return;
                }

                carveLine(gameMap, x1, y1, x1, y2);
                carveLine(gameMap, x1, y2, x2, y2);
            }

            function makeNode(x, y, w, h) {
                return {
                    x,
                    y,
                    w,
                    h,
                    left: null,
                    right: null,
                    room: null,
                };
            }

            function buildBsp(node, depth) {
                if (depth >= maxDepth) {
                    return;
                }

                const canSplitVertically = node.w >= minSubsectionWidth * 2;
                const canSplitHorizontally = node.h >= minSubsectionHeight * 2;

                if (! canSplitVertically && ! canSplitHorizontally) {
                    return;
                }

                // Choose split direction:
                // - If only one direction is possible, use it
                // - Otherwise bias toward splitting the longer dimension
                let splitVertically;
                if (canSplitVertically && ! canSplitHorizontally) {
                    splitVertically = true;
                } else if (! canSplitVertically && canSplitHorizontally) {
                    splitVertically = false;
                } else {
                    const widthIsLonger = node.w > node.h;
                    const biasRoll = Math.random() < 0.65;
                    splitVertically = widthIsLonger ? biasRoll : ! biasRoll;
                }

                if (splitVertically) {
                    const minSplitX = node.x + minSubsectionWidth;
                    const maxSplitX = node.x + node.w - minSubsectionWidth;

                    const splitX = randomIntInclusive(minSplitX, maxSplitX);

                    const leftW = splitX - node.x;
                    const rightW = node.x + node.w - splitX;

                    node.left = makeNode(node.x, node.y, leftW, node.h);
                    node.right = makeNode(splitX, node.y, rightW, node.h);
                } else {
                    const minSplitY = node.y + minSubsectionHeight;
                    const maxSplitY = node.y + node.h - minSubsectionHeight;

                    const splitY = randomIntInclusive(minSplitY, maxSplitY);

                    const topH = splitY - node.y;
                    const bottomH = node.y + node.h - splitY;

                    node.left = makeNode(node.x, node.y, node.w, topH);
                    node.right = makeNode(node.x, splitY, node.w, bottomH);
                }

                buildBsp(node.left, depth + 1);
                buildBsp(node.right, depth + 1);
            }

            function createRooms(gameMap, node) {
                console.log(gameMap.map(row => row.map(cell => (cell ? "#" : ".")).join("")).join("\n"));
                if (! node.left && ! node.right) {
                    // Leaf node: create a room if it fits with a 1-tile border.
                    const availableW = node.w - 2;
                    const availableH = node.h - 2;

                    // If the partition is too small to hold even the minimum room + border,
                    // we should not create a room here (prevents phantom rooms).
                    if (availableW < minRoomWidth || availableH < minRoomHeight) {
                        node.room = null;
                        return;
                    }

                    const roomW = randomIntInclusive(minRoomWidth, availableW);
                    const roomH = randomIntInclusive(minRoomHeight, availableH);

                    const roomXMin = node.x + 1;
                    const roomXMax = node.x + node.w - roomW - 1;
                    const roomYMin = node.y + 1;
                    const roomYMax = node.y + node.h - roomH - 1;

                    const roomX = randomIntInclusive(roomXMin, roomXMax);
                    const roomY = randomIntInclusive(roomYMin, roomYMax);

                    node.room = { x: roomX, y: roomY, w: roomW, h: roomH };

                    carveRect(gameMap, roomX, roomY, roomX + roomW, roomY + roomH);

                    return;
                }

                if (node.left) {
                    createRooms(gameMap, node.left);
                }

                if (node.right) {
                    createRooms(gameMap, node.right);
                }
            }

            function randomPointInRoom(room) {
                return {
                    x: randomIntInclusive(room.x, room.x + room.w - 1),
                    y: randomIntInclusive(room.y, room.y + room.h - 1),
                };
            }

            function getAnyRoom(node) {
                // Returns some room from this subtree (used for connecting upwards)
                if (node.room) {
                    return node.room;
                }

                const leftRoom = node.left ? getAnyRoom(node.left) : null;
                if (leftRoom) {
                    return leftRoom;
                }

                const rightRoom = node.right ? getAnyRoom(node.right) : null;
                if (rightRoom) {
                    return rightRoom;
                }

                return null;
            }

            function connectTree(gameMap, node) {
                console.log(gameMap.map(row => row.map(cell => (cell ? "#" : ".")).join("")).join("\n"));
                if (! node.left || ! node.right) {
                    return;
                }

                connectTree(gameMap, node.left);
                connectTree(gameMap, node.right);

                const leftRoom = getAnyRoom(node.left);
                const rightRoom = getAnyRoom(node.right);

                if (! leftRoom || ! rightRoom) {
                    return;
                }

                const pointA = randomPointInRoom(leftRoom);
                const pointB = randomPointInRoom(rightRoom);

                carveCorridorL(gameMap, pointA, pointB);
            }

            const gameMap = Array.from(
                { length: height },
                () => Array.from({ length: width }, () => wall)
            );

            const root = makeNode(offsetX, offsetY, width, height);
            buildBsp(root, 0);
            createRooms(gameMap, root);
            connectTree(gameMap, root);

            return gameMap;
        },
    },

    modify: {
        // Rotates a map 180 degrees
        // Partial rotations aren't provided since map dimensions are not square
        rotate: function(gameMap) {
            console.log("rotate()", { gameMap });
            return structuredClone(gameMap).map(e => e.reverse()).reverse();
        },

        flipHorizontally: function(gameMap) {
            return structuredClone(gameMap).map(e => e.reverse());
        },

        flipVertically: function(gameMap) {
            return structuredClone(gameMap).reverse();
        },

        dissolve: function(gameMap, dissolutionPercentage = 50, margin = 1) {
            const dissolvedMap = structuredClone(gameMap);

            const validDissolutionPercentage =
                typeof dissolutionPercentage === "number" &&
                ! Number.isNaN(dissolutionPercentage);

            if (! validDissolutionPercentage) {
                console.error(
                    "dissolve(): Dissolution percentage must be a valid number",
                    { dissolutionPercentage }
                );
                return dissolvedMap;
            }

            if (! Number.isInteger(margin) || margin < 0) {
                console.error(
                    "dissolve(): Margin must be a positive integer",
                    { margin }
                );
                return dissolvedMap;
            }

            let dissolvePoints = [];

            const maxY = dissolvedMap.length - margin;
            for (let y = margin; y < maxY; y++) {
                const maxX = dissolvedMap[y].length - margin;
                for (let x = margin; x < maxX; x++) {
                    // Check if the cell has only one neighboring space
                    const isDissolvePoint = dissolvedMap[y][x] && (
                        (dissolvedMap[y - 1]?.[x] ?? true ? 1 : 0) +
                        (dissolvedMap[y + 1]?.[x] ?? true ? 1 : 0) +
                        (dissolvedMap[y]?.[x - 1] ?? true ? 1 : 0) +
                        (dissolvedMap[y]?.[x + 1] ?? true ? 1 : 0)
                    ) === 3;

                    if (isDissolvePoint) {
                        dissolvePoints.push({x, y});
                    }
                }
            }

            const totalPointsToDissolve = Math.floor(
                dissolvePoints.length * (dissolutionPercentage / 100)
            );

            if (totalPointsToDissolve < 1) {
                return dissolvedMap;
            }

            // Shuffle the points
            for (let i = dissolvePoints.length - 1; i >= 1; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [dissolvePoints[i], dissolvePoints[j]] =
                    [dissolvePoints[j], dissolvePoints[i]];
            }

            for (let i = 0; i < totalPointsToDissolve; i++) {
                const { x, y } = dissolvePoints[i];
                dissolvedMap[y][x] = false;
            }

            return dissolvedMap;
        },
    },

    regions: {
        identify: function(booleanMap) {
            const isBottomRightCorner = (x, y) => (
                clonedMap[y]?.[x] === false &&
                clonedMap[y - 1]?.[x] === false &&
                clonedMap[y]?.[x + 1] === true &&
                clonedMap[y + 1]?.[x] === true &&
                clonedMap[y]?.[x - 1] === false
            );

            function getRectangleVerticalDimensions(x, y) {
                let endY = 0;

                for (let sy = y; sy >= 0; sy--) {
                    if (clonedMap[sy][x] === true) {
                        endY = sy + 1;
                        break;
                    }
                }

                let topLeftCornerX = 0;

                // For every row in the vertical span, find the rightmost wall to the left
                // of (x, sy). The rectangle must start to the right of all of them.
                for (let sy = y; sy >= endY; sy--) {
                    let rowStartX = 0;

                    for (let sx = x; sx >= 0; sx--) {
                        if (clonedMap[sy][sx] === true) {
                            rowStartX = sx + 1;
                            break;
                        }
                    }

                    if (rowStartX > topLeftCornerX) {
                        topLeftCornerX = rowStartX;
                    }
                }

                return {
                    start: { x: topLeftCornerX, y: endY },
                    end: { x, y },
                };
            }

            function getRectangleHorizontalDimensions(x, y) {
                let endX = 0;

                for (let sx = x; sx >= 0; sx--) {
                    if (clonedMap[y][sx] === true) {
                        endX = sx + 1;
                        break;
                    }
                }

                let topLeftCornerY = 0;

                // For every column in the horizontal span, find the lowest wall above
                // (sx, y). The rectangle must start below all of them.
                for (let sx = x; sx >= endX; sx--) {
                    let colStartY = 0;

                    for (let sy = y; sy >= 0; sy--) {
                        if (clonedMap[sy][sx] === true) {
                            colStartY = sy + 1;
                            break;
                        }
                    }

                    if (colStartY > topLeftCornerY) {
                        topLeftCornerY = colStartY;
                    }
                }

                return {
                    start: { x: endX, y: topLeftCornerY },
                    end: { x, y },
                };
            }

            function isAllTraversable(region) {
                for (let y = region.start.y; y <= region.end.y; y++) {
                    for (let x = region.start.x; x <= region.end.x; x++) {
                        if (clonedMap[y][x] === true) {
                            return false;
                        }
                    }
                }

                return true;
            }

            function getRectangleSize(x, y) {
                const verticalDimensions =
                    getRectangleVerticalDimensions(x, y);
                const horizontalDimensions =
                    getRectangleHorizontalDimensions(x, y);

                const verticalWidth = verticalDimensions.end.x -
                    verticalDimensions.start.x + 1;
                const verticalHeight = verticalDimensions.end.y -
                    verticalDimensions.start.y + 1;
                const horizontalWidth = horizontalDimensions.end.x -
                    horizontalDimensions.start.x + 1;
                const horizontalHeight = horizontalDimensions.end.y -
                    horizontalDimensions.start.y + 1;

                const verticalSize = verticalWidth * verticalHeight;
                const horizontalSize = horizontalWidth * horizontalHeight;

                const candidate = verticalSize > horizontalSize
                    ? { size: verticalSize, ...verticalDimensions }
                    : { size: horizontalSize, ...horizontalDimensions };

                if (! isAllTraversable(candidate)) {
                    return null;
                }

                return candidate;
            }

            function quarter(region) {
                const halfwayX = region.start.x +
                    Math.round((region.end.x - region.start.x) / 2);
                const halfwayY = region.start.y +
                    Math.round((region.end.y - region.start.y) / 2);

                const regionIsTooSmall =
                    halfwayX + 1 >= region.end.x ||
                    halfwayY + 1 >= region.end.y;

                if (regionIsTooSmall) {
                    return [];
                }

                return [
                    {
                        start: {
                            x: region.start.x,
                            y: region.start.y,
                        },
                        end: {
                            x: halfwayX,
                            y: halfwayY,
                        },
                    },
                    {
                        start: {
                            x: halfwayX + 1,
                            y: region.start.y,
                        },
                        end: {
                            x: region.end.x,
                            y: halfwayY,
                        },
                    },
                    {
                        start: {
                            x: region.start.x,
                            y: halfwayY + 1,
                        },
                        end: {
                            x: halfwayX,
                            y: region.end.y,
                        },
                    },
                    {
                        start: {
                            x: halfwayX + 1,
                            y: halfwayY + 1,
                        },
                        end: {
                            x: region.end.x,
                            y: region.end.y,
                        },
                    },
                ];
            }

            const clonedMap = structuredClone(booleanMap);
            const regions = [];
            let lastRegionLength;
            let circuitBreaker = 0;

            do {
                let currentMaxRegionSize = 0;
                let currentMaxRegion = null;

                lastRegionLength = regions.length;

                for (let y = 0; y < clonedMap.length; y++) {
                    for (let x = 0; x < clonedMap[y].length; x++) {
                        if (! isBottomRightCorner(x, y)) {
                            continue;
                        }

                        const rectangle = getRectangleSize(x, y);

                        if (rectangle === null) {
                            continue;
                        }

                        if (rectangle.size > currentMaxRegionSize) {
                            currentMaxRegionSize = rectangle.size;
                            currentMaxRegion = rectangle;
                        }
                    }
                }

                if (currentMaxRegion !== null) {
                    const region = currentMaxRegion;
                    for (let y = region.start.y; y <= region.end.y; y++) {
                        for (let x = region.start.x; x <= region.end.x; x++) {
                            clonedMap[y][x] = true;
                        }
                    }

                    regions.push(region);
                }
            } while (
                regions.length !== lastRegionLength &&
                circuitBreaker++ < 100
            );

            return regions.length === 1
                ? quarter(regions[0])
                : regions;
        }
    },
};
