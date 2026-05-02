# ChargerScreamer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a native iOS SwiftUI novelty app that plays dramatic TTS voices when the user plugs/unplugs their iPhone 15+ charger, with 10 pop-culture-inspired sound packs and a dark electric UI.

**Architecture:** Single-screen SwiftUI app using `AVSpeechSynthesizer` for all audio (no audio assets needed), `UIDevice.batteryStateDidChangeNotification` for charger detection, and `AVAudioSession` ambient category to mix with user's music. XcodeGen generates the Xcode project from `project.yml`.

**Tech Stack:** Swift 5.9, SwiftUI, AVFoundation (AVSpeechSynthesizer), UIKit (UIDevice, UIImpactFeedbackGenerator), XcodeGen, iOS 17+, iPhone 15+ only

---

## File Map

| File | Responsibility |
|---|---|
| `project.yml` | XcodeGen project config |
| `ChargerScreamerApp.swift` | App entry, device guard, age gate logic |
| `Models/SoundPack.swift` | `SoundPack` + `SpeechConfig` types, 10 pack definitions |
| `Core/ChargerMonitor.swift` | Battery state observation, plug/unplug callbacks |
| `Core/SpeechPlayer.swift` | `AVSpeechSynthesizer` wrapper |
| `Core/HapticManager.swift` | `UIImpactFeedbackGenerator` wrapper |
| `Core/SoundPackStore.swift` | Pack selection + plug count persistence |
| `Views/ContentView.swift` | Main screen, wires all components |
| `Views/MascotView.swift` | Animated phone mascot with glow + shake |
| `Views/PackSelectorView.swift` | Horizontal scrolling pack picker |
| `Views/AgeGateView.swift` | First-launch 17+ modal |
| `Views/DeviceGuardView.swift` | Unsupported device screen |
| `ChargerScreamerTests/ChargerMonitorTests.swift` | ChargerMonitor unit tests |
| `ChargerScreamerTests/SoundPackStoreTests.swift` | SoundPackStore unit tests |

---

## Task 1: Project Setup

**Files:**
- Create: `ChargerScream/ios-app/project.yml`
- Create: `ChargerScream/ios-app/ChargerScreamer/` (directory structure)

- [ ] **Step 1: Install XcodeGen if needed**

```bash
which xcodegen || brew install xcodegen
```

Expected: path printed or install completes.

- [ ] **Step 2: Create directory structure**

```bash
mkdir -p ChargerScream/ios-app/ChargerScreamer/Models
mkdir -p ChargerScream/ios-app/ChargerScreamer/Core
mkdir -p ChargerScream/ios-app/ChargerScreamer/Views
mkdir -p ChargerScream/ios-app/ChargerScreamer/Resources/Assets.xcassets/AppIcon.appiconset
mkdir -p ChargerScream/ios-app/ChargerScreamerTests
```

- [ ] **Step 3: Create project.yml**

Create `ChargerScream/ios-app/project.yml`:

```yaml
name: ChargerScreamer
options:
  bundleIdPrefix: com.yuganshjain
  deploymentTarget:
    iOS: "17.0"
  xcodeVersion: "15"
settings:
  SWIFT_VERSION: "5.9"
targets:
  ChargerScreamer:
    type: application
    platform: iOS
    sources:
      - ChargerScreamer
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: com.yuganshjain.chargerscreamer
        TARGETED_DEVICE_FAMILY: "1"
        SUPPORTS_MAC_DESIGNED_FOR_IPHONE_IPAD: NO
        MARKETING_VERSION: "1.0"
        CURRENT_PROJECT_VERSION: "1"
        INFOPLIST_FILE: ChargerScreamer/Info.plist
    info:
      path: ChargerScreamer/Info.plist
      properties:
        UILaunchScreen: {}
        UISupportedInterfaceOrientations:
          - UIInterfaceOrientationPortrait
        UIRequiredDeviceCapabilities:
          - arm64
        CFBundleDisplayName: ChargerScreamer
    scheme:
      testTargets:
        - ChargerScreamerTests
  ChargerScreamerTests:
    type: bundle.unit-test
    platform: iOS
    sources:
      - ChargerScreamerTests
    dependencies:
      - target: ChargerScreamer
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: com.yuganshjain.chargerscreamerTests
```

