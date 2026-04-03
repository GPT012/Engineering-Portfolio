// ===================================
// ConFluent Swift — Dictation Engine
// Uses Apple Speech framework (works OFFLINE!)
// ===================================

import Foundation
import Speech
import AVFoundation
import Observation

/// Native speech recognition engine using SFSpeechRecognizer.
/// Key advantages over Web Speech API:
/// - Works offline with on-device models (macOS 14+)
/// - Better accuracy for French
/// - No Chromium runtime needed
/// - Direct access to audio levels for volume meter
@MainActor
@Observable
final class DictationEngine: @unchecked Sendable {

    // MARK: - State
    private(set) var isRecording = false
    private var recognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()

    // MARK: - Callbacks
    var onTranscriptUpdate: ((String, String) -> Void)?  // (final, interim)
    var onRecordingStarted: (() -> Void)?
    var onRecordingStopped: ((String, TimeInterval) -> Void)?  // (text, duration)
    var onError: ((String) -> Void)?
    var onAudioLevel: ((Float) -> Void)?  // 0.0 to 1.0

    // MARK: - Permission Check

    nonisolated static func requestPermission() async -> Bool {
        let speechStatus = await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { status in
                continuation.resume(returning: status)
            }
        }

        guard speechStatus == .authorized else { return false }

        let micGranted: Bool
        if #available(macOS 14.0, *) {
            micGranted = await AVAudioApplication.requestRecordPermission()
        } else {
            micGranted = true
        }

        return micGranted
    }

    nonisolated static func checkPermission() -> Bool {
        SFSpeechRecognizer.authorizationStatus() == .authorized
    }

    // MARK: - Start Recording

    func startRecording(lang: String = "fr-FR") throws {
        guard !isRecording else { return }

        // Clean up any previous session
        stopRecordingProcessing()

        let startTime = Date()

        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)

        let locale = Locale(identifier: lang)
        recognizer = SFSpeechRecognizer(locale: locale)

        guard let recognizer = recognizer, recognizer.isAvailable else {
            onError?("Speech recognizer unavailable for \(lang)")
            return
        }

        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let request = recognitionRequest else {
            onError?("Could not create recognition request")
            return
        }

        request.shouldReportPartialResults = true

        if #available(macOS 14, *) {
            request.requiresOnDeviceRecognition = false
            request.addsPunctuation = true
        }

        recognitionTask = startRecognitionTask(recognizer: recognizer, request: request, startTime: startTime)
        installAudioTap(on: inputNode, format: recordingFormat, request: request)

        audioEngine.prepare()
        try audioEngine.start()

        isRecording = true
        onRecordingStarted?()
    }

    nonisolated private func startRecognitionTask(
        recognizer: SFSpeechRecognizer,
        request: SFSpeechAudioBufferRecognitionRequest,
        startTime: Date
    ) -> SFSpeechRecognitionTask {
        return recognizer.recognitionTask(with: request) { [weak self] result, error in
            let finalText = result?.bestTranscription.formattedString
            let isFinal = result?.isFinal ?? false
            
            let isDone = isFinal || (error != nil)
            let nsError = error as NSError?
            let isCancelledOrNoSpeech = nsError?.code == 1 || nsError?.code == 216 || nsError?.code == 203
            
            let errorMsg: String? = {
                guard let nsError = nsError else { return nil }
                return isCancelledOrNoSpeech ? nil : nsError.localizedDescription
            }()

            Task { @MainActor [weak self] in
                guard let self = self else { return }

                if let text = finalText {
                    if isDone {
                        let duration = Date().timeIntervalSince(startTime)
                        self.onRecordingStopped?(text, duration)
                    } else {
                        self.onTranscriptUpdate?(text, "")
                    }
                } else if isDone {
                    let duration = Date().timeIntervalSince(startTime)
                    self.onRecordingStopped?("", duration)
                }

                if let errorMsg = errorMsg {
                    self.onError?(errorMsg)
                }
            }
        }
    }

    nonisolated private func installAudioTap(
        on inputNode: AVAudioInputNode,
        format: AVAudioFormat,
        request: SFSpeechAudioBufferRecognitionRequest
    ) {
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak self] buffer, _ in
            request.append(buffer)

            // Metering
            guard let channelData = buffer.floatChannelData?[0] else { return }
            let frames = buffer.frameLength
            guard frames > 0 else { return }
            var sumSquares: Float = 0.0
            for i in 0..<Int(frames) {
                let sample = channelData[i]
                sumSquares += sample * sample
            }
            let rms = sqrt(sumSquares / Float(frames))
            let normalizedLevel = min(1.0, rms * 5.0)

            Task { @MainActor [weak self] in
                self?.onAudioLevel?(normalizedLevel)
            }
        }
    }

    // MARK: - Stop Recording

    func stopRecording() {
        guard isRecording else { return }

        if audioEngine.isRunning {
            audioEngine.stop()
            audioEngine.inputNode.removeTap(onBus: 0)
        }

        isRecording = false
        onAudioLevel?(0)

        finalizeNativeRecording()
    }
    
    private func stopRecordingProcessing() {
        if audioEngine.isRunning {
            audioEngine.stop()
            audioEngine.inputNode.removeTap(onBus: 0)
        }
        
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        recognitionTask?.cancel()
        recognitionTask = nil
    }

    private func finalizeNativeRecording() {
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        recognitionTask = nil
    }
}
