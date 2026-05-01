# Soma — App Design Spec

**Date:** 2026-05-01  
**Status:** Approved

---

## Overview

Soma is a free spiritual wellness iOS app for young adults (18–30) curious about personal growth. It combines sacred reading, guided meditation, reflective journaling, and a gamified progress system into one cohesive daily practice. The name "Soma" (Sanskrit: body & bliss) signals nourishment of mind, body, and soul.

**Goal:** Help a generation of young adults build a daily inner practice — reading ancient wisdom, meditating, journaling intentions — through beautiful design, smart defaults, and just enough gamification to build the habit without trivializing the content.

---

## Brand & Visual Identity

- **Color palette:** Dark (#0f0f1a background), Saffron (#f4a261 primary accent), Green (#86efac secondary), Gold (#e9c46a highlight)
- **Typography:** SF Pro / system font; 800-weight headings, italic for quotes
- **Tone:** Calm, purposeful, premium. Never gamey or hyper. Wisdom deserves reverence.
- **Target:** App Store, free forever, iOS 17+

---

## Architecture: 4-Tab Structure

```
TabView
├── Home (Soul Dashboard)       — daily practice overview + XP ring
├── Practice (Read + Meditate)  — library, reading, meditation sessions
├── Journal (Reflect + Goals)   — daily prompts, past entries, yearly intention
└── You (Profile + Progress)    — stats, badges, streaks, share
```

Navigation: `TabView` with `@State private var selectedTab` and `.tag()` for programmatic tab switching (e.g., tapping a dashboard card jumps to Practice tab).

---

## Tab 1: Home — Soul Dashboard

The landing screen. Shows today's practice status and motivates completion.

**Components:**
- **Greeting:** Time-of-day greeting ("Good morning 🙏") + date + day count ("Day 14 of your journey")
- **Soul Ring:** Circular progress ring showing % of today's practice complete. Center shows XP level name + level number. Below ring: streak count 🔥, passages read 📖, meditation hours 🧘.
- **Today's Practice cards:** 3 task cards — Read / Meditate / Reflect. Each shows status (○ pending / ✓ done). Tapping navigates to the relevant tab.
- **Bottom nav:** Home · Practice · Journal · You

**Data:** Derived from today's `FocusSession`, `MeditationSession`, and `JournalEntry` records. Soul Ring = (completed tasks / 3) × 100%.

---

## Tab 2: Practice — Read & Meditate

Two sections: Today's Reading (passage card) + Meditate (session grid) + Library (browse all).

### Reading

- **Today's passage card:** Gradient card (saffron/orange) showing today's curated passage — eyebrow label, opening quote, author + source + estimated time + XP reward.
- **Library:** Scrollable chip row (Stoics · Bhagavad Gita · Tao · Upanishads · Bible · Quran · Buddhist). Tapping opens a filtered `LibraryView` (already built in FocusPath).
- **ReadingView:** Full passage text, GeometryReader scroll-progress tracking. "Finish" unlocks after 60% scroll. On finish: inline completion card showing XP earned, level emoji, opening quote as send-off. Writes `FocusSession` to SwiftData.

### Meditation

- **Session grid (2×2):** Breath (5 min) · Body Scan (10 min) · Stillness (15 min) · Silent Timer (custom)
- **Guided sessions:** Text-based card sequence with voice breathing cues via `AVSpeechSynthesizer`. Each session is a sequence of timed phases (e.g., Inhale 4s → Hold 4s → Exhale 6s). The synth speaks "Inhale..." / "Hold..." / "Exhale..." at the start of each phase in a slow, calm rate (`utteranceRate ≈ 0.35`). A visual expanding/contracting circle animates in sync with the phase. A progress bar shows how far through the session the user is. User can tap to skip to next phase or end early.
- **Breathing patterns per session:**
  - Breath (5 min): 4-4-6 box-ish (Inhale 4 · Hold 2 · Exhale 6) — calming
  - Body Scan (10 min): 4-0-6 natural breath (Inhale 4 · Exhale 6) — relaxed awareness
  - Stillness (15 min): 4-4-4-4 box breathing (Inhale 4 · Hold 4 · Exhale 4 · Hold 4) — focused
- **Silent Timer:** User sets duration via picker. Simple countdown with a gentle end chime (system sound or short bundled MP3). No voice. Writes `MeditationSession` to SwiftData.
- **XP:** Guided = 30 XP fixed. Silent timer = 2 XP per minute (e.g., 10 min = 20 XP).

---

## Tab 3: Journal — Reflect & Goals

Three sections: Yearly Intention · Today's Prompt · Past Entries.

### Yearly Intention

- Purple gradient card at top. Shows user's stated yearly intention in italic. Tappable to edit.
- Set on first launch via onboarding prompt: "What is your intention for this year?"
- Stored in `UserDefaults` (single string, not SwiftData — doesn't need history).

### Daily Prompts

- 365 pre-written prompts, one per day of year. Indexed by `dayOfYear`.
- Prompt card shows the question text + a multi-line text editor (SwiftUI `TextEditor`).
- Saving writes a `JournalEntry` with date + prompt text + response text.
- Once saved, entry becomes read-only (tappable to expand).

### Past Entries

- Reverse-chronological list of saved `JournalEntry` records.
- Each row: date · first line preview. Tap to read full entry.

---

## Tab 4: You — Profile & Progress

Shows the user's overall journey.

**Components:**
- **Profile header:** Avatar (SF Symbol person.fill in a circle), display name (editable), join date, total days active.
- **Stats row:** Total passages read · Total meditation minutes · Journal entries written · Current streak.
- **XP & Level:** Large Soul Ring (same component as home but full-size), level name + progress bar to next level, XP counts.
- **Badges grid:** All earned badges shown as 60×60 cards (icon + name). Locked badges shown at 30% opacity. Tapping a badge shows its unlock condition.
- **Weekly Soul Report:** "Week 14 card" showing sessions, XP, best journal line. Share button generates a UIImage card for iOS share sheet.

---

## XP & Levels System

Unchanged from FocusPath — already implemented in `XPSystem.swift`.

| Level | Name | XP Threshold |
|---|---|---|
| 1 | Seeker 🌱 | 0 |
| 2 | Reader 📖 | 200 |
| 3 | Scholar 🔍 | 500 |
| 4 | Sage 🌿 | 1,000 |
| 5 | Master ⚡ | 2,000 |
| 6 | Enlightened ✨ | 4,000 |

**XP sources:**
- Reading passage: 50 + (estimatedMinutes × 5)
- Guided meditation: 30
- Silent meditation: 2 × minutes
- Journal entry: 20
- Completing all 3 daily practices: +10 bonus

---

## Badges

| Badge | Unlock Condition |
|---|---|
| 🌅 First Light | Complete all 3 practices (Read + Meditate + Journal) in one day |
| 🔥 Unbreakable | 30-day streak |
| 📖 Stoic | Read all 13 Stoic passages |
| 🕉️ Gita Scholar | Read all 11 Gita passages |
| ☯️ Tao Walker | Read all 10 Tao passages |
| 🧘 Still Mind | Meditate 10 sessions |
| ✍️ Inner Voice | Write 10 journal entries |
| 🌟 Soul Week | Complete all 3 practices 7 days in a row |
| 🏅 Centurion | 100 total sessions (reading + meditation combined) |

---

## 6 Built-In Features

### 1. Morning Notification with Today's Wisdom
- Daily notification at user-chosen time (default 7:00 AM)
- Notification body = first sentence of today's passage (not "Time to open the app!")
- Implemented via `UNUserNotificationCenter` with `.calendar` trigger, scheduled on app launch / daily.

### 2. Share Quote as Beautiful Card
- After completing a reading, "Share" button appears on the completion screen.
- Generates a `UIImage` using `UIGraphicsImageRenderer`: dark background, saffron quote text, small "Soma" wordmark at bottom.
- Opens standard iOS share sheet via `UIActivityViewController`.

### 3. Mood-Based Suggestions
- Available on the Home screen as a secondary action: "How are you feeling?"
- 5 moods: Anxious · Lost · Angry · Grateful · Empty
- Each mood maps to a curated set of passage IDs. Tapping a mood opens a passage from that set.
- Mapping stored as a static dictionary in a `MoodRouter.swift` file.

### 4. Weekly Soul Report
- Generated every Sunday (or on-demand from the You tab).
- Card shows: week number, sessions completed, meditation minutes, best journal entry line (first line of highest-word-count entry that week), XP earned.
- Shareable as UIImage card (reuses share card infrastructure).

### 5. Badges & Milestones
- As defined in the Badges table above.
- `BadgeEngine.swift` evaluates conditions against SwiftData query results on each app foreground.
- Newly earned badges trigger a `UNUserNotificationContent` banner ("You earned: 🔥 Unbreakable!") and a sheet overlay in-app.

### 6. 365 Daily Journal Prompts
- Pre-written, thought-provoking prompts indexable by `Calendar.current.ordinality(of: .day, in: .year, for: Date())`.
- Prompts stored in `Prompts.json` (bundled asset), same pattern as `Passages.json`.
- Prompts rotate year-over-year (day 1 of every year resets to prompt index 0).

---

## Data Models (SwiftData)

```swift
@Model class FocusSession {
    var passageId: String
    var completedAt: Date
    var xpEarned: Int
    var completed: Bool
}

@Model class MeditationSession {
    var type: String           // "guided" | "silent"
    var guideName: String?     // e.g. "Breath", "Body Scan"
    var durationMinutes: Int
    var completedAt: Date
    var xpEarned: Int
}

@Model class JournalEntry {
    var date: Date
    var promptText: String
    var responseText: String
    var wordCount: Int         // computed on save
}
```

**UserDefaults keys:**
- `soma.yearlyIntention` — String
- `soma.notificationTime` — Date (time component only)
- `soma.userName` — String
- `soma.joinDate` — Date (set on first launch, used for "Day N of your journey" counter)

---

## Tech Stack

| Concern | Technology |
|---|---|
| UI | SwiftUI |
| Persistence | SwiftData (iOS 17+) |
| Notifications | UserNotifications framework |
| Share cards | UIGraphicsImageRenderer (UIKit) |
| Project generation | XcodeGen (`project.yml`) |
| Minimum iOS | 17.0 |
| Architecture | MVVM-lite (Views + Models, no separate ViewModels for v1) |

---

## Build Phases (4 Sub-Projects)

The implementation is split into four sequential phases, each producing working, testable software:

1. **Foundation + Soul Dashboard**
   - Rename FocusPath → Soma (bundle ID, display name, colors, app icon placeholder)
   - New dark theme (`Theme.swift` update)
   - `HomeView` (Soul Dashboard) replacing `DashboardView`
   - New `MeditationSession` and `JournalEntry` SwiftData models
   - Wired navigation (TabView programmatic switching)

2. **Meditation Module**
   - `MeditationView` with session grid
   - `GuidedSessionView` (text-card sequence, timed)
   - `SilentTimerView` (duration picker + countdown)
   - XP award + `MeditationSession` save

3. **Journal Module**
   - `Prompts.json` (365 prompts)
   - `JournalView` with yearly intention card, today's prompt, past entries
   - `JournalEntry` read/write
   - XP award on save

4. **Engagement Layer**
   - Morning notification scheduling (`NotificationScheduler.swift`)
   - Share card generation (`ShareCardGenerator.swift`)
   - Mood-based suggestions (`MoodRouter.swift`)
   - Weekly Soul Report generation
   - Badge evaluation engine (`BadgeEngine.swift`)
   - You tab: full stats + badges grid + share weekly report

---

## Out of Scope (v1)

- Audio for guided meditations (text-only guidance in v1)
- Social / community features
- iCloud sync
- Apple Watch companion
- In-app purchases / paywall
- Onboarding tutorial (beyond yearly intention prompt)
