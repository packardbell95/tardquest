// Tests MapEntity management within a GameMap
function GameMap_mapEntityManagement()
{
    const testMap = new GameMap(50, 40);
    testMap.fill(0, 0, 22, 12, "wall");
    testMap.fill(1, 1, 21, 11, "floor");

    const mapEntities = [];
    const wanderingKoboldParty = [];

    wanderingKoboldParty.push(
        PartyMemberBuilder("Kutt")
            .addStats(
                {
                    hp: 20,
                    maxHp: 20,
                    defense: 4,
                    strength: 3,
                    persuasion: 0,
                    endurance: 3,
                    speed: 5,
                    luck: 2,
                },
                {
                    level: 2,
                    experience: 0,
                }
            )
            .addVoice(20, 40, 30, 80)
            .build()
    );

    wanderingKoboldParty.push(
        PartyMemberBuilder("Dehsa")
            .addStats(
                {
                    hp: 18,
                    maxHp: 19,
                    defense: 3,
                    strength: 2,
                    persuasion: 1,
                    endurance: 4,
                    speed: 7,
                    luck: 3,
                },
                {
                    level: 1,
                    experience: 122,
                }
            )
            .addVoice(22, 41, 27, 73)
            .build()
    );

    mapEntities.push(MapEntityBuilder("wanderingKobold", 1, 1));
    mapEntities.push(MapEntityBuilder("treasureChest", 14, 7));

    const wanderingBeholderParty = [];

    wanderingBeholderParty.push(
        PartyMemberBuilder("Os")
            .addStats(
                {
                    hp: 114,
                    maxHp: 114,
                    defense: 16,
                    strength: 20,
                    persuasion: 0,
                    endurance: 9,
                    speed: 5,
                    luck: 1,
                },
                {
                    level: 14,
                    experience: 48841,
                }
            )
            .build()
    );

    mapEntities.push(MapEntityBuilder("wanderingBeholder", 19, 9));

    test(
        "No entities have been set",
        () => Assert.deepEquals([], testMap.entities),
        renderGameMapPoints(testMap)
    );

    testMap.setEntities(mapEntities);

    test(
        "Entities have been set",
        () => Assert.deepEquals(mapEntities, testMap.entities),
        renderGameMapPoints(testMap)
    );

    const key = 1;
    const expectedEntities = [ ...mapEntities].filter((e, i) => i !== key);

    testMap.entities[key].isActive = false;
    testMap.clearDeactivatedEntities();

    test(
        "Entities can be deactivated and removed",
        () => Assert.deepEquals(expectedEntities, testMap.entities),
        renderGameMapPoints(testMap)
    );
}
