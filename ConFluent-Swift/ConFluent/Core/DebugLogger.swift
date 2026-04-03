// ===================================
// ConFluent Swift — Debug Logger
// In-app log buffer to avoid stdout crashes.
// All debug output goes here instead of print().
// ===================================

import Foundation
import SwiftUI

/// Thread-safe, circular debug log buffer.
/// Replaces all `print()` calls to prevent stdout flooding crashes.
@MainActor
@Observable
final class DebugLogger {

    // MARK: - Singleton
    static let shared = DebugLogger()

    // MARK: - Configuration
    private let maxEntries = 500

    // MARK: - State
    private(set) var entries: [LogEntry] = []

    // MARK: - Log Entry
    struct LogEntry: Identifiable, Sendable {
        let id = UUID()
        let timestamp: Date
        let message: String
        let level: LogLevel

        private static let timeFormatter: DateFormatter = {
            let formatter = DateFormatter()
            formatter.dateFormat = "HH:mm:ss.SSS"
            return formatter
        }()

        var formattedTime: String {
            Self.timeFormatter.string(from: timestamp)
        }
    }

    enum LogLevel: String, Sendable {
        case info = "ℹ️"
        case success = "✅"
        case warning = "⚠️"
        case error = "❌"
        case debug = "🔧"
        case dictation = "🎤"
        case event = "⌨️"
    }

    // MARK: - Init
    private init() {}

    // MARK: - Logging (call from any thread)

    /// Log a message from any thread. Dispatches to MainActor for storage.
    nonisolated static func log(_ message: String, level: LogLevel = .info) {
        let entry = LogEntry(timestamp: Date(), message: message, level: level)
        Task { @MainActor in
            shared.append(entry)
        }
    }

    // MARK: - Private

    private func append(_ entry: LogEntry) {
        entries.append(entry)
        if entries.count > maxEntries {
            entries.removeFirst(entries.count - maxEntries)
        }
    }

    // MARK: - Clear
    func clear() {
        entries.removeAll()
    }
}
