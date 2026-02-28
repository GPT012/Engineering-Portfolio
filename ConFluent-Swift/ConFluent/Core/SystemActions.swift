// ===================================
// ConFluent Swift — System Actions
// Replaces: AppleScript hacks + clipboard.js
// Native NSPasteboard + CGEvent for instant operations
// ===================================

import Foundation
import AppKit
import CoreGraphics
import Carbon.HIToolbox

/// Handles clipboard operations and keyboard simulation.
/// These replace the slow AppleScript `execFile('osascript')` calls
/// from the Electron version with instant native APIs.
enum SystemActions {

    // MARK: - Clipboard

    /// Read the current clipboard text
    static func readClipboard() -> String? {
        NSPasteboard.general.string(forType: .string)
    }

    /// Write text to the clipboard
    static func writeClipboard(_ text: String) {
        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        pasteboard.setString(text, forType: .string)
    }

    // MARK: - Key Simulation
    // These replace the AppleScript `keystroke "a" using {command down}` calls
    // which were slow (~200ms each) and unreliable.
    // CGEvent.post() is instant (~1ms) and works with any keyboard layout.

    /// Simulate Cmd+A (Select All)
    static func selectAll() {
        simulateKeyCombo(keyCode: UInt16(kVK_ANSI_A), flags: .maskCommand)
    }

    /// Simulate Cmd+C (Copy)
    static func copy() {
        simulateKeyCombo(keyCode: UInt16(kVK_ANSI_C), flags: .maskCommand)
    }

    /// Simulate Cmd+V (Paste)
    static func paste() {
        simulateKeyCombo(keyCode: UInt16(kVK_ANSI_V), flags: .maskCommand)
    }

    /// Simulate any key combo
    private static func simulateKeyCombo(keyCode: UInt16, flags: CGEventFlags) {
        let source = CGEventSource(stateID: .combinedSessionState)

        guard let keyDown = CGEvent(keyboardEventSource: source, virtualKey: keyCode, keyDown: true),
              let keyUp = CGEvent(keyboardEventSource: source, virtualKey: keyCode, keyDown: false) else {
            return
        }

        keyDown.flags = flags
        keyUp.flags = flags

        keyDown.post(tap: .cghidEventTap)
        keyUp.post(tap: .cghidEventTap)
    }

    // MARK: - Grab & Translate Flow

    /// Grabs text from the currently focused app field:
    /// 1. Save current clipboard
    /// 2. Select all (Cmd+A) + Copy (Cmd+C)
    /// 3. Read clipboard
    /// 4. Restore original clipboard
    /// Returns the grabbed text, or nil if nothing was grabbed.
    static func grabTextFromActiveApp() async -> String? {
        let savedClipboard = readClipboard() ?? ""

        // Clear clipboard to detect if copy worked
        writeClipboard("")

        // Select all + Copy — much faster than AppleScript!
        selectAll()

        // Small delay for the system to process Select All
        try? await Task.sleep(for: .milliseconds(50))

        copy()

        // Small delay for the system to process Copy
        try? await Task.sleep(for: .milliseconds(80))

        // Read what was copied
        let grabbed = readClipboard() ?? ""

        // Restore original clipboard
        writeClipboard(savedClipboard)

        let trimmed = grabbed.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.count >= 2 ? trimmed : nil
    }

    /// Pastes translated text into the active app:
    /// 1. Save current clipboard
    /// 2. Write translation to clipboard
    /// 3. Select all (since text is still from grab step)
    /// 4. Paste (Cmd+V)
    /// 5. Restore original clipboard
    static func pasteTranslation(_ text: String) async {
        let savedClipboard = readClipboard() ?? ""

        // Select all first (the original text is still selected from grab)
        selectAll()
        try? await Task.sleep(for: .milliseconds(30))

        // Write translation to clipboard and paste
        writeClipboard(text)
        try? await Task.sleep(for: .milliseconds(20))

        paste()

        // Wait for paste to complete, then restore
        try? await Task.sleep(for: .milliseconds(200))
        writeClipboard(savedClipboard)
    }
}
