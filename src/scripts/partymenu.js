(function() {
    'use strict';

    function showPartyMemberModal(partyMemberId) {
        const member = player.party.members.find(m => m.id === partyMemberId);
        if (!member) return;

        // Lock player movement (only half works i guess idk)
        if (typeof GameControl !== 'undefined' && GameControl.setInputBlocked) {
            GameControl.setInputBlocked(true);
        }

        const modal = document.createElement('dialog');
        modal.className = 'modal';
        
        // Calculate exp progress
        const expRequired = player.party.getExpRequiredForLevelUp(member.level);
        const expProgress = member.exp;
        
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
                <div class="party-member-art">
                    <pre class="ascii-art">${art}</pre>
                </div>
            `;
        }
        
        const persuasionSection = member.persuasionMessage ? `
            <div class="party-member-persuasion">
                <strong>Words of Recruitment:</strong><br>
                <div class="persuasion-text">
                    "${member.persuasionMessage}"
                </div>
            </div>
            
            ${asciiArtSection}
        ` : asciiArtSection;
        
        modal.innerHTML = `
            <div class="header">
                <div class="title">LV.${member.level} ${member.name}</div>
                <button class="close" onclick="this.closest('dialog').close()"></button>
            </div>
            <div class="bodyContainer">
                <div class="body">
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
            // Unlock player movement when modal closes
            if (typeof GameControl !== 'undefined' && GameControl.setInputBlocked) {
                GameControl.setInputBlocked(false);
            }
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
                
                nameSpan.textContent = `LV.${member.level} ${newName}`;
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
            if (e.key === 'Enter') {
                saveName();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
    }

    window.showPartyMemberModal = showPartyMemberModal;
    window.editPartyMemberName = editPartyMemberName;

})();