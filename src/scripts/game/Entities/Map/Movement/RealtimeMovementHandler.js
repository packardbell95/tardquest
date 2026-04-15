"use strict";

const MapEntityRealtimeMovementHandler = {
    _intervalId: null,
    _gameMap: null,
    movementIntervalMs: 500,

    /**
     * Starts the movement handler
     *
     * @param GameMap gameMap The instance of the gamp map to poll
     */
    start: function(gameMap) {
        console.log("MapEntityRealtimeMovementHandler: start()", { gameMap });
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
     * Stops the movement handler
     */
    stop: function() {
        console.log("MapEntityRealtimeMovementHandler: stop()");
        if (this._intervalId) {
            clearInterval(this._intervalId);
        }
    },

    /**
     * Pings the game map instance to move the realtime entities
     */
    _tick: function() {
        console.log(
            "MapEntityRealtimeMovementHandler: Tick",
            { canMove: this.canMove(), hasGameMap: Boolean(this._gameMap) }
        );
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

    /**
     * Determines whether or not an update should be made
     * This method is intended to be overridden with game state logic
     *
     * @return bool True if realtime movements can be made
     */
    canMove: function() {
        return true;
    },
};
