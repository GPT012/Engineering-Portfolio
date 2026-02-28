// ===================================
// ConFluent Swift — Keyboard Interceptor
// Replaces: node-global-key-listener + keylistener.js
// Uses CGEvent tap for native keyboard interception
// ===================================

import Foundation
import CoreGraphics
import Carbon.HIToolbox  // For virtual key codes

/// Intercepts global keyboard events to detect typing and trigger translation.
/// Runs on a background thread with its own RunLoop for the CGEvent tap.
final class KeyboardInterceptor: @unchecked Sendable {

    // MARK: - Callbacks
    var onTranslateRequest: (@Sendable () -> Void)?
    var onTypingActivity: (@Sendable (Int) -> Void)?

    // MARK: - Configuration
    private var isEnabled: Bool = true
    private var triggerMode: TriggerMode = .timer
    private var triggerDelay: Int = 1000  // ms
    private let minKeystrokes: Int = 8

    // MARK: - State
    private var keystrokeCount: Int = 0
    private var isTranslating: Bool = false
    private var lastTriggerTime: Date = .distantPast
    private var triggerTimer: DispatchSourceTimer?
    private var appFocused: Bool = false

    // MARK: - Threading
    fileprivate var eventTap: CFMachPort?
    private var runLoopSource: CFRunLoopSource?
    private var listenerThread: Thread?
    private let queue = DispatchQueue(label: "com.confluent.keyboard", qos: .userInteractive)

    // MARK: - Printable Keys (same logic as keylistener.js)
    private static let printableKeyCodes: Set<Int64> = {
        var codes = Set<Int64>()
        // Letters A-Z (keycodes 0-50 cover all letter keys on any layout)
        for code: Int64 in 0...50 { codes.insert(code) }
        // Number keys 18-29
        for code: Int64 in 18...29 { codes.insert(code) }
        // Space
        codes.insert(Int64(kVK_Space))
        // Common punctuation
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

    // MARK: - Start

    func start() -> Bool {
        // The callback MUST be a plain C function — no capturing closures.
        // We pass `self` via userInfo pointer.
        let refcon = Unmanaged.passUnretained(self).toOpaque()

        let eventMask: CGEventMask =
            (1 << CGEventType.keyDown.rawValue) |
            (1 << CGEventType.keyUp.rawValue) |
            (1 << CGEventType.flagsChanged.rawValue)

        guard let tap = CGEvent.tapCreate(
            tap: .cgSessionEventTap,
            place: .headInsertEventTap,
            options: .listenOnly,  // We only observe, never block
            eventsOfInterest: eventMask,
            callback: keyboardCallback,
            userInfo: refcon
        ) else {
            return false  // No accessibility permission
        }

        eventTap = tap
        runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0)

        // Run on a dedicated background thread so the event tap stays alive
        listenerThread = Thread {
            guard let source = self.runLoopSource else { return }
            CFRunLoopAddSource(CFRunLoopGetCurrent(), source, .commonModes)
            CGEvent.tapEnable(tap: tap, enable: true)
            CFRunLoopRun()
        }
        listenerThread?.name = "com.confluent.keyboard-listener"
        listenerThread?.qualityOfService = .userInteractive
        listenerThread?.start()

        return true
    }

    // MARK: - Stop

    func stop() {
        if let tap = eventTap {
            CGEvent.tapEnable(tap: tap, enable: false)
        }
        if let source = runLoopSource {
            // Cancel the run loop on the listener thread
            CFRunLoopRemoveSource(CFRunLoopGetCurrent(), source, .commonModes)
        }
        cancelTimer()
        eventTap = nil
        runLoopSource = nil
    }

    // MARK: - Configuration

    func setEnabled(_ enabled: Bool) {
        isEnabled = enabled
        if !enabled {
            keystrokeCount = 0
            cancelTimer()
        }
    }

    func setTriggerMode(_ mode: TriggerMode) {
        triggerMode = mode
    }

    func setDelay(_ delay: Int) {
        triggerDelay = delay
    }

    func setAppFocused(_ focused: Bool) {
        appFocused = focused
        if focused {
            keystrokeCount = 0
            cancelTimer()
        }
    }

    func resetAfterTranslation() {
        keystrokeCount = 0
        isTranslating = false
    }

    func cancelTranslation() {
        isTranslating = false
    }

    // MARK: - Key Processing

