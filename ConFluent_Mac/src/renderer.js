// ===================================
// ConFluent Mac — Renderer (V2)
// Control Panel UI for System-Wide Mode
// ===================================

'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    // === DOM ===
    const $ = (id) => document.getElementById(id);
    const elEnabled = $('enabled');
    const elTargetLang = $('targetLang');
    const elDelay = $('delay');
    const elTriggerMode = $('triggerMode');
    const elDelayContainer = $('delay-container');
    const elThemeToggle = $('theme-toggle');
    const elToast = $('toast');
    const elAppVersion = $('app-version');
    const elStatusDot = $('status-dot');
    const elStatusLabel = $('status-label');
    const elLiveBuffer = $('live-buffer');
    const elLiveIndicator = $('live-indicator');
    const elLogList = $('log-list');
    const elClearLogBtn = $('clear-log-btn');
    const elAccessBanner = $('accessibility-banner');
    const elGrantAccessBtn = $('grant-access-btn');

    // === STATE ===
    let isEnabled = true;

    // === TOAST ===
    let toastTimer = null;
    function showToast(text) {
        if (!elToast) return;
        clearTimeout(toastTimer);
        elToast.textContent = text;
        elToast.classList.add('show');
        toastTimer = setTimeout(() => elToast.classList.remove('show'), 1800);
    }

    // === STATUS ===
    function setGlobalStatus(state, label) {
        if (elStatusDot) {
            elStatusDot.className = 'status-dot';
            if (state === 'active') elStatusDot.classList.add('active');
            else if (state === 'working') elStatusDot.classList.add('working');
            else if (state === 'error') elStatusDot.classList.add('error');
            else elStatusDot.classList.add('inactive');
        }
        if (elStatusLabel) {
            elStatusLabel.textContent = label || 'Active';
            elStatusLabel.style.color = state === 'error' ? 'var(--error)' :
                state === 'working' ? 'var(--primary)' :
                    state === 'active' ? 'var(--accent)' : 'var(--text-muted)';
        }
    }

    // === LOAD CONFIG ===
    async function loadConfig() {
        try {
            const config = await window.confluent.getConfig();
            if (!config) return;

            isEnabled = config.enabled !== false;
            elEnabled.checked = isEnabled;

            if (config.targetLang) elTargetLang.value = config.targetLang;
            if (config.triggerMode) elTriggerMode.value = config.triggerMode;
            if (config.delay) elDelay.value = config.delay;
            if (config.theme === 'dark') document.body.classList.add('dark-mode');

            updateVisibility();
            setGlobalStatus(isEnabled ? 'active' : 'inactive', isEnabled ? 'Active' : 'Paused');
        } catch (e) {
            console.warn('Config load error:', e);
        }
    }

    // === SAVE CONFIG ===
    let saveTimer = null;
    function saveConfig() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(async () => {
            const config = {
                enabled: elEnabled.checked,
                targetLang: elTargetLang.value,
                triggerMode: elTriggerMode.value,
                delay: parseInt(elDelay.value),
                theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light'
            };

            try { await window.confluent.saveConfig(config); }
            catch (e) { console.warn('Config save error:', e); }
        }, 200);
    }

    function updateVisibility() {
        if (elDelayContainer) {
            elDelayContainer.style.display = elTriggerMode.value === 'timer' ? 'flex' : 'none';
        }
    }

    // === LOG ENTRY RENDERING ===
    function addLogEntry(entry) {
        // Remove the empty placeholder if it's there
        const emptyEl = elLogList.querySelector('.log-empty');
        if (emptyEl) emptyEl.remove();

        const el = document.createElement('div');
        el.className = 'log-entry';

        const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const langTag = entry.detectedLang && entry.detectedLang !== 'auto' ? entry.detectedLang : '';

        el.innerHTML = `
      <div class="log-entry-original">${escapeHtml(entry.original)}</div>
      <div class="log-entry-translation">${escapeHtml(entry.translation)}</div>
      <div class="log-entry-meta">
        ${langTag ? `<span class="log-entry-lang">${langTag} → ${entry.lang}</span>` : ''}
        <span class="log-entry-time">${time}</span>
        ${entry.fromCache ? '<span class="log-entry-cached">⚡ cached</span>' : ''}
      </div>
    `;

        elLogList.prepend(el);

        // Cap at 50 visible entries
        while (elLogList.children.length > 50) {
            elLogList.removeChild(elLogList.lastChild);
        }
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // === LOAD EXISTING LOG ===
    async function loadLog() {
        try {
            const log = await window.confluent.getLog();
            if (log && log.length > 0) {
                // Render in reverse so newest is on top
                for (let i = log.length - 1; i >= 0; i--) {
                    addLogEntry(log[i]);
                }
            }
        } catch { /* ignore */ }
    }

    // === EVENT LISTENERS ===

    // Settings
    [elEnabled, elTargetLang, elTriggerMode, elDelay].forEach(el => {
        if (el) {
            el.addEventListener('change', () => {
                if (el === elEnabled) {
                    isEnabled = elEnabled.checked;
                    setGlobalStatus(isEnabled ? 'active' : 'inactive', isEnabled ? 'Active' : 'Paused');
                }
                if (el === elTriggerMode) updateVisibility();
                saveConfig();
            });
        }
    });

    // Theme toggle
    elThemeToggle?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        saveConfig();
    });

    // Clear log
    elClearLogBtn?.addEventListener('click', () => {
        elLogList.innerHTML = '<div class="log-empty">No translations yet. Start typing in any app...</div>';
    });

    // Grant accessibility
    elGrantAccessBtn?.addEventListener('click', async () => {
        await window.confluent.requestAccessibility();
        showToast('Opening System Settings...');
    });

    // === IPC LISTENERS (from main process) ===

    // Live buffer update
    window.confluent.onBufferUpdate((text) => {
        if (text && text.length > 0) {
            elLiveBuffer.textContent = text;
            elLiveBuffer.className = 'live-buffer typing';
        } else {
            elLiveBuffer.innerHTML = '<span class="live-placeholder">Waiting for input in any app...</span>';
            elLiveBuffer.className = 'live-buffer';
        }
    });

    // Translation status
    window.confluent.onTranslationStatus((status) => {
        if (status === 'translating') {
            setGlobalStatus('working', 'Translating...');
            elLiveBuffer.className = 'live-buffer translating';
        } else if (status === 'error') {
            setGlobalStatus('error', 'Error');
            setTimeout(() => {
                if (isEnabled) setGlobalStatus('active', 'Active');
            }, 2000);
        } else {
            if (isEnabled) setGlobalStatus('active', 'Active');
            elLiveBuffer.className = 'live-buffer';
        }
    });

    // Translation done
    window.confluent.onTranslationDone((entry) => {
        addLogEntry(entry);
        showToast(`✓ Translated: "${entry.translation.substring(0, 30)}${entry.translation.length > 30 ? '...' : ''}"`);
    });

    // Config changed from tray
    window.confluent.onConfigChanged((config) => {
        if (config.enabled !== undefined) {
            isEnabled = config.enabled;
            elEnabled.checked = isEnabled;
            setGlobalStatus(isEnabled ? 'active' : 'inactive', isEnabled ? 'Active' : 'Paused');
        }
    });

    // Accessibility required
    window.confluent.onAccessibilityRequired(() => {
        elAccessBanner.style.display = 'flex';
        setGlobalStatus('error', 'No Access');
    });

    // Accessibility granted
    window.confluent.onAccessibilityGranted(() => {
        elAccessBanner.style.display = 'none';
        setGlobalStatus('active', 'Active');
        showToast('✓ Accessibility granted');
    });

    // === KEYBOARD SHORTCUTS ===
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
            e.preventDefault();
            elThemeToggle?.click();
        }
    });

    // === INIT ===
    await loadConfig();
    await loadLog();

    // Check accessibility status
    try {
        const hasAccess = await window.confluent.checkAccessibility();
        if (!hasAccess) {
            elAccessBanner.style.display = 'flex';
            setGlobalStatus('error', 'No Access');
        }
    } catch { /* ignore */ }

    // Version
    try {
        const v = await window.confluent.getVersion();
        if (elAppVersion) elAppVersion.textContent = `v${v}`;
    } catch { /* ignore */ }
});
