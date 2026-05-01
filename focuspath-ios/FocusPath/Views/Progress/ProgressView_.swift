import SwiftUI
import SwiftData

struct ProgressView_: View {
    @Query(filter: #Predicate<FocusSession> { $0.completed == true },
           sort: \FocusSession.date) private var sessions: [FocusSession]

    private var totalXP: Int { sessions.map(\.xpEarned).reduce(0, +) }

    private var weeklyXPData: [(label: String, xp: Int)] {
        let calendar = Calendar.current
        var byWeek: [Date: Int] = [:]
        for s in sessions {
            let comps = calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: s.date)
            guard let monday = calendar.date(from: comps) else { continue }
            byWeek[monday, default: 0] += s.xpEarned
        }
        let fmt = DateFormatter()
        fmt.dateFormat = "MMM d"
        return byWeek.sorted { $0.key < $1.key }.suffix(6).map { (date, xp) in
            (label: fmt.string(from: date), xp: xp)
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                levelSection
                xpChartSection
                traditionSection
                recentSessionsSection
                if sessions.isEmpty {
                    emptyState
                }
            }
            .padding(20)
        }
        .background(Theme.cream.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
    }

    private var levelSection: some View {
        let level = XPSystem.currentLevel(for: totalXP)
        let progress = XPSystem.progressToNextLevel(for: totalXP)
        return VStack(alignment: .leading, spacing: 12) {
            Text("YOUR JOURNEY")
                .font(.system(size: 10, weight: .bold))
                .tracking(1.5)
                .foregroundStyle(Theme.brownMuted)

            HStack(alignment: .bottom, spacing: 8) {
                Text(level.emoji)
                    .font(.system(size: 40))
                VStack(alignment: .leading, spacing: 2) {
                    Text(level.name)
                        .font(.system(size: 28, weight: .black))
                        .foregroundStyle(Theme.brown)
                    Text("\(totalXP) XP total")
                        .font(.system(size: 14))
                        .foregroundStyle(Theme.brownMuted)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(sessions.count)")
                        .font(.system(size: 24, weight: .black))
                        .foregroundStyle(Theme.saffron)
                    Text("sessions")
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.brownMuted)
                }
            }

            if let next = level.next,
               let nextLevel = XPSystem.levels.first(where: { $0.threshold == next }) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("Next: \(nextLevel.emoji) \(nextLevel.name)")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(Theme.brown)
                        Spacer()
                        Text("\(next - totalXP) XP to go")
                            .font(.system(size: 12))
                            .foregroundStyle(Theme.brownMuted)
                    }
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4).fill(Theme.border).frame(height: 8)
                            RoundedRectangle(cornerRadius: 4).fill(Theme.saffronGradient)
                                .frame(width: geo.size.width * CGFloat(progress), height: 8)
                        }
                    }
                    .frame(height: 8)
                }
            } else {
                Text("You have reached the highest level. Keep reading.")
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.saffron)
            }
        }
        .padding(16)
        .background(Theme.creamDark)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var xpChartSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("XP EARNED BY WEEK")
                .font(.system(size: 10, weight: .bold))
                .tracking(1.5)
                .foregroundStyle(Theme.brownMuted)
            XPBarChart(data: weeklyXPData)
        }
        .padding(16)
        .background(Theme.creamDark)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var traditionSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("BY TRADITION")
                .font(.system(size: 10, weight: .bold))
                .tracking(1.5)
                .foregroundStyle(Theme.brownMuted)
            ForEach(Tradition.allCases, id: \.self) { tradition in
                let count = sessions.filter { $0.passageId.hasPrefix(tradition.rawValue) }.count
                let total = PassageStore.shared.all.filter { $0.tradition == tradition }.count
                TraditionRow(tradition: tradition, count: count, total: total)
            }
        }
    }

    private var recentSessionsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("RECENT SESSIONS")
                .font(.system(size: 10, weight: .bold))
                .tracking(1.5)
                .foregroundStyle(Theme.brownMuted)
            ForEach(sessions.suffix(5).reversed(), id: \.id) { session in
                if let passage = PassageStore.shared.passage(byId: session.passageId) {
                    RecentSessionRow(session: session, passage: passage)
                }
            }
        }
    }

    private var emptyState: some View {
        Text("Complete your first session to see your journey here.")
            .font(.system(size: 14))
            .foregroundStyle(Theme.brownMuted)
            .frame(maxWidth: .infinity, alignment: .center)
            .padding(.top, 20)
    }
}

private struct XPBarChart: View {
    let data: [(label: String, xp: Int)]
    private var maxVal: Int { data.map(\.xp).max() ?? 1 }

    var body: some View {
        if data.isEmpty {
            Text("Complete sessions to see your XP chart.")
                .font(.system(size: 13))
                .foregroundStyle(Theme.brownMuted)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 20)
        } else {
            HStack(alignment: .bottom, spacing: 8) {
                ForEach(data, id: \.label) { item in
                    VStack(spacing: 4) {
                        Text("\(item.xp)")
                            .font(.system(size: 8))
                            .foregroundStyle(Theme.brownMuted)
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Theme.saffron)
                            .frame(height: barHeight(item.xp))
                        Text(item.label)
                            .font(.system(size: 9))
                            .foregroundStyle(Theme.brownMuted)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .frame(height: 100)
        }
    }

    private func barHeight(_ xp: Int) -> CGFloat {
        CGFloat(xp) / CGFloat(maxVal) * 80
    }
}

private struct TraditionRow: View {
    let tradition: Tradition
    let count: Int
    let total: Int

    var body: some View {
        HStack {
            Text(tradition.displayName)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Theme.brown)
            Spacer()
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 2).fill(Theme.border).frame(height: 5)
                    RoundedRectangle(cornerRadius: 2).fill(Theme.saffron)
                        .frame(width: geo.size.width * CGFloat(count) / CGFloat(max(1, total)), height: 5)
                }
            }
            .frame(width: 80, height: 5)
            Text("\(count)/\(total)")
                .font(.system(size: 12))
                .foregroundStyle(Theme.brownMuted)
                .frame(width: 40, alignment: .trailing)
        }
        .padding(12)
        .background(Theme.creamDark)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

private struct RecentSessionRow: View {
    let session: FocusSession
    let passage: Passage

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("\(passage.source) \u{00B7} \(passage.work)")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Theme.brown)
                Text(session.date.formatted(date: .abbreviated, time: .omitted))
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.brownMuted)
            }
            Spacer()
            Text("+\(session.xpEarned) XP")
                .font(.system(size: 13, weight: .bold))
                .foregroundStyle(Theme.saffron)
        }
        .padding(12)
        .background(Theme.creamDark)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}
