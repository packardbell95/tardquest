// Test pathfinding around a spiral in a 40x40 map using GameMap.findPath()
function GameMap_findPathAroundSpiral()
{
    const testMap = new GameMap();
    const mapSize = 40;

    testMap.fill(0, 0, mapSize, mapSize, "wall");
    testMap.fill(1, 1, mapSize-1, mapSize-1, "floor");

    // Generate the spiral
    for (let i = 0; i < 10; i++) {
        testMap.line(
            i * 2 + 2,
            i * 2,
            i * 2 + 2,
            mapSize - i * 2 - 3
        );

        if (i * 2 + 2 > mapSize / 2 || mapSize - i * 2 - 3 < mapSize / 2) {
            break;
        }

        testMap.line(
            i * 2 + 2,
            mapSize - i * 2 - 3,
            mapSize - i * 2 - 3,
            mapSize - i * 2 - 3
        );

        testMap.line(
            mapSize - i * 2 - 3,
            mapSize - i * 2 - 3,
            mapSize - i * 2 - 3,
            i * 2 + 2
        );

        testMap.line(
            mapSize - i * 2 - 3,
            i * 2 + 2,
            i * 2 + 5,
            i * 2 + 2
        );
    }

    // Find the path from the top left corner to the center
    const actualPath = testMap.findPath([1, 1], [20, 20]);


    function fillPoints(points, startCoords, endCoords, index, increment) {
        let i = 0;

        while (startCoords[index] + (increment * i) !== endCoords[index]) {
            const coordinate = startCoords[index] + (increment * i);

            points.push(index === 0
                ? [coordinate, startCoords[1]]
                : [startCoords[0], coordinate]
            );

            i++;
        }
    }

    const expectedPath = [];

    for (let i = 1; i < 20; i += 2) {
        fillPoints(
            expectedPath,
            [i, Math.max(i - 2, 1)],
            [i, 40 - 1 - i],
            1,
            1
        );

        fillPoints(
            expectedPath,
            [i, 40 - 1 - i],
            [40 - 1 - i, 40 - 1 - i],
            0,
            1
        );

        fillPoints(
            expectedPath,
            [40 - 1 - i, 40 - 1 - i],
            [40 - 1 - i, i],
            1,
            -1
        );

        if (i >= 19) {
            break;
        }

        fillPoints(
            expectedPath,
            [40 - 1 - i, i],
            [i + 2, i + 2],
            0,
            -1
        );
    }

    test(
        "Pathfinding around a spiral",
        () => {
            Assert.notNull(expectedPath, "Path is not null");
            Assert.deepEquals(
                expectedPath,
                actualPath,
                "Comparing sets of expected points needed to traverse " +
                    "through the spiral with the actual points that were walked"
            );
        },
        renderGameMapContext(testMap, actualPath)
    );
}
