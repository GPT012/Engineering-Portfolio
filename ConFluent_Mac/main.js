// ===================================
// ConFluent Mac — Main Process (V2)
// System-wide keyboard interception
// Translation + Text Replacement
// ===================================

'use strict';

const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain,
  nativeTheme, nativeImage, systemPreferences, clipboard, dialog } = require('electron');
const path = require('path');
const { execFile } = require('child_process');
const Store = require('electron-store');
const KeyListener = require('./keylistener');

// === CONSTANTS ===
const IS_DEV = process.argv.includes('--dev');
const WINDOW_WIDTH = 420;
const WINDOW_HEIGHT = 520;

// === ELECTRON STORE (persistent config) ===
const store = new Store({
  defaults: {
    enabled: true,
    targetLang: 'en',
    sourceLang: 'auto',
    triggerMode: 'timer',
    delay: 1000,
    myLang: 'fr',
    theme: nativeTheme.shouldUseDarkColors ? 'dark' : 'light',
    windowBounds: null,
    dictationHistory: [],
    dictationLang: 'fr-FR'
  }
});

// === TRANSLATION CACHE (LRU) ===
const CACHE_MAX_SIZE = 200;
const translationCache = new Map();

function getCacheKey(text, targetLang, sourceLang) {
  return `${sourceLang}:${targetLang}:${text.trim().toLowerCase()}`;
}

function getCached(text, targetLang, sourceLang) {
  const key = getCacheKey(text, targetLang, sourceLang);
  if (translationCache.has(key)) {
    const value = translationCache.get(key);
    translationCache.delete(key);
    translationCache.set(key, value);
    return value;
  }
  return null;
}

function setCache(text, targetLang, sourceLang, translation) {
  const key = getCacheKey(text, targetLang, sourceLang);
  if (translationCache.size >= CACHE_MAX_SIZE) {
    const oldest = translationCache.keys().next().value;
    translationCache.delete(oldest);
  }
  translationCache.set(key, translation);
}

// === TRANSLATION ENGINE ===
const pendingRequests = new Map();

async function translateText(text, targetLang = 'en', sourceLang = 'auto') {
  if (!text || text.trim().length === 0) return { error: 'Empty text' };
  const trimmed = text.trim();

  const cached = getCached(trimmed, targetLang, sourceLang);
  if (cached) return { translation: cached, fromCache: true };

  const dedupeKey = getCacheKey(trimmed, targetLang, sourceLang);
  if (pendingRequests.has(dedupeKey)) {
    return pendingRequests.get(dedupeKey);
  }

  const requestPromise = (async () => {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
      const response = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      let translation = '';
      let detectedLang = sourceLang;

      if (data?.[0]) {
        for (const part of data[0]) {
          if (part?.[0]) translation += part[0];
        }
      }
      if (data?.[2]) detectedLang = data[2];

      const result = translation.trim();
      if (result.length > 0) {
        setCache(trimmed, targetLang, sourceLang, result);
        return { translation: result, detectedLang };
      }
      return { error: 'No translation received' };
    } catch (error) {
      return { error: error.message };
    } finally {
      pendingRequests.delete(dedupeKey);
    }
  })();

  pendingRequests.set(dedupeKey, requestPromise);
  return requestPromise;
}

// === GRAB TEXT FROM ACTIVE APP + TRANSLATE + REPLACE ===
// Works with ANY keyboard layout (AZERTY, QWERTY, etc.)
function grabTextFromActiveApp() {
  return new Promise((resolve, reject) => {
    // Save current clipboard
    const savedClipboard = clipboard.readText();
    // Clear clipboard to detect if copy worked
    clipboard.writeText('');

    // AppleScript: Cmd+A (select all in field) → Cmd+C (copy)
    const script = `
      tell application "System Events"
        keystroke "a" using {command down}
        delay 0.08
        keystroke "c" using {command down}
        delay 0.08
      end tell
    `;

    execFile('osascript', ['-e', script], { timeout: 3000 }, (error) => {
      if (error) {
        clipboard.writeText(savedClipboard);
        reject(error);
        return;
      }

      // Read what was selected/copied
      setTimeout(() => {
        const grabbed = clipboard.readText();
        // Restore original clipboard
        clipboard.writeText(savedClipboard);

        if (grabbed && grabbed.trim().length >= 2) {
          resolve(grabbed.trim());
        } else {
          resolve(null);
        }
      }, 100);
    });
  });
}

