// ===================================
// ConFluent Mac — Overlay Preload
// Bridge for the floating badge window
// ===================================

'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlayAPI', {
    toggleEnabled: (enabled) => ipcRenderer.send('overlay-toggle', enabled),
    showMainWindow: () => ipcRenderer.send('overlay-show-main'),
    mouseEnter: () => ipcRenderer.send('overlay-mouse-enter'),
    mouseLeave: () => ipcRenderer.send('overlay-mouse-leave'),

    onStatusChange: (cb) => ipcRenderer.on('overlay-status', (_e, status) => cb(status)),
    onTranslationDone: (cb) => ipcRenderer.on('overlay-translation-done', (_e, entry) => cb(entry)),
    onEnabledChanged: (cb) => ipcRenderer.on('overlay-enabled', (_e, enabled) => cb(enabled)),

    // Dictation
    onStartDictation: (cb) => ipcRenderer.on('start-dictation', () => cb()),
    onStopDictation: (cb) => ipcRenderer.on('stop-dictation', () => cb()),
    sendDictationResult: (text, error) => ipcRenderer.send('dictation-result', { text, error })
});
