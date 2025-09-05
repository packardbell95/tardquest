// Tests for GameMap.findNextStep()
function GameMap_findNextStep()
{
    const testMap = new GameMap();
    testMap.fill(0, 0, 10, 10, "wall");
    testMap.fill(1, 1, 9, 9, "floor");

    test(
        "Find next steps towards a goal",
        () => {
            Assert.deepEquals(
                [5, 4],
                testMap.findNextStep([5, 5], [5, 1]),
                "Moving north"
            );

            Assert.deepEquals(
                [5, 6],
                testMap.findNextStep([5, 5], [5, 8]),
                "Moving south"
            );

            Assert.deepEquals(
                [6, 5],
                testMap.findNextStep([5, 5], [8, 5]),
                "Moving east"
            );

            Assert.deepEquals(
                [4, 5],
                testMap.findNextStep([5, 5], [1, 5]),
                "Moving west"
            );

            Assert.isNull(
                testMap.findNextStep([5, 5], [0, 0]),
                "Destination is unreachable because it is a wall"
            );

            Assert.isNull(
                testMap.findNextStep([5, 5], [5, 5]),
                "Start and goal are the same, so there is no move to make"
            );
        },
    );
}
