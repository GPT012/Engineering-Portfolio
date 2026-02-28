// ===================================
// ConFluent Swift — Main Popover View
// Replaces: index.html + overlay.html + dictation.html
// All in one SwiftUI view with tabs
// ===================================

import SwiftUI

struct PopoverView: View {
    @Environment(AppState.self) private var state
    @Environment(DictationEngine.self) private var dictation

    var body: some View {
        @Bindable var state = state

        VStack(spacing: 0) {
            // Title bar
            titleBar

            // Tab selector
            tabBar

            // Content
            Group {
                switch state.selectedTab {
                case .translate:
                    TranslateTabView()
                case .dictation:
                    DictationTabView()
                case .settings:
                    SettingsTabView()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            // Footer
            footer
        }
        .frame(width: 400, height: 520)
        .background(.ultraThinMaterial)
    }

    // MARK: - Title Bar

    private var titleBar: some View {
        HStack {
            Image(systemName: "character.book.closed.fill")
                .foregroundStyle(.blue)
                .font(.system(size: 16, weight: .bold))

            Text("ConFluent")
                .font(.system(size: 15, weight: .bold, design: .rounded))

            Spacer()

            StatusIndicator(status: state.status)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
    }

    // MARK: - Tab Bar

    private var tabBar: some View {
        HStack(spacing: 2) {
            ForEach(AppTab.allCases, id: \.self) { tab in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        state.selectedTab = tab
                    }
                } label: {
                    HStack(spacing: 5) {
                        Image(systemName: tab.icon)
                            .font(.system(size: 11, weight: .semibold))
                        Text(tab.rawValue)
                            .font(.system(size: 11, weight: .semibold))
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 7)
                    .background(
                        state.selectedTab == tab
                            ? AnyShapeStyle(.tint.opacity(0.15))
                            : AnyShapeStyle(.clear)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
                .buttonStyle(.plain)
                .foregroundStyle(state.selectedTab == tab ? .primary : .secondary)
            }
        }
        .padding(.horizontal, 16)
        .padding(.bottom, 8)
    }

    // MARK: - Footer

    private var footer: some View {
        HStack {
            Text("ConFluent v2.0")
                .font(.system(size: 10))
                .foregroundStyle(.tertiary)

            Spacer()

            Text("⌘⇧T to toggle")
                .font(.system(size: 10))
                .foregroundStyle(.quaternary)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 8)
    }
}

// MARK: - Status Indicator

struct StatusIndicator: View {
    let status: AppStatus

    var body: some View {
        HStack(spacing: 5) {
            Circle()
                .fill(statusColor)
                .frame(width: 7, height: 7)
                .shadow(color: statusColor.opacity(0.5), radius: 3)

            Text(status.label)
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(statusColor)
        }
    }

    private var statusColor: Color {
        switch status {
        case .active: return .green
        case .translating: return .blue
        case .recording: return .red
        case .error: return .red
        case .disabled: return .gray
        }
    }
}

// MARK: - Translate Tab

struct TranslateTabView: View {
    @Environment(AppState.self) private var state

    var body: some View {
        VStack(spacing: 12) {
            // Live buffer
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Label("LIVE TYPING", systemImage: "keyboard")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(.secondary)
                        .textCase(.uppercase)

                    Spacer()

                    if state.keystrokeCount > 0 {
                        Circle()
                            .fill(.green)
                            .frame(width: 6, height: 6)
                            .opacity(0.8)
                    }
                }

                Text(state.liveBuffer.isEmpty ? "Waiting for input in any app..." : state.liveBuffer)
                    .font(.system(size: 13))
                    .foregroundStyle(state.liveBuffer.isEmpty ? .tertiary : .primary)
                    .italic(state.liveBuffer.isEmpty)
                    .frame(maxWidth: .infinity, minHeight: 40, alignment: .topLeading)
                    .padding(10)
                    .background(.regularMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .strokeBorder(
                                state.keystrokeCount > 0 ? Color.blue.opacity(0.3) : Color.clear,
                                lineWidth: 1
                            )
                    )
            }
            .padding(.horizontal, 16)

            // Accessibility warning
            if !state.hasAccessibility {
                AccessibilityBanner()
                    .padding(.horizontal, 16)
            }

            // Translation log
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Label("TRANSLATION LOG", systemImage: "clock")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(.secondary)
                        .textCase(.uppercase)

                    Spacer()

                    if !state.translationLog.isEmpty {
                        Button("Clear") {
                            withAnimation { state.clearTranslationLog() }
                        }
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundStyle(.secondary)
                        .buttonStyle(.plain)
                    }
                }

                ScrollView {
                    LazyVStack(spacing: 6) {
                        if state.translationLog.isEmpty {
                            Text("No translations yet. Start typing in any app...")
                                .font(.system(size: 12))
                                .foregroundStyle(.tertiary)
                                .italic()
                                .padding(.vertical, 20)
                                .frame(maxWidth: .infinity)
                        } else {
                            ForEach(state.translationLog) { entry in
                                TranslationRow(entry: entry)
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
        }
        .padding(.top, 4)
    }
}

// MARK: - Translation Row

struct TranslationRow: View {
    let entry: TranslationEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(entry.original)
                .font(.system(size: 11))
                .foregroundStyle(.secondary)
                .lineLimit(2)

            Text(entry.translation)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(.primary)
                .lineLimit(3)

            HStack(spacing: 6) {
                if entry.detectedLang != "auto" {
                    Text("\(entry.detectedLang) → \(entry.targetLang)")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundStyle(.blue)
                        .padding(.horizontal, 5)
                        .padding(.vertical, 1)
                        .background(Color.blue.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 4))
                }

                Text(entry.timestamp, style: .time)
                    .font(.system(size: 9))
                    .foregroundStyle(.tertiary)

                if entry.fromCache {
                    Text("⚡ cached")
                        .font(.system(size: 9, weight: .medium))
                        .foregroundStyle(.green)
                }

                Spacer()

                Button {
                    SystemActions.writeClipboard(entry.translation)
                } label: {
                    Image(systemName: "doc.on.doc")
                        .font(.system(size: 10))
                }
                .buttonStyle(.plain)
                .foregroundStyle(.secondary)
                .help("Copy translation")
            }
        }
        .padding(10)
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

// MARK: - Accessibility Banner

struct AccessibilityBanner: View {
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.yellow)
                .font(.system(size: 14))

            Text("Accessibility permission required")
                .font(.system(size: 12, weight: .medium))

            Spacer()

            Button("Grant") {
                AccessibilityManager.openAccessibilitySettings()
            }
            .font(.system(size: 11, weight: .bold))
            .buttonStyle(.bordered)
            .controlSize(.small)
        }
        .padding(10)
        .background(Color.yellow.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .strokeBorder(Color.yellow.opacity(0.2), lineWidth: 1)
        )
    }
}
