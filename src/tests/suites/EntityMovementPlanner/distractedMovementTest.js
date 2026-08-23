"use strict";

// Testing pathfinding response when entities start getting distracted
function EntityMovementPlanner_distractedMovementTest()
{
    // EntityMovementPlanner.windowSize = 20;

    const gameMap = new GameMap(31, 8);
    gameMap.fill(0, 0, gameMap.width, gameMap.height, "wall");
    gameMap.fill(1, 1, gameMap.width - 1, gameMap.height - 1, "floor");
    gameMap.line(10, 1, 10, 5, "wall");
    gameMap.line(20, 2, 20, 6, "wall");

    const commonSettings = {
        objectsOfInterest: ["runner"],
        // Overrides the turn decision mechanism to make behavior predictable
        preferLeftTurnFirst: true,
    };

    gameMap.addEntity(BuildMapEntityLemming(), 2, 2, 2);
    gameMap.entities[0].testId = 1;
    gameMap.entities[0] = { ...gameMap.entities[0], ...commonSettings };
    gameMap.entities[0].setPatrolPoints(
        gameMap,
        [
            { x: 2, y: 2 },
            { x: 2, y: 5 },
            { x: 8, y: 5 },
            { x: 8, y: 2 },
        ]
    );

    gameMap.addEntity(BuildMapEntityLemming(), 8, 5, 0);
    gameMap.entities[1].testId = 2;
    gameMap.entities[1] = { ...gameMap.entities[1], ...commonSettings };
    gameMap.entities[1].setPatrolPoints(
        gameMap,
        [
            { x: 8, y: 5 },
            { x: 8, y: 2 },
            { x: 2, y: 2 },
            { x: 2, y: 5 },
        ]
    );

    gameMap.addEntity(BuildMapEntityLemming(), 12, 5, 0);
    gameMap.entities[2].testId = 3;
    gameMap.entities[2] = { ...gameMap.entities[2], ...commonSettings };
    gameMap.entities[2].setPatrolPoints(
        gameMap,
        [
            { x: 12, y: 5 },
            { x: 12, y: 2 },
            { x: 18, y: 2 },
            { x: 18, y: 5 },
        ]
    );

    gameMap.addEntity(BuildMapEntityLemming(), 18, 2, 2);
    gameMap.entities[3].testId = 4;
    gameMap.entities[3] = { ...gameMap.entities[3], ...commonSettings };
    gameMap.entities[3].setPatrolPoints(
        gameMap,
        [
            { x: 18, y: 2 },
            { x: 18, y: 5 },
            { x: 12, y: 5 },
            { x: 12, y: 2 },
        ]
    );

    gameMap.addEntity(BuildMapEntityLemming(), 22, 2, 2);
    gameMap.entities[4].testId = 5;
    gameMap.entities[4] = { ...gameMap.entities[4], ...commonSettings };
    gameMap.entities[4].setPatrolPoints(
        gameMap,
        [
            { x: 22, y: 2 },
            { x: 22, y: 5 },
            { x: 28, y: 5 },
            { x: 28, y: 2 },
        ]
    );

    gameMap.addEntity(BuildMapEntityLemming(), 28, 5, 0);
    gameMap.entities[5].testId = 6;
    gameMap.entities[5] = { ...gameMap.entities[5], ...commonSettings };
    gameMap.entities[5].setPatrolPoints(
        gameMap,
        [
            { x: 28, y: 5 },
            { x: 28, y: 2 },
            { x: 22, y: 2 },
            { x: 22, y: 5 },
        ]
    );

    const movements = [];
    movements.push(gameMap.entities.map(e => ({
        id: e.testId,
        x: e.x,
        y: e.y,
        direction: e.direction,
    })));


    const runner = {
        ...MapEntityBuilder("creature"),
        testId: 7,
        output: [],
        preferLeftTurnFirst: true,
        type: "runner",
        onTouch: function(gameMap, touchedBy) {
            console.log("🏃‍♂️ Runner touched", { touchedBy });
            this.message =
                `${this.testId} (${ this.x }, ${ this.y }) touched by ` +
                `${touchedBy.testId} (${ touchedBy.x }, ${ touchedBy.y })`;
        },
    };
    MapEntityTrait_AttachMovement_TargetAndWait(runner);

    const runnerPartyMember = PartyMemberBuilder("Runner", {
        progression: {
            level: 1,
            experience: 0,
        },
        core: {
            hp: 1,
            maxHp: 1,
            defense: 1,
            strength: 1,
            persuasion: 0,
            endurance: 0,
            speed: 1,
            luck: 1,
        },
    });
    runnerPartyMember.traits.sightRange = 5;
    runner.addPartyMember(runnerPartyMember);

    runner.setTarget(28, 5);
    runner.targetCheck = function() {
        if (this.isOnTarget()) {
            console.log("🏃‍♂️ Reached my second target! TIME TO DIE!");
            this.isActive = false;
        } else {
            console.log(
                "🏃‍♂️ Moving towards my only target",
                {
                    x: this.x,
                    y: this.y,
                    target: this.target
                }
            );
        }
    };

    for (let i = 0; i < 128; i++) {
        if (i === 1) {
            gameMap.addEntity(runner, 2, 1, 2);
            console.log("🏃‍♂️ Runner has entered the map", { id: runner.testId });
        }

        gameMap.moveEntities();
        movements.push(gameMap.entities.map(e => ({
            id: e.testId,
            x: e.x,
            y: e.y,
            direction: e.direction,
            displayCharacter: e.testId !== runner.testId
                ? undefined
                : ["⬆️", "➡️", "⬇️", "⬅️"][e.direction % 4],
            message: e.testId === runner.testId && runner.message || undefined,
        })));

        delete runner.message;
    }

    test(
        "Distracted Movement Test",
        () => {
            const expectedPositions = [
                [
                    { id: 1, x:  2, y:  2 },
                    { id: 2, x:  8, y:  5 },
                    { id: 3, x: 12, y:  5 },
                    { id: 4, x: 18, y:  2 },
                    { id: 5, x: 22, y:  2 },
                    { id: 6, x: 28, y:  5 },
                ],[
                    { id: 1, x:  2, y:  3 },
                    { id: 2, x:  8, y:  4 },
                    { id: 3, x: 12, y:  4 },
                    { id: 4, x: 18, y:  3 },
                    { id: 5, x: 22, y:  3 },
                    { id: 6, x: 28, y:  4 },
                ],[
                    { id: 1, x:  2, y:  4 },
                    { id: 2, x:  8, y:  3 },
                    { id: 3, x: 12, y:  3 },
                    { id: 4, x: 18, y:  4 },
                    { id: 5, x: 22, y:  4 },
                    { id: 6, x: 28, y:  3 },
                    { id: 7, x:  2, y:  1 },
                ],[
                    { id: 1, x:  2, y:  5 },
                    { id: 2, x:  8, y:  2 },
                    { id: 3, x: 12, y:  2 },
                    { id: 4, x: 18, y:  5 },
                    { id: 5, x: 22, y:  5 },
                    { id: 6, x: 28, y:  2 },
                    { id: 7, x:  3, y:  1 },
                ],[
                    { id: 1, x:  2, y:  5 },
                    { id: 2, x:  8, y:  2 },
                    { id: 3, x: 12, y:  2 },
                    { id: 4, x: 18, y:  5 },
                    { id: 5, x: 22, y:  5 },
                    { id: 6, x: 28, y:  2 },
                    { id: 7, x:  4, y:  1 },
                ],[
                    { id: 1, x:  3, y:  5 },
                    { id: 2, x:  7, y:  2 },
                    { id: 3, x: 13, y:  2 },
                    { id: 4, x: 17, y:  5 },
                    { id: 5, x: 23, y:  5 },
                    { id: 6, x: 27, y:  2 },
                    { id: 7, x:  5, y:  1 },
                ],[
                    { id: 1, x:  4, y:  5 },
                    { id: 2, x:  6, y:  2 },
                    { id: 3, x: 14, y:  2 },
                    { id: 4, x: 16, y:  5 },
                    { id: 5, x: 24, y:  5 },
                    { id: 6, x: 26, y:  2 },
                    { id: 7, x:  6, y:  1 },
                ],[
                    { id: 1, x:  5, y:  5 },
                    { id: 2, x:  5, y:  2 },
                    { id: 3, x: 15, y:  2 },
                    { id: 4, x: 15, y:  5 },
                    { id: 5, x: 25, y:  5 },
                    { id: 6, x: 25, y:  2 },
                    { id: 7, x:  7, y:  1 },
                ],[
                    { id: 1, x:  6, y:  5 },
                    { id: 2, x:  5, y:  2 },
                    { id: 3, x: 16, y:  2 },
                    { id: 4, x: 14, y:  5 },
                    { id: 5, x: 26, y:  5 },
                    { id: 6, x: 24, y:  2 },
                    { id: 7, x:  8, y:  1 },
                ],[
                    { id: 1, x:  7, y:  5 },
                    { id: 2, x:  5, y:  1 },
                    { id: 3, x: 17, y:  2 },
                    { id: 4, x: 13, y:  5 },
                    { id: 5, x: 27, y:  5 },
                    { id: 6, x: 23, y:  2 },
                    { id: 7, x:  9, y:  1 },
                ],[
                    { id: 1, x:  8, y:  5 },
                    { id: 2, x:  5, y:  1 },
                    { id: 3, x: 18, y:  2 },
                    { id: 4, x: 12, y:  5 },
                    { id: 5, x: 28, y:  5 },
                    { id: 6, x: 22, y:  2 },
                    { id: 7, x:  9, y:  1 },
                ],[
                    { id: 1, x:  8, y:  5 },
                    { id: 2, x:  4, y:  1 },
                    { id: 3, x: 18, y:  2 },
                    { id: 4, x: 12, y:  5 },
                    { id: 5, x: 28, y:  5 },
                    { id: 6, x: 22, y:  2 },
                    { id: 7, x:  9, y:  2 },
                ],[
                    { id: 1, x:  8, y:  5 },
                    { id: 2, x:  3, y:  1 },
                    { id: 3, x: 18, y:  3 },
                    { id: 4, x: 12, y:  4 },
                    { id: 5, x: 28, y:  4 },
                    { id: 6, x: 22, y:  3 },
                    { id: 7, x:  9, y:  3 },
                ],[
                    { id: 1, x:  9, y:  5 },
                    { id: 2, x:  2, y:  1 },
                    { id: 3, x: 18, y:  4 },
                    { id: 4, x: 12, y:  3 },
                    { id: 5, x: 28, y:  3 },
                    { id: 6, x: 22, y:  4 },
                    { id: 7, x:  9, y:  4 },
                ],[
                    { id: 1, x:  9, y:  5 },
                    { id: 2, x:  2, y:  1 },
                    { id: 3, x: 18, y:  5 },
                    { id: 4, x: 12, y:  2 },
                    { id: 5, x: 28, y:  2 },
                    { id: 6, x: 22, y:  5 },
                    { id: 7, x:  9, y:  4 },
                ],[
                    { id: 1, x:  9, y:  5 },
                    { id: 2, x:  2, y:  2 },
                    { id: 3, x: 18, y:  5 },
                    { id: 4, x: 12, y:  2 },
                    { id: 5, x: 28, y:  2 },
                    { id: 6, x: 22, y:  5 },
                    {
                        id: 7,
                        x:  8,
                        y:  4,
                        message: "7 (9, 4) touched by 1 (9, 5)",
                    },
                ],[
                    { id: 1, x:  9, y:  4 },
                    { id: 2, x:  2, y:  3 },
                    { id: 3, x: 17, y:  5 },
                    { id: 4, x: 13, y:  2 },
                    { id: 5, x: 27, y:  2 },
                    { id: 6, x: 23, y:  5 },
                    { id: 7, x:  8, y:  4 },
                ],[
                    { id: 1, x:  9, y:  4 },
                    { id: 2, x:  2, y:  4 },
                    { id: 3, x: 16, y:  5 },
                    { id: 4, x: 14, y:  2 },
                    { id: 5, x: 26, y:  2 },
                    { id: 6, x: 24, y:  5 },
                    { id: 7, x:  8, y:  5 },
                ],[
                    { id: 1, x:  8, y:  4 },
                    { id: 2, x:  2, y:  5 },
                    { id: 3, x: 15, y:  5 },
                    { id: 4, x: 15, y:  2 },
                    { id: 5, x: 25, y:  2 },
                    { id: 6, x: 25, y:  5 },
                    { id: 7, x:  8, y:  5 },
                ],[
                    { id: 1, x:  8, y:  4 },
                    { id: 2, x:  2, y:  5 },
                    { id: 3, x: 14, y:  5 },
                    { id: 4, x: 16, y:  2 },
                    { id: 5, x: 24, y:  2 },
                    { id: 6, x: 26, y:  5 },
                    { id: 7, x:  9, y:  5 },
                ],[
                    { id: 1, x:  8, y:  5 },
                    { id: 2, x:  3, y:  5 },
                    { id: 3, x: 13, y:  5 },
                    { id: 4, x: 17, y:  2 },
                    { id: 5, x: 23, y:  2 },
                    { id: 6, x: 27, y:  5 },
                    { id: 7, x:  9, y:  5 },
                ],[
                    { id: 1, x:  8, y:  5 },
                    { id: 2, x:  4, y:  5 },
                    { id: 3, x: 12, y:  5 },
                    { id: 4, x: 18, y:  2 },
                    { id: 5, x: 22, y:  2 },
                    { id: 6, x: 28, y:  5 },
                    { id: 7, x:  9, y:  6 },
                ],[
                    { id: 1, x:  9, y:  5 },
                    { id: 2, x:  5, y:  5 },
                    { id: 3, x: 12, y:  5 },
                    { id: 4, x: 18, y:  2 },
                    { id: 5, x: 22, y:  2 },
                    { id: 6, x: 28, y:  5 },
                    { id: 7, x:  9, y:  6 },
                ],[
                    { id: 1, x:  9, y:  5 },
                    { id: 2, x:  6, y:  5 },
                    { id: 3, x: 12, y:  5 },
                    { id: 4, x: 18, y:  3 },
                    { id: 5, x: 22, y:  3 },
                    { id: 6, x: 28, y:  4 },
                    { id: 7, x: 10, y:  6 },
                ],[
                    { id: 1, x:  9, y:  6 },
                    { id: 2, x:  7, y:  5 },
                    { id: 3, x: 11, y:  5 },
                    { id: 4, x: 18, y:  4 },
                    { id: 5, x: 22, y:  4 },
                    { id: 6, x: 28, y:  3 },
                    { id: 7, x: 11, y:  6 },
                ],[
                    { id: 1, x:  9, y:  6 },
                    { id: 2, x:  8, y:  5 },
                    { id: 3, x: 11, y:  5 },
                    { id: 4, x: 18, y:  5 },
                    { id: 5, x: 22, y:  5 },
                    { id: 6, x: 28, y:  2 },
                    { id: 7, x: 12, y:  6 },
                ],[
                    { id: 1, x: 10, y:  6 },
                    { id: 2, x:  9, y:  5 },
                    { id: 3, x: 11, y:  6 },
                    { id: 4, x: 18, y:  5 },
                    { id: 5, x: 22, y:  5 },
                    { id: 6, x: 28, y:  2 },
                    { id: 7, x: 13, y:  6 },
                ],[
                    { id: 1, x: 10, y:  6 },
                    { id: 2, x:  9, y:  5 },
                    { id: 3, x: 11, y:  6 },
                    { id: 4, x: 17, y:  5 },
                    { id: 5, x: 23, y:  5 },
                    { id: 6, x: 27, y:  2 },
                    { id: 7, x: 14, y:  6 },
                ],[
                    { id: 1, x: 10, y:  6 },
                    { id: 2, x:  9, y:  6 },
                    { id: 3, x: 12, y:  6 },
                    { id: 4, x: 16, y:  5 },
                    { id: 5, x: 24, y:  5 },
                    { id: 6, x: 26, y:  2 },
                    { id: 7, x: 15, y:  6 },
                ],[
                    { id: 1, x: 11, y:  6 },
                    { id: 2, x:  9, y:  6 },
                    { id: 3, x: 13, y:  6 },
                    { id: 4, x: 15, y:  5 },
                    { id: 5, x: 25, y:  5 },
                    { id: 6, x: 25, y:  2 },
                    { id: 7, x: 16, y:  6 },
                ],[
                    { id: 1, x: 12, y:  6 },
                    { id: 2, x: 10, y:  6 },
                    { id: 3, x: 14, y:  6 },
                    { id: 4, x: 15, y:  5 },
                    { id: 5, x: 26, y:  5 },
                    { id: 6, x: 24, y:  2 },
                    { id: 7, x: 17, y:  6 },
                ],[
                    { id: 1, x: 13, y:  6 },
                    { id: 2, x: 11, y:  6 },
                    { id: 3, x: 15, y:  6 },
                    { id: 4, x: 15, y:  5 },
                    { id: 5, x: 27, y:  5 },
                    { id: 6, x: 23, y:  2 },
                    { id: 7, x: 18, y:  6 },
                ],[
                    { id: 1, x: 14, y:  6 },
                    { id: 2, x: 12, y:  6 },
                    { id: 3, x: 16, y:  6 },
                    { id: 4, x: 16, y:  5 },
                    { id: 5, x: 28, y:  5 },
                    { id: 6, x: 22, y:  2 },
                    { id: 7, x: 19, y:  6 },
                ],[
                    { id: 1, x: 15, y:  6 },
                    { id: 2, x: 12, y:  6 },
                    { id: 3, x: 17, y:  6 },
                    { id: 4, x: 17, y:  5 },
                    { id: 5, x: 28, y:  5 },
                    { id: 6, x: 22, y:  2 },
                    { id: 7, x: 19, y:  6 },
                ],[
                    { id: 1, x: 16, y:  6 },
                    { id: 2, x: 12, y:  6 },
                    { id: 3, x: 18, y:  6 },
                    { id: 4, x: 18, y:  5 },
                    { id: 5, x: 28, y:  4 },
                    { id: 6, x: 22, y:  3 },
                    { id: 7, x: 19, y:  5 },
                ],[
                    { id: 1, x: 17, y:  6 },
                    { id: 2, x: 11, y:  6 },
                    { id: 3, x: 19, y:  6 },
                    { id: 4, x: 18, y:  5 },
                    { id: 5, x: 28, y:  3 },
                    { id: 6, x: 22, y:  4 },
                    {
                        id: 7,
                        x: 19,
                        y:  4,
                        message: "7 (19, 5) touched by 4 (18, 5)",
                    },
                ],[
                    { id: 1, x: 18, y:  6 },
                    { id: 2, x: 10, y:  6 },
                    { id: 3, x: 19, y:  6 },
                    { id: 4, x: 18, y:  5 },
                    { id: 5, x: 28, y:  2 },
                    { id: 6, x: 22, y:  5 },
                    { id: 7, x: 19, y:  3 },
                ],[
                    { id: 1, x: 18, y:  6 },
                    { id: 2, x:  9, y:  6 },
                    { id: 3, x: 19, y:  5 },
                    { id: 4, x: 18, y:  5 },
                    { id: 5, x: 28, y:  2 },
                    { id: 6, x: 22, y:  5 },
                    { id: 7, x: 19, y:  2 },
                ],[
                    { id: 1, x: 19, y:  6 },
                    { id: 2, x:  8, y:  6 },
                    { id: 3, x: 19, y:  4 },
                    { id: 4, x: 18, y:  4 },
                    { id: 5, x: 27, y:  2 },
                    { id: 6, x: 23, y:  5 },
                    { id: 7, x: 19, y:  1 },
                ],[
                    { id: 1, x: 19, y:  6 },
                    { id: 2, x:  8, y:  6 },
                    { id: 3, x: 19, y:  3 },
                    { id: 4, x: 18, y:  3 },
                    { id: 5, x: 26, y:  2 },
                    { id: 6, x: 24, y:  5 },
                    { id: 7, x: 19, y:  1 },
                ],[
                    { id: 1, x: 19, y:  5 },
                    { id: 2, x:  8, y:  5 },
                    { id: 3, x: 19, y:  2 },
                    { id: 4, x: 18, y:  3 },
                    { id: 5, x: 25, y:  2 },
                    { id: 6, x: 25, y:  5 },
                    { id: 7, x: 20, y:  1 },
                ],[
                    { id: 1, x: 19, y:  4 },
                    { id: 2, x:  8, y:  4 },
                    { id: 3, x: 19, y:  1 },
                    { id: 4, x: 19, y:  3 },
                    { id: 5, x: 24, y:  2 },
                    { id: 6, x: 26, y:  5 },
                    { id: 7, x: 21, y:  1 },
                ],[
                    { id: 1, x: 19, y:  4 },
                    { id: 2, x:  8, y:  3 },
                    { id: 3, x: 19, y:  1 },
                    { id: 4, x: 19, y:  3 },
                    { id: 5, x: 23, y:  2 },
                    { id: 6, x: 27, y:  5 },
                    { id: 7, x: 22, y:  1 },
                ],[
                    { id: 1, x: 19, y:  4 },
                    { id: 2, x:  8, y:  2 },
                    { id: 3, x: 20, y:  1 },
                    { id: 4, x: 19, y:  2 },
                    { id: 5, x: 22, y:  2 },
                    { id: 6, x: 28, y:  5 },
                    { id: 7, x: 23, y:  1 },
                ],[
                    { id: 1, x: 19, y:  3 },
                    { id: 2, x:  8, y:  2 },
                    { id: 3, x: 21, y:  1 },
                    { id: 4, x: 19, y:  1 },
                    { id: 5, x: 22, y:  2 },
                    { id: 6, x: 28, y:  5 },
                    { id: 7, x: 24, y:  1 },
                ],[
                    { id: 1, x: 19, y:  2 },
                    { id: 2, x:  7, y:  2 },
                    { id: 3, x: 22, y:  1 },
                    { id: 4, x: 19, y:  1 },
                    { id: 5, x: 22, y:  2 },
                    { id: 6, x: 28, y:  4 },
                    { id: 7, x: 25, y:  1 },
                ],[
                    { id: 1, x: 19, y:  2 },
                    { id: 2, x:  6, y:  2 },
                    { id: 3, x: 23, y:  1 },
                    { id: 4, x: 20, y:  1 },
                    { id: 5, x: 23, y:  2 },
                    { id: 6, x: 28, y:  4 },
                    { id: 7, x: 25, y:  1 },
                ],[
                    { id: 1, x: 19, y:  1 },
                    { id: 2, x:  5, y:  2 },
                    { id: 3, x: 24, y:  1 },
                    { id: 4, x: 21, y:  1 },
                    { id: 5, x: 24, y:  2 },
                    { id: 6, x: 28, y:  4 },
                    { id: 7, x: 25, y:  1 },
                ],[
                    { id: 1, x: 19, y:  1 },
                    { id: 2, x:  4, y:  2 },
                    { id: 3, x: 24, y:  1 },
                    { id: 4, x: 22, y:  1 },
                    { id: 5, x: 25, y:  2 },
                    { id: 6, x: 28, y:  3 },
                    {
                        id: 7,
                        x: 26,
                        y:  1,
                        message: "7 (25, 1) touched by 3 (24, 1)",
                    },
                ],[
                    { id: 1, x: 20, y:  1 },
                    { id: 2, x:  3, y:  2 },
                    { id: 3, x: 25, y:  1 },
                    { id: 4, x: 23, y:  1 },
                    { id: 5, x: 25, y:  2 },
                    { id: 6, x: 28, y:  3 },
                    { id: 7, x: 26, y:  1 },
                ],[
                    { id: 1, x: 20, y:  1 },
                    { id: 2, x:  2, y:  2 },
                    { id: 3, x: 25, y:  1 },
                    { id: 4, x: 24, y:  1 },
                    { id: 5, x: 26, y:  2 },
                    { id: 6, x: 27, y:  3 },
                    {
                        id: 7,
                        x: 26,
                        y:  1,
                        message: "7 (26, 1) touched by 3 (25, 1)",
                    },
                ],[
                    { id: 1, x: 20, y:  1 },
                    { id: 2, x:  2, y:  2 },
                    { id: 3, x: 25, y:  1 },
                    { id: 4, x: 24, y:  1 },
                    { id: 5, x: 26, y:  2 },
                    { id: 6, x: 27, y:  3 },
                    {
                        id: 7,
                        x: 27,
                        y:  1,
                        message: "7 (26, 1) touched by 3 (25, 1)",
                    },
                ],[
                    { id: 1, x: 19, y:  1 },
                    { id: 2, x:  2, y:  3 },
                    { id: 3, x: 26, y:  1 },
                    { id: 4, x: 25, y:  1 },
                    { id: 5, x: 26, y:  2 },
                    { id: 6, x: 27, y:  2 },
                    { id: 7, x: 28, y:  1 },
                ],[
                    { id: 1, x: 18, y:  1 },
                    { id: 2, x:  2, y:  4 },
                    { id: 3, x: 27, y:  1 },
                    { id: 4, x: 26, y:  1 },
                    { id: 5, x: 26, y:  2 },
                    { id: 6, x: 27, y:  2 },
                    { id: 7, x: 28, y:  1 },
                ],[
                    { id: 1, x: 17, y:  1 },
                    { id: 2, x:  2, y:  5 },
                    { id: 3, x: 27, y:  1 },
                    { id: 4, x: 26, y:  1 },
                    { id: 5, x: 26, y:  2 },
                    { id: 6, x: 27, y:  2 },
                    {
                        id: 7,
                        x: 28,
                        y:  2,
                        message: "7 (28, 1) touched by 3 (27, 1)",
                    },
                ],[
                    { id: 1, x: 16, y:  1 },
                    { id: 2, x:  2, y:  5 },
                    { id: 3, x: 28, y:  1 },
                    { id: 4, x: 27, y:  1 },
                    { id: 5, x: 26, y:  2 },
                    { id: 6, x: 27, y:  2 },
                    { id: 7, x: 28, y:  3 },
                ],[
                    { id: 1, x: 15, y:  1 },
                    { id: 2, x:  3, y:  5 },
                    { id: 3, x: 28, y:  1 },
                    { id: 4, x: 27, y:  1 },
                    { id: 5, x: 26, y:  2 },
                    { id: 6, x: 27, y:  2 },
                    { id: 7, x: 28, y:  4 },
                ],[
                    { id: 1, x: 14, y:  1 },
                    { id: 2, x:  4, y:  5 },
                    { id: 3, x: 28, y:  2 },
                    { id: 4, x: 28, y:  1 },
                    { id: 5, x: 26, y:  2 },
                    { id: 6, x: 27, y:  2 },
                    { id: 7, x: 28, y:  5 },
                ],[
                    { id: 1, x: 13, y:  1 },
                    { id: 2, x:  5, y:  5 },
                    { id: 3, x: 28, y:  3 },
                    { id: 4, x: 28, y:  1 },
                    { id: 5, x: 26, y:  2 },
                    { id: 6, x: 27, y:  3 },
                ],[
                    { id: 1, x: 12, y:  1 },
                    { id: 2, x:  6, y:  5 },
                    { id: 3, x: 28, y:  4 },
                    { id: 4, x: 28, y:  2 },
                    { id: 5, x: 27, y:  2 },
                    { id: 6, x: 27, y:  3 },
                ],[
                    { id: 1, x: 11, y:  1 },
                    { id: 2, x:  7, y:  5 },
                    { id: 3, x: 28, y:  4 },
                    { id: 4, x: 28, y:  2 },
                    { id: 5, x: 27, y:  2 },
                    { id: 6, x: 28, y:  3 },
                ],[
                    { id: 1, x: 11, y:  1 },
                    { id: 2, x:  8, y:  5 },
                    { id: 3, x: 27, y:  4 },
                    { id: 4, x: 28, y:  2 },
                    { id: 5, x: 27, y:  2 },
                    { id: 6, x: 28, y:  3 },
                ],[
                    { id: 1, x: 11, y:  2 },
                    { id: 2, x:  8, y:  5 },
                    { id: 3, x: 26, y:  4 },
                    { id: 4, x: 28, y:  2 },
                    { id: 5, x: 27, y:  2 },
                    { id: 6, x: 28, y:  4 },
                ],[
                    { id: 1, x: 11, y:  3 },
                    { id: 2, x:  8, y:  4 },
                    { id: 3, x: 25, y:  4 },
                    { id: 4, x: 28, y:  2 },
                    { id: 5, x: 27, y:  3 },
                    { id: 6, x: 28, y:  4 },
                ],[
                    { id: 1, x: 11, y:  4 },
                    { id: 2, x:  8, y:  3 },
                    { id: 3, x: 24, y:  4 },
                    { id: 4, x: 27, y:  2 },
                    { id: 5, x: 27, y:  3 },
                    { id: 6, x: 28, y:  4 },
                ],[
                    { id: 1, x: 11, y:  5 },
                    { id: 2, x:  8, y:  2 },
                    { id: 3, x: 23, y:  4 },
                    { id: 4, x: 26, y:  2 },
                    { id: 5, x: 28, y:  3 },
                    { id: 6, x: 28, y:  4 },
                ],[
                    { id: 1, x: 11, y:  6 },
                    { id: 2, x:  8, y:  2 },
                    { id: 3, x: 22, y:  4 },
                    { id: 4, x: 25, y:  2 },
                    { id: 5, x: 28, y:  3 },
                    { id: 6, x: 28, y:  4 },
                ],[
                    { id: 1, x: 11, y:  6 },
                    { id: 2, x:  7, y:  2 },
                    { id: 3, x: 21, y:  4 },
                    { id: 4, x: 24, y:  2 },
                    { id: 5, x: 28, y:  3 },
                    { id: 6, x: 28, y:  4 },
                ],[
                    { id: 1, x: 10, y:  6 },
                    { id: 2, x:  6, y:  2 },
                    { id: 3, x: 21, y:  4 },
                    { id: 4, x: 23, y:  2 },
                    { id: 5, x: 28, y:  3 },
                    { id: 6, x: 29, y:  4 },
                ],[
                    { id: 1, x:  9, y:  6 },
                    { id: 2, x:  5, y:  2 },
                    { id: 3, x: 21, y:  3 },
                    { id: 4, x: 22, y:  2 },
                    { id: 5, x: 28, y:  4 },
                    { id: 6, x: 29, y:  4 },
                ],[
                    { id: 1, x:  8, y:  6 },
                    { id: 2, x:  4, y:  2 },
                    { id: 3, x: 21, y:  2 },
                    { id: 4, x: 22, y:  2 },
                    { id: 5, x: 28, y:  4 },
                    { id: 6, x: 29, y:  4 },
                ],[
                    { id: 1, x:  8, y:  6 },
                    { id: 2, x:  3, y:  2 },
                    { id: 3, x: 21, y:  1 },
                    { id: 4, x: 21, y:  2 },
                    { id: 5, x: 27, y:  4 },
                    { id: 6, x: 28, y:  4 },
                ],[
                    { id: 1, x:  8, y:  5 },
                    { id: 2, x:  2, y:  2 },
                    { id: 3, x: 21, y:  1 },
                    { id: 4, x: 21, y:  2 },
                    { id: 5, x: 26, y:  4 },
                    { id: 6, x: 28, y:  4 },
                ],[
                    { id: 1, x:  8, y:  4 },
                    { id: 2, x:  2, y:  2 },
                    { id: 3, x: 20, y:  1 },
                    { id: 4, x: 21, y:  1 },
                    { id: 5, x: 25, y:  4 },
                    { id: 6, x: 28, y:  3 },
                ],[
                    { id: 1, x:  8, y:  3 },
                    { id: 2, x:  2, y:  3 },
                    { id: 3, x: 19, y:  1 },
                    { id: 4, x: 21, y:  1 },
                    { id: 5, x: 24, y:  4 },
                    { id: 6, x: 28, y:  2 },
                ],[
                    { id: 1, x:  8, y:  2 },
                    { id: 2, x:  2, y:  4 },
                    { id: 3, x: 18, y:  1 },
                    { id: 4, x: 20, y:  1 },
                    { id: 5, x: 23, y:  4 },
                    { id: 6, x: 28, y:  2 },
                ],[
                    { id: 1, x:  8, y:  2 },
                    { id: 2, x:  2, y:  5 },
                    { id: 3, x: 17, y:  1 },
                    { id: 4, x: 19, y:  1 },
                    { id: 5, x: 22, y:  4 },
                    { id: 6, x: 27, y:  2 },
                ],[
                    { id: 1, x:  7, y:  2 },
                    { id: 2, x:  2, y:  5 },
                    { id: 3, x: 16, y:  1 },
                    { id: 4, x: 18, y:  1 },
                    { id: 5, x: 22, y:  4 },
                    { id: 6, x: 26, y:  2 },
                ],[
                    { id: 1, x:  6, y:  2 },
                    { id: 2, x:  3, y:  5 },
                    { id: 3, x: 15, y:  1 },
                    { id: 4, x: 17, y:  1 },
                    { id: 5, x: 22, y:  3 },
                    { id: 6, x: 25, y:  2 },
                ],[
                    { id: 1, x:  5, y:  2 },
                    { id: 2, x:  4, y:  5 },
                    { id: 3, x: 14, y:  1 },
                    { id: 4, x: 16, y:  1 },
                    { id: 5, x: 22, y:  2 },
                    { id: 6, x: 24, y:  2 },
                ],[
                    { id: 1, x:  4, y:  2 },
                    { id: 2, x:  5, y:  5 },
                    { id: 3, x: 13, y:  1 },
                    { id: 4, x: 15, y:  1 },
                    { id: 5, x: 22, y:  2 },
                    { id: 6, x: 23, y:  2 },
                ],[
                    { id: 1, x:  3, y:  2 },
                    { id: 2, x:  6, y:  5 },
                    { id: 3, x: 12, y:  1 },
                    { id: 4, x: 14, y:  1 },
                    { id: 5, x: 22, y:  2 },
                    { id: 6, x: 23, y:  2 },
                ],[
                    { id: 1, x:  2, y:  2 },
                    { id: 2, x:  7, y:  5 },
                    { id: 3, x: 12, y:  1 },
                    { id: 4, x: 14, y:  1 },
                    { id: 5, x: 22, y:  3 },
                    { id: 6, x: 22, y:  2 },
                ],[
                    { id: 1, x:  2, y:  2 },
                    { id: 2, x:  8, y:  5 },
                    { id: 3, x: 12, y:  2 },
                    { id: 4, x: 14, y:  2 },
                    { id: 5, x: 22, y:  4 },
                    { id: 6, x: 22, y:  2 },
                ],[
                    { id: 1, x:  2, y:  3 },
                    { id: 2, x:  8, y:  5 },
                    { id: 3, x: 12, y:  2 },
                    { id: 4, x: 14, y:  3 },
                    { id: 5, x: 22, y:  5 },
                    { id: 6, x: 22, y:  3 },
                ],[
                    { id: 1, x:  2, y:  4 },
                    { id: 2, x:  8, y:  4 },
                    { id: 3, x: 13, y:  2 },
                    { id: 4, x: 14, y:  4 },
                    { id: 5, x: 22, y:  5 },
                    { id: 6, x: 22, y:  4 },
                ],[
                    { id: 1, x:  2, y:  5 },
                    { id: 2, x:  8, y:  3 },
                    { id: 3, x: 14, y:  2 },
                    { id: 4, x: 14, y:  4 },
                    { id: 5, x: 23, y:  5 },
                    { id: 6, x: 22, y:  5 },
                ],[
                    { id: 1, x:  2, y:  5 },
                    { id: 2, x:  8, y:  2 },
                    { id: 3, x: 15, y:  2 },
                    { id: 4, x: 13, y:  4 },
                    { id: 5, x: 24, y:  5 },
                    { id: 6, x: 22, y:  5 },
                ],[
                    { id: 1, x:  3, y:  5 },
                    { id: 2, x:  8, y:  2 },
                    { id: 3, x: 16, y:  2 },
                    { id: 4, x: 12, y:  4 },
                    { id: 5, x: 25, y:  5 },
                    { id: 6, x: 23, y:  5 },
                ],[
                    { id: 1, x:  4, y:  5 },
                    { id: 2, x:  7, y:  2 },
                    { id: 3, x: 17, y:  2 },
                    { id: 4, x: 12, y:  4 },
                    { id: 5, x: 26, y:  5 },
                    { id: 6, x: 24, y:  5 },
                ],[
                    { id: 1, x:  5, y:  5 },
                    { id: 2, x:  6, y:  2 },
                    { id: 3, x: 18, y:  2 },
                    { id: 4, x: 12, y:  5 },
                    { id: 5, x: 27, y:  5 },
                    { id: 6, x: 25, y:  5 },
                ],[
                    { id: 1, x:  6, y:  5 },
                    { id: 2, x:  5, y:  2 },
                    { id: 3, x: 18, y:  2 },
                    { id: 4, x: 12, y:  5 },
                    { id: 5, x: 28, y:  5 },
                    { id: 6, x: 26, y:  5 },
                ],[
                    { id: 1, x:  7, y:  5 },
                    { id: 2, x:  4, y:  2 },
                    { id: 3, x: 18, y:  3 },
                    { id: 4, x: 12, y:  5 },
                    { id: 5, x: 28, y:  5 },
                    { id: 6, x: 27, y:  5 },
                ],[
                    { id: 1, x:  8, y:  5 },
                    { id: 2, x:  3, y:  2 },
                    { id: 3, x: 18, y:  4 },
                    { id: 4, x: 12, y:  4 },
                    { id: 5, x: 28, y:  4 },
                    { id: 6, x: 28, y:  5 },
                ],[
                    { id: 1, x:  8, y:  5 },
                    { id: 2, x:  2, y:  2 },
                    { id: 3, x: 18, y:  5 },
                    { id: 4, x: 12, y:  3 },
                    { id: 5, x: 28, y:  3 },
                    { id: 6, x: 28, y:  5 },
                ],[
                    { id: 1, x:  8, y:  4 },
                    { id: 2, x:  2, y:  2 },
                    { id: 3, x: 18, y:  5 },
                    { id: 4, x: 12, y:  2 },
                    { id: 5, x: 28, y:  2 },
                    { id: 6, x: 28, y:  4 },
                ],[
                    { id: 1, x:  8, y:  3 },
                    { id: 2, x:  2, y:  3 },
                    { id: 3, x: 17, y:  5 },
                    { id: 4, x: 12, y:  2 },
                    { id: 5, x: 28, y:  2 },
                    { id: 6, x: 28, y:  3 },
                ],[
                    { id: 1, x:  8, y:  2 },
                    { id: 2, x:  2, y:  4 },
                    { id: 3, x: 16, y:  5 },
                    { id: 4, x: 13, y:  2 },
                    { id: 5, x: 27, y:  2 },
                    { id: 6, x: 28, y:  2 },
                ],[
                    { id: 1, x:  8, y:  2 },
                    { id: 2, x:  2, y:  5 },
                    { id: 3, x: 15, y:  5 },
                    { id: 4, x: 14, y:  2 },
                    { id: 5, x: 26, y:  2 },
                    { id: 6, x: 28, y:  2 },
                ],[
                    { id: 1, x:  7, y:  2 },
                    { id: 2, x:  2, y:  5 },
                    { id: 3, x: 14, y:  5 },
                    { id: 4, x: 15, y:  2 },
                    { id: 5, x: 25, y:  2 },
                    { id: 6, x: 27, y:  2 },
                ],[
                    { id: 1, x:  6, y:  2 },
                    { id: 2, x:  3, y:  5 },
                    { id: 3, x: 13, y:  5 },
                    { id: 4, x: 16, y:  2 },
                    { id: 5, x: 24, y:  2 },
                    { id: 6, x: 26, y:  2 },
                ],[
                    { id: 1, x:  5, y:  2 },
                    { id: 2, x:  4, y:  5 },
                    { id: 3, x: 12, y:  5 },
                    { id: 4, x: 17, y:  2 },
                    { id: 5, x: 23, y:  2 },
                    { id: 6, x: 25, y:  2 },
                ],[
                    { id: 1, x:  4, y:  2 },
                    { id: 2, x:  5, y:  5 },
                    { id: 3, x: 12, y:  5 },
                    { id: 4, x: 18, y:  2 },
                    { id: 5, x: 22, y:  2 },
                    { id: 6, x: 24, y:  2 },
                ],[
                    { id: 1, x:  3, y:  2 },
                    { id: 2, x:  6, y:  5 },
                    { id: 3, x: 12, y:  4 },
                    { id: 4, x: 18, y:  2 },
                    { id: 5, x: 22, y:  2 },
                    { id: 6, x: 23, y:  2 },
                ],[
                    { id: 1, x:  2, y:  2 },
                    { id: 2, x:  7, y:  5 },
                    { id: 3, x: 12, y:  3 },
                    { id: 4, x: 18, y:  3 },
                    { id: 5, x: 22, y:  3 },
                    { id: 6, x: 22, y:  2 },
                ],[
                    { id: 1, x:  2, y:  2 },
                    { id: 2, x:  8, y:  5 },
                    { id: 3, x: 12, y:  2 },
                    { id: 4, x: 18, y:  4 },
                    { id: 5, x: 22, y:  4 },
                    { id: 6, x: 22, y:  2 },
                ],[
                    { id: 1, x:  2, y:  3 },
                    { id: 2, x:  8, y:  5 },
                    { id: 3, x: 12, y:  2 },
                    { id: 4, x: 18, y:  5 },
                    { id: 5, x: 22, y:  5 },
                    { id: 6, x: 22, y:  3 },
                ],[
                    { id: 1, x:  2, y:  4 },
                    { id: 2, x:  8, y:  4 },
                    { id: 3, x: 13, y:  2 },
                    { id: 4, x: 18, y:  5 },
                    { id: 5, x: 22, y:  5 },
                    { id: 6, x: 22, y:  4 },
                ],[
                    { id: 1, x:  2, y:  5 },
                    { id: 2, x:  8, y:  3 },
                    { id: 3, x: 14, y:  2 },
                    { id: 4, x: 17, y:  5 },
                    { id: 5, x: 23, y:  5 },
                    { id: 6, x: 22, y:  5 },
                ],[
                    { id: 1, x:  2, y:  5 },
                    { id: 2, x:  8, y:  2 },
                    { id: 3, x: 15, y:  2 },
                    { id: 4, x: 16, y:  5 },
                    { id: 5, x: 24, y:  5 },
                    { id: 6, x: 22, y:  5 },
                ],[
                    { id: 1, x:  3, y:  5 },
                    { id: 2, x:  8, y:  2 },
                    { id: 3, x: 16, y:  2 },
                    { id: 4, x: 15, y:  5 },
                    { id: 5, x: 25, y:  5 },
                    { id: 6, x: 23, y:  5 },
                ],[
                    { id: 1, x:  4, y:  5 },
                    { id: 2, x:  7, y:  2 },
                    { id: 3, x: 17, y:  2 },
                    { id: 4, x: 14, y:  5 },
                    { id: 5, x: 26, y:  5 },
                    { id: 6, x: 24, y:  5 },
                ],[
                    { id: 1, x:  5, y:  5 },
                    { id: 2, x:  6, y:  2 },
                    { id: 3, x: 18, y:  2 },
                    { id: 4, x: 13, y:  5 },
                    { id: 5, x: 27, y:  5 },
                    { id: 6, x: 25, y:  5 },
                ],[
                    { id: 1, x:  6, y:  5 },
                    { id: 2, x:  5, y:  2 },
                    { id: 3, x: 18, y:  2 },
                    { id: 4, x: 12, y:  5 },
                    { id: 5, x: 28, y:  5 },
                    { id: 6, x: 26, y:  5 },
                ],[
                    { id: 1, x:  7, y:  5 },
                    { id: 2, x:  4, y:  2 },
                    { id: 3, x: 18, y:  3 },
                    { id: 4, x: 12, y:  5 },
                    { id: 5, x: 28, y:  5 },
                    { id: 6, x: 27, y:  5 },
                ],[
                    { id: 1, x:  8, y:  5 },
                    { id: 2, x:  3, y:  2 },
                    { id: 3, x: 18, y:  4 },
                    { id: 4, x: 12, y:  4 },
                    { id: 5, x: 28, y:  4 },
                    { id: 6, x: 28, y:  5 },
                ],[
                    { id: 1, x:  8, y:  5 },
                    { id: 2, x:  2, y:  2 },
                    { id: 3, x: 18, y:  5 },
                    { id: 4, x: 12, y:  3 },
                    { id: 5, x: 28, y:  3 },
                    { id: 6, x: 28, y:  5 },
                ],[
                    { id: 1, x:  8, y:  4 },
                    { id: 2, x:  2, y:  2 },
                    { id: 3, x: 18, y:  5 },
                    { id: 4, x: 12, y:  2 },
                    { id: 5, x: 28, y:  2 },
                    { id: 6, x: 28, y:  4 },
                ],[
                    { id: 1, x:  8, y:  3 },
                    { id: 2, x:  2, y:  3 },
                    { id: 3, x: 17, y:  5 },
                    { id: 4, x: 12, y:  2 },
                    { id: 5, x: 28, y:  2 },
                    { id: 6, x: 28, y:  3 },
                ],[
                    { id: 1, x:  8, y:  2 },
                    { id: 2, x:  2, y:  4 },
                    { id: 3, x: 16, y:  5 },
                    { id: 4, x: 13, y:  2 },
                    { id: 5, x: 27, y:  2 },
                    { id: 6, x: 28, y:  2 },
                ],[
                    { id: 1, x:  8, y:  2 },
                    { id: 2, x:  2, y:  5 },
                    { id: 3, x: 15, y:  5 },
                    { id: 4, x: 14, y:  2 },
                    { id: 5, x: 26, y:  2 },
                    { id: 6, x: 28, y:  2 },
                ],[
                    { id: 1, x:  7, y:  2 },
                    { id: 2, x:  2, y:  5 },
                    { id: 3, x: 14, y:  5 },
                    { id: 4, x: 15, y:  2 },
                    { id: 5, x: 25, y:  2 },
                    { id: 6, x: 27, y:  2 },
                ],[
                    { id: 1, x:  6, y:  2 },
                    { id: 2, x:  3, y:  5 },
                    { id: 3, x: 13, y:  5 },
                    { id: 4, x: 16, y:  2 },
                    { id: 5, x: 24, y:  2 },
                    { id: 6, x: 26, y:  2 },
                ],[
                    { id: 1, x:  5, y:  2 },
                    { id: 2, x:  4, y:  5 },
                    { id: 3, x: 12, y:  5 },
                    { id: 4, x: 17, y:  2 },
                    { id: 5, x: 23, y:  2 },
                    { id: 6, x: 25, y:  2 },
                ],[
                    { id: 1, x:  4, y:  2 },
                    { id: 2, x:  5, y:  5 },
                    { id: 3, x: 12, y:  5 },
                    { id: 4, x: 18, y:  2 },
                    { id: 5, x: 22, y:  2 },
                    { id: 6, x: 24, y:  2 },
                ],[
                    { id: 1, x:  3, y:  2 },
                    { id: 2, x:  6, y:  5 },
                    { id: 3, x: 12, y:  4 },
                    { id: 4, x: 18, y:  2 },
                    { id: 5, x: 22, y:  2 },
                    { id: 6, x: 23, y:  2 },
                ],[
                    { id: 1, x:  2, y:  2 },
                    { id: 2, x:  7, y:  5 },
                    { id: 3, x: 12, y:  3 },
                    { id: 4, x: 18, y:  3 },
                    { id: 5, x: 22, y:  3 },
                    { id: 6, x: 22, y:  2 },
                ],[
                    { id: 1, x:  2, y:  2 },
                    { id: 2, x:  8, y:  5 },
                    { id: 3, x: 12, y:  2 },
                    { id: 4, x: 18, y:  4 },
                    { id: 5, x: 22, y:  4 },
                    { id: 6, x: 22, y:  2 },
                ],[
                    { id: 1, x:  2, y:  3 },
                    { id: 2, x:  8, y:  5 },
                    { id: 3, x: 12, y:  2 },
                    { id: 4, x: 18, y:  5 },
                    { id: 5, x: 22, y:  5 },
                    { id: 6, x: 22, y:  3 },
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
