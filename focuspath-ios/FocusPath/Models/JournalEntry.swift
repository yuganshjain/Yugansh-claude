import SwiftData
import Foundation

@Model
final class JournalEntry {
    var date: Date
    var promptText: String
    var responseText: String
    var wordCount: Int

    init(promptText: String, responseText: String) {
        self.date = Date()
        self.promptText = promptText
        self.responseText = responseText
        self.wordCount = responseText.split(separator: " ").count
    }
}
