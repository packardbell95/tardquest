"use strict";

(function() {
    function showPartyMemberModal(partyMemberId) {
        const member = playerEntity.party.find(m => m.id === partyMemberId);
        if (! member) {
            console.error("Player party member not found", { partyMemberId });
            return;
        }

        GameControl.awaitingPlayerText = true;

        const modal = document.createElement("dialog");
        modal.className = "modal";

        // Check if player has party healing items
        const phialCount =
            playerEntity.inventory.contents.items.phialOfSeed || 0;
        const canHeal =
            phialCount > 0 &&
            ! member.isDead() &&
            member.stats.core.hp < member.stats.core.maxHp;

        // Get member ASCII art
        let asciiArtSection = "";
        const indexedArt = window.ENEMY_ART?.[member?.type];
        if (indexedArt) {
            let art = SceneRenderer.formatArt(indexedArt);
            if (indexedArt.offsetX) {
                art = art
                    .split("\n")
                    .map(line => " ".repeat(indexedArt.offsetX) + line)
                    .join("\n");
            }

            if (indexedArt.offsetY) {
                art = "\n".repeat(indexedArt.offsetY) + art;
            }

            asciiArtSection = `
                <div class="party-member-portrait-border">
                    <div class="ascii-art-container">
                        <div class="party-member-art">
                            <pre class="ascii-art">${art}</pre>
                        </div>
                        <button
                            data-feed-button
                            onclick="feedPartyMember(${partyMemberId})"
                            ${canHeal ? "" : "disabled"}
                        >
                            x${phialCount}
                        </button>
                    </div>
                </div>
            `;
        }

        const persuasionSection = member.persuadedBy.persuasionPhrase ? `
            <div class="party-divider"></div>
            <div class="party-member-persuasion">
                <strong>Words of Recruitment:</strong><br>
                <div class="persuasion-text">
                    "${member.persuadedBy.persuasionPhrase}"
                </div>
            </div>
        ` : "";

        modal.innerHTML = `
            <div class="header">
                <div class="title">
                    LV.${member.stats.progression.level} ${member.name}
                </div>
                <button
                    class="close"
                    onclick="this.closest('dialog').close()"
                ></button>
            </div>
            <div class="bodyContainer">
                <div class="body">
                    <div class="party-member-main-content">
                        ${asciiArtSection}

                        <div class="party-member-info">
                            <strong>Name:</strong>
                            <div class="name-section">
                                <span class="member-name">${member.name}</span>
                                <button
                                    class="edit-name-btn"
                                    onclick="editPartyMemberName(
                                        ${member.id},
                                        this
                                    )"
                                ></button>
                            </div>

                            <div>Level:</div>
                            <span class="LV">
                                ${member.stats.progression.level}
                            </span>

                            <div>DEF:</div>
                            <span class="DEF">
                                ${member.stats.core.defense}
                            </span>

                            <div>HP:</div>
                            <progress-bar
                                class="party-member-hp"
                                value="${member.stats.core.hp}"
                                max="${member.stats.core.maxHp}"
                                cautionAtOrBelowPercentage="25"
                                dangerAtOrBelowPercentage="10"
                            ></progress-bar>

                            <div>EXP:</div>
                            <progress-bar
                                class="party-member-exp"
                                value="${member.stats.progression.experience}"
                                max="${
                                    member.getExperienceRequiredForLevelUp()
                                }"
                                emptyColor="#000"
                                filledColor="#1900ff"
                            ></progress-bar>
                        </div>
                    </div>

                    ${persuasionSection}

                </div>
                <div class="footer">
                    <button onclick="this.closest('dialog').close()">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.showModal();
        modal.addEventListener("close", () => {
            setTimeout(() => {
                GameControl.awaitingPlayerText = false;
            }, 200);
            modal.remove();
        });
    }

    function editPartyMemberName(partyMemberId, editButton) {
        const member = playerEntity.party.find(m => m.id === partyMemberId);
        if (! member) {
            console.error("Player party member not found", { partyMemberId });
            return;
        }

        const nameSection = editButton.parentNode;
        const nameSpan = nameSection.querySelector(".member-name");

        // Input field
        const input = document.createElement("input");
        input.type = "text";
        input.value = member.name;
        input.className = "rename-input";
        input.maxLength = 50;

        input.addEventListener("keydown", (e) => {
            e.stopPropagation();
        });

        input.addEventListener("keypress", (e) => {
            e.stopPropagation();
        });

        // Save/Cancel buttons
        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.className = "save-name-btn";

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.className = "cancel-name-btn";

        // Replace displayed name
        nameSpan.style.display = "none";
        editButton.style.display = "none";
        nameSection.appendChild(input);
        nameSection.appendChild(saveBtn);
        nameSection.appendChild(cancelBtn);

        input.focus();
        input.select();

        function saveName() {
            const newName = input.value.trim();
            if (newName && newName !== member.name) {
                if (! member.rename(newName)) {
                    return;
                }

                const displayedName =
                    `LV.${member.stats.progression.level} ${newName}`;

                const modalTitle =
                    nameSection.closest(".modal").querySelector(".title");
                modalTitle.textContent = displayedName;

                const partyMemberElement = document.querySelector(
                    `[data-partyMemberId="${member.id}"] .name .clickable-name`
                );
                if (partyMemberElement) {
                    partyMemberElement.textContent = displayedName;
                }

                nameSpan.textContent = newName;
            }

            input.remove();
            saveBtn.remove();
            cancelBtn.remove();
            nameSpan.style.display = "";
            editButton.style.display = "";
        }

        function cancelEdit() {
            input.remove();
            saveBtn.remove();
            cancelBtn.remove();
            nameSpan.style.display = "";
            editButton.style.display = "";
        }

        saveBtn.addEventListener("click", saveName);
        cancelBtn.addEventListener("click", cancelEdit);
        input.addEventListener("keydown", (e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
                e.preventDefault();
                saveName();
            } else if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
            }
        });
    }

    function feedPartyMember(partyMemberId) {
        const member = playerEntity.party.find(m => m.id === partyMemberId);
        if (! member) {
            console.error("Player party member not found", { partyMemberId });
            return;
        }

        const phialCount =
            playerEntity.inventory.contents.items.phialOfSeed || 0;

        if (phialCount <= 0) {
            updateBattleLog(
                `<span class="enemy">You don't own a single ` +
                `${ITEMS.phialOfSeed.name}!</span>`
            );
            return;
        }

        if (member.isDead()) {
            updateBattleLog(
                `<span class="enemy">They're fucking dead, bro. Come on.` +
                `</span>`
            );
            return;
        }

        if (member.stats.core.hp >= member.stats.core.maxHp) {
            updateBattleLog(
                `<span class="friendly">${member.name}</span> is already at ` +
                `full HP. Overfeeding would lead to serious medical problems ` +
                `down the road. I would not recommend doing this.`
            );
            return;
        }

        const previousHp = member.stats.core.hp;
        const phialConsumed = playerEntity.inventory.useItem(
            "phialOfSeed",
            playerEntity.leader,
            member
        );

        if (! phialConsumed) {
            updateBattleLog(
                `<span class="enemy">Failed to use ${ITEMS.phialOfSeed.name}` +
                `</span>`
            );
            return;
        }

        document.querySelector(".modal")?.close();
    }

    window.showPartyMemberModal = showPartyMemberModal;
    window.editPartyMemberName = editPartyMemberName;
    window.feedPartyMember = feedPartyMember;
})();
