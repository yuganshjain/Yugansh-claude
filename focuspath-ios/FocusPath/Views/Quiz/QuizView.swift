import SwiftUI
import SwiftData

struct QuizView: View {
    let passage: Passage

    @Environment(\.modelContext) private var modelContext
    @State private var questions: [QuizQuestion] = []
    @State private var currentIndex = 0
    @State private var score = 0
    @State private var loading = true
    @State private var done = false
    @State private var xpEarned = 0
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if loading {
                    VStack(spacing: 16) {
                        ProgressView().tint(Theme.saffron)
                        Text("Preparing your comprehension check\u{2026}")
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
                    Text("Answer 3 questions to complete your session")
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
        let level = XPSystem.currentLevel(for: xpEarned)
        return VStack(spacing: 24) {
            Text(passed ? level.emoji : "\u{1F4D6}")
                .font(.system(size: 64))

            VStack(spacing: 6) {
                Text(passed ? "Session Complete!" : "Keep Going")
                    .font(.system(size: 26, weight: .black))
                    .foregroundStyle(Theme.brown)
                Text("You scored \(score)/\(questions.count)")
                    .font(.system(size: 15))
                    .foregroundStyle(Theme.brownMuted)
            }

            if passed {
                VStack(spacing: 6) {
                    Text("+\(xpEarned) XP")
                        .font(.system(size: 36, weight: .black))
                        .foregroundStyle(Theme.saffron)
                    Text("Keep your streak alive \u{2014} come back tomorrow")
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.brownMuted)
                        .multilineTextAlignment(.center)
                }
                .padding(20)
                .frame(maxWidth: .infinity)
                .background(Theme.creamDark)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.border, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 16))
            } else {
                Text("Score 2/3 or better to earn XP. Re-reading deepens understanding.")
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
            let earned = completed ? XPSystem.xpFor(passage: passage, quizScore: newScore) : 0
            let session = FocusSession(
                passageId: passage.id,
                quizScore: newScore,
                xpEarned: earned,
                completed: completed
            )
            modelContext.insert(session)
            score = newScore
            xpEarned = earned
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
