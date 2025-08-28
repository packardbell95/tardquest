// Test pathfinding diagonally through an open space using GameMap.findPath()
function GameMap_findPathOutInTheOpen()
{
    const testMap = new GameMap();

    testMap.fill(0, 0, 20, 20, "wall");
    testMap.fill(1, 1, 19, 19, "floor");

    const start = [1, 1];
    const end = [18, 18];
    const path = testMap.findPath(start, end);

    // GameMap.findPath() includes the starting point, so take that into account
    const manhattanDistanceIncludingStartingPoint = 1 +
        Math.abs(end[0] - start[0]) +
        Math.abs(end[1] - start[1]);

    // Check if the path always moves towards the bottom right corner
    const passed =
        Array.isArray(path) && ((p) =>
            p.every(([x,y],i) => !i||
                x === p[i-1][0] + 1 && y == p[i-1][1] ||
                y === p[i-1][1] + 1 && x == p[i-1][0]
            ))(path);

    test(
        "Pathfinding out in the open",
        () => {
            Assert.notNull(path, "Path is not null");
            Assert.isTrue(passed, "Path always moves towards the lower right");
            Assert.equals(
                manhattanDistanceIncludingStartingPoint,
                path.length,
                "Path matches the expected Manhattan distance"
            );
        },
        renderGameMapContext(testMap, path)
    );
}
