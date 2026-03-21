"use strict";

// Tests a movement case that was bugged when pathfinding with an entity
function GameMap_movementCheck()
{
    const gameMap = new GameMap(31, 8);
    gameMap.fill(0, 0, gameMap.width, gameMap.height, "wall");
    gameMap.fill(1, 1, gameMap.width - 1, gameMap.height - 1, "floor");
    gameMap.line(10, 1, 10, 5, "wall");
    gameMap.line(20, 2, 20, 6, "wall");

    const shortPath = gameMap.findPath([19, 5], [28, 5]);
    test(
        "Pathfinding through a part of a map (short)",
        () => {
            Assert.notNull(shortPath, "Path is not null");

            const optimalPathLength = 18;
            Assert.equals(
                optimalPathLength,
                shortPath.length,
                `The optimal short path takes ${optimalPathLength} steps`
            );
        },
        renderGameMapContext(gameMap, shortPath)
    );

    const longPath = gameMap.findPath([2, 1], [28, 5]);
    test(
        "Pathfinding through a part of a map (long)",
        () => {
            Assert.notNull(longPath, "Path is not null");

            const optimalPathLength = 41;
            Assert.equals(
                optimalPathLength,
                longPath.length,
                `The optimal long path takes ${optimalPathLength} steps`
            );
        },
        renderGameMapContext(gameMap, longPath)
    );
}
