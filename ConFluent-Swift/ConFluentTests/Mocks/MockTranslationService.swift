import Foundation
@testable import ConFluent

/// Mock implementation for unit testing.
actor MockTranslationService: TranslationProviding {
    var stubbedResult: TranslationService.TranslationResult?
    var lastTranslatedText: String?
    
    func translate(text: String, to targetLang: String, from sourceLang: String) async -> TranslationService.TranslationResult {
        lastTranslatedText = text
        return stubbedResult ?? .success("Mock Translation (\(text))")
    }
}
