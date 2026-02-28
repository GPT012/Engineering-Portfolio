// ===================================
// ConFluent Swift — App State
// Observable global state (Swift 6)
// Replaces: electron-store + in-memory state
// ===================================

import Foundation
import SwiftUI

/// Central observable state for the entire app.
/// @MainActor ensures all UI-bound state mutations happen on the main thread.
@MainActor
@Observable
final class AppState {

    // MARK: - Singleton
    static let shared = AppState()

    // MARK: - Status
    var status: AppStatus = .active
    var isEnabled: Bool {
        didSet { UserDefaults.standard.set(isEnabled, forKey: "enabled") }
    }

    // MARK: - Translation Settings
    var targetLang: String {
        didSet { UserDefaults.standard.set(targetLang, forKey: "targetLang") }
    }

    var triggerMode: TriggerMode {
        didSet { UserDefaults.standard.set(triggerMode.rawValue, forKey: "triggerMode") }
    }

    var triggerDelay: Int {
        didSet { UserDefaults.standard.set(triggerDelay, forKey: "triggerDelay") }
    }

    // MARK: - Dictation Settings
    var dictationLang: String {
        didSet { UserDefaults.standard.set(dictationLang, forKey: "dictationLang") }
    }

    // MARK: - Live State
    var liveBuffer: String = ""
    var keystrokeCount: Int = 0
    var isTranslating: Bool = false

    // MARK: - Dictation Live State
    var isRecording: Bool = false
    var liveTranscript: String = ""
    var interimTranscript: String = ""

    // MARK: - History
    var translationLog: [TranslationEntry] = []
    var dictationHistory: [DictationEntry] = []

    // MARK: - Accessibility
    var hasAccessibility: Bool = false

    // MARK: - Active Tab
    var selectedTab: AppTab = .translate

    // MARK: - Init (load from UserDefaults)
    private init() {
        let defaults = UserDefaults.standard

        self.isEnabled = defaults.object(forKey: "enabled") as? Bool ?? true
        self.targetLang = defaults.string(forKey: "targetLang") ?? "en"
        self.triggerMode = TriggerMode(rawValue: defaults.string(forKey: "triggerMode") ?? "timer") ?? .timer
        self.triggerDelay = defaults.object(forKey: "triggerDelay") as? Int ?? 1000
        self.dictationLang = defaults.string(forKey: "dictationLang") ?? "fr-FR"

        // Load persisted history
        loadTranslationLog()
        loadDictationHistory()
    }

    // MARK: - Translation Log

    func addTranslation(_ entry: TranslationEntry) {
        translationLog.insert(entry, at: 0)
        if translationLog.count > 100 { translationLog.removeLast() }
        saveTranslationLog()
    }

    func clearTranslationLog() {
        translationLog.removeAll()
        UserDefaults.standard.removeObject(forKey: "translationLog")
    }

    // MARK: - Dictation History

    func addDictation(_ entry: DictationEntry) {
        dictationHistory.insert(entry, at: 0)
        if dictationHistory.count > 200 { dictationHistory.removeLast() }
        saveDictationHistory()
    }

    func clearDictationHistory() {
        dictationHistory.removeAll()
        UserDefaults.standard.removeObject(forKey: "dictationHistory")
    }

    // MARK: - Persistence Helpers

    private func saveTranslationLog() {
        if let data = try? JSONEncoder().encode(translationLog) {
            UserDefaults.standard.set(data, forKey: "translationLog")
        }
    }

    private func loadTranslationLog() {
        if let data = UserDefaults.standard.data(forKey: "translationLog"),
           let log = try? JSONDecoder().decode([TranslationEntry].self, from: data) {
            translationLog = log
        }
    }

    private func saveDictationHistory() {
        if let data = try? JSONEncoder().encode(dictationHistory) {
            UserDefaults.standard.set(data, forKey: "dictationHistory")
        }
    }

    private func loadDictationHistory() {
        if let data = UserDefaults.standard.data(forKey: "dictationHistory"),
           let history = try? JSONDecoder().decode([DictationEntry].self, from: data) {
            dictationHistory = history
        }
    }
}

// MARK: - App Tab

enum AppTab: String, CaseIterable, Sendable {
    case translate = "Translate"
    case dictation = "Dictation"
    case settings = "Settings"

    var icon: String {
        switch self {
        case .translate: return "character.book.closed"
        case .dictation: return "mic"
        case .settings: return "gearshape"
        }
    }
}
