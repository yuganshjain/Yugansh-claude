import Foundation

struct XPLevel {
    let name: String
    let threshold: Int
    let next: Int?
    let emoji: String
}

enum XPSystem {
    static let levels: [XPLevel] = [
        XPLevel(name: "Seeker",      threshold: 0,    next: 200,  emoji: "🌱"),
        XPLevel(name: "Reader",      threshold: 200,  next: 500,  emoji: "📖"),
        XPLevel(name: "Scholar",     threshold: 500,  next: 1000, emoji: "🔍"),
        XPLevel(name: "Sage",        threshold: 1000, next: 2000, emoji: "🌿"),
        XPLevel(name: "Master",      threshold: 2000, next: 4000, emoji: "⚡"),
        XPLevel(name: "Enlightened", threshold: 4000, next: nil,  emoji: "✨"),
    ]

    static func currentLevel(for totalXP: Int) -> XPLevel {
        levels.last(where: { totalXP >= $0.threshold }) ?? levels[0]
    }

    static func progressToNextLevel(for totalXP: Int) -> Double {
        let level = currentLevel(for: totalXP)
        guard let next = level.next else { return 1.0 }
        let earned = totalXP - level.threshold
        let needed = next - level.threshold
        return Double(earned) / Double(needed)
    }

    static func xpFor(passage: Passage, quizScore: Int = 0) -> Int {
        50 + (passage.estimatedMinutes * 5)
    }
}
