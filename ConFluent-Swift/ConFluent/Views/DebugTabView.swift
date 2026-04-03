// ===================================
// ConFluent Swift — Debug Tab View
// Shows in-app debug logs instead of stdout
// ===================================

import SwiftUI

struct DebugTabView: View {

    private let logger = DebugLogger.shared

    var body: some View {
        VStack(spacing: 8) {
            // Header
            HStack {
                Label("DEBUG LOGS", systemImage: "ladybug")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)

                Spacer()

                Text("\(logger.entries.count) entries")
                    .font(.system(size: 10))
                    .foregroundStyle(.tertiary)

                Button {
                    logger.clear()
                } label: {
                    Image(systemName: "trash")
                        .font(.system(size: 10))
                }
                .buttonStyle(.plain)
                .foregroundStyle(.secondary)
                .help("Clear logs")
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)

            // Log list — auto-scrolls to bottom
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 2) {
                        if logger.entries.isEmpty {
                            Text("No debug logs yet. Logs appear here instead of stdout.")
                                .font(.system(size: 12))
                                .foregroundStyle(.tertiary)
                                .italic()
                                .padding(.vertical, 20)
                                .frame(maxWidth: .infinity)
                        } else {
                            ForEach(logger.entries) { entry in
                                LogRow(entry: entry)
                                    .id(entry.id)
                            }
                        }
                    }
                    .padding(.horizontal, 12)
                }
                .onChange(of: logger.entries.count) { _, _ in
                    if let last = logger.entries.last {
                        withAnimation(.easeOut(duration: 0.15)) {
                            proxy.scrollTo(last.id, anchor: .bottom)
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Log Row

private struct LogRow: View {
    let entry: DebugLogger.LogEntry

    var body: some View {
        HStack(alignment: .top, spacing: 4) {
            Text(entry.formattedTime)
                .font(.system(size: 9, design: .monospaced))
                .foregroundStyle(.tertiary)
                .frame(width: 70, alignment: .leading)

            Text(entry.level.rawValue)
                .font(.system(size: 9))
                .frame(width: 16)

            Text(entry.message)
                .font(.system(size: 10, design: .monospaced))
                .foregroundStyle(colorForLevel(entry.level))
                .lineLimit(3)
                .textSelection(.enabled)
        }
        .padding(.vertical, 2)
        .padding(.horizontal, 6)
        .background(
            entry.level == .error
                ? Color.red.opacity(0.08)
                : Color.clear
        )
        .clipShape(RoundedRectangle(cornerRadius: 3))
    }

    private func colorForLevel(_ level: DebugLogger.LogLevel) -> Color {
        switch level {
        case .info: return .primary
        case .success: return .green
        case .warning: return .orange
        case .error: return .red
        case .debug: return .cyan
        case .dictation: return .purple
        case .event: return .gray
        }
    }
}
