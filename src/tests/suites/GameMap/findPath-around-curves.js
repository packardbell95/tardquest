// Test pathfinding around a curved wall in a 20x20 map using GameMap.findPath()
function GameMap_findPathAroundCurves()
{
    const testMap = new GameMap();

    testMap.fill(0, 0, 20, 20, "wall");
    testMap.fill(1, 1, 19, 19, "floor");
    testMap.line(2, 1, 2, 17);
    testMap.line(2, 17, 7, 17);
    testMap.line(7, 17, 7, 14);
    testMap.line(7, 14, 4, 14);

    const expectedPath = [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [1, 6],
        [1, 7],
        [1, 8],
        [1, 9],
        [1, 10],
        [1, 11],
        [1, 12],
        [1, 13],
        [1, 14],
        [1, 15],
        [1, 16],
        [1, 17],
        [1, 18],
        [2, 18],
        [3, 18],
        [4, 18],
        [5, 18],
        [6, 18],
        [7, 18],
        [8, 18],
        [8, 17],
        [8, 16],
        [8, 15],
        [8, 14],
        [8, 13],
        [7, 13],
        [6, 13],
        [5, 13],
        [4, 13],
        [3, 13],
        [3, 14],
        [3, 15],
        [4, 15],
        [5, 15],
        [6, 15],
    ];

    const actualPath = testMap.findPath([1, 1], [6, 15]);

    test(
        "Pathfinding around curves",
        () => Assert.deepEquals(
            expectedPath,
            actualPath,
            "Path spirals around the curve counter-clockwise"
        ),
        renderGameMapContext(testMap, actualPath)
    );
}
