"use strict";
(function() {

    function showPartyMemberModal(partyMemberId) {
        const member = player.party.members.find(m => m.id === partyMemberId);
        if (!member) return;

        GameControl.awaitingPersuasionText = true;

        const modal = document.createElement('dialog');
        modal.className = 'modal';
        
        // Calculate exp progress
        const expRequired = player.party.getExpRequiredForLevelUp(member.level);
        const expProgress = member.exp;
        
        // Check if player has party healing items
        const hasSeedPhials = player.inventory.getItemCount('seedPhial') > 0;
        const canHeal = hasSeedPhials && member.hp > 0 && member.hp < member.maxHp;
        
        // Get member ASCII art
        let asciiArtSection = '';
        const indexedArt = window.ENEMY_ART?.[member.enemyId];
        if (indexedArt) {
            let art = sceneRenderer.formatArt(indexedArt);
            if (indexedArt.offsetX) {
                art = art
                    .split('\n')
                    .map(line => ' '.repeat(indexedArt.offsetX) + line)
                    .join('\n');
            }
            
            if (indexedArt.offsetY) {
                art = '\n'.repeat(indexedArt.offsetY) + art;
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
                            ${canHeal ? '' : 'disabled'}
                        >
                            x${player.inventory.getItemCount('seedPhial')}
                        </button>
                    </div>
                </div>
            `;
        }
        
        const persuasionSection = member.persuasionMessage ? `
            <div class="party-divider"></div>
            <div class="party-member-persuasion">
                <strong>Words of Recruitment:</strong><br>
                <div class="persuasion-text">
                    "${member.persuasionMessage}"
                </div>
            </div>
        ` : '';
        
        modal.innerHTML = `
            <div class="header">
                <div class="title">LV.${member.level} ${member.name}</div>
                <button class="close" onclick="this.closest('dialog').close()"></button>
            </div>
            <div class="bodyContainer">
                <div class="body">
                    <div class="party-member-main-content">
                        ${asciiArtSection}
                        
                        <div class="party-member-info">
                            <strong>Name:</strong>
                            <div class="name-section">
                                <span class="member-name">${member.name}</span>
                                <button class="edit-name-btn" onclick="editPartyMemberName(${partyMemberId}, this)"></button>
                            </div>
                            
                            <div>Level:</div>
                            <span class="LV">${member.level}</span>

                            <div>DEF:</div>
                            <span class="DEF">${member.def}</span>

                            <div>HP:</div>
                            <progress-bar 
                                class="party-member-hp"
                                value="${member.hp}" 
                                max="${member.maxHp}"
                                cautionAtOrBelowPercentage="25"
                                dangerAtOrBelowPercentage="10">
                            </progress-bar>
                            
                            <div>EXP:</div>
                            <progress-bar 
                                class="party-member-exp"
                                value="${expProgress}" 
                                max="${expRequired}"
                                emptyColor="#000"
                                filledColor="#1900ff">
                            </progress-bar>
                        </div>
                    </div>
                    
                    ${persuasionSection}
                    
                </div>
                <div class="footer">
                    <button onclick="this.closest('dialog').close()">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.showModal();
        modal.addEventListener('close', () => {
            setTimeout(() => {
                GameControl.awaitingPersuasionText = false;
            }, 200);
            modal.remove();
        });
    }

    function editPartyMemberName(partyMemberId, editButton) {
        const member = player.party.members.find(m => m.id === partyMemberId);
        if (!member) return;

        const nameSection = editButton.parentNode;
        const nameSpan = nameSection.querySelector('.member-name');
        
        // Input field
        const input = document.createElement('input');
        input.type = 'text';
        input.value = member.name;
        input.className = 'rename-input';
        input.maxLength = 50;
        
        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
        });
        
        input.addEventListener('keypress', (e) => {
            e.stopPropagation();
        });
        
        // Save/Cancel buttons
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.className = 'save-name-btn';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = 'cancel-name-btn';
        
        // Replace displayed name
        nameSpan.style.display = 'none';
        editButton.style.display = 'none';
        nameSection.appendChild(input);
        nameSection.appendChild(saveBtn);
        nameSection.appendChild(cancelBtn);
        
        input.focus();
        input.select();
        
        function saveName() {
            const newName = input.value.trim();
            if (newName && newName !== member.name) {
                member.name = newName;

                const modalTitle = nameSection.closest('.modal').querySelector('.title');
                modalTitle.textContent = `LV.${member.level} ${newName}`;
                
                const partyMemberElement = document.querySelector(`[data-partyMemberId="${partyMemberId}"] .name .clickable-name`);
                if (partyMemberElement) {
                    partyMemberElement.textContent = `LV.${member.level} ${newName}`;
                }
                
                nameSpan.textContent = newName;
            }

            input.remove();
            saveBtn.remove();
            cancelBtn.remove();
            nameSpan.style.display = '';
            editButton.style.display = '';
        }
        
        function cancelEdit() {
            input.remove();
            saveBtn.remove();
            cancelBtn.remove();
            nameSpan.style.display = '';
            editButton.style.display = '';
        }

        saveBtn.addEventListener('click', saveName);
        cancelBtn.addEventListener('click', cancelEdit);
        input.addEventListener('keydown', (e) => {
            e.stopPropagation(); // Prevent game from handling key events
            if (e.key === 'Enter') {
                e.preventDefault();
                saveName();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
    }

    function feedPartyMember(partyMemberId) {
        const member = player.party.members.find(m => m.id === partyMemberId);
        if (!member) return;
        
        // Check if player has seed phials
        const phialCount = player.inventory.getItemCount('seedPhial');
        
        if (phialCount <= 0) {
            updateBattleLog(
                `<span class="enemy">You don't own a single ` +
                `${InventoryObjectDefinitions.items.seedPhial.name}!</span>`
            );
            return;
        }

        // Check if member is dead
        if (member.hp <= 0) {
            updateBattleLog('<span class="enemy">They\'re fucking dead, bro. Come on.</span>');
            return;
        }

        // Check if member is at full health
        if (member.hp >= member.maxHp) {
            updateBattleLog(`<span class="friendly">${member.name}</span> is already at full HP. Overfeeding would lead to serious medical problems down the road. I would not recommend doing this.`);
            return;
        }

        const itemDeducted = player.inventory.deductItem('seedPhial', 1);
        
        if (!itemDeducted) {
            updateBattleLog(
                `<span class="enemy">Failed to use ` +
                `${InventoryObjectDefinitions.items.seedPhial.name}</span>`
            );
            return;
        }
        
        const healAmount = Math.ceil(member.maxHp * 0.4); // % of max HP gained from consuming PHIAL OF SEED
        const actualHeal = Math.min(healAmount, member.maxHp - member.hp);
        member.hp += actualHeal;

        playSFX('healParty');
        updateBattleLog(
            `You give a <span class="friendly">` +
            `${InventoryObjectDefinitions.items.seedPhial.name}</span> to ` +
            `<span class="friendly">${member.name}</span> and ` +
            `<span class="HP">heal them by ${actualHeal} HP</span>`
        );

        const modal = document.querySelector('.modal');
        if (modal) {
            modal.close();
        }

        if (player.party && typeof player.party.refresh === 'function') {
            player.party.refresh();
        }

        if (typeof player.refreshStats === 'function') {
            player.refreshStats();
        }

        if (player.inCombat && typeof endOfPlayerTurn === 'function') {
            endOfPlayerTurn();
        }
    }

    window.showPartyMemberModal = showPartyMemberModal;
    window.editPartyMemberName = editPartyMemberName;
    window.feedPartyMember = feedPartyMember;

})();
