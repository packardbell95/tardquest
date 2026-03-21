"use strict";

/**
 * Attaches wandering movement behavior to an entity
 * ⚠️ UNFINISHED
 *
 * @param object entity The entity that will receive wandering movement behavior
 */
function MapEntityTrait_AttachMovement_TargetAndWait(entity) {
    if (entity === null || typeof entity !== "object") {
        console.error("Entity is not an object", { entity });
        return;
    }

    entity.movementType = "target and wait";

    entity.alertLevel = 0;
    entity.objectsOfInterest = [];

    /**
     * Determines if a move is hasty or not
     * A hasty move is one that does not count a turn as a move
     * Target reason determines hastiness, eg: chasing the player
     *
     * @return bool True if the move is hasty
     */
    entity.isHastyMove = function() {
        return this.targetReason === "player" || this.mode === "retreat";
    };
}
