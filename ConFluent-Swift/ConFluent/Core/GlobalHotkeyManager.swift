// ===================================
// ConFluent Swift — Global Hotkey Manager
// Uses native Carbon RegisterEventHotKey API.
// Rock-solid global shortcuts that bypass CGEventTap bugs,
// work across all apps seamlessly, and do NOT require Accessibility.
// Supports Push-to-Talk (Press and Release).
// ===================================

import Foundation
import Carbon
import AppKit

final class GlobalHotkeyManager: @unchecked Sendable {
    static let shared = GlobalHotkeyManager()

    var onHotKeyDown: (() -> Void)?
    var onHotKeyUp: (() -> Void)?

    private var hotKeyRef: EventHotKeyRef?
    private var eventHandler: EventHandlerRef?

    private init() {
        setupEventHandler()
    }

    func register(keyCode: Int, cgModifiers: UInt64) {
        unregister()
        
        let carbonMods = Self.carbonModifiers(from: cgModifiers)
        
        var hotKeyID = EventHotKeyID(signature: UTGetOSTypeFromString("CFlT" as CFString), id: 1)
        let status = RegisterEventHotKey(
            UInt32(keyCode),
            carbonMods,
            hotKeyID,
            GetApplicationEventTarget(),
            0,
            &hotKeyRef
        )
        
        if status != noErr {
            DebugLogger.log("Failed to register Carbon Hotkey. Status: \(status)", level: .error)
        } else {
            DebugLogger.log("Carbon Hotkey registered successfully (Rock-solid OS API)", level: .success)
        }
    }

    func unregister() {
        if let ref = hotKeyRef {
            UnregisterEventHotKey(ref)
            hotKeyRef = nil
        }
    }

    private func setupEventHandler() {
        var eventSpecs = [
            EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyPressed)),
            EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyReleased))
        ]

        let callback: EventHandlerUPP = { (nextHandler, theEvent, userData) -> OSStatus in
            guard let event = theEvent else { return OSStatus(eventNotHandledErr) }
            
            let kind = GetEventKind(event)
            
            // Dispatch to main immediately to trigger UI/Dictation changes
            DispatchQueue.main.async {
                if kind == UInt32(kEventHotKeyPressed) {
                    GlobalHotkeyManager.shared.onHotKeyDown?()
                } else if kind == UInt32(kEventHotKeyReleased) {
                    GlobalHotkeyManager.shared.onHotKeyUp?()
                }
            }
            
            return OSStatus(noErr)
        }

        InstallEventHandler(GetApplicationEventTarget(), callback, 2, &eventSpecs, nil, &eventHandler)
    }

    static func carbonModifiers(from cgFlags: UInt64) -> UInt32 {
        var carbonMods: UInt32 = 0
        let flags = CGEventFlags(rawValue: cgFlags)
        if flags.contains(.maskCommand) { carbonMods |= UInt32(cmdKey) }
        if flags.contains(.maskAlternate) { carbonMods |= UInt32(optionKey) }
        if flags.contains(.maskControl) { carbonMods |= UInt32(controlKey) }
        if flags.contains(.maskShift) { carbonMods |= UInt32(shiftKey) }
        return carbonMods
    }
}
