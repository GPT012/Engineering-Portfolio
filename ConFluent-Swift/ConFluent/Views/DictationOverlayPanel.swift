// ===================================
// ConFluent Swift — Dictation Overlay
// Floating HUD with waveform animation
// Appears during dictation (Option+Space)
// ===================================

import SwiftUI
import AppKit

// MARK: - Overlay Panel (NSPanel wrapper)

/// A floating, always-on-top panel that shows dictation status.
/// Uses NSPanel for proper floating behavior above all windows.
@MainActor
final class DictationOverlayPanel {

    private var panel: NSPanel?
    private let overlayState = OverlayState()

    // MARK: - Show / Update / Dismiss

    func showListening() {
        overlayState.mode = .listening
        overlayState.text = "Listening..."
        overlayState.audioLevel = 0
        showPanel()
    }

    func updateAudioLevel(_ level: Float) {
        overlayState.audioLevel = level
    }

    func showTranslating() {
        overlayState.mode = .translating
        overlayState.text = "Translating..."
    }

    func showSuccess(_ translatedText: String) {
        overlayState.mode = .success
        overlayState.text = translatedText

        // Auto-dismiss after 2 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            guard self?.overlayState.mode == .success else { return }
            self?.dismiss()
        }
    }

    func dismiss() {
        panel?.orderOut(nil)
        panel = nil
        overlayState.mode = .hidden
        overlayState.audioLevel = 0
    }

    // MARK: - Panel Setup

    private func showPanel() {
        if panel != nil {
            panel?.orderFront(nil)
            return
        }

        let hostView = NSHostingView(rootView: DictationOverlayView(state: overlayState))
        hostView.frame = NSRect(x: 0, y: 0, width: 320, height: 80)

        let p = NSPanel(
            contentRect: NSRect(x: 0, y: 0, width: 320, height: 80),
            styleMask: [.borderless, .nonactivatingPanel],
            backing: .buffered,
            defer: false
        )
        p.isOpaque = false
        p.backgroundColor = .clear
        p.hasShadow = true
        p.level = .floating
        p.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        p.isMovableByWindowBackground = true
        p.hidesOnDeactivate = false  // Stay visible when other apps are focused
        p.contentView = hostView

        // Position: center-bottom of main screen
        if let screen = NSScreen.main {
            let screenFrame = screen.visibleFrame
            let x = screenFrame.midX - 160
            let y = screenFrame.minY + 80
            p.setFrameOrigin(NSPoint(x: x, y: y))
        }

        p.orderFront(nil)
        panel = p
    }
}

// MARK: - Observable State

@Observable
final class OverlayState {
    var mode: OverlayMode = .hidden
    var text: String = ""
    var audioLevel: Float = 0
}

enum OverlayMode: Equatable {
    case hidden
    case listening
    case translating
    case success
}

// MARK: - SwiftUI Overlay View

struct DictationOverlayView: View {
    let state: OverlayState

    var body: some View {
        HStack(spacing: 14) {
            // Left icon
            statusIcon
                .frame(width: 36, height: 36)

            // Center: waveform or text
            VStack(alignment: .leading, spacing: 4) {
                if state.mode == .listening {
                    WaveformView(audioLevel: state.audioLevel)
                        .frame(height: 24)
                }

                Text(state.text)
                    .font(.system(size: state.mode == .success ? 12 : 13, weight: .semibold))
                    .foregroundStyle(textColor)
                    .lineLimit(2)
                    .truncationMode(.tail)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
        .frame(width: 320, height: 80)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(.ultraThinMaterial)
                .shadow(color: accentColor.opacity(0.3), radius: 20, y: 5)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .strokeBorder(accentColor.opacity(0.4), lineWidth: 1)
        )
        .animation(.easeInOut(duration: 0.3), value: state.mode)
    }

    // MARK: - Status Icon

    @ViewBuilder
    private var statusIcon: some View {
        switch state.mode {
        case .listening:
            ZStack {
                Circle()
                    .fill(Color.red.opacity(0.15))
                Circle()
                    .fill(Color.red.opacity(0.3))
                    .scaleEffect(0.6 + CGFloat(state.audioLevel) * 0.4)
                    .animation(.easeOut(duration: 0.1), value: state.audioLevel)
                Image(systemName: "mic.fill")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(.red)
            }

        case .translating:
            ZStack {
                Circle()
                    .fill(Color.blue.opacity(0.15))
                ProgressView()
                    .controlSize(.small)
                    .scaleEffect(0.8)
            }

        case .success:
            ZStack {
                Circle()
                    .fill(Color.green.opacity(0.15))
                Image(systemName: "checkmark")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(.green)
            }
            .transition(.scale.combined(with: .opacity))

        case .hidden:
            EmptyView()
        }
    }

    // MARK: - Colors

    private var accentColor: Color {
        switch state.mode {
        case .listening: return .red
        case .translating: return .blue
        case .success: return .green
        case .hidden: return .clear
        }
    }

    private var textColor: Color {
        switch state.mode {
        case .listening: return .red
        case .translating: return .secondary
        case .success: return .primary
        case .hidden: return .clear
        }
    }
}

// MARK: - Waveform Animation

struct WaveformView: View {
    let audioLevel: Float
    private let barCount = 20

    var body: some View {
        HStack(spacing: 2) {
            ForEach(0..<barCount, id: \.self) { index in
                RoundedRectangle(cornerRadius: 1.5)
                    .fill(barColor(for: index))
                    .frame(width: 3, height: barHeight(for: index))
                    .animation(.easeOut(duration: 0.08), value: audioLevel)
            }
        }
    }

    private func barHeight(for index: Int) -> CGFloat {
        // Create a wave pattern centered around the middle
        let center = Float(barCount) / 2.0
        let dist = abs(Float(index) - center) / center
        let base: CGFloat = 3
        let amplified = CGFloat(audioLevel) * 20.0 * CGFloat(1.0 - dist * 0.6)
        // Add some randomized "life" to bars near the center
        let jitter = CGFloat.random(in: 0...CGFloat(audioLevel) * 3)
        return max(base, amplified + jitter)
    }

    private func barColor(for index: Int) -> Color {
        let threshold = Float(index) / Float(barCount)
        let active = audioLevel > threshold * 0.5
        return active ? .red : Color.gray.opacity(0.2)
    }
}
