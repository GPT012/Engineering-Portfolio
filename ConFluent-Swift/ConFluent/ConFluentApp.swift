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
        // All UI is in the status bar popover.
        Settings {
            EmptyView()
        }
    }
}

// MARK: - App Delegate

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate, NSPopoverDelegate {

    private var statusBarItem: NSStatusItem!
    private var popover: NSPopover!
    private let appState = AppState.shared

    // Core engines
    private let keyboardInterceptor = KeyboardInterceptor()
    private let dictationEngine = DictationEngine()
    private let translationService = TranslationService.shared
    private let dictationOverlay = DictationOverlayPanel()

    // Dictation shortcut state (Option+Space)
    private var dictationHoldTimer: DispatchWorkItem?
    private var optionHeld = false
    private var dictationActive = false

    // MARK: - App Launch

    func applicationDidFinishLaunching(_ notification: Notification) {
        setupStatusBar()
        setupPopover()
        setupKeyboardInterceptor()
        setupDictationShortcut()
        setupDictationCallbacks()
        setupGlobalShortcuts()
        checkPermissions()
    }

    // MARK: - Status Bar

    private func setupStatusBar() {
        statusBarItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)

        if let button = statusBarItem.button {
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
        popover.contentSize = NSSize(width: 400, height: 540)
        popover.behavior = .transient  // Close when clicking outside
        popover.animates = true
        popover.delegate = self

        // The SwiftUI view gets the engines as environment objects
        let contentView = PopoverView()
            .environment(appState)
            .environment(dictationEngine)

        popover.contentViewController = NSHostingController(rootView: contentView)
    }

    @objc private func togglePopover() {
        guard let button = statusBarItem.button else { return }

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
    }

    func popoverDidClose(_ notification: Notification) {
        keyboardInterceptor.setAppFocused(false)
    }

    // MARK: - Keyboard Interceptor (typing detection only)

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

        // Start the keyboard interceptor
        let started = keyboardInterceptor.start()
        Task { @MainActor in
            appState.hasAccessibility = started
        }
    }

    // MARK: - Dictation Shortcut (Option+Space via NSEvent monitors)

    private func setupDictationShortcut() {
        // Global monitor: works when OTHER apps are focused
        NSEvent.addGlobalMonitorForEvents(matching: .flagsChanged) { [weak self] event in
            self?.handleDictationModifiers(event)
        }
        NSEvent.addGlobalMonitorForEvents(matching: [.keyDown, .keyUp]) { [weak self] event in
            self?.handleDictationKey(event)
        }

        // Local monitor: works when OUR app is focused (popover open)
        NSEvent.addLocalMonitorForEvents(matching: .flagsChanged) { [weak self] event in
            self?.handleDictationModifiers(event)
            return event
        }
        NSEvent.addLocalMonitorForEvents(matching: [.keyDown, .keyUp]) { [weak self] event in
            self?.handleDictationKey(event)
            return event
        }
    }

    private func handleDictationModifiers(_ event: NSEvent) {
        let optionPressed = event.modifierFlags.contains(.option)
            && !event.modifierFlags.contains(.command)
            && !event.modifierFlags.contains(.control)

        if optionPressed {
            optionHeld = true
        } else {
            // Option released while dictating → stop
            if dictationActive {
                stopDictationShortcut()
            }
            optionHeld = false
        }
    }

    private func handleDictationKey(_ event: NSEvent) {
        // Space bar keyCode = 49
        guard event.keyCode == 49 && optionHeld else { return }

        if event.type == .keyDown && !event.isARepeat && !dictationActive {
            // Start dictation with 400ms hold delay
            dictationActive = true
            let workItem = DispatchWorkItem { [weak self] in
                guard let self = self, !self.dictationEngine.isRecording else { return }
                try? self.dictationEngine.startRecording(lang: self.appState.dictationLang)
            }
            dictationHoldTimer = workItem
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.4, execute: workItem)

        } else if event.type == .keyUp && dictationActive {
            stopDictationShortcut()
        }
    }

    private func stopDictationShortcut() {
        dictationActive = false
        dictationHoldTimer?.cancel()
        dictationHoldTimer = nil
        if dictationEngine.isRecording {
            dictationEngine.stopRecording()
        } else {
            // Cancelled before 400ms threshold — dismiss overlay
            dictationOverlay.dismiss()
        }
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
                // Translate the dictated text
                let result = await self.translationService.translate(
                    text: text,
                    to: self.appState.targetLang
                )

                if let translation = result.translation, translation != text {
                    // Auto-copy translation to clipboard
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
                    // Fallback to original text if translation failed or was same
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
        guard let button = statusBarItem.button else { return }

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

    // MARK: - Permissions

    private func checkPermissions() {
        // Check accessibility
        let hasAccess = AccessibilityManager.isAccessibilityEnabled()
        appState.hasAccessibility = hasAccess

        if !hasAccess {
            // Prompt and wait
            _ = AccessibilityManager.checkAndPrompt()
            Task {
                _ = await AccessibilityManager.waitForPermission()
                await MainActor.run {
                    self.appState.hasAccessibility = true
                    // Restart interceptor now that we have permission
                    _ = self.keyboardInterceptor.start()
                }
            }
        }

        // NOTE: Speech/mic permissions are requested lazily when the user
        // first uses dictation. Requesting them at launch can crash
        // non-code-signed apps due to TCC enforcement.
    }

    // MARK: - App Will Quit

    func applicationWillTerminate(_ notification: Notification) {
        keyboardInterceptor.stop()
        dictationEngine.stopRecording()
    }
}
