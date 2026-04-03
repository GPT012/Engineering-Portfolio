# ConFluent Mac | Desktop AI Companion 🎙️🌍

> **Instant Voice-to-Clipboard Transcription & Real-Time Translation.**

ConFluent Mac is a state-of-the-art desktop utility designed to eliminate communication barriers. Built with **Electron** and high-performance native modules, it allows users to dictate, translate, and paste text across any application with zero friction.

---

### 🚀 Key Features

- **Global Key Listening** : Trigger transcription or translation from anywhere in the OS via custom shortcuts.
- **Micro-to-Clipboard Engine** : Advanced speech recognition that captures, processes, and inserts text directly into your active window.
- **Instant Overlay** : A minimalist, non-intrusive UI that provides visual feedback and translation status over other apps.
- **Custom Translation Workflows** : Integration with premium translation APIs for real-time multilingual support.

---

### 🛡️ Technical Architecture

- **Core** : `Electron 33`, `V8 Engine`.
- **System Integration** : `node-global-key-listener` for low-latency global hotkeys.
- **Persistence** : `electron-store` for secure configuration management.
- **UI/UX** : Multi-window architecture with transparent overlays and frameless windows.

---

### 🎨 Design & Accessibility
ConFluent is built with a **"Productivity First"** philosophy. The interface is designed to be invisible when not needed, providing a "Ghost UI" experience that responds instantly to user input.

---

### 📦 Installation & Build

#### Development
```bash
npm install
npm run dev
```

#### Production Build (Mac DMG)
```bash
npm run build
```

---

### 🔐 Security & Permissions
- **Hardened Runtime** : Fully compliant with macOS security standards.
- **Privacy** : All dictation and translation requests are handled via secure, encrypted channels.

---

### Developed by [0xbaw](https://github.com/0xbaw)
*High-End Desktop & Web Architect.*
