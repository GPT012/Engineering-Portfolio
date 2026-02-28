// ===================================
// ConFluent Mac — Global Key Listener (V3)
// FIXED: Better key filtering, higher threshold,
// won't trigger when ConFluent window is focused
// ===================================

'use strict';

const { GlobalKeyboardListener } = require('node-global-key-listener');
const { EventEmitter } = require('events');

// Keys that represent actual typed characters
// These key names come from node-global-key-listener
const PRINTABLE_KEYS = new Set([
    // Letters (works regardless of AZERTY/QWERTY — we just count them)
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    // Numbers
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    // Punctuation / symbols
    'SPACE', 'DOT', 'COMMA', 'SEMICOLON', 'QUOTE', 'FORWARD SLASH',
    'BACK SLASH', 'OPEN BRACKET', 'CLOSE BRACKET', 'MINUS', 'EQUALS',
    'BACKTICK', 'PERIOD', 'SLASH', 'BACKSLASH',
    // Numpad
    'NUMPAD 0', 'NUMPAD 1', 'NUMPAD 2', 'NUMPAD 3', 'NUMPAD 4',
    'NUMPAD 5', 'NUMPAD 6', 'NUMPAD 7', 'NUMPAD 8', 'NUMPAD 9',
    'NUMPAD DECIMAL', 'NUMPAD ADD', 'NUMPAD SUBTRACT',
    'NUMPAD MULTIPLY', 'NUMPAD DIVIDE',
    // Common French AZERTY extra keys
    'SECTION', 'GRAVE'
]);

// Keys that should NOT count but also NOT reset the buffer
const IGNORED_KEYS = new Set([
    'LEFT META', 'RIGHT META', 'LEFT CTRL', 'RIGHT CTRL',
    'LEFT ALT', 'RIGHT ALT', 'LEFT SHIFT', 'RIGHT SHIFT',
    'CAPS LOCK', 'TAB', 'ESCAPE',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
    'PRINT SCREEN', 'SCROLL LOCK', 'PAUSE',
    'INSERT', 'NUM LOCK',
    'VOLUME UP', 'VOLUME DOWN', 'VOLUME MUTE',
    'MEDIA PLAY PAUSE', 'MEDIA STOP', 'MEDIA NEXT', 'MEDIA PREV'
]);

class KeyListener extends EventEmitter {
    constructor() {
        super();
        this._listener = null;
        this._enabled = true;
        this._triggerMode = 'timer';
        this._delay = 1000;
        this._isTranslating = false;
        this._typingTimer = null;
        this._keystrokeCount = 0;
        this._lastTriggerTime = 0;
        this._MIN_KEYSTROKES = 8; // Need at least 8 character keys before triggering
        this._appFocused = false; // True when ConFluent window is focused
    }

    // Called by main process to tell us ConFluent is focused
    setAppFocused(focused) {
        this._appFocused = focused;
        if (focused) {
            // Don't translate when our own window is active
            this._clearTimer();
            this._keystrokeCount = 0;
        }
    }

    // === START ===
    start() {
        try {
            this._listener = new GlobalKeyboardListener();

            this._listener.addListener((event) => {
                if (!this._enabled) return;
                if (this._appFocused) return; // Don't intercept our own window

                // Forward modifier keys to main process for features like dictation
                if (['FN', 'SECTION', 'LEFT CTRL', 'RIGHT CTRL', 'LEFT ALT', 'LEFT META'].includes(event.name)) {
                    this.emit('modifier-event', { name: event.name, state: event.state });
                }

                if (event.state !== 'DOWN') return;

                this._handleKey(event);
            });

            this.emit('status', 'listening');
            return true;
        } catch (err) {
            this.emit('error', `Failed to start key listener: ${err.message}`);
            return false;
        }
    }

    // === STOP ===
    stop() {
        if (this._listener) {
            try { this._listener.kill(); } catch { /* ignore */ }
            this._listener = null;
        }
        this._clearTimer();
        this._keystrokeCount = 0;
        this.emit('status', 'stopped');
    }

