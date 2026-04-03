// ===================================
// ConFluent Swift — Settings View
// Native SwiftUI settings with macOS style
// ===================================

import SwiftUI
import AppKit
import ServiceManagement
import CoreGraphics

struct SettingsTabView: View {
    @Environment(AppState.self) private var state

    var body: some View {
        @Bindable var state = state

        ScrollView {
            VStack(spacing: 16) {
                // Enable/Disable toggle
                settingsSection("STATUS") {
                    HStack {
                        Image(systemName: state.isEnabled ? "checkmark.circle.fill" : "xmark.circle")
                            .foregroundStyle(state.isEnabled ? .green : .red)
                            .font(.system(size: 18))

                        VStack(alignment: .leading) {
                            Text("Translation Active")
                                .font(.system(size: 13, weight: .semibold))
                            Text(state.isEnabled ? "Translating as you type" : "Paused")
                                .font(.system(size: 11))
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        Toggle("", isOn: $state.isEnabled)
                            .toggleStyle(.switch)
                            .controlSize(.small)
                    }
                }

                // Translation settings
                settingsSection("TRANSLATION") {
                    VStack(spacing: 12) {
                        HStack {
                            Text("Translate to")
                                .font(.system(size: 12))
                            Spacer()
                            Picker("", selection: $state.targetLang) {
                                ForEach(Language.all) { lang in
                                    Text("\(lang.flag) \(lang.name)").tag(lang.id)
                                }
                            }
                            .frame(width: 150)
                        }

                        Divider()

                        HStack {
                            Text("Trigger mode")
                                .font(.system(size: 12))
                            Spacer()
                            Picker("", selection: $state.triggerMode) {
                                ForEach(TriggerMode.allCases, id: \.self) { mode in
                                    Text(mode.label).tag(mode)
                                }
                            }
                            .frame(width: 180)
                        }

                        if state.triggerMode == .timer {
                            Divider()
                            VStack(alignment: .leading, spacing: 4) {
                                HStack {
                                    Text("Delay")
                                        .font(.system(size: 12))
                                    Spacer()
                                    Text("\(state.triggerDelay)ms")
                                        .font(.system(size: 12, weight: .medium, design: .monospaced))
                                        .foregroundStyle(.secondary)
                                }
                                Slider(
                                    value: Binding(
                                        get: { Double(state.triggerDelay) },
                                        set: { state.triggerDelay = Int($0) }
                                    ),
                                    in: 500...3000,
                                    step: 100
                                )
                            }
                        }
                    }
                }

                // Dictation settings
                settingsSection("DICTATION") {
                    VStack(spacing: 12) {
                        HStack {
                            Text("Speech language")
                                .font(.system(size: 12))
                            Spacer()
                            Picker("", selection: $state.dictationLang) {
                                ForEach(SpeechLanguage.all) { lang in
                                    Text(lang.name).tag(lang.id)
                                }
                            }
                            .frame(width: 150)
                        }
                        
                        Divider()
                        

                        HStack {
                            Text("Overlay Style")
                                .font(.system(size: 12))
                            Spacer()
                            Picker("", selection: $state.dictationStyle) {
                                ForEach(RecordingStyle.allCases) { style in
                                    Text(style.label).tag(style)
                                }
                            }
                            .frame(width: 190)
                        }
                    }
                }

                // Shortcuts
                settingsSection("SHORTCUTS") {
                    VStack(alignment: .leading, spacing: 12) {
                        shortcutRow("Show/hide ConFluent", shortcut: "⌘⇧T")
                        Divider()
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Hold dictation")
                                    .font(.system(size: 13, weight: .medium))
                                Text("Hold this shortcut to speak")
                                    .font(.system(size: 11))
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            ShortcutRecorderButton(
                                keyCode: $state.dictationKeyCode,
                                modifierRaw: $state.dictationModifierRaw,
                                label: state.dictationShortcutLabel
                            )
                        }
                    }
                }

                // System
                settingsSection("SYSTEM") {
                    LaunchAtLoginToggle()
                }

                // About
                settingsSection("ABOUT") {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("ConFluent v2.0.0")
                            .font(.system(size: 13, weight: .semibold))
                        Text("Native macOS translator")
                            .font(.system(size: 11))
                            .foregroundStyle(.secondary)
                        Text("Swift · SwiftUI · SFSpeechRecognizer")
                            .font(.system(size: 10, design: .monospaced))
                            .foregroundStyle(.tertiary)
                    }
                }
            }
            .padding(16)
        }
    }

    // MARK: - Helpers

    private func settingsSection(_ title: String, @ViewBuilder content: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 10, weight: .bold))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
                .tracking(0.5)

            VStack {
                content()
            }
            .padding(12)
            .background(.regularMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
    }

    private func shortcutRow(_ label: String, shortcut: String) -> some View {
        HStack {
            Text(label)
                .font(.system(size: 12))
            Spacer()
            Text(shortcut)
                .font(.system(size: 11, weight: .medium, design: .monospaced))
                .foregroundStyle(.secondary)
                .padding(.horizontal, 8)
                .padding(.vertical, 3)
                .background(Color.gray.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 5))
        }
    }
}