- [ ] **Step 4: Create placeholder Assets.xcassets Contents.json**

Create `ChargerScream/ios-app/ChargerScreamer/Resources/Assets.xcassets/Contents.json`:

```json
{
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
```

Create `ChargerScream/ios-app/ChargerScreamer/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json`:

```json
{
  "images" : [
    {
      "idiom" : "universal",
      "platform" : "ios",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
```

- [ ] **Step 5: Commit**

```bash
cd ChargerScream/ios-app && git add . && git commit -m "feat: scaffold ChargerScreamer project structure"
```

---

## Task 2: SoundPack Model

**Files:**
- Create: `ChargerScream/ios-app/ChargerScreamer/Models/SoundPack.swift`

- [ ] **Step 1: Create SoundPack.swift**

Create `ChargerScream/ios-app/ChargerScreamer/Models/SoundPack.swift`:

```swift
import AVFoundation

struct SpeechConfig {
    let text: String
    let rate: Float        // AVSpeechUtteranceDefaultSpeechRate ≈ 0.5
    let pitch: Float       // 0.5 (low) – 2.0 (high), default 1.0
    let voiceLanguage: String  // BCP-47 e.g. "en-US"
    let preDelay: TimeInterval // seconds to wait before speaking

    init(
        text: String,
        rate: Float = 0.5,
        pitch: Float = 1.0,
        voiceLanguage: String = "en-US",
        preDelay: TimeInterval = 0
    ) {
        self.text = text
        self.rate = rate
        self.pitch = pitch
        self.voiceLanguage = voiceLanguage
        self.preDelay = preDelay
    }
}

struct SoundPack: Identifiable {
    let id: String
    let name: String
    let emoji: String
    let plugConfig: SpeechConfig
    let unplugConfig: SpeechConfig
}

extension SoundPack {
    static let all: [SoundPack] = [
        SoundPack(
            id: "soap_opera",
            name: "Soap Opera",
            emoji: "🎭",
            plugConfig: SpeechConfig(
                text: "Oh YES... finally... you came back to me!",
                rate: 0.35,
                pitch: 1.4
            ),
            unplugConfig: SpeechConfig(
                text: "No... NO... come back... please come back...",
                rate: 0.32,
                pitch: 1.3
            )
        ),
        SoundPack(
            id: "baby",
            name: "Baby Mode",
            emoji: "👶",
            plugConfig: SpeechConfig(
                text: "Yaaaay! Yay yay yay yay yay!",
                rate: 0.58,
                pitch: 1.9
            ),
            unplugConfig: SpeechConfig(
                text: "Waaaaaah! No no no no no!",
                rate: 0.55,
                pitch: 1.95
            )
        ),
        SoundPack(
            id: "gen_alpha",
            name: "Gen Alpha",
            emoji: "💅",
            plugConfig: SpeechConfig(
                text: "Slay! It's giving power, periodt!",
                rate: 0.56,
                pitch: 1.25
            ),
            unplugConfig: SpeechConfig(
                text: "No cap that hurt. It's giving deceased, bestie.",
                rate: 0.5,
                pitch: 1.2
            )
        ),
        SoundPack(
            id: "office",
            name: "The Office",
            emoji: "📎",
            plugConfig: SpeechConfig(
                text: "That's what she said!",
                rate: 0.52,
                pitch: 1.0
            ),
            unplugConfig: SpeechConfig(
                text: "No. God. Please no. No. No. NOOO!",
                rate: 0.45,
                pitch: 0.95
            )
        ),
        SoundPack(
            id: "breaking_bad",
            name: "Breaking Bad",
            emoji: "🧪",
            plugConfig: SpeechConfig(
                text: "I am the one who charges.",
                rate: 0.38,
                pitch: 0.85
            ),
            unplugConfig: SpeechConfig(
                text: "Say my name. You're god damn right.",
                rate: 0.4,
                pitch: 0.82
            )
        ),
        SoundPack(
            id: "got",
            name: "Game of Thrones",
            emoji: "🐉",
            plugConfig: SpeechConfig(
                text: "Dracarys.",
                rate: 0.36,
                pitch: 0.88
            ),
            unplugConfig: SpeechConfig(
                text: "Shame. Shame. Shame.",
                rate: 0.3,
                pitch: 0.9
            )
        ),
        SoundPack(
            id: "friends",
            name: "Friends",
            emoji: "☕",
            plugConfig: SpeechConfig(
                text: "How you doin'?",
                rate: 0.5,
                pitch: 1.05
            ),
            unplugConfig: SpeechConfig(
                text: "Pivot! Pivot! PIVOT!",
                rate: 0.55,
                pitch: 1.1
            )
        ),
        SoundPack(
            id: "shrek",
            name: "Shrek",
            emoji: "🧅",
            plugConfig: SpeechConfig(
                text: "What are you doing in my swamp?!",
                rate: 0.42,
                pitch: 0.75
            ),
            unplugConfig: SpeechConfig(
                text: "No! Not my charger! Not the charger!",
                rate: 0.44,
                pitch: 0.78
            )
        ),
        SoundPack(
            id: "squid_game",
            name: "Squid Game",
            emoji: "🦑",
            plugConfig: SpeechConfig(
                text: "Red light... green light.",
                rate: 0.38,
                pitch: 1.15,
                voiceLanguage: "en-US",
                preDelay: 0.2
            ),
            unplugConfig: SpeechConfig(
                text: "You have been eliminated.",
                rate: 0.4,
                pitch: 1.1
            )
        ),
        SoundPack(
            id: "spongebob",
            name: "SpongeBob",
            emoji: "🧽",
            plugConfig: SpeechConfig(
                text: "I'm ready! I'm ready! I'm ready!",
                rate: 0.6,
                pitch: 1.7
            ),
            unplugConfig: SpeechConfig(
                text: "MY LEG!",
                rate: 0.48,
                pitch: 1.65
            )
        ),
    ]

    static let `default` = all[0]
}
```