function pasteTranslation(translatedText) {
  return new Promise((resolve, reject) => {
    const savedClipboard = clipboard.readText();
    clipboard.writeText(translatedText);

    // Text is already selected from the grab step, so just paste
    const script = `
      tell application "System Events"
        keystroke "v" using {command down}
      end tell
    `;

    execFile('osascript', ['-e', script], { timeout: 3000 }, (error) => {
      // Restore clipboard after paste completes
      setTimeout(() => {
        clipboard.writeText(savedClipboard);
      }, 300);

      if (error) reject(error);
      else resolve();
    });
  });
}

// === GLOBALS ===
let mainWindow = null;
let overlayWindow = null;
let dictationWindow = null;
let tray = null;
let keyListener = null;
let translationLog = [];
const MAX_LOG_SIZE = 50;

// === DICTATION STATE ===
let isDictating = false;
let dictationTimeout = null;
let dictationHistory = [];

// === CHECK ACCESSIBILITY ===
function checkAccessibility() {
  const isTrusted = systemPreferences.isTrustedAccessibilityClient(false);
  if (!isTrusted) {
    dialog.showMessageBox({
      type: 'warning',
      title: 'Permission Required',
      message: 'ConFluent needs Accessibility permission',
      detail: 'To translate text as you type in any application, ConFluent needs the Accessibility permission.\n\nClick "Open Settings" to grant it, then restart ConFluent.',
      buttons: ['Open Settings', 'Later'],
      defaultId: 0
    }).then(({ response }) => {
      if (response === 0) {
        // This triggers the macOS prompt to grant accessibility
        systemPreferences.isTrustedAccessibilityClient(true);
      }
    });
    return false;
  }
  return true;
}

// === CREATE WINDOW ===
function createWindow() {
  const savedBounds = store.get('windowBounds');

  mainWindow = new BrowserWindow({
    width: savedBounds?.width || WINDOW_WIDTH,
    height: savedBounds?.height || WINDOW_HEIGHT,
    x: savedBounds?.x,
    y: savedBounds?.y,
    minWidth: 360,
    minHeight: 400,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 18 },
    vibrancy: 'under-window',
    visualEffectState: 'active',
    backgroundColor: '#00000000',
    transparent: true,
    show: false,
    alwaysOnTop: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (IS_DEV) mainWindow.webContents.openDevTools({ mode: 'detach' });
  });

  mainWindow.on('close', (e) => {
    e.preventDefault();
    store.set('windowBounds', mainWindow.getBounds());
    mainWindow.hide();
  });

  // Tell keylistener when our window is focused (so it doesn't intercept our own typing)
  mainWindow.on('focus', () => { keyListener?.setAppFocused(true); });
  mainWindow.on('blur', () => { keyListener?.setAppFocused(false); });

  mainWindow.on('resize', () => store.set('windowBounds', mainWindow.getBounds()));
  mainWindow.on('move', () => store.set('windowBounds', mainWindow.getBounds()));
}

// === OVERLAY WINDOW (floating badge bottom-right) ===
function createOverlay() {
  const { screen } = require('electron');
  const display = screen.getPrimaryDisplay();
  const { width: screenW, height: screenH } = display.workAreaSize;

  overlayWindow = new BrowserWindow({
    width: 300,
    height: 220,
    x: screenW - 300,
    y: screenH - 220,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload-overlay.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  overlayWindow.loadFile(path.join(__dirname, 'src', 'overlay.html'));

  // Make click-through except for the badge itself
  // Mouse enter/leave is tracked via IPC from overlay.html
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });

  // Keep on top even when other windows are focused
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.setAlwaysOnTop(true, 'floating', 1);
}

