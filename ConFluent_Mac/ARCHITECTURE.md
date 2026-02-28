# ConFluent Mac — Analyse Architecturale & Plan de Migration

## Phase 0 : Electron vs Tauri vs SwiftUI Natif

### 📊 Mesures réelles de l'app Electron actuelle (24 fév 2026)

| Métrique | Valeur mesurée | Objectif natif |
|---|---|---|
| RAM idle (tous process) | **~500 MB** (11 process Electron) | < 50 MB |
| RAM process principal | ~87 MB | ~15 MB |
| RAM par renderer (fenêtre) | ~40-100 MB chacune | ~5, MB |
| Process helpers (GPU, Network, etc.) | 5-6 process | 0 |
| Taille Electron.app (runtime) | **233 MB** | 0 (intégré natif) |
| Taille bundle estimée (.dmg) | ~280 MB | ~15 MB (natif) / ~30 MB (Tauri) |
| Temps de lancement | ~1.5-2s | < 300ms |
| MacKeyServer (node-global-key-listener) | 2 MB séparé | Intégré (CGEvent) |

**Verdict clair : Electron consomme 10x trop de RAM et 15x trop de disque pour une menu bar app.**

---

### 🔍 Analyse des besoins spécifiques ConFluent

ConFluent n'est PAS une app web emballée. C'est une app système qui :
1. **Intercepte le clavier GLOBALEMENT** → API système profonde
2. **Manipule le presse-papier** → API système
3. **Simule des frappes** (Cmd+A, Cmd+C, Cmd+V via AppleScript) → API système
4. **Fait des requêtes HTTP** (Google Translate) → Trivial partout
5. **Affiche un overlay HUD** → API système
6. **Enregistre le micro** (dictée vocale) → API système
7. **Persiste des données** → Trivial partout

**6 de ces 7 besoins sont des interactions profondes avec macOS.**
→ Electron est le PIRE choix pour exactement ce type d'app.

---

### ⚖️ Comparaison honnête

#### Option A : Rester sur Electron (statu quo)

**Avantages réels :**
- Tu connais déjà le code, il marche
- HTML/CSS/JS = facile pour l'UI
- Web Speech API disponible nativement pour la dictée
- Cross-platform si un jour tu veux Windows

**Inconvénients réels :**
- 500 MB de RAM pour une menu bar app → inacceptable pour les utilisateurs
- 233 MB de runtime embarqué → invendable sur le Mac App Store
- 11 process Electron pour un traducteur → absurde
- `node-global-key-listener` = wrapper fragile autour de CGEvent (un binaire C séparé)
- AppleScript via `execFile('osascript')` = hack lent (~200ms par commande)
- Pas d'accès natif à Focus Mode, Widgets, Shortcuts app
- Impossible de publier sur le Mac App Store (sandbox incompatible avec ton usage)
- Les utilisateurs Mac avancés verront "Electron" dans Activity Monitor et désinstalleront

**Note : 4/10 pour ce cas d'usage**

---

#### Option B : Tauri (Rust + WebView natif)

**Avantages réels :**
- Bundle ~10-30 MB (utilise le WebView système, pas Chromium)
- RAM ~30-80 MB (1 seul process + WebView système)
- Tu gardes ton UI en HTML/CSS/JS
- Rust pour le backend → accès aux APIs C de macOS via FFI
- Tauri 2.0 supporte les tray/menu bar

