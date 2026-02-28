// ===================================
// ConFluent Swift — Translation Service
// Replaces: translateText() in main.js
// Google Translate API + LRU Cache
// ===================================

import Foundation

/// Thread-safe translation engine using an actor for serial access.
/// Handles LRU caching, request deduplication, and async translation.
actor TranslationService {

    static let shared = TranslationService()

    // MARK: - LRU Cache
    private var cache: [(key: String, value: String)] = []
    private let maxCacheSize = 200

    // MARK: - Request Deduplication
    private var pendingRequests: [String: Task<TranslationResult, Never>] = [:]

    // MARK: - Types

    struct TranslationResult: Sendable {
        let translation: String?
        let detectedLang: String
        let error: String?
        let fromCache: Bool

        static func success(_ translation: String, detectedLang: String = "auto", fromCache: Bool = false) -> TranslationResult {
            TranslationResult(translation: translation, detectedLang: detectedLang, error: nil, fromCache: fromCache)
        }

        static func failure(_ error: String) -> TranslationResult {
            TranslationResult(translation: nil, detectedLang: "auto", error: error, fromCache: false)
        }
    }

    // MARK: - Public API

    func translate(text: String, to targetLang: String, from sourceLang: String = "auto") async -> TranslationResult {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            return .failure("Empty text")
        }

        // Check cache first
        let cacheKey = makeCacheKey(trimmed, targetLang, sourceLang)
        if let cached = getFromCache(cacheKey) {
            return .success(cached, fromCache: true)
        }

        // Check if we already have a pending request for the same text
        if let pending = pendingRequests[cacheKey] {
            return await pending.value
        }

        // Create new request
        let task = Task<TranslationResult, Never> {
            let result = await performTranslation(text: trimmed, targetLang: targetLang, sourceLang: sourceLang)

            // Clean up pending request
            // Note: This runs inside the actor so it's safe
            pendingRequests[cacheKey] = nil

            // Cache successful results
            if let translation = result.translation {
                addToCache(cacheKey, translation)
            }

            return result
        }

        pendingRequests[cacheKey] = task
        return await task.value
    }

    // MARK: - HTTP Translation

    private func performTranslation(text: String, targetLang: String, sourceLang: String) async -> TranslationResult {
        guard let encoded = text.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) else {
            return .failure("Encoding error")
        }

        let urlString = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=\(sourceLang)&tl=\(targetLang)&dt=t&q=\(encoded)"

        guard let url = URL(string: urlString) else {
            return .failure("Invalid URL")
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.timeoutInterval = 10

        do {
            let (data, response) = try await URLSession.shared.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                return .failure("HTTP error")
            }

            // Google Translate returns a nested array, not strict JSON
            // Format: [[[translated_text, original_text, ...], ...], ..., detected_lang, ...]
            guard let json = try JSONSerialization.jsonObject(with: data) as? [Any] else {
                return .failure("Parse error")
            }

            var translation = ""
            var detectedLang = sourceLang

            // Extract translated text from nested arrays
            if let sentences = json.first as? [Any] {
                for sentence in sentences {
                    if let parts = sentence as? [Any],
                       let translatedPart = parts.first as? String {
                        translation += translatedPart
                    }
                }
            }

            // Extract detected language
            if json.count > 2, let lang = json[2] as? String {
                detectedLang = lang
            }

            let result = translation.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !result.isEmpty else {
                return .failure("No translation received")
            }

            return .success(result, detectedLang: detectedLang)

        } catch {
            return .failure(error.localizedDescription)
        }
    }

    // MARK: - LRU Cache Helpers

    private func makeCacheKey(_ text: String, _ targetLang: String, _ sourceLang: String) -> String {
        "\(sourceLang):\(targetLang):\(text.lowercased())"
    }

    private func getFromCache(_ key: String) -> String? {
        guard let index = cache.firstIndex(where: { $0.key == key }) else {
            return nil
        }
        // Move to end (most recently used)
        let entry = cache.remove(at: index)
        cache.append(entry)
        return entry.value
    }

    private func addToCache(_ key: String, _ value: String) {
        // Remove existing entry if present
        cache.removeAll { $0.key == key }

        // Evict oldest if at capacity
        if cache.count >= maxCacheSize {
            cache.removeFirst()
        }

        cache.append((key: key, value: value))
    }
}
