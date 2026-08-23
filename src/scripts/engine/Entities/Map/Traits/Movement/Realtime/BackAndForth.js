"use strict";

/**
 * Attaches back and forth movement behavior to an entity
 * Intended for the boulding ball
 *
 * @param object entity The entity that will receive oscillating behavior
 */
function MapEntityTrait_AttachRealtimeMovement_BackAndForth(entity) {
    if (entity === null || typeof entity !== "object") {
        console.error("Entity is not an object", { entity });
        return;
    }

    entity.isRealtime = true;

    const getCoordinateInDirection = function(
        pose,
        direction = pose.direction
    ) {
        return {
            x: pose.x + entity._directionMatrix.x[direction],
            y: pose.y + entity._directionMatrix.y[direction],
        };
    };

    /**
     * Calculates this entity's next real-time movement without changing
     * authoritative entity state or firing any events.
     *
     * The virtualPoses map is shared between real-time entities so that
     * entities processed later can account for earlier planned movements.
     */
    entity.planRealtimeMove = function(gameMap, virtualPoses) {
        if (this.movementDisabled || ! this.isActive || ! this.isAlive) {
            return null;
        }

        const pose = virtualPoses.get(this.id);
        if (! pose) {
            console.error(
                "No virtual pose found for realtime entity",
                { entity: this }
            );

            return null;
        }

        const from = {
            x: pose.x,
            y: pose.y,
            direction: pose.direction,
        };

        /*
         * This is the coordinate the entity is facing before any
         * collision behavior changes its direction.
         */
        const touchCoordinate = getCoordinateInDirection(pose);

        /*
         * Preserve the existing behavior: this only checks whether
         * the map cell itself is floor. Entities do not make the
         * underlying cell non-floor.
         */
        const cellIsOccupied =
            gameMap.getCell(touchCoordinate.x, touchCoordinate.y)?.isWall;

        const entitiesInFront = gameMap.entities.filter(otherEntity => {
            if (otherEntity.id === this.id) {
                return false;
            }

            const otherPose = virtualPoses.get(otherEntity.id);

            return Boolean(
                otherPose &&
                otherPose.x === touchCoordinate.x &&
                otherPose.y === touchCoordinate.y &&
                typeof otherEntity.onTouch === "function"
            );
        });

        /*
         * Simulate only movement-related effects. This does not call
         * onTouch(), because that may cause damage, start encounters,
         * play sounds, or perform other real game actions.
         */
        for (const entityInFront of entitiesInFront) {
            entityInFront.previewRealtimeTouch?.(gameMap, this, virtualPoses);
        }

        if (cellIsOccupied) {
            pose.direction = (pose.direction + 2) % 4;

            /*
             * This preserves the existing hasty-movement branch,
             * even though the boulding ball currently uses the
             * default non-hasty behavior.
             */
            if (this.isHastyMove()) {
                const destination = getCoordinateInDirection(pose);
                const destinationIsOccupied = gameMap
                    .getCell(destination.x, destination.y)?.isWall;

                if (! destinationIsOccupied) {
                    pose.x = destination.x;
                    pose.y = destination.y;
                }
            }
        } else {
            /*
             * previewRealtimeTouch() may have changed this entity's
             * virtual direction. Recalculate the destination using
             * the resulting direction.
             */
            const destination = getCoordinateInDirection(pose);
            pose.x = destination.x;
            pose.y = destination.y;
        }

        return {
            entityId: this.id,
            from: from,
            to: {
                x: pose.x,
                y: pose.y,
            },
            direction: pose.direction,
        };
    };

    /*
     * This remains the authoritative commit operation. It fires
     * actual events and changes real entity coordinates.
     */
    entity.move = function(gameMap) {
        if (this.movementDisabled) {
            return;
        }

        const target = this.getCoordinateInFront();
        const cellIsOccupied = gameMap.getCell(target.x, target.y)?.isWall;
        const entitiesInFront = gameMap.entities.filter(otherEntity =>
            otherEntity.x === target.x &&
            otherEntity.y === target.y &&
            typeof otherEntity.onTouch === "function"
        );

        for (const entityInFront of entitiesInFront) {
            entityInFront.onTouch(gameMap, this);
        }

        if (cellIsOccupied) {
            this.turnAround();
            if (this.isHastyMove()) {
                const newTarget = this.getCoordinateInFront();
                const newCellIsOccupied =
                    gameMap.getCell(newTarget.x, newTarget.y)?.isWall;
                if (! newCellIsOccupied) {
                    this.moveForward(gameMap);
                }
            }
        } else {
            this.moveForward(gameMap);
        }

        gameMap.triggerOnEnterEvent(this);
    };
}
