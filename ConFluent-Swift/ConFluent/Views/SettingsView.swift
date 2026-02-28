// ===================================
// ConFluent Swift — Settings View
// Replaces: settings section in index.html
// Native SwiftUI settings with macOS style
// ===================================

import SwiftUI
import ServiceManagement

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
                        // Target language
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

                        // Trigger mode
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

                        // Delay slider (only for timer mode)
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
                }

                // Shortcuts info
                settingsSection("SHORTCUTS") {
                    VStack(alignment: .leading, spacing: 8) {
                        shortcutRow("Show/hide ConFluent", shortcut: "⌘⇧T")
                        Divider()
                        shortcutRow("Hold dictation", shortcut: "⌥ + Space (hold)")
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
                        // Revert on failure
                        isEnabled = !newValue
                    }
                }
        }
    }
}
