import SwiftUI

struct DeviceGuardView: View {
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            VStack(spacing: 24) {
                Image(systemName: "iphone.slash")
                    .font(.system(size: 80))
                    .foregroundColor(.gray)

                Text("USB-C Only")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundColor(.white)

                Text("ChargerScreamer is for iPhone 15 and later.\nUpgrade your phone, then come back.")
                    .font(.body)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }
        }
    }
}

enum DeviceGuard {
    static var isSupported: Bool {
        #if targetEnvironment(simulator)
        return true
        #else
        var systemInfo = utsname()
        uname(&systemInfo)
        let machine = withUnsafePointer(to: &systemInfo.machine) {
            $0.withMemoryRebound(to: CChar.self, capacity: 1) { String(cString: $0) }
        }
        let supportedPrefixes = ["iPhone15,", "iPhone16,", "iPhone17,", "iPhone18,"]
        return supportedPrefixes.contains { machine.hasPrefix($0) }
        #endif
    }
}
