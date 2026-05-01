import Foundation

struct QuizQuestion: Codable, Identifiable {
    var id: String { question }
    let question: String
    let choices: [String]
    let correctIndex: Int
    let explanation: String
}
