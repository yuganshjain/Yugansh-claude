import SwiftData
import Foundation

enum SessionType: String, Codable {
    case guided
    case silent
}

@Model
final class MeditationSession {
    var type: SessionType
    var guideName: String?  // "Breath", "Body Scan", "Stillness" — nil for silent
    var durationMinutes: Int
    var completedAt: Date
    var xpEarned: Int

    init(type: SessionType, guideName: String? = nil, durationMinutes: Int, xpEarned: Int) {
        self.type = type
        self.guideName = guideName
        self.durationMinutes = durationMinutes
        self.completedAt = Date()
        self.xpEarned = xpEarned
    }
}
