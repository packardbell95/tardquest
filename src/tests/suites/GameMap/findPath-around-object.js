// Test pathfinding around a distant obstacle using GameMap.findPath()
function GameMap_findPathAroundObject()
{
    const testMap = new GameMap();

    testMap.fill(0, 0, 80, 60, "wall");
    testMap.fill(1, 1, 79, 59, "floor");
    testMap.line(50, 30, 50, 3);
    testMap.line(50, 30, 50, 56);
    testMap.line(50, 30, 60, 20);
    testMap.line(50, 30, 60, 40);

    const path = testMap.findPath([1, 30], [52, 30]);

    test(
        "Pathfinding around a distant object",
        () => {
            Assert.notNull(path, "Path is not null");
            Assert.equals(124, path.length, "The optimal path takes 124 steps");
        },
        renderGameMapContext(testMap, path)
    );
}
