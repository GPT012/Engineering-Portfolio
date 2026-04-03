// ===================================
// ConFluent Swift — App Entry Point
// Replaces: main.js + Electron BrowserWindows
// Native NSStatusBar + NSPopover
// ===================================

import SwiftUI
import AppKit

@main
struct ConFluentApp: App {
    // Connect to AppKit lifecycle via NSApplicationDelegateAdaptor
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        // We don't declare any WindowGroup — the app is menu-bar only.
        // All UI is in the status bar popover.w
        Settings {
            EmptyView()
        }
    }
}

// MARK: - App Delegate

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate, NSPopoverDelegate {

    private var statusBarItem: NSStatusItem?
    private var popover: NSPopover?
    private let appState = AppState.shared

    // Core engines
    private let keyboardInterceptor = KeyboardInterceptor()
    private let dictationEngine = DictationEngine()
    private let translationService = TranslationService.shared
    private let dictationOverlay = DictationOverlayPanel()

    // CGEventTap — owned at the AppDelegate level for proper macOS Accessibility recognition
    private var eventTap: CFMachPort?
    private var runLoopSource: CFRunLoopSource?

    // Dictation hold timer (for 400ms delay before recording)
    private var dictationHoldTask: Task<Void, Never>?
    private var optionHeld = false
    private var dictationActive = false

    // MARK: - App Launch

    func applicationDidFinishLaunching(_ notification: Notification) {
        setupStatusBar()
        setupPopover()
        setupDictationCallbacks()
        setupGlobalShortcuts()

        // ⚠️ CRITICAL: Check permissions BEFORE starting the keyboard interceptor.
        // The CGEventTap requires Accessibility permission to work.
        // If we start() before the user grants permission, the tap silently fails
        // and keypresses (like Option+Space) pass through as normal input (space spam).
        checkAndStartInterceptor()
    }

    // MARK: - Status Bar

    private func setupStatusBar() {
        statusBarItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)

        if let button = statusBarItem?.button {
            // Use SF Symbols for the menu bar icon
            button.image = NSImage(systemSymbolName: "character.book.closed.fill", accessibilityDescription: "ConFluent")
            button.image?.size = NSSize(width: 18, height: 18)
            button.action = #selector(togglePopover)
            button.target = self
        }
    }

    // MARK: - Popover

    private func setupPopover() {
        popover = NSPopover()
        popover?.contentSize = NSSize(width: 400, height: 540)
        popover?.behavior = .transient  // Close when clicking outside
        popover?.animates = true
        popover?.delegate = self

        // The SwiftUI view gets the engines as environment objects
        let contentView = PopoverView()
            .overlay { PopupOverlay() }
            .environment(appState)
            .environment(dictationEngine)

        popover?.contentViewController = NSHostingController(rootView: contentView)
    }

    @objc private func togglePopover() {
        guard let button = statusBarItem?.button, let popover = popover else { return }

        if popover.isShown {
            popover.performClose(nil)
        } else {
            popover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)

            // Activate the app when showing popover
            NSApp.activate(ignoringOtherApps: true)
        }
    }

    func popoverDidShow(_ notification: Notification) {
        keyboardInterceptor.setAppFocused(true)
        // Live re-check: update accessibility state every time the popover opens
        // so the banner disappears once the user has granted permission.
        appState.hasAccessibility = AccessibilityManager.isAccessibilityEnabled()
    }

    func popoverDidClose(_ notification: Notification) {
        keyboardInterceptor.setAppFocused(false)
    }

    // MARK: - Keyboard Interceptor (event processing + callbacks)

    private func setupKeyboardInterceptor() {
        // Configure from saved state
        keyboardInterceptor.setEnabled(appState.isEnabled)
        keyboardInterceptor.setTriggerMode(appState.triggerMode)
        keyboardInterceptor.setDelay(appState.triggerDelay)


        // Typing activity → update live buffer
        keyboardInterceptor.onTypingActivity = { [weak self] count in
            Task { @MainActor in
                self?.appState.keystrokeCount = count
                self?.appState.liveBuffer = "Typing... (\(count) keys)"
            }
        }

        // Translation request → grab → translate → paste
        keyboardInterceptor.onTranslateRequest = { [weak self] in
            Task { @MainActor in
                await self?.performTranslation()
            }
        }
        // Global Dictation Shortcut (Carbon)
        GlobalHotkeyManager.shared.register(
            keyCode: appState.dictationKeyCode,
            cgModifiers: appState.dictationModifierRaw
        )

        // Dictation Start
        GlobalHotkeyManager.shared.onHotKeyDown = { [weak self] in
            DebugLogger.log("onDictationStart callback fired", level: .dictation)
            Task { @MainActor in
                guard let self = self else { DebugLogger.log("self is nil", level: .error); return }
                
                if self.dictationEngine.isRecording { return }
                
                self.dictationActive = true
                DebugLogger.log("Calling dictationEngine.startRecording()...", level: .dictation)
                
                do {
                    try self.dictationEngine.startRecording(lang: self.appState.dictationLang)
                    DebugLogger.log("startRecording() succeeded!", level: .success)
                } catch {
                    DebugLogger.log("startRecording() error: \(error)", level: .error)
                }
            }
        }
        
        // Dictation Stop
        GlobalHotkeyManager.shared.onHotKeyUp = { [weak self] in
            Task { @MainActor in
                guard let self = self else { return }
                self.dictationActive = false
                
                if self.dictationEngine.isRecording {
                    self.dictationEngine.stopRecording()
                } else {
                    self.dictationOverlay.dismiss()
                }
            }
        }
    }

    // MARK: - CGEventTap (owned at AppDelegate level for macOS recognition)

    private func startEventTap() -> Bool {
        guard eventTap == nil else { return true }

        let refcon = Unmanaged.passUnretained(keyboardInterceptor).toOpaque()

        let eventMask: CGEventMask =
            (1 << CGEventType.keyDown.rawValue) |
            (1 << CGEventType.keyUp.rawValue) |
            (1 << CGEventType.flagsChanged.rawValue)

        guard let tap = CGEvent.tapCreate(
            tap: .cgSessionEventTap,
            place: .headInsertEventTap,
            options: .defaultTap,
            eventsOfInterest: eventMask,
            callback: confluentEventTapCallback,
            userInfo: refcon
        ) else {
            DebugLogger.log("CGEvent tap FAILED — no accessibility permission?", level: .error)
            return false
        }

        DebugLogger.log("CGEvent tap created at AppDelegate level", level: .success)

        eventTap = tap
        _confluentEventTap = tap  // Expose to C callback for re-enable
        let source = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0)
        runLoopSource = source

        // Run directly on the Main run loop.
        // Background thread CGEventTaps drop events on modern macOS.
        CFRunLoopAddSource(CFRunLoopGetMain(), source, .commonModes)
        CGEvent.tapEnable(tap: tap, enable: true)
        DebugLogger.log("Event tap enabled on main run loop", level: .success)

        return true
    }

    private func stopEventTap() {
        if let tap = eventTap {
            CGEvent.tapEnable(tap: tap, enable: false)
        }
        if let source = runLoopSource {
            CFRunLoopRemoveSource(CFRunLoopGetMain(), source, .commonModes)
        }
        eventTap = nil
        runLoopSource = nil
        _confluentEventTap = nil
    }

    // MARK: - Dictation Callbacks

    private func setupDictationCallbacks() {
        dictationEngine.onRecordingStarted = { [weak self] in
            self?.appState.isRecording = true
            self?.appState.status = .recording
            self?.appState.liveTranscript = ""
            self?.appState.interimTranscript = ""
            self?.updateStatusBarIcon(recording: true)
            self?.dictationOverlay.showListening()
        }

        dictationEngine.onTranscriptUpdate = { [weak self] final_, interim in
            self?.appState.liveTranscript = final_
            self?.appState.interimTranscript = interim
        }

        dictationEngine.onRecordingStopped = { [weak self] text, duration in
            guard let self = self else { return }

            if text.isEmpty {
                self.appState.isRecording = false
                self.appState.status = .active
                self.updateStatusBarIcon(recording: false)
                self.dictationOverlay.dismiss()
                return
            }

            // Save original dictation history and show in UI
            let entry = DictationEntry(text: text, duration: duration, lang: self.appState.dictationLang)
            self.appState.addDictation(entry)
            self.appState.liveTranscript = text

            // Switch to translating status
            self.appState.isRecording = false
            self.appState.status = .translating
            self.updateStatusBarIcon(translating: true)
            self.dictationOverlay.showTranslating()

            Task { @MainActor in
                // Determine source language for Google Translate
                let dictLang = self.appState.dictationLang
                let sourceLang = dictLang.contains("-") ? String(dictLang.split(separator: "-").first ?? "auto") : dictLang
                DebugLogger.log("Translating: '\(text.prefix(60))...' from \(sourceLang) → \(self.appState.targetLang)", level: .info)

                let result = await self.translationService.translate(
                    text: text,
                    to: self.appState.targetLang,
                    from: sourceLang
                )

                if let translation = result.translation, translation != text {
                    DebugLogger.log("Translation SUCCESS: '\(translation.prefix(60))...'", level: .success)
                    SystemActions.writeClipboard(translation)

                    let transEntry = TranslationEntry(
                        original: text,
                        translation: translation,
                        targetLang: self.appState.targetLang,
                        detectedLang: result.detectedLang,
                        fromCache: result.fromCache
                    )
                    self.appState.addTranslation(transEntry)
                    self.appState.liveTranscript = translation
                    self.dictationOverlay.showSuccess(translation)
                } else {
                    let reason = result.error ?? "translation identical to source"
                    DebugLogger.log("Translation fallback: \(reason)", level: .warning)
                    SystemActions.writeClipboard(text)
                    self.dictationOverlay.showSuccess(text)
                }

                // Reset status
                self.appState.status = .active
                self.updateStatusBarIcon()
            }
        }

        dictationEngine.onError = { [weak self] error in
            self?.appState.status = .error(error)
            self?.dictationOverlay.dismiss()
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                if case .error = self?.appState.status {
                    self?.appState.status = .active
                }
            }
        }

        dictationEngine.onAudioLevel = { [weak self] level in
            self?.dictationOverlay.updateAudioLevel(level)
        }
    }

    // MARK: - Translation Flow

    @MainActor
    private func performTranslation() async {
        appState.status = .translating
        updateStatusBarIcon(translating: true)

        // Step 1: Grab text from active app
        guard let originalText = await SystemActions.grabTextFromActiveApp() else {
            appState.status = .active
            keyboardInterceptor.cancelTranslation()
            updateStatusBarIcon()
            return
        }

        appState.liveBuffer = originalText

        // Step 2: Translate
        let result = await translationService.translate(
            text: originalText,
            to: appState.targetLang
        )

        guard let translation = result.translation, translation != originalText else {
            appState.status = .active
            appState.liveBuffer = ""
            keyboardInterceptor.cancelTranslation()
            updateStatusBarIcon()
            return
        }

        // Step 3: Paste translation
        await SystemActions.pasteTranslation(translation)

        // Log it
        let entry = TranslationEntry(
            original: originalText,
            translation: translation,
            targetLang: appState.targetLang,
            detectedLang: result.detectedLang,
            fromCache: result.fromCache
        )
        appState.addTranslation(entry)

        // Reset
        appState.status = .active
        appState.liveBuffer = ""
        keyboardInterceptor.resetAfterTranslation()
        updateStatusBarIcon()
    }

    // MARK: - Status Bar Icon Updates

    private func updateStatusBarIcon(recording: Bool = false, translating: Bool = false) {
        guard let button = statusBarItem?.button else { return }

        let symbolName: String
        if recording {
            symbolName = "mic.fill"
        } else if translating {
            symbolName = "arrow.triangle.2.circlepath"
        } else {
            symbolName = "character.book.closed.fill"
        }

        button.image = NSImage(systemSymbolName: symbolName, accessibilityDescription: "ConFluent")
        button.image?.size = NSSize(width: 18, height: 18)
    }

    // MARK: - Global Shortcuts

    private func setupGlobalShortcuts() {
        // ⌘⇧T → Toggle popover
        NSEvent.addGlobalMonitorForEvents(matching: .keyDown) { [weak self] event in
            // Check for Cmd+Shift+T
            if event.modifierFlags.contains([.command, .shift]),
               event.keyCode == 17 { // 'T' key
                DispatchQueue.main.async {
                    self?.togglePopover()
                }
            }
        }
    }

    // MARK: - Permissions + Interceptor Startup

    private func checkAndStartInterceptor() {
        let hasAccess = AccessibilityManager.isAccessibilityEnabled()
        appState.hasAccessibility = hasAccess

        // Always configure the interceptor callbacks first
        setupKeyboardInterceptor()

        if hasAccess {
            // Permission already granted → create event tap immediately
            let started = startEventTap()
            appState.hasAccessibility = started
        } else {
            // Prompt the user for Accessibility permission
            _ = AccessibilityManager.checkAndPrompt()
            DebugLogger.log("Accessibility permission missing — prompting user...", level: .warning)

            // Poll until the user grants it, then create the event tap
            Task {
                _ = await AccessibilityManager.waitForPermission()
                await MainActor.run {
                    DebugLogger.log("Accessibility permission granted — creating event tap", level: .success)
                    let started = self.startEventTap()
                    self.appState.hasAccessibility = started
                }
            }
        }

        // NOTE: Speech/mic permissions are requested lazily when the user
        // first uses dictation. Requesting them at launch can crash
        // non-code-signed apps due to TCC enforcement.
    }

    // MARK: - App Will Quit

    func applicationWillTerminate(_ notification: Notification) {
        stopEventTap()
        keyboardInterceptor.stop()
        dictationEngine.stopRecording()
    }
}

