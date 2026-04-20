import SwiftUI

struct ContentView: View {
    @StateObject private var chargerMonitor = ChargerMonitor()
    @StateObject private var soundEngine = SoundEngine()
    @StateObject private var soundPackStore = SoundPackStore()
    private let hapticManager = HapticManager()

    @State private var flashOpacity: Double = 0

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.04, green: 0.04, blue: 0.12), Color.black],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                topBar
                Spacer()
                MascotView(isCharging: chargerMonitor.isCharging)
                    .frame(height: 280)
                Text(soundPackStore.plugCountLabel)
                    .font(.system(size: 14, weight: .medium, design: .rounded))
                    .foregroundColor(.gray)
                    .padding(.top, 24)
                Spacer()
                PackSelectorView(store: soundPackStore)
                    .padding(.bottom, 32)
            }

            Color.white
                .ignoresSafeArea()
                .opacity(flashOpacity)
                .allowsHitTesting(false)

            #if DEBUG
            debugOverlay
            #endif
        }
        .onChange(of: chargerMonitor.isCharging) { _, isCharging in
            isCharging ? handlePlug() : handleUnplug()
        }
    }

    private var topBar: some View {
        HStack {
            Text("⚡ ChargerScreamer")
                .font(.system(size: 18, weight: .black, design: .rounded))
                .foregroundStyle(
                    LinearGradient(colors: [.cyan, .blue], startPoint: .leading, endPoint: .trailing)
                )
            Spacer()
            Button(action: { soundEngine.toggleMute() }) {
                Image(systemName: soundEngine.isMuted ? "speaker.slash.fill" : "speaker.wave.2.fill")
                    .font(.system(size: 20))
                    .foregroundColor(soundEngine.isMuted ? .red : .cyan)
            }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
        .padding(.bottom, 8)
    }

    private func handlePlug() {
        soundEngine.play(soundPackStore.selectedPack.plugSound)
        hapticManager.plug()
        soundPackStore.incrementPlugCount()
        withAnimation(.easeOut(duration: 0.15)) { flashOpacity = 0.5 }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
            withAnimation(.easeIn(duration: 0.25)) { flashOpacity = 0 }
        }
    }

    private func handleUnplug() {
        soundEngine.play(soundPackStore.selectedPack.unplugSound)
        hapticManager.unplug()
    }

    #if DEBUG
    private var debugOverlay: some View {
        VStack {
            Spacer()
            HStack(spacing: 16) {
                Button("🔌 Plug") { chargerMonitor.simulatePlug() }
                    .buttonStyle(.borderedProminent).tint(.cyan)
                Button("💀 Unplug") { chargerMonitor.simulateUnplug() }
                    .buttonStyle(.borderedProminent).tint(.red)
            }
            .padding(.bottom, 160)
        }
    }
    #endif
}
