// ===================================
// ConFluent Swift — Shortcut Helper
// Maps key codes and modifiers to human-readable labels
// ===================================

import Foundation
import CoreGraphics
import Carbon.HIToolbox

/// Utility for converting key codes and modifier flags to display labels.
enum ShortcutHelper {
    
    // MARK: - Modifier Label
    
    static func modifierLabel(from raw: UInt64) -> String {
        let flags = CGEventFlags(rawValue: raw)
        var parts: [String] = []
        if flags.contains(.maskControl)   { parts.append("⌃") }
        if flags.contains(.maskAlternate) { parts.append("⌥") }
        if flags.contains(.maskShift)     { parts.append("⇧") }
        if flags.contains(.maskCommand)   { parts.append("⌘") }
        return parts.joined()
    }
    
    // MARK: - Key Label
    
    static func keyLabel(from keyCode: Int) -> String {
        return keyCodeNames[keyCode] ?? "Key\(keyCode)"
    }
    
    /// Map of common macOS virtual key codes to readable names
    static let keyCodeNames: [Int: String] = [
        // Letters
        0: "A", 1: "S", 2: "D", 3: "F", 4: "H", 5: "G",
        6: "Z", 7: "X", 8: "C", 9: "V", 11: "B", 12: "Q",
        13: "W", 14: "E", 15: "R", 16: "Y", 17: "T", 18: "1",
        19: "2", 20: "3", 21: "4", 22: "6", 23: "5", 24: "=",
        25: "9", 26: "7", 27: "-", 28: "8", 29: "0", 30: "]",
        31: "O", 32: "U", 33: "[", 34: "I", 35: "P", 37: "L",
        38: "J", 39: "'", 40: "K", 41: ";", 42: "\\", 43: ",",
        44: "/", 45: "N", 46: "M", 47: ".",
        // Special
        36: "Return", 48: "Tab", 49: "Space", 51: "Delete",
        53: "Escape", 96: "F5", 97: "F6", 98: "F7", 99: "F3",
        100: "F8", 101: "F9", 109: "F10", 103: "F11", 111: "F12",
        105: "F13", 107: "F14", 113: "F15", 106: "F16",
        118: "F1", 120: "F2", 122: "F4",
        // Arrow keys
        123: "←", 124: "→", 125: "↓", 126: "↑",
    ]
    
    /// Detect modifier flags from an NSEvent key code
    static func modifierFlagsForEvent(_ flags: CGEventFlags) -> UInt64 {
        var result: UInt64 = 0
        if flags.contains(.maskControl)   { result |= CGEventFlags.maskControl.rawValue }
        if flags.contains(.maskAlternate) { result |= CGEventFlags.maskAlternate.rawValue }
        if flags.contains(.maskShift)     { result |= CGEventFlags.maskShift.rawValue }
        if flags.contains(.maskCommand)   { result |= CGEventFlags.maskCommand.rawValue }
        return result
    }
}
