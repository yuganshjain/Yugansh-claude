import SwiftUI
import SwiftData

struct ProgressView_: View {
    @Query(filter: #Predicate<FocusSession> { $0.completed == true },
           sort: \FocusSession.date) private var sessions: [FocusSession]

    private var weeklyData: [(label: String, avgSeconds: Int)] {
        let calendar = Calendar.current
        var byWeek: [Date: [Int]] = [:]
        for s in sessions {
            let comps = calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: s.date)
            guard let monday = calendar.date(from: comps) else { continue }
            byWeek[monday, default: []].append(s.focusSeconds)
        }
        let fmt = DateFormatter()
        fmt.dateFormat = "MMM d"
        return byWeek.sorted { $0.key < $1.key }.suffix(6).map { (date, vals) in
            let avg = vals.reduce(0, +) / vals.count
            return (label: fmt.string(from: date), avgSeconds: avg)
        }
    }

    private var currentAvg: Int {
        guard !sessions.isEmpty else { return 0 }
        return sessions.map(\.focusSeconds).reduce(0, +) / sessions.count
    }

    private var week1Avg: Int { weeklyData.first?.avgSeconds ?? 0 }
    private var latestAvg: Int { weeklyData.last?.avgSeconds ?? currentAvg }
    private var delta: Int { latestAvg - week1Avg }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Your attention span is growing")
                    .font(.system(size: 20, weight: .bold, design: .serif))
                    .foregroundStyle(Theme.brown)

                VStack(alignment: .leading, spacing: 8) {
                    Text("AVERAGE FOCUS TIME")
                        .font(.system(size: 10, weight: .bold))
                        .tracking(1.5)
                        .foregroundStyle(Theme.brownMuted)
                    Text(fmt(latestAvg))
                        .font(.system(size: 40, weight: .black))
                        .foregroundStyle(Theme.saffron)
                    if delta > 0 {
                        Text("\u{2191} +\(fmt(delta)) from week 1")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(Theme.greenOk)
                    }
                    WeeklyBarChart(data: weeklyData)
                        .padding(.top, 8)
                }
                .padding(16)
                .background(Theme.creamDark)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.border, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 16))

                Text("BY TRADITION")
                    .font(.system(size: 10, weight: .bold))
                    .tracking(1.5)
                    .foregroundStyle(Theme.brownMuted)

                ForEach(Tradition.allCases, id: \.self) { tradition in
                    let count = sessions.filter { $0.passageId.hasPrefix(tradition.rawValue) }.count
                    let total = PassageStore.shared.all.filter { $0.tradition == tradition }.count
                    TraditionRow(tradition: tradition, count: count, total: total)
                }

                if sessions.isEmpty {
                    Text("Complete your first session to see your progress here.")
                        .font(.system(size: 14))
                        .foregroundStyle(Theme.brownMuted)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.top, 20)
                }
            }
            .padding(20)
        }
        .background(Theme.cream.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
    }

    private func fmt(_ s: Int) -> String { "\(s / 60)m \(s % 60)s" }
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
            Text("\(count) read")
                .font(.system(size: 12))
                .foregroundStyle(Theme.brownMuted)
                .frame(width: 50, alignment: .trailing)
        }
        .padding(12)
        .background(Theme.creamDark)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}
