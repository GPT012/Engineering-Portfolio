import Testing
import Foundation
@testable import ConFluent

@Suite("TranslationCoordinator Tests")
@MainActor
struct TranslationCoordinatorTests {
    
    @Test("Full translation cycle invokes expected system/translator steps")
    func testTranslationFlow() async {
        // GIVEN
        let tracker = MockSystemTracker()
        let system = TrackingMockSystemActions(tracker: tracker, grabbedText: "Hello World")
        let translator = MockTranslationService()
        
        let coordinator = TranslationCoordinator(system: system, translator: translator)
        
        // WHEN
        await coordinator.performTranslation(targetLang: "fr")
        
        // THEN
        #expect(tracker.grabCalled, "Should have grabbed text from active app")
        #expect(tracker.pasteCalled, "Should have pasted translation")
    }
}
