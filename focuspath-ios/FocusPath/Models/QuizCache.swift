import SwiftData
import Foundation

@Model
final class QuizCache {
    var passageId: String
    var questionsData: Data
    var createdAt: Date

    init(passageId: String, questions: [QuizQuestion]) throws {
        self.passageId = passageId
        self.questionsData = try JSONEncoder().encode(questions)
        self.createdAt = Date()
    }

    func questions() throws -> [QuizQuestion] {
        try JSONDecoder().decode([QuizQuestion].self, from: questionsData)
    }
}