    // === HANDLE KEY ===
    _handleKey(event) {
        const keyName = event.name;

        // Completely ignore modifier/function keys
        if (IGNORED_KEYS.has(keyName)) return;

        // Skip modifier combos (Cmd+C, Ctrl+V, etc.) — these are shortcuts, not typing
        if (event.metaKey || event.ctrlKey) return;

        // === ENTER / RETURN: trigger if enough keystrokes ===
        if (keyName === 'RETURN' || keyName === 'ENTER') {
            if (this._keystrokeCount >= this._MIN_KEYSTROKES) {
                this._clearTimer();
                this._triggerTranslation();
            }
            this._keystrokeCount = 0;
            return;
        }

        // === Arrow keys / navigation: user moved cursor, reset ===
        if (['UP', 'DOWN', 'LEFT', 'RIGHT', 'HOME', 'END',
            'PAGE UP', 'PAGE DOWN'].includes(keyName)) {
            this._keystrokeCount = 0;
            this._clearTimer();
            return;
        }

        // === BACKSPACE / DELETE ===
        if (keyName === 'BACKSPACE' || keyName === 'DELETE') {
            this._keystrokeCount = Math.max(0, this._keystrokeCount - 1);
            this._clearTimer();
            if (this._keystrokeCount >= this._MIN_KEYSTROKES) {
                this._startTriggerTimer();
            }
            return;
        }

        // === Only count actual printable character keys ===
        if (!PRINTABLE_KEYS.has(keyName)) {
            // Unknown key — ignore, don't count
            return;
        }

        this._keystrokeCount++;

        // Notify main process about typing activity
        this.emit('typing', this._keystrokeCount);

        // Only evaluate trigger once we have enough keystrokes
        if (this._keystrokeCount >= this._MIN_KEYSTROKES) {
            this._evaluateTrigger(keyName);
        }
    }

    // === EVALUATE TRIGGER ===
    _evaluateTrigger(lastKeyName) {
        if (this._isTranslating) return;

        this._clearTimer();

        const mode = this._triggerMode;

        if (mode === 'pro') {
            // Pro: trigger after sentence-ending punctuation
            if (['DOT', 'PERIOD'].includes(lastKeyName)) {
                this._typingTimer = setTimeout(() => this._triggerTranslation(), 300);
            }
        } else if (mode === 'rapid') {
            // Rapid: trigger on space or after short pause
            if (lastKeyName === 'SPACE') {
                this._typingTimer = setTimeout(() => this._triggerTranslation(), 300);
            } else {
                this._typingTimer = setTimeout(() => this._triggerTranslation(), 1000);
            }
        } else {
            // Timer: wait for configured delay after last keystroke
            this._startTriggerTimer();
        }
    }

    _startTriggerTimer() {
        this._clearTimer();
        this._typingTimer = setTimeout(() => this._triggerTranslation(), this._delay);
    }

    // === TRIGGER ===
    _triggerTranslation() {
        if (this._isTranslating) return;
        if (this._keystrokeCount < this._MIN_KEYSTROKES) return;
        if (this._appFocused) return; // Safety check

        // Prevent rapid re-triggering
        const now = Date.now();
        if (now - this._lastTriggerTime < 1000) return;
        this._lastTriggerTime = now;

        this._isTranslating = true;

        this.emit('translate-request', {
            keystrokeCount: this._keystrokeCount
        });
    }

    // === AFTER TRANSLATION ===
    resetAfterTranslation() {
        this._keystrokeCount = 0;
        this._isTranslating = false;
    }

    cancelTranslation() {
        this._isTranslating = false;
    }

    // === CONFIG ===
    setEnabled(enabled) {
        this._enabled = enabled;
        if (!enabled) {
            this._keystrokeCount = 0;
            this._clearTimer();
        }
    }

    setTriggerMode(mode) { this._triggerMode = mode; }
    setDelay(delay) { this._delay = parseInt(delay) || 1000; }

    _clearTimer() {
        if (this._typingTimer) {
            clearTimeout(this._typingTimer);
            this._typingTimer = null;
        }
    }
}

module.exports = KeyListener;
