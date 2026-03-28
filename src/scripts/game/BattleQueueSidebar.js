"use strict";

/**
 * This object handles the battle queue sidebar UI element
 */
const BattleQueueSidebar = {
    getPartyMembers: function() {
        return BattleSystem.isActive ? [
            ...BattleSystem.playerEntity.party,
            ...BattleSystem.enemyEntity.party,
        ] : [];
    },

    open: function() {
        const $battleQueueSection =
            document.getElementById("battleQueueSection");

        if (! $battleQueueSection) {
            console.error("Battle queue section element not found");
            return;
        }

        const $battleQueue = document.getElementById("battleQueue");
        if (! $battleQueue) {
            console.error("Battle queue element not found");
            return;
        }

        const partyMembers = this.getPartyMembers();
        const partyMemberElements = [];

        for (const partyMember of partyMembers) {
            const $partyMember = this.generatePartyMemberElement(partyMember);
            partyMemberElements.push($partyMember);
            partyMember.$battleQueueSidebarElement = $partyMember;
        }

        $battleQueue.replaceChildren(...partyMemberElements);

        this.refresh();

        $battleQueueSection.classList.add("open");

        if (BattleSystem.isActive) {
            const index = BattleSystem.playerPartyMemberIndex;
            const activePartyMember = BattleSystem.playerEntity.party[index];
            this.highlight(activePartyMember.id);
        }
    },

    close: function() {
        const $battleQueueSection =
            document.getElementById("battleQueueSection");

        if (! $battleQueueSection) {
            console.error("Battle queue section element not found");
            return;
        }

        const $battleQueue = document.getElementById("battleQueue");
        if (! $battleQueue) {
            console.error("Battle queue element not found");
            return;
        }

        $battleQueue.replaceChildren();
        $battleQueueSection.classList.remove("open");
    },

    generatePartyMemberElement: function(partyMember) {
        const $container = document.createElement("div");
        $container.classList.add("portrait-container");

        const $background = document.createElement("div");
        $background.classList.add("background");
        $container.append($background);

        const $partyMember = document.createElement("div");
        // $partyMember.dataset.partyMemberId = partyMember.id;
        $partyMember.classList.add("portrait", partyMember.type);

        if (partyMember.color) {
            $partyMember.style.backgroundColor = partyMember.color;
        }

        $container.append($partyMember);

        const $foreground = document.createElement("div");
        $foreground.classList.add("foreground");
        $container.append($foreground);

        const $turnNumber = document.createElement("div");
        $turnNumber.classList.add("turn-number");
        $container.append($turnNumber);

        return $container;
    },

    refresh: function (tentativeMoves = []) {
        const itemSizeX = 50;
        const itemSizeY = 46.8;

        const $battleQueue = document.getElementById("battleQueue");
        if (! $battleQueue) {
            console.error("Battle queue element not found");
            return;
        }

        const partyMembers = this.getPartyMembers();
        const orderedMoves = BattleSystem.getOrderedMoves(tentativeMoves);
        console.log({ partyMembers, orderedMoves });

        for (const partyMember of partyMembers) {
            const $partyMember = partyMember.$battleQueueSidebarElement;
            if (! $partyMember) {
                console.error(
                    "Party member's battle queue sidebar element disappeared",
                    { partyMember }
                );
                continue;
            }

            const moveIndex = orderedMoves.length > 0
                ? orderedMoves.findIndex(e => e.actor.id === partyMember.id)
                : partyMembers.findIndex(e => e.id === partyMember.id);
            if (moveIndex === -1) {
                $partyMember.classList.add("hidden");
                $partyMember.querySelector(".turn-number").textContent = "";
                continue;
            }

            $partyMember.classList.remove("hidden");

            partyMember.isDead()
                ? $partyMember.classList.add("dead")
                : $partyMember.classList.remove("dead");

            const positionX = (moveIndex & 1) === 0 ? 0 : itemSizeX;
            const positionY = ((moveIndex & ~1) >> 1) * itemSizeY;

            $partyMember.style.setProperty("--x", `${positionX}px`);
            $partyMember.style.setProperty("--y", `${positionY}px`);
            $partyMember.querySelector(".turn-number").textContent =
                (moveIndex + 1).toLocaleString(undefined);

            console.log(
                "👨‍⚖️ ORDER",
                { partyMember, moveIndex, positionX, positionY }
            );
        }
    },

    highlight: function(partyMemberId) {
        this._highlight(partyMemberId);
    },

    clearHighlight: function() {
        this._highlight();
    },

    _highlight: function(partyMemberId = null) {
        const classname = "highlight";

        for (const partyMember of this.getPartyMembers()) {
            const $element = partyMember?.$battleQueueSidebarElement;
            if (! $element) {
                console.error(
                    "Party member does not have a $battleQueueSidebarElement",
                    { partyMember }
                );
                continue;
            }

            partyMember.id === partyMemberId
                ? $element.classList.add(classname)
                : $element.classList.remove(classname);
        }
    },
};