// Behavioral tests for the Entity Movement Planner using a small plan window
function EntityMovementPlanner_groupMovementSmallWindowTest()
{
    const originalWindowSize = EntityMovementPlanner.windowSize;
    EntityMovementPlanner.windowSize = 8;

    const gameMap = new GameMap(10, 10);
    gameMap.fill(0, 0, gameMap.width, gameMap.height, "wall");
    gameMap.line(1, 1, gameMap.width - 2, 1, { cellType: "floor" });
    gameMap.line(
        gameMap.width - 2,
        1,
        gameMap.width - 2,
        gameMap.height - 2,
        { cellType: "floor" }
    );
    gameMap.line(
        gameMap.width - 2,
        gameMap.height - 2,
        1,
        gameMap.height - 2,
        { cellType: "floor" }
    );
    gameMap.line(1, gameMap.height - 2, 1, 1, { cellType: "floor" });
    gameMap.line(4, 2, 4, 4, { cellType: "floor" });
    gameMap.line(5, 4, 5, 7, { cellType: "floor" });

    gameMap.addEntity(
        {
            id: 1,
            isAutonomous: true,
            hasTarget: () => true,
            target: {
                x: gameMap.width - 2,
                y: gameMap.height - 2
            },
            getMovementPriority: () => 10,
            reachedDestination: function() {
                return this.x === this.target.x && this.y === this.target.y;
            },
        },
        1,
        1
    );

    gameMap.addEntity(
        {
            id: 2,
            isAutonomous: true,
            hasTarget: () => true,
            target: {
                x: 1,
                y: gameMap.height - 2
            },
            getMovementPriority: () => 8,
            reachedDestination: function() {
                return this.x === this.target.x && this.y === this.target.y;
            },
        },
        gameMap.width - 2,
        1
    );

    gameMap.addEntity(
        {
            id: 3,
            isAutonomous: true,
            hasTarget: () => true,
            target: {
                x: 1,
                y: 1
            },
            getMovementPriority: () => 9,
            reachedDestination: function() {
                return this.x === this.target.x && this.y === this.target.y;
            },
        },
        gameMap.width - 2,
        gameMap.height - 2
    );

    gameMap.addEntity(
        {
            id: 4,
            isAutonomous: true,
            hasTarget: () => true,
            target: {
                x: gameMap.width - 2,
                y: 1
            },
            getMovementPriority: () => 7,
            reachedDestination: function() {
                return this.x === this.target.x && this.y === this.target.y;
            },
        },
        1,
        gameMap.height - 2
    );

    const movements = [
        gameMap.entities.map(e => ({ id: e.id, x: e.x, y: e.y })),
    ];
    let allPlans = [];

    for (let iterations = 0; iterations < 10; iterations++) {
        EntityMovementPlanner.planMovement(gameMap);
        const plan = [...EntityMovementPlanner.currentPlan];
        allPlans = allPlans.concat(plan);

        for (let i = 0; i < plan.length; i++) {
            EntityMovementPlanner.move(gameMap);
            movements.push(
                gameMap.entities.map(e => ({ id: e.id, x: e.x, y: e.y }))
            );

            if (gameMap.entities.some(e => e.reachedDestination())) {
                break;
            }
        }

        const allEntitiesHaveReachedTheirTargets =
            gameMap.entities.filter(e => e.reachedDestination()) ===
                gameMap.entities.length;

        if (allEntitiesHaveReachedTheirTargets) {
            break;
        }
    }

    test(
        "Autonomous Entities Navigating Corridors, Small Plan Window Size",
        () => {
            const expectedMovements = [
                [
                    { id: 1, x: 1, y: 1 },
                    { id: 2, x: 8, y: 1 },
                    { id: 3, x: 8, y: 8 },
                    { id: 4, x: 1, y: 8 }
                ],
                [
                    { id: 1, x: 2, y: 1 },
                    { id: 2, x: 7, y: 1 },
                    { id: 3, x: 7, y: 8 },
                    { id: 4, x: 1, y: 7 }
                ],
                [
                    { id: 1, x: 3, y: 1 },
                    { id: 2, x: 6, y: 1 },
                    { id: 3, x: 6, y: 8 },
                    { id: 4, x: 1, y: 6 }
                ],
                [
                    { id: 1, x: 4, y: 1 },
                    { id: 2, x: 5, y: 1 },
                    { id: 3, x: 5, y: 8 },
                    { id: 4, x: 1, y: 5 }
                ],
                [
                    { id: 1, x: 4, y: 2 },
                    { id: 2, x: 4, y: 1 },
                    { id: 3, x: 4, y: 8 },
                    { id: 4, x: 1, y: 4 }
                ],
                [
                    { id: 1, x: 4, y: 3 },
                    { id: 2, x: 4, y: 2 },
                    { id: 3, x: 3, y: 8 },
                    { id: 4, x: 1, y: 3 }
                ],
                [
                    { id: 1, x: 4, y: 4 },
                    { id: 2, x: 4, y: 3 },
                    { id: 3, x: 2, y: 8 },
                    { id: 4, x: 1, y: 2 }
                ],
                [
                    { id: 1, x: 5, y: 4 },
                    { id: 2, x: 4, y: 4 },
                    { id: 3, x: 1, y: 8 },
                    { id: 4, x: 1, y: 1 }
                ],
                [
                    { id: 1, x: 5, y: 5 },
                    { id: 2, x: 5, y: 4 },
                    { id: 3, x: 1, y: 7 },
                    { id: 4, x: 2, y: 1 }
                ],
                [
                    { id: 1, x: 5, y: 6 },
                    { id: 2, x: 5, y: 5 },
                    { id: 3, x: 1, y: 6 },
                    { id: 4, x: 3, y: 1 }
                ],
                [
                    { id: 1, x: 5, y: 7 },
                    { id: 2, x: 5, y: 6 },
                    { id: 3, x: 1, y: 5 },
                    { id: 4, x: 4, y: 1 }
                ],
                [
                    { id: 1, x: 5, y: 8 },
                    { id: 2, x: 5, y: 7 },
                    { id: 3, x: 1, y: 4 },
                    { id: 4, x: 4, y: 1 }
                ],
                [
                    { id: 1, x: 6, y: 8 },
                    { id: 2, x: 5, y: 8 },
                    { id: 3, x: 1, y: 3 },
                    { id: 4, x: 4, y: 1 }
                ],
                [
                    { id: 1, x: 7, y: 8 },
                    { id: 2, x: 4, y: 8 },
                    { id: 3, x: 1, y: 2 },
                    { id: 4, x: 4, y: 1 }
                ],
                [
                    { id: 1, x: 8, y: 8 },
                    { id: 2, x: 3, y: 8 },
                    { id: 3, x: 1, y: 1 },
                    { id: 4, x: 4, y: 1 }
                ]
            ];

            Assert.deepEquals(
                expectedMovements,
                movements.slice(0, expectedMovements.length)
            );
        },
        renderMovementContext(
            gameMap,
            movements,
            allPlans,
            EntityMovementPlanner.corridors
        )
    );

    EntityMovementPlanner.windowSize = originalWindowSize;
}