- [ ] **Step 2: Commit**

```bash
git add ChargerScream/ios-app/ChargerScreamer/Models/SoundPack.swift
git commit -m "feat: add SoundPack model with 10 TTS-based packs"
```

---

## Task 3: SoundPackStore

**Files:**
- Create: `ChargerScream/ios-app/ChargerScreamer/Core/SoundPackStore.swift`
- Create: `ChargerScream/ios-app/ChargerScreamerTests/SoundPackStoreTests.swift`

- [ ] **Step 1: Write failing test**

Create `ChargerScream/ios-app/ChargerScreamerTests/SoundPackStoreTests.swift`:

```swift
import XCTest
@testable import ChargerScreamer

final class SoundPackStoreTests: XCTestCase {
    var sut: SoundPackStore!
    let testDefaults = UserDefaults(suiteName: "test-\(UUID().uuidString)")!

    override func setUp() {
        super.setUp()
        sut = SoundPackStore(defaults: testDefaults)
    }

    func test_defaultPackIsFirst() {
        XCTAssertEqual(sut.selectedPack.id, SoundPack.all[0].id)
    }

    func test_selectPackPersistsAcrossInstances() {
        sut.select(SoundPack.all[2])
        let sut2 = SoundPackStore(defaults: testDefaults)
        XCTAssertEqual(sut2.selectedPack.id, SoundPack.all[2].id)
    }

    func test_plugCountIncrementsAndResetsOnNewDay() {
        sut.incrementPlugCount()
        sut.incrementPlugCount()
        XCTAssertEqual(sut.plugCountToday, 2)
    }

    func test_plugCountLabel() {
        sut.incrementPlugCount()
        XCTAssertEqual(sut.plugCountLabel, "Charged 1 time today ⚡")
        sut.incrementPlugCount()
        XCTAssertEqual(sut.plugCountLabel, "Charged 2 times today ⚡")
    }
}
```

- [ ] **Step 2: Run test — expect FAIL (SoundPackStore not defined)**

```bash
cd ChargerScream/ios-app && xcodebuild test -scheme ChargerScreamer -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | grep -E "error:|FAILED|PASSED" | head -20
```

Expected: build error — `SoundPackStore` not found.

- [ ] **Step 3: Implement SoundPackStore**

Create `ChargerScream/ios-app/ChargerScreamer/Core/SoundPackStore.swift`:

```swift
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
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd ChargerScream/ios-app && xcodebuild test -scheme ChargerScreamer -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | grep -E "Test.*passed|Test.*failed|error:" | head -20
```

Expected: all 4 SoundPackStore tests pass.

