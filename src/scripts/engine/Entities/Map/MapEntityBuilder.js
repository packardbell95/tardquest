"use strict";

/**
 * The MapEntityBuilder creates entities that appear in the game's map
 *
 * @param x The X position of the entity on the map
 * @param y The Y position of the entity on the map
 * @return object A new map entity that can be included in the GameMap
 */
function MapEntityBuilder(type, x = 1, y = 1, direction = 0) {
    MapEntityBuilder.entityId = MapEntityBuilder.entityId || 1;

    const mapEntity = {
        id: MapEntityBuilder.entityId++,
        type, // @TODO Could we just use leader.type instead?
        className: "generic-entity",
        isActive: true,
        isAlive: true,
        x,
        y,
        direction,
        origin: { x, y },
        initialDirection: direction,
        target: null,
        targetReason: null,
        targetEntityId: null,
        movesPerTurn: 1,
        alertLevel: 0,
        stunTurns: 0,
        objectsOfInterest: [],
        stepsTakenOnCurrentFloor: 0,

        getClassName: function() {
            const className = `${this.className} ${this.type}`;
            return this.isStunned() ? `${className} stunned` : className;
        },

        clearTarget: function() {
            this.target = null;
            this.targetReason = null;
            this.targetEntityId = null;
        },

        setTarget: function(x, y, reason, entityId = null) {
            this.mode = "chase";
            this.target = { x, y };
            this.targetEntityId = Number.isInteger(entityId) ? entityId : null;

            if (typeof reason !== "string") {
                this.targetReason = null;
                return;
            }

            // The entity saw something new and interesting
            const isAlerted = this.targetReason !== reason && (
                reason === "player" ||
                this.objectsOfInterest.includes(reason)
            );

            if (isAlerted) {
                this.alertLevel = Math.max(this.alertLevel, 1);
            }

            this.targetReason = reason;
        },

        setOrigin: function(x = null, y = null, direction = null) {
            const setX = x ?? this.x;
            const setY = y ?? this.y;
            const setDirection = direction ?? this.direction;

            const coordinateIsValid =
                Number.isInteger(setX) &&
                Number.isInteger(setY);

            if (! coordinateIsValid) {
                console.error(
                    "Origin coordinate must consist of integers",
                    { setX, setY },
                );
                return;
            }

            const originIsValid =
                Number.isInteger(setDirection) &&
                setDirection >= 0 &&
                setDirection < 3;

            if (! originIsValid) {
                console.error(
                    "Direction must be an integer between 0 and 3",
                    { setDirection }
                );
                return;
            }

            this.origin.x = setX;
            this.origin.y = setY;
            this.initialDirection = setDirection;
        },

        // @TODO Make this a normal function, not a getter
        get isAutonomous() {
            return this.type !== "player" && typeof this.onTouch === "function";
        },
        getMovementPriority: function() {
            return 10;
        },
        turnLeft: function() {
            this.direction = (this.direction + 3) % 4;
        },
        turnRight: function() {
            this.direction = (this.direction + 1) % 4;
        },
        turnAround: function() {
            this.direction = (this.direction + 2) % 4;
        },

        _directionMatrix: {
            x: [0, 1, 0, -1],
            y: [-1, 0, 1, 0],
        },

        getCoordinateInFront: function() {
            return {
                x: this.x + this._directionMatrix.x[this.direction],
                y: this.y + this._directionMatrix.y[this.direction],
            };
        },
        getCoordinateBehind: function() {
            return {
                x: this.x - this._directionMatrix.x[this.direction],
                y: this.y - this._directionMatrix.y[this.direction],
            };
        },
        getCoordinateLeft: function() {
            return {
                x: this.x + this._directionMatrix.x[(this.direction + 3) % 4],
                y: this.y + this._directionMatrix.y[(this.direction + 3) % 4],
            };
        },
        getCoordinateRight: function() {
            return {
                x: this.x + this._directionMatrix.x[(this.direction + 1) % 4],
                y: this.y + this._directionMatrix.y[(this.direction + 1) % 4],
            };
        },

        setCoordinate: function(gameMap, coordinate) {
            const validCoordinate =
                Number.isInteger(coordinate.x) &&
                Number.isInteger(coordinate.y);

            if (! validCoordinate) {
                console.error(
                    "Coordinate must consist of integers",
                    { coordinate }
                );
                return;
            }

            if (this.x === coordinate.x && this.y === coordinate.y) {
                // Already on the target coordinate
                return;
            }

            this.x = coordinate.x;
            this.y = coordinate.y;
            this.stepsTakenOnCurrentFloor++;

            const enterableEntities = gameMap.entities.filter(e =>
                e.id !== this.id &&
                e.x === this.x &&
                e.y === this.y &&
                typeof e.onEnter === "function"
            );

            for (const entity of enterableEntities) {
                entity.onEnter(gameMap, this);
            }
        },

        /**
         * Helper function to determine if two entities share an axis
         *
         * @param entity The entity to compare against
         * @return bool True if the entities share an axis
         */
        isOnSameAxisAs: function(entity) {
            const entitiesShareAnAxis =
                this.x === entity.x || this.y === entity.y;
            const entitiesOccupyTheSameSpace =
                this.x === entity.x && this.y === entity.y;

            return entitiesShareAnAxis && ! entitiesOccupyTheSameSpace;
        },

        /**
         * Determines if this is facing a specified entity
         * @TODO Rename this to isFacingEntity
         *
         * @param entity The entity to compare against
         * @return bool True if the two entities are facing each other
         */
        isFacing: function(entity) {
            if (! this.isOnSameAxisAs(entity)) {
                return false;
            }

            if (this.x === entity.x) {
                return Boolean(this.x > entity.x
                    ? (this.direction === 3 && entity.direction === 1)
                    : (this.direction === 1 && entity.direction === 3)
                );
            }

            return Boolean(this.y > entity.y
                ? (this.direction === 0 && entity.direction === 2)
                : (this.direction === 2 && entity.direction === 0)
            );
        },

        isFacingCell: function(cell) {
            const coordinate = this.getCoordinateInFront();
            return coordinate.x === cell.x && coordinate.y === cell.y;
        },

        /**
         * Determines if the target entity is being approached from behind
         * @TODO Change this to use line of sight, not direction + position
         *
         * @param entity The entity to compare against
         * @return bool True if the entity is being approached from behind
         */
        isAmbushing: function(entity) {
            if (! this.isOnSameAxisAs(entity)) {
                return false;
            }

            if (this.y === entity.y) {
                return Boolean(this.x > entity.x
                    ? (this.direction === 3 && entity.direction === 3)
                    : (this.direction === 1 && entity.direction === 1)
                );
            }

            return Boolean(this.y > entity.y
                ? (this.direction === 0 && entity.direction === 0)
                : (this.direction === 2 && entity.direction === 2)
            );
        },

        /**
         * Determines if the target entity is approaching from behind
         *
         * @param entity The entity to compare against
         * @return bool True if the entity is approaching from behind
         */
        isBeingAmbushedBy: function(entity) {
            if (! this.isOnSameAxisAs(entity)) {
                return false;
            }

            if (this.y === entity.y) {
                return Boolean(this.x > entity.x
                    ? (this.direction === 1 && entity.direction === 1)
                    : (this.direction === 3 && entity.direction === 3)
                );
            }

            return Boolean(this.y > entity.y
                ? (this.direction === 2 && entity.direction === 2)
                : (this.direction === 0 && entity.direction === 0)
            );
        },

        isStunned: function() {
            return this.stunTurns > 0;
        },

        reduceStun: function() {
            this.stunTurns = Math.max(this.stunTurns - 1, 0);
        },

        stun: function(stunTurns = 1) {
            if (! Number.isInteger(stunTurns)) {
                console.warn("stunTurns must be an integer", { stunTurns });
                return;
            }

            this.stunTurns = Math.max(this.stunTurns, stunTurns);
        },

        movementDisabled: false,

        moveForward: function(gameMap) {
            if (this.movementDisabled) {
                return;
            }

            this.setCoordinate(gameMap, this.getCoordinateInFront());
        },
        moveBackward: function(gameMap) {
            if (this.movementDisabled) {
                return;
            }

            this.setCoordinate(gameMap, this.getCoordinateBehind());
        },
        strafeLeft: function(gameMap) {
            if (this.movementDisabled) {
                return;
            }

            this.setCoordinate(gameMap, this.getCoordinateLeft());
        },
        strafeRight: function(gameMap) {
            if (this.movementDisabled) {
                return;
            }

            this.setCoordinate(gameMap, this.getCoordinateRight());
        },

        /**
         * If the entity is targeting something directly behind them, this
         * determines which direction they should turn first if they are not
         * moving hastily
         *
         * This is set to random by default to give the entity some variability
         *
         * @return bool True to turn left to face a target behind the entity
         */
        get preferLeftTurnFirst() {
            return Math.random() < 0.5;
        },

        turnTowards: function(target) {
            if (! Number.isInteger(target?.x) && Number.isInteger(target?.y)) {
                console.warn(
                    "Target coordinate must consist of integers",
                    { target }
                );
                return false;
            }

            if (this.x === target.x && this.y === target.y) {
                // Coordinates are the same. No turn necessary
                return false;
            }

            const differenceX = this.x - target.x;
            const differenceY = this.y - target.y;
            const absoluteDiffX = Math.abs(differenceX);
            const absoluteDiffY = Math.abs(differenceY);
            const sameDistance = absoluteDiffX === absoluteDiffY;
            const turnX =
                absoluteDiffX > absoluteDiffY ||
                (sameDistance && this.preferLeftTurnFirst);

            this.direction = turnX
                ? (differenceX > 0 ? 3 : 1)
                : (differenceY > 0 ? 0 : 2);

            return true;
        },

        hasTarget: function() {
            return (
                Number.isInteger(this.target?.x) &&
                Number.isInteger(this.target?.y)
            );
        },

        // Helper function to determine if the entity reached its target
        isOnTarget: function() {
            return (
                this.hasTarget() &&
                this.target.x === this.x &&
                this.target.y === this.y
            );
        },

        scan: function(gameMap) {
            if (this.leader === null) {
                console.debug("Entity has no leader, so it cannot see");
                return [];
            }

            return gameMap.seeEntitiesFrom(
                this.x,
                this.y,
                this.direction,
                this.leader.getEffectiveTrait("sightRange"),
                this.leader.getEffectiveTrait("fieldOfView"),
            );
        },

        scanForNewTarget: function(gameMap) {
            const seenObjectsOfInterest = this.scan(gameMap).filter(
                e => this.objectsOfInterest.includes(e.type)
            );

            if (seenObjectsOfInterest.length > 0) {
                let shortestLength = Infinity;

                for (const seenObjectOfInterest of seenObjectsOfInterest) {
                    const path = gameMap.findPath(
                        [this.x, this.y],
                        [seenObjectOfInterest.x, seenObjectOfInterest.y]
                    );

                    if (path !== null && path.length < shortestLength) {
                        this.setTarget(
                            seenObjectOfInterest.x,
                            seenObjectOfInterest.y,
                            "interest",
                            seenObjectOfInterest.id || null
                        );
                        shortestLength = path.length;
                    }
                }
                return;
            }
        },

        targetCheck: function(gameMap) {
            this.scanForNewTarget(gameMap);

            if (! this.isOnTarget()) {
                return;
            }

            const entity = this;
            const hasPatrolPoints =
                Array.isArray(this.patrolPoints) &&
                Number.isInteger(this.patrolIndex);

            if (hasPatrolPoints) {
                const hasReachedPatrolPoint =
                    this.patrolPoints[this.patrolIndex].x === this.x &&
                    this.patrolPoints[this.patrolIndex].y === this.y;

                if (hasReachedPatrolPoint) {
                    const isAtEndOfPatrol =
                        this.patrolIndex >= this.patrolPoints.length - 1;

                    this.patrolIndex = isAtEndOfPatrol
                        ? 0
                        : this.patrolIndex + 1;
                }

                const nextTarget = this.patrolPoints[this.patrolIndex];
                this.setTarget(nextTarget.x, nextTarget.y, "patrol");
            }
        },

        /**
         * Determines if a move is hasty or not
         * A hasty move is one that does not count a turn as a move
         * Target reason determines hastiness, eg: chasing the player
         *
         * This is intended to be overridden by movement traits
         *
         * @return bool True if the move is hasty
         */
        isHastyMove: function() {
            return false;
        },

        /**
         * Moves the entity towards the coordinate
         *
         * Only runs if the coordinate is next to the current cell
         * The entity will move into the next cell if:
         *   - It's already facing that cell
         *   - It's in "hasty" mode, meaning that something has alerted it
         * Otherwise, the entity will gradually turn towards the coordinate
         */
        moveTowards: function(coordinate, gameMap) {
            if (this.movementDisabled) {
                return;
            }

            this.targetCheck(gameMap);

            const distance =
                Math.abs(this.x - coordinate.x) +
                Math.abs(this.y - coordinate.y);

            if (distance > 1) {
                return;
            }

            if (! this.isFacingCell(coordinate)) {
                if (! this.isHastyMove()) {
                    this.graduallyTurnTowards(coordinate.x, coordinate.y);
                    this.targetCheck(gameMap);
                    return;
                }

                this.turnTowards(coordinate);
            }

            if (this.hasTarget() && this.targetEntityId !== null) {
                const targetCoordinate = this.getCoordinateInFront();
                const checkingEntity = this;
                const targetEntity = gameMap.entities.find(e =>
                    e.x === targetCoordinate.x &&
                    e.y === targetCoordinate.y &&
                    e.id === this.targetEntityId
                );

                if (targetEntity) {
                    targetEntity?.onTouch(gameMap, this);
                    this.targetCheck(gameMap);
                    return;
                }
            }

            const alreadyOnTarget =
                this.hasTarget() &&
                this.x === coordinate.x &&
                this.y === coordinate.y;

            if (alreadyOnTarget) {
                return;
            }

            const targetCoordinate = this.getCoordinateInFront();
            const cellIsOccupied = gameMap.cellIsOccupied(
                targetCoordinate.x,
                targetCoordinate.y
            );

            ! gameMap.cellIsOccupied(targetCoordinate.x, targetCoordinate.y) &&
                this.moveForward(gameMap);

            this.targetCheck(gameMap);
        },

        graduallyTurnTowardsDirection: function(targetDirection) {
            if (targetDirection === this.direction) {
                // The entity is already facing the right way
                return;
            }

            // If the target is behind the entity, turn in either direction
            if (Math.abs(targetDirection - this.direction) === 2) {
                this.preferLeftTurnFirst ? this.turnLeft() : this.turnRight();
                return;
            }

            ((this.direction + 3) % 4) === targetDirection
                ? this.turnLeft()
                : this.turnRight();
        },

        graduallyTurnTowards: function(targetX, targetY) {
            const DX = [0, 1, 0, -1];
            const DY = [-1, 0, 1, 0];

            for (let i = 0; i < 4; i++) {
                const directionFound =
                    this.x + DX[i] === targetX &&
                    this.y + DY[i] === targetY;

                if (directionFound) {
                    this.graduallyTurnTowardsDirection(i);
                }
            }
        },

        getDisplayName: function() {
            console.warn(
                "Using default display name. Override it, programmer!",
                { entityType: this.type }
            );

            return typeof this.type === "string" && this.type.length > 0
                ? this.type.charAt(0).toUpperCase() + this.type.slice(1)
                : "(Unnamed Entity)";
        },

        getDisplayCharacter: function() {
            console.warn(
                "Using default display character. Override it, programmer!",
                { entityType: this.type }
            );

            return this.type.substr(0, 1).toUpperCase();
        },

        getSceneArtId: function(seenFromX, seenFromY) {
            return this?.leader?.type || "void";
        },

        getExpReward: function() {
            let totalExperience = 0;

            for (const partyMember of this.party) {
                totalExperience += (
                    (partyMember.rewards.exp.base ?? 0) *
                    (partyMember.rewards.exp.levelMultiplier ?? 0) *
                    (partyMember.stats.progression.level ?? 0)
                );
            }

            return totalExperience;
        },

        getWeight: function() {
            const contents = this.inventory.contents;

            const itemWeight = Object.keys(contents.items).map(
                e => contents.items[e] * (ITEMS[e]?.weight || 0)
            ).reduce((a, c) => a + c, 0);

            const weaponWeight = Object.keys(contents.weapons).map(
                e => contents.weapons[e] * (WEAPONS[e]?.weight || 0)
            ).reduce((a, c) => a + c, 0);

            const armorWeight = Object.keys(contents.armor).map(
                e => contents.armor[e] * (ARMOR[e]?.weight || 0)
            ).reduce((a, c) => a + c, 0);

            const ringWeight = Object.keys(contents.rings).map(
                e => contents.rings[e] * (RINGS[e]?.weight || 0)
            ).reduce((a, c) => a + c, 0);

            const partyWeight =
                this.party.map(e => e.getWeight()).reduce((a, c) => a + c, 0);

            return (
                itemWeight +
                weaponWeight +
                armorWeight +
                ringWeight +
                partyWeight
            );
        },

        getWeightCapacity: function() {
            return 9001;
        },

        inventory: {
            contents: {
                bitcoins: 0,
                items: {},
                weapons: {},
                armor: {},
                rings: {},
            },

            /**
             * Add a given amount to the bitcoin count
             *
             * @param Number amount Bitcoins to add to the inventory
             * @return bool True if the addition was successful
             */
            giveBitcoins(amount) {
                if (! Number.isInteger(amount) || amount < 0) {
                    console.error(
                        "Amount must be a non-negative integer",
                        { amount }
                    );
                    return false;
                }

                this.contents.bitcoins += amount;
                if (amount !== 0) {
                    this.onBitcoinChange?.(this.contents.bitcoins);
                }

                return true;
            },

            /**
             * Deduct a given amount to the bitcoin count
             *
             * @param Number amount Bitcoins to subtract from the inventory
             * @return bool True if the subtraction was successful
             */
            takeBitcoins(amount) {
                if (! Number.isInteger(amount) || amount < 0) {
                    console.error(
                        "Amount must be a non-negative integer",
                        { amount }
                    );
                    return false;
                }

                if (this.contents.bitcoins - amount < 0) {
                    return false;
                }

                this.contents.bitcoins -= amount;
                if (amount !== 0) {
                    this.onBitcoinChange?.(this.contents.bitcoins);
                }

                return true;
            },

            useItem(id, actorMember, targetMember = null) {
                if (! this.hasItem(id)) {
                    console.error(
                        "Tried to use an item that you don't have!",
                        { id, actorMember, targetMember }
                    );
                    return false;
                }

                if (! ITEMS[id].use(actorMember, targetMember)) {
                    return false;
                }

                this.deductItem(id);

                return true;
            },

            _add(category, id, quantity) {
                if (! Number.isInteger(quantity) || quantity < 1) {
                    console.error(
                        "Quantity must be a positive integer",
                        { quantity }
                    );
                    return;
                }

                if (! this.contents[category].hasOwnProperty(id)) {
                    this.contents[category][id] = 0;
                }

                this.contents[category][id] += quantity;

                this.onInventoryContentsChanged?.(category, id);
            },
            addItem(itemId, quantity = 1) {
                this._add("items", itemId, quantity);
            },
            addWeapon(weaponId, quantity = 1) {
                this._add("weapons", weaponId, quantity);
            },
            addArmor(armorId, quantity = 1) {
                this._add("armor", armorId, quantity);
            },
            addRing(ringId, quantity = 1) {
                this._add("rings", ringId, quantity);
            },

            _deduct(category, id, quantity) {
                if (! Number.isInteger(quantity) || quantity < 1) {
                    console.error(
                        "Quantity must be a positive integer",
                        { quantity }
                    );
                    return false;
                }

                this.contents[category][id] -= quantity;

                if (this.contents[category][id] < 1) {
                    delete this.contents[category][id];
                }

                this.onInventoryContentsChanged?.(category, id);

                return quantity > 0;
            },
            deductItem(itemId, quantity = 1) {
                return this._deduct("items", itemId, quantity);
            },
            deductWeapon(weaponId, quantity = 1) {
                return this._deduct("weapons", weaponId, quantity);
            },
            deductArmor(armorId, quantity = 1) {
                return this._deduct("armor", armorId, quantity);
            },
            deductRing(ringId, quantity = 1) {
                return this._deduct("rings", ringId, quantity);
            },

            _has(category, id, quantity) {
                if (! Number.isInteger(quantity) || quantity < 1) {
                    console.error(
                        "Quantity must be a positive integer",
                        { quantity }
                    );
                    return;
                }

                return Boolean(
                    this.contents[category].hasOwnProperty(id) &&
                    this.contents[category][id] >= quantity
                );
            },
            hasItem(itemId, quantity = 1) {
                return this._has("items", itemId, quantity);
            },
            hasAnyItem() {
                return Object.keys(this.contents.items).length > 0;
            },
            hasWeapon(weaponId, quantity = 1) {
                return this._has("weapons", weaponId, quantity);
            },
            hasAnyWeapon() {
                return Object.keys(this.contents.weapons).length > 0;
            },
            hasArmor(armorId, quantity = 1) {
                return this._has("armor", armorId, quantity);
            },
            hasAnyArmor() {
                return Object.keys(this.contents.armor).length > 0;
            },
            hasRing(ringId, quantity = 1) {
                return this._has("rings", ringId, quantity);
            },
            hasAnyRing() {
                return Object.keys(this.contents.rings).length > 0;
            },

            isEmpty: function() {
                return Boolean(
                    ! this.hasAnyItem() &&
                    ! this.hasAnyWeapon() &&
                    ! this.hasAnyArmor() &&
                    ! this.hasAnyRing()
                );
            },
        },

        partyOwnsWeapon(weaponId) {
            return (
                this.inventory.hasWeapon(weaponId) ||
                this.party.some(e => e.equipped.weapon === weaponId)
            );
        },

        partyOwnsArmor(armorId) {
            return (
                this.inventory.hasArmor(armorId) ||
                this.party.some(e => e.equipped.armor === armorId)
            );
        },

        partyOwnsRing(ringId) {
            return (
                this.inventory.hasRing(ringId) ||
                this.party.some(e =>
                    e.equipped.ring.left === ringId ||
                    e.equipped.ring.right
                )
            );
        },

        // Returns "normal", "warning", or "danger" depending on load
        getWeightLevel: function() {
            const percentage =
                this.getWeight() / this.getWeightCapacity();

            return percentage < 0.5
                ? "normal"
                : (percentage < 0.8 ? "warning" : "danger");
        },

        getPartyWeapons: function() {
            const weapons = structuredClone(this.inventory.contents.weapons);

            for (const partyMember of this.party) {
                const memberWeapon = partyMember.equipped.weapon;
                if (memberWeapon) {
                    weapons[memberWeapon] = (weapons[memberWeapon] || 0) + 1;
                }
            }

            const sortedWeapons = {};
            for (const weaponId of Object.keys(WEAPONS)) {
                if (Object.hasOwn(weapons, weaponId)) {
                    sortedWeapons[weaponId] = weapons[weaponId];
                }
            }

            return sortedWeapons;
        },

        getPartyArmor: function() {
            const armor = structuredClone(this.inventory.contents.armor);

            for (const partyMember of this.party) {
                const memberArmor = partyMember.equipped.armor;
                if (memberArmor) {
                    armor[memberArmor] = (armor[memberArmor] || 0) + 1;
                }
            }

            const sortedArmor = {};
            for (const armorId of Object.keys(ARMOR)) {
                if (Object.hasOwn(armor, armorId)) {
                    sortedArmor[armorId] = armor[armorId];
                }
            }

            return sortedArmor;
        },

        getPartyRings: function() {
            const rings = structuredClone(this.inventory.contents.rings);

            for (const partyMember of this.party) {
                const memberRings =
                    Object.values(partyMember.equipped.ring).filter(e => e);

                for (const ringId of memberRings) {
                    rings[ringId] = (rings[ringId] || 0) + 1;
                }
            }

            const sortedRings = {};
            for (const ringId of Object.keys(RINGS)) {
                if (Object.hasOwn(rings, ringId)) {
                    sortedRings[ringId] = rings[ringId];
                }
            }

            return sortedRings;
        },

        getFullInventoryContents: function() {
            const contents = structuredClone(this.inventory.contents);

            for (const partyMember of this.party) {
                const equipment = partyMember.equipped;

                if (equipment.weapon !== null) {
                    contents.weapons[equipment.weapon] =
                        (contents.weapons[equipment.weapon] || 0) + 1;
                }

                if (equipment.armor !== null) {
                    contents.armor[equipment.armor] =
                        (contents.armor[equipment.armor] || 0) + 1;
                }

                if (equipment.ring.left !== null) {
                    contents.rings[equipment.ring.left] =
                        (contents.rings[equipment.ring.left] || 0) + 1;
                }

                if (equipment.ring.right !== null) {
                    contents.rings[equipment.ring.right] =
                        (contents.rings[equipment.ring.right] || 0) + 1;
                }
            }

            return contents;
        },

        party: [],
        get leader() {
            return this.party[0] ?? null;
        },
        maxPartyMembers: 6,
        addPartyMember: function(partyMember) {
            if (this.party.length >= this.maxPartyMembers) {
                console.warn(
                    "Cannot add a new member because the party is full",
                    { partyMember }
                );
                return false;
            }

            partyMember.parent = this;
            this.party.push(partyMember);
            this.onAddPartyMember?.(partyMember);
            this.onPartyChange?.();
            return true;
        },
        releasePartyMember: function(partyMember) {
            const partyCountBeforeRelease = this.party.length;
            this.party = this.party.filter(e => e.id !== partyMember.id);

            if (this.party.length === partyCountBeforeRelease) {
                console.warn("No party member was released", { partyMember });
                return false;
            }

            this.onReleasePartyMember?.(partyMember);
            this.onPartyChange?.();

            return true;
        },
        partyIsFull: function() {
            return this.party.length >= this.maxPartyMembers;
        },
        purgeDeadPartyMembers: function() {
            this.party = this.party.filter(e => ! e.isDead());
        },

        healParty: function(hp) {
            for (const partyMember of this?.party || []) {
                partyMember.heal(hp);
            }
        },

        damageParty: function(hp) {
            for (const partyMember of this?.party || []) {
                partyMember.damage(hp);
            }
        },

        checkForDeath: function() {
            if (! this.isAlive) {
                return;
            }

            const partyIsDead =
                this.party.filter(e => ! e.isDead()).length === 0;

            if (partyIsDead) {
                this.die();
            }
        },

        die: function(killedByEntity = null) {
            killedByEntity?.killedMonsters?.(this.party.length);
            this.isAlive = false;
            this.onDie?.(killedByEntity);
        },

        // Fires after all party members have died
        onDie: function() {
            this.isActive = false;
        },

        /**
         * Heals the whole party relative to each member's max HP
         *
         * Note that this applies 3x as much to the player
         * This logic may move to the healing tile specifically since the
         * healing tile should heal 0.3x the player's max HP, but 0.1 for
         * everyone else
         *
         * @param float fractionalHp The fractional value of the member's max HP
         */
        healPartyFractional: function(fractionalHp) {
            for (const partyMember of this?.party || []) {
                const multiplier =
                    fractionalHp * (partyMember.name === "player" ? 3 : 1);

                const healHp = Math.ceil(
                    partyMember.getEffectiveCoreStat("maxHp") * fractionalHp
                );

                partyMember.heal(healHp);
            }
        },

        /**
         * Damages the whole party relative to each member's max HP
         *
         * @param float fractionalHp The fractional value of the member's max HP
         * @return Array of objects containing party damage values
         */
        damagePartyFractional: function(fractionalHp) {
            const damageValues = [];

            for (const partyMember of this?.party || []) {
                const damageHp = Math.ceil(
                    partyMember.getEffectiveCoreStat("maxHp") * fractionalHp
                );

                partyMember.damage(damageHp);
                damageValues.push({ partyMemberId: partyMember.id, damageHp });
            }

            return damageValues;
        },

        givePartyExperience: function(experiencePoints) {
            for (const partyMember of this?.party || []) {
                partyMember.giveExperience(experiencePoints);
            }
        },

        partyMemberHasRingEquipped: function(ringId) {
            for (const partyMember of this?.party || []) {
                const hasRingEquipped = (
                    partyMember?.equipped?.ring?.leftHand === ringId ||
                    partyMember?.equipped?.ring?.rightHand === ringId
                );

                if (hasRingEquipped) {
                    return true;
                }
            }

            return false;
        },

        talk: function(
            partyMemberId = null,
            playerMessage = null,
            onTalkEnd = null
        ) {
            const partyMember = partyMemberId
                ? this.party.find(e => e.id === partyMemberId)
                : randomEntry(
                    this.party.filter(e =>
                        Array.isArray(e?.talkSlots) &&
                        e.talkSlots.length > 0
                    )
                );

            if (! partyMember) {
                console.debug("No party members to talk to", { partyMemberId });
                return;
            }

            updateBattleLog(
                `<span class="player">--you pull out your translator-- </span>`
            );

            const showPortrait = ! BattleSystem.isActive && partyMember?.type;
            partyMember.say(
                partyMember.generateStatement(playerMessage),
                showPortrait,
                onTalkEnd
            );
        },
    };

    Object.defineProperty(mapEntity, "id", {
        writable: false,
        configurable: false,
    });

    return mapEntity;
}
