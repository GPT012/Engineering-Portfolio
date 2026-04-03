import Foundation
@testable import ConFluent

/// Mock implementation of SystemActionProviding for TDD.
struct MockSystemActions: SystemActionProviding {
    var grabbedText: String = "Hello world"
    var lastPastedText: String?
    var writeClipboardCalledWith: String?
    
    func readClipboard() -> String? { return "Mock Clipboard" }
    func writeClipboard(_ text: String) { /* stub */ }
    func selectAll() async { /* stub */ }
    func copy() async { /* stub */ }
    func paste() async { /* stub */ }
    
    func grabTextFromActiveApp() async -> String? {
        return grabbedText
    }
    
    func pasteTranslation(_ text: String) async {
        // We can track what was "pasted" here
        // (Using a reference type wrapper or a captured closure if needed 
        // but for now simple stub suffices as we check side-effects elsewhere)
    }
}

/// A stateful wrapper for the mock to track calls in a Sendable way.
final class MockSystemTracker: @unchecked Sendable {
    var lastPastedText: String? = nil
    var grabCalled = false
    var pasteCalled = false
}

struct TrackingMockSystemActions: SystemActionProviding {
    let tracker: MockSystemTracker
    var grabbedText: String = "Original"

    func readClipboard() -> String? { return nil }
    func writeClipboard(_ text: String) { }
    func selectAll() async { }
    func copy() async { }
    func paste() async { }
    
    func grabTextFromActiveApp() async -> String? {
        tracker.grabCalled = true
        return grabbedText
    }
    
    func pasteTranslation(_ text: String) async {
        tracker.pasteCalled = true
        tracker.lastPastedText = text
    }
}
