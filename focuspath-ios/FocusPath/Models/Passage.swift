import Foundation

enum Tradition: String, Codable, CaseIterable {
    case stoics, gita, tao, upanishads, bible, quran, buddhist

    var displayName: String {
        switch self {
        case .stoics:     return "Stoics"
        case .gita:       return "Bhagavad Gita"
        case .tao:        return "Tao Te Ching"
        case .upanishads: return "Upanishads"
        case .bible:      return "Bible"
        case .quran:      return "Quran"
        case .buddhist:   return "Buddhist"
        }
    }
}

struct Passage: Codable, Identifiable {
    let id: String
    let tradition: Tradition
    let source: String
    let work: String
    let quote: String
    let body: String
    let estimatedMinutes: Int
}
