import Foundation

struct HomeLogic {
    static func streak(sessionDates: [Date], referenceDate: Date = Date()) -> Int {
        let calendar = Calendar.current
        let days = Set(sessionDates.map { calendar.startOfDay(for: $0) })
        var count = 0
        var day = calendar.startOfDay(for: referenceDate)
        while days.contains(day) {
            count += 1
            guard let prev = calendar.date(byAdding: .day, value: -1, to: day) else { break }
            day = prev
        }
        return count
    }

    static func soulRingProgress(readDone: Bool, meditateDone: Bool, journalDone: Bool) -> Double {
        let done = [readDone, meditateDone, journalDone].filter { $0 }.count
        return Double(done) / 3.0
    }

    static func dayCount(joinDate: Date, today: Date = Date()) -> Int {
        let calendar = Calendar.current
        let days = calendar.dateComponents(
            [.day],
            from: calendar.startOfDay(for: joinDate),
            to: calendar.startOfDay(for: today)
        ).day ?? 0
        return max(1, days + 1)
    }

    static func greeting(hour: Int = Calendar.current.component(.hour, from: Date())) -> String {
        if hour < 12 { return "Good morning" }
        if hour < 17 { return "Good afternoon" }
        return "Good evening"
    }
}
