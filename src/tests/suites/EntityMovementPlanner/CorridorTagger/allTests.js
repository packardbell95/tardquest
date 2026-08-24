// Tests the Corridor Tagger
function GameMap_CorridorTagger_allTests()
{
    const corridorTagger = new CorridorTagger();

    const testMap = new GameMap(12, 8);
    testMap.fill(1, 1, testMap.width - 1, testMap.height - 1, "floor");
    testMap.line(2, 1, 2, 3, { cellType: "wall" });
    testMap.line(3, 3, 8, 3, { cellType: "wall" });
    testMap.line(3, 4, 3, 5, { cellType: "wall" });
    testMap.line(5, 4, 5, 5, { cellType: "wall" });
    testMap.line(6, 5, 9, 5, { cellType: "wall" });
    testMap.setCell(4, 2, "wall");
    testMap.setCell(9, 1, "wall");
    testMap.setCell(10, 3, "wall");

    const corridorList = corridorTagger.tagCorridors(testMap.cells);

    test(
        "Identifying Corridors",
        () => {
            Assert.deepEquals(
                {
                    a: [
                        { x: 1, y: 1 },
                        { x: 1, y: 2 },
                        { x: 1, y: 3 }
                    ],
                    b: [
                        { x: 3, y: 1 },
                        { x: 3, y: 2 },
                        { x: 4, y: 1 }
                    ],
                    c: [
                        { x: 10, y: 1 },
                        { x: 10, y: 2 }
                    ],
                    d: [
                        { x: 4, y: 4 },
                        { x: 4, y: 5 }
                    ],
                    e: [
                        { x: 6, y: 4 },
                        { x: 7, y: 4 },
                        { x: 8, y: 4 }
                    ],
                    f: [
                        { x: 10, y: 4 },
                        { x: 10, y: 5 },
                        { x: 10, y: 6 },
                        { x: 9, y: 6 },
                        { x: 8, y: 6 },
                        { x: 7, y: 6 },
                        { x: 6, y: 6 },
                        { x: 5, y: 6 }
                    ]
                },
                corridorList
            );
        },
        renderMovementContext(testMap, [], [], corridorList)
    );
}
