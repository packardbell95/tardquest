// Tests MapEntity inventory management
// @TODO See if this test is even functional anymore. Party members aren't used
function GameMap_mapEntityInventoryManagement()
{
    const testMap = new GameMap(50, 40);
    testMap.fill(0, 0, 12, 22, "wall");
    testMap.fill(1, 1, 11, 21, "floor");

    const wanderingImpParty = [];

    wanderingImpParty.push(
        PartyMemberBuilder("Crex")
            .addStats(
                {
                    hp: 10,
                    maxHp: 12,
                    defense: 4,
                    strength: 4,
                    persuasion: 0,
                    endurance: 5,
                    speed: 4,
                    luck: 3,
                },
                {
                    level: 3,
                    experience: 1132,
                }
            )
            .addVoice(13, 66, 17, 22)
            .build()
    );

    wanderingImpParty.push(
        PartyMemberBuilder("Yap")
            .addStats(
                {
                    hp: 14,
                    maxHp: 14,
                    defense: 3,
                    strength: 5,
                    persuasion: 1,
                    endurance: 3,
                    speed: 6,
                    luck: 4,
                },
                {
                    level: 2,
                    experience: 967,
                }
            )
            .addVoice(16, 59, 21, 28)
            .build()
    );

    testMap.addEntity(MapEntityBuilder("wanderingImp"), 1, 1);
    testMap.addEntity(MapEntityBuilder("treasureChest"), 14, 7);

    test(
        "No inventory has been set",
        () => {
            for (const entity of testMap.entities) {
                Assert.deepEquals({}, entity.inventory);
            }
        }
    );

    test(
        "Entity has inventory set",
        () => {
            itemId = "tumbleweed";
            Assert.isFalse(testMap.entities[0].inventoryIncludes(itemId));

            const quantity = 7;
            testMap.entities[0].inventoryAdd(itemId, quantity);
            Assert.isTrue(testMap.entities[0].inventoryIncludes(itemId));
            Assert.isTrue(
                testMap.entities[0].inventoryIncludes(itemId, quantity)
            );
            Assert.isFalse(
                testMap.entities[0].inventoryIncludes(itemId, quantity + 1)
            );
        }
    );
}
