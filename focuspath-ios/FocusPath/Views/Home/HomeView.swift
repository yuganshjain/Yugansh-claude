import SwiftUI
import SwiftData

struct HomeView: View {
    @Binding var selectedTab: Int

    @Query(filter: #Predicate<FocusSession> { $0.completed == true })
    private var readSessions: [FocusSession]
    @Query private var meditationSessions: [MeditationSession]
    @Query private var journalEntries: [JournalEntry]

    @AppStorage("soma.joinDate") private var joinDateInterval: Double = 0

    private static let dateFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "EEEE, MMM d"
        return f
    }()

    private var joinDate: Date {
        joinDateInterval == 0 ? Date() : Date(timeIntervalSince1970: joinDateInterval)
    }

    private var todayCompletion: (read: Bool, meditate: Bool, journal: Bool) {
        let today = Calendar.current.startOfDay(for: Date())
        let readDone = readSessions.contains { Calendar.current.startOfDay(for: $0.date) == today }
        let meditateDone = meditationSessions.contains { Calendar.current.startOfDay(for: $0.completedAt) == today }
        let journalDone = journalEntries.contains { Calendar.current.startOfDay(for: $0.date) == today }
        return (readDone, meditateDone, journalDone)
    }

    private var soulProgress: Double {
        let c = todayCompletion
        return HomeLogic.soulRingProgress(readDone: c.read, meditateDone: c.meditate, journalDone: c.journal)
    }

    private var totalXP: Int {
        readSessions.map(\.xpEarned).reduce(0, +) +
        meditationSessions.map(\.xpEarned).reduce(0, +)
    }

    private var streak: Int {
        HomeLogic.streak(sessionDates: readSessions.map(\.date))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                headerSection
                soulRingSection
                todaySection
            }
            .padding(20)
        }
        .background(Theme.background.ignoresSafeArea())
        .onAppear { setJoinDateIfNeeded() }
    }

    // MARK: - Sections

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("\(HomeLogic.greeting()) 🙏")
                .font(.system(size: 26, weight: .black))
                .foregroundStyle(Theme.text)
            Text("\(Self.dateFormatter.string(from: Date())) · Day \(HomeLogic.dayCount(joinDate: joinDate))")
                .font(.system(size: 13))
                .foregroundStyle(Theme.textMuted)
        }
    }

    private var soulRingSection: some View {
        let level = XPSystem.currentLevel(for: totalXP)
        let lvNum = XPSystem.levelNumber(for: totalXP)
        return SoulRingView(
            progress: soulProgress,
            levelName: "\(level.name) Lv \(lvNum)",
            levelEmoji: level.emoji,
            xp: totalXP,
            streak: streak,
            passagesRead: readSessions.count
        )
    }

    private var todaySection: some View {
        let c = todayCompletion
        return VStack(alignment: .leading, spacing: 10) {
            Text("TODAY'S PRACTICE")
                .font(.system(size: 10, weight: .bold))
                .tracking(1.5)
                .foregroundStyle(Theme.textMuted)

            PracticeTaskCard(
                icon: "📖",
                title: "Read",
                subtitle: "Today's sacred passage",
                done: c.read
            ) { selectedTab = Tab.practice.rawValue }

            PracticeTaskCard(
                icon: "🧘",
                title: "Meditate",
                subtitle: "10 min · Breath awareness",
                done: c.meditate
            ) { selectedTab = Tab.practice.rawValue }

            PracticeTaskCard(
                icon: "✍️",
                title: "Reflect",
                subtitle: "Today's journal prompt waiting",
                done: c.journal
            ) { selectedTab = Tab.journal.rawValue }
        }
    }

    // MARK: - Helpers

    private func setJoinDateIfNeeded() {
        if joinDateInterval == 0 {
            joinDateInterval = Date().timeIntervalSince1970
        }
    }
}

// MARK: - PracticeTaskCard

private struct PracticeTaskCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let done: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Text(icon)
                    .font(.system(size: 24))
                    .frame(width: 40)
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(Theme.text)
                    Text(subtitle)
                        .font(.system(size: 12))
                        .foregroundStyle(Theme.textMuted)
                }
                Spacer()
                Image(systemName: done ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 22))
                    .foregroundStyle(done ? Theme.green : Color.white.opacity(0.15))
            }
            .padding(14)
            .background(done ? Theme.green.opacity(0.06) : Theme.surface)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(done ? Theme.green.opacity(0.3) : Theme.border, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(.plain)
        .opacity(done ? 0.6 : 1.0)
    }
}
