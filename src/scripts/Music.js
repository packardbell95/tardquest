/**
 * Music handling system for TardQuest
 *
 * CONCEPTS
 * To make it easy to (randomly) select music for the game, all music is
 * registered at once with a set of required information. Any given track can
 * be called directly by its unique ID, or through tags that match against the
 * registered music
 *
 * Even if audio is disabled, this system still tracks what should have been
 * played. This is because the player might decide to disable individual tracks
 * or even the system itself. When they resume, the system will know what audio
 * should be played, and will start operating appropriately
 *
 * BASIC USAGE
 * Instantiate the music system by calling it with a `collection` containing
 * the details of the audio that will be played in game along with an optional
 * set of callbacks:
 *
 * ```
 * const music = new Music({
 *     example: {
 *         audio: new Audio("my/example.mp3"),
 *         playback: {
 *             looped: true,
 *         },
 *         info: {
 *             title: "Title",
 *             artist: "Xx_TheMilkMan69_xX"
 *         },
 *         tags: ["sweet tunes"],
 *     }, {
 *         play: (trackId, trackInfo, tag) =>
 *             console.log("Playing", { trackId, trackInfo, tag }),
 *         stop: () => console.log("Music stopped"),
 *     }
 * });
 * ```
 *
 * Now any audio in the object can be played easily:
 * ```
 * // Play a specific track
 * music.play("example");
 *
 * // Play a random track by tag
 * music.play("sweet tunes");
 *
 * // Stop music
 * music.stop();
 *
 * CALLBACKS
 * Callbacks can be registered to know when a piece of music plays or when all
 * music is stopped:
 *  - play: (trackId, trackInfo, tag): Called when a track starts playing
 *    - trackId (string): The unique identifier of the track that's being played
 *    - trackInfo (object): Informational details about the track
 *      - title (string): The name of the track
 *      - artist (string): The name of the track's composer
 *    - tag (string|null): The tag that was used to call the track, or null if
 *                         no tag was used
 *  - stop: (): Called when all music stops playing (not when the track changes)
 *
 */
