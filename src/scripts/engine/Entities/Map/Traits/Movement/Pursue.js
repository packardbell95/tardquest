"use strict";

/**
 * Attaches pursuit movement behavior to an entity
 *
 * @param object entity The entity that will receive pursuing movement behavior
 */
function MapEntityTrait_AttachMovement_Pursue(entity) {
    if (entity === null || typeof entity !== "object") {
        console.error("Entity is not an object", { entity });
        return;
    }

    entity.movementType = "pursue";

    entity.targetEntity = function(id) {
        if (! Number.isInteger(id) && id !== null) {
            console.error("Targeted entity must be an integer or null");
        }

        this.targetEntityId = id;
    };

    entity.scanForNewTarget = function(gameMap) {
        if (this.targetEntityId !== null) {
            const targetEntity =
                gameMap.entities.find(e => e.id === this.targetEntityId);

            if (targetEntity) {
                this.target = {
                    x: targetEntity.x,
                    y: targetEntity.y
                };
            }
        }
    };

    entity.targetCheck = function(gameMap) {
        this.scanForNewTarget(gameMap);
    };
}
