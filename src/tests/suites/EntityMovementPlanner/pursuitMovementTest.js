"use strict";

// Testing persuit movement behavior
function EntityMovementPlanner_pursuitMovementTest()
{
    const gameMap = new GameMap(31, 16);
    gameMap.fill(0, 0, gameMap.width, gameMap.height, "wall");
    gameMap.fill(1, 1, gameMap.width - 1, gameMap.height - 1, "floor");
    gameMap.line(10, 1, 10, 5, "wall");
    gameMap.line(20, 2, 20, 6, "wall");
    gameMap.fill(14, 2, 17, 5, "wall");
    gameMap.setCell(15, 3, "floor");

    const commonSettings = {
        objectsOfInterest: ["runner"],
        // Overrides the turn decision mechanism to make behavior predictable
        preferLeftTurnFirst: true,
    };

    const prisoner = {
        ...MapEntityBuilder("prisoner"),
        id: 3,
        preferLeftTurnFirst: true,
    };
    MapEntityTrait_AttachMovement_Pursue(prisoner);
    prisoner.targetEntity(2);

    const prisonerPartyMember = PartyMemberBuilder("Prisoner", {
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
    prisoner.addPartyMember(prisonerPartyMember);
    gameMap.addEntity(prisoner, 15, 3, 0);

    const fanatic = {
        ...MapEntityBuilder("fanatic"),
        id: 1,
        preferLeftTurnFirst: true,
    };
    MapEntityTrait_AttachMovement_Pursue(fanatic);
    fanatic.targetEntity(2);

    const fanaticPartyMember = PartyMemberBuilder("Fanatic", {
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
    fanatic.addPartyMember(fanaticPartyMember);
    gameMap.addEntity(fanatic, 2, 13, 2);

    const movements = [];
    movements.push(gameMap.entities.map(e => ({
        id: e.id,
        x: e.x,
        y: e.y,
        direction: e.direction,
    })));



    const runner = {
        ...MapEntityBuilder("runner"),
        id: 2,
        output: [],
        preferLeftTurnFirst: true,
        onTouch: function(gameMap, touchedBy) {
            console.log("🏃‍♂️ Runner touched", { touchedBy });
            this.message =
                `${this.id} (${ this.x }, ${ this.y }) touched by ` +
                `${touchedBy.id} (${ touchedBy.x }, ${ touchedBy.y })`;
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
    gameMap.addEntity(runner, 2, 1, 2);

    for (let i = 0; i < 42; i++) {
        if (i === 24) {
            gameMap.entities[0].isHastyMove = function() {
                return true;
            };
        }

        gameMap.moveEntities();
        movements.push(gameMap.entities.map(e => ({
            id: e.id,
            x: e.x,
            y: e.y,
            direction: e.direction,
            displayCharacter: e.id !== runner.id
                ? undefined
                : ["⬆️", "➡️", "⬇️", "⬅️"][e.direction % 4],
            message: e.id === runner.id && runner.message || undefined,
        })));

        delete runner.message;
    }

    test(
        "Pursuit Movement Test",
        () => {
            const expectedPositions = [
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  2, y: 13 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  2, y: 13 },
                    { id: 2, x:  2, y:  1 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  2, y: 13 },
                    { id: 2, x:  3, y:  1 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  2, y: 13 },
                    { id: 2, x:  4, y:  1 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  2, y: 13 },
                    { id: 2, x:  5, y:  1 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  2, y: 13 },
                    { id: 2, x:  6, y:  1 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  2, y: 13 },
                    { id: 2, x:  7, y:  1 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  3, y: 13 },
                    { id: 2, x:  8, y:  1 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  4, y: 13 },
                    { id: 2, x:  9, y:  1 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  5, y: 13 },
                    { id: 2, x:  9, y:  1 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  6, y: 13 },
                    { id: 2, x:  9, y:  2 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  7, y: 13 },
                    { id: 2, x:  9, y:  3 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  7, y: 13 },
                    { id: 2, x:  9, y:  4 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  7, y: 12 },
                    { id: 2, x:  9, y:  5 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  7, y: 11 },
                    { id: 2, x:  9, y:  6 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  7, y: 11 },
                    { id: 2, x:  9, y:  6 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  8, y: 11 },
                    { id: 2, x: 10, y:  6 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x:  9, y: 11 },
                    { id: 2, x: 11, y:  6 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 10, y: 11 },
                    { id: 2, x: 12, y:  6 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 11, y: 11 },
                    { id: 2, x: 13, y:  6 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 12, y: 11 },
                    { id: 2, x: 14, y:  6 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 13, y: 11 },
                    { id: 2, x: 15, y:  6 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 14, y: 11 },
                    { id: 2, x: 16, y:  6 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 15, y: 11 },
                    { id: 2, x: 17, y:  6 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 16, y: 11 },
                    { id: 2, x: 18, y:  6 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 17, y: 11 },
                    { id: 2, x: 19, y:  6 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 18, y: 11 },
                    { id: 2, x: 19, y:  6 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 19, y: 11 },
                    { id: 2, x: 19, y:  7 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 19, y: 11 },
                    { id: 2, x: 19, y:  7 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 19, y: 10 },
                    { id: 2, x: 20, y:  7 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 19, y:  9 },
                    { id: 2, x: 21, y:  7 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 19, y:  9 },
                    { id: 2, x: 22, y:  7 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 20, y:  9 },
                    { id: 2, x: 23, y:  7 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 21, y:  9 },
                    { id: 2, x: 24, y:  7 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 22, y:  9 },
                    { id: 2, x: 25, y:  7 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 23, y:  9 },
                    { id: 2, x: 26, y:  7 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 24, y:  9 },
                    { id: 2, x: 27, y:  7 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 25, y:  9 },
                    { id: 2, x: 28, y:  7 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 26, y:  9 },
                    { id: 2, x: 28, y:  7 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 27, y:  9 },
                    { id: 2, x: 28, y:  6 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 28, y:  9 },
                    { id: 2, x: 28, y:  5 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 28, y:  9 },
                ],
                [
                    { id: 3, x: 15, y:  3 },
                    { id: 1, x: 28, y:  8 },
                ]
            ];

            const positions = movements.map(e =>
                e.map(p =>({ id: p.id, x: p.x, y: p.y, message: p.message }))
            );

            Assert.deepEquals(expectedPositions, positions);
        },
        renderMovementContext(gameMap, movements)
    );
}
