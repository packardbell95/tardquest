(function () {
  // --- Constants ---
  const DEADZONE = 0.35; // Thumbstick deadzone threshold
  const L2_AXIS = 4;     // Axis index for left trigger (L2)
  const R2_AXIS = 5;     // Axis index for right trigger (R2)
  const INPUT_REPEAT_MS = 250; // Repeat delay for D-pad and thumbstick navigation
  const TALK_HOLD_MS = 1000; // Hold X for 1 second to trigger Release
  const ACTIVITY_AXIS_DEADZONE = 0.45; // Threshold for UI hint swapping

  // --- State ---
  let rafId = null;
  let connected = false;
  let prevButtons = [];
  let prevAxes = [];
  let loggedPadInfo = false;
  let lastMenuDpad = { up: 0, down: 0, left: 0, right: 0 };
  let partyTalkLocked = false;
  let talkHoldStart = 0;
  let controllerStatusElement = null;


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
   * Updates the controller status text and class based on connection state (TheMilkMan)
   */
  function updateControllerStatusDisplay() {
    if (!controllerStatusElement) {
      controllerStatusElement = document.getElementById('controllerStatusText');
    }
    
    if (!controllerStatusElement) return;

    const $controllerBox = document.getElementById('controller');
    const pads = getPads();
    const hasController = pads.length > 0 && pads[0];

    if (hasController) {
      controllerStatusElement.textContent = '✓ TardPad';
      controllerStatusElement.className = 'connected';
      if ($controllerBox) $controllerBox.className = 'connected';
    } else {
      controllerStatusElement.textContent = '✗ TardPad';
      controllerStatusElement.className = 'disconnected';
      if ($controllerBox) $controllerBox.className = 'disconnected';
    }
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
   * Returns true if the title screen is currently visible.
   */
  function titleScreenVisible() {
    const el = document.getElementById('titleScreen');
    return !!(el && el.style.display !== 'none');
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
    if (!titleScreenVisible()) return false;
    if (edgePressed(gp, 0) || edgePressed(gp, 9)) {
      if (typeof window.hideTitleScreen === 'function') window.hideTitleScreen();
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
      if (m) { if (m.isOpen()) m.close(); else m.open('gameSettings'); }
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
    const lx = withDeadzone(axes[0] || 0);
    const ly = withDeadzone(axes[1] || 0);
    const rx = withDeadzone(axes[2] || 0);
    const ry = withDeadzone(axes[3] || 0);
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
    if (!prevAxes.length) prevAxes = axes.slice();

    // UI input device activity detection
    (function detectActivity(){
      let active = false;

      // Buttons
      if (gp.buttons) {
        for (let i = 0; i < gp.buttons.length; i++) {
          const b = gp.buttons[i];
          if (b && (b.pressed || (typeof b.value === 'number' && b.value > 0.3))) {
            active = true; break;
          }
        }
      }
      // Axes (includes sticks / triggers if reported as axes)
      if (!active && axes) {
        for (let i = 0; i < axes.length; i++) {
          if (Math.abs(axes[i]) > ACTIVITY_AXIS_DEADZONE) {
            active = true; break;
          }
        }
      }
      if (active && window.InputDeviceManager) {
        window.InputDeviceManager.setLast('gamepad');
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
      prevAxes = axes.slice();
      return;
    }

    // Block all inputs if game is over
    if (isDead()) {
      if (gp.buttons) {
        try {
          prevButtons = gp.buttons.map(b => !!(b && (b.pressed || (typeof b.value === 'number' && b.value > 0.5))));
        } catch {}
      }
      prevAxes = axes.slice();
      return;
    }

    if (isBlocked()) {
      // Allow A/Start to dismiss title screen even if input is blocked
      handleTitleScreen(gp);
      prevAxes = axes.slice();
      return;
    }

    // Title screen
    if (handleTitleScreen(gp)) {
      prevAxes = axes.slice();
      return;
    }

    // Menu mode
    if (getMenuInstance()?.isOpen()) {
      handleMenu(gp, axes);
      prevAxes = axes.slice();
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

    prevAxes = axes.slice();
  }


  /**
   * Main animation frame loop. Polls gamepad and processes input.
   */
  function loop() {
    const pads = getPads();
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
    }
    rafId = window.requestAnimationFrame(loop);
  }


  /**
   * Handles gamepad connection event.
   */
  function onConnect() {
    connected = true;
    if (!rafId) rafId = window.requestAnimationFrame(loop);
    updateControllerStatusDisplay();
  }

  /**
   * Handles gamepad disconnection event.
   */
  function onDisconnect() {
    connected = getPads().length > 0;
    if (!connected && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
      prevButtons = [];
      prevAxes = [];
    }
    updateControllerStatusDisplay();
  }


  /**
   * Public rumble helper. Triggers vibration on the active gamepad.
   */
  function vibrate(ms = 120, amp = 1.0) {
    const gp = getPads()[0];
    // VOCAP: Quiet down console warnings about missing gamepad or rumble support. Enable as needed for debugging.
    // if (!gp) { console.warn('🎮 TardPad: No gamepad for rumble'); return; }
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
    updateControllerStatus: updateControllerStatusDisplay
  };

  /**
   * Initializes gamepad support and starts polling.
   */
  function start() {
    window.addEventListener('gamepadconnected', onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);
    // Start polling regardless; some browsers/controllers don't always emit the event reliably
    if (!rafId) rafId = window.requestAnimationFrame(loop);
  }

  // Start gamepad support after window load
  window.addEventListener('load', start);

  setInterval(updateControllerStatusDisplay, 1000);
})();

// Debugging info to make sure the script is loaded.
// console.info('🎮 TardPad: Script loaded successfully!');
