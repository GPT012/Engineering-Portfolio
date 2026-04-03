// ===================================
// ConFluent Swift — Data Models
// All app data structures
// ===================================

import Foundation

// MARK: - Translation Entry

/// A single translation event logged by the system
struct TranslationEntry: Identifiable, Codable, Sendable {
    let id: UUID
    let original: String
    let translation: String
    let sourceLang: String
    let targetLang: String
    let detectedLang: String
    let timestamp: Date
    let fromCache: Bool

    init(
        original: String,
        translation: String,
        sourceLang: String = "auto",
        targetLang: String = "en",
        detectedLang: String = "auto",
        fromCache: Bool = false
    ) {
        self.id = UUID()
        self.original = original
        self.translation = translation
        self.sourceLang = sourceLang
        self.targetLang = targetLang
        self.detectedLang = detectedLang
        self.timestamp = Date()
        self.fromCache = fromCache
    }
}

// MARK: - Dictation Entry

/// A single voice dictation event
struct DictationEntry: Identifiable, Codable, Sendable {
    let id: UUID
    let text: String
    let timestamp: Date
    let duration: TimeInterval  // seconds
    let lang: String

    init(text: String, duration: TimeInterval, lang: String = "fr-FR") {
        self.id = UUID()
        self.text = text
        self.timestamp = Date()
        self.duration = duration
        self.lang = lang
    }
}

// MARK: - Trigger Mode

/// How the translation is triggered after typing
enum TriggerMode: String, Codable, CaseIterable, Sendable {
    case timer = "timer"       // After a delay
    case rapid = "rapid"       // On space or short pause
    case pro = "pro"           // After sentence-ending punctuation

    var label: String {
        switch self {
        case .timer: return "Standard (Timer)"
        case .rapid: return "⚡ Rapid (Instant)"
        case .pro: return "📧 Pro (Sentence End)"
        }
    }
}

// MARK: - Supported Languages

struct Language: Identifiable, Hashable, Sendable {
    let id: String   // "en", "fr", etc.
    let name: String // "English", "Français", etc.
    let flag: String // "🇺🇸", "🇫🇷", etc.

    static let all: [Language] = [
        Language(id: "en", name: "English", flag: "🇺🇸"),
        Language(id: "fr", name: "Français", flag: "🇫🇷"),
        Language(id: "es", name: "Español", flag: "🇪🇸"),
        Language(id: "de", name: "Deutsch", flag: "🇩🇪"),
        Language(id: "it", name: "Italiano", flag: "🇮🇹"),
        Language(id: "pt", name: "Português", flag: "🇧🇷"),
        Language(id: "ru", name: "Русский", flag: "🇷🇺"),
        Language(id: "ja", name: "日本語", flag: "🇯🇵"),
        Language(id: "ko", name: "한국어", flag: "🇰🇷"),
        Language(id: "zh", name: "中文", flag: "🇨🇳"),
        Language(id: "ar", name: "العربية", flag: "🇸🇦"),
        Language(id: "nl", name: "Nederlands", flag: "🇳🇱")
    ]
}

struct SpeechLanguage: Identifiable, Hashable, Sendable {
    let id: String   // "fr-FR", "en-US", etc.
    let name: String

    static let all: [SpeechLanguage] = [
        SpeechLanguage(id: "fr-FR", name: "Français"),
        SpeechLanguage(id: "en-US", name: "English (US)"),
        SpeechLanguage(id: "en-GB", name: "English (UK)"),
        SpeechLanguage(id: "es-ES", name: "Español"),
        SpeechLanguage(id: "de-DE", name: "Deutsch"),
        SpeechLanguage(id: "it-IT", name: "Italiano"),
        SpeechLanguage(id: "pt-BR", name: "Português"),
        SpeechLanguage(id: "ar-SA", name: "العربية"),
        SpeechLanguage(id: "ja-JP", name: "日本語"),
        SpeechLanguage(id: "ko-KR", name: "한국어"),
        SpeechLanguage(id: "zh-CN", name: "中文"),
        SpeechLanguage(id: "ru-RU", name: "Русский"),
        SpeechLanguage(id: "nl-NL", name: "Nederlands")
    ]
}

// MARK: - App Status

enum AppStatus: Sendable, Equatable {
    case active
    case translating
    case recording
    case error(String)
    case disabled

    var label: String {
        switch self {
        case .active: return "Active"
        case .translating: return "Translating..."
        case .recording: return "Recording..."
        case .error(let msg): return "Error: \(msg)"
        case .disabled: return "Paused"
        }
    }
}