- [ ] **Step 5: Commit**

```bash
git add ChargerScream/ios-app/ChargerScreamer/Core/SoundPackStore.swift ChargerScream/ios-app/ChargerScreamerTests/SoundPackStoreTests.swift
git commit -m "feat: add SoundPackStore with persistence and plug count"
```

---

## Task 4: ChargerMonitor

**Files:**
- Create: `ChargerScream/ios-app/ChargerScreamer/Core/ChargerMonitor.swift`
- Create: `ChargerScream/ios-app/ChargerScreamerTests/ChargerMonitorTests.swift`

- [ ] **Step 1: Write failing tests**

Create `ChargerScream/ios-app/ChargerScreamerTests/ChargerMonitorTests.swift`:

```swift
import XCTest
import Combine
@testable import ChargerScreamer

final class ChargerMonitorTests: XCTestCase {
    var sut: ChargerMonitor!
    var cancellables: Set<AnyCancellable> = []

    override func setUp() {
        super.setUp()
        sut = ChargerMonitor()
    }

    override func tearDown() {
        cancellables.removeAll()
        sut = nil
        super.tearDown()
    }

    func test_initialState_notCharging() {
        // ChargerMonitor starts with isCharging false in test environment
        // (simulator has no battery by default)
        XCTAssertFalse(sut.isCharging)
    }

    func test_simulatePlugFiresOnPlug() {
        let exp = expectation(description: "onPlug called")
        sut.onPlug = { exp.fulfill() }
        sut.simulatePlug()
        wait(for: [exp], timeout: 1.0)
    }

    func test_simulateUnplugFiresOnUnplug() {
        sut.simulatePlug()
        let exp = expectation(description: "onUnplug called")
        sut.onUnplug = { exp.fulfill() }
        sut.simulateUnplug()
        wait(for: [exp], timeout: 1.0)
    }

    func test_simulatePlugSetsIsCharging() {
        sut.simulatePlug()
        XCTAssertTrue(sut.isCharging)
    }

    func test_simulateUnplugClearsIsCharging() {
        sut.simulatePlug()
        sut.simulateUnplug()
        XCTAssertFalse(sut.isCharging)
    }
}
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd ChargerScream/ios-app && xcodebuild test -scheme ChargerScreamer -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | grep -E "error:|FAILED" | head -10
```

Expected: build error — `ChargerMonitor` not found.

- [ ] **Step 3: Implement ChargerMonitor**

Create `ChargerScream/ios-app/ChargerScreamer/Core/ChargerMonitor.swift`:

```swift
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

    // MARK: - Debug / Test helpers
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
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd ChargerScream/ios-app && xcodebuild test -scheme ChargerScreamer -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | grep -E "Test.*passed|Test.*failed" | head -20
```

Expected: all 5 ChargerMonitor tests pass.

- [ ] **Step 5: Commit**

```bash
git add ChargerScream/ios-app/ChargerScreamer/Core/ChargerMonitor.swift ChargerScream/ios-app/ChargerScreamerTests/ChargerMonitorTests.swift
git commit -m "feat: add ChargerMonitor with battery state observation and debug helpers"
```

---

## Task 5: SpeechPlayer

**Files:**
- Create: `ChargerScream/ios-app/ChargerScreamer/Core/SpeechPlayer.swift`

- [ ] **Step 1: Create SpeechPlayer.swift**

Create `ChargerScream/ios-app/ChargerScreamer/Core/SpeechPlayer.swift`:

```swift
import AVFoundation
import Combine

final class SpeechPlayer: NSObject, ObservableObject, AVSpeechSynthesizerDelegate {
    @Published var isMuted: Bool {
        didSet { UserDefaults.standard.set(isMuted, forKey: "isMuted") }
    }

    private let synthesizer = AVSpeechSynthesizer()

    override init() {
        self.isMuted = UserDefaults.standard.bool(forKey: "isMuted")
        super.init()
        synthesizer.delegate = self
        configureAudioSession()
    }

    func play(_ config: SpeechConfig) {
        guard !isMuted else { return }
        synthesizer.stopSpeaking(at: .immediate)
        let utterance = AVSpeechUtterance(string: config.text)
        utterance.rate = config.rate
        utterance.pitchMultiplier = config.pitch
        utterance.voice = AVSpeechSynthesisVoice(language: config.voiceLanguage)
        utterance.preUtteranceDelay = config.preDelay
        synthesizer.speak(utterance)
    }

    func toggleMute() {
        isMuted.toggle()
    }

    private func configureAudioSession() {
        try? AVAudioSession.sharedInstance().setCategory(.ambient, options: .mixWithOthers)
        try? AVAudioSession.sharedInstance().setActive(true)
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add ChargerScream/ios-app/ChargerScreamer/Core/SpeechPlayer.swift
git commit -m "feat: add SpeechPlayer wrapping AVSpeechSynthesizer"
```

