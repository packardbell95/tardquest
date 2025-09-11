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

    constructor(collection, callbacks) {
        if (! this.#validate(collection)) {
            return;
        }

        this.#collection = collection;
        this.#initialize();
        this.#setCallbacks(callbacks);
    }

    #validate(collection) {
        if (! typeof collection === "object") {
            console.error("Collection music be an object", { collection });
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

    #setCallbacks(callbacks) {
        const keys = Object.keys(this.#callbacks);

        keys.forEach((key) => {
            if (callbacks.hasOwnProperty(key)) {
                if (typeof callbacks[key] === "function") {
                    this.#callbacks[key] = callbacks[key];
                } else {
                    console.warn(
                        "The supplied play callback is not a function, so it " +
                        "will be ignored",
                        { key, callback: callbacks[key] }
                    );
                }
            }
        });
    }

    enable() {
        this.#enabled = true;
        this.#refreshCurrentlyPlayingTag();
    }

    disable() {
        this.#enabled = false;
        this.stop();
    }

    isEnabled() {
        return this.#enabled;
    }

    toggle() {
        this.isEnabled() ? this.disable() : this.enable();
    }

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

    play(trackId, tag = null) {
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

    resumeTag(tag) {
        if (typeof tag !== "string") {
            console.warn("Supplied tag is not a string", { tag });
            return;
        }

        this.#lastTagged?.[tag]
            ? this.play(this.#lastTagged?.[tag], tag)
            : this.playRandom(tag);
    }

    #hasTag(trackId, tag) {
        return Boolean(this.#collection[trackId]?.tags.includes(tag));
    }

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

    isTagEnabled(tag, trackId) {
        return Boolean(! this.#tagDisabled?.[tag]?.includes(trackId));
    }

    tagToggle(tag, trackId) {
        this.isTagEnabled(tag, trackId)
            ? this.tagDisable(tag, trackId)
            : this.tagEnable(tag, trackId);
    }

    getDisabledTracks(tag = null) {
        return tag === null
            ? this.#tagDisabled
            : this.#tagDisabled[tag];
    }

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

    setDisabledTracks(settings = {}) {
        if (! this.#validateTrackSettings(settings)) {
            return;
        }

        this.#tagDisabled = settings;
    }

    #getTrackInfo(trackId) {
        const entry = this.#collection[trackId];
        return entry ? {
            id: trackId,
            ...entry.info,
        } : null;
    }

    getCurrentlyPlayingTrack() {
        return this.#getTrackInfo(this.#currentlyPlayingTrackId);
    }

    getTracks(tag) {
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
