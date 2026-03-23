"use strict";

// General map tests and checks
function GameMap_isExplored()
{
    const testMap = new GameMap(5, 5);
    testMap.conceal();

    test(
        "Concealed spaces are not explored",
        () => {
            for (let y = 0; y < testMap.height; y++) {
                for (let x = 0; x < testMap.width; x++) {
                    Assert.isFalse(
                        testMap.isExplored(x, y),
                        `Map spot (${x}, ${y}) must not be explored`
                    );
                }
            }
        },
        renderGameMapPoints(testMap)
    );

    test(
        "Spaces out of bounds are not explored",
        () => {
            Assert.isFalse(
                testMap.isExplored(-1, -1),
                "Out of bounds space must not be explored, pre-reveal"
            );

            Assert.isFalse(
                testMap.isExplored(testMap.width + 1, testMap.height + 1),
                "Out of bounds space must not be explored, pre-reveal"
            );
        },
        renderGameMapPoints(testMap)
    );

    testMap.reveal();
    test(
        "Revealed spaces are explored",
        () => {
            for (let y = 0; y < testMap.height; y++) {
                for (let x = 0; x < testMap.width; x++) {
                    Assert.isTrue(
                        testMap.isExplored(x, y),
                        `Map spot (${x}, ${y}) must be explored`
                    );
                }
            }
        },
        renderGameMapPoints(testMap)
    );

    test(
        "Spaces out of bounds are still not explored post-reveal",
        () => {
            Assert.isFalse(
                testMap.isExplored(-1, -1),
                "Out of bounds space must not be explored, post-reveal"
            );

            Assert.isFalse(
                testMap.isExplored(testMap.width + 1, testMap.height + 1),
                "Out of bounds space must not be explored, post-reveal"
            );
        },
        renderGameMapPoints(testMap)
    );

    testMap.conceal();
    const revealedCoordinates = { x: 2, y: 2 };
    testMap.revealSpot(revealedCoordinates.x, revealedCoordinates.y);
    test(
        "A single space is revealed",
        () => {
            for (let y = 0; y < testMap.height; y++) {
                for (let x = 0; x < testMap.width; x++) {
                    x === revealedCoordinates.x && y === revealedCoordinates.y
                        ? Assert.isTrue(
                            testMap.isExplored(x, y),
                            `Map spot (${x}, ${y}) must be explored`
                        )
                        : Assert.isFalse(
                            testMap.isExplored(x, y),
                            `Map spot (${x}, ${y}) must not be explored`
                        );
                }
            }
        },
        renderGameMapPoints(
            testMap,
            [{...revealedCoordinates, titleSuffix: "Revealed spot" }]
        )
    );
}
