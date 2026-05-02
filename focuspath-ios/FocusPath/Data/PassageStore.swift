import Foundation

final class PassageStore {
    static let shared = PassageStore()

    let all: [Passage]

    private init() {
        let bundle = Bundle(for: PassageStore.self)
        guard
            let url = bundle.url(forResource: "Passages", withExtension: "json")
                  ?? Bundle.main.url(forResource: "Passages", withExtension: "json"),
            let data = try? Data(contentsOf: url),
            let passages = try? JSONDecoder().decode([Passage].self, from: data)
        else {
            all = []
            return
        }
        all = passages
    }

    func todayPassage(dateString: String, traditions: [Tradition]?) -> Passage {
        let pool: [Passage]
        if let traditions, !traditions.isEmpty {
            let filtered = all.filter { traditions.contains($0.tradition) }
            pool = filtered.isEmpty ? all : filtered
        } else {
            pool = all
        }
        let hash = dateString.unicodeScalars.reduce(0) { ($0 &* 31) &+ Int($1.value) }
        return pool[abs(hash) % pool.count]
    }

    func passage(byId id: String) -> Passage? {
        all.first { $0.id == id }
    }
}
