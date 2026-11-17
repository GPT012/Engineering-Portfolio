# ConFluent Chrome | Web Translation

> Translate text you enter on supported web pages.

ConFluent Chrome is a Manifest V3 browser extension that can translate text entered in web page fields and editors. Compatibility depends on the page and its input controls.

---

### 🚀 Key Features

- **Input translation**: Translates text after a pause in typing and supports a range of web page fields and editors.
- **Translation service**: Sends translation requests to `translate.googleapis.com`.
- **Clipboard actions**: Uses the browser clipboard APIs for selected translation actions.

---

### 🛠️ Technical Implementation

- **Manifest version**: `3`.
- **Background processing**: JavaScript service worker.
- **Content script**: Configured for all URLs and frames at `document_end`; behavior can vary between sites.
- **Declared permissions**: `storage`, `activeTab`, `scripting`, `clipboardRead`, and `clipboardWrite`; the host permission is `https://translate.googleapis.com/*`.

---

### 🎨 Modular UI
The popup provides controls for enabling the extension and selecting a target language.

---

### 📦 Development & Installation

1.  Clone the repository.
2.  Go to `chrome://extensions`.
3.  Enable **Developer Mode**.
4.  Click **Load Unpacked** and select the `src/` directory.

---

### Built by [GPT012](https://github.com/GPT012)

### Tests

Run `npm test` to test translation-response parsing and caching in the background service worker with a stubbed API response. The `tests/e2e_*.spec.js` files are headed-browser simulations that log results but do not assert translation outcomes; they are not included in `npm test`.
