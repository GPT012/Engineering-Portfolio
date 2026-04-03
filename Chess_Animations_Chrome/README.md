# Chess Animations | Intelligent Move Evaluation ♟️🎨

> **A High-Performance Browser Extension for Real-Time Pedagogical Feedback on Chess.com.**

Chess Animations is a cutting-edge Chrome extension designed to elevate the online chess experience. By integrating advanced **Stockfish NNUE** evaluation engines with a sophisticated UI, it provides players with instant, high-quality analysis of their moves, categorizing them with meaningful pedagogical feedback.

---

### 🚀 Key Features

- **Real-Time Analysis** : Evaluates every move instantly using the latest **Stockfish** engine.
- **Pedagogical Classification** : Moves are intelligently categorized (Brilliant, Great, Inaccuracy, Mistake, Blunder) to help players understand their performance.
- **Dynamic Centipawn Loss Calculation** : Highly precise evaluation feedback for every position.
- **Visual Feedback System** : Clean, non-distracting animations and indicators that enhance the default Chess.com experience.
- **Cloud API Integration** : Leverages **Lichess Cloud API** and polyglot opening books for lightning-fast analysis in any game phase.

---

### 🛡️ Technical Implementation

- **Platform** : Chrome Browser Extension (Manifest V3).
- **Engine** : Local Stockfish NNUE + Cloud API fallback.
- **Architecture** : Async worker-driven analysis to maintain board responsiveness and high-precision evaluation.

---

### 🎨 Design Goals
Designed for both casual players and serious students of the game, Chess Animations focuses on providing data-driven insights without cluttering the playing field.

---

### 📦 Installation

1.  Clone the repository.
2.  Enable Developer Mode in `chrome://extensions`.
3.  Load the `src/` directory.

---

### Developed by [0xbaw](https://github.com/0xbaw)
*High-End Browser Extension Architect & Logic Expert.*