// Helper: send to overlay
function sendToOverlay(channel, data) {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send(channel, data);
  }
}

// === TRAY ===
function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'trayIconTemplate.png');
  let trayImage;
  try {
    trayImage = nativeImage.createFromPath(iconPath);
    trayImage.setTemplateImage(true);
  } catch {
    trayImage = nativeImage.createEmpty();
  }

  tray = new Tray(trayImage);
  tray.setToolTip('ConFluent — Translator');

  const updateTrayMenu = () => {
    const isEnabled = store.get('enabled');
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show ConFluent',
        click: () => { mainWindow?.show(); mainWindow?.focus(); }
      },
      { type: 'separator' },
      {
        label: 'Enabled',
        type: 'checkbox',
        checked: isEnabled,
        click: (menuItem) => {
          store.set('enabled', menuItem.checked);
          keyListener?.setEnabled(menuItem.checked);
          mainWindow?.webContents.send('config-changed', { enabled: menuItem.checked });
        }
      },
      { type: 'separator' },
      {
        label: 'Quit ConFluent',
        click: () => {
          keyListener?.stop();
          mainWindow?.removeAllListeners('close');
          app.quit();
        }
      }
    ]);
    tray.setContextMenu(contextMenu);
  };

  updateTrayMenu();

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) mainWindow.hide();
      else { mainWindow.show(); mainWindow.focus(); }
    }
  });
}

// === APP MENU ===
function createAppMenu() {
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            keyListener?.stop();
            mainWindow?.removeAllListeners('close');
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' }, { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }
      ]
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'close' }]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// === KEY LISTENER SETUP ===
function setupKeyListener() {
  keyListener = new KeyListener();

  // Apply saved config
  keyListener.setEnabled(store.get('enabled'));
  keyListener.setTriggerMode(store.get('triggerMode'));
  keyListener.setDelay(store.get('delay'));

  // Typing activity → send keystroke count to renderer
  keyListener.on('typing', (count) => {
    mainWindow?.webContents.send('buffer-update', `Typing... (${count} keys)`);
  });

  // Translation request: grab text → translate → replace
  keyListener.on('translate-request', async () => {
    const targetLang = store.get('targetLang');

    // Notify renderer: translating
    mainWindow?.webContents.send('translation-status', 'translating');
    sendToOverlay('overlay-status', 'translating');

    try {
      // Step 1: Grab text from the active app (Cmd+A → Cmd+C)
      const originalText = await grabTextFromActiveApp();

      if (!originalText) {
        mainWindow?.webContents.send('translation-status', 'ready');
        keyListener.cancelTranslation();
        return;
      }

      // Show what we grabbed
      mainWindow?.webContents.send('buffer-update', originalText);

      // Step 2: Translate
      const result = await translateText(originalText, targetLang, 'auto');

      if (result?.translation && result.translation !== originalText) {
        // Step 3: Paste the translation (text is still selected from grab)
        // Re-select since clipboard was restored
        const savedClip = clipboard.readText();
        clipboard.writeText('');

        const selectScript = `
          tell application "System Events"
            keystroke "a" using {command down}
            delay 0.05
          end tell
        `;

        await new Promise((resolve, reject) => {
          execFile('osascript', ['-e', selectScript], { timeout: 2000 }, (err) => {
            if (err) reject(err); else resolve();
          });
        });

        await pasteTranslation(result.translation);

        // Log it
        const logEntry = {
          original: originalText,
          translation: result.translation,
          lang: targetLang,
          detectedLang: result.detectedLang || 'auto',
          timestamp: Date.now(),
          fromCache: !!result.fromCache
        };

        translationLog.unshift(logEntry);
        if (translationLog.length > MAX_LOG_SIZE) translationLog.pop();

        // Notify renderer + overlay
        mainWindow?.webContents.send('translation-done', logEntry);
        mainWindow?.webContents.send('translation-status', 'ready');
        mainWindow?.webContents.send('buffer-update', '');
        sendToOverlay('overlay-translation-done', logEntry);
        sendToOverlay('overlay-status', 'active');

        keyListener.resetAfterTranslation();
      } else {
        // Translation same as original or failed — skip replacement
        mainWindow?.webContents.send('translation-status', 'ready');
        mainWindow?.webContents.send('buffer-update', '');
        keyListener.cancelTranslation();
      }
    } catch (err) {
      mainWindow?.webContents.send('translation-status', 'error');
      sendToOverlay('overlay-status', 'error');
      keyListener.cancelTranslation();
      setTimeout(() => {
        mainWindow?.webContents.send('translation-status', 'ready');
        sendToOverlay('overlay-status', 'active');
      }, 2000);
    }
  });

  // Handle Dictation Triggers (Long press Fn / Left Ctrl)
  keyListener.on('modifier-event', (e) => {
    if (['FN', 'SECTION', 'LEFT CTRL'].includes(e.name)) {
      if (e.state === 'DOWN') {
        if (!isDictating) {
          // Must hold for 300ms to avoid interfering with normal shortcuts
          if (!dictationTimeout) {
            dictationTimeout = setTimeout(() => {
              isDictating = true;
              sendToOverlay('start-dictation');
              sendToDictation('start-dictation');
            }, 400); // 400ms long press threshold
          }
        }
      } else if (e.state === 'UP') {
        if (dictationTimeout) {
          clearTimeout(dictationTimeout);
          dictationTimeout = null;
        }
        if (isDictating) {
          sendToOverlay('stop-dictation');
          sendToDictation('stop-dictation');
          isDictating = false;
        }
      }
    }
  });

  keyListener.on('error', () => {
    mainWindow?.webContents.send('translation-status', 'error');
    sendToOverlay('overlay-status', 'error');
  });

  // START
  const started = keyListener.start();
  if (!started) {
    mainWindow?.webContents.send('accessibility-required', true);
  }
}

