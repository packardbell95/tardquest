// Tests for Music
function Music_allTests()
{
    const silence = new Audio(generateSilentAudioUrl());
    let lastPlay = null;
    let lastStop = null;

    const collection = {
        themeSong: {
            audio: silence,
            playback: {
                looped: true,
            },
            info: {
                title: "Theme Song",
                artist: "Jazzy G",
            },
            tags: ["rock", "jazz", "music"],
        },
        ambulation: {
            audio: silence,
            playback: {
                looped: false,
            },
            info: {
                title: "Wandering Around at Night",
                artist: "Wally The Wiz",
            },
            tags: ["blues", "funk", "rock", "music"],
        },
        alert: {
            audio: silence,
            playback: {
                looped: true,
            },
            info: {
                title: "Alert!",
                artist: "DJ Car Crash",
            },
            tags: ["italo disco", "techno", "idm", "music"],
        },
    };

    const callbacks = {
        play: (trackId, trackInfo, tag) => {
            console.log("play()", { trackId, trackInfo, tag });
            lastPlay = { trackId, trackInfo, tag };
        },
        stop: () => lastStop = "Audio stopped",
    };

    test(
        "Enabling and disabling the music system",
        () => {
            const music = new Music(collection, callbacks);

            Assert.isTrue(
                music.isEnabled(),
                "The music system is enabled by default"
            );

            music.disable();
            Assert.isFalse(
                music.isEnabled(),
                "The music system has been turned off"
            );

            music.enable();
            Assert.isTrue(
                music.isEnabled(),
                "The music system has been re-enabled"
            );

            music.toggle();
            Assert.isFalse(
                music.isEnabled(),
                "The music system has been toggled off"
            );

            music.toggle();
            Assert.isTrue(
                music.isEnabled(),
                "The music system has been toggled back on"
            );
        },
    );

    test(
        "Regular playback",
        () => {
            const music = new Music(collection, callbacks);

            music.play("ambulation");

            Assert.deepEquals(
                {
                    id: "ambulation",
                    title: "Wandering Around at Night",
                    artist: "Wally The Wiz",
                },
                music.getCurrentlyPlayingTrack(),
                "Currently playing music details are returned on request"
            );

            Assert.isNull(lastPlay.tag, "No tag was used to start playback");
            Assert.equals(
                "ambulation",
                lastPlay.trackId,
                "The requested track's ID is provided"
            );
            Assert.equals(
                "Wandering Around at Night",
                lastPlay?.trackInfo?.title,
                "The title has been captured"
            );
            Assert.equals(
                "Wally The Wiz",
                lastPlay?.trackInfo?.artist,
                "The artist has been captured"
            );
            Assert.isNull(
                lastStop,
                "No audio has stopped yet"
            );

            music.stop();

            Assert.isNull(
                music.getCurrentlyPlayingTrack(),
                "No details are returned because no music is currently playing"
            );

            Assert.equals(
                "Audio stopped",
                lastStop,
                "Audio playback has been stopped"
            );

            lastPlay = null;
            lastStop = null;
        },
    );

    test(
        "Tagged playback",
        () => {
            const music = new Music(collection, callbacks);

            music.playRandom("italo disco");
            Assert.equals(
                "italo disco",
                lastPlay.tag,
                "The tag that was used to start playback was returned"
            );
            Assert.equals(
                "alert",
                lastPlay.trackId,
                "The matching track's ID is provided"
            );
            Assert.equals(
                "Alert!",
                lastPlay?.trackInfo?.title,
                "The matching track's title has been captured"
            );
            Assert.equals(
                "DJ Car Crash",
                lastPlay?.trackInfo?.artist,
                "The matching track's artist has been captured"
            );
            Assert.isNull(
                lastStop,
                "No audio has stopped yet"
            );

            music.stop();
            Assert.equals(
                "Audio stopped",
                lastStop,
                "Audio playback has been stopped"
            );

            lastPlay = null;
            lastStop = null;
        },
    );

    test(
        "Tagged music selection management",
        () => {
            const music = new Music(collection, callbacks);

            Assert.isNull(
                music.getLastTaggedTrackId("italo disco"),
                "No music matching the tag has been played yet"
            );

            music.playRandom("italo disco");

            Assert.equals(
                "alert",
                music.getLastTaggedTrackId("italo disco"),
                "The last tagged track ID is correctly identified"
            );

            Assert.equals(
                "italo disco",
                lastPlay.tag,
                "The tag that was used to start playback was returned"
            );
            Assert.equals(
                "alert",
                lastPlay.trackId,
                "The matching track's ID is provided"
            );
            Assert.equals(
                "Alert!",
                lastPlay?.trackInfo?.title,
                "The matching track's title has been captured"
            );
            Assert.equals(
                "DJ Car Crash",
                lastPlay?.trackInfo?.artist,
                "The matching track's artist has been captured"
            );
            Assert.isNull(
                lastStop,
                "No audio has stopped yet"
            );

            music.stop();
            Assert.equals(
                "Audio stopped",
                lastStop,
                "Audio playback has been stopped"
            );

            lastPlay = null;
            lastStop = null;

            music.resumeTag("italo disco");
            Assert.equals(
                "alert",
                lastPlay.trackId,
                "The matching track's ID is provided"
            );

            music.stop();
            Assert.equals(
                "Audio stopped",
                lastStop,
                "Audio playback has been stopped"
            );

            lastPlay = null;
            lastStop = null;
        },
    );

    test(
        "Enabling and disabling tagged tracks",
        () => {
            const music = new Music(collection, callbacks);

            Assert.isTrue(
                music.isTagEnabled("music", "themeSong"),
                "'Theme Song' is enabled for the 'music' tag"
            );
            Assert.isTrue(
                music.isTagEnabled("music", "ambulation"),
                "'Wandering Around at Night' is enabled for the 'music' tag"
            );
            Assert.isTrue(
                music.isTagEnabled("music", "alert"),
                "'Alert!' is enabled for the 'music' tag"
            );

            music.tagToggle("music", "themeSong");
            music.tagDisable("music", "alert");

            Assert.isFalse(
                music.isTagEnabled("music", "themeSong"),
                "'Theme Song' is disabled for the 'music' tag"
            );
            Assert.isTrue(
                music.isTagEnabled("music", "ambulation"),
                "'Wandering Around at Night' isn't disabled for the 'music' tag"
            );
            Assert.isFalse(
                music.isTagEnabled("music", "alert"),
                "'Alert!' is disabled for the 'music' tag"
            );

            Assert.deepEquals(
                { music: ["themeSong", "alert"] },
                music.getDisabledTracks(),
                "All disabled tracks have been returned"
            );

            Assert.deepEquals(
                ["themeSong", "alert"],
                music.getDisabledTracks("music"),
                "All disabled tracks have been returned for the 'music' tag"
            );

            const disabledTracks = {
                rock: ["themeSong"],
                funk: ["ambulation"],
                techno: ["alert"],
            };
            music.setDisabledTracks(disabledTracks);

            Assert.deepEquals(
                disabledTracks,
                music.getDisabledTracks(),
                "Disabled track settings are preserved"
            );

            Assert.deepEquals(
                [
                    {
                        id: "themeSong",
                        title: "Theme Song",
                        artist: "Jazzy G",
                        enabled: true,
                    },
                    {
                        id: "ambulation",
                        title: "Wandering Around at Night",
                        artist: "Wally The Wiz",
                        enabled: true,
                    },
                    {
                        id: "alert",
                        title: "Alert!",
                        artist: "DJ Car Crash",
                        enabled: true,
                    },
                ],
                music.getTracks("music"),
                "All tracks tagged 'music' are still enabled"
            );

            Assert.deepEquals(
                [
                    {
                        id: "themeSong",
                        title: "Theme Song",
                        artist: "Jazzy G",
                        enabled: false,
                    },
                    {
                        id: "ambulation",
                        title: "Wandering Around at Night",
                        artist: "Wally The Wiz",
                        enabled: true,
                    },
                ],
                music.getTracks("rock"),
                "All tracks tagged 'rock' are returned; themeSong is disabled"
            );
        },
    );
}