**Inconvénients réels :**
- Tu dois apprendre Rust pour le backend (courbe d'apprentissage : 2-4 mois)
- CGEvent taps en Rust = complexe (FFI vers Core Graphics)
- Le WebView Safari (WKWebView) n'a PAS le Web Speech API
  → **Tu perds toute ta dictée vocale.** Remplacement : Apple Speech Framework via Rust FFI.
  → C'est un mur. Pas un bump. Un mur.
- Pas de Widgets WidgetKit (c'est du SwiftUI obligatoirement)
- Pas d'App Intents / Shortcuts natifs
- Communauté Tauri macOS plus petite = moins d'exemples pour les APIs système
- Debugging plus complexe (Rust + WebView + système)

**Note : 5/10 — mieux qu'Electron mais le Rust est un frein pour ton niveau**

---

#### Option C : SwiftUI Natif (recommandé)

**Avantages réels :**
- RAM : 15-40 MB max pour toute l'app
- Bundle : 10-15 MB en .dmg
- Lancement : < 300ms
- 1 seul process
- Accès DIRECT à toutes les APIs macOS :
  - `CGEvent` pour l'interception clavier (plus fiable que node-global-key-listener)
  - `NSPasteboard` pour le presse-papier (instantané, pas de hack AppleScript)
  - `CGEvent.post()` pour simuler les frappes (rapide, fiable)
  - `Speech` framework pour la dictée (meilleur que Web Speech API, fonctionne offline)
  - `NSStatusBar` pour le menu bar (natif, léger)
  - `WidgetKit` pour les widgets
  - `AppIntents` pour les Shortcuts Siri
  - `UserNotifications` pour les notifications riches
  - `UserDefaults` / `SwiftData` pour la persistance
- Publiable sur le Mac App Store
- Les utilisateurs Mac adorent les apps natives (argument de vente)
- La traduction Google reste un simple URLSession.shared.data(from:)

**Inconvénients réels :**
- Tu dois apprendre Swift + SwiftUI (courbe : 1-3 mois pour ton niveau)
- La réécriture complète prend du temps (estimation : 3-6 semaines pour la parité)
- SwiftUI a des bugs/limitations sur macOS (navigation sidebar, certains modifiers)
- Xcode est le seul IDE viable (pas de VSCode)
- Pas de cross-platform (Windows = réécriture totale)

**Note : 9/10 pour ConFluent sur Mac**

---

### 🎯 DÉCISION : SwiftUI Natif

**Pour une app menu bar macOS qui intercepte le clavier, manipule le clipboard, 
et enregistre le micro, le natif n'est pas un "nice to have", c'est un prérequis.**

Tu dépenses actuellement 500 MB de RAM et 11 process pour faire ce qu'un seul 
process de 20 MB ferait mieux, plus vite, plus fiablement.

---

### 📋 Plan de Migration Réaliste (tu ne réécris PAS tout d'un coup)

#### Stratégie : Migration Incrémentale en 4 Sprints

**Sprint 1 (Semaine 1-2) : Le noyau**
- Setup projet Xcode avec SwiftUI + Swift 6
- Menu bar basic (NSStatusBar + popover SwiftUI)
- Interception clavier via CGEvent tap (remplace node-global-key-listener)
- Clipboard read/write via NSPasteboard
- Simulation Cmd+A/C/V via CGEvent.post (remplace AppleScript)
- → Résultat : la traduction système-wide fonctionne

**Sprint 2 (Semaine 3) : Traduction + Persistance**
- Google Translate via URLSession
- Cache LRU en mémoire (identique à l'actuel)
- SwiftData pour l'historique persistant
- Settings UI dans le popover
- → Résultat : parité fonctionnelle avec l'Electron actuel (sans dictée)

**Sprint 3 (Semaine 4) : Dictée vocale**
- Apple Speech framework (SFSpeechRecognizer)
- Interface dictée dans une fenêtre dédiée
- Historique vocal persistant
- Auto-copie dans le clipboard
- → Résultat : dictée fonctionnelle, MIEUX qu'avant car fonctionne offline

**Sprint 4 (Semaine 5-6) : Polish & Distribution**
- UI premium (animations, vibrancy, dark mode)
- Build .dmg avec notarisation
- Sparkle pour les mises à jour auto
- Widgets WidgetKit (bonus)
- → Résultat : app prête pour distribution

---

### ⚠️ Ce qui va mal se passer (et comment l'éviter)

1. **Accessibility permission** : CGEvent tap nécessite l'autorisation Accessibilité.
   C'est IDENTIQUE à ton problème actuel. Mais le flow natif est plus propre
   (AXIsProcessTrustedWithOptions avec prompt automatique).

2. **Swift concurrency** : La gestion async du clavier + traduction + clipboard
   est délicate. Utilise un Actor dédié pour sérialiser les opérations.

3. **SwiftUI sur macOS** : Le NSPopover avec SwiftUI peut avoir des bugs de sizing.
   Solution : utilise NSHostingView avec une taille fixe au début.

4. **Code signing** : L'app DOIT être signée pour que CGEvent tap fonctionne
   en dehors du mode développeur. Achète un Apple Developer account (99€/an).

5. **La tentation du "une dernière feature en Electron"** : Ne rajoute rien
   à l'Electron. Chaque feature ajoutée augmente le coût de migration.


### 💡 Alternative intermédiaire si tu n'es pas prêt pour Swift

Si apprendre Swift maintenant est un blocage, voici un plan B pragmatique :
**Optimise l'Electron actuel en attendant la migration.**

- Supprime la dictation window séparée → utilise une seule fenêtre avec des tabs
- Supprime l'overlay window → utilise juste le tray
- Ça passe de 4 BrowserWindows à 1 → RAM divisée par 3
- Lazy-load le DevTools (ne l'ouvre qu'en mode --dev)
- Utilise `backgroundThrottling: false` sur la fenêtre principale uniquement

Cela te ferait passer de ~500 MB à ~150-200 MB en attendant la vraie migration.
