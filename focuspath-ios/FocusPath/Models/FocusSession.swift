import SwiftData
import Foundation

@Model
final class FocusSession {
    var id: String
    var passageId: String
    var xpEarned: Int
    var completed: Bool
    var date: Date

    init(passageId: String, xpEarned: Int, completed: Bool) {
        self.id = UUID().uuidString
        self.passageId = passageId
        self.xpEarned = xpEarned
        self.completed = completed
        self.date = Date()
    }
}
