"use strict";

// Performs a flood fill on a boolean map
function booleanMapFloodFill(gameMap, x = 0, y = 0) {
    if (! Array.isArray(gameMap) || gameMap.length === 0) {
        console.error("Map must be a populated array", { gameMap });
        return [];
    }

    const clonedMap = gameMap.map(row => row.slice());
    const height = clonedMap.length;
    const width = clonedMap[0].length;
    const coordinateInBounds = x >= 0 && x < width && y >= 0 && y < height;
    if (! coordinateInBounds) {
        console.warn(
            "(X, Y) coordinate is not within the game map's boundaries",
            { clonedMap, width, height, x, y }
        );
        return clonedMap;
    }

    const originalValue = clonedMap[y][x];
    const newValue = ! originalValue;
    const stack = [];
    stack.push([ x, y ]);

    while (stack.length > 0) {
        const [ currentX, currentY ] = stack.pop();
        const inBounds =
            currentX >= 0 && currentX < width &&
            currentY >= 0 && currentY < height;

        if (! inBounds) {
            continue;
        }

        if (clonedMap[currentY][currentX] !== originalValue) {
            continue;
        }

        clonedMap[currentY][currentX] = newValue;

        if (currentX > 0) {
            stack.push([currentX - 1, currentY]);
        }

        if (currentX < width - 1) {
            stack.push([currentX + 1, currentY]);
        }

        if (currentY > 0) {
            stack.push([currentX, currentY - 1]);
        }

        if (currentY < height - 1) {
            stack.push([currentX, currentY + 1]);
        }
    }

    return clonedMap;
}
