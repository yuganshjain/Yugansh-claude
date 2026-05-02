import UIKit
import Combine

final class ChargerMonitor: ObservableObject {
    @Published private(set) var isCharging: Bool = false

    var onPlug: (() -> Void)?
    var onUnplug: (() -> Void)?

    private var observer: NSObjectProtocol?

    init() {
        UIDevice.current.isBatteryMonitoringEnabled = true
        isCharging = UIDevice.current.batteryState == .charging || UIDevice.current.batteryState == .full

        observer = NotificationCenter.default.addObserver(
            forName: UIDevice.batteryStateDidChangeNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.handleBatteryStateChange()
        }
    }

    deinit {
        if let observer { NotificationCenter.default.removeObserver(observer) }
        UIDevice.current.isBatteryMonitoringEnabled = false
    }

    private func handleBatteryStateChange() {
        let nowCharging = UIDevice.current.batteryState == .charging || UIDevice.current.batteryState == .full
        guard nowCharging != isCharging else { return }
        isCharging = nowCharging
        if nowCharging { onPlug?() } else { onUnplug?() }
    }

    #if DEBUG
    func simulatePlug() {
        guard !isCharging else { return }
        isCharging = true
        onPlug?()
    }

    func simulateUnplug() {
        guard isCharging else { return }
        isCharging = false
        onUnplug?()
    }
    #endif
}
