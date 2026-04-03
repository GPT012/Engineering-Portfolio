import SwiftUI
import AppKit

// MARK: - Style selector
enum RecordingStyle: String, CaseIterable, Identifiable {
    case capsule     // Style 1 : capsule compacte style Dynamic Island
    case waveform    // Style 2 : panneau waveform style SuperWhisper

    var id: String { rawValue }

    var label: String {
        switch self {
        case .capsule: return "Capsule (Dynamic Island)"
        case .waveform: return "Waveform (Superwhisper)"
        }
    }
}

// MARK: - Overlay Panel (NSPanel wrapper)
@MainActor
final class DictationOverlayPanel {
    private var panel: NSPanel?
    private let overlayState = OverlayState()

    // MARK: - Show / Update / Dismiss

    func showListening() {
        overlayState.mode = .listening
        showPanel()
    }

    func updateAudioLevel(_ level: Float) {
        overlayState.audioLevel = level
    }

    func showTranslating() {
        overlayState.mode = .translating
    }

    func showSuccess(_ translatedText: String) {
        overlayState.mode = .success
        overlayState.text = translatedText

        // Auto-dismiss after short delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { [weak self] in
            guard self?.overlayState.mode == .success else { return }
            self?.dismiss()
        }
    }

    func dismiss() {
        overlayState.mode = .hidden
        // Wait for SwiftUI disappear animation to finish before ordering out window
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
            self?.panel?.orderOut(nil)
            self?.panel = nil
        }
    }

    // MARK: - Panel Setup

    private func showPanel() {
        let style = AppState.shared.dictationStyle
        overlayState.style = style
        
        if panel == nil {
            let hostView = NSHostingView(rootView: RecordingOverlay(state: overlayState))
            let p = NSPanel(
                contentRect: .zero,
                styleMask: [.borderless, .nonactivatingPanel],
                backing: .buffered,
                defer: false
            )
            p.isOpaque = false
            p.backgroundColor = .clear
            p.hasShadow = false
            p.level = .floating
            p.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
            p.isMovableByWindowBackground = true
            p.hidesOnDeactivate = false
            p.ignoresMouseEvents = true // Let clicks pass through if the user clicks the invisible margins
            p.contentView = hostView
            p.alphaValue = 0
            panel = p
        }
        
        guard let p = panel else { return }
        
        // Adjust bounds depending on style
        if style == .capsule {
            let panelWidth: CGFloat = 160
            let panelHeight: CGFloat = 80
            p.setContentSize(NSSize(width: panelWidth, height: panelHeight))
            if let screen = NSScreen.main {
                let x = screen.visibleFrame.midX - panelWidth / 2
                let y = screen.visibleFrame.maxY - panelHeight + 5 // right below menu bar
                p.setFrameOrigin(NSPoint(x: x, y: y))
            }
        } else {
            let panelWidth: CGFloat = 520
            let panelHeight: CGFloat = 200
            p.setContentSize(NSSize(width: panelWidth, height: panelHeight))
            if let screen = NSScreen.main {
                let x = screen.visibleFrame.midX - panelWidth / 2
                let y = screen.visibleFrame.minY + 60 // Lower-middle of the screen
                p.setFrameOrigin(NSPoint(x: x, y: y))
            }
        }

        if p.alphaValue == 0 {
            p.orderFront(nil)
            NSAnimationContext.runAnimationGroup { context in
                context.duration = 0.2
                p.animator().alphaValue = 1.0
            }
        }
    }
}

// MARK: - Observable State

@Observable
final class OverlayState {
    var mode: OverlayMode = .hidden
    var text: String = ""
    var style: RecordingStyle = .waveform
    var audioLevel: Float = 0.0
}

enum OverlayMode: Equatable {
    case hidden
    case listening
    case translating
    case success
}

// MARK: - Overlay unifié — choisir le style

struct RecordingOverlay: View {
    var state: OverlayState

