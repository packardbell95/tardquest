// Test MapEntity basic movement
function MapEntity_movementBasic()
{
    const testMap = new GameMap(50, 40);
    testMap.fill(0, 0, testMap.width - 1, testMap.height - 1, "wall");
    testMap.fill(1, 1, testMap.width - 1, testMap.height - 1, "floor");
    testMap.line(8, 11, 16, 11);
    testMap.line(16, 11, 16, 16);

    const entity = new MapEntity(10, 12, 0);

    test(
        "Attempting to move with no target",
        () => {
            for (let attempts = 0; attempts < 2; attempts++) {
                Assert.equals(10, entity.x, "Entity X coordinate check");
                Assert.equals(12, entity.y, "Entity Y coordinate check");
                Assert.equals(0, entity.direction, "Entity direction check");
                entity.move(testMap);
            }
        },
        renderGameMapPoints(testMap, [
            {
                x: entity.x,
                y: entity.y,
                character: ["🔼", "▶️", "🔽", "◀️"][entity.direction],
                titleSuffix: "Entity",
            },
        ])
    );



    const movementPointsCasual = [];
    entity.setPosition(10, 12, 0);
    entity.setTarget(8, 10);
    let stepsTakenCasual = 0;
    do {
        stepsTakenCasual++;
        entity.move(testMap);
        movementPointsCasual.push({
            x: entity.x,
            y: entity.y,
            character: ["🔼", "▶️", "🔽", "◀️"][entity.direction],
            titleSuffix: `Step ${stepsTakenCasual}`,
        });
    } while (entity.hasTarget());

    test(
        "Moving towards a target casually",
        () => {
            const expectedResult = [
                { x: 10, y: 12, character: "◀️", titleSuffix: "Step 1" },
                { x:  9, y: 12, character: "◀️", titleSuffix: "Step 2" },
                { x:  8, y: 12, character: "◀️", titleSuffix: "Step 3" },
                { x:  7, y: 12, character: "◀️", titleSuffix: "Step 4" },
                { x:  7, y: 12, character: "🔼", titleSuffix: "Step 5" },
                { x:  7, y: 11, character: "🔼", titleSuffix: "Step 6" },
                { x:  7, y: 10, character: "🔼", titleSuffix: "Step 7" },
                { x:  7, y: 10, character: "▶️", titleSuffix: "Step 8" },
                { x:  8, y: 10, character: "▶️", titleSuffix: "Step 9" },
            ];

            Assert.deepEquals(
                expectedResult,
                movementPointsCasual,
                "Entity moves around obstacle where each turn counts as a move"
            );
        },
        renderGameMapPoints(testMap, movementPointsCasual)
    );



    const movementPointsHasty = [];
    entity.setPosition(10, 12, 0);
    entity.setTarget(8, 10, "player");
    let stepsTakenHasty = 0;
    do {
        stepsTakenHasty++;
        entity.move(testMap);
        movementPointsHasty.push({
            x: entity.x,
            y: entity.y,
            character: ["🔼", "▶️", "🔽", "◀️"][entity.direction],
            titleSuffix: `Step ${stepsTakenHasty}`,
        });
    } while (entity.hasTarget());

    test(
        "Moving towards a target hastily",
        () => {
            const expectedResult = [
                { x:  9, y: 12, character: "◀️", titleSuffix: "Step 1" },
                { x:  8, y: 12, character: "◀️", titleSuffix: "Step 2" },
                { x:  7, y: 12, character: "◀️", titleSuffix: "Step 3" },
                { x:  7, y: 11, character: "🔼", titleSuffix: "Step 4" },
                { x:  7, y: 10, character: "🔼", titleSuffix: "Step 5" },
                { x:  8, y: 10, character: "▶️", titleSuffix: "Step 6" },
            ];

            Assert.deepEquals(
                expectedResult,
                movementPointsHasty,
                "Entity moves around obstacle where turns do not count as moves"
            );
        },
        renderGameMapPoints(testMap, movementPointsHasty)
    );



    const movementPointsTowardsPlayer = [];
    const playerEntity = new MapEntity(6, 11, 0);
    playerEntity.id = "player";
    const entities = {
        player: playerEntity,
    };
    movementPointsTowardsPlayer.push({
        x: entities.player.x,
        y: entities.player.y,
        character: "🏃‍♂️",
        titleSuffix: "Player Start",
    });
    testMap.setEntities(entities);
    entity.setPosition(10, 12, 3);
    let stepsTakenTowardsPlayer = 0;

    do {
        stepsTakenTowardsPlayer++;

        entity.move(testMap);
        movementPointsTowardsPlayer.push({
            x: entity.x,
            y: entity.y,
            character: ["🔼", "▶️", "🔽", "◀️"][entity.direction],
            titleSuffix: `Step ${stepsTakenTowardsPlayer}`,
        });

        // After two steps, teleport the player that the entity will see later
        // The entity's target will automatically be set to the player once seen
        if (stepsTakenTowardsPlayer === 2) {
            entities.player.x = 8;
            entities.player.y = 7;

            movementPointsTowardsPlayer.push({
                x: entities.player.x,
                y: entities.player.y,
                character: "🏃‍♂️",
                titleSuffix: "Player Teleported",
            });
        }
    } while (entities.player.x !== entity.x || entities.player.y !== entity.y);

    movementPointsTowardsPlayer.push({
        x: entity.x,
        y: entity.y,
        character: "🏁",
        titleSuffix: "End of Run",
    });

    test(
        "Observing and moving towards the player",
        () => {
            const expectedResult = [
                {x: 6, y: 11, character: "🏃‍♂️", titleSuffix: "Player Start"},
                {x: 9, y: 12, character: "◀️", titleSuffix: "Step 1"},
                {x: 8, y: 12, character: "◀️", titleSuffix: "Step 2"},
                {x: 8, y: 7, character: "🏃‍♂️", titleSuffix: "Player Teleported"},
                {x: 7, y: 12, character: "◀️", titleSuffix: "Step 3"},
                {x: 6, y: 12, character: "◀️", titleSuffix: "Step 4"},
                {x: 6, y: 11, character: "🔼", titleSuffix: "Step 5"},
                {x: 7, y: 11, character: "▶️", titleSuffix: "Step 6"},
                {x: 7, y: 10, character: "🔼", titleSuffix: "Step 7"},
                {x: 8, y: 10, character: "▶️", titleSuffix: "Step 8"},
                {x: 8, y: 9, character: "🔼", titleSuffix: "Step 9"},
                {x: 8, y: 8, character: "🔼", titleSuffix: "Step 10"},
                {x: 8, y: 7, character: "🔼", titleSuffix: "Step 11"},
                {x: 8, y: 7, character: "🏁", titleSuffix: "End of Run"},
            ];

            Assert.deepEquals(
                expectedResult,
                movementPointsTowardsPlayer,
                "Entity moves around obstacle where turns do not count as moves"
            );
        },
        renderGameMapPoints(testMap, movementPointsTowardsPlayer)
    );
}
