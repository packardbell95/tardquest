(function() {
    'use strict';

    function showPartyMemberModal(partyMemberId) {
        const member = player.party.members.find(m => m.id === partyMemberId);
        if (!member) return;

        // Lock player movement? Idk this only half works
        if (typeof GameControl !== 'undefined' && GameControl.setInputBlocked) {
            GameControl.setInputBlocked(true);
        }

        const modal = document.createElement('dialog');
        modal.className = 'modal';
        
        const persuasionSection = member.persuasionMessage ? `
            <hr class="party-member-divider">
            
            <div class="party-member-persuasion">
                <strong>Words of Recruitment:</strong><br>
                <div class="persuasion-text">
                    "${member.persuasionMessage}"
                </div>
            </div>
        ` : '';
        
        modal.innerHTML = `
            <div class="header">
                <div class="title">${member.name}</div>
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
                        
                        <strong>HP:</strong>
                        <span class="HP">${member.hp} / ${member.maxHp}</span>
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
        
        // Create input field
        const input = document.createElement('input');
        input.type = 'text';
        input.value = member.name;
        input.className = 'rename-input';
        input.maxLength = 50;
        
        // Create save/cancel buttons
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.className = 'save-name-btn';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = 'cancel-name-btn';
        
        // Replace name display with input
        nameSpan.style.display = 'none';
        editButton.style.display = 'none';
        nameSection.appendChild(input);
        nameSection.appendChild(saveBtn);
        nameSection.appendChild(cancelBtn);
        
        input.focus();
        input.select();

        // Additional input blocking for editing mode
        if (typeof GameControl !== 'undefined' && GameControl.setInputBlocked) {
            GameControl.setInputBlocked(true, 'editing');
        }
        
        function saveName() {
            const newName = input.value.trim();
            if (newName && newName !== member.name) {
                // Update the member data
                member.name = newName;
                
                // Update the modal title
                const modalTitle = nameSection.closest('.modal').querySelector('.title');
                modalTitle.textContent = newName;
                
                // Update the name in the party list
                const partyMemberElement = document.querySelector(`[data-partyMemberId="${partyMemberId}"] .name .clickable-name`);
                if (partyMemberElement) {
                    partyMemberElement.textContent = newName;
                }
                
                // Update the displayed name
                nameSpan.textContent = newName;
            }
            
            // Restore original display
            input.remove();
            saveBtn.remove();
            cancelBtn.remove();
            nameSpan.style.display = '';
            editButton.style.display = '';

            // Restore input blocking to modal level only
            if (typeof GameControl !== 'undefined' && GameControl.setInputBlocked) {
                GameControl.setInputBlocked(true);
            }
        }
        
        function cancelEdit() {
            // Restore original display
            input.remove();
            saveBtn.remove();
            cancelBtn.remove();
            nameSpan.style.display = '';
            editButton.style.display = '';

            // Restore input blocking to modal level only
            if (typeof GameControl !== 'undefined' && GameControl.setInputBlocked) {
                GameControl.setInputBlocked(true);
            }
        }
        
        // Event handlers
        saveBtn.addEventListener('click', saveName);
        cancelBtn.addEventListener('click', cancelEdit);
        
        // Prevent event propagation for the input field
        input.addEventListener('keydown', (e) => {
            e.stopPropagation(); // Stop the event from bubbling up to game controls
            
            if (e.key === 'Enter') {
                e.preventDefault();
                saveName();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });

        // Also prevent keypress and keyup from propagating
        input.addEventListener('keypress', (e) => {
            e.stopPropagation();
        });
        
        input.addEventListener('keyup', (e) => {
            e.stopPropagation();
        });
    }

    // Make functions globally available
    window.showPartyMemberModal = showPartyMemberModal;
    window.editPartyMemberName = editPartyMemberName;

})();