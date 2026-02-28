// ===================================
// ConFluent Mac — Dictation Preload
// Secure IPC bridge for dictation window
// ===================================

'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('confluent', {
    // Config (reuse existing)
    getConfig: () => ipcRenderer.invoke('get-config'),

    // Dictation
    copyToClipboard: (text) => ipcRenderer.send('dictation-copy', text),
    saveDictationEntry: (entry) => ipcRenderer.send('dictation-save-entry', entry),
    getDictationHistory: () => ipcRenderer.invoke('dictation-get-history'),
    clearDictationHistory: () => ipcRenderer.send('dictation-clear-history'),
    saveDictationLang: (lang) => ipcRenderer.send('dictation-save-lang', lang),
    getDictationLang: () => ipcRenderer.invoke('dictation-get-lang'),

    // IPC events from main (fn key press/release)
    onStartDictation: (cb) => ipcRenderer.on('start-dictation', () => cb()),
    onStopDictation: (cb) => ipcRenderer.on('stop-dictation', () => cb())
});