// === IPC HANDLERS ===
function setupIPC() {
  ipcMain.handle('translate', async (_event, { text, targetLang, sourceLang }) => {
    return translateText(text, targetLang, sourceLang || 'auto');
  });

  ipcMain.handle('get-config', () => ({
    enabled: store.get('enabled'),
    targetLang: store.get('targetLang'),
    sourceLang: store.get('sourceLang'),
    triggerMode: store.get('triggerMode'),
    delay: store.get('delay'),
    myLang: store.get('myLang'),
    theme: store.get('theme')
  }));

  ipcMain.handle('save-config', (_event, config) => {
    for (const [key, value] of Object.entries(config)) {
      store.set(key, value);
    }
    // Apply config to key listener
    if (config.enabled !== undefined) keyListener?.setEnabled(config.enabled);
    if (config.triggerMode) keyListener?.setTriggerMode(config.triggerMode);
    if (config.delay) keyListener?.setDelay(config.delay);
    return true;
  });

  ipcMain.handle('get-version', () => app.getVersion());

  ipcMain.handle('get-log', () => translationLog);

  ipcMain.handle('check-accessibility', () => {
    return systemPreferences.isTrustedAccessibilityClient(false);
  });

  ipcMain.handle('request-accessibility', () => {
    return systemPreferences.isTrustedAccessibilityClient(true);
  });

  // === OVERLAY IPC ===
  ipcMain.on('overlay-toggle', (_event, enabled) => {
    store.set('enabled', enabled);
    keyListener?.setEnabled(enabled);
    mainWindow?.webContents.send('config-changed', { enabled });
    sendToOverlay('overlay-enabled', enabled);
    sendToOverlay('overlay-status', enabled ? 'active' : 'disabled');
  });

  ipcMain.on('overlay-show-main', () => {
    if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
  });

  // Mouse hover on overlay badge: make it clickable
  ipcMain.on('overlay-mouse-enter', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.setIgnoreMouseEvents(false);
    }
  });

  ipcMain.on('overlay-mouse-leave', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.setIgnoreMouseEvents(true, { forward: true });
    }
  });

  ipcMain.on('dictation-result', (_event, { text, error }) => {
    if (error) {
      console.error('Dictation error:', error);
      return;
    }
    if (text) {
      clipboard.writeText(text);
      sendToOverlay('overlay-translation-done', {
        original: "🎤 Microphone (Copied to Clipboard!)",
        translation: text,
        lang: "fr-FR"
      });
    }
  });

  // === DICTATION WINDOW IPC ===
  ipcMain.on('dictation-copy', (_event, text) => {
    if (text) clipboard.writeText(text);
  });

  ipcMain.on('dictation-save-entry', (_event, entry) => {
    dictationHistory.unshift(entry);
    if (dictationHistory.length > 200) dictationHistory.pop();
    store.set('dictationHistory', dictationHistory);
  });

  ipcMain.handle('dictation-get-history', () => {
    return dictationHistory;
  });

  ipcMain.on('dictation-clear-history', () => {
    dictationHistory = [];
    store.set('dictationHistory', []);
  });

  ipcMain.on('dictation-save-lang', (_event, lang) => {
    store.set('dictationLang', lang);
  });

  ipcMain.handle('dictation-get-lang', () => {
    return store.get('dictationLang', 'fr-FR');
  });
}

