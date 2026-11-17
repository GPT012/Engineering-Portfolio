# ConFluent Mac | Desktop App 🎙️🌍

> Voice input, transcription, and translation from a macOS desktop app.

ConFluent Mac is an Electron desktop app for dictation, translation, and inserting text into the active application.

---

### 🚀 Key Features

- **Global shortcuts**: Trigger transcription or translation using configured keyboard shortcuts.
- **Dictation workflow**: Capture speech and insert the resulting text into the active window.
- **Overlay**: Displays transcription and translation status.
- **Translation**: Connects to the translation service configured by the app.

---

### 🛡️ Technical Architecture

- **Core** : `Electron 33`, `V8 Engine`.
- **System integration**: `node-global-key-listener` for global keyboard shortcuts.
- **Persistence**: `electron-store` for application settings.
- **UI/UX** : Multi-window architecture with transparent overlays and frameless windows.

---

### 🎨 Design & Accessibility
The interface uses overlays to show status while keeping the main workflow in the active application.

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
- The macOS packaging configuration enables Electron's `hardenedRuntime` option. This setting alone does not establish that the application has been security-audited.

---

### Built by [GPT012](https://github.com/GPT012)
