# FocusPath iOS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build FocusPath as a native iOS app (SwiftUI, iOS 17+) that trains ADHD users to build longer attention spans through daily spiritual reading — published to the App Store under the existing Apple Developer account (`com.yuganshjain`).

**Architecture:** XcodeGen project at `focuspath-ios/`. Passages bundled as JSON. SwiftData for local persistence (sessions, quiz cache, settings). Claude API called via URLSession. No third-party dependencies. Tab bar navigation: Home · Today · Progress · Settings.

**Tech Stack:** SwiftUI · iOS 17+ · SwiftData · XcodeGen · URLSession · Claude API (`claude-haiku-4-5-20251001`) · XCTest

---

## Color Tokens (Sacred Cream + Saffron)

Used throughout all tasks — define once in `Theme.swift`:

```swift
// Background layers
Color(red: 0.992, green: 0.965, blue: 0.925) // cream     #fdf6ec
Color(red: 0.980, green: 0.922, blue: 0.843) // creamDark #faebd7
Color(red: 0.910, green: 0.855, blue: 0.718) // border    #e8d5b7
// Accents
Color(red: 0.910, green: 0.361, blue: 0.016) // saffron   #e85d04
Color(red: 0.957, green: 0.549, blue: 0.024) // saffronLight #f48c06
// Text
Color(red: 0.239, green: 0.169, blue: 0.122) // brown     #3d2b1f
Color(red: 0.478, green: 0.361, blue: 0.227) // brownMid  #7a5c3a
Color(red: 0.627, green: 0.518, blue: 0.361) // brownMuted #a0845c
```

---

## File Structure

```
focuspath-ios/
├── project.yml                          # XcodeGen config
├── FocusPath/
│   ├── FocusPathApp.swift               # @main entry point, tab bar
│   ├── Theme.swift                      # Color tokens, fonts
│   ├── Models/
│   │   ├── Passage.swift                # Codable struct + Tradition enum
│   │   ├── FocusSession.swift           # SwiftData @Model
│   │   ├── QuizCache.swift              # SwiftData @Model (cached questions)
│   │   └── QuizQuestion.swift           # Codable struct
│   ├── Data/
│   │   ├── PassageStore.swift           # Loads JSON, todayPassage(), getById()
│   │   └── Passages.json                # All spiritual passages
│   ├── Services/
│   │   └── ClaudeService.swift          # generateQuiz() via URLSession
│   ├── Views/
│   │   ├── Dashboard/
│   │   │   ├── DashboardView.swift
│   │   │   └── PassageCardView.swift
│   │   ├── Reading/
│   │   │   ├── ReadingView.swift
│   │   │   └── FocusTimerView.swift
│   │   ├── Quiz/
│   │   │   ├── QuizView.swift
│   │   │   └── QuizQuestionView.swift
│   │   ├── Progress/
│   │   │   ├── ProgressView.swift
│   │   │   └── WeeklyBarChart.swift
│   │   └── Settings/
│   │       └── SettingsView.swift
│   └── Info.plist
└── FocusPathTests/
    ├── PassageStoreTests.swift
    └── ClaudeServiceTests.swift
```

---

## Task 1: XcodeGen scaffold

**Files:**
- Create: `focuspath-ios/project.yml`
- Create: `focuspath-ios/FocusPath/Info.plist`

- [ ] **Step 1: Install XcodeGen if not present**

```bash
which xcodegen || brew install xcodegen
```

- [ ] **Step 2: Create project.yml**

Create `focuspath-ios/project.yml`:
```yaml
name: FocusPath
options:
  bundleIdPrefix: com.yuganshjain
  deploymentTarget:
    iOS: "17.0"
  xcodeVersion: "16"
settings:
  SWIFT_VERSION: "5.10"
packages: {}
targets:
  FocusPath:
    type: application
    platform: iOS
    sources:
      - FocusPath
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: com.yuganshjain.focuspath
        TARGETED_DEVICE_FAMILY: "1"
        MARKETING_VERSION: "1.0"
        CURRENT_PROJECT_VERSION: "1"
        INFOPLIST_FILE: FocusPath/Info.plist
        SWIFT_STRICT_CONCURRENCY: complete
    info:
      path: FocusPath/Info.plist
      properties:
        UILaunchScreen: {}
        UISupportedInterfaceOrientations:
          - UIInterfaceOrientationPortrait
        UIRequiredDeviceCapabilities:
          - arm64
        CFBundleDisplayName: FocusPath
        NSUserTrackingUsageDescription: ""
    scheme:
      testTargets:
        - FocusPathTests
  FocusPathTests:
    type: bundle.unit-test
    platform: iOS
    sources:
      - FocusPathTests
    dependencies:
      - target: FocusPath
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: com.yuganshjain.focuspathTests
```

- [ ] **Step 3: Create directory structure**

```bash
mkdir -p focuspath-ios/FocusPath/{Models,Data,Services,Views/{Dashboard,Reading,Quiz,Progress,Settings}}
mkdir -p focuspath-ios/FocusPathTests
```

- [ ] **Step 4: Generate Xcode project**

```bash
cd focuspath-ios && xcodegen generate
```
Expected: `✅ Generated: FocusPath.xcodeproj`

- [ ] **Step 5: Commit**

```bash
git add focuspath-ios/
git commit -m "feat: scaffold FocusPath iOS project with XcodeGen"
```

---

## Task 2: Theme + Models

**Files:**
- Create: `focuspath-ios/FocusPath/Theme.swift`
- Create: `focuspath-ios/FocusPath/Models/Passage.swift`
- Create: `focuspath-ios/FocusPath/Models/QuizQuestion.swift`
- Create: `focuspath-ios/FocusPath/Models/FocusSession.swift`
- Create: `focuspath-ios/FocusPath/Models/QuizCache.swift`

- [ ] **Step 1: Create Theme.swift**

Create `focuspath-ios/FocusPath/Theme.swift`:
```swift
import SwiftUI

enum Theme {
    static let cream        = Color(red: 0.992, green: 0.965, blue: 0.925)
    static let creamDark    = Color(red: 0.980, green: 0.922, blue: 0.843)
    static let border       = Color(red: 0.910, green: 0.855, blue: 0.718)
    static let saffron      = Color(red: 0.910, green: 0.361, blue: 0.016)
    static let saffronLight = Color(red: 0.957, green: 0.549, blue: 0.024)
    static let brown        = Color(red: 0.239, green: 0.169, blue: 0.122)
    static let brownMid     = Color(red: 0.478, green: 0.361, blue: 0.227)
    static let brownMuted   = Color(red: 0.627, green: 0.518, blue: 0.361)
    static let greenOk      = Color(red: 0.298, green: 0.686, blue: 0.314)
    static let redErr       = Color(red: 0.898, green: 0.224, blue: 0.208)

    static let saffronGradient = LinearGradient(
        colors: [saffron, saffronLight],
        startPoint: .leading,
        endPoint: .trailing
    )
}
```