// === DICTATION WINDOW ===
function createDictationWindow() {
  const { screen } = require('electron');
  const display = screen.getPrimaryDisplay();
  const { width: screenW } = display.workAreaSize;

  dictationWindow = new BrowserWindow({
    width: 420,
    height: 580,
    x: screenW - 440,
    y: 80,
    minWidth: 340,
    minHeight: 440,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 18 },
    vibrancy: 'under-window',
    visualEffectState: 'active',
    backgroundColor: '#00000000',
    transparent: true,
    show: false,
    alwaysOnTop: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload-dictation.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false // Need access to getUserMedia for microphone
    }
  });

  dictationWindow.loadFile(path.join(__dirname, 'src', 'dictation.html'));

  dictationWindow.on('close', (e) => {
    e.preventDefault();
    dictationWindow.hide();
  });

  // Don't intercept typing when dictation window is focused
  dictationWindow.on('focus', () => { keyListener?.setAppFocused(true); });
  dictationWindow.on('blur', () => { keyListener?.setAppFocused(false); });
}

// Helper: send to dictation window
function sendToDictation(channel, data) {
  if (dictationWindow && !dictationWindow.isDestroyed()) {
    dictationWindow.webContents.send(channel, data);
  }
}

// === GLOBAL SHORTCUTS ===
function registerShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    if (mainWindow) {
      if (mainWindow.isVisible() && mainWindow.isFocused()) mainWindow.hide();
      else { mainWindow.show(); mainWindow.focus(); }
    }
  });

  // Dictation window shortcut
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (dictationWindow) {
      if (dictationWindow.isVisible() && dictationWindow.isFocused()) dictationWindow.hide();
      else { dictationWindow.show(); dictationWindow.focus(); }
    }
  });
}

// === APP LIFECYCLE ===
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
  });
}

app.whenReady().then(async () => {
  // Load saved dictation history
  dictationHistory = store.get('dictationHistory', []);

  createAppMenu();
  createWindow();
  createOverlay();
  createDictationWindow();
  createTray();
  setupIPC();
  registerShortcuts();

  // Request Microphone permission for Dictation (Web Speech API)
  if (process.platform === 'darwin') {
    systemPreferences.askForMediaAccess('microphone');
  }

  // Check accessibility, then start listener
  const hasAccess = checkAccessibility();
  if (hasAccess) {
    setupKeyListener();
  } else {
    // Re-check periodically until granted
    const accessInterval = setInterval(() => {
      if (systemPreferences.isTrustedAccessibilityClient(false)) {
        clearInterval(accessInterval);
        setupKeyListener();
        mainWindow?.webContents.send('accessibility-granted', true);
      }
    }, 3000);
  }
});

app.on('activate', () => {
  if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  keyListener?.stop();
});

app.on('window-all-closed', (e) => e.preventDefault());
