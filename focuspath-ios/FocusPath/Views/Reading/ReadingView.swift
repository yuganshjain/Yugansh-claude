import SwiftUI
import SwiftData

struct ReadingView: View {
    let passageId: String

    @Environment(\.modelContext) private var modelContext
    @State private var scrollProgress: CGFloat = 0
    @State private var done = false
    @State private var xpEarned = 0

    private var passage: Passage? { PassageStore.shared.passage(byId: passageId) }
    private var canFinish: Bool { scrollProgress >= 0.6 }

    var body: some View {
        Group {
            if let passage {
                if done {
                    completionView(passage)
                } else {
                    content(passage)
                }
            } else {
                Text("Passage not found").foregroundStyle(Theme.textMuted)
            }
        }
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .background(Theme.background.ignoresSafeArea())
    }

    @ViewBuilder
    private func content(_ passage: Passage) -> some View {
        ZStack(alignment: .top) {
            GeometryReader { geo in
                Rectangle()
                    .fill(Theme.border)
                    .frame(height: 3)
                Rectangle()
                    .fill(Theme.saffronGradient)
                    .frame(width: geo.size.width * scrollProgress, height: 3)
            }
            .frame(height: 3)
            .ignoresSafeArea(edges: .top)

            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("\(passage.source) \u{00B7} \(passage.work)")
                        .font(.system(size: 12, weight: .bold))
                        .tracking(1.5)
                        .foregroundStyle(Theme.textMuted)
                        .padding(.top, 8)

                    VStack(alignment: .leading, spacing: 16) {
                        ForEach(passage.body.components(separatedBy: "\n\n"), id: \.self) { para in
                            Text(para)
                                .font(.system(size: 17, design: .serif))
                                .foregroundStyle(Theme.text)
                                .lineSpacing(6)
                        }
                    }

                    Button(action: { finishReading(passage) }) {
                        HStack {
                            Spacer()
                            Text(canFinish
                                 ? "I\u{2019}ve finished reading \u{2192}"
                                 : "Scroll to read more\u{2026}")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundStyle(.white)
                            Spacer()
                        }
                        .padding(.vertical, 16)
                        .background(canFinish ? Theme.saffron : Theme.border)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                    .disabled(!canFinish)
                    .padding(.bottom, 20)
                }
                .padding(20)
                .background(
                    GeometryReader { geo -> Color in
                        DispatchQueue.main.async { updateProgress(geo) }
                        return Color.clear
                    }
                )
            }
            .background(Theme.background)
        }
    }

    @ViewBuilder
    private func completionView(_ passage: Passage) -> some View {
        let level = XPSystem.currentLevel(for: xpEarned)
        ScrollView {
            VStack(spacing: 28) {
                Spacer().frame(height: 20)

                Text(level.emoji)
                    .font(.system(size: 72))

                VStack(spacing: 8) {
                    Text("Session Complete")
                        .font(.system(size: 28, weight: .black))
                        .foregroundStyle(Theme.text)
                    Text("\(passage.source) \u{00B7} \(passage.work)")
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.textMuted)
                }

                VStack(spacing: 6) {
                    Text("+\(xpEarned) XP")
                        .font(.system(size: 42, weight: .black))
                        .foregroundStyle(Theme.saffron)
                    Text("Come back tomorrow for a new passage")
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.textMuted)
                        .multilineTextAlignment(.center)
                }
                .padding(20)
                .frame(maxWidth: .infinity)
                .background(Theme.surface)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.border, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 16))

                Text("\u{201C}\(passage.quote)\u{201D}")
                    .font(.system(size: 16, design: .serif))
                    .foregroundStyle(Theme.text)
                    .lineSpacing(5)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 8)
            }
            .padding(24)
        }
        .background(Theme.background.ignoresSafeArea())
    }

    private func finishReading(_ passage: Passage) {
        let earned = XPSystem.xpFor(passage: passage)
        let session = FocusSession(
            passageId: passage.id,
            xpEarned: earned,
            completed: true
        )
        modelContext.insert(session)
        xpEarned = earned
        done = true
    }

    private func updateProgress(_ geo: GeometryProxy) {
        let frame = geo.frame(in: .global)
        let screenHeight = UIScreen.main.bounds.height
        let contentHeight = frame.height
        guard contentHeight > screenHeight else {
            scrollProgress = 1.0
            return
        }
        let scrolled = max(0, -frame.minY)
        let maxScroll = contentHeight - screenHeight
        scrollProgress = min(1, scrolled / maxScroll)
    }
}
