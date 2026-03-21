// Basic tests for the Entity Movement Planner
function EntityMovementPlanner_basicMovementTest()
{
    /**
     * In this test, four entities are placed in the corners of a square.
     * The size of a corridor within this square is smaller than the Entity
     * Movement Planner's windowSize
     *
     * In other words, in this particular test, the amount of lookahead results
     * in each of the entities being able to account for one another's steps.
     * So, when the planner begins, it's able to see all possible steps for all
     * of the entities and make sure that they move cooperatively
     *
     * If the game map's size is increased without also extending the
     * windowSize, then the entities will start to run towards one another
     */
    const circuitMap = new GameMap(10, 10);
    circuitMap.fill(0, 0, circuitMap.width, circuitMap.height, "wall");
    circuitMap.line(1, 1, circuitMap.width - 2, 1, { cellType: "floor" });
    circuitMap.line(
        circuitMap.width - 2,
        1,
        circuitMap.width - 2,
        circuitMap.height - 2,
        { cellType: "floor" }
    );
    circuitMap.line(
        circuitMap.width - 2,
        circuitMap.height - 2,
        1,
        circuitMap.height - 2,
        { cellType: "floor" }
    );
    circuitMap.line(1, circuitMap.height - 2, 1, 1, { cellType: "floor" });

    circuitMap.addEntity({
        id: 1,
        isAutonomous: true,
        hasTarget: () => true,
        x: 1,
        y: 1,
        target: {
            x: circuitMap.width - 2,
            y: circuitMap.height - 2
        },
        getMovementPriority: () => 10,
        reachedDestination: function() {
            return this.x === this.target.x && this.y === this.target.y;
        },
    });

    circuitMap.addEntity({
        id: 2,
        isAutonomous: true,
        hasTarget: () => true,
        x: circuitMap.width - 2,
        y: 1,
        target: {
            x: 1,
            y: circuitMap.height - 2
        },
        getMovementPriority: () => 8,
        reachedDestination: function() {
            return this.x === this.target.x && this.y === this.target.y;
        },
    });

    circuitMap.addEntity({
        id: 3,
        isAutonomous: true,
        hasTarget: () => true,
        x: circuitMap.width - 2,
        y: circuitMap.height - 2,
        target: {
            x: 1,
            y: 1
        },
        getMovementPriority: () => 9,
        reachedDestination: function() {
            return this.x === this.target.x && this.y === this.target.y;
        },
    });

    circuitMap.addEntity({
        id: 4,
        isAutonomous: true,
        hasTarget: () => true,
        x: 1,
        y: circuitMap.height - 2,
        target: {
            x: circuitMap.width - 2,
            y: 1
        },
        getMovementPriority: () => 7,
        reachedDestination: function() {
            return this.x === this.target.x && this.y === this.target.y;
        },
    });

    const circuitMovements = [
        circuitMap.entities.map(e => ({ id: e.id, x: e.x, y: e.y })),
    ];
    let circuitBreaker = 0;
    let allCircuitPlans = [];

    do {
        EntityMovementPlanner.planMovement(circuitMap);
        const circuitPlan = [...EntityMovementPlanner.currentPlan];
        allCircuitPlans = allCircuitPlans.concat(circuitPlan);

        for (let i = 0; i < circuitPlan.length; i++) {
            EntityMovementPlanner.move(circuitMap);
            circuitMovements.push(
                circuitMap.entities.map(e => ({ id: e.id, x: e.x, y: e.y }))
            );

            if (circuitMap.entities.some(e => e.reachedDestination())) {
                break;
            }
        }

        if (circuitBreaker++ >= 10000) {
            break;
        }
    } while (! circuitMap.entities.some(e => e.reachedDestination()));

    test(
        "Autonomous Entities Walk Around Circuit",
        () => {
            Assert.deepEquals(
                [
                    [
                        { id: 1, x: 1, y: 1 },
                        { id: 2, x: 8, y: 1 },
                        { id: 3, x: 8, y: 8 },
                        { id: 4, x: 1, y: 8 },
                    ],
                    [
                        { id: 1, x: 2, y: 1 },
                        { id: 2, x: 8, y: 2 },
                        { id: 3, x: 7, y: 8 },
                        { id: 4, x: 1, y: 7 },
                    ],
                    [
                        { id: 1, x: 3, y: 1 },
                        { id: 2, x: 8, y: 3 },
                        { id: 3, x: 6, y: 8 },
                        { id: 4, x: 1, y: 6 },
                    ],
                    [
                        { id: 1, x: 4, y: 1 },
                        { id: 2, x: 8, y: 4 },
                        { id: 3, x: 5, y: 8 },
                        { id: 4, x: 1, y: 5 },
                    ],
                    [
                        { id: 1, x: 5, y: 1 },
                        { id: 2, x: 8, y: 5 },
                        { id: 3, x: 4, y: 8 },
                        { id: 4, x: 1, y: 4 },
                    ],
                    [
                        { id: 1, x: 6, y: 1 },
                        { id: 2, x: 8, y: 6 },
                        { id: 3, x: 3, y: 8 },
                        { id: 4, x: 1, y: 3 },
                    ],
                    [
                        { id: 1, x: 7, y: 1 },
                        { id: 2, x: 8, y: 7 },
                        { id: 3, x: 2, y: 8 },
                        { id: 4, x: 1, y: 2 },
                    ],
                    [
                        { id: 1, x: 8, y: 1 },
                        { id: 2, x: 8, y: 8 },
                        { id: 3, x: 1, y: 8 },
                        { id: 4, x: 1, y: 1 },
                    ],
                    [
                        { id: 1, x: 8, y: 2 },
                        { id: 2, x: 7, y: 8 },
                        { id: 3, x: 1, y: 7 },
                        { id: 4, x: 2, y: 1 },
                    ],
                    [
                        { id: 1, x: 8, y: 3 },
                        { id: 2, x: 6, y: 8 },
                        { id: 3, x: 1, y: 6 },
                        { id: 4, x: 3, y: 1 },
                    ],
                    [
                        { id: 1, x: 8, y: 4 },
                        { id: 2, x: 5, y: 8 },
                        { id: 3, x: 1, y: 5 },
                        { id: 4, x: 4, y: 1 },
                    ],
                    [
                        { id: 1, x: 8, y: 5 },
                        { id: 2, x: 4, y: 8 },
                        { id: 3, x: 1, y: 4 },
                        { id: 4, x: 5, y: 1 },
                    ],
                    [
                        { id: 1, x: 8, y: 6 },
                        { id: 2, x: 3, y: 8 },
                        { id: 3, x: 1, y: 3 },
                        { id: 4, x: 6, y: 1 },
                    ],
                    [
                        { id: 1, x: 8, y: 7 },
                        { id: 2, x: 2, y: 8 },
                        { id: 3, x: 1, y: 2 },
                        { id: 4, x: 7, y: 1 },
                    ],
                    [
                        { id: 1, x: 8, y: 8 },
                        { id: 2, x: 1, y: 8 },
                        { id: 3, x: 1, y: 1 },
                        { id: 4, x: 8, y: 1 },
                    ],
                ],
                circuitMovements,
                "Entities walk in a clockwise motion"
            );
        },
        renderMovementContext(circuitMap, circuitMovements, allCircuitPlans)
    );
}
