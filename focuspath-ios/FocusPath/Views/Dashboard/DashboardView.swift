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

    private var totalXP: Int { sessions.map(\.xpEarned).reduce(0, +) }
    private var completedToday: Bool {
        let today = Calendar.current.startOfDay(for: Date())
        return sessions.contains { Calendar.current.startOfDay(for: $0.date) == today }
    }

    private var minutesUntilMidnight: Int {
        let now = Date()
        let midnight = Calendar.current.startOfDay(for: Calendar.current.date(byAdding: .day, value: 1, to: now)!)
        return Int(midnight.timeIntervalSince(now) / 60)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    headerSection
                    if !completedToday {
                        dailyHookBanner
                    } else {
                        completedTodayBanner
                    }
                    PassageCardView(passage: todayPassage)
                    xpProgressSection
                    libraryTeaser
                }
                .padding(20)
            }
            .background(Theme.cream.ignoresSafeArea())
            .toolbar(.hidden, for: .navigationBar)
        }
    }

    private var headerSection: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 2) {
                Text(greeting)
                    .font(.system(size: 22, weight: .bold))
                    .foregroundStyle(Theme.brown)
                let level = XPSystem.currentLevel(for: totalXP)
                Text("\(level.emoji) \(level.name) \u{00B7} \(totalXP) XP")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Theme.brownMuted)
            }
            Spacer()
            if streak > 0 {
                VStack(spacing: 2) {
                    Text("\u{1F525}")
                        .font(.system(size: 22))
                    Text("\(streak)")
                        .font(.system(size: 13, weight: .black))
                        .foregroundStyle(Theme.saffron)
                    Text("days")
                        .font(.system(size: 9))
                        .foregroundStyle(Theme.brownMuted)
                }
            }
        }
    }

    private var dailyHookBanner: some View {
        HStack(spacing: 12) {
            Text("\u{23F0}")
                .font(.system(size: 24))
            VStack(alignment: .leading, spacing: 2) {
                Text("Today\u{2019}s wisdom awaits")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(Theme.brown)
                Text("Resets in \(hoursMinutes(minutesUntilMidnight)) \u{00B7} Don\u{2019}t break your streak")
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.brownMuted)
            }
            Spacer()
        }
        .padding(14)
        .background(Theme.creamDark)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.saffron.opacity(0.4), lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var completedTodayBanner: some View {
        HStack(spacing: 12) {
            Text("\u{2705}")
                .font(.system(size: 22))
            VStack(alignment: .leading, spacing: 2) {
                Text("You read today \u{2014} well done")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(Theme.brown)
                Text("Come back tomorrow for the next passage")
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.brownMuted)
            }
            Spacer()
        }
        .padding(14)
        .background(Theme.greenOk.opacity(0.12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.greenOk.opacity(0.4), lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var xpProgressSection: some View {
        let level = XPSystem.currentLevel(for: totalXP)
        let progress = XPSystem.progressToNextLevel(for: totalXP)
        return VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("LEVEL PROGRESS")
                    .font(.system(size: 10, weight: .bold))
                    .tracking(1.5)
                    .foregroundStyle(Theme.brownMuted)
                Spacer()
                if let next = level.next {
                    Text("\(level.threshold + Int(Double(level.next! - level.threshold) * progress)) / \(next) XP")
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.brownMuted)
                } else {
                    Text("Max Level")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(Theme.saffron)
                }
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4).fill(Theme.border).frame(height: 8)
                    RoundedRectangle(cornerRadius: 4).fill(Theme.saffronGradient)
                        .frame(width: geo.size.width * CGFloat(progress), height: 8)
                }
            }
            .frame(height: 8)
            HStack {
                Text("\(level.emoji) \(level.name)")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Theme.brown)
                Spacer()
                if let next = level.next,
                   let nextLevel = XPSystem.levels.first(where: { $0.threshold == next }) {
                    Text("\(nextLevel.emoji) \(nextLevel.name)")
                        .font(.system(size: 12))
                        .foregroundStyle(Theme.brownMuted)
                }
            }

            HStack(spacing: 12) {
                StatPill(value: "\(sessions.count)", label: "Sessions")
                StatPill(value: "\(streak)", label: "Day Streak")
                StatPill(value: "\(totalXP)", label: "Total XP")
            }
            .padding(.top, 4)
        }
        .padding(16)
        .background(Theme.creamDark)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var libraryTeaser: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("EXPLORE THE LIBRARY")
                .font(.system(size: 10, weight: .bold))
                .tracking(1.5)
                .foregroundStyle(Theme.brownMuted)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(Tradition.allCases, id: \.self) { tradition in
                        let count = PassageStore.shared.all.filter { $0.tradition == tradition }.count
                        let read = sessions.filter { $0.passageId.hasPrefix(tradition.rawValue) }.count
                        TraditionChip(tradition: tradition, total: count, read: read)
                    }
                }
            }
        }
    }

    private var greeting: String {
        let h = Calendar.current.component(.hour, from: Date())
        if h < 12 { return "Good morning" }
        if h < 17 { return "Good afternoon" }
        return "Good evening"
    }

    private func hoursMinutes(_ totalMinutes: Int) -> String {
        let h = totalMinutes / 60
        let m = totalMinutes % 60
        if h > 0 { return "\(h)h \(m)m" }
        return "\(m)m"
    }
}

private struct StatPill: View {
    let value: String
    let label: String
    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.system(size: 18, weight: .black))
                .foregroundStyle(Theme.saffron)
            Text(label)
                .font(.system(size: 10))
                .foregroundStyle(Theme.brownMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(Theme.cream)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

private struct TraditionChip: View {
    let tradition: Tradition
    let total: Int
    let read: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(tradition.displayName)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(Theme.brown)
            Text("\(read)/\(total) read")
                .font(.system(size: 11))
                .foregroundStyle(Theme.brownMuted)
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 2).fill(Theme.border).frame(height: 3)
                    RoundedRectangle(cornerRadius: 2).fill(Theme.saffron)
                        .frame(width: geo.size.width * CGFloat(read) / CGFloat(max(1, total)), height: 3)
                }
            }
            .frame(height: 3)
        }
        .padding(12)
        .frame(width: 130)
        .background(Theme.creamDark)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
