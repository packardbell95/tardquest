"use strict";

/**
 * @TODO Incorporate flavor text here since leaders dictate personality traits
 * @TODO Inventory, including bitcoin amounts
 */
const TardQuestPartyMemberFactory = {
    /**
     * PLAYER
     */
    player: function(baseStats = {}) {
        const partyMember = PartyMemberBuilder("Player");
        partyMember.type = "player";
        partyMember.color = "#2aff00";
        partyMember.stats = structuredClone(baseStats);
        partyMember.traits.sightRange = 2;
        partyMember.traits.fieldOfView = 90;
        partyMember.traits.hearingRange = 2;
        partyMember.traits.persuasionAttempts = 2;

        partyMember.voice = {
            pitch: 38,
            speed: 153,
            mouth: 213,
            throat: 163,
        };

        partyMember.talkSlots = [];

        return partyMember;
    },

    /**
     * MERCHANT
     */
    merchant: function() {
        const partyMember = PartyMemberBuilder("Merchant");
        partyMember.type = "merchant";
        partyMember.color = "#f7f";
        partyMember.stats = {
            progression: {
                level: 7,
                experience: 0,
            },
            core: {
                hp: 20,
                maxHp: 20,
                defense: 8,
                strength: 15,
                persuasion: 0,
                endurance: 10,
                speed: 5,
                luck: 12,
            },
        };
        partyMember.traits.sightRange = 5;
        partyMember.traits.fieldOfView = 90;
        partyMember.traits.hearingRange = 4;
        partyMember.voice = {
            pitch: 48,
            speed: 45,
            mouth: 163,
            throat: 160,
        };

        partyMember.talkSlots = [];

        return partyMember;
    },

    /**
     * GAMBLER
     */
    gambler: function() {
        const partyMember = PartyMemberBuilder("Gambler");
        partyMember.type = "gambler";
        partyMember.color = "#ffd700";
        partyMember.stats = {
            progression: {
                level: 3,
                experience: 0,
            },
            core: {
                hp: 20,
                maxHp: 20,
                defense: 1,
                strength: 3,
                persuasion: 7,
                endurance: 6,
                speed: 10,
                luck: 21,
            },
        };
        partyMember.traits.sightRange = 4;
        partyMember.traits.fieldOfView = 90;
        partyMember.traits.hearingRange = 9;
        partyMember.voice = {
            pitch: 26,
            speed: 55,
            mouth: 162,
            throat: 255,
        };

        partyMember.talkSlots = [];

        return partyMember;
    },

    /**
     * EROK
     */
    erok: function() {
        const partyMember = PartyMemberBuilder("Erok");
        partyMember.type = "erok";
        partyMember.color = "#ffd68a";
        partyMember.stats = {
            progression: {
                level: 1,
                experience: 0,
            },
            core: {
                hp: 10,
                maxHp: 10,
                defense: 1,
                strength: 8,
                persuasion: 5,
                endurance: 8,
                speed: 16,
                luck: 15,
            },
        };
        partyMember.traits.sightRange = 4;
        partyMember.traits.fieldOfView = 120;
        partyMember.traits.hearingRange = 8;
        partyMember.voice = {
            pitch: 200,
            speed: 50,
            mouth: 124,
            throat: 144,
        };

        partyMember.talkSlots = [
            [
                "oh boy oh boy",
                "hello hello hello",
                "hey",
                "hey hey",
            ],
            [
                "are we walking? are we walking?",
                "food time boss? food time?",
                "i am so happy i am such the happy dog",
                "you are the best and we are here and you are my friend",
                "do you smell that? do you smell that smell i'm smelling?",
            ],
            [
                "awesome awesome awesome!",
                "let's go for a walk and run and jump and play!!!",
                "throw a ball please please please please please throw a ball",
                "oh man you are the best",
            ]
        ];

        return partyMember;
    },

    /**
     * SNAIL SENTINEL
     */
    snailSentinel: function(level = 1) {
        const partyMember = PartyMemberBuilder("Snail Sentinel");
        partyMember.type = "snailSentinel";
        partyMember.color = "#f78080";

        partyMember.stats = {
            progression: {
                level,
                experience: 0,
            },
            core: {
                hp: 13,
                maxHp: 13,
                defense: 5,
                strength: 5,
                persuasion: 0,
                endurance: 0,
                speed: 2,
                luck: 7,
            },
        };

        partyMember.traits.sightRange = 5;
        partyMember.traits.fieldOfView = 135;
        partyMember.traits.hearingRange = 2;

        partyMember.voice = {
            pitch: 38,
            speed: 153,
            mouth: 213,
            throat: 163,
        };

        partyMember.talkSlots = [
            ["Sss...", "Hrk!", "Glorp", "Snail", "Halt!", "Beware"],
            ["you", "I", "we", "that guy", "snail", "he", "she", "it", "has"],
            [
                "am", "is", "are", "was", "snail", "violated", "trespassing",
                "guarding",
            ],
            [
                "slimy", "slow", "fast", "hungry", "snail", "the law",
                "Judge Joody", "my antennae", "the shell",
            ],
            ["?", "!", "!!!", "?!", "...", ".",]
        ];

        return partyMember;
    },

    /**
     * STUPID DOG
     */
    stupidDog: function(level = 1) {
        const partyMember = PartyMemberBuilder("Stupid Dog");
        partyMember.type = "stupidDog";
        partyMember.color = "#f78080";

        partyMember.stats = {
            progression: {
                level,
                experience: 0,
            },
            core: {
                hp: 9,
                maxHp: 9,
                defense: 5,
                strength: 5,
                persuasion: 0,
                endurance: 0,
                speed: 2,
                luck: 7,
            },
        };

        partyMember.traits.sightRange = 5;
        partyMember.traits.fieldOfView = 90;
        partyMember.traits.hearingRange = 5;

        partyMember.voice = {
            pitch: 125,
            speed: 86,
            mouth: 165,
            throat: 102,
        };

        partyMember.talkSlots = [
            ["Arf", "Blorf", "Hrrf", "Ruff"],
            ["aroo", "bark", "rowf", "snarf", "wuff"],
            ["grrr", "mrrp", "rrrarf", "yip"],
            ["borf", "hamburger", "rrrow", "yap"],
            ["?", "!", "!!!", "?!", "...", ".",],
        ];

        return partyMember;
    },

    /**
     * WANG RAT
     */
    wangRat: function(level = 1) {
        const partyMember = PartyMemberBuilder("Wang Rat");
        partyMember.type = "wangRat";
        partyMember.color = "#f78080";

        partyMember.stats = {
            progression: {
                level,
                experience: 0,
            },
            core: {
                hp: 8,
                maxHp: 8,
                defense: 5,
                strength: 5,
                persuasion: 0,
                endurance: 0,
                speed: 2,
                luck: 7,
            },
        };

        partyMember.traits.sightRange = 3;
        partyMember.traits.fieldOfView = 45;
        partyMember.traits.hearingRange = 6;

        partyMember.voice = {
            pitch: 80,
            speed: 94,
            mouth: 152,
            throat: 188,
        };

        partyMember.talkSlots = [
            ["Do you want", "I need", "We should get", "I'm thinking about"],
            [
                "cheese doodles", "greasy weenus", "blue cheese", "cheddar",
                "cheeto crumbs", "toilet paper", "a DVD-VCR combo player",
            ],
            ["?", "!", "!!!", "?!", "...", ".",]
        ];

        return partyMember;
    },

    /**
     * KEEPER OF THE TOILET BOWL
     */
    keeperOfTheToiletBowl: function(level = 1) {
        const partyMember = PartyMemberBuilder("Keeper of the Toilet Bowl");
        partyMember.type = "keeperOfTheToiletBowl";
        partyMember.color = "#f78080";

        partyMember.stats = {
            progression: {
                level,
                experience: 0,
            },
            core: {
                hp: 25,
                maxHp: 25,
                defense: 5,
                strength: 5,
                persuasion: 0,
                endurance: 0,
                speed: 2,
                luck: 7,
            },
        };

        partyMember.traits.sightRange = 4;
        partyMember.traits.fieldOfView = 70;
        partyMember.traits.hearingRange = 4;

        partyMember.voice = {
            pitch: 95,
            speed: 66,
            mouth: 102,
            throat: 119,
        };

        partyMember.talkSlots = [
            [
                "Halt!", "Lo!", "By the almighty scrub brush!",
                "By decree of the royal flush!",
            ],
            [
                "We must", "Victory is ours once we", "Wield thine plunger and",
            ],
            [
                "flush the scum back to the sewers",
                "wipe the enemy from every crack of this dungeon",
                "bidet our prey away",
            ],
            ["!", "!!!", "...", "."]
        ];

        return partyMember;
    },

    /**
     * MYSTERIOUS SCOOTER
     */
    mysteriousScooter: function(level = 1) {
        const partyMember = PartyMemberBuilder("Mysterious Scooter");
        partyMember.type = "mysteriousScooter";
        partyMember.color = "#f78080";

        partyMember.stats = {
            progression: {
                level,
                experience: 0,
            },
            core: {
                hp: 17,
                maxHp: 17,
                defense: 5,
                strength: 5,
                persuasion: 0,
                endurance: 0,
                speed: 2,
                luck: 7,
            },
        };

        partyMember.traits.sightRange = 6;
        partyMember.traits.fieldOfView = 22;
        partyMember.traits.hearingRange = 0;

        partyMember.voice = {
            pitch: 33,
            speed: 92,
            mouth: 70,
            throat: 105,
        };

        partyMember.talkSlots = [
            [
                "I'm going to", "We're about to", "This guy wants to",
                "Hop on. We're gunna", "How're you gunna handle me when I",
            ],
            [
                "go zero to ten in fifteen seconds",
                "scoot some future roadkill",
                "do a sick tailwhip",
                "pop a wheelie",
                "can plant curb stomp these rats",
            ],
            [
                "all over this spire",
                "then scoop up some milfs",
                "and munch on some grindage",
                "while obeying the safety rules",
            ],
            ["!", "!!!", "...", "."]
        ];

        return partyMember;
    },

    /**
     * BADASS FLAMING SKELETON
     */
    badassFlamingSkeleton: function(level = 1) {
        const partyMember = PartyMemberBuilder("Badass Flaming Skeleton");
        partyMember.type = "badassFlamingSkeleton";
        partyMember.color = "#f78080";

        partyMember.stats = {
            progression: {
                level,
                experience: 0,
            },
            core: {
                hp: 23,
                maxHp: 23,
                defense: 5,
                strength: 5,
                persuasion: 0,
                endurance: 0,
                speed: 2,
                luck: 7,
            },
        };

        partyMember.traits.sightRange = 5;
        partyMember.traits.fieldOfView = 90;
        partyMember.traits.hearingRange = 0;

        partyMember.voice = {
            pitch: 225,
            speed: 93,
            mouth: 148,
            throat: 111,
        };

        partyMember.talkSlots = [
            [
                "I have no nerves, but you're somehow still getting on 'em.",
                "Is it warm in here or is it just me?",
                "I'm really just spontaneously combusting in suspended " +
                    "animation.",
                "You're more of a flamer than I am.",
                "AHHHHHHHHH!!!",
            ],
        ];

        return partyMember;
    },

    /**
     * FRIDGE of FORGOTTEN LEFTOVERS
     */
    fridgeOfForgottenLeftovers: function(level = 1) {
        const partyMember = PartyMemberBuilder("Fridge of Forgotten Leftovers");
        partyMember.type = "fridgeOfForgottenLeftovers";
        partyMember.color = "#f78080";

        partyMember.stats = {
            progression: {
                level,
                experience: 0,
            },
            core: {
                hp: 27,
                maxHp: 27,
                defense: 5,
                strength: 5,
                persuasion: 0,
                endurance: 0,
                speed: 2,
                luck: 7,
            },
        };

        partyMember.traits.sightRange = 4;
        partyMember.traits.fieldOfView = 90;
        partyMember.traits.hearingRange = 0;

        partyMember.voice = {
            pitch: 174,
            speed: 116,
            mouth: 86,
            throat: 146,
        };

        partyMember.talkSlots = [
            [ "Bacon", "Grape", "Ketchup", "Mayonnaise", "Tofu" ],
            [ "butter", "chicken", "pepper", "ham", "lettuce" ],
            [ "apple", "cheddar", "guacamole", "mustard", "pizza" ],
            [ "beef", "cucumber", "juice", "pickle", "salmon" ],
            [ "cream cheese", "jam", "milk", "rice", "sour cream" ],
            [ "salsa", "spinach", "tomato", "turkey", "whipped cream" ],
            [ "carrot", "egg", "hummus", "orange juice", "pasta" ],
            [ "pudding", "salad", "soy sauce", "strawberry", "yogurt" ],
            [ "?", "!", "!!!", "?!", "...", "." ],
        ];

        return partyMember;
    },

    /**
     * LUGHEAD
     */
    lughead: function(level = 1) {
        const partyMember = PartyMemberBuilder("Lughead");
        partyMember.type = "lughead";
        partyMember.color = "#f78080";

        partyMember.stats = {
            progression: {
                level,
                experience: 0,
            },
            core: {
                hp: 28,
                maxHp: 28,
                defense: 5,
                strength: 5,
                persuasion: 0,
                endurance: 0,
                speed: 2,
                luck: 7,
            },
        };

        partyMember.traits.sightRange = 5;
        partyMember.traits.fieldOfView = 90;
        partyMember.traits.hearingRange = 4;

        partyMember.voice = {
            pitch: 110,
            speed: 127,
            mouth: 99,
            throat: 82,
        };

        partyMember.talkSlots = [
            [ "Ugh", "LUG", "Arrgh", "UNG", "Borf", "AHHHHHHH", "Bunginga" ],
            [
                "smash", "eat", "touch", "rip", "grab", "friend", "befriend",
                "love", "rock", "dance", "pull teeth", "over there"
            ],
            [
                "now", "later", "soon", "maybe", "never", "happy", "punch",
                "kill", "death", "Phillips CD-i", "Bubsy 3D"
            ],
            [ "?", "!", "!!!", "?!", "...", "." ],
        ];

        return partyMember;
    },

    /**
     * PISSED-OFF POULTRY
     */
    pissedOffPoultry: function(level = 1) {
        const partyMember = PartyMemberBuilder("Pissed-Off Poultry");
        partyMember.type = "pissedOffPoultry";
        partyMember.color = "#f78080";

        partyMember.stats = {
            progression: {
                level,
                experience: 0,
            },
            core: {
                hp: 15,
                maxHp: 15,
                defense: 5,
                strength: 5,
                persuasion: 0,
                endurance: 0,
                speed: 2,
                luck: 7,
            },
        };

        partyMember.traits.sightRange = 5;
        partyMember.traits.fieldOfView = 110;
        partyMember.traits.hearingRange = 5;

        partyMember.voice = {
            pitch: 42,
            speed: 79,
            mouth: 128,
            throat: 92,
        };

        partyMember.talkSlots = [
            [ "Cluck", "Squawk", "Peep", "Chirp", "Bok" ],
            [ "cluck", "cackle", "bok-bok", "bok" ],
            [ "cluck", "peep", "bawk-bawk", "bawk" ],
            [ "cluck", "peep", "bawk-bawk", "bawk", "can of corn" ],
            [ "cluck", "peep", "bawk-bawk", "bawk" ],
            [ "?", "!", "!!!", "?!", "...", "." ],
        ];

        return partyMember;
    },

    /**
     * KRAMPUS ELF
     */
    krampusElf: function(level = 1) {
        const partyMember = PartyMemberBuilder("Krampus Elf");
        partyMember.type = "krampusElf";
        partyMember.color = "#f78080";

        partyMember.stats = {
            progression: {
                level,
                experience: 0,
            },
            core: {
                hp: 14,
                maxHp: 14,
                defense: 5,
                strength: 5,
                persuasion: 0,
                endurance: 0,
                speed: 2,
                luck: 7,
            },
        };

        partyMember.traits.sightRange = 5;
        partyMember.traits.fieldOfView = 90;
        partyMember.traits.hearingRange = 8;

        partyMember.voice = {
            pitch: 36,
            speed: 79,
            mouth: 255,
            throat: 194,
        };

        return partyMember;
    },

    /**
     * MIMIC
     */
    mimic: function(level = 1) {
        const partyMember = PartyMemberBuilder("Mimic");
        partyMember.type = "mimic";
        partyMember.color = "#f78080";

        partyMember.stats = {
            progression: {
                level,
                experience: 0,
            },
            core: {
                hp: 140,
                maxHp: 140,
                defense: 5,
                strength: 5,
                persuasion: 0,
                endurance: 0,
                speed: 2,
                luck: 7,
            },
        };

        partyMember.traits.sightRange = 0;
        partyMember.traits.fieldOfView = 90;
        partyMember.traits.hearingRange = 0;

        partyMember.voice = {
            pitch: 142,
            speed: 80,
            mouth: 132,
            throat: 170,
        };

        return partyMember;
    },

    /**
     * VAMPIRE
     */
    vampire: function(level = 1) {
        const partyMember = PartyMemberBuilder("Gay Cocksucking Vampire");
        partyMember.type = "vampire";
        partyMember.color = "#f0f";

        partyMember.stats = {
            progression: {
                level,
                experience: 0,
            },
            core: {
                hp: 100,
                maxHp: 100,
                defense: 5,
                strength: 5,
                persuasion: 0,
                endurance: 0,
                speed: 2,
                luck: 7,
            },
        };

        partyMember.traits.sightRange = 6;
        partyMember.traits.fieldOfView = 90;
        partyMember.traits.hearingRange = 7;
        partyMember.traits.isFlying = true;

        partyMember.voice = {
            pitch: 92,
            speed: 80,
            mouth: 139,
            throat: 158,
        };

        return partyMember;
    },
}
