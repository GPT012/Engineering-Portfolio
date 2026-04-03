// ===================================
// ConFluent Swift — Dictation View
// Replaces: dictation.html + dictation-renderer.js
// Native SFSpeechRecognizer UI
// ===================================

import SwiftUI

struct DictationTabView: View {
    @Environment(AppState.self) private var state
    @Environment(DictationEngine.self) private var dictation

    @State private var audioLevel: Float = 0

    var body: some View {
        VStack(spacing: 12) {
            // Mic button section
            micSection

            // Volume meter
            volumeMeter
                .frame(height: 24)
                .padding(.horizontal, 20)

            // Live transcription
            transcriptionBox

            // History
            historySection
        }
        .padding(.top, 4)
        .onAppear { setupAudioLevelCallback() }
    }

    // MARK: - Mic Button

    private var micSection: some View {
        VStack(spacing: 8) {
            Button {
                toggleRecording()
            } label: {
                ZStack {
                    // Outer pulse ring (when recording)
                    if state.isRecording {
                        Circle()
                            .strokeBorder(Color.red.opacity(0.2), lineWidth: 2)
                            .frame(width: 100, height: 100)
                            .scaleEffect(state.isRecording ? 1.4 : 1)
                            .opacity(state.isRecording ? 0 : 1)
                            .animation(.easeOut(duration: 1.5).repeatForever(autoreverses: false), value: state.isRecording)

                        Circle()
                            .strokeBorder(Color.red.opacity(0.15), lineWidth: 2)
                            .frame(width: 100, height: 100)
                            .scaleEffect(state.isRecording ? 1.8 : 1)
                            .opacity(state.isRecording ? 0 : 0.5)
                            .animation(.easeOut(duration: 1.5).repeatForever(autoreverses: false).delay(0.4), value: state.isRecording)
                    }

                    // Main ring
                    Circle()
                        .strokeBorder(
                            state.isRecording ? Color.red : Color.gray.opacity(0.3),
                            lineWidth: 3
                        )
                        .frame(width: 80, height: 80)
                        .shadow(color: state.isRecording ? Color.red.opacity(0.2) : .clear, radius: 10)

                    // Mic icon
                    Image(systemName: state.isRecording ? "mic.fill" : "mic")
                        .font(.system(size: 28, weight: .medium))
                        .foregroundStyle(state.isRecording ? .red : .secondary)
                        .scaleEffect(state.isRecording ? 1.1 : 1.0)
                        .animation(.easeInOut(duration: 0.3), value: state.isRecording)
                }
            }
            .buttonStyle(.plain)

            // Status text
            Text(state.isRecording ? "Écoute en cours..." : "Maintiens ⌥ + Space pour dicter")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(state.isRecording ? .red : .secondary)
                .animation(.easeInOut, value: state.isRecording)

            Text(state.isRecording ? "Relâche pour arrêter" : "La traduction est copiée automatiquement")
                .font(.system(size: 10))
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 8)
    }

    // MARK: - Volume Meter

    private var volumeMeter: some View {
        HStack(spacing: 2) {
            ForEach(0..<15, id: \.self) { index in
                RoundedRectangle(cornerRadius: 2)
                    .fill(barColor(for: index))
                    .frame(width: 4, height: barHeight(for: index))
                    .animation(.easeOut(duration: 0.08), value: audioLevel)
            }
        }
    }

    private func barHeight(for index: Int) -> CGFloat {
        guard state.isRecording else { return 4 }
        let threshold = Float(index) / 15.0
        return audioLevel > threshold ? CGFloat(4 + audioLevel * 20) : 4
    }

    private func barColor(for index: Int) -> Color {
        let threshold = Float(index) / 15.0
        return (state.isRecording && audioLevel > threshold) ? .red : Color.gray.opacity(0.2)
    }

    // MARK: - Transcription Box

    private var transcriptionBox: some View {
        VStack(alignment: .leading) {
            Group {
                if !state.liveTranscript.isEmpty {
                    Text(state.liveTranscript)
                        .font(.system(size: 14))
                        .foregroundStyle(.primary)
                    + Text(state.interimTranscript)
                        .font(.system(size: 14))
                        .foregroundStyle(.secondary)
                        .italic()
                } else {
                    Text("Transcription will appear here...")
                        .font(.system(size: 13))
                        .foregroundStyle(.tertiary)
                        .italic()
                }
            }
            .frame(maxWidth: .infinity, minHeight: 44, alignment: .topLeading)
        }
        .padding(10)
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .strokeBorder(
                    state.isRecording ? Color.red.opacity(0.3) : Color.clear,
                    lineWidth: 1
                )
        )
        .padding(.horizontal, 16)
    }

    // MARK: - History Section

    private var historySection: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Label("VOICE HISTORY", systemImage: "waveform")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)

                Spacer()

                if !state.dictationHistory.isEmpty {
                    Button("Clear") {
                        withAnimation { state.clearDictationHistory() }
                    }
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundStyle(.secondary)
                    .buttonStyle(.plain)
                }
            }

            ScrollView {
                LazyVStack(spacing: 6) {
                    if state.dictationHistory.isEmpty {
                        Text("No recordings yet. Hold ⌥ + Space to start...")
                            .font(.system(size: 12))
                            .foregroundStyle(.tertiary)
                            .italic()
                            .padding(.vertical, 16)
                            .frame(maxWidth: .infinity)
                    } else {
                        ForEach(state.dictationHistory) { entry in
                            DictationRow(entry: entry)
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 16)
    }

    // MARK: - Actions

    private func toggleRecording() {
        if state.isRecording {
            dictation.stopRecording()
        } else {
            try? dictation.startRecording(lang: state.dictationLang)
        }
    }

    private func setupAudioLevelCallback() {
        dictation.onAudioLevel = { level in
            audioLevel = level
        }
    }
}

// MARK: - Dictation Row

struct DictationRow: View {
    let entry: DictationEntry
    @State private var showCopied = false

    var body: some View {
        Button {
            SystemActions.writeClipboard(entry.text)
            showCopied = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                showCopied = false
            }
        } label: {
            VStack(alignment: .leading, spacing: 4) {
                Text(entry.text)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(.primary)
                    .lineLimit(3)
                    .multilineTextAlignment(.leading)

                HStack(spacing: 6) {
                    Label(formatDuration(entry.duration), systemImage: "mic")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundStyle(.blue)
                        .padding(.horizontal, 5)
                        .padding(.vertical, 1)
                        .background(Color.blue.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 4))

                    Text(entry.timestamp, style: .time)
                        .font(.system(size: 9))
                        .foregroundStyle(.tertiary)

                    Spacer()

                    if showCopied {
                        Text("✓ Copied")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundStyle(.green)
                            .transition(.opacity)
                    }
                }
            }
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.regularMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
        .buttonStyle(.plain)
    }

    private func formatDuration(_ seconds: TimeInterval) -> String {
        if seconds < 1 { return "<1s" }
        return "\(Int(seconds))s"
    }
}
