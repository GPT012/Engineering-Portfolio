// Popup Controller — ConFluent v3.2
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // === DOM REFERENCES ===
    const $ = (id) => document.getElementById(id);
    const elEnabled = $('enabled');
    const elMyLang = $('myLang');
    const elTargetLang = $('targetLang');
    const elTriggerMode = $('triggerMode');
    const elConversationMode = $('conversationMode');
    const elThemeToggle = $('theme-toggle');
    const elStatus = $('status');
    const elDelayContainer = $('delay-container');
    const elProfileBar = $('profile-bar');
    const elUserName = $('user-name');
    const elUserAvatar = $('user-avatar');
    const elLogoutBtn = $('logout-btn');

    // === DEBOUNCED SAVE ===
    let saveTimer = null;
    const SAVE_DEBOUNCE = 300;

    function showToast(text = '✓ Saved') {
        if (!elStatus) return;
        elStatus.textContent = text;
        elStatus.classList.add('show');
        setTimeout(() => elStatus.classList.remove('show'), 1500);
    }

    // === LOAD CONFIG ===
    chrome.storage.local.get(
        ['enabled', 'delay', 'triggerMode', 'conversationMode', 'myLang', 'targetLang', 'theme', 'user'],
        (c) => {
            if (chrome.runtime.lastError || !c) return;

            elEnabled.checked = c.enabled !== false;
            // Support legacy users: myLang was Preferred Lang, targetLang was Reply Lang
            if (c.myLang) elMyLang.value = c.myLang;
            if (c.targetLang) elTargetLang.value = c.targetLang;
            if (c.triggerMode) elTriggerMode.value = c.triggerMode;
            if (c.conversationMode) elConversationMode.checked = true;
            if (c.theme === 'dark') document.body.classList.add('dark-mode');

            updateVisibility();

            // Show profile if logged in (no forced redirect)
            if (c.user) {
                showProfile(c.user);
            }
        }
    );

    // === PROFILE DISPLAY ===
    function showProfile(user) {
        if (elProfileBar && user) {
            elProfileBar.style.display = 'flex';
            elUserName.textContent = user.name || user.email || 'User';
            elUserAvatar.src = user.picture || '';
        }
    }

    // === LOGOUT ===
    function logout() {
        chrome.storage.local.remove('user', () => {
            elProfileBar.style.display = 'none';
            showToast('Signed out');
        });
    }

    // === SYNC TO SUPABASE ===
    async function syncToSupabase(settings) {
        chrome.storage.local.get(['user'], async (res) => {
            if (res.user && res.user.email) {
                try {
                    await fetch('https://iisjgbmhlgpnzqoaevml.supabase.co/rest/v1/profiles?email=eq.' + res.user.email, {
                        method: 'PATCH',
                        headers: {
                            'apikey': 'sb_publishable_IHrNdjkpayFqGnp_5jGw6g_MLenBeW9',
                            'Authorization': 'Bearer sb_publishable_IHrNdjkpayFqGnp_5jGw6g_MLenBeW9',
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify({
                            settings: settings,
                            updated_at: new Date().toISOString()
                        })
                    });
                } catch (e) {
                    console.error('Remote sync failed:', e);
                }
            }
        });
    }

    // === SAVE CONFIG (debounced) ===
    function saveConfig() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            const config = {
                enabled: elEnabled.checked,
                targetLang: elTargetLang.value, // User's reply language
                myLang: elMyLang.value,         // User's native/incoming language
                triggerMode: elTriggerMode.value,
                conversationMode: elConversationMode.checked,
                theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light'
            };

            chrome.storage.local.set(config);
            syncToSupabase(config); // Push to Supabase

            // Broadcast to all tabs
            chrome.tabs.query({}, (tabs) => {
                for (const tab of tabs) {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'configChanged',
                        config
                    }).catch(() => { });
                }
            });

            showToast();
        }, SAVE_DEBOUNCE);
    }

    // === UI HELPERS ===
    function updateVisibility() {
        const mainCard = $('main-card');
        if (mainCard && elConversationMode) {
            if (elConversationMode.checked) {
                mainCard.classList.add('live-chat-active');
            } else {
                mainCard.classList.remove('live-chat-active');
            }
        }
    }

    // === EVENT LISTENERS ===
    const inputs = [elEnabled, elMyLang, elTargetLang, elTriggerMode, elConversationMode];
    for (const input of inputs) {
        if (input) input.addEventListener('change', saveConfig);
    }

    // Conversation mode and trigger mode also update visibility
    elConversationMode?.addEventListener('change', updateVisibility);
    elTriggerMode?.addEventListener('change', updateVisibility);

    // === THEME TOGGLE ===
    elThemeToggle?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        saveConfig();
    });

    // === LOGOUT ===
    elLogoutBtn?.addEventListener('click', logout);
});