    fileprivate func handleEvent(_ type: CGEventType, _ event: CGEvent) {
        guard isEnabled, !appFocused else { return }

        // Skip modifier-only and keyUp events (not relevant for typing detection)
        guard type == .keyDown else { return }

        let keyCode = event.getIntegerValueField(.keyboardEventKeycode)
        let flags = event.flags

        // Skip modifier combos (Cmd+C, Ctrl+V = shortcuts, not typing)
        if flags.contains(.maskCommand) || flags.contains(.maskControl) { return }
        // Skip if Option is held (user might be using shortcuts or special chars)
        if flags.contains(.maskAlternate) { return }

        // RETURN/ENTER: trigger if enough keystrokes
        if keyCode == Int64(kVK_Return) || keyCode == Int64(kVK_ANSI_KeypadEnter) {
            if keystrokeCount >= minKeystrokes {
                cancelTimer()
                triggerTranslation()
            }
            keystrokeCount = 0
            return
        }

        // Arrow keys / navigation: user moved cursor, reset
        let navKeys: Set<Int64> = [
            Int64(kVK_UpArrow), Int64(kVK_DownArrow),
            Int64(kVK_LeftArrow), Int64(kVK_RightArrow),
            Int64(kVK_Home), Int64(kVK_End),
            Int64(kVK_PageUp), Int64(kVK_PageDown)
        ]
        if navKeys.contains(keyCode) {
            keystrokeCount = 0
            cancelTimer()
            return
        }

        // Backspace/Delete
        if keyCode == Int64(kVK_Delete) || keyCode == Int64(kVK_ForwardDelete) {
            keystrokeCount = max(0, keystrokeCount - 1)
            cancelTimer()
            if keystrokeCount >= minKeystrokes {
                startTimer()
            }
            return
        }

        // Only count actual printable keys
        guard Self.printableKeyCodes.contains(keyCode) else { return }

        keystrokeCount += 1
        onTypingActivity?(keystrokeCount)

        if keystrokeCount >= minKeystrokes {
            evaluateTrigger(keyCode: keyCode)
        }
    }
    // MARK: - Trigger Evaluation

    private func evaluateTrigger(keyCode: Int64) {
        guard !isTranslating else { return }
        cancelTimer()

        switch triggerMode {
        case .pro:
            // Trigger after sentence-ending punctuation (period)
            if keyCode == Int64(kVK_ANSI_Period) {
                scheduleTimer(delay: 300)
            }

        case .rapid:
            // Trigger on space or after short pause
            if keyCode == Int64(kVK_Space) {
                scheduleTimer(delay: 300)
            } else {
                scheduleTimer(delay: 1000)
            }

        case .timer:
            startTimer()
        }
    }

    // MARK: - Timer Management

    private func startTimer() {
        scheduleTimer(delay: triggerDelay)
    }

    private func scheduleTimer(delay: Int) {
        cancelTimer()
        let timer = DispatchSource.makeTimerSource(queue: queue)
        timer.schedule(deadline: .now() + .milliseconds(delay))
        timer.setEventHandler { [weak self] in
            self?.triggerTranslation()
        }
        timer.resume()
        triggerTimer = timer
    }

    private func cancelTimer() {
        triggerTimer?.cancel()
        triggerTimer = nil
    }

    // MARK: - Trigger Translation

    private func triggerTranslation() {
        guard !isTranslating else { return }
        guard keystrokeCount >= minKeystrokes else { return }
        guard !appFocused else { return }

        // Prevent rapid re-triggers (1s cooldown)
        let now = Date()
        guard now.timeIntervalSince(lastTriggerTime) > 1.0 else { return }
        lastTriggerTime = now

        isTranslating = true
        onTranslateRequest?()
    }
}

// MARK: - C Callback (required by CGEvent.tapCreate)

/// This is a plain C function — it cannot capture any Swift context.
/// We recover the KeyboardInterceptor instance from the userInfo pointer.
private func keyboardCallback(
    proxy: CGEventTapProxy,
    type: CGEventType,
    event: CGEvent,
    refcon: UnsafeMutableRawPointer?
) -> Unmanaged<CGEvent>? {

    guard let refcon = refcon else {
        return Unmanaged.passRetained(event)
    }

    let interceptor = Unmanaged<KeyboardInterceptor>.fromOpaque(refcon).takeUnretainedValue()

    // If the tap is disabled by the system, re-enable it immediately
    if type == .tapDisabledByTimeout || type == .tapDisabledByUserInput {
        if let tap = interceptor.eventTap {
            CGEvent.tapEnable(tap: tap, enable: true)
        }
        return Unmanaged.passRetained(event)
    }

    interceptor.handleEvent(type, event)

    // Always pass the event through (we're listen-only)
    return Unmanaged.passRetained(event)
}
