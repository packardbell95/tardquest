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
        InventorySidebar?.open("main");

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
        const isEnemy =
            BattleSystem.enemyEntity.party.some(e => e.id === partyMember.id);

        const $container = document.createElement("div");
        $container.classList.add("portrait-container");
        if (! isEnemy) {
            $container.classList.add("clickable");
            $container.onclick = () => {
                BattleSystem.setPlayerPartyMemberIndex(
                    playerEntity.party.findIndex(e => e.id === partyMember.id)
                );
                GameControl.BattleUi.initialize();
            };
        }

        const $background = document.createElement("div");
        $background.classList.add("background");
        $container.append($background);

        const $partyMember = document.createElement("div");
        $partyMember.classList.add("portrait", partyMember.type);

        if (isEnemy) {
            $partyMember.classList.add("flipped");
        }

        if (partyMember.color) {
            $partyMember.style.setProperty("--tint-color", partyMember.color);
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
        const orderedMoves =
            BattleSystem.getBackfilledOrderedMoves(tentativeMoves);
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

            $partyMember.dataset.index = moveIndex;

            if (moveIndex === -1) {
                $partyMember.dataset.x = -1;
                $partyMember.dataset.y = -1;
                $partyMember.classList.add("hidden");
                $partyMember.querySelector(".turn-number").textContent = "";
                continue;
            }

            $partyMember.classList.remove("hidden");

            this.refreshPortrait(partyMember);
            const x = moveIndex & 1;
            const y = (moveIndex & ~1) >> 1;

            $partyMember.dataset.x = x;
            $partyMember.dataset.y = y;

            const positionX = x === 0 ? 0 : itemSizeX;
            const positionY = y * itemSizeY;

            $partyMember.style.setProperty("--x", `${positionX}px`);
            $partyMember.style.setProperty("--y", `${positionY}px`);
            $partyMember.querySelector(".turn-number").textContent =
                (moveIndex + 1).toLocaleString(undefined);
        }
    },

    refreshPortrait: function(partyMember) {
        // @TODO Don't even call this function if there is no party member
        //       Or maybe use this to clean up tooltips
        if (! partyMember) {
            console.log(
                "refreshPortrait(): Party member not found",
                { partyMember }
            );
            return;
        }

        const $partyMember = partyMember.$battleQueueSidebarElement;
        if (! $partyMember) {
            console.error(
                "Party member's battle queue sidebar element disappeared",
                { partyMember }
            );
            return;
        }

        partyMember.isDead()
            ? $partyMember.classList.add("dead")
            : $partyMember.classList.remove("dead");

        this._updateTooltip(partyMember, $partyMember);
    },

    // @TODO When the party member disappears, clean up the tooltip
    _updateTooltip(partyMember, $element) {
        const actorIsEnemy = ! BattleSystem.playerEntity.party
            .some(e => e.id === partyMember.id);
        const modalClass = actorIsEnemy ? "enemy" : "friendly";
        const actorIsLeader = actorIsEnemy
            ? partyMember.id === BattleSystem.enemyEntity.leader?.id
            : partyMember.id === BattleSystem.playerEntity.leader?.id;
        const actorTitle = actorIsLeader
            ? "Leader"
            : (actorIsEnemy ? "Lackey" : "Ally");
        const actorTitleClassname = actorIsLeader
            ? "gold"
            : (actorIsEnemy ? "enemy" : "friendly");
        const actorStatus = "Normal"; // @TODO Update once statuses are ready
        const actorLevel =
            partyMember.stats.progression.level.toLocaleString(undefined);
        const queuedMove =
            BattleSystem.queuedMoves.find(e => e.actor.id === partyMember.id);

        const backgroundColor = actorIsEnemy ? "#f00" : "#00f";
        const actorPortraitClasses = [
            "portrait",
            partyMember.type,
            actorIsEnemy ? "flipped" : "",
            partyMember.isDead() ? "dead" : "",
        ].filter(e => e).join(" ");

        const nextMoveHtml =
            this._getTooltipNextMoveSection(partyMember, queuedMove);

        $element.setAttribute(
            "data-tooltipHtml",
            `<div class="battle-queue-modal ${modalClass}">
                <div class="column left">
                    <div
                        class="${actorPortraitClasses}"
                        style="background-color: ${partyMember.color}"
                    ></div>
                    <div
                        class="${actorTitleClassname}"
                        style="text-align: center;"
                    >
                        ${actorTitle}
                    </div>
                </div>
                <div class="column right">
                    <div class="actor">
                        <div class="top">
                            <em>${actorStatus}</em>
                            <div>Level ${actorLevel}</div>
                        </div>
                        <div class="name">
                            ${partyMember.name}
                        </div>
                        <div class="stat">
                            <div style="flex-grow: 0;">
                                HP
                            </div>
                            <progress-bar
                                data-stat-core="hp"
                                cautionAtOrBelowPercentage="25"
                                dangerAtOrBelowPercentage="10"
                                value="${partyMember.stats.core.hp}"
                                max="${partyMember.stats.core.maxHp}"
                                height="16"
                            ></progress-bar>
                        </div>
                    </div>
                    ${nextMoveHtml}
                </div>
            </div>`
        );
        $element.setAttribute("data-tooltipPosition", "left");
        $element.setAttribute("data-tooltipGroupId", "battleQueueSidebar");
        $element.setAttribute("data-cursorHorizontal", "middle");
        $element.setAttribute("data-cursorVertical", "bottom");
        Tooltip.refresh($element);
    },

    _getTooltipNextMoveSection(partyMember, queuedMove) {
        if (! queuedMove) {
            return "";
        }

        const moveType = queuedMove.type;
        const moveColor = this._getTooltipMoveColor(moveType);

        const target = queuedMove?.target;
        const targetIsEnemy =
            target &&
            ! BattleSystem.playerEntity?.party.some(e => e.id === target.id);
        const targetPortraitClasses = [
            "portrait",
            target?.type,
            targetIsEnemy ? "flipped" : "",
            target?.isDead() ? "dead" : "",
        ].filter(e => e).join(" ");

        const summaryActionHtml = this._getSummaryActionHtml(moveType);
        const targetNameHtml = target?.name
            ? `<span class="${targetIsEnemy ? "enemy" : "friendly"}">` +
                `${target.name}</span>`
            : "";

        // @TODO Fix this hideous code
        const targetHtml = target
            ? (
                `<div style="width: 28px; height: 28px; image-rendering: pixelated; background-color: #f00; mask-image: url(assets/interface/ui/battle-icons/arrow-square.png); mask-size: contain; mask-position: center; mask-repeat: no-repeat;"></div>
                <div
                    class="${targetPortraitClasses}"
                    style="width: 30px; height: 30px; mask-size: contain; background-color: ${target?.color || "#fff"};"
                ></div>`
            )
            : "";

        return (
            `<div style="display: flex; flex-direction: column;">
                <div>
                    Next Move
                </div>
                <div style="display: flex; flex-direction: column; margin-left: 1ch;">
                    <div style="display: flex; flex-direction: row; gap: 1ch;">
                        <div style="width: 30px; height: 30px; image-rendering: pixelated; background-color: #f00; mask-image: url(assets/interface/ui/battle-icons/${moveType}.png); mask-size: contain; mask-position: center; mask-repeat: no-repeat;"></div>
                        ${targetHtml}
                    </div>
                    <div>
                        ${summaryActionHtml}
                        ${targetNameHtml}
                    </div>
                </div>
            </div>`
        );
    },

    _getTooltipMoveColor: function(moveType) {
        switch (moveType) {
            case "attack":
                return "#f00";
            case "persuade":
                return "#A23AB4";
            case "run":
                return "#00f";
            // Other possible types include:
            // "use item", "equip weapon", "equip armor", and "equip ring"
            default:
                return "#fff";
        }
    },

    _getSummaryActionHtml: function(moveType) {
        switch (moveType) {
            case "attack":
                return `<span class="action">Attacking</span>`;
            case "persuade":
                return `<span class="persuasion">Persuading</span>`;
            case "run":
                return `<span class="run">Running away</span>`;
            case "use item":
                return `<span>Using item</span>`;
            case "equip weapon":
                return `<span>Equipping weapon</span>`;
            case "equip armor":
                return `<span>Equipping armor</span>`;
            case "equip ring":
                return `<span>Equipping ring</span>`;
            default:
                return `<span>???</span>`;
        }
    },

    highlight: function(actorPartyMemberId, targetPartyMemberId) {
        this._highlight(actorPartyMemberId, targetPartyMemberId);
    },

    clearHighlight: function() {
        this._highlight();
    },

    _highlight: function(
        actorPartyMemberId = null,
        targetPartyMemberId = null
    ) {
        const actorClassname = "highlight";
        const targetClassname = "target-highlight";

        for (const partyMember of this.getPartyMembers()) {
            const $element = partyMember?.$battleQueueSidebarElement;
            if (! $element) {
                console.error(
                    "Party member does not have a $battleQueueSidebarElement",
                    { partyMember }
                );
                continue;
            }

            partyMember.id === actorPartyMemberId
                ? $element.classList.add(actorClassname)
                : $element.classList.remove(actorClassname);

            partyMember.id === targetPartyMemberId
                ? $element.classList.add(targetClassname)
                : $element.classList.remove(targetClassname);
        }
    },
};