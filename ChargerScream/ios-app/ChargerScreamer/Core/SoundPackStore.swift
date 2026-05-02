import Foundation
import Combine

final class SoundPackStore: ObservableObject {
    @Published private(set) var selectedPack: SoundPack
    @Published private(set) var plugCountToday: Int

    private let defaults: UserDefaults
    private let selectedPackKey = "selectedPackId"
    private let plugCountKey = "plugCount"
    private let plugCountDateKey = "plugCountDate"

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults

        let savedId = defaults.string(forKey: "selectedPackId")
        self.selectedPack = SoundPack.all.first { $0.id == savedId } ?? SoundPack.all[0]

        let savedDate = defaults.object(forKey: "plugCountDate") as? Date ?? Date.distantPast
        if Calendar.current.isDateInToday(savedDate) {
            self.plugCountToday = defaults.integer(forKey: "plugCount")
        } else {
            self.plugCountToday = 0
        }
    }

    func select(_ pack: SoundPack) {
        selectedPack = pack
        defaults.set(pack.id, forKey: selectedPackKey)
    }

    func incrementPlugCount() {
        plugCountToday += 1
        defaults.set(plugCountToday, forKey: plugCountKey)
        defaults.set(Date(), forKey: plugCountDateKey)
    }

    var plugCountLabel: String {
        let word = plugCountToday == 1 ? "time" : "times"
        return "Charged \(plugCountToday) \(word) today ⚡"
    }
}