- [ ] **Step 2: Create Passage model**

Create `focuspath-ios/FocusPath/Models/Passage.swift`:
```swift
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
```

- [ ] **Step 3: Create QuizQuestion model**

Create `focuspath-ios/FocusPath/Models/QuizQuestion.swift`:
```swift
import Foundation

struct QuizQuestion: Codable, Identifiable {
    var id: String { question }
    let question: String
    let choices: [String]
    let correctIndex: Int
    let explanation: String
}
```

- [ ] **Step 4: Create FocusSession SwiftData model**

Create `focuspath-ios/FocusPath/Models/FocusSession.swift`:
```swift
import SwiftData
import Foundation

@Model
final class FocusSession {
    var id: String
    var passageId: String
    var focusSeconds: Int
    var quizScore: Int
    var completed: Bool
    var date: Date

    init(passageId: String, focusSeconds: Int, quizScore: Int, completed: Bool) {
        self.id = UUID().uuidString
        self.passageId = passageId
        self.focusSeconds = focusSeconds
        self.quizScore = quizScore
        self.completed = completed
        self.date = Date()
    }
}
```

- [ ] **Step 5: Create QuizCache SwiftData model**

Create `focuspath-ios/FocusPath/Models/QuizCache.swift`:
```swift
import SwiftData
import Foundation

@Model
final class QuizCache {
    var passageId: String
    var questionsData: Data  // JSON-encoded [QuizQuestion]
    var createdAt: Date

    init(passageId: String, questions: [QuizQuestion]) throws {
        self.passageId = passageId
        self.questionsData = try JSONEncoder().encode(questions)
        self.createdAt = Date()
    }

    func questions() throws -> [QuizQuestion] {
        try JSONDecoder().decode([QuizQuestion].self, from: questionsData)
    }
}
```

- [ ] **Step 6: Commit**

```bash
git add focuspath-ios/FocusPath/Theme.swift focuspath-ios/FocusPath/Models/
git commit -m "feat: add FocusPath models and theme tokens"
```

---

## Task 3: Passage data + PassageStore

**Files:**
- Create: `focuspath-ios/FocusPath/Data/Passages.json`
- Create: `focuspath-ios/FocusPath/Data/PassageStore.swift`
- Create: `focuspath-ios/FocusPathTests/PassageStoreTests.swift`

- [ ] **Step 1: Write failing tests**

Create `focuspath-ios/FocusPathTests/PassageStoreTests.swift`:
```swift
import XCTest
@testable import FocusPath

final class PassageStoreTests: XCTestCase {

    func testLoadsPassages() {
        let store = PassageStore.shared
        XCTAssertGreaterThan(store.all.count, 0)
    }

    func testTodayPassageDeterministic() {
        let store = PassageStore.shared
        let date = "2026-05-01"
        let a = store.todayPassage(dateString: date, traditions: nil)
        let b = store.todayPassage(dateString: date, traditions: nil)
        XCTAssertEqual(a.id, b.id)
    }

    func testTodayPassageDiffersAcrossDates() {
        let store = PassageStore.shared
        let ids = ["2026-05-01","2026-05-02","2026-05-03","2026-05-04"]
            .map { store.todayPassage(dateString: $0, traditions: nil).id }
        let unique = Set(ids)
        XCTAssertGreaterThan(unique.count, 1)
    }

    func testFiltersByTradition() {
        let store = PassageStore.shared
        let p = store.todayPassage(dateString: "2026-05-01", traditions: [.stoics])
        XCTAssertEqual(p.tradition, .stoics)
    }

    func testGetByIdFound() {
        let store = PassageStore.shared
        let p = store.passage(byId: store.all.first!.id)
        XCTAssertNotNil(p)
    }

    func testGetByIdMissing() {
        XCTAssertNil(PassageStore.shared.passage(byId: "not-real"))
    }
}
```

- [ ] **Step 2: Run to verify failure**

In Xcode: Product → Test (⌘U), or:
```bash
xcodebuild test -project focuspath-ios/FocusPath.xcodeproj \
  -scheme FocusPath -destination 'platform=iOS Simulator,name=iPhone 16' \
  -only-testing FocusPathTests/PassageStoreTests 2>&1 | tail -20
```
Expected: Build failure — `PassageStore` not found

- [ ] **Step 3: Create Passages.json**

