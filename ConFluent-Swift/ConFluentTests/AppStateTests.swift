import Testing
@testable import ConFluent

@Suite("AppState Tests")
@MainActor
struct AppStateTests {
    
    @Test("Initial state is active")
    func initialState() {
        let state = AppState.shared
        #expect(state.status == .active)
    }
    
    @Test("Add translation increments log")
    func addTranslation() {
        let state = AppState.shared
        state.clearTranslationLog()
        
        let entry = TranslationEntry(
            original: "Hello",
            translation: "Bonjour",
            targetLang: "fr",
            detectedLang: "en"
        )
        
        state.addTranslation(entry)
        
        #expect(state.translationLog.count == 1)
        #expect(state.translationLog.first?.original == "Hello")
    }
}
