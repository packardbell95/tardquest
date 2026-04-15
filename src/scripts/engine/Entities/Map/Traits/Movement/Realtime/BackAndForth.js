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

    entity.move = function(gameMap) {
        if (this.movementDisabled) {
            return;
        }

        const target = this.getCoordinateInFront();
        const cellIsOccupied =
            gameMap.getCell(target.x, target.y)?.type !== "floor";

        const entitiesInFront = gameMap.entities.filter(e =>
            e.x === target.x &&
            e.y === target.y &&
            typeof e.onTouch === "function"
        );

        for (const entityInFront of entitiesInFront) {
            entityInFront.onTouch(gameMap, this);
        }

        if (cellIsOccupied) {
            this.turnAround();

            if (this.isHastyMove()) {
                const target = this.getCoordinateInFront();
                const cellIsOccupied =
                    gameMap.getCell(target.x, target.y)?.type !== "floor";

                if (! cellIsOccupied) {
                    this.moveForward(gameMap);
                }
            }
        } else {
            this.moveForward(gameMap);
        }

        gameMap.triggerOnEnterEvent(this);
    };
}
