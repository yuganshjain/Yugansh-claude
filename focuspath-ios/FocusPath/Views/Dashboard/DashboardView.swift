import SwiftUI
import SwiftData

struct DashboardView: View {
    @Query(filter: #Predicate<FocusSession> { $0.completed == true },
           sort: \FocusSession.date) private var sessions: [FocusSession]
    @AppStorage("fp_traditions") private var traditionsData = ""

    private var todayPassage: Passage {
        let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"
        return PassageStore.shared.todayPassage(
            dateString: f.string(from: Date()),
            traditions: enabledTraditions.isEmpty ? nil : enabledTraditions
        )
    }

    private var enabledTraditions: [Tradition] {
        guard !traditionsData.isEmpty,
              let data = traditionsData.data(using: .utf8),
              let arr = try? JSONDecoder().decode([Tradition].self, from: data)
        else { return [] }
        return arr
    }

    private var streak: Int {
        guard !sessions.isEmpty else { return 0 }
        let calendar = Calendar.current
        let completedDays = Set(sessions.map { calendar.startOfDay(for: $0.date) })
        var count = 0
        var day = calendar.startOfDay(for: Date())
        while completedDays.contains(day) {
            count += 1
            day = calendar.date(byAdding: .day, value: -1, to: day)!
        }
        return count
    }

    private var avgFocusSeconds: Int {
        guard !sessions.isEmpty else { return 0 }
        return sessions.map(\.focusSeconds).reduce(0, +) / sessions.count
    }

    private var avgQuizPct: Int {
        guard !sessions.isEmpty else { return 0 }
        return sessions.map(\.quizScore).reduce(0, +) * 100 / (sessions.count * 3)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Header
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(greeting)
                                .font(.system(size: 22, weight: .bold))
                                .foregroundStyle(Theme.brown)
                            Text("Your mind grows stronger every day")
                                .font(.system(size: 14))
                                .foregroundStyle(Theme.brownMuted)
                        }
                        Spacer()
                        if streak > 0 {
                            Text("🔥 \(streak) days")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Theme.saffron)
                                .clipShape(Capsule())
                        }
                    }

                    // Today's passage
                    PassageCardView(passage: todayPassage)

                    // Stats
                    if !sessions.isEmpty {
                        HStack(spacing: 12) {
                            StatPill(value: formatTime(avgFocusSeconds), label: "Avg Focus")
                            StatPill(value: "\(sessions.count)", label: "Sessions")
                            StatPill(value: "\(avgQuizPct)%", label: "Quiz Score")
                        }
                    }
                }
                .padding(20)
            }
            .background(Theme.cream.ignoresSafeArea())
            .toolbar(.hidden, for: .navigationBar)
        }
    }

    private var greeting: String {
        let h = Calendar.current.component(.hour, from: Date())
        if h < 12 { return "Good morning" }
        if h < 17 { return "Good afternoon" }
        return "Good evening"
    }

    private func formatTime(_ seconds: Int) -> String {
        "\(seconds / 60)m \(seconds % 60)s"
    }
}

private struct StatPill: View {
    let value: String
    let label: String
    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.system(size: 20, weight: .black))
                .foregroundStyle(Theme.saffron)
            Text(label)
                .font(.system(size: 11))
                .foregroundStyle(Theme.brownMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(Theme.creamDark)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
