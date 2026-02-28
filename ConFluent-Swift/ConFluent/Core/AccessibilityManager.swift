// ===================================
// ConFluent Swift — Accessibility Manager
// Replaces: systemPreferences.isTrustedAccessibilityClient()
// ===================================

@preconcurrency import Foundation
@preconcurrency import AppKit

/// Manages accessibility permission checks and prompts.
/// CGEvent tap requires accessibility access to function.
enum AccessibilityManager {

    /// Check if the app has accessibility permission (non-prompting)
    static func isAccessibilityEnabled() -> Bool {
        AXIsProcessTrusted()
    }

    /// Check and prompt the user if needed
    static func checkAndPrompt() -> Bool {
        let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue(): true] as CFDictionary
        return AXIsProcessTrustedWithOptions(options)
    }

    /// Open System Settings to the Accessibility pane
    static func openAccessibilitySettings() {
        if let url = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility") {
            NSWorkspace.shared.open(url)
        }
    }

    /// Poll for accessibility permission (used when waiting for user to grant)
    static func waitForPermission(checkInterval: TimeInterval = 2.0) async -> Bool {
        while !AXIsProcessTrusted() {
            try? await Task.sleep(for: .seconds(checkInterval))
        }
        return true
    }
}
