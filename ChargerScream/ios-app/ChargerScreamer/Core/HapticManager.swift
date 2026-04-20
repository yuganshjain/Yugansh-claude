import UIKit

final class HapticManager {
    private let heavyGenerator = UIImpactFeedbackGenerator(style: .heavy)
    private let lightGenerator = UIImpactFeedbackGenerator(style: .light)
    private let mediumGenerator = UIImpactFeedbackGenerator(style: .medium)

    init() {
        heavyGenerator.prepare()
        lightGenerator.prepare()
        mediumGenerator.prepare()
    }

    func plug() {
        heavyGenerator.impactOccurred()
    }

    func unplug() {
        lightGenerator.impactOccurred()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
            self?.mediumGenerator.impactOccurred()
        }
    }
}