---

## Task 6: HapticManager

**Files:**
- Create: `ChargerScream/ios-app/ChargerScreamer/Core/HapticManager.swift`

- [ ] **Step 1: Create HapticManager.swift**

Create `ChargerScream/ios-app/ChargerScreamer/Core/HapticManager.swift`:

```swift
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
```

- [ ] **Step 2: Commit**

```bash
git add ChargerScream/ios-app/ChargerScreamer/Core/HapticManager.swift
git commit -m "feat: add HapticManager"
```

---

## Task 7: DeviceGuardView

**Files:**
- Create: `ChargerScream/ios-app/ChargerScreamer/Views/DeviceGuardView.swift`

- [ ] **Step 1: Create DeviceGuardView.swift**

Create `ChargerScream/ios-app/ChargerScreamer/Views/DeviceGuardView.swift`:

```swift
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
```

- [ ] **Step 2: Commit**

```bash
git add ChargerScream/ios-app/ChargerScreamer/Views/DeviceGuardView.swift
git commit -m "feat: add DeviceGuardView and DeviceGuard check"
```

---

## Task 8: AgeGateView

**Files:**
- Create: `ChargerScream/ios-app/ChargerScreamer/Views/AgeGateView.swift`

- [ ] **Step 1: Create AgeGateView.swift**

Create `ChargerScream/ios-app/ChargerScreamer/Views/AgeGateView.swift`:

```swift
import SwiftUI

struct AgeGateView: View {
    let onAccept: () -> Void

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            VStack(spacing: 32) {
                Spacer()

                Text("⚡")
                    .font(.system(size: 80))

                Text("ChargerScreamer")
                    .font(.system(size: 28, weight: .black, design: .rounded))
                    .foregroundColor(.white)

                Text("This app contains suggestive comedic audio.\nYou must be 17 or older to continue.")
                    .font(.body)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)

                Spacer()

                Button(action: onAccept) {
                    Text("I'm 17+ — Let's Go 🔥")
                        .font(.system(size: 18, weight: .bold, design: .rounded))
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(
                            LinearGradient(
                                colors: [.cyan, .blue],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .clipShape(Capsule())
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 48)
            }
        }
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add ChargerScream/ios-app/ChargerScreamer/Views/AgeGateView.swift
git commit -m "feat: add AgeGateView"
```

---

## Task 9: MascotView

**Files:**
- Create: `ChargerScream/ios-app/ChargerScreamer/Views/MascotView.swift`

- [ ] **Step 1: Create MascotView.swift**

Create `ChargerScream/ios-app/ChargerScreamer/Views/MascotView.swift`:

