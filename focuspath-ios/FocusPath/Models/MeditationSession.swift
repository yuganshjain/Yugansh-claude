import SwiftData
import Foundation

@Model
final class MeditationSession {
    var type: String        // "guided" | "silent"
    var guideName: String?  // "Breath", "Body Scan", "Stillness" — nil for silent
    var durationMinutes: Int
    var completedAt: Date
    var xpEarned: Int

    init(type: String, guideName: String? = nil, durationMinutes: Int, xpEarned: Int) {
        self.type = type
        self.guideName = guideName
        self.durationMinutes = durationMinutes
        self.completedAt = Date()
        self.xpEarned = xpEarned
    }
}
