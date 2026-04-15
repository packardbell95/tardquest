"use strict";

// Testing realtime movement behavior
function EntityMovementPlanner_realtimeMovementTest()
{
    const gameMap = new GameMap(31, 16);
    gameMap.fill(0, 0, gameMap.width, gameMap.height, "wall");
    gameMap.fill(1, 1, gameMap.width - 1, gameMap.height - 1, "floor");
    gameMap.line(10, 1, 29, 14, "wall");

    const bouldingBallSettings = [
        { x: 5, y: 5, direction: 0 },
        { x: 6, y: 6, direction: 2 },
        { x: 7, y: 5, direction: 0, isHasty: true },
        { x: 8, y: 6, direction: 2 },
        { x: 9, y: 5, direction: 0 },
        { x: 25, y: 6, direction: 1 },
        { x: 24, y: 6, direction: 3 },
        { x: 20, y: 2, direction: 1 },
        { x: 19, y: 2, direction: 3 },
    ];

    let entityId = 1;

    // Create boulding balls
    for (let i = 0; i < bouldingBallSettings.length; i++) {
        const settings = bouldingBallSettings[i];

        const bouldingBall = MapEntityBuilder(
            "bouldingBall",
            settings.x,
            settings.y,
            settings.direction
        );

        bouldingBall.testId = entityId++;
        MapEntityTrait_AttachRealtimeMovement_BackAndForth(bouldingBall);
        bouldingBall.onTouch = function(gameMap, entity) {
            if (entity.type === "bouldingBall") {
                this.turnAround();
                entity.turnAround();
            }
        };

        if (settings.isHasty) {
            bouldingBall.isHastyMove = () => true;
        }

        gameMap.addEntity(bouldingBall);
    }

    const maxBouldingBallId = entityId;

    // Create lemmings
    for (let i = 0; i < 5; i++) {
        const x = 20 + (i * 2);
        const y = 4;
        const direction = i % 2 === 0 ? 0 : 2;
        const lemming = BuildMapEntityLemming(x, y, direction);
        lemming.testId = entityId++;
        lemming.onTrample = function(gameMap, entity) {
            if (entity.type === "bouldingBall") {
                this.message =
                    `${this.testId} was crushed by ${entity.testId}`;
                this.isAlive = false;
                this.isActive = false;
            }
        };

        lemming.setPatrolPoints(
            gameMap,
            [
                { x, y },
                { x, y: y + 2 },
                { x: x + 2, y: y + 2 },
                { x, y: y + 2 },
            ],
            true
        );

        gameMap.addEntity(lemming);
    }

    const movements = [];

    for (let i = 0; i < 27; i++) {
        let message = "";

        if (i % 3 === 0) {
            gameMap.moveEntities();

            const messageEntities = gameMap.entities.filter(e => e.message);
            message = messageEntities.length > 0
                ? messageEntities.map(e => e.message).join("; ")
                : "";

            for (const entity of messageEntities) {
                delete entity.message;
            }
        }

        gameMap.moveRealtimeEntities();

        const messageEntities = gameMap.entities.filter(e => e.message);
        messageEntities.length > 0
            ? message += messageEntities.map(e => e.message).join("; ")
            : null;

        message = message.replace(/^\s*;\s*|\s*;\s*$/g, "");
        const messageId = parseInt(message.match(/^\d+/)?.[0] || -1, 10);

        movements.push(gameMap.entities.map(e => ({
            id: e.testId,
            x: e.x,
            y: e.y,
            direction: e.direction,
            displayCharacter: e.testId < maxBouldingBallId
                ? undefined
                : ["⬆️", "➡️", "⬇️", "⬅️"][e.direction % 4],
            message: e.testId === messageId && message || undefined,
        })));

        for (const entity of messageEntities) {
            delete entity.message;
        }
    }

    test(
        "Realtime Movement Test",
        () => {
            const expectedPositions = [
                [
                    { id:  1, x:  5, y:  4 },
                    { id:  2, x:  6, y:  7 },
                    { id:  3, x:  7, y:  4 },
                    { id:  4, x:  8, y:  7 },
                    { id:  5, x:  9, y:  4 },
                    { id:  6, x: 26, y:  6 },
                    { id:  7, x: 23, y:  6 },
                    { id:  8, x: 21, y:  2 },
                    { id:  9, x: 18, y:  2 },
                    { id: 10, x: 20, y:  4 },
                    { id: 11, x: 22, y:  4 },
                    { id: 12, x: 24, y:  4 },
                    { id: 13, x: 26, y:  4 },
                    { id: 14, x: 28, y:  4 },
                ],
                [
                    { id:  1, x:  5, y:  3 },
                    { id:  2, x:  6, y:  8 },
                    { id:  3, x:  7, y:  3 },
                    { id:  4, x:  8, y:  8 },
                    { id:  5, x:  9, y:  3 },
                    { id:  6, x: 27, y:  6 },
                    { id:  7, x: 22, y:  6 },
                    { id:  8, x: 22, y:  2 },
                    { id:  9, x: 17, y:  2 },
                    { id: 10, x: 20, y:  4 },
                    { id: 11, x: 22, y:  4 },
                    { id: 12, x: 24, y:  4 },
                    { id: 13, x: 26, y:  4 },
                    { id: 14, x: 28, y:  4 },
                ],
                [
                    { id:  1, x:  5, y:  2 },
                    { id:  2, x:  6, y:  9 },
                    { id:  3, x:  7, y:  2 },
                    { id:  4, x:  8, y:  9 },
                    { id:  5, x:  9, y:  2 },
                    { id:  6, x: 28, y:  6 },
                    { id:  7, x: 21, y:  6 },
                    { id:  8, x: 23, y:  2 },
                    { id:  9, x: 16, y:  2 },
                    { id: 10, x: 20, y:  4 },
                    { id: 11, x: 22, y:  4 },
                    { id: 12, x: 24, y:  4 },
                    { id: 13, x: 26, y:  4 },
                    { id: 14, x: 28, y:  4 },
                ],
                [
                    { id:  1, x:  5, y:  1 },
                    { id:  2, x:  6, y: 10 },
                    { id:  3, x:  7, y:  1 },
                    { id:  4, x:  8, y: 10 },
                    { id:  5, x:  9, y:  1 },
                    { id:  6, x: 29, y:  6 },
                    { id:  7, x: 20, y:  6 },
                    { id:  8, x: 24, y:  2 },
                    { id:  9, x: 15, y:  2 },
                    { id: 10, x: 20, y:  4 },
                    { id: 11, x: 22, y:  5 },
                    { id: 12, x: 24, y:  4 },
                    { id: 13, x: 26, y:  5 },
                    { id: 14, x: 28, y:  4 },
                ],
                [
                    { id:  1, x:  5, y:  1 },
                    { id:  2, x:  6, y: 11 },
                    { id:  3, x:  7, y:  2 },
                    { id:  4, x:  8, y: 11 },
                    { id:  5, x:  9, y:  1 },
                    { id:  6, x: 29, y:  6 },
                    { id:  7, x: 19, y:  6 },
                    { id:  8, x: 25, y:  2 },
                    { id:  9, x: 14, y:  2 },
                    { id: 10, x: 20, y:  4 },
                    { id: 11, x: 22, y:  5 },
                    { id: 12, x: 24, y:  4 },
                    { id: 13, x: 26, y:  5 },
                    { id: 14, x: 28, y:  4 },
                ],
                [
                    { id:  1, x:  5, y:  2 },
                    { id:  2, x:  6, y: 12 },
                    { id:  3, x:  7, y:  3 },
                    { id:  4, x:  8, y: 12 },
                    { id:  5, x:  9, y:  2 },
                    { id:  6, x: 28, y:  6 },
                    { id:  7, x: 19, y:  6 },
                    { id:  8, x: 26, y:  2 },
                    { id:  9, x: 13, y:  2 },
                    { id: 10, x: 20, y:  4 },
                    { id: 11, x: 22, y:  5 },
                    { id: 12, x: 24, y:  4 },
                    { id: 13, x: 26, y:  5 },
                    { id: 14, x: 28, y:  4 },
                ],
                [
                    { id:  1, x:  5, y:  3 },
                    { id:  2, x:  6, y: 13 },
                    { id:  3, x:  7, y:  4 },
                    { id:  4, x:  8, y: 13 },
                    { id:  5, x:  9, y:  3 },
                    { id:  6, x: 27, y:  6 },
                    { id:  7, x: 20, y:  6 },
                    { id:  8, x: 27, y:  2 },
                    { id:  9, x: 13, y:  2 },
                    { id: 10, x: 20, y:  4 },
                    { id: 11, x: 22, y:  6 },
                    { id: 12, x: 24, y:  4 },
                    { id: 13, x: 26, y:  6 },
                    { id: 14, x: 28, y:  4 },
                ],
                [
                    { id:  1, x:  5, y:  4 },
                    { id:  2, x:  6, y: 14 },
                    { id:  3, x:  7, y:  5 },
                    { id:  4, x:  8, y: 14 },
                    { id:  5, x:  9, y:  4 },
                    { id:  6, x: 26, y:  6 },
                    { id:  7, x: 21, y:  6 },
                    { id:  8, x: 28, y:  2 },
                    { id:  9, x: 14, y:  2 },
                    { id: 10, x: 20, y:  4 },
                    { id: 11, x: 22, y:  6 },
                    { id: 12, x: 24, y:  4 },
                    { id: 13, x: 26, y:  6, message: "13 was crushed by 6" },
                    { id: 14, x: 28, y:  4 },
                ],
                [
                    { id:  1, x:  5, y:  5 },
                    { id:  2, x:  6, y: 14 },
                    { id:  3, x:  7, y:  6 },
                    { id:  4, x:  8, y: 14 },
                    { id:  5, x:  9, y:  5 },
                    { id:  6, x: 25, y:  6 },
                    { id:  7, x: 22, y:  6 },
                    { id:  8, x: 29, y:  2 },
                    { id:  9, x: 15, y:  2 },
                    { id: 10, x: 20, y:  4 },
                    { id: 11, x: 22, y:  6, message: "11 was crushed by 7" },
                    { id: 12, x: 24, y:  4 },
                    { id: 14, x: 28, y:  4 },
                ],
                [
                    { id:  1, x:  5, y:  6 },
                    { id:  2, x:  6, y: 13 },
                    { id:  3, x:  7, y:  7 },
                    { id:  4, x:  8, y: 13 },
                    { id:  5, x:  9, y:  6 },
                    { id:  6, x: 24, y:  6 },
                    { id:  7, x: 23, y:  6 },
                    { id:  8, x: 29, y:  2 },
                    { id:  9, x: 16, y:  2 },
                    { id: 10, x: 20, y:  5 },
                    { id: 12, x: 24, y:  5 },
                    { id: 14, x: 28, y:  5 },
                ],
                [
                    { id:  1, x:  5, y:  7 },
                    { id:  2, x:  6, y: 12 },
                    { id:  3, x:  7, y:  8 },
                    { id:  4, x:  8, y: 12 },
                    { id:  5, x:  9, y:  7 },
                    { id:  6, x: 25, y:  6 },
                    { id:  7, x: 22, y:  6 },
                    { id:  8, x: 28, y:  2 },
                    { id:  9, x: 17, y:  2 },
                    { id: 10, x: 20, y:  5 },
                    { id: 12, x: 24, y:  5 },
                    { id: 14, x: 28, y:  5 },
                ],
                [
                    { id:  1, x:  5, y:  8 },
                    { id:  2, x:  6, y: 11 },
                    { id:  3, x:  7, y:  9 },
                    { id:  4, x:  8, y: 11 },
                    { id:  5, x:  9, y:  8 },
                    { id:  6, x: 26, y:  6 },
                    { id:  7, x: 21, y:  6 },
                    { id:  8, x: 27, y:  2 },
                    { id:  9, x: 18, y:  2 },
                    { id: 10, x: 20, y:  5 },
                    { id: 12, x: 24, y:  5 },
                    { id: 14, x: 28, y:  5 },
                ],
                [
                    { id:  1, x:  5, y:  9 },
                    { id:  2, x:  6, y: 10 },
                    { id:  3, x:  7, y: 10 },
                    { id:  4, x:  8, y: 10 },
                    { id:  5, x:  9, y:  9 },
                    { id:  6, x: 27, y:  6 },
                    { id:  7, x: 20, y:  6 },
                    { id:  8, x: 26, y:  2 },
                    { id:  9, x: 19, y:  2 },
                    { id: 10, x: 20, y:  6, message: "10 was crushed by 7" },
                    { id: 12, x: 24, y:  6 },
                    { id: 14, x: 28, y:  6 },
                ],
                [
                    { id:  1, x:  5, y: 10 },
                    { id:  2, x:  6, y:  9 },
                    { id:  3, x:  7, y: 11 },
                    { id:  4, x:  8, y:  9 },
                    { id:  5, x:  9, y: 10 },
                    { id:  6, x: 28, y:  6 },
                    { id:  7, x: 19, y:  6 },
                    { id:  8, x: 25, y:  2 },
                    { id:  9, x: 20, y:  2 },
                    { id: 12, x: 24, y:  6 },
                    { id: 14, x: 28, y:  6, message: "14 was crushed by 6" },
                ],
                [
                    { id:  1, x:  5, y: 11 },
                    { id:  2, x:  6, y:  8 },
                    { id:  3, x:  7, y: 12 },
                    { id:  4, x:  8, y:  8 },
                    { id:  5, x:  9, y: 11 },
                    { id:  6, x: 29, y:  6 },
                    { id:  7, x: 19, y:  6 },
                    { id:  8, x: 24, y:  2 },
                    { id:  9, x: 21, y:  2 },
                    { id: 12, x: 24, y:  6 },
                ],
                [
                    { id:  1, x:  5, y: 12 },
                    { id:  2, x:  6, y:  7 },
                    { id:  3, x:  7, y: 13 },
                    { id:  4, x:  8, y:  7 },
                    { id:  5, x:  9, y: 12 },
                    { id:  6, x: 29, y:  6 },
                    { id:  7, x: 20, y:  6 },
                    { id:  8, x: 23, y:  2 },
                    { id:  9, x: 22, y:  2 },
                    { id: 12, x: 24, y:  6 },
                ],
                [
                    { id:  1, x:  5, y: 13 },
                    { id:  2, x:  6, y:  6 },
                    { id:  3, x:  7, y: 14 },
                    { id:  4, x:  8, y:  6 },
                    { id:  5, x:  9, y: 13 },
                    { id:  6, x: 28, y:  6 },
                    { id:  7, x: 21, y:  6 },
                    { id:  8, x: 24, y:  2 },
                    { id:  9, x: 21, y:  2 },
                    { id: 12, x: 24, y:  6 },
                ],
                [
                    { id:  1, x:  5, y: 14 },
                    { id:  2, x:  6, y:  5 },
                    { id:  3, x:  7, y: 13 },
                    { id:  4, x:  8, y:  5 },
                    { id:  5, x:  9, y: 14 },
                    { id:  6, x: 27, y:  6 },
                    { id:  7, x: 22, y:  6 },
                    { id:  8, x: 25, y:  2 },
                    { id:  9, x: 20, y:  2 },
                    { id: 12, x: 24, y:  6 },
                ],
                [
                    { id:  1, x:  5, y: 14 },
                    { id:  2, x:  6, y:  4 },
                    { id:  3, x:  7, y: 12 },
                    { id:  4, x:  8, y:  4 },
                    { id:  5, x:  9, y: 14 },
                    { id:  6, x: 26, y:  6 },
                    { id:  7, x: 23, y:  6 },
                    { id:  8, x: 26, y:  2 },
                    { id:  9, x: 19, y:  2 },
                    { id: 12, x: 25, y:  6 },
                ],
                [
                    { id:  1, x:  5, y: 13 },
                    { id:  2, x:  6, y:  3 },
                    { id:  3, x:  7, y: 11 },
                    { id:  4, x:  8, y:  3 },
                    { id:  5, x:  9, y: 13 },
                    { id:  6, x: 25, y:  6 },
                    { id:  7, x: 24, y:  6 },
                    { id:  8, x: 27, y:  2 },
                    { id:  9, x: 18, y:  2 },
                    { id: 12, x: 25, y:  6, message: "12 was crushed by 6" },
                ],
                [
                    { id:  1, x:  5, y: 12 },
                    { id:  2, x:  6, y:  2 },
                    { id:  3, x:  7, y: 10 },
                    { id:  4, x:  8, y:  2 },
                    { id:  5, x:  9, y: 12 },
                    { id:  6, x: 26, y:  6 },
                    { id:  7, x: 23, y:  6 },
                    { id:  8, x: 28, y:  2 },
                    { id:  9, x: 17, y:  2 },
                ],
                [
                    { id:  1, x:  5, y: 11 },
                    { id:  2, x:  6, y:  1 },
                    { id:  3, x:  7, y:  9 },
                    { id:  4, x:  8, y:  1 },
                    { id:  5, x:  9, y: 11 },
                    { id:  6, x: 27, y:  6 },
                    { id:  7, x: 22, y:  6 },
                    { id:  8, x: 29, y:  2 },
                    { id:  9, x: 16, y:  2 },
                ],
                [
                    { id:  1, x:  5, y: 10 },
                    { id:  2, x:  6, y:  1 },
                    { id:  3, x:  7, y:  8 },
                    { id:  4, x:  8, y:  1 },
                    { id:  5, x:  9, y: 10 },
                    { id:  6, x: 28, y:  6 },
                    { id:  7, x: 21, y:  6 },
                    { id:  8, x: 29, y:  2 },
                    { id:  9, x: 15, y:  2 },
                ],
                [
                    { id:  1, x:  5, y:  9 },
                    { id:  2, x:  6, y:  2 },
                    { id:  3, x:  7, y:  7 },
                    { id:  4, x:  8, y:  2 },
                    { id:  5, x:  9, y:  9 },
                    { id:  6, x: 29, y:  6 },
                    { id:  7, x: 20, y:  6 },
                    { id:  8, x: 28, y:  2 },
                    { id:  9, x: 14, y:  2 },
                ],
                [
                    { id:  1, x:  5, y:  8 },
                    { id:  2, x:  6, y:  3 },
                    { id:  3, x:  7, y:  6 },
                    { id:  4, x:  8, y:  3 },
                    { id:  5, x:  9, y:  8 },
                    { id:  6, x: 29, y:  6 },
                    { id:  7, x: 19, y:  6 },
                    { id:  8, x: 27, y:  2 },
                    { id:  9, x: 13, y:  2 },
                ],
                [
                    { id:  1, x:  5, y:  7 },
                    { id:  2, x:  6, y:  4 },
                    { id:  3, x:  7, y:  5 },
                    { id:  4, x:  8, y:  4 },
                    { id:  5, x:  9, y:  7 },
                    { id:  6, x: 28, y:  6 },
                    { id:  7, x: 19, y:  6 },
                    { id:  8, x: 26, y:  2 },
                    { id:  9, x: 13, y:  2 },
                ],
                [
                    { id:  1, x:  5, y:  6 },
                    { id:  2, x:  6, y:  5 },
                    { id:  3, x:  7, y:  4 },
                    { id:  4, x:  8, y:  5 },
                    { id:  5, x:  9, y:  6 },
                    { id:  6, x: 27, y:  6 },
                    { id:  7, x: 20, y:  6 },
                    { id:  8, x: 25, y:  2 },
                    { id:  9, x: 14, y:  2 },
                ]
            ];

            const positions = movements.map(e =>
                e.map(p => ({ id: p.id, x: p.x, y: p.y, message: p.message }))
            );

            Assert.deepEquals(expectedPositions, positions);
        },
        renderMovementContext(gameMap, movements)
    );
}