// MARK: - Module-level tap reference for the C callback
// CGEventTap callbacks are C functions and cannot capture context.
// This nonisolated(unsafe) var lets the callback re-enable the tap if macOS disables it.
nonisolated(unsafe) var _confluentEventTap: CFMachPort?

// MARK: - CGEventTap C Callback (free function at module level)

/// This callback is called by the system for every keyboard event.
/// It dispatches to KeyboardInterceptor.handleEvent() for processing.
/// Living at the top-level of the app ensures macOS correctly identifies
/// the app process as the Accessibility listener.
private func confluentEventTapCallback(
    proxy: CGEventTapProxy,
    type: CGEventType,
    event: CGEvent,
    refcon: UnsafeMutableRawPointer?
) -> Unmanaged<CGEvent>? {
    guard let refcon = refcon else { return Unmanaged.passRetained(event) }

    let interceptor = Unmanaged<KeyboardInterceptor>.fromOpaque(refcon).takeUnretainedValue()

    // Re-enable tap if system disabled it (timeout or user input overload)
    if type == .tapDisabledByTimeout || type == .tapDisabledByUserInput {
        if let tap = _confluentEventTap {
            CGEvent.tapEnable(tap: tap, enable: true)
            DebugLogger.log("Event tap re-enabled after system disabled it", level: .warning)
        }
        return Unmanaged.passRetained(event)
    }

    if let passedEvent = interceptor.handleEvent(type, event) {
        return Unmanaged.passRetained(passedEvent)
    } else {
        return nil  // Consumed
    }
}
