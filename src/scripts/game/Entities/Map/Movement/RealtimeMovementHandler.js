"use strict";

const MapEntityRealtimeMovementHandler = {
    _intervalId: null,
    _midpointTimeoutId: null,
    _gameMap: null,
    _overriddenEntityIds: new Set(),
    movementIntervalMs: 500,

    /**
     * Determines whether or not an update should be made
     * This method is intended to be overridden with game state logic
     *
     * @return bool True if realtime movements can be made
     */
    canMove: function() {
        return true;
    },

    /**
     * Starts the movement handler
     *
     * @param GameMap gameMap The instance of the gamp map to poll
     */
    start: function(gameMap) {
        if (this._isAlreadyActive(gameMap)) {
            return;
        }

        this.stop();

        if (! (gameMap instanceof GameMap)) {
            console.error(
                "The gameMap must be an instance of GameMap",
                { gameMap }
            );
            return;
        }

        this._gameMap = gameMap;
        this._intervalId = setInterval(
            this._tick.bind(this),
            this.movementIntervalMs
        );
    },

    /**
     * Checks to see if the handler is already running for the given gameMap
     *
     * @param GameMap gameMap The instance of the active gamp map
     * @return bool True if the game map is already being updated
     */
    _isAlreadyActive: function(gameMap) {
        if (! gameMap instanceof GameMap || gameMap !== this._gameMap) {
            return false;
        }

        return this._intervalId !== null;
    },

    /**
     * Stops the movement handler
     */
    stop: function() {
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }

        if (this._midpointTimeoutId) {
            clearTimeout(this._midpointTimeoutId);
            this._midpointTimeoutId = null;
        }

        this._clearPoseOverrides();
    },

    _clearPoseOverrides: function() {
        for (const entityId of this._overriddenEntityIds) {
            SceneRenderer.clearEntityPoseOverride(entityId);
        }

        this._overriddenEntityIds.clear();
    },

    /**
     * Pings the game map instance to move the realtime entities
     */
    _tick: function() {
        if (! this.canMove()) {
            return;
        }

        if (! this._gameMap) {
            console.error("No game map is defined");
            return;
        }

        // Normally the previous midpoint timeout will already have completed
        // Clear anything left over in case the event loop was delayed
        if (this._midpointTimeoutId) {
            clearTimeout(this._midpointTimeoutId);
            this._midpointTimeoutId = null;
        }

        this._clearPoseOverrides();

        const realtimeEntities =
            this._gameMap.entities.filter(e => e.isAlive && e.isRealtime);

        const previousPoses =
            new Map(realtimeEntities.map(e => [ e.id, { x: e.x, y: e.y } ]));

        // Perform actual grid movement first
        this._gameMap.moveRealtimeEntities();

        // Draw moving entities halfway between their previous and current cells
        for (const entity of realtimeEntities) {
            const previousPose = previousPoses.get(entity.id);

            if (! previousPose || ! entity.isActive || ! entity.isAlive) {
                continue;
            }

            const moved =
                entity.x !== previousPose.x ||
                entity.y !== previousPose.y;

            if (! moved) {
                continue;
            }

            SceneRenderer.setEntityPoseOverride(entity.id, {
                x: previousPose.x + (entity.x - previousPose.x) / 2,
                y: previousPose.y + (entity.y - previousPose.y) / 2,
            });

            this._overriddenEntityIds.add(entity.id);
        }

        render();

        if (this._overriddenEntityIds.size === 0) {
            return;
        }

        this._midpointTimeoutId = setTimeout(() => {
            this._midpointTimeoutId = null;
            this._clearPoseOverrides();
            render();
        }, this.movementIntervalMs / 2);
    },
};
