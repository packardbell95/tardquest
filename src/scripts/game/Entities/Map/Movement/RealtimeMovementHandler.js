"use strict";

const MapEntityRealtimeMovementHandler = {
    _intervalId: null,
    _gameMap: null,
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

        this._gameMap.moveRealtimeEntities();
        render();
    },
};