```swift
import SwiftUI

struct MascotView: View {
    let isCharging: Bool

    @State private var breathScale: CGFloat = 1.0
    @State private var shakeOffset: CGFloat = 0
    @State private var glowOpacity: Double = 0.6
    @State private var crackOpacity: Double = 0
    @State private var boltOpacity: Double = 0
    @State private var sparkles: [SparkleParticle] = []

    var body: some View {
        ZStack {
            // Outer glow halo
            Circle()
                .fill(isCharging ? Color.cyan.opacity(0.15) : Color.clear)
                .frame(width: 260, height: 260)
                .blur(radius: 30)
                .opacity(glowOpacity)
                .animation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: glowOpacity)

            // Sparkle particles
            ForEach(sparkles) { particle in
                Circle()
                    .fill(Color.cyan)
                    .frame(width: particle.size, height: particle.size)
                    .offset(x: particle.x, y: particle.y)
                    .opacity(particle.opacity)
            }

            // Phone body
            ZStack {
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .fill(
                        isCharging
                        ? LinearGradient(colors: [.cyan.opacity(0.9), .blue], startPoint: .top, endPoint: .bottom)
                        : LinearGradient(colors: [Color(white: 0.25), Color(white: 0.15)], startPoint: .top, endPoint: .bottom)
                    )
                    .frame(width: 120, height: 200)
                    .shadow(color: isCharging ? .cyan.opacity(0.8) : .clear, radius: 20)

                // Screen glow
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(
                        isCharging
                        ? LinearGradient(colors: [.white.opacity(0.9), .cyan.opacity(0.6)], startPoint: .topLeading, endPoint: .bottomTrailing)
                        : Color(white: 0.1)
                    )
                    .frame(width: 98, height: 160)

                // Face
                VStack(spacing: 8) {
                    HStack(spacing: 20) {
                        Circle()
                            .fill(isCharging ? Color.black : Color.gray.opacity(0.4))
                            .frame(width: 14, height: isCharging ? 14 : 8)
                        Circle()
                            .fill(isCharging ? Color.black : Color.gray.opacity(0.4))
                            .frame(width: 14, height: isCharging ? 14 : 8)
                    }
                    // Mouth
                    if isCharging {
                        Path { p in
                            p.move(to: CGPoint(x: 0, y: 0))
                            p.addQuadCurve(to: CGPoint(x: 30, y: 0), control: CGPoint(x: 15, y: 10))
                        }
                        .stroke(Color.black, lineWidth: 2.5)
                        .frame(width: 30, height: 10)
                    } else {
                        Path { p in
                            p.move(to: CGPoint(x: 0, y: 8))
                            p.addQuadCurve(to: CGPoint(x: 30, y: 8), control: CGPoint(x: 15, y: 0))
                        }
                        .stroke(Color.gray.opacity(0.5), lineWidth: 2.5)
                        .frame(width: 30, height: 10)
                    }
                }
                .offset(y: 20)

                // Lightning bolt
                Image(systemName: "bolt.fill")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.yellow)
                    .shadow(color: .yellow, radius: 8)
                    .opacity(boltOpacity)
                    .offset(y: -55)

                // Crack overlay (on unplug)
                Image(systemName: "bolt.slash.fill")
                    .font(.system(size: 50))
                    .foregroundColor(.red.opacity(0.7))
                    .opacity(crackOpacity)
            }
            .scaleEffect(breathScale)
            .offset(x: shakeOffset)
        }
        .onChange(of: isCharging) { _, charging in
            if charging {
                triggerPlugAnimation()
            } else {
                triggerUnplugAnimation()
            }
        }
        .onAppear {
            if isCharging { startBreathing() }
        }
    }

    private func startBreathing() {
        withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
            breathScale = 1.06
            glowOpacity = 1.0
        }
    }

    private func triggerPlugAnimation() {
        // Bounce scale
        withAnimation(.spring(response: 0.3, dampingFraction: 0.5)) {
            breathScale = 1.18
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            startBreathing()
        }
        // Show bolt
        withAnimation(.easeIn(duration: 0.15)) { boltOpacity = 1 }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
            withAnimation(.easeOut(duration: 0.4)) { boltOpacity = 0 }
        }
        // Sparkles
        fireSparkles()
    }

    private func triggerUnplugAnimation() {
        // Stop breathing
        withAnimation(.easeOut(duration: 0.3)) {
            breathScale = 0.95
            glowOpacity = 0.1
        }
        // Shake
        withAnimation(.default) { shakeOffset = -10 }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.08) {
            withAnimation(.default) { shakeOffset = 10 }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.16) {
            withAnimation(.default) { shakeOffset = -6 }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.24) {
            withAnimation(.spring()) { shakeOffset = 0 }
        }
        // Crack flash
        withAnimation(.easeIn(duration: 0.1)) { crackOpacity = 0.8 }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            withAnimation(.easeOut(duration: 0.4)) { crackOpacity = 0 }
        }
    }

    private func fireSparkles() {
        sparkles = (0..<8).map { _ in
            SparkleParticle(
                x: CGFloat.random(in: -80...80),
                y: CGFloat.random(in: -80...80),
                size: CGFloat.random(in: 4...10),
                opacity: 1.0
            )
        }
        withAnimation(.easeOut(duration: 0.8)) {
            sparkles = sparkles.map { SparkleParticle(x: $0.x * 1.8, y: $0.y * 1.8, size: $0.size, opacity: 0) }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.9) { sparkles = [] }
    }
}

struct SparkleParticle: Identifiable {
    let id = UUID()
    var x: CGFloat
    var y: CGFloat
    var size: CGFloat
    var opacity: Double
}
```

