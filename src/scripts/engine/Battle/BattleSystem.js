"use strict";

/**
 * ℹ️ Different moves and statuses will affect the turn order
 */
const BattleSystem = {
    // Whether or not the battle system is active
    isActive: false,

    // The player entity that's participating in the fight
    playerEntity: null,

    // The opponent entity that's participating in the fight
    enemyEntity: null,

    // Which side, if either, gets a free turn
    // Valid values include "player", "enemy", or null
    entityAdvantage: null,

    // A randomized list of all party member IDs used to break speed ties
    // This list is generated at the start of each battle
    tiebreakerScale: [],

    // The moves that are registered and executed for a given turn
    queuedMoves: [],

    // @TODO Implement persuasion limits
    // The number of persuasion attempts used, keyed by party member ID
    persuasionAttempts: {},

    // Which members of either side will change teams post-battle
    persuadedMembers: {
        joiningPlayer: [],
        joiningEnemy: [],
    },

    // Speed stat adjustments based on the type of move being made
    _moveSpeed: {
        run: 10,
        useItem: 7,
        persuade: 5,
        equipRing: 6,
        equipWeapon: 5,
        equipArmor: 4,
        attack: 0,
    },

    /**
     * Set of flags that can exist on each participating entity to dictate which
     * moves can or can't be executed for the duration of the battle
     *
     * Battle constraint flags include:
     * - "playerEntityAttack"
     * - "playerEntityPersuade"
     * - "playerEntityRun"
     * - "playerEntityUseItem"
     * - "playerEntityEquipWeapon"
     * - "playerEntityEquipArmor"
     * - "playerEntityEquipRing"
     * - "enemyEntityAttack"
     * - "enemyEntityPersuade"
     * - "enemyEntityRun"
     * - "enemyEntityUseItem"
     * - "enemyEntityEquipWeapon"
     * - "enemyEntityEquipArmor"
     * - "enemyEntityEquipRing"
     */
    battleRestrictions: [],

    // Tracks which of the player's party members are queuing moves
    // This is updated outside of the battle system, but is reset within it
    playerPartyMemberIndex: 0,

    // Various event callbacks used to tie into the battle system
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

    /**
     * Start a fight between two opponents
     *
     * @param MapEntity playerEntity The player's entity
     * @param MapEntity enemyEntity The opponent's entity
     * @param "player"|"enemy"|null entityAdvantage Which side gets a free turn
     */
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
        this.setBattleRestrictions();

        this.entityAdvantage = ["player", "enemy"].includes(entityAdvantage)
             ? entityAdvantage
             : null;

        console.log("Entity advantage", { who: this.entityAdvantage });

        this.onEncounter?.(
            this.playerEntity,
            this.enemyEntity,
            this.entityAdvantage
        );

        this.playerPartyMemberIndex = 0;

        if (this.entityAdvantage !== "player") {
            this.queueEnemyMoves();
        }
    },

    /**
     * Sets restrictions on any moves within the battle system
     *
     * Restrictions may be set on either MapEntity via a "battleRestrictions"
     * array. These will prevent moves of those class from being registered or
     * executed. For instance, if either MapEntity has a battleRestrictions
     * array containing "playerEntityRun", then the player's team cannot run
     * from the battle for the duration of the fight
     */
    setBattleRestrictions: function() {
        const validRestrictions = [
            "playerEntityAttack",
            "playerEntityPersuade",
            "playerEntityRun",
            "playerEntityUseItem",
            "playerEntityEquipWeapon",
            "playerEntityEquipArmor",
            "playerEntityEquipRing",
            "enemyEntityAttack",
            "enemyEntityPersuade",
            "enemyEntityRun",
            "enemyEntityUseItem",
            "enemyEntityEquipWeapon",
            "enemyEntityEquipArmor",
            "enemyEntityEquipRing",
        ];

        // Restricting these because they aren't implemented yet
        this.battleRestrictions = [
            "playerEntityEquipWeapon",
            "playerEntityEquipArmor",
            "playerEntityEquipRing",
        ];

        for (const entity of [this.playerEntity, this.enemyEntity]) {
            if (! Array.isArray(entity.battleRestrictions)) {
                continue;
            }

            for (const restriction of entity.battleRestrictions) {
                const addRestriction =
                    validRestrictions.includes(restriction) &&
                    ! this.battleRestrictions.includes(restriction);

                if (addRestriction) {
                    this.battleRestrictions.push(restriction);
                }
            }
        }
    },

    actorIsPlayer: function(partyMember) {
        return partyMember.parent.id === this.playerEntity.id;
    },

    // @TODO Make sure that these checks also include effective trait lookups
    //       for the given party member, eg:
    //       partyMember?.getEffectiveTrait("canAttack")
    attackRestricted: function(partyMember) {
        return this._hasBattleRestriction(partyMember, "Attack");
    },

    persuadeRestricted: function(partyMember) {
        return this._hasBattleRestriction(partyMember, "Persuade");
    },

    runRestricted: function(partyMember) {
        return this._hasBattleRestriction(partyMember, "Run");
    },

    useItemRestricted: function(partyMember) {
        return this._hasBattleRestriction(partyMember, "UseItem");
    },

    equipWeaponRestricted: function(partyMember) {
        return this._hasBattleRestriction(partyMember, "EquipWeapon");
    },

    equipArmorRestricted: function(partyMember) {
        return this._hasBattleRestriction(partyMember, "EquipArmor");
    },

    equipRingRestricted: function(partyMember) {
        return this._hasBattleRestriction(partyMember, "EquipRing");
    },

    _hasBattleRestriction: function(partyMember, move) {
        if (! partyMember) {
            return true;
        }

        return this.battleRestrictions.includes(
            (this.actorIsPlayer(partyMember) ? "playerEntity" : "enemyEntity") +
            move
        );
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
     * @param string outcome "player won"|"enemy won"|"player ran"|"enemy ran"
     */
    endEncounter: function(outcome) {
        this.onEncounterEnd?.(outcome, this.playerEntity, this.enemyEntity);
        this.queuedMoves = [];
        this.isActive = false;
    },

    attack: function(actor, target) {
        if (this.attackRestricted(actor)) {
            return false;
        }

        this.queueMove({ type: "attack", actor, target });
        return true;
    },

    persuade: function(actor, target, persuasionPhrase) {
        if (this.persuadeRestricted(actor)) {
            return false;
        }

        this.queueMove({ type: "persuade", actor, target, persuasionPhrase });
        return true;
    },

    run: function(actor) {
        if (this.runRestricted(actor)) {
            return false;
        }

        this.queueMove({ type: "run", actor });
        return true;
    },

    useItem: function(actor, itemId, target = null) {
        if (this.useItemRestricted(actor)) {
            return false;
        }

        this.queueMove({ type: "use item", actor, itemId, target });
        return true;
    },

    equipWeapon: function(actor, weaponId) {
        if (this.equipWeaponRestricted(actor)) {
            return false;
        }

        this.queueMove({ type: "equip weapon", actor, weaponId });
        return true;
    },

    equipArmor: function(actor, armorId) {
        if (this.equipArmorRestricted(actor)) {
            return false;
        }

        this.queueMove({ type: "equip armor", actor, armorId });
        return true;
    },

    equipRing: function(actor, hand, ringId) {
        if (this.equipRingRestricted(actor)) {
            return false;
        }

        this.queueMove({ type: "equip ring", actor, ringId, hand });
        return true;
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
            target
                ? this.attack(actor, target)
                : console.error(
                    "No random player party member selected",
                    { playerEntity: this.playerEntity }
                );
        }
    },

    getOrderedMoves: function(tentativeMoves = []) {
        const seenActorIds = [];
        const filteredTentativeMoves = [];

        for (const move of tentativeMoves) {
            if (! Number.isInteger(move?.actor?.id)) {
                console.error("Invalid move encountered", { move });
                continue;
            }

            if (seenActorIds.includes(move.actor.id)) {
                console.error(
                    "The same actor was supplied with multiple tentative moves",
                    { move }
                );
                continue;
            }

            seenActorIds.push(move.actor.id);
            filteredTentativeMoves.push(move);
        }

        const partyMembers = this.playerEntity.party
            .concat(this.enemyEntity.party);

        for (const partyMember of partyMembers) {
            const skipBackfill =
                seenActorIds.includes(partyMember.id) ||
                this.queuedMoves.some(e => e.actor.id === partyMember.id);

            if (skipBackfill) {
                continue;
            }

            filteredTentativeMoves.push({
                type: "attack", // Assume attack as the default move in battle
                actor: partyMember,
            });
        }

        return this.queuedMoves
            .filter(e => ! seenActorIds.includes(e.actor.id))
            .concat(filteredTentativeMoves)
            .sort((a, b) => {
                console.log("Ordering moves", { a, b });
                const aIsDead = a.actor.isDead();
                const bIsDead = b.actor.isDead();

                if (aIsDead && ! bIsDead) {
                    return 1;
                } else if (bIsDead && ! aIsDead) {
                    return -1;
                }

                const aPartyMemberSpeed = a.actor.getEffectiveCoreStat("speed");
                const bPartyMemberSpeed = b.actor.getEffectiveCoreStat("speed");

                const aMoveSpeed = this._moveSpeed[a.type] ?? 0;
                const bMoveSpeed = this._moveSpeed[b.type] ?? 0;

                const aSpeed = aPartyMemberSpeed + aMoveSpeed;
                const bSpeed = bPartyMemberSpeed + bMoveSpeed;

                console.log("Speed check", {
                    a, b, aSpeed, bSpeed, aPartyMemberSpeed, bPartyMemberSpeed,
                    aMoveSpeed, bMoveSpeed,
                });

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

    orderMoves: function() {
        this.queuedMoves = this.getOrderedMoves();
    },

    commit: function() {
        this.onCommandPhaseEnd?.();
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
        console.log("nextMove() called", { moves: this.queuedMoves });
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
                    this.queueEnemyMoves();
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
        const targetEntity = this.actorIsPlayer(actor)
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
        if (this.attackRestricted(actor)) {
            this.onAttackEnd?.(actor, target, null, false);
            return false;
        }

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
        return true;
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
        const canPersuade =
            ! this.persuadeRestricted(actor) &&
            targetPartySize === 1;

        if (! canPersuade) {
            this.onPersuadeEnd?.(actor, target, false);
            return false;
        }

        const totalChance = actor.getEffectiveCoreStat("persuasion") / 100;
        const persuasionSucceeded = Math.random() < totalChance;

        if (persuasionSucceeded) {
            console.log("Persuasion successful!");
            const targetParty = this.actorIsPlayer(actor)
                ? "joiningPlayer"
                : "joiningEnemy";

            target.persuadedBy = {
                partyMemberId: actor.id,
                name: actor.name,
                persuasionPhrase: normalizePhrase(persuasionPhrase),
            };

            // Track the removed party member
            this.persuadedMembers[targetParty].push(target);

            // Remove member from the party
            target.parent.party =
                target.parent.party.filter(e => e.id !== target.id);
        } else {
            console.log("Persuasion failed!");
        }

        this.onPersuadeEnd?.(actor, target, persuasionSucceeded);
        return true;
    },

    performRun: function(actor) {
        const runSucceeded = ! this.runRestricted(actor) && Math.random() < 0.3;
        this.onRunEnd?.(actor, runSucceeded);

        if (runSucceeded) {
            this.endEncounter(
                this.actorIsPlayer(actor)
                    ? "player ran"
                    : "enemy ran"
            );
        }

        return runSucceeded;
    },

    performUseItem: function(actor, itemId, target) {
        const successful =
            ! this.useItemRestricted(actor) &&
            actor.useItem(itemId, target);

        this?.onUseItemEnd(actor, itemId, target, successful);

        return successful;
    },
};
