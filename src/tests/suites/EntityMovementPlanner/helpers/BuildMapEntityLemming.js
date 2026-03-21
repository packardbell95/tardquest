"use strict";

function BuildMapEntityLemming(x, y, direction) {
    const lemming = MapEntityBuilder("lemming", x, y, direction);
    MapEntityTrait_AttachMovement_Patrol(lemming);

    const lemmingPartyMember = PartyMemberBuilder("King Lemming", {
        progression: {
            level: 1,
            experience: 0,
        },
        core: {
            hp: 20,
            maxHp: 20,
            defense: 5,
            strength: 1,
            persuasion: 15,
            endurance: 0,
            speed: 12,
            luck: 17,
        },
    });
    lemmingPartyMember.traits.sightRange = 5;
    lemming.addPartyMember(lemmingPartyMember);

    lemming.getDisplayName = function() {
        return "🐭 Lemming";
    };

    lemming.getDisplayCharacter = function() {
        return ["▲", "▶", "▼", "◀"][this.direction] || "?";
    };

    lemming.onTouch = function(gameMap, entity) {
        if (entity.type === "player") {
            if (this.turnTowards(entity)) {
                if (typeof this.prepareMovement === "function") {
                    this.prepareMovement(gameMap);
                }

                const html = `${waveText("Cheesed to meet you!", "LUK").outerHTML}`;
                updateBattleLog(html);
            }
        } else if (entity.hasTarget()) {
            const possibleRetreatTargets = [];

            const emptyMapCells = gameMap.getEmptyCellCoordinates();
            const entityPath = gameMap.findPath(
                [ entity.x, entity.y ],
                [ entity.target.x, entity.target.y ]
            );

        }
    };

    lemming.turnIntoBloodyCrater = function() {
        this.type = "terrain";

        this.getDisplayName = function() {
            return "☠️ Former lemming";
        };

        this.getDisplayCharacter = function() {
            return "◌";
        };
    };

    lemming.onExplode = function(gameMap, entity) {
        console.log({ boom: this });
        this.leader.say("AIEEEE! YOU KILLED ME!");
        this.turnIntoBloodyCrater();
    };

    return lemming;
}
