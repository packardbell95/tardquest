// Cooperative pathfinding test
// This scenario is based on Figure 1 of the Cooperative Pathfinding paper:
// https://cdn.aaai.org/ojs/18726/18726-52-22369-1-10-20210928.pdf
//
// ⚠️ This test is currently incomplete because it requires collision feedback
// heuristics to solve the pathing conflict
function EntityMovementPlanner_cooperativePathfindingTest()
{
    const testMap = new GameMap(9, 9);
    testMap.fill(0, 0, testMap.width, testMap.height, "wall");
    testMap.line(4, 1, 4, 7, { cellType: "floor" });
    testMap.setCell(3, 4, "floor");

    testMap.addEntity(BuildMapEntityLemming(), 4, 1, 2);
    testMap.entities[0].setTarget(4, 6);

    testMap.addEntity(BuildMapEntityLemming(), 4, 7, 0);
    testMap.entities[0].setTarget(4, 2);

    const movements = [];
    movements.push(testMap.entities.map(e => ({
        id: e.id,
        x: e.x,
        y: e.y,
        direction: e.direction,
        displayCharacter: e.id < 9
            ? undefined
            : ["⬆️", "➡️", "⬇️", "⬅️"][e.direction % 4]
    })));

    for (let i = 0; i < 10; i++) {
        testMap.moveEntities();
        movements.push(testMap.entities.map(e => ({
            id: e.id,
            x: e.x,
            y: e.y,
            direction: e.direction,
            displayCharacter: e.id < 9
                ? undefined
                : ["⬆️", "➡️", "⬇️", "⬅️"][e.direction % 4]
        })));
    }

    test(
        "Test Cooperative Pathfinding in a Narrow Hallway",
        () => Assert.isTrue(true, "The placeholder exists"),
        renderMovementContext(testMap, movements),
        true
    );
}