// MARK: - Shortcut Recorder Button

/// A button that, when clicked, enters "recording" mode.
/// In recording mode, it uses a GLOBAL NSEvent monitor (not local)
/// so it works even inside a popover. The CGEvent tap is paused
/// while the popover is open (appFocused = true), so events reach us.
struct ShortcutRecorderButton: View {
    @Binding var keyCode: Int
    @Binding var modifierRaw: UInt64
    let label: String

    @State private var isRecording = false
    @State private var globalMonitor: Any?
    @State private var localMonitor: Any?
    @State private var escapeMonitor: Any?

    var body: some View {
        Button(action: {
            if isRecording {
                stopRecording()
            } else {
                startRecording()
            }
        }) {
            HStack(spacing: 4) {
                if isRecording {
                    Image(systemName: "keyboard")
                        .font(.system(size: 10))
                    Text("Press keys...")
                        .font(.system(size: 11, weight: .medium))
                } else {
                    Text(label)
                        .font(.system(size: 12, weight: .semibold, design: .monospaced))
                }
            }
            .foregroundStyle(isRecording ? DesignSystem.Colors.primary : .primary)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(
                RoundedRectangle(cornerRadius: 6)
                    .fill(isRecording ? DesignSystem.Colors.primary.opacity(0.15) : Color.gray.opacity(0.1))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 6)
                    .strokeBorder(
                        isRecording ? DesignSystem.Colors.primary : Color.clear,
                        lineWidth: 1.5
                    )
            )
            .animation(.easeInOut(duration: 0.2), value: isRecording)
        }
        .buttonStyle(.plain)
        .onDisappear {
            stopRecording()
        }
    }

    private func startRecording() {
        isRecording = true
        
        // Tell the interceptor to stop consuming the dictation shortcut
        NotificationCenter.default.post(name: NSNotification.Name("ShortcutRecordingStarted"), object: nil)

        localMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
            handleKeyEvent(event)
            return nil
        }

        globalMonitor = NSEvent.addGlobalMonitorForEvents(matching: .keyDown) { event in
            handleKeyEvent(event)
        }
    }

    private func stopRecording() {
        isRecording = false
        if let m = localMonitor { NSEvent.removeMonitor(m); localMonitor = nil }
        if let m = globalMonitor { NSEvent.removeMonitor(m); globalMonitor = nil }
        
        // Tell the interceptor to resume consuming the dictation shortcut
        NotificationCenter.default.post(name: NSNotification.Name("ShortcutRecordingStopped"), object: nil)
    }

    private func handleKeyEvent(_ event: NSEvent) {
        // Escape cancels recording
        if event.keyCode == 53 {
            DispatchQueue.main.async { stopRecording() }
            return
        }

        let flags = event.modifierFlags
        var rawMods: UInt64 = 0
        if flags.contains(.command)  { rawMods |= CGEventFlags.maskCommand.rawValue }
        if flags.contains(.option)   { rawMods |= CGEventFlags.maskAlternate.rawValue }
        if flags.contains(.control)  { rawMods |= CGEventFlags.maskControl.rawValue }
        if flags.contains(.shift)    { rawMods |= CGEventFlags.maskShift.rawValue }

        // Require at least one modifier
        guard rawMods != 0 else { return }

        let newKeyCode = Int(event.keyCode)

        DispatchQueue.main.async {
            self.modifierRaw = rawMods
            self.keyCode = newKeyCode
            self.stopRecording()
        }
    }
}

// MARK: - Launch at Login Toggle

struct LaunchAtLoginToggle: View {
    @State private var isEnabled: Bool = {
        SMAppService.mainApp.status == .enabled
    }()

    var body: some View {
        HStack {
            Image(systemName: "power")
                .foregroundStyle(isEnabled ? .green : .secondary)
                .font(.system(size: 16))

            VStack(alignment: .leading) {
                Text("Launch at Login")
                    .font(.system(size: 13, weight: .semibold))
                Text(isEnabled ? "ConFluent starts with your Mac" : "Manual start only")
                    .font(.system(size: 11))
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Toggle("", isOn: $isEnabled)
                .toggleStyle(.switch)
                .controlSize(.small)
                .onChange(of: isEnabled) { _, newValue in
                    do {
                        if newValue {
                            try SMAppService.mainApp.register()
                        } else {
                            try SMAppService.mainApp.unregister()
                        }
                    } catch {
                        isEnabled = !newValue
                    }
                }
        }
    }
}
