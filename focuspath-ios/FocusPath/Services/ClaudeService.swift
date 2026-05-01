import Foundation

enum ClaudeServiceError: Error {
    case missingAPIKey
    case networkError(Error)
    case invalidResponse
    case parseError(Error)
}

final class ClaudeService {
    static let shared = ClaudeService()

    private let model = "claude-haiku-4-5-20251001"
    private let endpoint = URL(string: "https://api.anthropic.com/v1/messages")!

    func generateQuiz(for passage: Passage) async throws -> [QuizQuestion] {
        guard let apiKey = Bundle.main.infoDictionary?["ANTHROPIC_API_KEY"] as? String,
              !apiKey.isEmpty else {
            throw ClaudeServiceError.missingAPIKey
        }

        let systemPrompt = """
        You generate reading comprehension questions for spiritual texts.
        Return ONLY a JSON array of exactly 3 objects, no markdown, no extra text.
        Each object: {"question": string, "choices": [string, string, string, string], "correctIndex": number (0-3), "explanation": string}
        Questions should test genuine understanding, not trivial recall.
        """

        let userMessage = "Generate 3 comprehension questions for this passage (id: \(passage.id)):\n\n\(passage.body)"

        let body: [String: Any] = [
            "model": model,
            "max_tokens": 1024,
            "system": systemPrompt,
            "messages": [["role": "user", "content": userMessage]]
        ]

        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            throw ClaudeServiceError.invalidResponse
        }

        struct AnthropicResponse: Decodable {
            struct Content: Decodable { let type: String; let text: String }
            let content: [Content]
        }
        let envelope = try JSONDecoder().decode(AnthropicResponse.self, from: data)
        guard let text = envelope.content.first(where: { $0.type == "text" })?.text,
              let jsonData = text.data(using: .utf8) else {
            throw ClaudeServiceError.invalidResponse
        }
        return try JSONDecoder().decode([QuizQuestion].self, from: jsonData)
    }
}
