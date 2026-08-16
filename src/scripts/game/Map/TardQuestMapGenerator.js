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

        return bestPair;
    },

    generate: function(gameMap, floor) {
        SceneRenderer.sightRangeOverride = null;
        SceneRenderer.setStripSquare(8);

        gameMap.filterEntities(["player"]);

        const floorLayout = this.generateRandomLayout();
        this.applyLayout(gameMap, floorLayout);

        const regions = MapGenerator.regions.identify(floorLayout);

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
        gameMap.addEntity(exitEntity);
        exitRegion.occupied = true;

        let sigilPlaced = false;

        // @TODO This sometimes doesn't run which stops enemies from appearing
        for (const region of regions) {
            if (region?.occupied) {
                continue;
            }

            if (Math.random() < 0.50) {
                const x = region.start.x +
                    Math.round(region.end.x - region.start.x);
                const y = region.start.y +
                    Math.round(region.end.y - region.start.y);

                gameMap.addEntity(MapEntityFeatureFactory.crackedFloor(x, y));
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
            .filter(e => ! (typeof e.onEnter === "function"));
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

        // Gravestones depend on the TardAPI and work asynchronously, so place
        // these last
        this._placeGravestone(gameMap, floor, placementPoints);

        // Update the dungeon floor counter
        document.getElementById("dungeonFloor").textContent =
            floor.toLocaleString(undefined);
    },

    generateHallwayOfDoom: function(gameMap, floor) {
        SceneRenderer.sightRangeOverride = null;
        SceneRenderer.setStripSquare(8);

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

    generateRandomMossyDungeon: function(gameMap, floor) {
        this.generate(gameMap, floor);

        for (let y = 0; y < gameMap.height; y++) {
            for (let x = 0; x < gameMap.width; x++) {
                const cell = gameMap.getCell(x, y);

                cell.ceilingTextureId = Math.random() < 0.5
                    ? null
                    : (Math.random() < 0.5
                        ? "default"
                        : (Math.random() < 0.75 ? "stone" : "moss")
                    );

                cell.floorTextureId = Math.random() < 0.75 ? "moss" : "stone";

                if (cell.isWall) {
                    if (Math.random() < 0.4) {
                        cell.wallTextureId =
                            Math.random() < 0.5 ? "stone" : "moss";
                    }

                    if (Math.random() < 0.25) {
                        cell.wallTextureIds.north =
                            Math.random() < 0.5 ? "stone" : "moss";
                        cell.wallTextureIds.east =
                            Math.random() < 0.5 ? "stone" : "moss";
                        cell.wallTextureIds.south =
                            Math.random() < 0.5 ? "stone" : "moss";
                        cell.wallTextureIds.west =
                            Math.random() < 0.5 ? "stone" : "moss";
                    }
                }

                // Ambient effects
                cell.ambientLight = {
                    r: 0.05,
                    g: 0.05,
                    b: 0.05,
                };
                cell.fogDensity = 0.25;
                cell.fogColor = {
                    r: 0.45,
                    g: 0.5,
                    b: 0.4,
                };
                cell.lightSource = {
                    color: {
                        r: 1,
                        g: 0.65,
                        b: 0.25,
                    },
                    intensity: 1,
                    radius: 5,
                };
            }
        }

        this._placeTorches(gameMap, 20);
    },

    generateBikiniBottom: function(gameMap, floor) {
        SceneRenderer.sightRangeOverride = 20;
        SceneRenderer.setStripSquare(1);

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
                gameMap.setCell(x, y, type, { isExplored: true });

                const cell = gameMap.getCell(x, y);
                cell.ceilingTextureId = "demo01ceiling01";
                cell.floorTextureId = "demo01floor01";

                if (placeWall) {
                    const textureId = "demo01wall0" +
                        (Math.floor(Math.random() * 3) + 1);
                    cell.wallTextureIds.north = textureId;
                    cell.wallTextureIds.east = textureId;
                    cell.wallTextureIds.south = textureId;
                    cell.wallTextureIds.west = textureId;
                }
            }
        }

        gameMap.getCell(24, 3).wallTextureIds.west = "demo01kkext01";
        gameMap.getCell(24, 4).wallTextureIds.west = "demo01kkext02";
        gameMap.getCell(24, 5).wallTextureIds.west = "demo01kkextflags";
        gameMap.getCell(24, 6).wallTextureIds.west = "demo01kkext03";
        gameMap.getCell(24, 7).wallTextureIds.west = "demo01kkext04";

        const kkFlags = MapEntityBuilder("flags", 24, 5);
        kkFlags.direction = 3;
        kkFlags.isVisibleOnMinimap = false;
        kkFlags.spriteIds = [ "demo01KkFlags" ];
        gameMap.addEntity(kkFlags);
        console.log({ kkFlags });

        const env = SceneRenderer.environmentMap;
        for (let i = 0; i < env.width * env.height; i++) {
            env.lightR[i] = 1;
            env.lightG[i] = 1;
            env.lightB[i] = 1;
        }

        env.fogG.fill(127 / 255);
        env.fogG.fill(214 / 255);
        env.fogB.fill(204 / 255);
        env.fogDensity.fill(0.02);

        gameMap.addEntity(MapEntityFeatureFactory.demo01Krabs(24, 5));
        const gravestone = MapEntityFeatureFactory.gravestone(25, 1);
        gravestone.headstoneMessageHtml =
            `<span class="DEF">Rest in peace, Gary :'(</span>`;
        gameMap.addEntity(gravestone);

        const pattyPlacements = [
            { x:  3, y: 2 }, { x:  3, y: 8 },
            { x:  8, y: 3 }, { x:  8, y: 7 },
            { x: 10, y: 5 }, { x: 19, y: 5 },
            { x: 21, y: 3 }, { x: 21, y: 7 },
        ];

        for (let i = 0; i < pattyPlacements.length; i++) {
            const { x, y } = pattyPlacements[i];
            const patty = MapEntityFeatureFactory.demo01Patty(x, y);
            gameMap.addEntity(patty);
        }

        gameMap.reveal();
    },

    _cachedLeaderboardEntries: null,

    _placeGravestone: async function(gameMap, floor, placementPoints) {
        const floorIsValid = Number.isInteger(floor) && floor > 0;
        if (! floorIsValid) {
            console.error("Cannot place gravestone: invalid floor", { floor });
            return;
        }

        if (placementPoints.length === 0) {
            console.warn("No place available for a gravestone", { floor });
            return;
        }

        const leaderboardIsAvailable =
            (typeof TardAPI === "object") &&
            (typeof TardAPI.getLeaderboard === "function");

        if (! leaderboardIsAvailable) {
            console.warn(
                "Unable to place gravestone: the leaderboard is not available"
            );
            return;
        }

        if (! this._cachedLeaderboardEntries) {
            try {
                const res = await TardAPI.getLeaderboard({ force: false });

                if (! res.success) {
                    console.warn("Failed to load the leaderboard", { res });
                    return;
                }

                const leaderboardHasEntries =
                    Array.isArray(res.leaderboard) &&
                    res.leaderboard.length > 0;

                if (! leaderboardHasEntries) {
                    console.warn("Leaderboard has no entries", { res });
                    return;
                }

                this._cachedLeaderboardEntries = res.leaderboard;
            } catch (error) {
                console.warn("Failed to fetch leaderboard data", { error });
                return;
            }
        }

        const entries = this._cachedLeaderboardEntries;
        const leaderboardHasEntries =
            Array.isArray(entries) &&
            entries.length > 0;

        if (! leaderboardHasEntries) {
            console.error("Cached leaderboard is empty", { entries });
            return;
        }

        const floorEntries = entries.filter(
            // @TODO Consolidate floor, floor_reached, and max_floor
            e => floor === Number(e.floor ?? e.floor_reached ?? e.max_floor)
        );

        if (floorEntries.length === 0) {
            console.debug(
                "No leaderboard entries exist for the current floor",
                { floor, entries }
            );
            return;
        }

        // Collate top scores per unique name (preserve full entry)
        const topByName = {};
        floorEntries.forEach(e => {
            // @TODO Consolidate name, player, and ID
            const name = e.name || e.player || `Player ${e.id ?? "Unknown"}`;
            const floorNum = Number(e.floor ?? NaN);
            const levelNum = Number(e.level ?? NaN);
            const existing = topByName[name];

            if (! existing) {
                topByName[name] = { ...e, name };
                return;
            }

            const existingFloor = Number(existing.floor ?? NaN);
            const existingLevel = Number(existing.level ?? NaN);

            // Prefer higher floor, break ties with higher level
            const isHigherFloor =
                floorNum > existingFloor ||
                (floorNum === existingFloor && levelNum > existingLevel);

            if (isHigherFloor) {
                topByName[name] = { ...e, name };
            }
        });

        const uniqueEntries = Object.values(topByName);
        if (uniqueEntries.length === 0) {
            console.warn("No unique entries were found");
            return;
        }

        const entry = randomEntry(uniqueEntries);

        const position = placementPoints.shift();
        if (! position) {
            console.warn("No place available for a gravestone", { floor });
            return;
        }

        const gravestone = MapEntityFeatureFactory.gravestone(
            position.x,
            position.y
        );

        const name = entry.name || "Nameless Tard";
        const displayScore =
            `Floor ${floor} - Level ${entry?.level ?? "??"}`;

        const message = entry.gravestoneMessage ?? randomEntry([
            "Attempted to pillage the TardSpire, but was pillaged in " +
                "the ass by a refrigerator instead. RIP",
            "Stayed up all night for this score. Worth it?",
            "A shining example of refined incompetence.",
            "You see a trom-BONE lodged sticking out of the ground. " +
                "Musical genius, or a victim to amusia? No one will " +
                "know.",
            "They shit their pants... it was REAL bad.",
            "They tried.",
            "Rumors say they bore witness to the Pico's School " +
                "incident...",
            "This one was a registered Gex offender, straight up.",
            "782 hours logged in Bubsy 3D. 'Nuff said.",
            "Maybe they shouldn't have killed Erok...",
            "This gravestone has been vandalized by teenagers. Those " +
                "very delinquents now reside beneath this stone, due " +
                "to unknown forces.",
            "They tried to stay ALIVE on OPPOSITE DAY. Poor sucker...",
        ]);

        gravestone.headstoneMessageHtml =
            `<span class="friendly">${name}</span> - ` +
            `<span class="BTC">${displayScore}</span> - ` +
            `<span class="action">${message}</span>`;

        gameMap.setCell(position.x, position.y);
        gameMap.addEntity(gravestone);
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
            const isMimic = Math.random() < 0.2;

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

    _placeTorches: function(gameMap, totalTorches = 1) {
        const places = [];

        for (let y = 1; y < gameMap.height - 1; y++) {
            for (let x = 1; x < gameMap.width - 1; x++) {
                if (! gameMap.cells[y][x].isWall) {
                    continue;
                }

                // North
                if (! gameMap.cells[y - 1][x].isWall) {
                    places.push({ x, y: y - 1, direction: 3 });
                }

                // East
                if (! gameMap.cells[y][x + 1].isWall) {
                    places.push({ x: x + 1, y, direction: 2 });
                }

                // South
                if (! gameMap.cells[y + 1][x].isWall) {
                    places.push({ x, y: y + 1, direction: 1 });
                }

                // West
                if (! gameMap.cells[y][x - 1].isWall) {
                    places.push({ x: x - 1, y, direction: 0 });
                }
            }
        }

        shuffle(places);

        for (let i = 0; i < totalTorches && i < places.length; i++) {
            const torch =
                MapEntityFeatureFactory.torches(places[i].x, places[i].y);
            torch.direction = places[i].direction;
            MAP.addEntity(torch);
        }
    },

    _placeVampireSummoningSigil: function(gameMap, x, y) {
        // Helper to count the number of times a path's direction changes
        function countMapDirectionChanges(path) {
            let lastX = null;
            let lastY = null;
            let lastDirectionChangeWasOnXAxis = null;
            let totalDirectionChanges = 0;

            for (const coordinate of path) {
                const [ x, y ] = coordinate;
                const directionChanged = (
                    lastX === x &&
                    lastY !== y &&
                    lastDirectionChangeWasOnXAxis === false
                ) || (
                    lastY === y &&
                    lastX !== x &&
                    lastDirectionChangeWasOnXAxis === true
                );

                if (directionChanged) {
                    totalDirectionChanges++;
                }

                if (lastX !== null && lastY !== null) {
                    lastDirectionChangeWasOnXAxis = lastY === y;
                }

                lastX = x;
                lastY = y;
            }

            return totalDirectionChanges;
        }

        const sigil = MapEntityFeatureFactory.sigil(x, y);
        const fallbackTicksUntilSummoning = 20;
        sigil.ticksUntilSummoning = fallbackTicksUntilSummoning;

        const player = gameMap.entities.find(e => e.type === "player");
        const exit = gameMap.entities.find(e => e.type === "exit");

        if (player && exit) {
            const path = MAP.findPath([player.x, player.y], [exit.x, exit.y]);
            if (! path) {
                console.error("End is unreachable", { player, exit, gameMap });
            } else {
                sigil.ticksUntilSummoning =
                    path.length + countMapDirectionChanges(path);
            }
        } else {
            console.error("Could not find required entities", { player, exit });
        }

        sigil.tickCount = 0;
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
