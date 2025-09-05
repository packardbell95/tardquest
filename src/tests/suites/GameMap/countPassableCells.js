// Tests for GameMap.countPassableCells()
function GameMap_countPassableCells()
{
    const impassibleMap = new GameMap();
    impassibleMap.fill(0, 0, 20, 20, "wall");

    const passableMap = new GameMap();
    passableMap.fill(0, 0, 20, 20, "floor");

    test(
        "Count passable cells",
        () => {
            Assert.equals(
                0,
                impassibleMap.countPassableCells(),
                "A map of all walls has no passable cells"
            );

            Assert.equals(
                400,
                passableMap.countPassableCells(),
                "A 20x20 map of all floors has 400 passable cells"
            );
        },
    );
}
