// ===================================
// ConFluent Swift — Keyboard Interceptor
// Pure event processor for:
//   1. Dictation shortcut interception (ALWAYS active)
//   2. Typing detection for translation (only when app not focused)
// NOTE: CGEventTap creation is handled by AppDelegate
//       for proper macOS Accessibility recognition.
// ===================================

@preconcurrency import Foundation
import CoreGraphics
import Carbon.HIToolbox
@preconcurrency import ApplicationServices

final class KeyboardInterceptor: @unchecked Sendable {

    // MARK: - Callbacks
    var onTranslateRequest: (@Sendable () -> Void)?
    var onTypingActivity: (@Sendable (Int) -> Void)?

    // MARK: - Configuration
    private var isEnabled: Bool = true
    private var triggerMode: TriggerMode = .timer
    private var triggerDelay: Int = 1000
    private let minKeystrokes: Int = 8

    // dictation variables moved to AppState/GlobalHotkeyManager

    // MARK: - State
    private var keystrokeCount: Int = 0
    private var isTranslating: Bool = false
    private var lastTriggerTime: Date = .distantPast
    private var triggerTimer: DispatchSourceTimer?
    private var appFocused: Bool = false
    
    // When true, the shortcut recorder is active → don't intercept dictation shortcut
    var isRecordingShortcut: Bool = false

    // Dictation variables moved out

    // MARK: - Threading
    private let queue = DispatchQueue(label: "com.confluent.keyboard", qos: .userInteractive)

    // MARK: - Printable Keys
    private static let printableKeyCodes: Set<Int64> = {
        var codes = Set<Int64>()
        for code: Int64 in 0...50 { codes.insert(code) }
        for code: Int64 in 18...29 { codes.insert(code) }
        codes.insert(Int64(kVK_Space))
        codes.insert(Int64(kVK_ANSI_Period))
        codes.insert(Int64(kVK_ANSI_Comma))
        codes.insert(Int64(kVK_ANSI_Semicolon))
        codes.insert(Int64(kVK_ANSI_Quote))
        codes.insert(Int64(kVK_ANSI_Slash))
        codes.insert(Int64(kVK_ANSI_Backslash))
        codes.insert(Int64(kVK_ANSI_LeftBracket))
        codes.insert(Int64(kVK_ANSI_RightBracket))
        codes.insert(Int64(kVK_ANSI_Minus))
        codes.insert(Int64(kVK_ANSI_Equal))
        codes.insert(Int64(kVK_ANSI_Grave))
        return codes
    }()

    // MARK: - Permissions Check
    
    nonisolated static func hasAccessibilityPermission(prompt: Bool = false) -> Bool {
        let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: prompt] as CFDictionary
        return AXIsProcessTrustedWithOptions(options)
    }

    // MARK: - Stop

    func stop() {
        cancelTimer()
    }

    // MARK: - Configuration

    func setEnabled(_ enabled: Bool) {
        isEnabled = enabled
        if !enabled { keystrokeCount = 0; cancelTimer() }
    }

    func setTriggerMode(_ mode: TriggerMode) { triggerMode = mode }
    func setDelay(_ delay: Int) { triggerDelay = delay }

    func setAppFocused(_ focused: Bool) {
        appFocused = focused
        if focused { keystrokeCount = 0; cancelTimer() }
    }
    // Dictation shortcut method removed

    func resetAfterTranslation() { keystrokeCount = 0; isTranslating = false }
    func cancelTranslation() { isTranslating = false }

    func handleEvent(_ type: CGEventType, _ event: CGEvent) -> CGEvent? {
        // Typing detection only when app is NOT focused
        if !appFocused {
            handleTypingDetection(type, event)
        }

        return event  // Pass through everything else
    }

    // MARK: - Typing Detection (for translation)

    private func handleTypingDetection(_ type: CGEventType, _ event: CGEvent) {
        guard isEnabled, type == .keyDown else { return }

        let keyCode = event.getIntegerValueField(.keyboardEventKeycode)
        let flags = event.flags

        if flags.contains(.maskCommand) || flags.contains(.maskControl) { return }
        if flags.contains(.maskAlternate) { return }

        if keyCode == Int64(kVK_Return) || keyCode == Int64(kVK_ANSI_KeypadEnter) {
            if keystrokeCount >= minKeystrokes { cancelTimer(); triggerTranslation() }
            keystrokeCount = 0
            return
        }

        let navKeys: Set<Int64> = [
            Int64(kVK_UpArrow), Int64(kVK_DownArrow),
            Int64(kVK_LeftArrow), Int64(kVK_RightArrow),
            Int64(kVK_Home), Int64(kVK_End),
            Int64(kVK_PageUp), Int64(kVK_PageDown)
        ]
        if navKeys.contains(keyCode) { keystrokeCount = 0; cancelTimer(); return }

        if keyCode == Int64(kVK_Delete) || keyCode == Int64(kVK_ForwardDelete) {
            keystrokeCount = max(0, keystrokeCount - 1)
            cancelTimer()
            if keystrokeCount >= minKeystrokes { startTimer() }
            return
        }

        guard Self.printableKeyCodes.contains(keyCode) else { return }

        keystrokeCount += 1
        onTypingActivity?(keystrokeCount)

        if keystrokeCount >= minKeystrokes { evaluateTrigger(keyCode: keyCode) }
    }

    // MARK: - Trigger

    private func evaluateTrigger(keyCode: Int64) {
        guard !isTranslating else { return }
        cancelTimer()
        switch triggerMode {
        case .pro:
            if keyCode == Int64(kVK_ANSI_Period) { scheduleTimer(delay: 300) }
        case .rapid:
            scheduleTimer(delay: keyCode == Int64(kVK_Space) ? 300 : 1000)
        case .timer:
            startTimer()
        }
    }

    private func startTimer() { scheduleTimer(delay: triggerDelay) }

    private func scheduleTimer(delay: Int) {
        cancelTimer()
        let timer = DispatchSource.makeTimerSource(queue: queue)
        timer.schedule(deadline: .now() + .milliseconds(delay))
        timer.setEventHandler { [weak self] in self?.triggerTranslation() }
        timer.resume()
        triggerTimer = timer
    }

    private func cancelTimer() { triggerTimer?.cancel(); triggerTimer = nil }

    private func triggerTranslation() {
        guard !isTranslating, keystrokeCount >= minKeystrokes, !appFocused else { return }
        let now = Date()
        guard now.timeIntervalSince(lastTriggerTime) > 1.0 else { return }
        lastTriggerTime = now
        isTranslating = true
        onTranslateRequest?()
    }
}
