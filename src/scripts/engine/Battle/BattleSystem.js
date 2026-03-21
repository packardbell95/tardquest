"use strict";

/**
 * ℹ️ Different moves and statuses will affect the turn order
 */
const BattleSystem = {
    isActive: false,
    playerEntity: null,
    enemyEntity: null,
    entityAdvantage: null,
    tiebreakerScale: [],
    queuedMoves: [],
    persuasionAttempts: {},
    persuadedMembers: {
        joiningPlayer: [],
        joiningEnemy: [],
    },

    playerPartyMemberIndex: 0,

    onEncounter: null,
    onQueueMove: null,
    onMoveStart: null,
    onMoveEnd: null,
    onActionPhaseStart: null,
    onActionPhaseEnd: null,
    onCommandPhaseStart: null,
    onCommandPhaseEnd: null,
    onAttackEnd: null,
    onPersuadeEnd: null,
    onRunEnd: null,
    onUseItemEnd: null,
    onEquipWeaponEnd: null,
    onEquipArmorEnd: null,
    onEquipRingEnd: null,
    onEncounterEnd: null,

    startEncounter: function(
        playerEntity,
        enemyEntity,
        entityAdvantage = null
    ) {
        if (this.isActive) {
            console.warn("An encounter is already active");
            return;
        }

        if (! this.hasParty(playerEntity)) {
            console.warn(
                "Player entity has no party. Cannot start battle",
                { playerEntity }
            );
            return;
        }

        if (! this.hasParty(enemyEntity)) {
            console.warn(
                "Enemy entity has no party. Cannot start battle",
                { enemyEntity }
            );
            return;
        }

        this.isActive = true;
        this.queuedMoves = [];
        this.persuasionAttempts = {};
        this.persuadedMembers = {
            joiningPlayer: [],
            joiningEnemy: [],
        };
        this.playerEntity = playerEntity;
        this.enemyEntity = enemyEntity;
        this.generateTiebreakerScale();

        this.entityAdvantage = ["player", "enemy"].includes(entityAdvantage)
             ? entityAdvantage
             : null;

        this.onEncounter?.(
            this.playerEntity,
            this.enemyEntity,
            this.entityAdvantage
        );

        this.playerPartyMemberIndex = 0;
    },

    hasPersuasionAttempts: function(partyMember) {
        const attempts = this.persuasionAttempts[partyMemberId] ?? 0;
        const maxAttempts = partyMember.traits.persuasionAttempts ?? 0;
        return attempts < maxAttempts;
    },

    hasParty: function(entity) {
        return entity?.party?.filter(e => ! e.isDead()).length > 0;
    },

    shuffle: function(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    },

    generateTiebreakerScale: function() {
        this.tiebreakerScale = this.playerEntity.party.map(e => e.id).concat(
            this.enemyEntity.party.map(e => e.id)
        );

        this.shuffle(this.tiebreakerScale);
    },

    getActivePartyMembers: function() {
        return this.playerEntity.party.filter(e => ! e.isDead()).map(e => ({
            party: "player",
            id: e.id,
            speed: e.getEffectiveCoreStat("speed"),
        })).concat(this.enemyEntity.party.filter(e => ! e.isDead()).map(e => ({
            party: "enemy",
            id: e.id,
            speed: e.getEffectiveCoreStat("speed"),
        })));
    },

    /**
     * @param outcome string "player won"|"enemy won"|"player ran"|"enemy ran"
     */
    endEncounter: function(outcome) {
        this.onEncounterEnd?.(outcome, this.playerEntity, this.enemyEntity);
        this.queuedMoves = [];
        this.isActive = false;
    },

    attack: function(actor, target) {
        this.queueMove({ type: "attack", actor, target });
    },

    persuade: function(actor, target, persuasionPhrase) {
        this.queueMove({ type: "persuade", actor, target, persuasionPhrase });
    },

    run: function(actor) {
        this.queueMove({ type: "run", actor });
    },

    useItem: function(actor, itemId, target = null) {
        this.queueMove({ type: "use item", actor, itemId, target });
    },

    equipWeapon: function(actor, weaponId) {
        this.queueMove({ type: "equip weapon", actor, weaponId });
    },

    equipArmor: function(actor, armorId) {
        this.queueMove({ type: "equip armor", actor, armorId });
    },

    equipRing: function(actor, hand, ringId) {
        this.queueMove({ type: "equip ring", actor, ringId, hand });
    },

    queueMove: function(move) {
        if (! this.isActive) {
            console.warn(
                "Cannot queue moves when no fight is active",
                { move }
            );
            return;
        }

        this.queuedMoves =
            this.queuedMoves.filter(e => e.actor.id !== move.actor.id);
        this.queuedMoves.push(move);

        this.onQueueMove?.(move);
    },

    getRandomPlayerPartyMember: function() {
        const aliveMembers = this.playerEntity.party.filter(e => ! e.isDead());
        return aliveMembers[Math.floor(Math.random() * aliveMembers.length)];
    },

    queueEnemyMoves: function() {
        for (const actor of this.enemyEntity.party) {
            if (actor.isDead()) {
                continue;
            }

            const target = this.getRandomPlayerPartyMember();
            this.attack(actor, target);
        }
    },

    orderMoves: function() {
        this.queuedMoves.sort((a, b) => {
            console.log("Ordering moves", { a, b });

            const aSpeed = a.actor.getEffectiveCoreStat("speed");
            const bSpeed = b.actor.getEffectiveCoreStat("speed");

            if (aSpeed < bSpeed) {
                return 1;
            }

            if (aSpeed > bSpeed) {
                return -1;
            }

            return (
                this.tiebreakerScale.indexOf(a.actor.id) <
                this.tiebreakerScale.indexOf(b.actor.id)
            ) ? 1 : -1;
        });
    },

    commit: function() {
        this.onCommandPhaseEnd?.();
        this.queueEnemyMoves();
        this.orderMoves();
        console.log(
            "Battle system is ready to process moves",
            { moves: this.queueMoves }
        );

        this.onActionPhaseStart?.();
        this.nextMove();
    },

    hasMoves: function() {
        return this.queuedMoves.length > 0;
    },

    nextMove: function() {
        console.log("nextMove() called", {moves: this.queuedMoves});
        const playerLost = this.playerEntity.leader.isDead() ||
            this.playerEntity.party.filter(e => ! e.isDead()).length === 0;
        const enemyLost =
            this.enemyEntity.party.filter(e => ! e.isDead()).length === 0;
        const battleHasEnded = playerLost || enemyLost;

        if (battleHasEnded) {
            this.endEncounter(playerLost ? "enemy won" : "player won");
            this.onActionPhaseEnd?.();
            return;
        }

        let move;

        while (! move && this.hasMoves()) {
            const upcomingMove = this.queuedMoves.shift();
            if (! upcomingMove.actor.isDead()) {
                move = upcomingMove;
            }
        }

        if (! move) {
            console.warn("No move executed");

            if (! this.hasMoves()) {
                console.info("There are no moves left to execute");
                this.onActionPhaseEnd?.();

                this.playerPartyMemberIndex = 0;

                if (this.isActive) {
                    this.onCommandPhaseStart?.();
                }
            }

            return;
        }

        if (move?.target?.isDead()) {
            move.target = this.retarget(move.actor);
        }

        this.onMoveStart?.(move);

        switch (move.type) {
            case "attack":
                console.log("⚔️ Attack!", { move });
                this.performAttack(move.actor, move.target);
                break;
            case "persuade":
                console.log("💬 Persuade!", { move });
                this.performPersuade(
                    move.actor,
                    move.target,
                    move.persuasionPhrase
                );
                break;
            case "run":
                this.performRun(move.actor);
                break;
            case "use item":
                this.performUseItem(move.actor, move.itemId, move.target);
                break;
            case "equip weapon":
                console.log("🗡️ Equip Weapon!", { move });
                break;
            case "equip armor":
                console.log("🛡️ Equip Armor!", { move });
                break;
            case "equip ring":
                console.log("💍 Equip Ring!", { move });
                break;
            default:
                console.error("Unknown move", { move });
                break;
        }

        this.onMoveEnd?.(move);
    },

    retarget: function(actor) {
        const targetEntity = actor.parent.id === this.playerEntity.id
            ? this.enemyEntity
            : this.playerEntity;

        let currentTarget = null;
        let targetTiebreakerIndex = Infinity;

        for (let i = 0; i < targetEntity.party.length; i++) {
            const partyMember = targetEntity.party[i];

            if (partyMember.isDead()) {
                continue;
            }

            const index = this.tiebreakerScale.indexOf(partyMember.id);

            if (index >= 0 && index < targetTiebreakerIndex) {
                currentTarget = partyMember;
                targetTiebreakerIndex = index;

                if (index === 0) {
                    break;
                }
            }
        }

        console.log("🎯 Retargeting", { actor, currentTarget });

        return currentTarget;
    },

    performAttack: function(actor, target) {
        const critChance = actor.getEffectiveCoreStat('luck') * 0.01;
        const isCriticalHit = Math.random() < critChance;
        const damageMultiplier = isCriticalHit ? 1.2 : 1;
        const targetStartedWithHp = target.stats.core.hp > 0;

        const weapon =
            WEAPONS[actor.equipped.weapon]?.damage ??
            { base: 1, randomMultiplier: 4 };

        const weaponDamage =
            Math.floor(Math.random() * weapon.randomMultiplier) + weapon.base;

        const damagePoints = Math.ceil((
            actor.getEffectiveCoreStat("strength") +
            weaponDamage
        ) * damageMultiplier);

        target.damage(damagePoints, false);
        const attackKilledTarget = targetStartedWithHp && target.isDead();

        this.onAttackEnd?.(actor, target, damagePoints, attackKilledTarget);
    },

    performPersuade: function(actor, target, persuasionPhrase = null) {
        function normalizePhrase(phrase) {
            if (typeof phrase === "string") {
                const trimmedPhrase = phrase.replace(/\s+/g, " ").trim();
                if (trimmedPhrase.length > 0) {
                    return trimmedPhrase;
                }
            }

            return null;
        }

        const targetPartySize =
            target.parent.party.filter(e => ! e.isDead()).length;
        const canPersuade = targetPartySize === 1;

        if (! canPersuade) {
            this.onPersuadeEnd?.(actor, target, false);
            return;
        }

        const totalChance = actor.getEffectiveCoreStat("persuasion") / 100;
        const persuasionSucceeded = Math.random() < totalChance;

        if (persuasionSucceeded) {
            console.log("Persuasion successful!");
            const actorIsPlayer = actor.parent.id === this.playerEntity.id;
            const targetParty = `joining${actorIsPlayer ? "Player" : "Enemy"}`;

            target.persuadedBy = {
                partyMemberId: actor.id,
                name: actor.name,
                persuasionPhrase: normalizePhrase(persuasionPhrase),
            };

            // Track the removed party member
            console.log("Key", { targetParty });
            this.persuadedMembers[targetParty].push(target);

            // Remove member from the party
            target.parent.party =
                target.parent.party.filter(e => e.id !== target.id);
        } else {
            console.log("Persuasion failed!");
        }

        this.onPersuadeEnd?.(actor, target, persuasionSucceeded);
    },

    performRun: function(actor) {
        // @TODO Revert this debug code
        const runSucceeded = true; // Math.random() < 0.3;
        this.onRunEnd?.(actor, runSucceeded);

        if (runSucceeded) {
            this.endEncounter(
                actor.parent.id === this.playerEntity.id
                    ? "player ran"
                    : "enemy ran"
            );
        }
    },

    performUseItem: function(actor, itemId, target) {
        const successful = actor.useItem(itemId, target);
        this?.onUseItemEnd(actor, itemId, target, successful);
    },
};
