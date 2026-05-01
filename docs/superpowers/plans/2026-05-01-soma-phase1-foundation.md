# Soma Phase 1: Foundation + Soul Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename FocusPath → Soma, apply dark theme, add MeditationSession + JournalEntry models, and build the Soul Dashboard home screen with 4-tab navigation.

**Architecture:** The existing FocusPath codebase is the foundation. We rebrand it to Soma with a dark palette (#0f0f1a + saffron #f4a261 + green #86efac), clean up dead files (quiz, timer, Claude service), add two new SwiftData models, build the new HomeView as a Soul Dashboard, and stub out Practice/Journal/You tabs that will be filled in later phases. The LibraryView and ReadingView are kept but have their color references updated.

**Tech Stack:** SwiftUI, SwiftData, XcodeGen, iOS 17+, XCTest

---

## File Map

```
focuspath-ios/
  project.yml                              MODIFY — rename to Soma, new bundle ID
  FocusPath/
    FocusPathApp.swift                     MODIFY — new tabs, new model container
    Theme.swift                            REWRITE — dark palette
    Models/
      FocusSession.swift                   MODIFY — strip focusSeconds/quizScore
      XPSystem.swift                       MODIFY — add levelNumber helper
      MeditationSession.swift              CREATE
      JournalEntry.swift                   CREATE
      QuizCache.swift                      DELETE
      QuizQuestion.swift                   DELETE
    Services/
      ClaudeService.swift                  DELETE
    Views/
      Home/
        HomeView.swift                     CREATE
        SoulRingView.swift                 CREATE
        HomeLogic.swift                    CREATE (pure logic, testable)
      Practice/
        PracticeView.swift                 CREATE (stub — wraps LibraryView)
      Journal/
        JournalView.swift                  CREATE (stub — placeholder UI)
      You/
        YouView.swift                      CREATE (stub — placeholder UI)
      Library/
        LibraryView.swift                  MODIFY — update color refs to new Theme
      Reading/
        ReadingView.swift                  MODIFY — update color refs + FocusSession init
        FocusTimerView.swift               DELETE
      Dashboard/
        DashboardView.swift                DELETE
        PassageCardView.swift              DELETE
      Quiz/
        QuizView.swift                     DELETE
        QuizQuestionView.swift             DELETE
      Progress/
        ProgressView_.swift                DELETE
        WeeklyBarChart.swift               DELETE
      Settings/
        SettingsView.swift                 DELETE
  FocusPathTests/
    HomeLogicTests.swift                   CREATE
    ClaudeServiceTests.swift               DELETE
```

---

## Important notes before starting

- **Delete app from simulator before first run.** FocusSession schema is changing (removing fields). SwiftData will crash on launch if old data exists. Run: `xcrun simctl uninstall booted com.yuganshjain.focuspath` before the first build.
- **Module name stays `FocusPath`.** Only the display name and bundle ID change to Soma. Tests still use `@testable import FocusPath`.
- **XcodeGen regenerates the .xcodeproj.** After adding/deleting files, always run `cd focuspath-ios && xcodegen generate` before building.

---

### Task 1: Rewrite Theme.swift for dark palette

**Files:**
- Modify: `focuspath-ios/FocusPath/Theme.swift`

- [ ] **Step 1: Replace Theme.swift with the dark palette**

```swift
import SwiftUI

enum Theme {
    // Backgrounds
    static let background   = Color(red: 0.059, green: 0.059, blue: 0.102) // #0f0f1a
    static let surface      = Color(white: 1, opacity: 0.04)
    static let surfaceAlt   = Color(white: 1, opacity: 0.07)

    // Borders
    static let border       = Color(white: 1, opacity: 0.08)
    static let borderStrong = Color(white: 1, opacity: 0.15)

    // Text
    static let text         = Color.white
    static let textMuted    = Color(white: 1, opacity: 0.4)
    static let textSubtle   = Color(white: 1, opacity: 0.22)

    // Accents
    static let saffron      = Color(red: 0.957, green: 0.635, blue: 0.380) // #f4a261
    static let saffronDeep  = Color(red: 0.910, green: 0.361, blue: 0.016) // #e85d04
    static let green        = Color(red: 0.525, green: 0.937, blue: 0.675) // #86efac
    static let purple       = Color(red: 0.659, green: 0.333, blue: 0.969) // #a855f7

    // Status
    static let error        = Color(red: 0.898, green: 0.224, blue: 0.208)

    static let saffronGradient = LinearGradient(
        colors: [saffronDeep, saffron],
        startPoint: .leading,
        endPoint: .trailing
    )

    static let orangeGradient = LinearGradient(
        colors: [
            Color(red: 0.910, green: 0.361, blue: 0.016),
            Color(red: 0.957, green: 0.549, blue: 0.024)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}
```

- [ ] **Step 2: Commit**

```bash
git add focuspath-ios/FocusPath/Theme.swift
git commit -m "feat(soma): rewrite Theme for dark palette"
```

---

### Task 2: Add MeditationSession and JournalEntry models

**Files:**
- Create: `focuspath-ios/FocusPath/Models/MeditationSession.swift`
- Create: `focuspath-ios/FocusPath/Models/JournalEntry.swift`

- [ ] **Step 1: Create MeditationSession.swift**

```swift
import SwiftData
import Foundation

@Model
final class MeditationSession {
    var type: String        // "guided" | "silent"
    var guideName: String?  // "Breath", "Body Scan", "Stillness" — nil for silent
    var durationMinutes: Int
    var completedAt: Date
    var xpEarned: Int

    init(type: String, guideName: String? = nil, durationMinutes: Int, xpEarned: Int) {
        self.type = type
        self.guideName = guideName
        self.durationMinutes = durationMinutes
        self.completedAt = Date()
        self.xpEarned = xpEarned
    }
}
```

- [ ] **Step 2: Create JournalEntry.swift**

```swift
import SwiftData
import Foundation

@Model
final class JournalEntry {
    var date: Date
    var promptText: String
    var responseText: String
    var wordCount: Int

    init(promptText: String, responseText: String) {
        self.date = Date()
        self.promptText = promptText
        self.responseText = responseText
        self.wordCount = responseText.split(separator: " ").count
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add focuspath-ios/FocusPath/Models/MeditationSession.swift \
        focuspath-ios/FocusPath/Models/JournalEntry.swift
git commit -m "feat(soma): add MeditationSession and JournalEntry SwiftData models"
```

---

### Task 3: Clean up FocusSession and extend XPSystem

**Files:**
- Modify: `focuspath-ios/FocusPath/Models/FocusSession.swift`
- Modify: `focuspath-ios/FocusPath/Models/XPSystem.swift`

- [ ] **Step 1: Rewrite FocusSession.swift (strip dead fields)**

```swift
import SwiftData
import Foundation

@Model
final class FocusSession {
    var id: String
    var passageId: String
    var xpEarned: Int
    var completed: Bool
    var date: Date

    init(passageId: String, xpEarned: Int, completed: Bool) {
        self.id = UUID().uuidString
        self.passageId = passageId
        self.xpEarned = xpEarned
        self.completed = completed
        self.date = Date()
    }
}
```

- [ ] **Step 2: Add levelNumber helper to XPSystem.swift**

Open `focuspath-ios/FocusPath/Models/XPSystem.swift`. After the `progressToNextLevel` function, add:

```swift
    static func levelNumber(for totalXP: Int) -> Int {
        let level = currentLevel(for: totalXP)
        return (levels.firstIndex(where: { $0.threshold == level.threshold }) ?? 0) + 1
    }
```

The full XPSystem.swift after the addition:

```swift
import Foundation

struct XPLevel {
    let name: String
    let threshold: Int
    let next: Int?
    let emoji: String
}

enum XPSystem {
    static let levels: [XPLevel] = [
        XPLevel(name: "Seeker",      threshold: 0,    next: 200,  emoji: "🌱"),
        XPLevel(name: "Reader",      threshold: 200,  next: 500,  emoji: "📖"),
        XPLevel(name: "Scholar",     threshold: 500,  next: 1000, emoji: "🔍"),
        XPLevel(name: "Sage",        threshold: 1000, next: 2000, emoji: "🌿"),
        XPLevel(name: "Master",      threshold: 2000, next: 4000, emoji: "⚡"),
        XPLevel(name: "Enlightened", threshold: 4000, next: nil,  emoji: "✨"),
    ]

    static func currentLevel(for totalXP: Int) -> XPLevel {
        levels.last(where: { totalXP >= $0.threshold }) ?? levels[0]
    }

    static func progressToNextLevel(for totalXP: Int) -> Double {
        let level = currentLevel(for: totalXP)
        guard let next = level.next else { return 1.0 }
        let earned = totalXP - level.threshold
        let needed = next - level.threshold
        return Double(earned) / Double(needed)
    }

    static func levelNumber(for totalXP: Int) -> Int {
        let level = currentLevel(for: totalXP)
        return (levels.firstIndex(where: { $0.threshold == level.threshold }) ?? 0) + 1
    }

    static func xpFor(passage: Passage, quizScore: Int = 0) -> Int {
        50 + (passage.estimatedMinutes * 5)
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add focuspath-ios/FocusPath/Models/FocusSession.swift \
        focuspath-ios/FocusPath/Models/XPSystem.swift
git commit -m "feat(soma): clean up FocusSession, add XPSystem.levelNumber"
```

---

### Task 4: Create HomeLogic and write tests

**Files:**
- Create: `focuspath-ios/FocusPath/Views/Home/HomeLogic.swift`
- Create: `focuspath-ios/FocusPathTests/HomeLogicTests.swift`

- [ ] **Step 1: Create the Views/Home/ directory and HomeLogic.swift**

```bash
mkdir -p focuspath-ios/FocusPath/Views/Home
```

```swift
// focuspath-ios/FocusPath/Views/Home/HomeLogic.swift
import Foundation

struct HomeLogic {
    static func streak(sessionDates: [Date], referenceDate: Date = Date()) -> Int {
        let calendar = Calendar.current
        let days = Set(sessionDates.map { calendar.startOfDay(for: $0) })
        var count = 0
        var day = calendar.startOfDay(for: referenceDate)
        while days.contains(day) {
            count += 1
            guard let prev = calendar.date(byAdding: .day, value: -1, to: day) else { break }
            day = prev
        }
        return count
    }

    static func soulRingProgress(readDone: Bool, meditateDone: Bool, journalDone: Bool) -> Double {
        let done = [readDone, meditateDone, journalDone].filter { $0 }.count
        return Double(done) / 3.0
    }

    static func dayCount(joinDate: Date, today: Date = Date()) -> Int {
        let calendar = Calendar.current
        let days = calendar.dateComponents(
            [.day],
            from: calendar.startOfDay(for: joinDate),
            to: calendar.startOfDay(for: today)
        ).day ?? 0
        return max(1, days + 1)
    }

    static func greeting(hour: Int = Calendar.current.component(.hour, from: Date())) -> String {
        if hour < 12 { return "Good morning" }
        if hour < 17 { return "Good afternoon" }
        return "Good evening"
    }
}
```

- [ ] **Step 2: Write HomeLogicTests.swift**

```swift
// focuspath-ios/FocusPathTests/HomeLogicTests.swift
import XCTest
@testable import FocusPath

final class HomeLogicTests: XCTestCase {

    private let calendar = Calendar.current

    // MARK: — streak

    func testStreakZeroWithNoSessions() {
        XCTAssertEqual(HomeLogic.streak(sessionDates: []), 0)
    }

    func testStreakOneForToday() {
        XCTAssertEqual(HomeLogic.streak(sessionDates: [Date()]), 1)
    }

    func testStreakThreeConsecutiveDays() {
        let today = Date()
        let yesterday   = calendar.date(byAdding: .day, value: -1, to: today)!
        let twoDaysAgo  = calendar.date(byAdding: .day, value: -2, to: today)!
        XCTAssertEqual(HomeLogic.streak(sessionDates: [today, yesterday, twoDaysAgo]), 3)
    }

    func testStreakBreaksWithGap() {
        let today      = Date()
        let twoDaysAgo = calendar.date(byAdding: .day, value: -2, to: today)!
        // yesterday missing → streak is 1 (today only)
        XCTAssertEqual(HomeLogic.streak(sessionDates: [today, twoDaysAgo]), 1)
    }

    func testStreakIgnoresDuplicatesOnSameDay() {
        let now         = Date()
        let oneHourAgo  = now.addingTimeInterval(-3600)
        XCTAssertEqual(HomeLogic.streak(sessionDates: [now, oneHourAgo]), 1)
    }

    func testStreakZeroWhenOnlyOldSessions() {
        let twoDaysAgo = calendar.date(byAdding: .day, value: -2, to: Date())!
        XCTAssertEqual(HomeLogic.streak(sessionDates: [twoDaysAgo]), 0)
    }

    // MARK: — soulRingProgress

    func testSoulRingAllDone() {
        XCTAssertEqual(
            HomeLogic.soulRingProgress(readDone: true, meditateDone: true, journalDone: true),
            1.0, accuracy: 0.001)
    }

    func testSoulRingNoneDone() {
        XCTAssertEqual(
            HomeLogic.soulRingProgress(readDone: false, meditateDone: false, journalDone: false),
            0.0, accuracy: 0.001)
    }

    func testSoulRingOneOfThree() {
        XCTAssertEqual(
            HomeLogic.soulRingProgress(readDone: true, meditateDone: false, journalDone: false),
            1.0 / 3.0, accuracy: 0.001)
    }

    func testSoulRingTwoOfThree() {
        XCTAssertEqual(
            HomeLogic.soulRingProgress(readDone: true, meditateDone: true, journalDone: false),
            2.0 / 3.0, accuracy: 0.001)
    }

    // MARK: — dayCount

    func testDayCountOnJoinDate() {
        XCTAssertEqual(HomeLogic.dayCount(joinDate: Date(), today: Date()), 1)
    }

    func testDayCountAfterTwoWeeks() {
        let joinDate = calendar.date(byAdding: .day, value: -13, to: Date())!
        XCTAssertEqual(HomeLogic.dayCount(joinDate: joinDate), 14)
    }

    func testDayCountMinimumOne() {
        // joinDate in the future should still return 1
        let future = calendar.date(byAdding: .day, value: 5, to: Date())!
        XCTAssertEqual(HomeLogic.dayCount(joinDate: future), 1)
    }

    // MARK: — greeting

    func testGreetingMorning() {
        XCTAssertEqual(HomeLogic.greeting(hour: 6),  "Good morning")
        XCTAssertEqual(HomeLogic.greeting(hour: 11), "Good morning")
    }

    func testGreetingAfternoon() {
        XCTAssertEqual(HomeLogic.greeting(hour: 12), "Good afternoon")
        XCTAssertEqual(HomeLogic.greeting(hour: 16), "Good afternoon")
    }

    func testGreetingEvening() {
        XCTAssertEqual(HomeLogic.greeting(hour: 17), "Good evening")
        XCTAssertEqual(HomeLogic.greeting(hour: 22), "Good evening")
    }
}
```

- [ ] **Step 3: Run tests to verify they fail (HomeLogic doesn't exist yet)**

```bash
cd focuspath-ios && xcodebuild test \
  -project FocusPath.xcodeproj \
  -scheme FocusPath \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -only-testing:FocusPathTests/HomeLogicTests \
  2>&1 | grep -E "(PASS|FAIL|error:|Build)"
```

Expected: Build error — `HomeLogic` not found. (We created it in Step 1 but haven't run xcodegen yet — tests will fail to build until Task 12.)

- [ ] **Step 4: Commit**

```bash
git add focuspath-ios/FocusPath/Views/Home/HomeLogic.swift \
        focuspath-ios/FocusPathTests/HomeLogicTests.swift
git commit -m "test(soma): add HomeLogicTests for streak, ring progress, dayCount, greeting"
```

---

### Task 5: Build SoulRingView

**Files:**
- Create: `focuspath-ios/FocusPath/Views/Home/SoulRingView.swift`

- [ ] **Step 1: Create SoulRingView.swift**

```swift
import SwiftUI

struct SoulRingView: View {
    let progress: Double    // 0.0 – 1.0
    let levelName: String   // e.g. "Seeker Lv 1"
    let levelEmoji: String
    let xp: Int
    let streak: Int
    let passagesRead: Int

    var body: some View {
        HStack(spacing: 20) {
            ZStack {
                Circle()
                    .stroke(Color.white.opacity(0.06), lineWidth: 8)
                    .frame(width: 80, height: 80)
                Circle()
                    .trim(from: 0, to: CGFloat(progress))
                    .stroke(
                        Theme.saffron,
                        style: StrokeStyle(lineWidth: 8, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut(duration: 0.5), value: progress)
                    .frame(width: 80, height: 80)
                VStack(spacing: 1) {
                    Text(levelEmoji)
                        .font(.system(size: 20))
                    Text("\(Int(progress * 100))%")
                        .font(.system(size: 13, weight: .black))
                        .foregroundStyle(.white)
                }
            }

            VStack(alignment: .leading, spacing: 6) {
                Text(levelName)
                    .font(.system(size: 20, weight: .black))
                    .foregroundStyle(Theme.text)
                Text("\(xp) XP")
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.textMuted)
                HStack(spacing: 14) {
                    Label("\(streak)", systemImage: "flame.fill")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(Theme.saffron)
                    Label("\(passagesRead)", systemImage: "book.fill")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(Theme.textMuted)
                }
            }
            Spacer()
        }
        .padding(18)
        .background(Theme.surface)
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(Theme.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }
}

#Preview {
    SoulRingView(
        progress: 0.67,
        levelName: "Seeker Lv 1",
        levelEmoji: "🌱",
        xp: 340,
        streak: 14,
        passagesRead: 18
    )
    .padding()
    .background(Theme.background)
}
```

- [ ] **Step 2: Commit**

```bash
git add focuspath-ios/FocusPath/Views/Home/SoulRingView.swift
git commit -m "feat(soma): add SoulRingView component"
```

---

### Task 6: Build HomeView (Soul Dashboard)

**Files:**
- Create: `focuspath-ios/FocusPath/Views/Home/HomeView.swift`

- [ ] **Step 1: Create HomeView.swift**

```swift
import SwiftUI
import SwiftData

struct HomeView: View {
    @Binding var selectedTab: Int

    @Query(filter: #Predicate<FocusSession> { $0.completed == true })
    private var readSessions: [FocusSession]
    @Query private var meditationSessions: [MeditationSession]
    @Query private var journalEntries: [JournalEntry]

    // Stored as Double because @AppStorage doesn't support Date
    @AppStorage("soma.joinDate") private var joinDateInterval: Double = 0

    private var joinDate: Date {
        joinDateInterval == 0 ? Date() : Date(timeIntervalSince1970: joinDateInterval)
    }

    private var today: Date { Calendar.current.startOfDay(for: Date()) }

    private var todayReadDone: Bool {
        readSessions.contains { Calendar.current.startOfDay(for: $0.date) == today }
    }
    private var todayMeditateDone: Bool {
        meditationSessions.contains { Calendar.current.startOfDay(for: $0.completedAt) == today }
    }
    private var todayJournalDone: Bool {
        journalEntries.contains { Calendar.current.startOfDay(for: $0.date) == today }
    }

    private var soulProgress: Double {
        HomeLogic.soulRingProgress(
            readDone: todayReadDone,
            meditateDone: todayMeditateDone,
            journalDone: todayJournalDone
        )
    }

    private var totalXP: Int {
        readSessions.map(\.xpEarned).reduce(0, +) +
        meditationSessions.map(\.xpEarned).reduce(0, +)
    }

    private var streak: Int {
        HomeLogic.streak(sessionDates: readSessions.map(\.date))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                headerSection
                soulRingSection
                todaySection
            }
            .padding(20)
        }
        .background(Theme.background.ignoresSafeArea())
        .onAppear { setJoinDateIfNeeded() }
    }

    // MARK: — Sections

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("\(HomeLogic.greeting()) 🙏")
                .font(.system(size: 26, weight: .black))
                .foregroundStyle(Theme.text)
            let f = DateFormatter()
            f.dateFormat = "EEEE, MMM d"
            Text("\(f.string(from: Date())) · Day \(HomeLogic.dayCount(joinDate: joinDate))")
                .font(.system(size: 13))
                .foregroundStyle(Theme.textMuted)
        }
    }

    private var soulRingSection: some View {
        let level = XPSystem.currentLevel(for: totalXP)
        let lvNum = XPSystem.levelNumber(for: totalXP)
        return SoulRingView(
            progress: soulProgress,
            levelName: "\(level.name) Lv \(lvNum)",
            levelEmoji: level.emoji,
            xp: totalXP,
            streak: streak,
            passagesRead: readSessions.count
        )
    }

    private var todaySection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("TODAY'S PRACTICE")
                .font(.system(size: 10, weight: .bold))
                .tracking(1.5)
                .foregroundStyle(Theme.textMuted)

            PracticeTaskCard(
                icon: "📖",
                title: "Read",
                subtitle: "Today's sacred passage",
                done: todayReadDone
            ) { selectedTab = 1 }

            PracticeTaskCard(
                icon: "🧘",
                title: "Meditate",
                subtitle: "10 min · Breath awareness",
                done: todayMeditateDone
            ) { selectedTab = 1 }

            PracticeTaskCard(
                icon: "✍️",
                title: "Reflect",
                subtitle: "Today's journal prompt waiting",
                done: todayJournalDone
            ) { selectedTab = 2 }
        }
    }

    // MARK: — Helpers

    private func setJoinDateIfNeeded() {
        if joinDateInterval == 0 {
            joinDateInterval = Date().timeIntervalSince1970
        }
    }
}

// MARK: — PracticeTaskCard

private struct PracticeTaskCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let done: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Text(icon)
                    .font(.system(size: 24))
                    .frame(width: 40)
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(Theme.text)
                    Text(subtitle)
                        .font(.system(size: 12))
                        .foregroundStyle(Theme.textMuted)
                }
                Spacer()
                Image(systemName: done ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 22))
                    .foregroundStyle(done ? Theme.green : Color.white.opacity(0.15))
            }
            .padding(14)
            .background(done ? Theme.green.opacity(0.06) : Theme.surface)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(done ? Theme.green.opacity(0.3) : Theme.border, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(.plain)
        .opacity(done ? 0.6 : 1.0)
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add focuspath-ios/FocusPath/Views/Home/HomeView.swift
git commit -m "feat(soma): add HomeView Soul Dashboard"
```

---

### Task 7: Build stub views for Practice, Journal, You

**Files:**
- Create: `focuspath-ios/FocusPath/Views/Practice/PracticeView.swift`
- Create: `focuspath-ios/FocusPath/Views/Journal/JournalView.swift`
- Create: `focuspath-ios/FocusPath/Views/You/YouView.swift`

- [ ] **Step 1: Create directories**

```bash
mkdir -p focuspath-ios/FocusPath/Views/Practice \
         focuspath-ios/FocusPath/Views/Journal \
         focuspath-ios/FocusPath/Views/You
```

- [ ] **Step 2: Create PracticeView.swift**

PracticeView in Phase 1 is just the library. Phase 2 will add the full meditation UI on top.

```swift
import SwiftUI

struct PracticeView: View {
    var body: some View {
        LibraryView()
    }
}
```

- [ ] **Step 3: Create JournalView.swift**

```swift
import SwiftUI

struct JournalView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Spacer()
                Text("✍️")
                    .font(.system(size: 64))
                Text("Journal")
                    .font(.system(size: 28, weight: .black))
                    .foregroundStyle(Theme.text)
                Text("Daily prompts and reflections\ncoming in the next phase")
                    .font(.system(size: 15))
                    .foregroundStyle(Theme.textMuted)
                    .multilineTextAlignment(.center)
                Spacer()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Theme.background.ignoresSafeArea())
            .toolbar(.hidden, for: .navigationBar)
        }
    }
}
```

- [ ] **Step 4: Create YouView.swift**

```swift
import SwiftUI

struct YouView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Spacer()
                Text("👤")
                    .font(.system(size: 64))
                Text("Your Journey")
                    .font(.system(size: 28, weight: .black))
                    .foregroundStyle(Theme.text)
                Text("Profile, badges and stats\ncoming in a later phase")
                    .font(.system(size: 15))
                    .foregroundStyle(Theme.textMuted)
                    .multilineTextAlignment(.center)
                Spacer()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Theme.background.ignoresSafeArea())
            .toolbar(.hidden, for: .navigationBar)
        }
    }
}
```

- [ ] **Step 5: Commit**

```bash
git add focuspath-ios/FocusPath/Views/Practice/PracticeView.swift \
        focuspath-ios/FocusPath/Views/Journal/JournalView.swift \
        focuspath-ios/FocusPath/Views/You/YouView.swift
git commit -m "feat(soma): add Practice/Journal/You stub views"
```

---

### Task 8: Update FocusPathApp.swift with new tabs

**Files:**
- Modify: `focuspath-ios/FocusPath/FocusPathApp.swift`

- [ ] **Step 1: Rewrite FocusPathApp.swift**

```swift
import SwiftUI
import SwiftData

@main
struct FocusPathApp: App {
    var body: some Scene {
        WindowGroup {
            MainTabView()
        }
        .modelContainer(for: [FocusSession.self, MeditationSession.self, JournalEntry.self])
    }
}

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView(selectedTab: $selectedTab)
                .tabItem { Label("Home", systemImage: "sparkles") }
                .tag(0)

            PracticeView()
                .tabItem { Label("Practice", systemImage: "leaf.fill") }
                .tag(1)

            JournalView()
                .tabItem { Label("Journal", systemImage: "square.and.pencil") }
                .tag(2)

            YouView()
                .tabItem { Label("You", systemImage: "person.fill") }
                .tag(3)
        }
        .tint(Theme.saffron)
        .preferredColorScheme(.dark)
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add focuspath-ios/FocusPath/FocusPathApp.swift
git commit -m "feat(soma): new 4-tab MainTabView with HomeView Soul Dashboard"
```

---

### Task 9: Update ReadingView for dark theme

**Files:**
- Modify: `focuspath-ios/FocusPath/Views/Reading/ReadingView.swift`

- [ ] **Step 1: Replace all light theme color references and update FocusSession init**

Replace the full file:

```swift
import SwiftUI
import SwiftData

struct ReadingView: View {
    let passageId: String

    @Environment(\.modelContext) private var modelContext
    @State private var scrollProgress: CGFloat = 0
    @State private var done = false
    @State private var xpEarned = 0

    private var passage: Passage? { PassageStore.shared.passage(byId: passageId) }
    private var canFinish: Bool { scrollProgress >= 0.6 }

    var body: some View {
        Group {
            if let passage {
                if done {
                    completionView(passage)
                } else {
                    content(passage)
                }
            } else {
                Text("Passage not found").foregroundStyle(Theme.textMuted)
            }
        }
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .background(Theme.background.ignoresSafeArea())
    }

    @ViewBuilder
    private func content(_ passage: Passage) -> some View {
        ZStack(alignment: .top) {
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
                    Text("\(passage.source) · \(passage.work)")
                        .font(.system(size: 12, weight: .bold))
                        .tracking(1.5)
                        .foregroundStyle(Theme.textMuted)
                        .padding(.top, 8)

                    VStack(alignment: .leading, spacing: 16) {
                        ForEach(passage.body.components(separatedBy: "\n\n"), id: \.self) { para in
                            Text(para)
                                .font(.system(size: 17, design: .serif))
                                .foregroundStyle(Theme.text)
                                .lineSpacing(6)
                        }
                    }

                    Button(action: { finishReading(passage) }) {
                        HStack {
                            Spacer()
                            Text(canFinish
                                 ? "I've finished reading →"
                                 : "Scroll to read more…")
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
            .background(Theme.background)
        }
    }

    @ViewBuilder
    private func completionView(_ passage: Passage) -> some View {
        let level = XPSystem.currentLevel(for: xpEarned)
        ScrollView {
            VStack(spacing: 28) {
                Spacer().frame(height: 20)

                Text(level.emoji)
                    .font(.system(size: 72))

                VStack(spacing: 8) {
                    Text("Session Complete")
                        .font(.system(size: 28, weight: .black))
                        .foregroundStyle(Theme.text)
                    Text("\(passage.source) · \(passage.work)")
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.textMuted)
                }

                VStack(spacing: 6) {
                    Text("+\(xpEarned) XP")
                        .font(.system(size: 42, weight: .black))
                        .foregroundStyle(Theme.saffron)
                    Text("Come back tomorrow for a new passage")
                        .font(.system(size: 13))
                        .foregroundStyle(Theme.textMuted)
                        .multilineTextAlignment(.center)
                }
                .padding(20)
                .frame(maxWidth: .infinity)
                .background(Theme.surface)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.border, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 16))

                Text(""\(passage.quote)"")
                    .font(.system(size: 16, design: .serif))
                    .foregroundStyle(Theme.text)
                    .lineSpacing(5)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 8)
            }
            .padding(24)
        }
        .background(Theme.background.ignoresSafeArea())
    }

    private func finishReading(_ passage: Passage) {
        let earned = XPSystem.xpFor(passage: passage)
        let session = FocusSession(passageId: passage.id, xpEarned: earned, completed: true)
        modelContext.insert(session)
        xpEarned = earned
        done = true
    }

    private func updateProgress(_ geo: GeometryProxy) {
        let frame = geo.frame(in: .global)
        let screenHeight = UIScreen.main.bounds.height
        let contentHeight = frame.height
        guard contentHeight > screenHeight else {
            scrollProgress = 1.0
            return
        }
        let scrolled = max(0, -frame.minY)
        let maxScroll = contentHeight - screenHeight
        scrollProgress = min(1, scrolled / maxScroll)
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add focuspath-ios/FocusPath/Views/Reading/ReadingView.swift
git commit -m "feat(soma): update ReadingView for dark theme"
```

---

### Task 10: Update LibraryView for dark theme

**Files:**
- Modify: `focuspath-ios/FocusPath/Views/Library/LibraryView.swift`

- [ ] **Step 1: Replace all light theme color references**

Replace the full file:

```swift
import SwiftUI
import SwiftData

struct LibraryView: View {
    @Query(filter: #Predicate<FocusSession> { $0.completed == true })
    private var sessions: [FocusSession]
    @State private var searchText = ""

    private var readPassageIds: Set<String> {
        Set(sessions.map(\.passageId))
    }

    private var filteredPassages: [Passage] {
        if searchText.isEmpty { return [] }
        let q = searchText.lowercased()
        return PassageStore.shared.all.filter {
            $0.source.lowercased().contains(q) ||
            $0.work.lowercased().contains(q) ||
            $0.quote.lowercased().contains(q) ||
            $0.tradition.displayName.lowercased().contains(q)
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    if !searchText.isEmpty {
                        searchResults
                    } else {
                        ForEach(Tradition.allCases, id: \.self) { tradition in
                            TraditionSection(tradition: tradition, readIds: readPassageIds)
                        }
                    }
                }
                .padding(20)
            }
            .background(Theme.background.ignoresSafeArea())
            .navigationTitle("Library")
            .navigationBarTitleDisplayMode(.large)
            .searchable(text: $searchText, prompt: "Search passages, authors…")
        }
    }

    private var searchResults: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("\(filteredPassages.count) results")
                .font(.system(size: 12))
                .foregroundStyle(Theme.textMuted)
            ForEach(filteredPassages) { passage in
                PassageRow(passage: passage, read: readPassageIds.contains(passage.id))
            }
            if filteredPassages.isEmpty {
                Text("No passages found for "\(searchText)"")
                    .font(.system(size: 14))
                    .foregroundStyle(Theme.textMuted)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.top, 20)
            }
        }
    }
}

private struct TraditionSection: View {
    let tradition: Tradition
    let readIds: Set<String>

    private var passages: [Passage] {
        PassageStore.shared.all.filter { $0.tradition == tradition }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(tradition.displayName.uppercased())
                    .font(.system(size: 11, weight: .bold))
                    .tracking(1.5)
                    .foregroundStyle(Theme.textMuted)
                Spacer()
                let readCount = passages.filter { readIds.contains($0.id) }.count
                Text("\(readCount)/\(passages.count) read")
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.textMuted)
            }
            ForEach(passages) { passage in
                PassageRow(passage: passage, read: readIds.contains(passage.id))
            }
        }
    }
}

struct PassageRow: View {
    let passage: Passage
    let read: Bool

    var body: some View {
        NavigationLink(destination: ReadingView(passageId: passage.id)) {
            HStack(alignment: .top, spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text(passage.source)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(Theme.text)
                        Text("·")
                            .foregroundStyle(Theme.textMuted)
                        Text(passage.work)
                            .font(.system(size: 13))
                            .foregroundStyle(Theme.textMuted)
                            .lineLimit(1)
                    }
                    Text(""\(passage.quote)"")
                        .font(.system(size: 14, design: .serif))
                        .foregroundStyle(Theme.text)
                        .lineLimit(2)
                    HStack(spacing: 8) {
                        Text("~\(passage.estimatedMinutes) min")
                            .font(.system(size: 11))
                            .foregroundStyle(Theme.textMuted)
                        if read {
                            Text("✓ Read")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundStyle(Theme.green)
                        }
                    }
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.textSubtle)
                    .padding(.top, 2)
            }
            .padding(14)
            .background(read ? Theme.green.opacity(0.06) : Theme.surface)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(read ? Theme.green.opacity(0.3) : Theme.border, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .buttonStyle(.plain)
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add focuspath-ios/FocusPath/Views/Library/LibraryView.swift
git commit -m "feat(soma): update LibraryView for dark theme"
```

---

### Task 11: Update project.yml — rename to Soma

**Files:**
- Modify: `focuspath-ios/project.yml`

- [ ] **Step 1: Rewrite project.yml**

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
    resources:
      - FocusPath/Data/Passages.json
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: com.yuganshjain.soma
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
        CFBundleDisplayName: Soma
        ITSAppUsesNonExemptEncryption: false
    scheme:
      testTargets:
        - FocusPathTests
  FocusPathTests:
    type: bundle.unit-test
    platform: iOS
    sources:
      - FocusPathTests
    resources:
      - FocusPath/Data/Passages.json
    dependencies:
      - target: FocusPath
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: com.yuganshjain.somaTests
        GENERATE_INFOPLIST_FILE: YES
```

- [ ] **Step 2: Commit**

```bash
git add focuspath-ios/project.yml
git commit -m "feat(soma): rename app to Soma, update bundle ID"
```

---

### Task 12: Delete dead files, regenerate xcodeproj, run tests, build

**Files to delete:**
- `focuspath-ios/FocusPath/Views/Dashboard/DashboardView.swift`
- `focuspath-ios/FocusPath/Views/Dashboard/PassageCardView.swift`
- `focuspath-ios/FocusPath/Views/Quiz/QuizView.swift`
- `focuspath-ios/FocusPath/Views/Quiz/QuizQuestionView.swift`
- `focuspath-ios/FocusPath/Views/Reading/FocusTimerView.swift`
- `focuspath-ios/FocusPath/Views/Progress/ProgressView_.swift`
- `focuspath-ios/FocusPath/Views/Progress/WeeklyBarChart.swift`
- `focuspath-ios/FocusPath/Views/Settings/SettingsView.swift`
- `focuspath-ios/FocusPath/Models/QuizCache.swift`
- `focuspath-ios/FocusPath/Models/QuizQuestion.swift`
- `focuspath-ios/FocusPath/Services/ClaudeService.swift`
- `focuspath-ios/FocusPathTests/ClaudeServiceTests.swift`

- [ ] **Step 1: Delete dead files**

```bash
cd focuspath-ios && rm -f \
  FocusPath/Views/Dashboard/DashboardView.swift \
  FocusPath/Views/Dashboard/PassageCardView.swift \
  FocusPath/Views/Quiz/QuizView.swift \
  FocusPath/Views/Quiz/QuizQuestionView.swift \
  FocusPath/Views/Reading/FocusTimerView.swift \
  FocusPath/Views/Progress/ProgressView_.swift \
  FocusPath/Views/Progress/WeeklyBarChart.swift \
  FocusPath/Views/Settings/SettingsView.swift \
  FocusPath/Models/QuizCache.swift \
  FocusPath/Models/QuizQuestion.swift \
  FocusPath/Services/ClaudeService.swift \
  FocusPathTests/ClaudeServiceTests.swift
```

- [ ] **Step 2: Delete empty directories**

```bash
rmdir FocusPath/Views/Dashboard FocusPath/Views/Quiz \
      FocusPath/Views/Progress FocusPath/Views/Settings \
      FocusPath/Services 2>/dev/null; true
```

- [ ] **Step 3: Regenerate xcodeproj**

```bash
xcodegen generate
```

Expected: `✨ Done` with no errors.

- [ ] **Step 4: Delete app from simulator to reset SwiftData schema**

```bash
xcrun simctl uninstall booted com.yuganshjain.soma 2>/dev/null
xcrun simctl uninstall booted com.yuganshjain.focuspath 2>/dev/null
```

- [ ] **Step 5: Build the app**

```bash
xcodebuild build \
  -project FocusPath.xcodeproj \
  -scheme FocusPath \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  2>&1 | tail -5
```

Expected: `** BUILD SUCCEEDED **`

- [ ] **Step 6: Run all tests**

```bash
xcodebuild test \
  -project FocusPath.xcodeproj \
  -scheme FocusPath \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  2>&1 | grep -E "(Test Suite|PASS|FAIL|error:)" | tail -20
```

Expected: All HomeLogicTests and PassageStoreTests pass.

- [ ] **Step 7: Commit**

```bash
cd ..
git add -A
git commit -m "feat(soma): phase 1 complete — dark theme, Soul Dashboard, 4-tab nav"
```

---

## Phase 1 Complete

After Task 12, the app:
- Shows "Soma" as the display name on the home screen
- Opens to the Soul Dashboard (Home tab) with dark #0f0f1a background
- Shows the Soul Ring with saffron progress arc
- Shows 3 task cards (Read/Meditate/Reflect) that navigate to the correct tabs
- Practice tab shows the full dark-themed library
- Journal and You tabs show styled placeholder screens
- All 13 HomeLogicTests pass

**Next phases:**
- Phase 2: Meditation module (PracticeView with guided sessions + silent timer)
- Phase 3: Journal module (365 prompts, yearly intention, past entries)
- Phase 4: Engagement layer (notifications, share cards, badges, You tab)
