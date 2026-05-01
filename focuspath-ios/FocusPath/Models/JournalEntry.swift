import SwiftData
import Foundation

@Model
final class JournalEntry {
    var date: Date
    var promptText: String
    var responseText: String

    @Transient
    var wordCount: Int {
        responseText
            .components(separatedBy: .whitespacesAndNewlines)
            .filter { !$0.isEmpty }
            .count
    }

    init(promptText: String, responseText: String) {
        self.date = Date()
        self.promptText = promptText
        self.responseText = responseText
    }
}
