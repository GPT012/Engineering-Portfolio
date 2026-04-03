// ===================================
// ConFluent Swift — Premium Popup System
// A cohesive, Awwwards-level popup framework
// for macOS SwiftUI with 5 purpose-built variants.
//
// Design tokens, animations, and anti-patterns
// are all defined here in one place.
// ===================================

import SwiftUI
import AppKit

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: — DESIGN TOKENS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// Single source of truth for popup appearance.
/// cornerRadius 14 — large enough to feel modern, small enough to avoid iOS vibes.
enum PopupTokens {

    // ── Corner Radius ──
    static let cornerRadius: CGFloat = 14

    // ── Stroke ──
    static let strokeWidth: CGFloat = 0.5
    static let strokeOpacity: Double = 0.18

    // ── Shadow ──
    static let shadowRadius: CGFloat = 30
    static let shadowY: CGFloat = 10
    static let shadowOpacity: Double = 0.35

    // ── Spacing ──
    static let paddingH: CGFloat = 24
    static let paddingV: CGFloat = 22
    static let contentSpacing: CGFloat = 14

    // ── Sizing ──
    static let popupWidth: CGFloat = 360
    static let iconSize: CGFloat = 38
    static let iconCorner: CGFloat = 10

    // ── Typography ──
    static let titleFont: Font = .system(size: 16, weight: .semibold, design: .rounded)
    static let bodyFont: Font = .system(size: 13, weight: .regular)
    static let captionFont: Font = .system(size: 11, weight: .medium)
    static let badgeFont: Font = .system(size: 11, weight: .bold, design: .rounded)

    // ── Semantic Colors ──
    enum Accent {
        static let destructive = Color(red: 0.94, green: 0.27, blue: 0.27)   // #F04545
        static let success     = Color(red: 0.20, green: 0.78, blue: 0.55)   // #34C78C
        static let error       = Color(red: 0.96, green: 0.52, blue: 0.20)   // #F58533
        static let info        = Color(red: 0.30, green: 0.56, blue: 0.96)   // #4D8FF5
        static let neutral     = Color(red: 0.55, green: 0.58, blue: 0.65)   // #8C94A5
    }

    // ── Animation ──
    enum Anim {
        static let enter = Animation.spring(response: 0.38, dampingFraction: 0.72)
        static let exit  = Animation.spring(response: 0.22, dampingFraction: 0.82)
        static let stagger: Double = 0.055
        static let autoDismiss: Double = 2.5
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: — POPUP COORDINATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// Observable coordinator that manages popup presentation.
/// Usage: inject as @Environment and call `.show()` methods.
@MainActor
@Observable
final class PopupCoordinator {

    static let shared = PopupCoordinator()

    // Currently visible popup
    var activePopup: PopupItem?
    var isPresented: Bool { activePopup != nil }

    // ── Convenience presenters ──

    func showDestructive(
        title: String,
        message: String,
        destructiveLabel: String = "Effacer",
        cancelLabel: String = "Annuler",
        onConfirm: @escaping () -> Void
    ) {
        activePopup = .destructive(
            title: title,
            message: message,
            destructiveLabel: destructiveLabel,
            cancelLabel: cancelLabel,
            onConfirm: onConfirm
        )
        haptic(.generic)
    }

    func showSuccess(
        title: String,
        message: String = "",
        autoDismiss: Double = PopupTokens.Anim.autoDismiss
    ) {
        activePopup = .success(title: title, message: message)
        haptic(.alignment)

        DispatchQueue.main.asyncAfter(deadline: .now() + autoDismiss) { [weak self] in
            guard case .success = self?.activePopup else { return }
            self?.dismiss()
        }
    }

    func showError(
        title: String,
        message: String,
        actionLabel: String = "Ouvrir les Préférences",
        onAction: (() -> Void)? = nil
    ) {
        activePopup = .error(
            title: title,
            message: message,
            actionLabel: actionLabel,
            onAction: onAction
        )
        haptic(.levelChange)
    }

