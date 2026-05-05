"use strict";

const EntityMovementPlanner = {
    // How many steps into the future the planner should anticipate
    windowSize: 20,

    currentPlan: [],

    // Tracks the last map revision
    lastMapRevision: -1,

    // Mechanism that identifies corridors in the map
    corridorTagger: new CorridorTagger(),

    // Corridors that exist in the map
    corridors: {},

    // Identifies corridors for movement planning purposes
    identifyCorridors: function(gameMap) {
        this.corridors = this.corridorTagger.tagCorridors(gameMap.cells);
    },

    currentMovesArePossible: function(gameMap) {
        if (this.currentPlan.length < 1) {
            return false;
        }

        for (const move of this.currentPlan[0]) {
            const { entityId, destination } = move;

            const entityExists = gameMap.entities.some(e => e.id === entityId);
            if (! entityExists) {
                return false;
            }

            const destinationIsObstructed =
                gameMap.isObstructed(destination.x, destination.y);
            if (destinationIsObstructed) {
                return false;
            }
        }

        return true;
    },

    claim: function(claimedSpacesInTime, interval, entity, x, y) {
        if (interval < 0 || interval >= claimedSpacesInTime.length) {
            console.error(
                "Interval is out of bounds",
                { claimedSpacesInTime, interval }
            );
            return false;
        }

        const alreadyClaimed = claimedSpacesInTime[interval].some(e =>
            e.x === x &&
            e.y === y &&
            e.entityId !== entity.id &&
            e.entityId !== entity.targetEntityId
        );

        if (alreadyClaimed) {
            console.error(
                "Space is already claimed",
                { entity, x, y, space: claimedSpacesInTime[interval] }
            );
            return false;
        }

        const existingClaim =
            claimedSpacesInTime[interval].find(e => e.entityId === entity.id);

        if (existingClaim) {
            existingClaim.x = x;
            existingClaim.y = y;
            return true;
        }

        claimedSpacesInTime[interval].push({ entityId: entity.id, x, y });
        return true;
    },

    generatePlan: function(gameMap, orderedEntityIds = []) {
        const finishedEntityIds = new Set();
        const availableCorridorEntrances = {};
        const claimedSpacesInTime = Array.from(
            { length: this.windowSize },
            () => []
        );

        // For any entities that have reached their destinations, claim all
        // of their spaces into the future to avoid pathing through them by
        // others
        for (const entityId of orderedEntityIds) {
            const entity = gameMap.entities.find(e => e.id === entityId);
            if (! entity) {
                console.error(
                    "Entity disappeared during planning!",
                    { entityId }
                );
                continue;
            }

            const { x, y } = entity;
            const entityIsAtDestination = ! entity.hasTarget() || (
                x === entity.target.x &&
                y === entity.target.y
            );

            if (entityIsAtDestination) {
                for (let i = 0; i < this.windowSize; i++) {
                    this.claim(claimedSpacesInTime, i, entity, x, y);
                }

                finishedEntityIds.add(entityId);
            } else {
                this.claim(claimedSpacesInTime, 0, entity, x, y);
            }
        }

        for (const entityId of orderedEntityIds) {
            // Skip if the current entity has already reached its destination
            if (finishedEntityIds.has(entityId)) {
                continue;
            }

            const entity = gameMap.entities.find(e => e.id === entityId);
            if (! entity) {
                console.error(
                    "Entity disappeared during planning!",
                    { entityId }
                );
                continue;
            }

            const startingCoordinate = { x: entity.x, y: entity.y };
            const targetCoordinate = entity.hasTarget()
                ? { x: entity.target.x, y: entity.target.y }
                : startingCoordinate;

            const path = gameMap.findPathCoordinated(
                startingCoordinate,
                targetCoordinate,
                claimedSpacesInTime,
                this.corridors,
                availableCorridorEntrances,
                entity
            );

            if (path === null) {
                // No way to get to the target. Wait for the remaining time
                for (let i = 0; i < this.windowSize; i++) {
                    this.claim(
                        claimedSpacesInTime,
                        i,
                        entity,
                        entity.x,
                        entity.y
                    );
                }

                finishedEntityIds.add(entityId);
                continue;
            }

            // Apply the path
            let waitOffset = 0;
            for (let i = 0; i < this.windowSize; i++) {
                const step = i >= path.length
                    ? path[path.length - 1]
                    : path[i - waitOffset];

                const previousStep = i > 0 && claimedSpacesInTime[i - 1]
                    .find(e => e.entityId === entityId);

                const stepIsAlreadyClaimed = claimedSpacesInTime[i].some(e =>
                    e.x === step.x &&
                    e.y === step.y &&
                    e.entityId !== entityId &&
                    e.entityId !== entity.targetEntityId
                );

                if (stepIsAlreadyClaimed) {
                    // Wait instead of move
                    waitOffset++;

                    if (previousStep) {
                        this.claim(
                            claimedSpacesInTime,
                            i,
                            entity,
                            previousStep.x,
                            previousStep.y
                        );
                    }

                    continue;
                }

                this.claim(claimedSpacesInTime, i, entity, step.x, step.y);

                const stepCorridorId = this.identifyCorridor(step.x, step.y);
                const shouldBlockCorridor =
                    stepCorridorId !== null &&
                    ! availableCorridorEntrances.hasOwnProperty(stepCorridorId);

                if (shouldBlockCorridor) {
                    availableCorridorEntrances[stepCorridorId] = {
                        x: step.x,
                        y: step.y,
                    };
                } else if (stepCorridorId === null && previousStep) {
                    const lastCorridorId = this.identifyCorridor(
                        previousStep.x,
                        previousStep.y
                    );

                    if (lastCorridorId !== null) {
                        const releaseCorridor = this.shouldReleaseCorridor(
                            lastCorridorId,
                            claimedSpacesInTime.slice(-2).reverse()
                        );

                        if (releaseCorridor) {
                            delete availableCorridorEntrances[lastCorridorId];
                        }
                    }
                }

                const entityIsAtDestination =
                    targetCoordinate.x === step.x &&
                    targetCoordinate.y === step.y;

                if (entityIsAtDestination) {
                    for (let j = i; j < this.windowSize; j++) {
                        this.claim(
                            claimedSpacesInTime,
                            j,
                            entity,
                            step.x,
                            step.y
                        );
                    }
                }
            }
        }

        return claimedSpacesInTime;
    },

    identifyCorridor: function(x, y) {
        const corridorIds = Object.keys(this.corridors);

        for (const id of corridorIds) {
            const corridor = this.corridors[id];

            if (! Array.isArray(corridor)) {
                console.error("Corridor is not an array", { corridor, id });
                continue;
            }

            if (corridor.some(e => e.x === x && e.y === y)) {
                return id;
            }
        }

        return null;
    },

    /**
     * Determines if a corridor can be unlocked based on the latest activity
     *
     * This works by looking at the latest claimed spaces to see where entities
     * currently reside and comparing those coordinates with the corridor's
     *
     * If any entity is still inside of a corridor, it should remain locked
     *
     * @param string corridorId The ID of the locked corridor
     * @param Array lastClaimedSpaces The latest spaces to check for occupation
     * @return bool True if the corridor should be released
     */
    shouldReleaseCorridor: function(corridorId, lastClaimedSpaces = []) {
        if (corridorId === null) {
            return false;
        }

        if (! this.corridors.hasOwnProperty(corridorId)) {
            console.warn(
                "Cannot release corridor because it does not exist",
                { corridorId }
            );

            return false;
        }

        const corridor = this.corridors[corridorId];
        if (! Array.isArray(corridor)) {
            console.error(
                "Cannot release corridor because it is not an array",
                { corridorId }
            );

            return false;
        }

        const seenEntityIds = [];

        for (let i = 0; i < Math.min(lastClaimedSpaces.length, 2); i++) {
            const space = lastClaimedSpaces[i];

            for (const entry of space) {
                if (seenEntityIds.some(e => e === entry.entityId)) {
                    continue;
                }

                seenEntityIds.push(entry.entityId);

                const corridorIsStillOccupied =
                    corridor.some(e => e.x === entry.x && e.y === entry.y);
                if (corridorIsStillOccupied) {
                    return false;
                }
            }
        }

        return true;
    },

    score: function(plan) {
        let total = 0;
        const waitingSteps = {};

        for (let i = 0; i < plan.length; i++) {
            for (const move of plan[i]) {
                const isWaiting = i > 0 && plan[i - 1].some(e =>
                    e.entityId === move.entityId &&
                    e.x === move.x &&
                    e.y === move.y
                );

                if (isWaiting) {
                    if (! waitingSteps.hasOwnProperty(move.entityId)) {
                        waitingSteps[move.entityId] = 0;
                    }

                    waitingSteps[move.entityId]++;
                    total +=
                        Math.ceil(Math.log2(waitingSteps[move.entityId] ** 2));
                } else {
                    delete waitingSteps[move.entityId];
                    total++;
                }
            }
        }

        return total;
    },

    planMovement: function(gameMap) {
        // Abandon any existing plans
        this.currentPlan = [];

        // Recalculate corridors if the map has changed
        if (gameMap.revision !== this.lastMapRevision) {
            this.identifyCorridors(gameMap);
            this.lastMapRevision = gameMap.revision;
        }

        const prioritizedEntityIds = this.getPrioritizedEntityIds(gameMap);

        // No autonomous entities are on the map. Nothing to do
        if (prioritizedEntityIds.length === 0) {
            return;
        }

        this.currentPlan = this.generatePlan(gameMap, prioritizedEntityIds);
    },

    getNextPlannedMove: function() {
        return this.currentPlan.shift() || null;
    },

    move: function(gameMap) {
        const shouldReplan =
            gameMap.revision !== this.lastMapRevision ||
            this.currentPlan.length === 0;

        if (shouldReplan) {
            this.planMovement(gameMap);
        }

        if (this.currentPlan.length === 0) {
            return;
        }

        const moves = this.currentPlan.shift();

        for (const move of moves) {
            const entity =
                gameMap.entities.find(e => e.id === move.entityId);
            if (! entity) {
                console.error(
                    "Entity disappeared before move!",
                    { entityId: move.entityId }
                );
                continue;
            }

            const hasCoordinate =
                typeof move.x === "number" &&
                typeof move.y === "number";

            if (! hasCoordinate) {
                console.error(
                    "No coordinate set for move",
                    { move, moves, currentPlan: this.currentPlan }
                );
                return;
            }

            if (gameMap.cellIsOccupied(move.x, move.y)) {
                if (entity.x === move.x && entity.y === move.y) {
                    // Entity is already here. Nothing to do
                    continue;
                }

                // Invalidate all future moves for this entity this round
                this.currentPlan =
                    this.currentPlan.filter(e => e.entityId !== entity.id);

                continue;
            }

            gameMap.rerenderCoordinate(entity.x, entity.y);
            gameMap.rerenderCoordinate(move.x, move.y);

            entity.x = move.x;
            entity.y = move.y;
        }
    },

    getPrioritizedEntityIds: function(gameMap) {
        return gameMap.entities
            .filter(e =>
                e.isAlive &&
                e.isAutonomous &&
                ! e.isRealtime &&
                ! e.isStunned()
            )
            .sort(
                (a, b) => {
                    const aPriority = a.getMovementPriority();
                    const bPriority = b.getMovementPriority();

                    return aPriority === bPriority
                        ? a.id > b.id
                        : aPriority < bPriority;
                }
            )
            .map(e => e.id);
    },
};
