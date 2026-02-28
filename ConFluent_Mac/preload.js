// ===================================
// ConFluent Mac — Preload Script (V2)
// Secure IPC bridge — System-wide mode
// ===================================

'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('confluent', {
    // Translation (manual)
    translate: (text, targetLang, sourceLang) => {
        return ipcRenderer.invoke('translate', { text, targetLang, sourceLang });
    },

    // Config
    getConfig: () => ipcRenderer.invoke('get-config'),
    saveConfig: (config) => ipcRenderer.invoke('save-config', config),

    // App info
    getVersion: () => ipcRenderer.invoke('get-version'),

    // Translation log
    getLog: () => ipcRenderer.invoke('get-log'),

    // Accessibility
    checkAccessibility: () => ipcRenderer.invoke('check-accessibility'),
    requestAccessibility: () => ipcRenderer.invoke('request-accessibility'),

    // Events from main process
    onConfigChanged: (cb) => ipcRenderer.on('config-changed', (_e, data) => cb(data)),
    onBufferUpdate: (cb) => ipcRenderer.on('buffer-update', (_e, text) => cb(text)),
    onTranslationStatus: (cb) => ipcRenderer.on('translation-status', (_e, status) => cb(status)),
    onTranslationDone: (cb) => ipcRenderer.on('translation-done', (_e, entry) => cb(entry)),
    onAccessibilityRequired: (cb) => ipcRenderer.on('accessibility-required', (_e, val) => cb(val)),
    onAccessibilityGranted: (cb) => ipcRenderer.on('accessibility-granted', (_e, val) => cb(val))
});
