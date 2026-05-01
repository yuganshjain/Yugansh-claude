import SwiftData
import Foundation

@Model
final class FocusSession {
    var id: String
    var passageId: String
    var focusSeconds: Int
    var quizScore: Int
    var completed: Bool
    var date: Date

    init(passageId: String, focusSeconds: Int, quizScore: Int, completed: Bool) {
        self.id = UUID().uuidString
        self.passageId = passageId
        self.focusSeconds = focusSeconds
        self.quizScore = quizScore
        self.completed = completed
        self.date = Date()
    }
}
