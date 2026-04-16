"use strict";

const TardQuestMapGenerator = {
    generateRandomLayout: function() {
        let layout = [
            MapGenerator.generate.agentBasedDungeonGrowing,
            MapGenerator.generate
                .agentBasedDungeonGrowingWithoutIntersectingRooms,
            MapGenerator.generate.spatialExpansionDungeonGrowing,
            MapGenerator.generate.partitionBasedDungeonGeneration
        ][Math.floor(Math.random() * 4)]();

        const dissolutionPercentage = 50 + (Math.floor(Math.random() * 6) * 10);
        layout = MapGenerator.modify.dissolve(layout, dissolutionPercentage);

        switch (Math.floor(Math.random() * 5)) {
            case 0:
                return MapGenerator.modify.rotate(layout);
            case 1:
                return MapGenerator.modify.flipHorizontally(layout);
            case 2:
                return MapGenerator.modify.flipVertically(layout);
            default:
                return layout;
        }
    },

    applyLayout: function(gameMap, layout) {
        for (let y = 0; y < gameMap.height; y++) {
            for (let x = 0; x < gameMap.width; x++) {
                const type = layout[y]?.[x] ?? true ? "wall" : "floor";
                gameMap.setCell(x, y, type, { isExplored: false });
            }
        }
    },

    identifyOppositeRegions: function (regions) {
        const centers = regions.map(region => ({
            region,
            center: {
                x: (region.start.x + region.end.x) / 2,
                y: (region.start.y + region.end.y) / 2,
            },
        }));

        let bestDistance = -Infinity;
        let bestPair = null;

        for (let i = 0; i < centers.length; i++) {
            for (let j = i + 1; j < centers.length; j++) {
                const dx = centers[i].center.x - centers[j].center.x;
                const dy = centers[i].center.y - centers[j].center.y;
                const distance = Math.hypot(dx, dy);

                if (distance > bestDistance) {
                    bestDistance = distance;
                    bestPair = [ centers[i].region, centers[j].region ];
                }
            }
        }

        console.log("identifyOppositeRegions()", { regions, bestPair });

        return bestPair;
    },

    generate: function(gameMap, floor) {
        gameMap.filterEntities(["player"]);

        const floorLayout = this.generateRandomLayout();
        this.applyLayout(gameMap, floorLayout);

        const regions = MapGenerator.regions.identify(floorLayout);
        console.log("Identified regions", { regions, floorLayout });

        // @TODO Handle cases where one region is identified due to the floor
        // being basically one big empty square
        const oppositeRegions = this.identifyOppositeRegions(regions);

        // @TODO Handle the small chance of oppositeRegions actually being null
        if (oppositeRegions === null) {
            console.error("Could not identify opposite regions!", { regions });
            return;
        }

        const player = gameMap.entities.find(e => e.type === "player");
        if (! player) {
            console.error(
                "Player entity not found!",
                { entities: gameMap.entities }
            );
            return;
        }

        // Place player and exit at opposite regions
        const playerRegion = oppositeRegions[0];
        const exitRegion = oppositeRegions[1];

        player.x = playerRegion.start.x + Math.floor(
            Math.random() * (playerRegion.end.x - playerRegion.start.x)
        );
        player.y = playerRegion.start.y + Math.floor(
            Math.random() * (playerRegion.end.y - playerRegion.start.y)
        );
        playerRegion.occupied = true;

        gameMap.revealFieldOfView(
            player.x,
            player.y,
            player.leader.getEffectiveTrait("sightRange")
        );

        // Putting the exit placement in a loop in case the exit is put on the
        // same space as the player
        let exitX, exitY;

        for (let circuitBreaker = 0; circuitBreaker < 100; circuitBreaker++) {
            exitX = exitRegion.start.x + Math.floor(
                Math.random() * (exitRegion.end.x - exitRegion.start.x)
            );
            exitY = exitRegion.start.y + Math.floor(
                Math.random() * (exitRegion.end.y - exitRegion.start.y)
            );

            if (exitX !== player.x || exitY !== player.y) {
                break;
            }
        }

        const exitEntity = MapEntityFeatureFactory.exit(exitX, exitY);
        console.log({ x: exitX, y: exitY, exitEntity });

        gameMap.addEntity(exitEntity);
        exitRegion.occupied = true;

        let sigilPlaced = false;

        // @TODO This sometimes doesn't run which stops enemies from appearing
        for (const region of regions) {
            if (region?.occupied) {
                continue;
            }

            // @TODO Update this later since all enemies patrol for now
            const regionEnemyA = MapEntityEnemyFactory
                .randomEnemy(floor, region.start.x, region.start.y, 1);
            regionEnemyA.setPatrolPoints(gameMap, [
                { x: region.start.x, y: region.start.y },
                { x: region.end.x, y: region.start.y },
                { x: region.end.x, y: region.end.y },
                { x: region.start.x, y: region.end.y },
            ]);
            gameMap.addEntity(regionEnemyA);

            const regionEnemyB = MapEntityEnemyFactory
                .randomEnemy(floor, region.end.x, region.end.y, 2);
            regionEnemyB.setPatrolPoints(gameMap, [
                { x: region.end.x, y: region.end.y },
                { x: region.start.x, y: region.end.y },
                { x: region.start.x, y: region.start.y },
                { x: region.end.x, y: region.start.y },
            ]);
            gameMap.addEntity(regionEnemyB);

            if (! sigilPlaced && Math.random() < 0.5) {
                const x = region.start.x +
                    Math.round(region.end.x - region.start.x);
                const y = region.start.y +
                    Math.round(region.end.y - region.start.y);

                this._placeVampireSummoningSigil(gameMap, x, y);
                console.log("✡️ Sigil placed", { x, y });

                sigilPlaced = true;
            }
        }

        /**
            if (pigeon.checkForMessages()) {
                pigeon.isActiveOnFloor = true;
                pigeon.set();
            } else {
                pigeon.isActiveOnFloor = false;
                pigeon.x = pigeon.y = null;
            }

            if (floor === 1) {
                placeWelcomeBanner();
            }

            if (merchant.isAlive) {
                // Always spawn on the first floor, or after 3 floors of absence
                if (floor === 1 || merchant.consecutiveFloorsAbsent >= 3) {
                    merchant.isActiveOnFloor = true;
                    merchant.consecutiveFloorsAbsent = 0;
                } else {
                    merchant.isActiveOnFloor = Math.random() < 0.35;
                    merchant.consecutiveFloorsAbsent +=
                        ! merchant.isActiveOnFloor;
                }

                if (merchant.isActiveOnFloor) {
                    merchant.set();
                }
            } else {
                merchant.isActiveOnFloor = false;
            }

            if (floor === 40) {
                placeNoboWall();
            }

            gambler.isActiveOnFloor = gambler.isAlive && Math.random() < 0.35;
            if (gambler.isActiveOnFloor) {
                gambler.set();
            }

            erok.isActiveOnFloor = erok.isAlive; // Spawns on every floor because he is a good boy
            if (erok.isActiveOnFloor) {
                erok.set();
            }

            spawnTreasureChests();
            spawnHealingTiles();
            spawnCrackedFloors();

            // @TODO Update, of course
            if (false && Math.random() < 0.6) { // % chance to spawn boulder
                boulder.spawn();
            } else {
                boulder.isActiveOnFloor = false;
            }

            const availableCoordinates = shuffle(MAP.getEmptyCellCoordinates());

            // Initialize roaming enemies after all other map elements are placed
            // roamingEnemies.initialize();
            for (let i = 0; i < 6 && i < availableCoordinates.length; i++) {
                const coordinate = availableCoordinates.pop();
                const enemy = MapEntityEnemyFactory.randomEnemy(
                    1,
                    coordinate.x,
                    coordinate.y,
                    numberBetween(0, 3)
                );

                const patrolPoints = [{ x: coordinate.x, y: coordinate.y }];
                for (const offset of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                    const cx = coordinate.x + offset[0];
                    const cy = coordinate.y + offset[1];
                    const cellIsOpen = ! MAP.cellIsOccupied(cx, cy);

                    if (cellIsOpen) {
                        patrolPoints.push({ x: cx, y: cy });
                    }
                }

                enemy.setPatrolPoints(MAP, patrolPoints);
                MAP.addEntity(enemy);
            }

            updateMinimapFooter();
            // vampire.initialize();

            // @TODO Remove this debug code, obviously
            // MAP.fill(1, 1, MAP.width - 2, MAP.height - 2, "floor");
            MAP.reveal();
        }*/

        // Place healing tiles
        const totalHealingTiles = 1 + Math.floor(Math.random() * 4);
        const availableCoordinates = gameMap
            .getEmptyCellCoordinates()
            // Make sure we don't spawn anything on the exit
            .filter(e => e.x !== exitX && e.y !== exitY);
        const coordinates = shuffle(availableCoordinates);

        for (let i = 0; i < totalHealingTiles && i < coordinates.length; i++) {
            const coordinate = coordinates[i];
            const healingTileEntity = MapEntityFeatureFactory.healingTile(
                coordinate.x,
                coordinate.y
            );

            gameMap.addEntity(healingTileEntity);
        }
        // End of heal tile placement

        // Place NPCs
        const placementPoints = shuffle(gameMap.getMapDissolvePoints());

        // 🧙 Merchant
        const placeMerchant = placementPoints.length > 0 &&
            (floor === 1 || Math.random() < 0.7);
        if (placeMerchant) {
            const merchantPosition = placementPoints.shift();
            gameMap.setCell(merchantPosition.x, merchantPosition.y);

            const merchant = MapEntityNpcFactory.merchant(
                merchantPosition.x,
                merchantPosition.y
            );

            gameMap.addEntity(merchant);
        }

        // 🐀 Gambler
        const placeGambler =
            placementPoints.length > 0 &&
            playerEntity.inventory.contents.bitcoins >= 500 &&
            Math.random() < 0.5;
        if (placeGambler) {
            const gamblerPosition = placementPoints.shift();
            gameMap.setCell(gamblerPosition.x, gamblerPosition.y);
            const gambler = MapEntityNpcFactory.gambler(
                gamblerPosition.x,
                gamblerPosition.y
            );

            gameMap.addEntity(gambler);
        }

        // 🐕️ Erok
        const placeErok =
            placementPoints.length > 0 &&
            Math.random() < 0.8;
        if (placeErok) {
            const erokPosition = placementPoints.shift();
            gameMap.setCell(erokPosition.x, erokPosition.y);
            const erok = MapEntityNpcFactory.erok(
                erokPosition.x,
                erokPosition.y
            );

            gameMap.addEntity(erok);
        }

        // End of NPC placement


        this._placeTreasureChests(
            gameMap,
            floor,
            numberBetween(1, 4),
            placementPoints
        );

        // Update the dungeon floor counter
        document.getElementById("dungeonFloor").textContent =
            floor.toLocaleString(undefined);
    },

    generateHallwayOfDoom: function(gameMap, floor) {
        gameMap.filterEntities(["player"]);

        const player = gameMap.entities.find(e => e.type === "player");
        if (! player) {
            console.error(
                "Player entity not found!",
                { entities: gameMap.entities }
            );
            return;
        }

        player.x = 1;
        player.y = 5;
        player.direction = 1;

        const exitEntity = MapEntityFeatureFactory.exit(27, 5);
        gameMap.addEntity(exitEntity);

        for (let x = 0; x < gameMap.width; x++) {
            for (let y = 0; y < gameMap.height; y++) {
                const placeWall =
                    x === 0 ||
                    x === gameMap.width - 1 ||
                    y === 0 ||
                    y === gameMap.height - 1 ||
                    (
                        (x === 5 || x === gameMap.width - 5 - 1) &&
                        (y < 5 || y > gameMap.height - 5 - 1)
                    );

                const type = placeWall ? "wall" : "floor";
                gameMap.setCell(x, y, type, { isExplored: false });
            }
        }

        for (let i = 0; i < 18; i++) {
            const yOffset =
                Math.floor((Math.sin(i / 9 * Math.PI * 2) + 1) * 2);

            const topBouldingBall = MapEntityFeatureFactory.bouldingBall(
                6 + i,
                1 + yOffset,
            );
            topBouldingBall.direction = 2;
            gameMap.addEntity(topBouldingBall);

            const bottomBouldingBall = MapEntityFeatureFactory.bouldingBall(
                6 + i,
                gameMap.height - 1 - yOffset,
            );
            bottomBouldingBall.direction = 0;
            gameMap.addEntity(bottomBouldingBall);
        }

        gameMap.reveal();
    },

    _placeTreasureChests: function(
        gameMap,
        floor,
        totalChests,
        placementPoints
    ) {
        if (totalChests < 1) {
            return;
        }

        for (let i = 0; i < totalChests && placementPoints.length > 0; i++) {
            const position = placementPoints.shift();
            gameMap.setCell(position.x, position.y);
            const treasureChest = MapEntityFeatureFactory.treasureChest(
                position.x,
                position.y
            );

            // 20% chance for mimic
            const isMimic = true; // Math.random() < 0.2;

            if (isMimic) {
                const mimic = TardQuestPartyMemberFactory.mimic();

                const floorBoost = Math.floor(floor / 2);
                mimic.stats.core.hp += floorBoost * 5;
                mimic.stats.core.maxHp += floorBoost * 5;
                mimic.stats.core.strength += floorBoost * 3;

                treasureChest.addPartyMember(mimic);
                treasureChest.inventory.giveBitcoins(100 + (floorBoost * 10));
            } else {
                // 50% chance of bitcoin, 25% chance for items or rings
                const lootType =
                    randomEntry(["bitcoin", "bitcoin", "item", "ring"]);

                switch (lootType) {
                    case "bitcoin":
                        // Award between 5 and 50 bitcoins, stepped by 5
                        const bitcoinAmount =
                            (1 + Math.floor(Math.random() * 9)) * 5;
                        treasureChest.inventory.giveBitcoins(bitcoinAmount);
                        break;
                    case "item":
                        const itemId = randomEntry(
                            Object.keys(ITEMS).filter(id => ITEMS[id].chestDrop)
                        );

                        if (itemId) {
                            treasureChest.inventory.addItem(itemId);
                        }
                        break;
                    case "ring":
                        const ringId = randomEntry(
                            Object.keys(RINGS).filter(id => RINGS[id].chestDrop)
                        );

                        if (ringId) {
                            treasureChest.inventory.addRing(ringId);
                        }
                        break;
                }
            }

            gameMap.addEntity(treasureChest);
        }
    },

    _placeVampireSummoningSigil: function(gameMap, x, y) {
        const sigil = MapEntityFeatureFactory.sigil(x, y);

        sigil.tickCount = 0;
        sigil.ticksUntilSummoning = 10;
        sigil.totalVampireSummons = 0;
        sigil.vampireEntity = null;

        sigil.tick = function(gameMap) {
            const vampireIsAlreadyActive = this.vampireEntity?.isAlive || false;
            if (vampireIsAlreadyActive) {
                return;
            }

            if (this.tickCount++ < this.ticksUntilSummoning) {
                return;
            }

            const entityStangingOnSigil = gameMap.entities.some(e =>
                e.x === this.x &&
                e.y === this.y &&
                typeof e.onTouch === "function"
            );

            if (entityStangingOnSigil) {
                console.log("Cannot spawn vampire: sigil is blocked");
                return;
            }

            this.vampireEntity = MapEntityEnemyFactory.vampire(
                1,
                this.x,
                this.y,
                Math.floor(Math.random() * 4)
            );

            // Vampires get faster after each respawn
            this.vampireEntity.movesPerTurn = Math.min(
                Math.max(sigil.totalVampireSummons + 1, 1),
                EntityMovementPlanner.windowSize
            );

            gameMap.addEntity(this.vampireEntity);
            this.vampireEntity.showFocalPoint(gameMap);

            // @TODO Use to make the vampire more aggressive each time
            this.totalVampireSummons++;
            this.tickCount = 0;
        };

        gameMap.addEntity(sigil);
    },
};