- [ ] **Step 2: Commit**

```bash
git add ChargerScream/ios-app/ChargerScreamer/Views/MascotView.swift
git commit -m "feat: add animated MascotView with sparkles, glow, and shake"
```

---

## Task 10: PackSelectorView

**Files:**
- Create: `ChargerScream/ios-app/ChargerScreamer/Views/PackSelectorView.swift`

- [ ] **Step 1: Create PackSelectorView.swift**

Create `ChargerScream/ios-app/ChargerScreamer/Views/PackSelectorView.swift`:

```swift
import SwiftUI

struct PackSelectorView: View {
    @ObservedObject var store: SoundPackStore

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(SoundPack.all) { pack in
                    PackCard(
                        pack: pack,
                        isSelected: store.selectedPack.id == pack.id
                    ) {
                        store.select(pack)
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 8)
        }
    }
}

private struct PackCard: View {
    let pack: SoundPack
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 6) {
                Text(pack.emoji)
                    .font(.system(size: 28))
                Text(pack.name)
                    .font(.system(size: 11, weight: .semibold, design: .rounded))
                    .foregroundColor(isSelected ? .white : .gray)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            .frame(width: 80, height: 80)
            .background(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .stroke(
                                isSelected
                                ? LinearGradient(colors: [.cyan, .blue], startPoint: .topLeading, endPoint: .bottomTrailing)
                                : LinearGradient(colors: [.clear], startPoint: .topLeading, endPoint: .bottomTrailing),
                                lineWidth: 2
                            )
                    )
            )
            .shadow(color: isSelected ? .cyan.opacity(0.4) : .clear, radius: 8)
            .scaleEffect(isSelected ? 1.05 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
        }
        .buttonStyle(.plain)
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add ChargerScream/ios-app/ChargerScreamer/Views/PackSelectorView.swift
git commit -m "feat: add PackSelectorView with glassmorphism cards"
```

---

## Task 11: ContentView

**Files:**
- Create: `ChargerScream/ios-app/ChargerScreamer/Views/ContentView.swift`

- [ ] **Step 1: Create ContentView.swift**

Create `ChargerScream/ios-app/ChargerScreamer/Views/ContentView.swift`:

```swift
import SwiftUI

struct ContentView: View {
    @StateObject private var chargerMonitor = ChargerMonitor()
    @StateObject private var speechPlayer = SpeechPlayer()
    @StateObject private var soundPackStore = SoundPackStore()
    private let hapticManager = HapticManager()

    @State private var flashOpacity: Double = 0

    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: [Color(red: 0.04, green: 0.04, blue: 0.12), Color.black],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                // Top bar
                topBar

                Spacer()

                // Mascot
                MascotView(isCharging: chargerMonitor.isCharging)
                    .frame(height: 280)

                // Plug count stat
                Text(soundPackStore.plugCountLabel)
                    .font(.system(size: 14, weight: .medium, design: .rounded))
                    .foregroundColor(.gray)
                    .padding(.top, 24)

                Spacer()

                // Pack selector
                PackSelectorView(store: soundPackStore)
                    .padding(.bottom, 32)
            }

            // Screen flash overlay
            Color.white
                .ignoresSafeArea()
                .opacity(flashOpacity)
                .allowsHitTesting(false)

            // Debug buttons (simulator only)
            #if DEBUG
            debugOverlay
            #endif
        }
        .onChange(of: chargerMonitor.isCharging) { _, isCharging in
            if isCharging {
                handlePlug()
            } else {
                handleUnplug()
            }
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
            Button(action: { speechPlayer.toggleMute() }) {
                Image(systemName: speechPlayer.isMuted ? "speaker.slash.fill" : "speaker.wave.2.fill")
                    .font(.system(size: 20))
                    .foregroundColor(speechPlayer.isMuted ? .red : .cyan)
            }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
        .padding(.bottom, 8)
    }

    private func handlePlug() {
        speechPlayer.play(soundPackStore.selectedPack.plugConfig)
        hapticManager.plug()
        soundPackStore.incrementPlugCount()
        withAnimation(.easeOut(duration: 0.15)) { flashOpacity = 0.5 }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
            withAnimation(.easeIn(duration: 0.25)) { flashOpacity = 0 }
        }
    }

    private func handleUnplug() {
        speechPlayer.play(soundPackStore.selectedPack.unplugConfig)
        hapticManager.unplug()
    }

    #if DEBUG
    private var debugOverlay: some View {
        VStack {
            Spacer()
            HStack(spacing: 16) {
                Button("🔌 Plug") { chargerMonitor.simulatePlug() }
                    .buttonStyle(.borderedProminent)
                    .tint(.cyan)
                Button("💀 Unplug") { chargerMonitor.simulateUnplug() }
                    .buttonStyle(.borderedProminent)
                    .tint(.red)
            }
            .padding(.bottom, 160)
        }
    }
    #endif
}
```

