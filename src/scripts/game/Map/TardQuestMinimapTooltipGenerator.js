"use strict";

const TardQuestMinimapTooltipGenerator = {
    setCellDetails: function(cell, entity = null) {
        if (! (cell instanceof MapCell)) {
            console.warn(
                "cell must be an instance of MapCell",
                { cell, entity }
            );
            return;
        }

        if (! cell.$element instanceof Element) {
            console.warn(
                "cell.$element must be an Element",
                { cell, entity }
            );
            return;
        }

        const html = this._generateHtml(cell, entity);
        cell.$element.setAttribute("data-tooltipHtml", html);
    },

    _generateHtml: function(cell, entity) {
        const { id, character, cellClass, displayName, target } =
            this._getDetails(cell, entity);

        const debugMode = ! true;

        const stunnedHtml = entity?.isStunned()
            ? `<em class="stunned">(Stunned!)</em>`
            : "";
        const partyHtml = entity?.encounteredByPlayer
            ? this._generatePartyHtml(entity)
            : "";

        return `<div class="mapCellDetails">
            <div class="enlargedCell ${cellClass}">${character}</div>
            <div class="details">
                <div class="header">
                    <div class="name">
                        ${debugMode && id ? `${id}:` : ""}
                        ${displayName}
                        ${stunnedHtml}
                    </div>
                    <div class="coordinates">
                        (${cell.x}, ${cell.y})
                        ${debugMode && target
                            ? `→ (${target.x}, ${target.y})`
                            : ""
                        }
                    </div>
                </div>
                ${partyHtml}
            </div>
        </div>`
    },

    _generatePartyHtml: function(entity) {
        const $party = document.createElement("div");
        $party.className = "party";

        for (const partyMember of entity.party) {
            const $healthBar = document.createElement("progress-bar");
            $healthBar.className = "health-bar";
            $healthBar.setAttribute("label", partyMember.name);
            $healthBar.setAttribute("height", 20);
            $healthBar.setAttribute("value", partyMember.stats.core.hp);
            $healthBar.setAttribute("max", partyMember.stats.core.maxHp);
            $healthBar.setAttribute("cautionAtOrBelowPercentage", 25);
            $healthBar.setAttribute("dangerAtOrBelowPercentage", 10);
            $party.append($healthBar);
        }

        return $party.outerHTML;
    },

    _getDetails: function(cell, entity) {
        if (! cell.isExplored) {
            return {
                id: null,
                character: "?",
                cellClass: "unexplored",
                displayName: "Unexplored",
                target: null,
            };
        }

        return entity
            ? {
                id: entity.id,
                character: entity.getDisplayCharacter(),
                cellClass: entity.getClassName(),
                displayName: entity.getDisplayName(),
                target: entity.target,
            }
            : {
                id: null,
                character: cell.isWall ? "#" : ".",
                cellClass: cell.isWall ? "wall" : "floor",
                displayName: cell.isWall ? "Wall" : "Floor",
                target: null,
            };
    },
};
