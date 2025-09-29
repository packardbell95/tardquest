/**
 * Definitions for all of the music tracks available in the game
 *
 * Key
 * Track's unique identifier, used to specifically call the track in game, eg:
 * `music.play("vampireLurking");`
 *
 * Object
 * - audio (HTMLAudioElement): The instance that contains the audio to play
 * - playback (object): May take the following options:
 *   - looped (boolean): If true, the track will automatically loop
 *   - nextTrackId (string): The key that points to the next piece of music
 *                           to play after the current one finishes. Cannot be
 *                           used when `looped` is set to `true`
 * - info (object): Track details intended to be displayed to the player
 *   - title (string): The name of the track
 *   - artist (string): The name of the track's author
 * - tags (array): A collection of string tags, used to randomly select and
 *                 play music, eg: `music.playRandom(tagName);`
 */
const TARDQUEST_MUSIC_TRACKS = Object.freeze({
    title: {
        audio: new Audio("audio/music/title.mp3"),
        playback: {
            looped: true,
        },
        info: {
            title: "Title",
            artist: "Xx_TheMilkMan69_xX"
        },
        tags: [],
    },

    // Exploration tracks
    intoTheTardspire: {
        audio: new Audio("audio/music/explore1.mp3"),
        playback: {
            looped: true,
        },
        info: {
            title: "Into the Tardspire",
            artist: "Xx_TheMilkMan69_xX",
        },
        tags: ["exploration"],
    },
    metalSpoons: {
        audio: new Audio("audio/music/explore2.mp3"),
        playback: {
            looped: true,
        },
        info: {
            title: "Metal Spoons",
            artist: "endless_self",
        },
        tags: ["exploration"],
    },
    tardedWarrior: {
        audio: new Audio("audio/music/explore3.mp3"),
        playback: {
            looped: true,
        },
        info: {
            title: "Tarded Warrior",
            artist: "endless_self",
        },
        tags: ["exploration"],
    },
    mucalParasite: {
        audio: new Audio("audio/music/explore4.mp3"),
        playback: {
            looped: true,
        },
        info: {
            title: "Mucal Parasite",
            artist: "Xx_TheMilkMan69_xX",
        },
        tags: ["exploration"],
    },
    intoTheTardspireRedux: {
        audio: new Audio("audio/music/explore5.mp3"),
        playback: {
            looped: true,
        },
        info: {
            title: "Into the Tardspire REDUX",
            artist: "Xx_TheMilkMan69_xX",
        },
        tags: ["exploration"],
    },

    // Battle tracks
    tardusMembrane: {
        audio: new Audio("audio/music/battle1.mp3"),
        playback: {
            looped: true,
        },
        info: {
            title: "Tardus Membrane",
            artist: "Xx_TheMilkMan69_xX",
        },
        tags: ["battle"],
    },
    aDangerousGameOfTag: {
        audio: new Audio("audio/music/battle2.mp3"),
        playback: {
            looped: true,
        },
        info: {
            title: "A Dangerous Game of Tag",
            artist: "Xx_TheMilkMan69_xX",
        },
        tags: ["battle"],
    },
    eekACunt: {
        audio: new Audio("audio/music/battle3.mp3"),
        playback: {
            looped: true,
        },
        info: {
            title: "Eek! A Cunt!",
            artist: "Xx_TheMilkMan69_xX",
        },
        tags: ["battle"],
    },
    theCumdown: {
        audio: new Audio("audio/music/battle4.mp3"),
        playback: {
            looped: true,
        },
        info: {
            title: "The Cumdown",
            artist: "Xx_TheMilkMan69_xX",
        },
        tags: ["battle"],
    },
    surpriseCockfight: {
        audio: new Audio("audio/music/battle5.mp3"),
        playback: {
            looped: true,
        },
        info: {
            title: "SURPRISE COCKFIGHT!",
            artist: "Xx_TheMilkMan69_xX",
        },
        tags: ["battle"],
    },
    stabQuest: {
        audio: new Audio("audio/music/battle6.mp3"),
        playback: {
            looped: true,
        },
        info: {
            title: "Stab Quest",
            artist: "Kirbydogs",
        },
        tags: ["battle"],
    },

    // Vampire themes
    vampireBattleIntro: {
        audio: new Audio("audio/music/vampire-vengeful-fruit-intro.mp3"),
        playback: {
            looped: false,
            nextTrackId: "vampireBattleMainLoop"
        },
        info: {
            title: "Vengeful Fruit",
            artist: "Xx_TheMilkMan69_xX",
        },
        tags: ["vampire", "special battle"],
    },
    vampireBattleMainLoop: {
        audio: new Audio("audio/music/vampire-vengeful-fruit-main-loop.mp3"),
        playback: {
            looped: true,
        },
        info: {
            title: "Vengeful Fruit",
            artist: "Xx_TheMilkMan69_xX",
        },
        tags: ["vampire", "special battle"],
    },
    vampireLurking: {
        audio: new Audio("audio/music/lurking.ogg"),
        playback: {
            looped: true,
        },
        info: {
            title: "Lurking",
            artist: "Packard Bell 95",
        },
        tags: ["vampire", "special exploration"],
    },

    // Other NPC themes
    merchantTheme: {
        audio: new Audio("audio/music/merchant.mp3"),
        playback: {
            looped: true,
        },
        info: {
            title: "Welcome to SlobMart!",
            artist: "Xx_TheMilkMan69_xX",
        },
        tags: ["merchant"],
    },
    gamblerTheme: {
        audio: new Audio("audio/music/gamblers-theme.mp3"),
        playback: {
            looped: true,
        },
        info: {
            title: "Gambler's Theme",
            artist: "Packard Bell 95",
        },
        tags: ["gambler"],
    },
    erokTheme: {
        audio: new Audio("audio/music/erok.mp3"),
        playback: {
            looped: true,
        },
        info: {
            title: "A Dog Named Erok",
            artist: "Xx_TheMilkMan69_xX",
        },
        tags: ["erok"],
    },
});