    func showOnboarding(
        title: String,
        message: String,
        shortcutSymbols: [String] = ["⌥", "Space"],
        dismissLabel: String = "Compris !"
    ) {
        activePopup = .onboarding(
            title: title,
            message: message,
            shortcutSymbols: shortcutSymbols,
            dismissLabel: dismissLabel
        )
    }

    func showQuickSettings() {
        activePopup = .quickSettings
    }

    func dismiss() {
        withAnimation(PopupTokens.Anim.exit) {
            activePopup = nil
        }
    }

    // ── Haptic Feedback ──
    private func haptic(_ pattern: NSHapticFeedbackManager.FeedbackPattern) {
        guard !NSWorkspace.shared.accessibilityDisplayShouldReduceMotion else { return }
        NSHapticFeedbackManager.defaultPerformer.perform(pattern, performanceTime: .now)
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: — POPUP ITEM ENUM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

enum PopupItem: Identifiable, Equatable {
    case destructive(title: String, message: String, destructiveLabel: String, cancelLabel: String, onConfirm: () -> Void)
    case success(title: String, message: String)
    case error(title: String, message: String, actionLabel: String, onAction: (() -> Void)?)
    case onboarding(title: String, message: String, shortcutSymbols: [String], dismissLabel: String)
    case quickSettings

    var id: String {
        switch self {
        case .destructive: return "destructive"
        case .success:     return "success"
        case .error:       return "error"
        case .onboarding:  return "onboarding"
        case .quickSettings: return "quickSettings"
        }
    }

    static func == (lhs: PopupItem, rhs: PopupItem) -> Bool {
        lhs.id == rhs.id
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: — ROOT OVERLAY (attach to top-level view)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// Attach this as an overlay on your root view.
/// It handles dimming + display of the correct popup variant.
///
/// Usage:
/// ```swift
/// SomeRootView()
///     .overlay { PopupOverlay() }
/// ```
struct PopupOverlay: View {
    var coordinator: PopupCoordinator = .shared
    @State private var appeared = false

    var body: some View {
        ZStack {
            if let popup = coordinator.activePopup {
                // Dimming scrim
                Color.black
                    .opacity(appeared ? 0.35 : 0)
                    .ignoresSafeArea()
                    .onTapGesture {
                        // Only dismiss non-destructive popups on scrim tap
                        if case .destructive = popup { return }
                        coordinator.dismiss()
                    }

                popupContent(for: popup)
                    .transition(
                        .asymmetric(
                            insertion: .scale(scale: 0.88).combined(with: .opacity),
                            removal:   .scale(scale: 0.94).combined(with: .opacity)
                        )
                    )
            }
        }
        .animation(coordinator.isPresented ? PopupTokens.Anim.enter : PopupTokens.Anim.exit, value: coordinator.activePopup?.id)
        .onChange(of: coordinator.isPresented) { _, isPresented in
            withAnimation(isPresented ? PopupTokens.Anim.enter : PopupTokens.Anim.exit) {
                appeared = isPresented
            }
        }
    }

    @ViewBuilder
    private func popupContent(for popup: PopupItem) -> some View {
        switch popup {
        case .destructive(let title, let message, let destructiveLabel, let cancelLabel, let onConfirm):
            DestructivePopup(
                title: title,
                message: message,
                destructiveLabel: destructiveLabel,
                cancelLabel: cancelLabel,
                onConfirm: onConfirm,
                onCancel: { coordinator.dismiss() }
            )

        case .success(let title, let message):
            SuccessPopup(title: title, message: message)

        case .error(let title, let message, let actionLabel, let onAction):
            ErrorPopup(
                title: title,
                message: message,
                actionLabel: actionLabel,
                onAction: {
                    onAction?()
                    coordinator.dismiss()
                },
                onDismiss: { coordinator.dismiss() }
            )

        case .onboarding(let title, let message, let symbols, let dismissLabel):
            OnboardingPopup(
                title: title,
                message: message,
                shortcutSymbols: symbols,
                dismissLabel: dismissLabel,
                onDismiss: { coordinator.dismiss() }
            )

        case .quickSettings:
            QuickSettingsPopup(onDismiss: { coordinator.dismiss() })
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: — SHARED POPUP CHROME (glass card)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// Reusable glass card container for popups.
/// Every popup wraps its content in this.
struct PopupCard<Content: View>: View {
    let accentColor: Color
    let width: CGFloat
    @ViewBuilder let content: () -> Content

    init(
        accent: Color = PopupTokens.Accent.neutral,
        width: CGFloat = PopupTokens.popupWidth,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.accentColor = accent
        self.width = width
        self.content = content
    }

    var body: some View {
        VStack(spacing: 0) {
            content()
        }
        .frame(width: width)
        .background(
            ZStack {
                VisualEffectView(material: .popover, blendingMode: .behindWindow)
                accentColor.opacity(0.04) // ultra-subtle type tint
            }
        )
        .clipShape(RoundedRectangle(cornerRadius: PopupTokens.cornerRadius, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: PopupTokens.cornerRadius, style: .continuous)
                .strokeBorder(
                    LinearGradient(
                        colors: [
                            Color.white.opacity(PopupTokens.strokeOpacity),
                            Color.white.opacity(PopupTokens.strokeOpacity * 0.3)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: PopupTokens.strokeWidth
                )
        )
        .shadow(
            color: .black.opacity(PopupTokens.shadowOpacity),
            radius: PopupTokens.shadowRadius,
            y: PopupTokens.shadowY
        )
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: — POPUP 1 : DESTRUCTIVE CONFIRMATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// - Raisonnement : l'action dangereuse est visuellement secondaire (outline),
///   le bouton Annuler est le chemin naturel du regard (droite, rempli).
/// - Piège : ne jamais mettre le bouton destructif à droite — macOS met l'action
///   par défaut à droite, donc Annuler doit y être pour protéger l'utilisateur.
struct DestructivePopup: View {
    let title: String
    let message: String
    let destructiveLabel: String
    let cancelLabel: String
    let onConfirm: () -> Void
    let onCancel: () -> Void

    @State private var stagger: [Bool] = Array(repeating: false, count: 4)

    var body: some View {
        PopupCard(accent: PopupTokens.Accent.destructive) {
            VStack(spacing: PopupTokens.contentSpacing) {
                // Icon
                RoundedRectangle(cornerRadius: PopupTokens.iconCorner, style: .continuous)
                    .fill(PopupTokens.Accent.destructive.opacity(0.12))
                    .frame(width: PopupTokens.iconSize, height: PopupTokens.iconSize)
                    .overlay(
                        Image(systemName: "trash.fill")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundStyle(PopupTokens.Accent.destructive)
                    )
                    .opacity(stagger[0] ? 1 : 0)
                    .offset(y: stagger[0] ? 0 : 6)

                // Title
                Text(title)
                    .font(PopupTokens.titleFont)
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.center)
                    .opacity(stagger[1] ? 1 : 0)
                    .offset(y: stagger[1] ? 0 : 6)

                // Body
                Text(message)
                    .font(PopupTokens.bodyFont)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(2)
                    .opacity(stagger[2] ? 1 : 0)
                    .offset(y: stagger[2] ? 0 : 6)

                // Buttons — destructive is OUTLINE (left), cancel is FILLED (right)
                HStack(spacing: 10) {
                    // Destructive — intentionally subdued
                    Button(action: onConfirm) {
                        Text(destructiveLabel)
                            .font(PopupTokens.captionFont)
                            .foregroundStyle(PopupTokens.Accent.destructive)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(
                                RoundedRectangle(cornerRadius: 8, style: .continuous)
                                    .strokeBorder(PopupTokens.Accent.destructive.opacity(0.4), lineWidth: 1)
                            )
                    }
                    .buttonStyle(.plain)

                    // Cancel — prominent, natural path
                    Button(action: onCancel) {
                        Text(cancelLabel)
                            .font(PopupTokens.captionFont)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(
                                RoundedRectangle(cornerRadius: 8, style: .continuous)
                                    .fill(Color.primary.opacity(0.75))
                            )
                    }
                    .buttonStyle(.plain)
                    .keyboardShortcut(.cancelAction)
                }
                .opacity(stagger[3] ? 1 : 0)
                .offset(y: stagger[3] ? 0 : 6)
            }
            .padding(.horizontal, PopupTokens.paddingH)
            .padding(.vertical, PopupTokens.paddingV)
        }
        .onAppear { animateStagger() }
    }

    private func animateStagger() {
        for i in stagger.indices {
            withAnimation(PopupTokens.Anim.enter.delay(Double(i) * PopupTokens.Anim.stagger)) {
                stagger[i] = true
            }
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: — POPUP 2 : SUCCESS / POSITIVE FEEDBACK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// - Raisonnement : satisfaction immédiate + disparition élégante.
///   Compact, pas de boutons — l'utilisateur ne doit rien faire.
/// - Piège : ne pas bloquer l'interaction — utiliser `.allowsHitTesting(false)`
///   après affichage pour que l'utilisateur puisse continuer à travailler.
struct SuccessPopup: View {
    let title: String
    let message: String

    @State private var checkScale: CGFloat = 0
    @State private var ringProgress: CGFloat = 0
    @State private var contentOpacity: Double = 0

    var body: some View {
        PopupCard(accent: PopupTokens.Accent.success, width: 280) {
            VStack(spacing: 12) {
                // Animated checkmark with ring
                ZStack {
                    Circle()
                        .trim(from: 0, to: ringProgress)
                        .stroke(
                            PopupTokens.Accent.success.opacity(0.3),
                            style: StrokeStyle(lineWidth: 2, lineCap: .round)
                        )
                        .frame(width: 40, height: 40)
                        .rotationEffect(.degrees(-90))

                    Image(systemName: "checkmark")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(PopupTokens.Accent.success)
                        .scaleEffect(checkScale)
                }

                Text(title)
                    .font(PopupTokens.titleFont)
                    .foregroundStyle(.primary)
                    .opacity(contentOpacity)

                if !message.isEmpty {
                    Text(message)
                        .font(PopupTokens.bodyFont)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .opacity(contentOpacity)
                }
            }
            .padding(.horizontal, PopupTokens.paddingH)
            .padding(.vertical, PopupTokens.paddingV)
        }
        .allowsHitTesting(false) // Don't block interaction
        .onAppear {
            withAnimation(.spring(response: 0.45, dampingFraction: 0.55)) {
                checkScale = 1.0
            }
            withAnimation(.easeOut(duration: 0.8).delay(0.1)) {
                ringProgress = 1.0
            }
            withAnimation(PopupTokens.Anim.enter.delay(0.12)) {
                contentOpacity = 1.0
            }
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: — POPUP 3 : ERROR / PERMISSION DENIED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// - Raisonnement : communiquer l'urgence sans paniquer. L'icône orange (pas rouge)
///   et un bouton d'action directe orientent l'utilisateur vers la résolution.
/// - Piège : ne jamais utiliser du rouge vif pour les erreurs récupérables —
///   le rouge = données perdues. L'orange = action requise.
struct ErrorPopup: View {
    let title: String
    let message: String
    let actionLabel: String
    let onAction: () -> Void
    let onDismiss: () -> Void

    @State private var stagger: [Bool] = Array(repeating: false, count: 4)
    @State private var iconPulse = false

    var body: some View {
        PopupCard(accent: PopupTokens.Accent.error) {
            VStack(spacing: PopupTokens.contentSpacing) {
                // Pulsing warning icon
                RoundedRectangle(cornerRadius: PopupTokens.iconCorner, style: .continuous)
                    .fill(PopupTokens.Accent.error.opacity(0.12))
                    .frame(width: PopupTokens.iconSize, height: PopupTokens.iconSize)
                    .overlay(
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundStyle(PopupTokens.Accent.error)
                            .scaleEffect(iconPulse ? 1.08 : 1.0)
                            .animation(
                                .easeInOut(duration: 1.2).repeatForever(autoreverses: true),
                                value: iconPulse
                            )
                    )
                    .opacity(stagger[0] ? 1 : 0)
                    .offset(y: stagger[0] ? 0 : 6)

                Text(title)
                    .font(PopupTokens.titleFont)
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.center)
                    .opacity(stagger[1] ? 1 : 0)
                    .offset(y: stagger[1] ? 0 : 6)

                Text(message)
                    .font(PopupTokens.bodyFont)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(2)
                    .opacity(stagger[2] ? 1 : 0)
                    .offset(y: stagger[2] ? 0 : 6)

                // Buttons
                HStack(spacing: 10) {
                    Button(action: onDismiss) {
                        Text("Fermer")
                            .font(PopupTokens.captionFont)
                            .foregroundStyle(.secondary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(
                                RoundedRectangle(cornerRadius: 8, style: .continuous)
                                    .fill(Color.primary.opacity(0.06))
                            )
                    }
                    .buttonStyle(.plain)
                    .keyboardShortcut(.cancelAction)

                    Button(action: onAction) {
                        Text(actionLabel)
                            .font(PopupTokens.captionFont)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(
                                RoundedRectangle(cornerRadius: 8, style: .continuous)
                                    .fill(PopupTokens.Accent.error)
                            )
                    }
                    .buttonStyle(.plain)
                    .keyboardShortcut(.defaultAction)
                }
                .opacity(stagger[3] ? 1 : 0)
                .offset(y: stagger[3] ? 0 : 6)
            }
            .padding(.horizontal, PopupTokens.paddingH)
            .padding(.vertical, PopupTokens.paddingV)
        }
        .onAppear {
            animateStagger()
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { iconPulse = true }
        }
    }

    private func animateStagger() {
        for i in stagger.indices {
            withAnimation(PopupTokens.Anim.enter.delay(Double(i) * PopupTokens.Anim.stagger)) {
                stagger[i] = true
            }
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: — POPUP 4 : ONBOARDING / FIRST LAUNCH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// - Raisonnement : pédagogique et mémorable. L'animation du raccourci clavier
///   crée un souvenir musculaire visuel. Le style "key cap" renforce la compréhension.
/// - Piège : ne pas surcharger d'informations — un seul concept par onboarding popup.
struct OnboardingPopup: View {
    let title: String
    let message: String
    let shortcutSymbols: [String]
    let dismissLabel: String
    let onDismiss: () -> Void

    @State private var stagger: [Bool] = Array(repeating: false, count: 4)
    @State private var keysPressed: [Bool] = []
    @State private var shimmer = false

    var body: some View {
        PopupCard(accent: PopupTokens.Accent.info, width: 380) {
            VStack(spacing: PopupTokens.contentSpacing + 4) {
                // Title with sparkle
                HStack(spacing: 8) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(PopupTokens.Accent.info)

                    Text(title)
                        .font(PopupTokens.titleFont)
                        .foregroundStyle(.primary)
                }
                .opacity(stagger[0] ? 1 : 0)
                .offset(y: stagger[0] ? 0 : 6)

                // Message
                Text(message)
                    .font(PopupTokens.bodyFont)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(2)
                    .opacity(stagger[1] ? 1 : 0)
                    .offset(y: stagger[1] ? 0 : 6)

                // Animated keyboard shortcut
                HStack(spacing: 6) {
                    ForEach(Array(shortcutSymbols.enumerated()), id: \.offset) { index, symbol in
                        OnboardingKeyCap(
                            symbol: symbol,
                            isPressed: index < keysPressed.count ? keysPressed[index] : false,
                            accentColor: PopupTokens.Accent.info
                        )

                        if index < shortcutSymbols.count - 1 {
                            Text("+")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundStyle(.tertiary)
                        }
                    }
                }
                .padding(.vertical, 8)
                .opacity(stagger[2] ? 1 : 0)
                .offset(y: stagger[2] ? 0 : 6)

                // Dismiss button
                Button(action: onDismiss) {
                    Text(dismissLabel)
                        .font(PopupTokens.captionFont)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 28)
                        .padding(.vertical, 10)
                        .background(
                            Capsule()
                                .fill(PopupTokens.Accent.info)
                                .overlay(
                                    Capsule()
                                        .fill(
                                            LinearGradient(
                                                colors: [.white.opacity(0.15), .clear],
                                                startPoint: .top,
                                                endPoint: .bottom
                                            )
                                        )
                                )
                        )
                }
                .buttonStyle(.plain)
                .keyboardShortcut(.defaultAction)
                .opacity(stagger[3] ? 1 : 0)
                .offset(y: stagger[3] ? 0 : 6)
            }
            .padding(.horizontal, PopupTokens.paddingH)
            .padding(.vertical, PopupTokens.paddingV + 4)
        }
        .onAppear {
            keysPressed = Array(repeating: false, count: shortcutSymbols.count)
            animateStagger()
            animateKeys()
        }
    }

    private func animateStagger() {
        for i in stagger.indices {
            withAnimation(PopupTokens.Anim.enter.delay(Double(i) * PopupTokens.Anim.stagger)) {
                stagger[i] = true
            }
        }
    }

    private func animateKeys() {
        // Simulate pressing keys one by one
        for i in shortcutSymbols.indices {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.6 + Double(i) * 0.25) {
                withAnimation(.spring(response: 0.2, dampingFraction: 0.5)) {
                    if i < keysPressed.count { keysPressed[i] = true }
                }
            }
        }
        // Release after a beat
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) {
            withAnimation(.easeOut(duration: 0.3)) {
                for i in keysPressed.indices { keysPressed[i] = false }
            }
            // Repeat
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                animateKeys()
            }
        }
    }
}

/// A physical-looking key cap view.
struct OnboardingKeyCap: View {
    let symbol: String
    let isPressed: Bool
    let accentColor: Color

    var body: some View {
        Text(symbol)
            .font(.system(size: symbol.count > 2 ? 13 : 16, weight: .semibold, design: .rounded))
            .foregroundStyle(isPressed ? .white : .primary)
            .frame(minWidth: symbol.count > 2 ? 60 : 40, minHeight: 36)
            .background(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(isPressed ? accentColor : Color.primary.opacity(0.06))
                    .shadow(
                        color: isPressed ? accentColor.opacity(0.3) : .black.opacity(0.08),
                        radius: isPressed ? 8 : 2,
                        y: isPressed ? 0 : 2
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .strokeBorder(
                        isPressed ? accentColor.opacity(0.5) : Color.primary.opacity(0.12),
                        lineWidth: 0.8
                    )
            )
            .offset(y: isPressed ? 1 : 0) // physical press effect
            .animation(.spring(response: 0.2, dampingFraction: 0.5), value: isPressed)
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK: — POPUP 5 : QUICK SETTINGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// - Raisonnement : efficacité max. Pas de titre lourd, juste des contrôles denses
///   et bien organisés. Le style "control center" de macOS/iOS est la référence.
/// - Piège : ne pas oublier de synchroniser avec AppState — les changements
///   doivent être instantanés et persistés.
struct QuickSettingsPopup: View {
    @Environment(AppState.self) private var appState
    let onDismiss: () -> Void

    @State private var appeared = false

    var body: some View {
        @Bindable var appState = appState

        PopupCard(accent: PopupTokens.Accent.neutral, width: 300) {
            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("Réglages rapides")
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .foregroundStyle(.primary)

                    Spacer()

                    Button(action: onDismiss) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 16))
                            .foregroundStyle(.tertiary)
                    }
                    .buttonStyle(.plain)
                    .keyboardShortcut(.cancelAction)
                }
                .padding(.horizontal, 18)
                .padding(.top, 16)
                .padding(.bottom, 12)

                Divider().opacity(0.3)

                // Language selector
                VStack(spacing: 0) {
                    quickSettingsRow(
                        icon: "globe",
                        label: "Langue de traduction",
                        delay: 0
                    ) {
                        Picker("", selection: $appState.targetLang) {
                            ForEach(Language.all) { lang in
                                Text("\(lang.flag) \(lang.id.uppercased())").tag(lang.id)
                            }
                        }
                        .labelsHidden()
                        .frame(width: 80)
                    }

                    Divider().padding(.leading, 44).opacity(0.15)

                    // Speech language
                    quickSettingsRow(
                        icon: "mic.fill",
                        label: "Langue dictée",
                        delay: 1
                    ) {
                        Picker("", selection: $appState.dictationLang) {
                            ForEach(SpeechLanguage.all) { lang in
                                Text(lang.name).tag(lang.id)
                            }
                        }
                        .labelsHidden()
                        .frame(width: 100)
                    }

                    Divider().padding(.leading, 44).opacity(0.15)

                    // Overlay style toggle
                    quickSettingsRow(
                        icon: "waveform",
                        label: "Style overlay",
                        delay: 2
                    ) {
                        Picker("", selection: $appState.dictationStyle) {
                            ForEach(RecordingStyle.allCases) { style in
                                Text(style == .capsule ? "Capsule" : "Waveform").tag(style)
                            }
                        }
                        .labelsHidden()
                        .pickerStyle(.segmented)
                        .frame(width: 130)
                    }

                    Divider().padding(.leading, 44).opacity(0.15)

                    // Current shortcut display
                    quickSettingsRow(
                        icon: "keyboard",
                        label: "Raccourci",
                        delay: 3
                    ) {
                        Text(appState.dictationShortcutLabel)
                            .font(.system(size: 12, weight: .semibold, design: .monospaced))
                            .foregroundStyle(.secondary)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(
                                RoundedRectangle(cornerRadius: 6)
                                    .fill(Color.primary.opacity(0.06))
                            )
                    }
                }

                Divider().opacity(0.3)

                // Translation active toggle
                HStack {
                    Image(systemName: appState.isEnabled ? "checkmark.circle.fill" : "pause.circle")
                        .foregroundStyle(appState.isEnabled ? DesignSystem.Colors.primary : .secondary)
                        .font(.system(size: 14))

                    Text("Traduction active")
                        .font(.system(size: 12, weight: .medium))

                    Spacer()

                    Toggle("", isOn: $appState.isEnabled)
                        .toggleStyle(.switch)
                        .controlSize(.mini)
                }
                .padding(.horizontal, 18)
                .padding(.vertical, 12)
            }
        }
    }

    private func quickSettingsRow<Trailing: View>(
        icon: String,
        label: String,
        delay: Int,
        @ViewBuilder trailing: @escaping () -> Trailing
    ) -> some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(.secondary)
                .frame(width: 20)

            Text(label)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(.primary)

            Spacer()

            trailing()
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 10)
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : 4)
        .onAppear {
            withAnimation(PopupTokens.Anim.enter.delay(Double(delay) * PopupTokens.Anim.stagger)) {
                appeared = true
            }
        }
    }
}
