import SwiftUI

@main
struct ChargerScreamerApp: App {
    @AppStorage("ageGateAccepted") private var ageGateAccepted = false

    var body: some Scene {
        WindowGroup {
            if !DeviceGuard.isSupported {
                DeviceGuardView()
            } else if !ageGateAccepted {
                AgeGateView {
                    ageGateAccepted = true
                }
            } else {
                ContentView()
            }
        }
    }
}