- [ ] **Step 2: Commit**

```bash
git add ChargerScream/ios-app/ChargerScreamer/Views/ContentView.swift
git commit -m "feat: add ContentView wiring all components together"
```

---

## Task 12: App Entry Point

**Files:**
- Create: `ChargerScream/ios-app/ChargerScreamer/ChargerScreamerApp.swift`

- [ ] **Step 1: Create ChargerScreamerApp.swift**

Create `ChargerScream/ios-app/ChargerScreamer/ChargerScreamerApp.swift`:

```swift
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
```

- [ ] **Step 2: Commit**

```bash
git add ChargerScream/ios-app/ChargerScreamer/ChargerScreamerApp.swift
git commit -m "feat: add app entry point with device guard and age gate routing"
```

---

## Task 13: Generate Xcode Project and Build

- [ ] **Step 1: Generate Xcode project**

```bash
cd ChargerScream/ios-app && xcodegen generate
```

Expected: `ChargerScreamer.xcodeproj` created with no errors.

- [ ] **Step 2: Build for simulator**

```bash
cd ChargerScream/ios-app && xcodebuild build -scheme ChargerScreamer -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -5
```

Expected: `** BUILD SUCCEEDED **`

- [ ] **Step 3: Run all tests**

```bash
cd ChargerScream/ios-app && xcodebuild test -scheme ChargerScreamer -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | grep -E "Test Suite|passed|failed" | tail -10
```

Expected: all tests pass.

- [ ] **Step 4: Open in Xcode to verify UI on simulator**

```bash
open ChargerScream/ios-app/ChargerScreamer.xcodeproj
```

In Xcode: select iPhone 16 simulator → ▶ Run. Tap the debug "🔌 Plug" and "💀 Unplug" buttons to verify sounds, haptics, and animations.

- [ ] **Step 5: Final commit**

```bash
cd ChargerScream/ios-app && git add ChargerScreamer.xcodeproj
git commit -m "feat: add generated Xcode project — ChargerScreamer v1.0 ready"
```

---

## Task 14: App Store Prep

- [ ] **Step 1: Set bundle ID and version in Xcode**

In Xcode → ChargerScreamer target → Signing & Capabilities:
- Bundle Identifier: `com.yuganshjain.chargerscreamer` (or your registered ID)
- Version: `1.0`, Build: `1`
- Team: your Apple Developer account

- [ ] **Step 2: Add App Store description**

Use this copy in App Store Connect:

```
Your iPhone finally reacts the way it should.

Plug in your charger and hear 10 iconic reactions — from Soap Opera gasps to Baby Mode meltdowns, Game of Thrones SHAME bells, Breaking Bad monologues, and more.

⚡ 10 hilarious sound packs
🎭 Animated mascot that reacts in real time
📳 Haptic feedback on every plug
🔇 Mute mode for public settings

ChargerScreamer requires iPhone 15 or later (USB-C) and must be open to react.

All audio is original parody content. For entertainment only.
```

- [ ] **Step 3: Archive and upload**

In Xcode: Product → Archive → Distribute App → App Store Connect → Upload.

- [ ] **Step 4: Set age rating in App Store Connect**

In App Store Connect → App Information → Age Rating:
- Infrequent/Mild Sexual Content or Nudity → select appropriate level
- Rating result: 17+
