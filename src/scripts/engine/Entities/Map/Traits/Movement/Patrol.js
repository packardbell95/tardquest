"use strict";

/**
 * Attaches patrol movement behavior to an entity
 *
 * @param object entity The entity that will receive patrol movement behavior
 */
function MapEntityTrait_AttachMovement_Patrol(entity) {
    if (entity === null || typeof entity !== "object") {
        console.error("Entity is not an object", { entity });
        return;
    }

    entity.movementType = "patrol";
    entity.patrolIndex = 0;
    entity.patrolPoints = null;

    entity.setPatrolPoints = function(
        gameMap,
        coordinates = [],
        startAtClosestCoordinate = false
    ) {
        const invalidCoordinates =
            coordinates.some(e => ! gameMap.inBounds(e.x, e.y));

        if (invalidCoordinates) {
            this.patrolPoints = [];
            console.error(
                "Patrol points must be integer coordinates within map bounds",
                { coordinates }
            );
            return;
        }

        this.patrolIndex = 0;
        this.patrolPoints = coordinates;

        let shortestDistance = Infinity;

        for (let i = 0; i < this.patrolPoints.length; i++) {
            const coordinate = this.patrolPoints[i];

            // Skip any spaces that the entity is already on since they
            // should be moving forward, not starting at a destination
            if (coordinate.x === this.x && coordinate.y === this.y) {
                continue;
            }

            // If we don't care about starting at the closest coordinate,
            // just start at the first spot that the entity isn't already on
            if (! startAtClosestCoordinate) {
                this.patrolIndex = i;
                break;
            }

            const path = gameMap.findPathCoordinated(
                { x: this.x, y: this.y },
                coordinate
            );

            if (path === null) {
                continue;
            }

            if (path.length < shortestDistance) {
                this.patrolIndex = i;
                shortestDistance = path.length;
            }
        }

        const target = this.patrolPoints[this.patrolIndex];
        this.setTarget(target.x, target.y, "patrol");
    };
}
