# ConFluent Chrome | Seamless Web Translation ✨🌍

> **Auto-translate what you type, anywhere on the web.**

ConFluent Chrome is a high-performance Browser Extension built with **Manifest V3**. It provides a seamless, real-time translation experience for users who communicate across multiple languages on web-based platforms, from social media to productivity suites.

---

### 🚀 Key Features

- **Real-Time Translation** : Translates your typed text instantly as you interact with web forms and inputs.
- **Universal Compatibility** : Works across `<all_urls>`, injecting its logic into all frames for a consistent experience on any site.
- **Power Efficiency** : Leverages **Chrome Service Workers** for background processing, ensuring minimal impact on browser performance.
- **Direct API Integration** : Direct communication with **Google Translate API** for reliable and accurate translations.
- **Clipboard Intelligence** : Integrated `clipboardRead/Write` for quick translation of copied text segments.

---

### 🛠️ Technical Implementation

- **Manifest Version** : `3` (Latest standard).
- **Core Engine** : Native JavaScript with **Service Worker** architecture.
- **Script Injection** : Advanced `content_script` injection at `document_end`, ensuring compatibility with modern SPAs (Single Page Apps).
- **Permissions** : Granular and secure use of `scripting` and `storage` APIs to maintain user privacy and security.

---

### 🎨 Modular UI
The extension features a clean, intuitive popup for configuration, allowing users to toggle features and change target languages instantly.

---

### 📦 Development & Installation

1.  Clone the repository.
2.  Go to `chrome://extensions`.
3.  Enable **Developer Mode**.
4.  Click **Load Unpacked** and select the `src/` directory.

---

### Developed by [0xbaw](https://github.com/0xbaw)
*Browser Extension Architect & Web Specialist.*
