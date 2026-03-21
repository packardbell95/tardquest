// Tests for the engine's map generator
// @TODO Add stress tests for these generators since they test only one
//       generation each
function EngineMap_MapGeneratorTest()
{
    function countBooleanOccurrences(gameMap) {
        let totalTrue = 0, totalFalse = 0;

        for (let y = 0; y < gameMap.length; y++) {
            for (let x = 0; x < gameMap[y].length; x++) {
                gameMap[y][x] ? totalTrue++ : totalFalse++;
            }
        }

        return { totalTrue, totalFalse };
    }

    function findFirstFloorCell(gameMap) {
        for (let y = 0; y < gameMap.length; y++) {
            for (let x = 0; x < gameMap[y].length; x++) {
                if (gameMap[y][x] === false) {
                    return { x, y };
                }
            }
        }

        return null;
    }

    const agentBasedDungeonGrownMap =
        MapGenerator.generate.agentBasedDungeonGrowing();

    test(
        "Agent-Based Dungeon Growing",
        () => {
            const cellCounts =
                countBooleanOccurrences(agentBasedDungeonGrownMap);
            const totalCells = cellCounts.totalTrue + cellCounts.totalFalse;
            Assert.greaterThan(
                0,
                totalCells,
                "The game map must have cells"
            );
            Assert.greaterThan(
                0,
                cellCounts.totalTrue,
                "The game map has walls"
            );
            Assert.lessThan(
                totalCells,
                cellCounts.totalTrue,
                "The game map is not entirely made of walls"
            );
            Assert.greaterThan(
                0,
                cellCounts.totalFalse,
                "The game map has floors"
            );
            Assert.lessThan(
                totalCells,
                cellCounts.totalFalse,
                "The game map is not entirely made of floors"
            );

            const floorCoordinate =
                findFirstFloorCell(agentBasedDungeonGrownMap);
            Assert.notNull(floorCoordinate, "Game map has a floor");

            const filledGameMap = booleanMapFloodFill(
                agentBasedDungeonGrownMap,
                floorCoordinate.x,
                floorCoordinate.y
            );
            const filledGameMapCellCounts =
                countBooleanOccurrences(filledGameMap);
            const totalFilledGameMapCells =
                filledGameMapCellCounts.totalTrue +
                filledGameMapCellCounts.totalFalse;
            Assert.greaterThan(
                0,
                totalFilledGameMapCells,
                "The filled game map must have cells"
            );
            Assert.equals(
                totalCells,
                totalFilledGameMapCells,
                "The filled game map is the same size as the actual map"
            );
            Assert.equals(
                totalCells,
                filledGameMapCellCounts.totalTrue,
                "The game map has no unwalkable areas"
            );
            Assert.equals(
                0,
                filledGameMapCellCounts.totalFalse,
                "The filled map has no unexpected floors"
            );
        },
        renderBooleanMap(agentBasedDungeonGrownMap),
    );


    const agentBasedDungeonGrownMapWithoutIntersectingRooms = MapGenerator
        .generate.agentBasedDungeonGrowingWithoutIntersectingRooms();

    test(
        "Agent-Based Dungeon Growing Without Intersecting Rooms",
        () => {
            const cellCounts = countBooleanOccurrences(
                agentBasedDungeonGrownMapWithoutIntersectingRooms
            );
            const totalCells = cellCounts.totalTrue + cellCounts.totalFalse;
            Assert.greaterThan(
                0,
                totalCells,
                "The game map must have cells"
            );
            Assert.greaterThan(
                0,
                cellCounts.totalTrue,
                "The game map has walls"
            );
            Assert.lessThan(
                totalCells,
                cellCounts.totalTrue,
                "The game map is not entirely made of walls"
            );
            Assert.greaterThan(
                0,
                cellCounts.totalFalse,
                "The game map has floors"
            );
            Assert.lessThan(
                totalCells,
                cellCounts.totalFalse,
                "The game map is not entirely made of floors"
            );

            const floorCoordinate = findFirstFloorCell(
                agentBasedDungeonGrownMapWithoutIntersectingRooms
            );
            Assert.notNull(floorCoordinate, "Game map has a floor");

            const filledGameMap = booleanMapFloodFill(
                agentBasedDungeonGrownMapWithoutIntersectingRooms,
                floorCoordinate.x,
                floorCoordinate.y
            );
            const filledGameMapCellCounts =
                countBooleanOccurrences(filledGameMap);
            const totalFilledGameMapCells =
                filledGameMapCellCounts.totalTrue +
                filledGameMapCellCounts.totalFalse;
            Assert.greaterThan(
                0,
                totalFilledGameMapCells,
                "The filled game map must have cells"
            );
            Assert.equals(
                totalCells,
                totalFilledGameMapCells,
                "The filled game map is the same size as the actual map"
            );
            Assert.equals(
                totalCells,
                filledGameMapCellCounts.totalTrue,
                "The game map has no unwalkable areas"
            );
            Assert.equals(
                0,
                filledGameMapCellCounts.totalFalse,
                "The filled map has no unexpected floors"
            );
        },
        renderBooleanMap(agentBasedDungeonGrownMapWithoutIntersectingRooms),
    );


    const spatialExpansionDungeonGrowing =
        MapGenerator.generate.spatialExpansionDungeonGrowing();

    test(
        "Spatial Expansion Dungeon Growing",
        () => {
            const cellCounts = countBooleanOccurrences(
                spatialExpansionDungeonGrowing
            );
            const totalCells = cellCounts.totalTrue + cellCounts.totalFalse;
            Assert.greaterThan(
                0,
                totalCells,
                "The game map must have cells"
            );
            Assert.greaterThan(
                0,
                cellCounts.totalTrue,
                "The game map has walls"
            );
            Assert.lessThan(
                totalCells,
                cellCounts.totalTrue,
                "The game map is not entirely made of walls"
            );
            Assert.greaterThan(
                0,
                cellCounts.totalFalse,
                "The game map has floors"
            );
            Assert.lessThan(
                totalCells,
                cellCounts.totalFalse,
                "The game map is not entirely made of floors"
            );

            const floorCoordinate = findFirstFloorCell(
                spatialExpansionDungeonGrowing
            );
            Assert.notNull(floorCoordinate, "Game map has a floor");

            const filledGameMap = booleanMapFloodFill(
                spatialExpansionDungeonGrowing,
                floorCoordinate.x,
                floorCoordinate.y
            );
            const filledGameMapCellCounts =
                countBooleanOccurrences(filledGameMap);
            const totalFilledGameMapCells =
                filledGameMapCellCounts.totalTrue +
                filledGameMapCellCounts.totalFalse;
            Assert.greaterThan(
                0,
                totalFilledGameMapCells,
                "The filled game map must have cells"
            );
            Assert.equals(
                totalCells,
                totalFilledGameMapCells,
                "The filled game map is the same size as the actual map"
            );
            Assert.equals(
                totalCells,
                filledGameMapCellCounts.totalTrue,
                "The game map has no unwalkable areas"
            );
            Assert.equals(
                0,
                filledGameMapCellCounts.totalFalse,
                "The filled map has no unexpected floors"
            );
        },
        renderBooleanMap(spatialExpansionDungeonGrowing),
    );


    const partitionBasedDungeonGeneration =
        MapGenerator.generate.partitionBasedDungeonGeneration();

    test(
        "Partition-Based Dungeon Growing",
        () => {
            const cellCounts = countBooleanOccurrences(
                partitionBasedDungeonGeneration
            );
            const totalCells = cellCounts.totalTrue + cellCounts.totalFalse;
            Assert.greaterThan(
                0,
                totalCells,
                "The game map must have cells"
            );
            Assert.greaterThan(
                0,
                cellCounts.totalTrue,
                "The game map has walls"
            );
            Assert.lessThan(
                totalCells,
                cellCounts.totalTrue,
                "The game map is not entirely made of walls"
            );
            Assert.greaterThan(
                0,
                cellCounts.totalFalse,
                "The game map has floors"
            );
            Assert.lessThan(
                totalCells,
                cellCounts.totalFalse,
                "The game map is not entirely made of floors"
            );

            const floorCoordinate = findFirstFloorCell(
                partitionBasedDungeonGeneration
            );
            Assert.notNull(floorCoordinate, "Game map has a floor");

            const filledGameMap = booleanMapFloodFill(
                partitionBasedDungeonGeneration,
                floorCoordinate.x,
                floorCoordinate.y
            );
            const filledGameMapCellCounts =
                countBooleanOccurrences(filledGameMap);
            const totalFilledGameMapCells =
                filledGameMapCellCounts.totalTrue +
                filledGameMapCellCounts.totalFalse;
            Assert.greaterThan(
                0,
                totalFilledGameMapCells,
                "The filled game map must have cells"
            );
            Assert.equals(
                totalCells,
                totalFilledGameMapCells,
                "The filled game map is the same size as the actual map"
            );
            Assert.equals(
                totalCells,
                filledGameMapCellCounts.totalTrue,
                "The game map has no unwalkable areas"
            );
            Assert.equals(
                0,
                filledGameMapCellCounts.totalFalse,
                "The filled map has no unexpected floors"
            );
        },
        renderBooleanMap(partitionBasedDungeonGeneration)
    );


    const unrotatedMap = (
        "#...#..###..#\n" +
        "#...#.#...#.#\n" +
        ".#.#..#...#.#\n" +
        "..#...#...#..\n" +
        "..#....###..#"
    ).split("\n").map(e => e.split("").map(e => e === "#"));

    const rotatedMap = MapGenerator.modify.rotate(unrotatedMap);

    test(
        "Modifier: Rotate",
        () => {
            const expectedResult = (
                "#..###....#..\n" +
                "..#...#...#..\n" +
                "#.#...#..#.#.\n" +
                "#.#...#.#...#\n" +
                "#..###..#...#"
            ).split("\n").map(e => e.split("").map(e => e === "#"));

            Assert.deepEquals(
                expectedResult,
                rotatedMap,
                "Game map must be rotated 180 degrees"
            );
        },
        renderBooleanMap(rotatedMap),
    );


    const unflippedHorizontallyMap = (
        "#...#..###..#\n" +
        "#...#.#...#.#\n" +
        ".#.#..#...#.#\n" +
        "..#...#...#..\n" +
        "..#....###..#"
    ).split("\n").map(e => e.split("").map(e => e === "#"));

    const horizontallyFlippedMap =
        MapGenerator.modify.flipHorizontally(unflippedHorizontallyMap);

    test(
        "Modifier: Flip Horizontally",
        () => {
            const expectedResult = (
                "#..###..#...#\n" +
                "#.#...#.#...#\n" +
                "#.#...#..#.#.\n" +
                "..#...#...#..\n" +
                "#..###....#.."
            ).split("\n").map(e => e.split("").map(e => e === "#"));

            Assert.deepEquals(
                expectedResult,
                horizontallyFlippedMap,
                "Game map must be flipped horizontally"
            );
        },
        renderBooleanMap(horizontallyFlippedMap),
    );


    const unflippedVerticallyMap = (
        "#...#..###..#\n" +
        "#...#.#...#.#\n" +
        ".#.#..#...#.#\n" +
        "..#...#...#..\n" +
        "..#....###..#"
    ).split("\n").map(e => e.split("").map(e => e === "#"));

    const verticallyFlippedMap =
        MapGenerator.modify.flipVertically(unflippedVerticallyMap);

    test(
        "Modifier: Flip Vertically",
        () => {
            const expectedResult = (
                "..#....###..#\n" +
                "..#...#...#..\n" +
                ".#.#..#...#.#\n" +
                "#...#.#...#.#\n" +
                "#...#..###..#"
            ).split("\n").map(e => e.split("").map(e => e === "#"));

            Assert.deepEquals(
                expectedResult,
                verticallyFlippedMap,
                "Game map must be flipped vertically"
            );
        },
        renderBooleanMap(verticallyFlippedMap),
    );


    const undissolvedMap = (
        "#################\n" + 
        "#...#...#...#..##\n" + 
        "#.#.#.####.##.#.#\n" + 
        "#.#.#.####.##.#.#\n" + 
        "#...#.####.##.#.#\n" + 
        "#.#.#.####.##.#.#\n" + 
        "#.#.#...#...#..##\n" + 
        "#################"
    ).split("\n").map(e => e.split("").map(e => e === "#"));

    const mapAfterInvalidDissolve =
        MapGenerator.modify.dissolve(undissolvedMap, 0);

    test(
        "Modifier: Dissolve, Invalid Dissolution Percentage",
        () => {
            const expectedResult = (
                "#################\n" + 
                "#...#...#...#..##\n" + 
                "#.#.#.####.##.#.#\n" + 
                "#.#.#.####.##.#.#\n" + 
                "#...#.####.##.#.#\n" + 
                "#.#.#.####.##.#.#\n" + 
                "#.#.#...#...#..##\n" + 
                "#################"
            ).split("\n").map(e => e.split("").map(e => e === "#"));

            Assert.deepEquals(
                expectedResult,
                mapAfterInvalidDissolve,
                "Game map is not dissolved when requesting invalid dissolution"
            );
        },
        renderBooleanMap(mapAfterInvalidDissolve),
    );


    const dissolvedMap = MapGenerator.modify.dissolve(undissolvedMap, 100);

    test(
        "Modifier: Dissolve",
        () => {
            const expectedResult = (
                "#################\n" +
                "#...#...#...#..##\n" +
                "#.#.#.#.##.#..#.#\n" +
                "#.#.#..##.....#.#\n" +
                "#...#..##.....#.#\n" +
                "#.#.#.#.##.#..#.#\n" +
                "#.#.#...#...#..##\n" +
                "#################"
            ).split("\n").map(e => e.split("").map(e => e === "#"));

            Assert.deepEquals(
                expectedResult,
                dissolvedMap,
                "Game map is dissolved"
            );
        },
        renderBooleanMap(dissolvedMap),
    );


    const dissolvedMapInvalidMargin =
        MapGenerator.modify.dissolve(undissolvedMap, 100, -1);

    test(
        "Modifier: Dissolve Not Performed with Invalid Margin",
        () => {
            const expectedResult = (
                "#################\n" + 
                "#...#...#...#..##\n" + 
                "#.#.#.####.##.#.#\n" + 
                "#.#.#.####.##.#.#\n" + 
                "#...#.####.##.#.#\n" + 
                "#.#.#.####.##.#.#\n" + 
                "#.#.#...#...#..##\n" + 
                "#################"
            ).split("\n").map(e => e.split("").map(e => e === "#"));

            Assert.deepEquals(
                expectedResult,
                dissolvedMapInvalidMargin,
                "Game map is not dissolved when an invalid margin is provided"
            );
        },
        renderBooleanMap(dissolvedMapInvalidMargin),
    );


    const dissolvedMapNoMargin =
        MapGenerator.modify.dissolve(undissolvedMap, 100, 0);

    test(
        "Modifier: Dissolve Without Margin",
        () => {
            const expectedResult = (
                "#...#...#...#..##\n" +
                "....#...#...#..##\n" +
                "..#.#.#.##.#..#..\n" +
                "..#.#..##.....#..\n" +
                "....#..##.....#..\n" +
                "..#.#.#.##.#..#..\n" +
                "..#.#...#...#..##\n" +
                "#.#.#...#...#..##"
            ).split("\n").map(e => e.split("").map(e => e === "#"));

            Assert.deepEquals(
                expectedResult,
                dissolvedMapNoMargin,
                "Game map is dissolved up to the edges of the map"
            );
        },
        renderBooleanMap(dissolvedMapNoMargin),
    );


    const complexMap = (
        "##############################\n" +
        "##############################\n" +
        "##              ##############\n" +
        "##              ##############\n" +
        "##              ##############\n" +
        "##          #       ##########\n" +
        "##                  ##########\n" +
        "##                  ##########\n" +
        "##                  ##########\n" +
        "##                  ##########\n" +
        "##############################\n" +
        "##############################\n" +
        "##########       ######      #\n" +
        "##                           #\n" +
        "##      ##       ######      #\n" +
        "##      ##       ######      #\n" +
        "##               #####       #\n" +
        "##      ##       ######     ##\n" +
        "##########       ######     ##\n" +
        "############## ###############\n" +
        "##############################\n" +
        "##########       ###      ####\n" +
        "#### ######       #      #####\n" +
        "###     ####             #####\n" +
        "##       ###            ######\n" +
        "#        ####       ## #######\n" +
        "##        ####      ##########\n" +
        "####                ##########\n" +
        "#####    ######      #########\n" +
        "####      ######     #########\n" +
        "##############################\n" +
        "#      #####       ###       #\n" +
        "#      #####                 #\n" +
        "#                  ###       #\n" +
        "#      #####       ###       #\n" +
        "#      ###############       #\n" +
        "##### ########################\n" +
        "##### ########################\n" +
        "#           ###########   ####\n" +
        "#                         ####\n" +
        "##############################"
    ).split("\n").map(e => e.split("").map(e => e === "#"));

    const mapRegions = MapGenerator.regions.identify(complexMap);
    const $context = document.createElement("pre");
    $context.textContent = JSON.stringify(mapRegions, null, 4);

    test(
        "Regions: Identify Rectangular Map Regions",
        () => {
            const expectedResult = [
                {
                    size: 72,
                    start: { x: 2, y: 6 },
                    end: { x: 19, y: 9 }
                },
                {
                    size: 49,
                    start: { x: 10, y: 12 },
                    end: { x: 16, y: 18 }
                },
                {
                    size: 40,
                    start: { x: 2, y: 2 },
                    end: { x: 11, y: 5 }
                },
                {
                    size: 35,
                    start: { x: 23, y: 12 },
                    end: { x: 27, y: 18 }
                },
                {
                    size: 35,
                    start: { x: 22, y: 31 },
                    end: { x: 28, y: 35 }
                },
                {
                    size: 30,
                    start: { x: 2, y: 13 },
                    end: { x: 7, y: 17 }
                },
                {
                    size: 30,
                    start: { x: 1, y: 31 },
                    end: { x: 6, y: 35 }
                },
                {
                    size: 28,
                    start: { x: 12, y: 31 },
                    end: { x: 18, y: 34 }
                },
                {
                    size: 25,
                    start: { x: 1, y: 39 },
                    end: { x: 25, y: 39 }
                },
                {
                    size: 24,
                    start: { x: 12, y: 23 },
                    end: { x: 23, y: 24 }
                },
                {
                    size: 10,
                    start: { x: 16, y: 28 },
                    end: { x: 20, y: 29 }
                },
                {
                    size: 18,
                    start: { x: 14, y: 25 },
                    end: { x: 19, y: 27 }
                }
            ];

            Assert.deepEquals(
                expectedResult,
                mapRegions,
                "Game map regions have been identified"
            );
        },
        $context,
    );


    const squareMap = (
        "##############################\n" +
        "#                            #\n" +
        "#                            #\n" +
        "#                            #\n" +
        "#                            #\n" +
        "#                            #\n" +
        "#                            #\n" +
        "#                            #\n" +
        "#                            #\n" +
        "#                            #\n" +
        "##############################"
    ).split("\n").map(e => e.split("").map(e => e === "#"));

    const squareMapRegions = MapGenerator.regions.identify(squareMap);
    const $squareMapContext = document.createElement("pre");
    $squareMapContext.textContent = JSON.stringify(squareMapRegions, null, 4);

    test(
        "Regions: Single Region Gets Quartered",
        () => {
            const expectedResult = [
                {
                    start: { x: 1, y: 1 },
                    end: { x: 15, y: 5 }
                },
                {
                    start: { x: 16, y: 1 },
                    end: { x: 28, y: 5 }
                },
                {
                    start: { x: 1, y: 6 },
                    end: { x: 15, y: 9 }
                },
                {
                    start: { x: 16, y: 6 },
                    end: { x: 28, y: 9 }
                }
            ];

            Assert.deepEquals(
                expectedResult,
                squareMapRegions,
                "Single region gets quartered"
            );
        },
        $squareMapContext,
    );


    const tooSmallSquareMap =
        "###\n# #\n###".split("\n").map(e => e.split("").map(e => e === "#"));
    const tooSmallSquareMapRegions =
        MapGenerator.regions.identify(tooSmallSquareMap);
    const $tooSmallSquareMapContext = document.createElement("pre");
    $tooSmallSquareMapContext.textContent =
        JSON.stringify(tooSmallSquareMapRegions, null, 4);

    test(
        "Regions: Single Region That's Too Small Returns No Regions",
        () => {
            const expectedResult = [];

            Assert.deepEquals(
                expectedResult,
                tooSmallSquareMapRegions,
                "A single region that's too small returns no regions"
            );
        },
        $tooSmallSquareMapContext,
    );
}