Create `focuspath-ios/FocusPath/Data/Passages.json` (add this file to the Xcode target so it's bundled):
```json
[
  {
    "id": "stoics-001",
    "tradition": "stoics",
    "source": "Marcus Aurelius",
    "work": "Meditations",
    "quote": "You have power over your mind, not outside events.",
    "body": "You have power over your mind, not outside events. Realize this, and you will find strength.\n\nThe impediment to action advances action. What stands in the way becomes the way.\n\nWaste no more time arguing about what a good man should be. Be one.\n\nNever let the future disturb you. You will meet it, if you have to, with the same weapons of reason which today arm you against the present.",
    "estimatedMinutes": 5
  },
  {
    "id": "stoics-002",
    "tradition": "stoics",
    "source": "Epictetus",
    "work": "Enchiridion",
    "quote": "Make the best use of what is in your power.",
    "body": "Make the best use of what is in your power, and take the rest as it happens. Some things are in our control and others not. Things in our control are opinion, pursuit, desire, aversion, and, in a word, whatever are our own actions.\n\nThings not in our control are body, property, reputation, command, and, in one word, whatever are not our own actions. The things in our control are by nature free, unrestrained, unhindered.\n\nSeek not that the things which happen should happen as you wish; but wish the things which happen to be as they are, and you will have a tranquil flow of life.",
    "estimatedMinutes": 6
  },
  {
    "id": "stoics-003",
    "tradition": "stoics",
    "source": "Seneca",
    "work": "Letters from a Stoic",
    "quote": "We suffer more in imagination than in reality.",
    "body": "We suffer more in imagination than in reality. Begin at once to live, and count each separate day as a separate life.\n\nIt is not that I am brave, but that I know what is not worth fearing. While we are postponing, life speeds by.\n\nConcentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.\n\nLet us prepare our minds as if we had come to the very end of life. Let us postpone nothing. Let us balance life's books each day.",
    "estimatedMinutes": 6
  },
  {
    "id": "gita-001",
    "tradition": "gita",
    "source": "Bhagavad Gita",
    "work": "Chapter 2",
    "quote": "Let right deeds be thy motive, not the fruit which comes from them.",
    "body": "Let right deeds be thy motive, not the fruit which comes from them. And live in the action, labour! Make thine acts thy piety, casting all self aside, contemning gain and merit; so shall thine acts bring no bondage.\n\nNever the spirit was born; the spirit shall cease to be never. Never was time it was not; End and Beginning are dreams.\n\nIt is better to do one's own duty, however imperfectly, than to assume the duties of another person, however successfully.",
    "estimatedMinutes": 7
  },
  {
    "id": "gita-002",
    "tradition": "gita",
    "source": "Bhagavad Gita",
    "work": "Chapter 6",
    "quote": "The mind is restless and difficult to restrain, but it is subdued by practice.",
    "body": "The mind is restless and difficult to restrain, but it is subdued by practice. For those whose minds are uncontrolled, reaching the highest state is very hard. But those whose minds are controlled, and who strive by the right means, it is possible.\n\nA lamp does not flicker in a place where no wind blows; so it is with a yogi who controls his mind, intellect and self, being absorbed in the spirit within him.\n\nLet each man raise the self by the self. Let him not suffer the self to be lowered. For the Self is the friend of the self, and also the Self is the enemy of the self.",
    "estimatedMinutes": 7
  },
  {
    "id": "tao-001",
    "tradition": "tao",
    "source": "Lao Tzu",
    "work": "Tao Te Ching",
    "quote": "To the mind that is still, the whole universe surrenders.",
    "body": "To the mind that is still, the whole universe surrenders.\n\nThe Tao that can be told is not the eternal Tao. The name that can be named is not the eternal name. The nameless is the beginning of heaven and earth.\n\nKnowing others is wisdom; knowing yourself is enlightenment. Mastering others requires force; mastering yourself requires strength.\n\nDo you have the patience to wait until your mud settles and the water is clear? Can you remain unmoving until the right action arises by itself?",
    "estimatedMinutes": 6
  },
  {
    "id": "tao-002",
    "tradition": "tao",
    "source": "Chuang Tzu",
    "work": "Inner Chapters",
    "quote": "Flow with whatever may happen and let your mind be free.",
    "body": "Flow with whatever may happen and let your mind be free. Stay centered by accepting whatever you are doing. This is the ultimate.\n\nHappiness is the absence of the striving for happiness. To have no striving is to have no mind.\n\nOnly the person who has faith in himself is able to be faithful to others. If water derives lucidity from stillness, how much more the faculties of the mind.",
    "estimatedMinutes": 5
  },
  {
    "id": "upanishads-001",
    "tradition": "upanishads",
    "source": "Brihadaranyaka Upanishad",
    "work": "Book 1",
    "quote": "You are what your deep, driving desire is.",
    "body": "You are what your deep, driving desire is. As your desire is, so is your will. As your will is, so is your deed. As your deed is, so is your destiny.\n\nFrom joy springs all creation, by joy it is sustained, towards joy it proceeds, and into joy it enters.\n\nThis Self is never born nor does it ever perish; it did not come into existence, and it will not come into existence. This unborn, eternal, ever-existing, primordial being is not slain when the body is slain.",
    "estimatedMinutes": 7
  },
  {
    "id": "bible-001",
    "tradition": "bible",
    "source": "Psalms",
    "work": "Psalm 46",
    "quote": "Be still and know that I am God.",
    "body": "God is our refuge and strength, a very present help in trouble. Therefore we will not fear, even though the earth be removed, and though the mountains be carried into the midst of the sea.\n\nThere is a river whose streams shall make glad the city of God, the holy place of the tabernacle of the Most High.\n\nBe still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.",
    "estimatedMinutes": 5
  },
  {
    "id": "bible-002",
    "tradition": "bible",
    "source": "Sermon on the Mount",
    "work": "Matthew 5",
    "quote": "Blessed are the pure in heart, for they shall see God.",
    "body": "Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are those who mourn, for they shall be comforted. Blessed are the meek, for they shall inherit the earth.\n\nBlessed are the merciful, for they shall obtain mercy. Blessed are the pure in heart, for they shall see God. Blessed are the peacemakers, for they shall be called sons of God.\n\nYou are the light of the world. A city that is set on a hill cannot be hidden. Let your light so shine before men, that they may see your good works.",
    "estimatedMinutes": 6
  },
  {
    "id": "quran-001",
    "tradition": "quran",
    "source": "Quran",
    "work": "Surah Al-Baqarah 2:286",
    "quote": "Allah does not burden a soul beyond that it can bear.",
    "body": "Allah does not burden a soul beyond that it can bear. It will have what it has earned, and it will be held accountable for what it has deserved.\n\nVerily, with hardship comes ease. Verily, with hardship comes ease. So when you have finished your duties, then stand up for worship.\n\nAnd seek help through patience and prayer, and indeed, it is difficult except for the humbly submissive.",
    "estimatedMinutes": 5
  },
  {
    "id": "buddhist-001",
    "tradition": "buddhist",
    "source": "Dhammapada",
    "work": "Chapter 1",
    "quote": "The mind is everything. What you think, you become.",
    "body": "The mind is everything. What you think, you become. Mind is the forerunner of all actions. All deeds are led by mind, created by mind.\n\nHatred is never appeased by hatred in this world. By non-hatred alone is hatred appeased. This is a law eternal.\n\nBetter than a thousand hollow words, is one word that brings peace. Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
    "estimatedMinutes": 6
  },
  {
    "id": "buddhist-002",
    "tradition": "buddhist",
    "source": "Thich Nhat Hanh",
    "work": "The Miracle of Mindfulness",
    "quote": "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
    "body": "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor. Smile, breathe, and go slowly.\n\nThe present moment is the only moment available to us, and it is the door to all moments. People usually consider walking on water or in thin air a miracle. But I think the real miracle is to walk on earth.\n\nThe most precious gift we can offer anyone is our attention. When mindfulness embraces those we love, they will bloom like flowers.",
    "estimatedMinutes": 6
  }
]
```

- [ ] **Step 4: Create PassageStore.swift**

Create `focuspath-ios/FocusPath/Data/PassageStore.swift`:
```swift
import Foundation

final class PassageStore {
    static let shared = PassageStore()

    let all: [Passage]

    private init() {
        guard
            let url = Bundle.main.url(forResource: "Passages", withExtension: "json"),
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
```

- [ ] **Step 5: Run tests to verify pass**

```bash
xcodebuild test -project focuspath-ios/FocusPath.xcodeproj \
  -scheme FocusPath -destination 'platform=iOS Simulator,name=iPhone 16' \
  -only-testing FocusPathTests/PassageStoreTests 2>&1 | grep -E "PASS|FAIL|error:"
```
Expected: All 6 tests PASS

- [ ] **Step 6: Commit**

```bash
git add focuspath-ios/FocusPath/Data/ focuspath-ios/FocusPathTests/PassageStoreTests.swift
git commit -m "feat: add passage data and PassageStore with deterministic daily selection"
```

---

## Task 4: ClaudeService (quiz generation)

**Files:**
- Create: `focuspath-ios/FocusPath/Services/ClaudeService.swift`
- Create: `focuspath-ios/FocusPathTests/ClaudeServiceTests.swift`

- [ ] **Step 1: Write failing test**

Create `focuspath-ios/FocusPathTests/ClaudeServiceTests.swift`:
```swift
import XCTest
@testable import FocusPath

final class ClaudeServiceTests: XCTestCase {

    func testParseQuizResponse() throws {
        let json = """
        [
          {"question":"What is tested?","choices":["A","B","C","D"],"correctIndex":0,"explanation":"A is correct."},
          {"question":"Second?","choices":["P","Q","R","S"],"correctIndex":1,"explanation":"Q is correct."},
          {"question":"Third?","choices":["X","Y","Z","W"],"correctIndex":2,"explanation":"Z is correct."}
        ]
        """.data(using: .utf8)!

        let questions = try JSONDecoder().decode([QuizQuestion].self, from: json)
        XCTAssertEqual(questions.count, 3)
        XCTAssertEqual(questions[0].choices.count, 4)
        XCTAssertEqual(questions[1].correctIndex, 1)
        XCTAssertFalse(questions[2].explanation.isEmpty)
    }
}
```

- [ ] **Step 2: Run to verify failure**

```bash
xcodebuild test -project focuspath-ios/FocusPath.xcodeproj \
  -scheme FocusPath -destination 'platform=iOS Simulator,name=iPhone 16' \
  -only-testing FocusPathTests/ClaudeServiceTests 2>&1 | grep -E "PASS|FAIL|error:"
```
Expected: FAIL — `ClaudeService` not found (QuizQuestion is already defined, so the decode test itself may compile — that's fine)

- [ ] **Step 3: Create ClaudeService.swift**

Create `focuspath-ios/FocusPath/Services/ClaudeService.swift`:
```swift
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

        // Parse Anthropic response envelope
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
```

- [ ] **Step 4: Add ANTHROPIC_API_KEY to Info.plist**

In `focuspath-ios/project.yml`, under `FocusPath.info.properties`, add:
```yaml
ANTHROPIC_API_KEY: $(ANTHROPIC_API_KEY)
```

Create `focuspath-ios/FocusPath/Config.xcconfig` (not committed to git):
```
ANTHROPIC_API_KEY = your_key_here
```

Add to `.gitignore`:
```
focuspath-ios/FocusPath/Config.xcconfig
```

In `project.yml` under `FocusPath.settings.base`, add:
```yaml
XCCONFIG_FILE: FocusPath/Config.xcconfig
```

- [ ] **Step 5: Run test to verify pass**

```bash
xcodebuild test -project focuspath-ios/FocusPath.xcodeproj \
  -scheme FocusPath -destination 'platform=iOS Simulator,name=iPhone 16' \
  -only-testing FocusPathTests/ClaudeServiceTests 2>&1 | grep -E "PASS|FAIL|error:"
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add focuspath-ios/FocusPath/Services/ focuspath-ios/FocusPathTests/ClaudeServiceTests.swift focuspath-ios/.gitignore
git commit -m "feat: add ClaudeService for quiz generation via Anthropic API"
```

---

## Task 5: App entry point + SwiftData container

**Files:**
- Create: `focuspath-ios/FocusPath/FocusPathApp.swift`

- [ ] **Step 1: Create app entry point with tab bar**

Create `focuspath-ios/FocusPath/FocusPathApp.swift`:
```swift
import SwiftUI
import SwiftData

@main
struct FocusPathApp: App {
    var body: some Scene {
        WindowGroup {
            MainTabView()
        }
        .modelContainer(for: [FocusSession.self, QuizCache.self])
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem { Label("Home", systemImage: "house.fill") }

            ReadingView(passageId: PassageStore.shared
                .todayPassage(dateString: todayString(), traditions: nil).id)
                .tabItem { Label("Today", systemImage: "book.fill") }

            ProgressView_()
                .tabItem { Label("Progress", systemImage: "chart.bar.fill") }

            SettingsView()
                .tabItem { Label("Settings", systemImage: "gearshape.fill") }
        }
        .tint(Theme.saffron)
        .background(Theme.cream)
    }

    private func todayString() -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: Date())
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add focuspath-ios/FocusPath/FocusPathApp.swift
git commit -m "feat: add app entry point with SwiftData container and tab bar"
```

---

## Task 6: Dashboard view

**Files:**
- Create: `focuspath-ios/FocusPath/Views/Dashboard/DashboardView.swift`
- Create: `focuspath-ios/FocusPath/Views/Dashboard/PassageCardView.swift`

- [ ] **Step 1: Create PassageCardView**

Create `focuspath-ios/FocusPath/Views/Dashboard/PassageCardView.swift`:
```swift
import SwiftUI

struct PassageCardView: View {
    let passage: Passage

    var body: some View {
        NavigationLink(destination: ReadingView(passageId: passage.id)) {
            VStack(alignment: .leading, spacing: 10) {
                Text("TODAY'S PASSAGE")
                    .font(.system(size: 10, weight: .bold))
                    .tracking(2)
                    .foregroundStyle(.white.opacity(0.8))

                Text(""\(passage.quote)"")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.white)
                    .lineSpacing(4)

                Text("\(passage.source) · \(passage.work) · ~\(passage.estimatedMinutes) min")
                    .font(.system(size: 12))
                    .foregroundStyle(.white.opacity(0.75))

                HStack {
                    Spacer()
                    Text("Begin Today's Session →")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(.white.opacity(0.2))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    Spacer()
                }
                .padding(.top, 4)
            }
            .padding(20)
            .background(
                LinearGradient(
                    colors: [Theme.saffron, Theme.saffronLight],
                    startPoint: .topLeading, endPoint: .bottomTrailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: 20))
        }
    }
}
```

- [ ] **Step 2: Create DashboardView**

Create `focuspath-ios/FocusPath/Views/Dashboard/DashboardView.swift`:
```swift
import SwiftUI
import SwiftData

struct DashboardView: View {
    @Query(filter: #Predicate<FocusSession> { $0.completed == true },
           sort: \FocusSession.date) private var sessions: [FocusSession]
    @AppStorage("fp_traditions") private var traditionsData = ""

    private var todayPassage: Passage {
        let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"
        let enabled = enabledTraditions
        return PassageStore.shared.todayPassage(
            dateString: f.string(from: Date()),
            traditions: enabled.isEmpty ? nil : enabled
        )
    }

    private var enabledTraditions: [Tradition] {
        guard !traditionsData.isEmpty,
              let data = traditionsData.data(using: .utf8),
              let arr = try? JSONDecoder().decode([Tradition].self, from: data)
        else { return [] }
        return arr
    }

    private var streak: Int {
        guard !sessions.isEmpty else { return 0 }
        let calendar = Calendar.current
        let completedDays = Set(sessions.map { calendar.startOfDay(for: $0.date) })
        var count = 0
        var day = calendar.startOfDay(for: Date())
        while completedDays.contains(day) {
            count += 1
            day = calendar.date(byAdding: .day, value: -1, to: day)!
        }
        return count
    }

    private var avgFocusSeconds: Int {
        guard !sessions.isEmpty else { return 0 }
        return sessions.map(\.focusSeconds).reduce(0, +) / sessions.count
    }

    private var avgQuizPct: Int {
        guard !sessions.isEmpty else { return 0 }
        return sessions.map(\.quizScore).reduce(0, +) * 100 / (sessions.count * 3)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Header
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(greeting)
                                .font(.system(size: 22, weight: .bold))
                                .foregroundStyle(Theme.brown)
                            Text("Your mind grows stronger every day")
                                .font(.system(size: 14))
                                .foregroundStyle(Theme.brownMuted)
                        }
                        Spacer()
                        if streak > 0 {
                            Text("🔥 \(streak) days")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Theme.saffron)
                                .clipShape(Capsule())
                        }
                    }

                    // Today's passage
                    PassageCardView(passage: todayPassage)

                    // Stats
                    if !sessions.isEmpty {
                        HStack(spacing: 12) {
                            StatPill(value: formatTime(avgFocusSeconds), label: "Avg Focus")
                            StatPill(value: "\(sessions.count)", label: "Sessions")
                            StatPill(value: "\(avgQuizPct)%", label: "Quiz Score")
                        }
                    }
                }
                .padding(20)
            }
            .background(Theme.cream.ignoresSafeArea())
            .navigationBarHidden(true)
        }
    }

    private var greeting: String {
        let h = Calendar.current.component(.hour, from: Date())
        if h < 12 { return "Good morning" }
        if h < 17 { return "Good afternoon" }
        return "Good evening"
    }

    private func formatTime(_ seconds: Int) -> String {
        "\(seconds / 60)m \(seconds % 60)s"
    }
}

private struct StatPill: View {
    let value: String
    let label: String
    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.system(size: 20, weight: .black))
                .foregroundStyle(Theme.saffron)
            Text(label)
                .font(.system(size: 11))
                .foregroundStyle(Theme.brownMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(Theme.creamDark)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add focuspath-ios/FocusPath/Views/Dashboard/
git commit -m "feat: add FocusPath dashboard view"
```

---

## Task 7: Reading view + Focus timer

**Files:**
- Create: `focuspath-ios/FocusPath/Views/Reading/FocusTimerView.swift`
- Create: `focuspath-ios/FocusPath/Views/Reading/ReadingView.swift`

- [ ] **Step 1: Create FocusTimerView**

Create `focuspath-ios/FocusPath/Views/Reading/FocusTimerView.swift`:
```swift
import SwiftUI

struct FocusTimerView: View {
    let seconds: Int

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(formatted)
                    .font(.system(size: 36, weight: .black, design: .monospaced))
                    .foregroundStyle(Theme.saffron)
                Text("Time reading")
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.brownMuted)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text("Focus")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(Theme.brown)
                Text("Stay with it")
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.brownMuted)
            }
        }
        .padding(16)
        .background(Theme.creamDark)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Theme.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var formatted: String {
        String(format: "%02d:%02d", seconds / 60, seconds % 60)
    }
}
```

- [ ] **Step 2: Create ReadingView**

Create `focuspath-ios/FocusPath/Views/Reading/ReadingView.swift`:
```swift
import SwiftUI

struct ReadingView: View {
    let passageId: String

    @State private var elapsedSeconds = 0
    @State private var scrollProgress: CGFloat = 0
    @State private var timer: Timer?
    @State private var navigateToQuiz = false

    private var passage: Passage? { PassageStore.shared.passage(byId: passageId) }
    private var canFinish: Bool { elapsedSeconds >= 60 && scrollProgress >= 0.6 }

    var body: some View {
        Group {
            if let passage {
                content(passage)
            } else {
                Text("Passage not found").foregroundStyle(Theme.brownMuted)
            }
        }
        .navigationDestination(isPresented: $navigateToQuiz) {
            if let passage {
                QuizView(passage: passage, focusSeconds: elapsedSeconds)
            }
        }
        .onAppear { startTimer() }
        .onDisappear { timer?.invalidate() }
    }

    @ViewBuilder
    private func content(_ passage: Passage) -> some View {
        ZStack(alignment: .top) {
            // Scroll progress bar
            GeometryReader { geo in
                Rectangle()
                    .fill(Theme.border)
                    .frame(height: 3)
                Rectangle()
                    .fill(Theme.saffronGradient)
                    .frame(width: geo.size.width * scrollProgress, height: 3)
            }
            .frame(height: 3)
            .ignoresSafeArea(edges: .top)

            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Source
                    Text("\(passage.source) · \(passage.work)")
                        .font(.system(size: 12, weight: .bold))
                        .tracking(1.5)
                        .foregroundStyle(Theme.brownMuted)
                        .padding(.top, 8)

                    Text("Read carefully — you'll answer 3 questions after")
                        .font(.system(size: 12))
                        .foregroundStyle(Theme.brownMuted)

                    // Passage text
                    VStack(alignment: .leading, spacing: 16) {
                        ForEach(passage.body.components(separatedBy: "\n\n"), id: \.self) { para in
                            Text(para)
                                .font(.system(size: 17, design: .serif))
                                .foregroundStyle(Theme.brown)
                                .lineSpacing(6)
                        }
                    }

                    // Timer
                    FocusTimerView(seconds: elapsedSeconds)

                    // Done button
                    Button(action: { navigateToQuiz = true }) {
                        HStack {
                            Spacer()
                            Text(canFinish ? "I've finished reading →" : "Keep reading… (\(max(0, 60 - elapsedSeconds))s)")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundStyle(.white)
                            Spacer()
                        }
                        .padding(.vertical, 16)
                        .background(canFinish ? Theme.saffron : Theme.border)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                    .disabled(!canFinish)
                    .padding(.bottom, 20)
                }
                .padding(20)
                .background(
                    GeometryReader { geo -> Color in
                        DispatchQueue.main.async { updateProgress(geo) }
                        return Color.clear
                    }
                )
            }
            .background(Theme.cream)
        }
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .background(Theme.cream.ignoresSafeArea())
    }

    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            elapsedSeconds += 1
        }
    }

    private func updateProgress(_ geo: GeometryProxy) {
        let frame = geo.frame(in: .global)
        let screenHeight = UIScreen.main.bounds.height
        let contentHeight = frame.height
        let scrolled = max(0, -frame.minY)
        let maxScroll = max(1, contentHeight - screenHeight)
        scrollProgress = min(1, scrolled / maxScroll)
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add focuspath-ios/FocusPath/Views/Reading/
git commit -m "feat: add reading view with focus timer and scroll progress"
```

---

## Task 8: Quiz / comprehension gate

**Files:**
- Create: `focuspath-ios/FocusPath/Views/Quiz/QuizQuestionView.swift`
- Create: `focuspath-ios/FocusPath/Views/Quiz/QuizView.swift`

- [ ] **Step 1: Create QuizQuestionView**

Create `focuspath-ios/FocusPath/Views/Quiz/QuizQuestionView.swift`:
```swift
import SwiftUI

struct QuizQuestionView: View {
    let question: QuizQuestion
    let questionNumber: Int
    let total: Int
    let onAnswer: (Bool) -> Void

    @State private var selected: Int? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Progress dots
            HStack(spacing: 6) {
                ForEach(0..<total, id: \.self) { i in
                    Capsule()
                        .fill(dotColor(for: i))
                        .frame(maxWidth: .infinity)
                        .frame(height: 4)
                }
            }

            Text("Question \(questionNumber) of \(total)")
                .font(.system(size: 11, weight: .bold))
                .tracking(1.5)
                .foregroundStyle(Theme.brownMuted)

            Text(""\(question.question)"")
                .font(.system(size: 17, design: .serif))
                .foregroundStyle(Theme.brown)
                .italic()
                .lineSpacing(4)

            VStack(spacing: 10) {
                ForEach(Array(question.choices.enumerated()), id: \.offset) { i, choice in
                    Button(action: { choose(i) }) {
                        HStack {
                            Text(choice)
                                .font(.system(size: 15))
                                .foregroundStyle(choiceTextColor(i))
                                .multilineTextAlignment(.leading)
                            Spacer()
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .background(choiceBg(i))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(choiceBorder(i), lineWidth: 1.5)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .disabled(selected != nil)
                }
            }

            if let sel = selected {
                HStack(alignment: .top, spacing: 8) {
                    Text(sel == question.correctIndex ? "✓" : "✗")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(sel == question.correctIndex ? Theme.greenOk : Theme.redErr)
                    Text(question.explanation)
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.brownMid)
                }
                .padding(12)
                .background(sel == question.correctIndex
                    ? Theme.greenOk.opacity(0.08)
                    : Theme.redErr.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(sel == question.correctIndex ? Theme.greenOk : Theme.redErr, lineWidth: 1.5)
                )
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
    }

    private func choose(_ i: Int) {
        guard selected == nil else { return }
        selected = i
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            onAnswer(i == question.correctIndex)
        }
    }

    private func dotColor(for i: Int) -> Color {
        if i < questionNumber - 1 { return Theme.saffron }
        if i == questionNumber - 1 { return Theme.saffronLight }
        return Theme.border
    }

    private func choiceBg(_ i: Int) -> Color {
        guard let sel = selected else { return Theme.creamDark }
        if i == question.correctIndex { return Theme.greenOk.opacity(0.1) }
        if i == sel { return Theme.redErr.opacity(0.08) }
        return Theme.creamDark.opacity(0.5)
    }

    private func choiceBorder(_ i: Int) -> Color {
        guard let sel = selected else { return Theme.border }
        if i == question.correctIndex { return Theme.greenOk }
        if i == sel { return Theme.redErr }
        return Theme.border.opacity(0.4)
    }

    private func choiceTextColor(_ i: Int) -> Color {
        guard let sel = selected else { return Theme.brown }
        if i == question.correctIndex { return Color(red: 0.18, green: 0.49, blue: 0.20) }
        if i == sel { return Theme.redErr }
        return Theme.brownMuted
    }
}
```

- [ ] **Step 2: Create QuizView**

Create `focuspath-ios/FocusPath/Views/Quiz/QuizView.swift`:
```swift
import SwiftUI
import SwiftData

struct QuizView: View {
    let passage: Passage
    let focusSeconds: Int

    @Environment(\.modelContext) private var modelContext
    @State private var questions: [QuizQuestion] = []
    @State private var currentIndex = 0
    @State private var score = 0
    @State private var loading = true
    @State private var done = false
    @State private var error: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if loading {
                    loadingView
                } else if done {
                    resultView
                } else if let error {
                    errorView(error)
                } else if !questions.isEmpty {
                    quizContent
                }
            }
            .padding(20)
        }
        .background(Theme.cream.ignoresSafeArea())
        .navigationTitle("Comprehension")
        .navigationBarTitleDisplayMode(.inline)
        .task { await loadQuiz() }
    }

    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .tint(Theme.saffron)
            Text("Generating questions…")
                .font(.system(size: 14))
                .foregroundStyle(Theme.brownMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 60)
    }

    @ViewBuilder
    private var quizContent: some View {
        Text("Did you really read it?")
            .font(.system(size: 20, weight: .bold))
            .foregroundStyle(Theme.brown)
        Text("Answer to complete your session")
            .font(.system(size: 14))
            .foregroundStyle(Theme.brownMuted)

        QuizQuestionView(
            question: questions[currentIndex],
            questionNumber: currentIndex + 1,
            total: questions.count,
            onAnswer: handleAnswer
        )
    }

    private var resultView: some View {
        let passed = score >= 2
        return VStack(spacing: 20) {
            Text(passed ? "🌟" : "📖")
                .font(.system(size: 60))
            Text(passed ? "Session Complete!" : "Keep Practicing")
                .font(.system(size: 24, weight: .bold))
                .foregroundStyle(Theme.brown)
            Text("You scored \(score)/\(questions.count)")
                .font(.system(size: 16))
                .foregroundStyle(Theme.brownMuted)
            if !passed {
                Text("Re-reading will deepen your understanding.")
                    .font(.system(size: 14))
                    .foregroundStyle(Theme.brownMuted)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 40)
    }

    private func errorView(_ msg: String) -> some View {
        VStack(spacing: 12) {
            Text("Couldn't generate questions")
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(Theme.brown)
            Text(msg)
                .font(.system(size: 13))
                .foregroundStyle(Theme.brownMuted)
            Button("Try again") { Task { await loadQuiz() } }
                .foregroundStyle(Theme.saffron)
        }
    }

    private func handleAnswer(_ correct: Bool) {
        let newScore = correct ? score + 1 : score
        if currentIndex + 1 >= questions.count {
            let completed = newScore >= 2
            let session = FocusSession(
                passageId: passage.id,
                focusSeconds: focusSeconds,
                quizScore: newScore,
                completed: completed
            )
            modelContext.insert(session)
            score = newScore
            done = true
        } else {
            score = newScore
            currentIndex += 1
        }
    }

    private func loadQuiz() async {
        loading = true
        error = nil

        // Check cache
        let descriptor = FetchDescriptor<QuizCache>(
            predicate: #Predicate { $0.passageId == passage.id }
        )
        if let cached = try? modelContext.fetch(descriptor).first,
           let qs = try? cached.questions(), !qs.isEmpty {
            questions = qs
            loading = false
            return
        }

        // Generate
        do {
            let qs = try await ClaudeService.shared.generateQuiz(for: passage)
            let cache = try QuizCache(passageId: passage.id, questions: qs)
            modelContext.insert(cache)
            questions = qs
        } catch {
            self.error = error.localizedDescription
        }
        loading = false
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add focuspath-ios/FocusPath/Views/Quiz/
git commit -m "feat: add comprehension gate quiz with Claude-generated questions"
```

---

## Task 9: Progress view

**Files:**
- Create: `focuspath-ios/FocusPath/Views/Progress/WeeklyBarChart.swift`
- Create: `focuspath-ios/FocusPath/Views/Progress/ProgressView_.swift`

- [ ] **Step 1: Create WeeklyBarChart**

Create `focuspath-ios/FocusPath/Views/Progress/WeeklyBarChart.swift`:
```swift
import SwiftUI

struct WeeklyBarChart: View {
    let data: [(label: String, avgSeconds: Int)]

    private var maxVal: Int { data.map(\.avgSeconds).max() ?? 1 }

    var body: some View {
        if data.isEmpty {
            Text("Complete your first session to see your chart.")
                .font(.system(size: 13))
                .foregroundStyle(Theme.brownMuted)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 20)
        } else {
            HStack(alignment: .bottom, spacing: 8) {
                ForEach(data, id: \.label) { item in
                    VStack(spacing: 4) {
                        Text(fmt(item.avgSeconds))
                            .font(.system(size: 8))
                            .foregroundStyle(Theme.brownMuted)
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Theme.saffron)
                            .frame(height: barHeight(item.avgSeconds))
                        Text(item.label)
                            .font(.system(size: 9))
                            .foregroundStyle(Theme.brownMuted)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .frame(height: 100)
        }
    }

    private func barHeight(_ seconds: Int) -> CGFloat {
        CGFloat(seconds) / CGFloat(maxVal) * 80
    }

    private func fmt(_ s: Int) -> String {
        "\(s / 60)m"
    }
}
```

- [ ] **Step 2: Create ProgressView_**

Create `focuspath-ios/FocusPath/Views/Progress/ProgressView_.swift`:
```swift
import SwiftUI
import SwiftData

// Named ProgressView_ to avoid conflict with SwiftUI.ProgressView
struct ProgressView_: View {
    @Query(filter: #Predicate<FocusSession> { $0.completed == true },
           sort: \FocusSession.date) private var sessions: [FocusSession]

    private var weeklyData: [(label: String, avgSeconds: Int)] {
        let calendar = Calendar.current
        var byWeek: [Date: [Int]] = [:]
        for s in sessions {
            let monday = calendar.date(
                from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: s.date)
            )!
            byWeek[monday, default: []].append(s.focusSeconds)
        }
        return byWeek.sorted { $0.key < $1.key }.suffix(6).map { (date, vals) in
            let label = DateFormatter().apply { $0.dateFormat = "MMM d" }.string(from: date)
            let avg = vals.reduce(0, +) / vals.count
            return (label: label, avgSeconds: avg)
        }
    }

    private var currentAvg: Int {
        guard !sessions.isEmpty else { return 0 }
        return sessions.map(\.focusSeconds).reduce(0, +) / sessions.count
    }

    private var week1Avg: Int { weeklyData.first?.avgSeconds ?? 0 }
    private var latestAvg: Int { weeklyData.last?.avgSeconds ?? currentAvg }
    private var delta: Int { latestAvg - week1Avg }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Your attention span is growing")
                    .font(.system(size: 20, weight: .bold, design: .serif))
                    .foregroundStyle(Theme.brown)

                // Big stat card
                VStack(alignment: .leading, spacing: 8) {
                    Text("AVERAGE FOCUS TIME")
                        .font(.system(size: 10, weight: .bold))
                        .tracking(1.5)
                        .foregroundStyle(Theme.brownMuted)
                    Text(fmt(latestAvg))
                        .font(.system(size: 40, weight: .black))
                        .foregroundStyle(Theme.saffron)
                    if delta > 0 {
                        Text("↑ +\(fmt(delta)) from week 1")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(Theme.greenOk)
                    }
                    WeeklyBarChart(data: weeklyData)
                        .padding(.top, 8)
                }
                .padding(16)
                .background(Theme.creamDark)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.border, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 16))

                // By tradition
                Text("BY TRADITION")
                    .font(.system(size: 10, weight: .bold))
                    .tracking(1.5)
                    .foregroundStyle(Theme.brownMuted)

                ForEach(Tradition.allCases, id: \.self) { tradition in
                    let count = sessions.filter { $0.passageId.hasPrefix(tradition.rawValue) }.count
                    let total = PassageStore.shared.all.filter { $0.tradition == tradition }.count
                    TraditionRow(tradition: tradition, count: count, total: total)
                }
            }
            .padding(20)
        }
        .background(Theme.cream.ignoresSafeArea())
        .navigationBarHidden(true)
    }

    private func fmt(_ s: Int) -> String {
        "\(s / 60)m \(s % 60)s"
    }
}

private struct TraditionRow: View {
    let tradition: Tradition
    let count: Int
    let total: Int

    var body: some View {
        HStack {
            Text(tradition.displayName)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Theme.brown)
            Spacer()
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 2).fill(Theme.border).frame(height: 5)
                    RoundedRectangle(cornerRadius: 2).fill(Theme.saffron)
                        .frame(width: geo.size.width * CGFloat(count) / CGFloat(max(1, total)), height: 5)
                }
            }
            .frame(width: 80, height: 5)
            Text("\(count) read")
                .font(.system(size: 12))
                .foregroundStyle(Theme.brownMuted)
                .frame(width: 50, alignment: .trailing)
        }
        .padding(12)
        .background(Theme.creamDark)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

extension DateFormatter {
    func apply(_ block: (DateFormatter) -> Void) -> DateFormatter {
        block(self); return self
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add focuspath-ios/FocusPath/Views/Progress/
git commit -m "feat: add progress view with weekly chart and tradition breakdown"
```

---

## Task 10: Settings view

**Files:**
- Create: `focuspath-ios/FocusPath/Views/Settings/SettingsView.swift`

- [ ] **Step 1: Create SettingsView**

Create `focuspath-ios/FocusPath/Views/Settings/SettingsView.swift`:
```swift
import SwiftUI

struct SettingsView: View {
    @AppStorage("fp_traditions") private var traditionsData = ""
    @AppStorage("fp_target_mins") private var targetMins = 8

    private var enabledTraditions: [Tradition] {
        guard !traditionsData.isEmpty,
              let data = traditionsData.data(using: .utf8),
              let arr = try? JSONDecoder().decode([Tradition].self, from: data)
        else { return Tradition.allCases }
        return arr
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {

                    // Daily target
                    VStack(alignment: .leading, spacing: 12) {
                        sectionLabel("DAILY TARGET")
                        HStack {
                            Slider(value: Binding(
                                get: { Double(targetMins) },
                                set: { targetMins = Int($0) }
                            ), in: 3...30, step: 1)
                            .tint(Theme.saffron)
                            Text("\(targetMins) min")
                                .font(.system(size: 18, weight: .black))
                                .foregroundStyle(Theme.saffron)
                                .frame(width: 60, alignment: .trailing)
                        }
                    }
                    .padding(16)
                    .background(Theme.creamDark)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.border, lineWidth: 1))
                    .clipShape(RoundedRectangle(cornerRadius: 16))

                    // Traditions
                    VStack(alignment: .leading, spacing: 12) {
                        sectionLabel("TRADITIONS")
                        ForEach(Tradition.allCases, id: \.self) { tradition in
                            HStack {
                                Text(tradition.displayName)
                                    .font(.system(size: 15))
                                    .foregroundStyle(Theme.brown)
                                Spacer()
                                Toggle("", isOn: Binding(
                                    get: { enabledTraditions.contains(tradition) },
                                    set: { toggle(tradition, on: $0) }
                                ))
                                .tint(Theme.saffron)
                                .labelsHidden()
                            }
                            .padding(.vertical, 4)
                            if tradition != Tradition.allCases.last {
                                Divider().background(Theme.border)
                            }
                        }
                    }
                    .padding(16)
                    .background(Theme.creamDark)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.border, lineWidth: 1))
                    .clipShape(RoundedRectangle(cornerRadius: 16))

                    // App info
                    VStack(alignment: .leading, spacing: 6) {
                        sectionLabel("ABOUT")
                        Text("FocusPath v1.0")
                            .font(.system(size: 14))
                            .foregroundStyle(Theme.brownMuted)
                        Text("Train your attention through daily spiritual reading.")
                            .font(.system(size: 13))
                            .foregroundStyle(Theme.brownMuted)
                    }
                    .padding(16)
                    .background(Theme.creamDark)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.border, lineWidth: 1))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .padding(20)
            }
            .background(Theme.cream.ignoresSafeArea())
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private func sectionLabel(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 10, weight: .bold))
            .tracking(1.5)
            .foregroundStyle(Theme.brownMuted)
    }

    private func toggle(_ tradition: Tradition, on: Bool) {
        var current = enabledTraditions
        if on { if !current.contains(tradition) { current.append(tradition) } }
        else { current.removeAll { $0 == tradition } }
        if let data = try? JSONEncoder().encode(current),
           let str = String(data: data, encoding: .utf8) {
            traditionsData = str
        }
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add focuspath-ios/FocusPath/Views/Settings/
git commit -m "feat: add settings view with tradition toggles and daily target"
```

---

## Task 11: Build + run on simulator

**Files:** No new files — verification only

- [ ] **Step 1: Regenerate project after all file additions**

```bash
cd focuspath-ios && xcodegen generate
```

- [ ] **Step 2: Build for simulator**

```bash
xcodebuild build -project focuspath-ios/FocusPath.xcodeproj \
  -scheme FocusPath \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  2>&1 | grep -E "error:|warning:|BUILD SUCCEEDED|BUILD FAILED"
```
Expected: `BUILD SUCCEEDED`

Fix any compiler errors before proceeding.

- [ ] **Step 3: Run all tests**

```bash
xcodebuild test -project focuspath-ios/FocusPath.xcodeproj \
  -scheme FocusPath \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  2>&1 | grep -E "PASS|FAIL|error:|Test Suite.*passed|Test Suite.*failed"
```
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add focuspath-ios/
git commit -m "feat: FocusPath iOS complete — all screens implemented"
```

---

## Task 12: App Store submission prep

**Files:**
- Modify: `focuspath-ios/project.yml`
- Create: `focuspath-ios/FocusPath/PrivacyInfo.xcprivacy`

- [ ] **Step 1: Add Privacy manifest (required by App Store)**

Create `focuspath-ios/FocusPath/PrivacyInfo.xcprivacy`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>NSPrivacyAccessedAPITypes</key>
  <array/>
  <key>NSPrivacyCollectedDataTypes</key>
  <array/>
  <key>NSPrivacyTracking</key>
  <false/>
</dict>
</plist>
```

- [ ] **Step 2: Update Info.plist entries in project.yml**

Under `FocusPath.info.properties` in `project.yml`, confirm these are present:
```yaml
CFBundleDisplayName: FocusPath
NSUserTrackingUsageDescription: ""
ITSAppUsesNonExemptEncryption: false
```

- [ ] **Step 3: Set signing in project.yml**

Under `FocusPath.settings.base`, add:
```yaml
CODE_SIGN_STYLE: Automatic
DEVELOPMENT_TEAM: YOUR_TEAM_ID   # Replace with actual Team ID from developer.apple.com
```

Run `xcodegen generate` after editing.

- [ ] **Step 4: Archive for App Store**

Open Xcode:
1. Product → Destination → Any iOS Device (arm64)
2. Product → Archive
3. In Organizer → Distribute App → App Store Connect → Upload

Or via CLI:
```bash
xcodebuild archive \
  -project focuspath-ios/FocusPath.xcodeproj \
  -scheme FocusPath \
  -archivePath focuspath-ios/build/FocusPath.xcarchive \
  -destination 'generic/platform=iOS' \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=YOUR_TEAM_ID

xcodebuild -exportArchive \
  -archivePath focuspath-ios/build/FocusPath.xcarchive \
  -exportPath focuspath-ios/build/export \
  -exportOptionsPlist focuspath-ios/ExportOptions.plist
```

Create `focuspath-ios/ExportOptions.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store-connect</string>
  <key>teamID</key>
  <string>YOUR_TEAM_ID</string>
  <key>uploadBitcode</key>
  <false/>
  <key>uploadSymbols</key>
  <true/>
</dict>
</plist>
```

- [ ] **Step 5: Create App Store listing on App Store Connect**

Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com):
1. My Apps → New App
2. Bundle ID: `com.yuganshjain.focuspath`
3. Name: **FocusPath — Attention Trainer**
4. Category: **Health & Fitness** (primary), **Education** (secondary)
5. Age Rating: 4+
6. Description:
```
FocusPath trains your attention span through daily reading of the world's greatest spiritual texts.

Designed for ADHD minds — read a curated passage from the Bhagavad Gita, Stoics, Tao Te Ching, Bible, Quran, or Buddhist sutras. A focus timer measures your uninterrupted reading time. Then answer 3 comprehension questions to complete the session.

Watch your attention span grow week by week.

• Daily passages from 7 spiritual traditions
• Focus timer — tracks real reading time
• Comprehension gate — must answer 2/3 questions to complete
• Progress charts — see your attention span growing
• Streak tracking — build a daily habit
• No ads. No tracking. Fully offline.
```

- [ ] **Step 6: Final commit**

```bash
git add focuspath-ios/
git commit -m "feat: add App Store submission config and privacy manifest"
git push origin claude/objective-jepsen-22c48a
```