class Music {
    #collection = {};
    #lastTagged = {};
    #tagDisabled = {};
    #currentlyPlayingTrackId = null;
    #currentlyPlayingTag = null;
    #enabled = true;
    #callbacks = {
        play: null,
        stop: null,
    };

    /**
     * Creates an instance of the music system
     *
     * @param collection object describing all music in the game
     * @param callbacks object of callbacks that fire after playback changes
     */
    constructor(collection, callbacks) {
        if (! this.#validate(collection)) {
            return;
        }

        this.#collection = collection;
        this.#initialize();
        this.#setCallbacks(callbacks);
    }

    /**
     * Performs validation against the music collection object
     * Prints console messages that describe any errors that are found
     *
     * @param collection object describing all music in the game
     * @return bool true if the music object is properly formed
     */
    #validate(collection) {
        if (! typeof collection === "object") {
            console.error("Collection must be an object", { collection });
            return false;
        }

        const ids = Object.keys(collection);
        ids.forEach((id) => {
            const entry = collection[id];

            // Audio check
            if (! entry?.audio) {
                console.error("No audio track defined", { entry });
                return false;
            }

            if (! entry.audio instanceof Audio) {
                console.error("Audio is not an audio object", { entry });
                return false;
            }

            // Playback check
            if (typeof entry?.playback !== "object") {
                console.error("The playback must be an object", { entry });
                return false;
            }

            const definedLooped = entry.playback.hasOwnProperty("looped");
            if (definedLooped && typeof entry.playback.looped !== "boolean") {
                console.error(
                    "The looped property is set within the playback, but " +
                    "it is not a boolean",
                    { entry }
                );
                return false;
            }

            if (entry.playback.hasOwnProperty("nextTrackId")) {
                if (typeof entry.playback.nextTrackId !== "string") {
                    console.error(
                        "A nextTrackId is defined, but is not a string",
                        { entry }
                    );
                    return false;
                }

                if (definedLooped && entry.playback.looped) {
                    console.error(
                        "Track's playback specifies that it is looped, but " +
                        "also has a next track set that will never be reached",
                        { entry }
                    );
                    return false;
                }
            }

            // Track info
            if (typeof entry?.info !== "object") {
                console.error("The entry must have an info object", { entry });
                return false;
            }

            if (typeof entry.info?.title !== "string") {
                console.error(
                    "The track info's title must be a string",
                    { entry }
                );
                return false;
            }

            if (typeof entry.info?.artist !== "string") {
                console.error(
                    "The track info's artist must be a string",
                    { entry }
                );
            }

            // Tags
            if (! Array.isArray(entry?.tags)) {
                console.error("The entry has no tags array", { entry });
                return false;
            }

            if (entry.tags.filter((e) => typeof e !== "string").length > 0) {
                console.error(
                    "The entry has tags that are not strings",
                    { entry }
                );
                return false;
            }
        });

        return true;
    }

    /**
     * Wires up settings and event handlers for the audio collection
     */
    #initialize() {
        const ids = Object.keys(this.#collection);

        ids.forEach((id) => {
            const entry = this.#collection[id];

            if (entry.playback?.looped) {
                entry.audio.loop = true;
            } else {
                entry.audio.addEventListener(
                    "ended",
                    entry.playback?.nextTrackId
                        ? () => this.play(entry.playback.nextTrackId)
                        : () => this.stop()
                );
            }

            if (typeof entry?.playback?.onEnded === "function") {
                entry.audio.addEventListener(
                    "ended",
                    entry.playback.onEnded
                );
            }
        });
    }

    /**
     * Validates and registers any callbacks that were provided
     *
     * @param callbacks object of callbacks, including `play` and `stop`
     */
    #setCallbacks(callbacks) {
        const keys = Object.keys(this.#callbacks);

        keys.forEach((key) => {
            if (callbacks.hasOwnProperty(key)) {
                if (typeof callbacks[key] === "function") {
                    this.#callbacks[key] = callbacks[key];
                } else {
                    console.warn(
                        "The supplied callback is not a function, so it " +
                        "will be ignored",
                        { key, callback: callbacks[key] }
                    );
                }
            }
        });
    }

    /**
     * Enables the audio system
     * When enabled, requested audio tracks will be played
     */
    enable() {
        this.#enabled = true;
        this.#refreshCurrentlyPlayingTag();
    }

    /**
     * Disables the audio system
     * When disabled, no requested audio will be played
     */
    disable() {
        this.#enabled = false;
        this.stop();
    }

    /**
     * Determines if the audio system has been enabled
     *
     * @return bool true if the system is enabled
     */
    isEnabled() {
        return this.#enabled;
    }

    /**
     * Turns the audio system off if it's on, and vice-versa
     */
    toggle() {
        this.isEnabled() ? this.disable() : this.enable();
    }

    /**
     * Stops audio playback of the current piece of music
     * If music was stopped, the stop() callback will be fired
     */
    stop() {
        const fireCallback = this.#currentlyPlayingTrackId !== null;
        if (this.#enabled) {
            this.#currentlyPlayingTag = null;
        }
        this.#stop();

        if (fireCallback) {
            this.#callbacks?.stop();
        }
    }

    /**
     * Internal handler for stopping music
     * This is separated from stop() to avoid unintentionally firing callbacks
     */
    #stop() {
        if (this.#currentlyPlayingTrackId === null) {
            return;
        }

        const track = this.#collection?.[this.#currentlyPlayingTrackId];
        if (! track) {
            console.error(
                "The currently-playing track has disappeared",
                { currentlyPlayingTrackId: this.#currentlyPlayingTrackId }
            );
            return;
        }

        track.audio.pause();
        track.audio.currentTime = 0;
        this.#currentlyPlayingTrackId = null;
    }

    /**
     * Plays a specific track
     *
     * @param trackId string ID of the track to play
     * @param tag string|null The tag that was called to play this track, if any
     */
    play(trackId, tag = null) {
        this.#lastTagged[tag] = trackId;

        if (! this.#enabled) {
            return;
        }

        if (! this.#collection.hasOwnProperty(trackId)) {
            console.error("Audio track not found", { trackId });
            return;
        }

        this.#stop();

        const track = this.#collection[trackId];
        this.#currentlyPlayingTrackId = trackId;
        this.#currentlyPlayingTag = tag;
        track.audio.currentTime = 0;
        track.audio.play();
        this.#callbacks?.play(trackId, track.info, tag);
    }

    /**
     * Selects a random entry from an array
     *
     * @param list Array of random items
     * @return Any randomly-selected result from the list
     */
    #randomEntry(list) {
        if (! Array.isArray(list)) {
            console.error(
                "Cannot choose a random entry because the list is not an array",
                { list }
            );
            return null;
        }

        const index = Math.floor(Math.random() * list.length);
        return list[index];
    }

    /**
     * Plays a random track related to a given tag
     *
     * Will not play tracks that have been disabled for the tag
     * @see tagEnable()
     *
     * @param tag string used to identify a subset of tracks to select from
     */
    playRandom(tag) {
        this.#currentlyPlayingTag = tag;
        const matchingTrackIds = [];
        const ids = Object.keys(this.#collection);

        ids.forEach((id) => {
            const includeTrack =
                this.#collection[id].tags.includes(tag) &&
                ! (this.#tagDisabled[tag] || []).includes(id);

            if (includeTrack) {
                matchingTrackIds.push(id);
            }
        });

        if (matchingTrackIds.length === 0) {
            this.stop();
            console.warn(
                "Could not find any tracks that match the requested tag",
                { tag }
            );
            return;
        }

        const selectedId = this.#randomEntry(matchingTrackIds);
        if (selectedId === null) {
            console.error(
                "Failed to randomly select a track",
                { matchingTrackIds }
            );
            return;
        }

        this.play(selectedId, tag);
    }

    /**
     * Resumes a paused track that was first started with a tag
     *
     * @param tag string tag to resume playing
     */
    resumeTag(tag) {
        if (typeof tag !== "string") {
            console.warn("Supplied tag is not a string", { tag });
            return;
        }

        this.#lastTagged?.[tag]
            ? this.play(this.#lastTagged?.[tag], tag)
            : this.playRandom(tag);
    }

    /**
     * Returns the ID of the last track that was played with a given tag
     *
     * @param tag string Tag with the last track's ID to retrieve
     * @return string|null The ID of the last track played with the tag, or null
     */
    getLastTaggedTrackId(tag) {
        if (typeof tag !== "string") {
            console.warn("Supplied tag is not a string", { tag });
            return;
        }

        return this.#lastTagged[tag] || null;
    }

    /**
     * Checks to see if a track has a specific tag
     *
     * @param trackId string ID of the track to check
     * @param tag string Tag to check for on the specified track
     * @return bool True if the track has the requested tag
     */
    #hasTag(trackId, tag) {
        return Boolean(this.#collection[trackId]?.tags.includes(tag));
    }

    /**
     * Enables a track that has been disabled for a specific tag
     *
     * @param tag string The tag with the track to re-enable
     * @param trackId string The ID of the track to re-enable
     */
    tagEnable(tag, trackId) {
        if (typeof tag !== "string") {
            console.warn("Supplied tag is not a string", { tag });
            return;
        }

        if (typeof trackId !== "string") {
            console.warn("Supplied trackId is not a string", { trackId });
            return;
        }

        if (! this.#hasTag(trackId, tag)) {
            console.warn(
                "The tag isn't set on the specified track",
                { trackId, tag }
            );
            return;
        }

        if (! this.#tagDisabled.hasOwnProperty(tag)) {
            return;
        }

        this.#tagDisabled[tag] =
            this.#tagDisabled[tag].filter(id => id !== trackId);

        if (this.#tagDisabled[tag].length === 0) {
            delete this.#tagDisabled[tag];
        }

        this.#refreshCurrentlyPlayingTag();
    }

    /**
     * Disables a specific track from selection when playing random tagged music
     *
     * @param tag string Tag to exclude the track from during random selection
     * @param trackId string ID of the track to disable
     */
    tagDisable(tag, trackId) {
        if (typeof tag !== "string") {
            console.warn("Supplied tag is not a string", { tag });
            return;
        }

        if (typeof trackId !== "string") {
            console.warn("Supplied trackId is not a string", { trackId });
            return;
        }

        if (! this.#hasTag(trackId, tag)) {
            console.warn(
                "The tag isn't set on the specified track",
                { trackId, tag }
            );
            return;
        }

        if (this.#lastTagged?.[tag] === trackId) {
            delete this.#lastTagged[tag];
        }

        this.#tagDisabled.hasOwnProperty(tag)
            ? this.#tagDisabled[tag].push(trackId)
            : this.#tagDisabled[tag] = [trackId];

        this.#refreshCurrentlyPlayingTag();
    }

    /**
     * Checks to see if tagged music should be playing and will resume/select it
     */
    #refreshCurrentlyPlayingTag() {
        const tag = this.#currentlyPlayingTag;
        if (! tag) {
            return;
        }

        if (this.#currentlyPlayingTrackId === null) {
            this.playRandom(tag);
            return;
        }

        if (! this.isTagEnabled(tag, this.#currentlyPlayingTrackId)) {
            this.playRandom(tag);
            return;
        }
    }

    /**
     * Checks to see if a track is enabled for selection under a specific tag
     *
     * @param tag string Tag that the track belongs to
     * @param trackId string ID of the track whose status to check
     * @return bool True if the track is enabled for the tag
     */
    isTagEnabled(tag, trackId) {
        return Boolean(! this.#tagDisabled?.[tag]?.includes(trackId));
    }

    /**
     * Toggles a track for random selection under a given tag
     *
     * @param tag string Tag that the track belongs to
     * @param trackId string ID of the track to toggle for the given tag
     */
    tagToggle(tag, trackId) {
        this.isTagEnabled(tag, trackId)
            ? this.tagDisable(tag, trackId)
            : this.tagEnable(tag, trackId);
    }

    /**
     * Returns all disabled tracks, specific to a given tag if one is supplied
     *
     * @param tag string|null Optional tag to return
     * @return Array|object All disabled track IDs keyed by tag, or a list of
     *                      all disabled tracks for a tag if one is supplied
     */
    getDisabledTracks(tag = null) {
        return tag === null
            ? this.#tagDisabled
            : this.#tagDisabled[tag];
    }

    /**
     * Performs validation for a supplied set of disabled tracks
     *
     * @param settings Any value to validate
     * @return bool True if the settings are valid
     */
    #validateTrackSettings(settings) {
        if (typeof settings !== "object") {
            console.error(
                "Settings must be an object keyed by tag",
                { settings }
            );
            return false;
        }

        Object.keys(settings).forEach((tag) => {
            const isValid =
                Array.isArray(settings[tag]) &&
                settings[tag].filter(s => typeof s !== "string");

            if (! isValid) {
                console.error("Settings must be arrays of strings");
                return false;
            }
        });

        return true;
    }

    /**
     * Sets a collection of disabled tracks by tag all at once
     *
     * @param settings object A collection of tagged tracks to disable
     */
    setDisabledTracks(settings = {}) {
        if (! this.#validateTrackSettings(settings)) {
            return;
        }

        this.#tagDisabled = structuredClone(settings);
    }

    /**
     * Returns basic track details, including the ID of the track itself
     *
     * @param trackId string ID of the track
     * @return object|null Details about the track if matched, or null
     */
    #getTrackInfo(trackId) {
        const entry = this.#collection[trackId];
        return entry ? {
            id: trackId,
            ...entry.info,
        } : null;
    }

    /**
     * Returns information about the current track that's playing
     *
     * @return object|null Object of details if music is playing, or null
     */
    getCurrentlyPlayingTrack() {
        return this.#getTrackInfo(this.#currentlyPlayingTrackId);
    }

    /**
     * Returns a list of details related to all tracks with a given tag
     *
     * @param tag string Tag that tracks belong to
     * @return array of details of tracks matching the tag
     */
    getTracks(tag) {
        if (typeof tag !== "string") {
            console.warn("Supplied tag is not a string", { tag });
            return [];
        }

        const tracks = [];

        const ids = Object.keys(this.#collection);
        ids.forEach((id) => {
            const entry = this.#collection[id];
            if ((entry?.tags || []).includes(tag)) {
                tracks.push({
                    ...this.#getTrackInfo(id),
                    enabled: ! (this.#tagDisabled[tag] || []).includes(id),
                });
            }
        });

        return tracks;
    }
}
