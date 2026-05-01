import SwiftUI

struct ReadingView: View {
    let passageId: String

    @State private var scrollProgress: CGFloat = 0
    @State private var navigateToQuiz = false

    private var passage: Passage? { PassageStore.shared.passage(byId: passageId) }
    private var canFinish: Bool { scrollProgress >= 0.6 }

    var body: some View {
        Group {
            if let passage {
                content(passage)
            } else {
                Text("Passage not found").foregroundStyle(Theme.brownMuted)
            }
        }
        .navigationDestination(isPresented: $navigateToQuiz) {
            if let passage {
                QuizView(passage: passage)
            }
        }
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
                        .foregroundStyle(Theme.brownMuted)
                        .padding(.top, 8)

                    Text("Read carefully \u{2014} you\u{2019}ll answer 3 questions after")
                        .font(.system(size: 12))
                        .foregroundStyle(Theme.brownMuted)

                    VStack(alignment: .leading, spacing: 16) {
                        ForEach(passage.body.components(separatedBy: "\n\n"), id: \.self) { para in
                            Text(para)
                                .font(.system(size: 17, design: .serif))
                                .foregroundStyle(Theme.brown)
                                .lineSpacing(6)
                        }
                    }

                    Button(action: { navigateToQuiz = true }) {
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
            .background(Theme.cream)
        }
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .background(Theme.cream.ignoresSafeArea())
    }

    private func updateProgress(_ geo: GeometryProxy) {
        let frame = geo.frame(in: .global)
        let screenHeight = UIScreen.main.bounds.height
        let contentHeight = frame.height
        // If content fits on screen, no scrolling needed — unlock immediately
        guard contentHeight > screenHeight else {
            scrollProgress = 1.0
            return
        }
        let scrolled = max(0, -frame.minY)
        let maxScroll = contentHeight - screenHeight
        scrollProgress = min(1, scrolled / maxScroll)
    }
}
