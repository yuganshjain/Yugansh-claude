import SwiftUI
import SwiftData

struct QuizView: View {
    let passage: Passage
    let focusSeconds: Int

    @Environment(\.modelContext) private var modelContext
    @State private var questions: [QuizQuestion] = []
    @State private var currentIndex = 0
    @State private var score = 0
    @State private var loading = true
    @State private var done = false
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if loading {
                    VStack(spacing: 16) {
                        ProgressView().tint(Theme.saffron)
                        Text("Generating questions\u{2026}")
                            .font(.system(size: 14))
                            .foregroundStyle(Theme.brownMuted)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, 60)
                } else if done {
                    resultView
                } else if let msg = errorMessage {
                    VStack(spacing: 12) {
                        Text("Couldn\u{2019}t generate questions")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(Theme.brown)
                        Text(msg).font(.system(size: 13)).foregroundStyle(Theme.brownMuted)
                        Button("Try again") { Task { await loadQuiz() } }
                            .foregroundStyle(Theme.saffron)
                    }
                } else if !questions.isEmpty {
                    Text("Did you really read it?")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundStyle(Theme.brown)
                    Text("Answer to complete your session")
                        .font(.system(size: 14))
                        .foregroundStyle(Theme.brownMuted)
                    QuizQuestionView(
                        question: questions[currentIndex],
                        questionNumber: currentIndex + 1,
                        total: questions.count,
                        onAnswer: handleAnswer
                    )
                }
            }
            .padding(20)
        }
        .background(Theme.cream.ignoresSafeArea())
        .navigationTitle("Comprehension")
        .navigationBarTitleDisplayMode(.inline)
        .task { await loadQuiz() }
    }

    private var resultView: some View {
        let passed = score >= 2
        return VStack(spacing: 20) {
            Text(passed ? "\u{1F31F}" : "\u{1F4D6}")
                .font(.system(size: 60))
            Text(passed ? "Session Complete!" : "Keep Practicing")
                .font(.system(size: 24, weight: .bold))
                .foregroundStyle(Theme.brown)
            Text("You scored \(score)/\(questions.count)")
                .font(.system(size: 16))
                .foregroundStyle(Theme.brownMuted)
            if !passed {
                Text("Re-reading will deepen your understanding.")
                    .font(.system(size: 14))
                    .foregroundStyle(Theme.brownMuted)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 40)
    }

    private func handleAnswer(_ correct: Bool) {
        let newScore = correct ? score + 1 : score
        if currentIndex + 1 >= questions.count {
            let completed = newScore >= 2
            let session = FocusSession(
                passageId: passage.id,
                focusSeconds: focusSeconds,
                quizScore: newScore,
                completed: completed
            )
            modelContext.insert(session)
            score = newScore
            done = true
        } else {
            score = newScore
            currentIndex += 1
        }
    }

    private func loadQuiz() async {
        loading = true
        errorMessage = nil
        let descriptor = FetchDescriptor<QuizCache>(
            predicate: #Predicate { $0.passageId == passage.id }
        )
        if let cached = try? modelContext.fetch(descriptor).first,
           let qs = try? cached.questions(), !qs.isEmpty {
            questions = qs
            loading = false
            return
        }
        do {
            let qs = try await ClaudeService.shared.generateQuiz(for: passage)
            if let cache = try? QuizCache(passageId: passage.id, questions: qs) {
                modelContext.insert(cache)
            }
            questions = qs
        } catch {
            errorMessage = error.localizedDescription
        }
        loading = false
    }
}