    var body: some View {
        ZStack {
            if state.mode != .hidden {
                switch state.style {
                case .capsule:
                    VStack {
                        CapsuleIndicator(mode: state.mode, state: state)
                            .padding(.top, 12)
                            .transition(.scale(scale: 0.8).combined(with: .opacity).combined(with: .offset(y: -20)))
                        Spacer()
                    }
                case .waveform:
                    VStack {
                        Spacer()
                        WaveformIndicator(mode: state.mode, state: state, successText: state.text)
                            .padding(.bottom, 24)
                            .transition(.scale(scale: 0.9).combined(with: .opacity).combined(with: .offset(y: 20)))
                    }
                    .padding(.horizontal, 24)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .allowsHitTesting(false)
        .animation(.spring(response: 0.42, dampingFraction: 0.68), value: state.mode)
    }
}

// MARK: ─────────────────────────────────────────
// MARK: STYLE 1 — Capsule compacte (Dynamic Island)
// MARK: ─────────────────────────────────────────

struct CapsuleIndicator: View {
    let mode: OverlayMode
    let state: OverlayState

    @State private var bars: [CGFloat] = [0.3, 0.6, 1.0, 0.6, 0.3]
    @State private var timer: Timer?

    private let barCount = 5

    var body: some View {
        ZStack {
            Capsule()
                .fill(.black.opacity(0.88))
                .frame(width: mode == .success || mode == .translating ? 44 : 72, height: 28)
                .overlay(
                    Capsule()
                        .strokeBorder(
                            LinearGradient(
                                colors: [.white.opacity(0.18), .white.opacity(0.04)],
                                startPoint: .top,
                                endPoint: .bottom
                            ),
                            lineWidth: 0.5
                        )
                )
                .shadow(color: .black.opacity(0.5), radius: 16, y: 6)

            if mode == .listening {
                HStack(spacing: 3.5) {
                    ForEach(0..<barCount, id: \.self) { i in
                        Capsule()
                            .fill(.white)
                            .frame(width: 3, height: max(3, bars[i] * 16))
                            .animation(.spring(response: 0.18, dampingFraction: 0.5), value: bars[i])
                    }
                }
            } else if mode == .translating {
                ProgressView()
                    .controlSize(.small)
                    .tint(.white)
            } else if mode == .success {
                Image(systemName: "checkmark")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(.green)
            }
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.62), value: mode)
        .onChange(of: mode) { newMode in
            if newMode == .listening {
                startBars()
            } else {
                stopBars()
            }
        }
        .onAppear {
            if mode == .listening { startBars() }
        }
        .onDisappear {
            stopBars()
        }
    }

    private func startBars() {
        timer?.invalidate()
        let liveState = state // capture the reference (class), not value
        timer = Timer.scheduledTimer(withTimeInterval: 0.11, repeats: true) { _ in
            let level = liveState.audioLevel
            let base = CGFloat(level) * 2.5
            let noiseIntensity = max(0.08, base)
            
            bars[0] = base + .random(in: 0...(0.3 * noiseIntensity))
            bars[1] = base + .random(in: 0...(0.6 * noiseIntensity))
            bars[2] = base + .random(in: 0...(1.0 * noiseIntensity))
            bars[3] = base + .random(in: 0...(0.6 * noiseIntensity))
            bars[4] = base + .random(in: 0...(0.3 * noiseIntensity))

            for i in 0..<5 {
                bars[i] = min(max(bars[i], 0.15), 1.0)
            }
            
            // If it's very quiet, stay mostly flat
            if level < 0.02 {
                bars = [0.15, 0.18, 0.22, 0.18, 0.15]
            }
        }
        RunLoop.main.add(timer!, forMode: .common)
    }

    private func stopBars() {
        timer?.invalidate(); timer = nil
        withAnimation(.easeOut(duration: 0.25)) {
            bars = [0.3, 0.6, 1.0, 0.6, 0.3]
        }
    }
}

// MARK: ─────────────────────────────────────────
// MARK: STYLE 2 — Panneau Waveform (SuperWhisper)
// MARK: ─────────────────────────────────────────

struct WaveformIndicator: View {
    let mode: OverlayMode
    let state: OverlayState
    let successText: String

    // 60 barres pour un rendu dense comme SuperWhisper
    private let barCount = 60
    @State private var amplitudes: [CGFloat] = Array(repeating: 0.08, count: 60)
    @State private var timer: Timer?

    // Palette : fond slate foncé, barres blanc nacré
    private let bgColor   = Color(red: 0.13, green: 0.15, blue: 0.20)
    private let barColor  = Color(red: 0.92, green: 0.92, blue: 0.95)

    var body: some View {
        VStack(spacing: 0) {
            // ── Zone waveform ou statut ──
            ZStack {
                if mode == .listening {
                    waveformZone
                } else if mode == .translating {
                    HStack(spacing: 12) {
                        ProgressView()
                            .controlSize(.regular)
                            .tint(.white)
                        Text("Translating...")
                            .font(.system(size: 16, weight: .medium, design: .rounded))
                            .foregroundStyle(.white)
                    }
                } else if mode == .success {
                    HStack(spacing: 12) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 20))
                            .foregroundStyle(.green)
                        Text(successText.isEmpty ? "Success" : successText)
                            .lineLimit(2)
                            .truncationMode(.tail)
                            .font(.system(size: 16, weight: .medium, design: .rounded))
                            .foregroundStyle(.white)
                    }
                    .padding(.horizontal, 24)
                }
            }
            .frame(height: 90)

            Divider()
                .background(Color.white.opacity(0.08))

            // ── Barre de contrôles ──
            controlBar
                .frame(height: 44)
        }
        .frame(width: 480)
        .background(
            RoundedRectangle(cornerRadius: 18)
                .fill(bgColor)
                .overlay(
                    RoundedRectangle(cornerRadius: 18)
                        .strokeBorder(Color.white.opacity(0.10), lineWidth: 0.8)
                )
        )
        .shadow(color: .black.opacity(0.55), radius: 32, y: 12)
        .animation(.spring(response: 0.42, dampingFraction: 0.70), value: mode)
        .onChange(of: mode) { newMode in
            if newMode == .listening {
                startWave()
            } else {
                stopWave()
            }
        }
        .onAppear {
            if mode == .listening { startWave() }
        }
        .onDisappear {
            stopWave()
        }
    }

    // ── Waveform canvas ──
    private var waveformZone: some View {
        GeometryReader { geo in
            HStack(alignment: .center, spacing: 1.5) {
                ForEach(0..<barCount, id: \.self) { i in
                    let amp = amplitudes[i]
                    Capsule()
                        .fill(
                            LinearGradient(
                                colors: [
                                    barColor.opacity(0.55 + amp * 0.45),
                                    barColor.opacity(0.25 + amp * 0.30)
                                ],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .frame(
                            width: barWidth(totalWidth: geo.size.width),
                            height: max(3, amp * (geo.size.height - 20))
                        )
                        .animation(.spring(response: 0.14, dampingFraction: 0.52), value: amp)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(.horizontal, 16)
        }
    }

    // ── Barre stop / cancel ──
    private var controlBar: some View {
        HStack(spacing: 0) {
            // Icône logo (triangle comme SuperWhisper)
            Image(systemName: "triangle.fill")
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(.white.opacity(0.5))
                .frame(width: 44)

            Spacer()

            // Stop ⌥ Space
            HStack(spacing: 6) {
                Text("Stop")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(.white.opacity(0.75))

                KeyBadge(symbol: "⌥", wide: false)
                KeyBadge(symbol: "Space", wide: true)
            }

            // Séparateur
            Rectangle()
                .fill(Color.white.opacity(0.10))
                .frame(width: 1, height: 20)
                .padding(.horizontal, 16)

            // Cancel esc
            HStack(spacing: 6) {
                Text("Cancel")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(.white.opacity(0.75))

                KeyBadge(symbol: "esc", wide: true)
            }

            Spacer().frame(width: 16)
        }
        .padding(.horizontal, 4)
    }

    private func barWidth(totalWidth: CGFloat) -> CGFloat {
        let spacing = CGFloat(barCount - 1) * 1.5
        let horizontal: CGFloat = 32
        return max(2, (totalWidth - spacing - horizontal) / CGFloat(barCount))
    }

    // ── Animation ──
    private func startWave() {
        timer?.invalidate()
        let liveState = state // capture the reference (class), not value
        timer = Timer.scheduledTimer(withTimeInterval: 0.06, repeats: true) { _ in
            let level = liveState.audioLevel
            let center = Double(barCount) / 2
            let baseLevel = Double(level) * 2.0
            let noiseIntensity = max(0.08, baseLevel)
            
            for i in 0..<barCount {
                let dist = abs(Double(i) - center) / center
                let envelope = 1.0 - dist * 0.5
                let noise = Double.random(in: 0.0...1.0)
                
                var amp = (envelope * noise * noiseIntensity * 0.85) + 0.08
                if baseLevel < 0.02 {
                    amp = (envelope * noise * 0.05) + 0.08
                }
                amplitudes[i] = CGFloat(min(max(amp, 0.08), 1.0))
            }
        }
        RunLoop.main.add(timer!, forMode: .common)
    }

    private func stopWave() {
        timer?.invalidate(); timer = nil
        withAnimation(.easeOut(duration: 0.4)) {
            amplitudes = Array(repeating: 0.08, count: barCount)
        }
    }
}

// MARK: - Badge touche clavier
struct KeyBadge: View {
    let symbol: String
    let wide: Bool

    var body: some View {
        Text(symbol)
            .font(.system(size: 11, weight: .semibold, design: .rounded))
            .foregroundStyle(.white.opacity(0.90))
            .padding(.horizontal, wide ? 8 : 6)
            .padding(.vertical, 3)
            .background(
                RoundedRectangle(cornerRadius: 5)
                    .fill(Color.white.opacity(0.14))
                    .overlay(
                        RoundedRectangle(cornerRadius: 5)
                            .strokeBorder(Color.white.opacity(0.18), lineWidth: 0.6)
                    )
            )
    }
}
