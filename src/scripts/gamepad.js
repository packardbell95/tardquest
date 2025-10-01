(function () {
  // --- Constants ---
  const DEADZONE = 0.35; // Thumbstick deadzone threshold
  const L2_AXIS = 4;     // Axis index for left trigger (L2)
  const R2_AXIS = 5;     // Axis index for right trigger (R2)
  const INPUT_REPEAT_MS = 200; // Repeat delay for D-pad and thumbstick navigation
  const TALK_HOLD_MS = 1000; // Hold X for 1 second to trigger Release
  const ACTIVITY_AXIS_DEADZONE = 0.45; // Threshold for UI hint swapping

  // --- State ---
  let prevButtons = [];
  let loggedPadInfo = false;
  let lastMenuDpad = { up: 0, down: 0, left: 0, right: 0 };
  let partyTalkLocked = false;
  let talkHoldStart = 0;
  const lastActivitySignature = new Map();

  // --- TardBoard Handling ---
  const TARDBOARD_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  function tardboardDialogActive() {
    return !!document.getElementById('tardboard-dialog-backdrop') && !!document.getElementById('tardboard-initials-input');
  }

  function tbEdge(dir, pressed) {
    if (!pressed) { lastMenuDpad[dir] = 0; return false; }
    const t = now();
    if (t - lastMenuDpad[dir] > INPUT_REPEAT_MS) { lastMenuDpad[dir] = t; return true; }
    return false;
  }

  function handleTardBoardDialog(gp, axes) {
    if (!tardboardDialogActive()) return false;
    const input = document.getElementById('tardboard-initials-input');
    if (!input) return false;
    const hat = hatToDpad(axes[9]);
    const sticks = sticksToDpad(axes);
    const dUp = gp.buttons[12]?.pressed || hat.up || sticks.up;
    const dDown = gp.buttons[13]?.pressed || hat.down || sticks.down;
    const dLeft = gp.buttons[14]?.pressed || hat.left || sticks.left;
    const dRight = gp.buttons[15]?.pressed || hat.right || sticks.right;

    let val = input.value.toUpperCase();
    // Clamp to maxlength attribute
    const maxLen = parseInt(input.getAttribute('maxlength') || '5', 10);
    if (val.length > maxLen) val = val.slice(0, maxLen);
    let caret = input.selectionStart ?? val.length;

    function setVal(newVal, newCaret = null) {
      input.value = newVal;
      const pos = Math.max(0, Math.min(newVal.length, newCaret === null ? newVal.length : newCaret));
      input.setSelectionRange(pos, pos);
    }

    function cycleChar(delta) {
      // If caret at end (insertion point) and we still have capacity, start new char at 'A'
      if (caret === val.length && val.length < maxLen) {
        val += 'A';
        caret = val.length - 1;
      }
      if (!val.length) return; // nothing to cycle
      if (caret >= val.length) caret = val.length - 1;
      const current = val[caret];
      const idx = TARDBOARD_CHARSET.indexOf(current);
      let nextIdx;
      if (idx === -1) {
        nextIdx = 0;
      } else {
        nextIdx = (idx + delta + TARDBOARD_CHARSET.length) % TARDBOARD_CHARSET.length;
      }
      val = val.substring(0, caret) + TARDBOARD_CHARSET[nextIdx] + val.substring(caret + 1);
      setVal(val, caret);
    }

    // Navigation / editing
    if (tbEdge('left', dLeft)) {
      if (caret > 0) { caret--; setVal(val, caret); }
    }
    if (tbEdge('right', dRight)) {
      if (caret < val.length) { caret++; setVal(val, caret); }
    }
    if (tbEdge('up', dUp)) {
      cycleChar(1);
    }
    if (tbEdge('down', dDown)) {
      cycleChar(-1);
    }

    // A -> Submit
    if (edgePressed(gp, 0)) {
      const okBtn = document.getElementById('tardboard-dialog-ok');
      okBtn && okBtn.click();
    }
    // B -> Cancel
    if (edgePressed(gp, 1)) {
      const cancelBtn = document.getElementById('tardboard-dialog-cancel');
      cancelBtn && cancelBtn.click();
    }
    // X (button 2) -> Delete char before caret (like backspace)
    if (edgePressed(gp, 2)) {
      if (caret > 0 && val.length) {
        val = val.slice(0, caret - 1) + val.slice(caret);
        caret--;
        setVal(val, caret);
      }
    }
    // Y (button 3) -> Delete char at caret
    if (edgePressed(gp, 3)) {
      if (caret < val.length && val.length) {
        val = val.slice(0, caret) + val.slice(caret + 1);
        setVal(val, caret);
      }
    }

    // Prevent other handlers while dialog active
    return true;
  }

  // --- Main Gamepad Handling ---
  
  /**
   * Returns an array of valid gamepad devices, filtering out audio devices and requiring at least 4 buttons and 2 axes.
   */
  function getPads() {
    if (!navigator.getGamepads) return [];
    try {
      return Array.from(navigator.getGamepads())
        .filter(gp =>
          gp &&
          Array.isArray(gp.buttons) && gp.buttons.length >= 4 &&
          Array.isArray(gp.axes) && gp.axes.length >= 2 &&
          typeof gp.id === 'string' &&
          !/speaker|audio|headset|usb audio/i.test(gp.id)
        );
    } catch {
      return [];
    }
  }


  /**
   * Returns true if the button at idx was just pressed (edge detection).
   */
  function edgePressed(gp, idx) {
    const b = gp.buttons[idx];
    const pressed = !!(b && (b.pressed || (typeof b.value === 'number' && b.value > 0.5)));
    const was = prevButtons[idx] || false;
    prevButtons[idx] = pressed;
    return pressed && !was;
  }


  /**
   * Converts a D-pad "hat" axis value to digital directions.
   */
  function hatToDpad(h) {
    if (typeof h !== 'number' || Number.isNaN(h)) return { up: false, down: false, left: false, right: false };
    const near = (x, t) => Math.abs(x - t) < 0.25;
    const up = near(h, -1) || near(h, 1);
    const right = near(h, -0.714) || near(h, -0.428);
    const down = near(h, -0.142) || near(h, 0.142);
    const left = near(h, 0.428) || near(h, 0.714);
    return { up, down, left, right };
  }


  /**
   * Converts thumbstick axes to digital D-pad directions (LS and RS both contribute).
   */
  function sticksToDpad(axes) {
    const lx = withDeadzone(axes[0] || 0);
    const ly = withDeadzone(axes[1] || 0);
    const rx = withDeadzone(axes[2] || 0);
    const ry = withDeadzone(axes[3] || 0);
    return {
      up: (ly < -DEADZONE) || (ry < -DEADZONE),
      down: (ly > DEADZONE) || (ry > DEADZONE),
      left: (lx < -DEADZONE) || (rx < -DEADZONE),
      right: (lx > DEADZONE) || (rx > DEADZONE),
    };
  }


  /**
   * Applies deadzone threshold to an axis value.
   */
  function withDeadzone(v) {
    return Math.abs(v) < DEADZONE ? 0 : v;
  }


  /**
   * Returns the current timestamp in milliseconds.
   */
  function now() {
    return performance.now();
  }


  /**
   * Returns true if input is currently blocked (e.g. during animation).
   */
  function isBlocked() {
    return !!(window._inputBlocked || window.animationActive);
  }


  /**
   * Returns true if the game is over.
   */
  function isDead() {
    // Use the global gameOver flag only
    try { if (typeof gameOver !== 'undefined' && gameOver) return true; } catch {}
    try { if (typeof window !== 'undefined' && window.gameOver) return true; } catch {}
    return false;
  }

  
  /**
   * Returns the active menu instance, avoiding DOM collisions.
   */
  function getMenuInstance() {
    try { if (typeof menu !== 'undefined' && menu && typeof menu.isOpen === 'function') return menu; } catch {}
    const candidates = [window.menuInstance, window.MenuInstance, window.GameMenu];
    for (const c of candidates) {
      if (c && typeof c.isOpen === 'function') return c;
    }
    return null;
  }


  /**
   * Attempts to call a global function by name.
   */
  function tryFn(fnName, ...args) {
    const fn = window[fnName];
    if (typeof fn === 'function') {
      fn(...args);
      return true;
    }
    return false;
  }


  /**
   * Sends a key input to the menu if open.
   */
  function tryMenuInput(key) {
    const m = getMenuInstance();
    if (m && m.isOpen()) { m.handleInput(key); return true; }
    return false;
  }


  /**
   * Returns the global GameControl object if available.
   */
  function getGameControl() {
    try { if (typeof GameControl !== 'undefined') return GameControl; } catch {}
    return window.GameControl || null;
  }


  /**
   * Returns the global player object if available.
   */
  function getPlayer() {
    try { if (typeof player !== 'undefined') return player; } catch {}
    return window.player || null;
  }


  /**
   * Handles input for the title screen (A or Start to continue).
   */
  function handleTitleScreen(gp) {
    if (typeof TITLE_SCREEN !== "undefined" && ! TITLE_SCREEN?.isActive) {
      return false;
    }

    if (edgePressed(gp, 0) || edgePressed(gp, 9)) {
      // @TODO Refactor this since it's duplicating the callback code in
      // game.html
      // @see https://github.com/packardbell95/tardquest/issues/162
      TITLE_SCREEN.startGame(
        document.getElementById('titleScreen'),
        () => {
          const $interface = document.getElementById("interface");
          $interface.classList.remove("hidden");
          $interface.classList.add("reveal");

          setTimeout(() => {
            $interface.classList.remove("reveal");
            GameControl.enableControls();
            music.playRandom("exploration");
            render();
          }, 500);
        }
      );
      return true;
    }
    return false;
  }


  /**
   * Handles menu navigation and actions (D-pad, thumbsticks, hat, A/B/Start).
   */
  function handleMenu(gp, axes) {
    const hat = hatToDpad(axes[9]);
    const sticks = sticksToDpad(axes);
    const dpad = {
      up: !!(gp.buttons[12]?.pressed || hat.up || sticks.up),
      down: !!(gp.buttons[13]?.pressed || hat.down || sticks.down),
      left: !!(gp.buttons[14]?.pressed || hat.left || sticks.left),
      right: !!(gp.buttons[15]?.pressed || hat.right || sticks.right),
    };

    // Use repeat delay for navigation
    const up = forcedInputLatency('up', dpad.up);
    const down = forcedInputLatency('down', dpad.down);
    const left = forcedInputLatency('left', dpad.left);
    const right = forcedInputLatency('right', dpad.right);

    if (up) tryMenuInput('arrowup');
    if (down) tryMenuInput('arrowdown');
    if (left) tryMenuInput('arrowleft');
    if (right) tryMenuInput('arrowright');

    // A to confirm, B to cancel, Start toggles settings
    if (edgePressed(gp, 0)) tryMenuInput('enter');
    if (edgePressed(gp, 1)) tryMenuInput('escape');
    if (edgePressed(gp, 9)) {
      const m = getMenuInstance();
      if (m) { 
        if (m.isOpen()) {
          // Check if the current menu has escapeDisabled before closing
          const currentMenuData = m.getCurrentMenuData?.();
          if (!currentMenuData?.escapeDisabled) {
            m.close(); 
          }
        } else {
          m.open('gameSettings'); 
        }
      }
    }
  }


  /**
   * Debounces repeated input for D-pad/thumbstick directions.
   */
  function forcedInputLatency(dir, pressed) {
    if (!pressed) {
      lastMenuDpad[dir] = 0;
      return false;
    }
    if (now() - lastMenuDpad[dir] > INPUT_REPEAT_MS) {
      lastMenuDpad[dir] = now();
      return true;
    }
    return false;
  }


  /**
   * Handles exploration navigation and quick actions.
   */
  function handleNavigation(gp, axes) {
    const hat = hatToDpad(axes[9]);
    const sticks = sticksToDpad(axes);

    // Use repeat delay for all directions
    if (forcedInputLatency('up', gp.buttons[12]?.pressed || hat.up || sticks.up)) {
      tryFn('move', 'forward');
    }
    if (forcedInputLatency('down', gp.buttons[13]?.pressed || hat.down || sticks.down)) {
      tryFn('move', 'backward');
    }
    if (forcedInputLatency('left', gp.buttons[14]?.pressed || hat.left || sticks.left)) {
      tryFn('turnLeft');
    }
    if (forcedInputLatency('right', gp.buttons[15]?.pressed || hat.right || sticks.right)) {
      tryFn('turnRight');
    }

    // Strafe left/right (L1/R1)
    if (edgePressed(gp, 4)) tryFn('move', 'strafeLeft');
    if (edgePressed(gp, 5)) tryFn('move', 'strafeRight');
    // Y opens Inventory
    if (edgePressed(gp, 3)) {
      const m = getMenuInstance();
      if (m && !m.isOpen()) tryFn('playSFX', 'inventoryOpen');
      m?.open?.('inventory');
    }
    // Start opens settings
    if (edgePressed(gp, 9)) {
      const m = getMenuInstance();
      if (m) { if (m.isOpen()) m.close(); else m.open('gameSettings'); }
    }
    // Press X to Talk (quick tap) or Hold X to Release
    if (gp.buttons[2]?.pressed) {
      const player = getPlayer();
      // Load full party array
      const party = player?.party;
      const partyArray = party?.members || []; // Adjust property name if needed
      // Select a random member
      const randomMember = partyArray.length
        ? partyArray[Math.floor(Math.random() * partyArray.length)]
        : null;
      const partyMemberId = randomMember?.id || 0;
    
      if (!talkHoldStart) talkHoldStart = now();
    
      // If held long enough, trigger Release
      if (now() - talkHoldStart > TALK_HOLD_MS) {
        if (party?.release) {
          party.release(partyMemberId);
          talkHoldStart = 0; // Reset after release
          partyTalkLocked = false;
        }
      } else if (!partyTalkLocked && now() - talkHoldStart < TALK_HOLD_MS) {
        // Only trigger Talk once, and only if not holding for Release
        if (party?.talk) {
          party.talk(partyMemberId);
          partyTalkLocked = true;
        }
      }
    } else {
      talkHoldStart = 0; // Reset if X is released
    }
  }


  /**
   * Handles combat actions and navigation.
   */
  function handleCombat(gp, axes) {
    // Attack: A or RT
    if (edgePressed(gp, 0) || edgePressed(gp, 7) || (axes[R2_AXIS] !== undefined && (axes[R2_AXIS] > 0.6))) tryFn('playerAttack');
    // Try Run: B or LT
    if (edgePressed(gp, 1) || edgePressed(gp, 6) || (axes[L2_AXIS] !== undefined && (axes[L2_AXIS] > 0.6))) tryFn('tryRun');
    // Persuade: X
    if (edgePressed(gp, 2)) tryFn('submitPersuasion');
    // Inventory: Y
    if (edgePressed(gp, 3)) {
      const m = getMenuInstance();
      if (m && !m.isOpen()) tryFn('playSFX', 'inventoryOpen');
      m?.open?.('inventory');
    }
    // Settings: Start
    if (edgePressed(gp, 9)) {
      const m = getMenuInstance();
      if (m) { if (m.isOpen()) m.close(); else m.open('gameSettings'); }
    }
    // Cancel submenu: B (if menu open)
    {
      const m = getMenuInstance();
      if (m?.isOpen() && edgePressed(gp, 1)) m.handleInput('escape');
    }
  }


  /**
   * Main gamepad processing loop. Routes input to appropriate handler.
   */
  function processGamepad(gp) {
    const axes = gp.axes || [];
    // Prepare previous button/axis states
    if (!prevButtons.length) prevButtons = gp.buttons.map(b => !!b.pressed);

    // If TardBoard initials dialog is open, handle exclusively
    if (handleTardBoardDialog(gp, axes)) {
      return;
    }

    // UI input device activity detection
    (function detectActivity(){
      let hasActivity = false;
      const parts = [];

      if (gp.buttons) {
        for (let i = 0; i < gp.buttons.length; i++) {
          const b = gp.buttons[i];
          const pressed = !!(b && (b.pressed || (typeof b.value === 'number' && b.value > 0.3)));
          if (pressed) {
            hasActivity = true;
            parts.push(`b${i}`);
          }
        }
      }

      if (axes) {
        for (let i = 0; i < axes.length; i++) {
          const v = axes[i];
          if (Math.abs(v) > ACTIVITY_AXIS_DEADZONE) {
            hasActivity = true;
            parts.push(`a${i}:${Math.round(v * 10)}`);
          }
        }
      }

      const signature = hasActivity ? parts.join('|') : '';
      const padIndex = typeof gp.index === 'number' ? gp.index : 0;
      const prevSignature = lastActivitySignature.get(padIndex) || '';

      if (signature) {
        if (signature !== prevSignature && window.InputDeviceManager) {
          window.InputDeviceManager.setLast('gamepad');
        }
        lastActivitySignature.set(padIndex, signature);
      } else if (prevSignature) {
        lastActivitySignature.delete(padIndex);
      }
    })();


    // Block all inputs unless GameControl.enabled is true
    const gcForEnabled = getGameControl();
    if (gcForEnabled && gcForEnabled.enabled !== true) {
      // Keep previous states in sync to avoid edge-trigger bursts when re-enabled
      if (gp.buttons) {
        try {
          prevButtons = gp.buttons.map(b => !!(b && (b.pressed || (typeof b.value === 'number' && b.value > 0.5))));
        } catch {}
      }
      return;
    }

    // Block all inputs if game is over
    if (isDead()) {
      if (gp.buttons) {
        try {
          prevButtons = gp.buttons.map(b => !!(b && (b.pressed || (typeof b.value === 'number' && b.value > 0.5))));
        } catch {}
      }
      return;
    }

    if (isBlocked()) {
      // Allow A/Start to dismiss title screen even if input is blocked
      handleTitleScreen(gp);
      return;
    }

    // Title screen
    if (handleTitleScreen(gp)) {
      return;
    }

    // Menu mode
    if (getMenuInstance()?.isOpen()) {
      handleMenu(gp, axes);
      return;
    }

    // Game modes
    const gc = getGameControl();
    const pl = getPlayer();
    if ((gc && gc.mode === 'combat') || (pl && pl.inCombat)) {
      handleCombat(gp, axes);
    } else {
      handleNavigation(gp, axes);
    }

  }


  /**
   * Main animation frame loop. Polls gamepad and processes input.
   */
  function loop() {
    const pads = getPads();
    const $controllerBox = document.getElementById('controller');
    const $controllerStatusButton = document.getElementById('controllerStatusButton');
    if (pads.length && pads[0]) {
      // Patch party.enableButtons every frame if needed
      const player = getPlayer();
      const party = player?.party;
      if (party && typeof party.enableButtons === 'function' && !party._patchedEnableButtons) {
        const origEnable = party.enableButtons.bind(party);
        party.enableButtons = function(...args) {
          partyTalkLocked = false;
          return origEnable(...args);
        };
        party._patchedEnableButtons = true;
      }

      if (!loggedPadInfo) {
        const gp = pads[0];
        try {
          console.info('🎮 TardPad: Connected:', { id: gp.id, mapping: gp.mapping, buttons: gp.buttons?.length, axes: gp.axes?.length });
        } catch {}
        loggedPadInfo = true;
      }
      processGamepad(pads[0]);
      if ($controllerBox) $controllerBox.className = 'connected';
      if ($controllerStatusButton) $controllerStatusButton.classList.add('connected');
    } else {
      if ($controllerBox) $controllerBox.className = 'disconnected';
      if ($controllerStatusButton) $controllerStatusButton.classList.remove('connected');
    }  
  }

  /**
   * Handles gamepad disconnection event.
   */
  function onDisconnect() {
    const hasPads = getPads().length > 0;
    if (!hasPads) {
      prevButtons = [];
    }
  }


  /**
   * Public rumble helper. Triggers vibration on the active gamepad.
   */
  function vibrate(ms = 120, amp = 1.0) {
    const gp = getPads()[0];
    if (!gp) { return; }
    const act = gp.vibrationActuator;
    if (!act || typeof act.playEffect !== 'function') {
      return;
    }
    const effect = {
      duration: ms,
      strongMagnitude: Math.max(0, Math.min(1, amp)),
      weakMagnitude: Math.max(0, Math.min(1, amp * 0.8)),
    };
    let tried = false;
    try {
      act.playEffect('dual-rumble', effect);
      tried = true;
    } catch (e) {}
    if (!tried) {
      try {
        act.playEffect('vibration', effect);
      } catch (e2) {}
    }
  }


  // Expose rumble helper
  window.GamepadSupport = { 
    vibrate,
  };

  /**
   * Initializes gamepad support and starts polling.
   */
  function start() {
    window.addEventListener('gamepaddisconnected', onDisconnect);
  }

  // Start gamepad support after window load
  window.addEventListener('load', start);
  setInterval(() => { loop(); }, 1000 / 60); // 60 FPS

// Display connection status modal popup when clicking on the Tardpad icon
function showControllerStatusModal() {
  const pads = getPads();
  const isConnected = pads.length > 0 && pads[0];
  
  let content;
  if (isConnected) {
    const gp = pads[0];
    content = `
      <h3><img src="assets/interface/ui/tardpad-connected.png" height="15px"> Gamepad Connected</h3>
      <p><strong>Name:</strong> ${gp.id}</p>
    `;
  } else {
    content = `
      <h3><img src="assets/interface/ui/tardpad-disconnected.png" height="15px"> No Gamepad Detected</h3>
      <p>Please connect a gamepad and press any button to activate it.</p>
    `;
  }

  // Create modal dialog element
  const modal = document.createElement('dialog');
  modal.className = 'modal';
  
  modal.innerHTML = `
    <div class="header">
      <div class="title">TardPad Status</div>
      <button class="close" onclick="this.closest('dialog').close()"></button>
    </div>
    <div class="bodyContainer">
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <button onclick="this.closest('dialog').close()">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.showModal();
  modal.addEventListener('close', () => {
    modal.remove();
  });
}

// Make it globally available
window.showControllerStatusModal = showControllerStatusModal;

// Debugging info to make sure the script is loaded.
// console.info('🎮 TardPad: Script loaded successfully!');
})();
