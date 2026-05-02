# ChargerScreamer — Design Spec
**Date:** 2026-04-20
**One-liner:** "Your iPhone finally reacts the way it should."

---

## Overview

ChargerScreamer is a native iOS novelty app for iPhone 15+ (USB-C). When the user plugs in their charger, the phone plays a dramatic sound. When they unplug, it plays a different sound. The entire experience lives on a single animated screen. No IAP, no subscriptions, no backend.

---

## Target Platform

- **OS:** iOS 17+ (SwiftUI, modern concurrency)
- **Devices:** iPhone 15 and later (USB-C hardware — enforced via device model check on launch)
- **Orientation:** Portrait only
- **App Store rating:** 17+ (suggestive audio content)

---

## Architecture

### Components

| Component | Role |
|---|---|
| `ChargerMonitor` | `ObservableObject` wrapping `UIDevice.batteryStateDidChangeNotification`. Exposes `isCharging: Bool` and fires `onPlug` / `onUnplug` callbacks. Enables battery monitoring on init, disables on deinit. |
| `SoundPlayer` | Wraps `AVAudioPlayer`. Loads bundled `.mp3` assets. Exposes `play(sound:)`. Handles `AVAudioSession` category (`.ambient`) so it mixes with user's music instead of interrupting it. |
| `HapticManager` | Wraps `UIImpactFeedbackGenerator`. `plug()` fires `.heavy`, `unplug()` fires `.light` + `.medium` sequence. |
| `SoundPackStore` | Holds the 3 `SoundPack` structs. Persists selected pack to `UserDefaults`. |
| `ContentView` | Single SwiftUI screen. Subscribes to `ChargerMonitor`. Drives all animations, sound, haptics. |
| `AgeGateView` | One-time modal on first launch. Single "I'm 17+" confirm button. Stored in `UserDefaults`. |
| `DeviceGuardView` | Shown on unsupported devices (pre-iPhone 15). Non-dismissable. |

### Data Flow

```
UIDevice notification
      ↓
ChargerMonitor (publishes isCharging)
      ↓
ContentView (reacts to state change)
    ├── SoundPlayer.play(pack.plugSound or pack.unplugSound)
    ├── HapticManager.plug() or .unplug()
    └── Animation state update (orb pulses / cracks)
```

---

## Sound Packs

Three packs, each with two audio assets (`plug.mp3`, `unplug.mp3`):

| Pack | Plug Sound | Unplug Sound |
|---|---|---|
| **Daddy Mode** (default) | Satisfied moan: "yes, daddy" | Dramatic dying breath |
| **Drama Queen** | Theatrical gasp of delight | Soap opera death wail |
| **Robot** | Robotic "POWER ENGAGED" | Robotic "SYSTEM FAILURE" |

All audio assets are bundled in the app. No network requests. Assets must be original recordings or properly licensed — not sourced from the internet.

---

## UI — Single Screen

### Charging Orb (center)
- Large circular shape, full-color glow when charging (electric green/blue)
- Pulses with a breathing animation while charging
- On unplug: color drains to grey, orb "cracks" with a brief shake animation
- On plug: orb fills with light, scale bounce

### Pack Selector (bottom)
- 3 pill-shaped buttons: "Daddy Mode", "Drama Queen", "Robot"
- Selected pack highlighted; tapping switches immediately (no replaying sounds on switch)

### Top Bar
- Left: app name / logo
- Right: mute toggle (speaker icon, persisted to `UserDefaults`)

### Stat (below orb)
- "Charged X times today" — increments on each plug event, resets at midnight using `Calendar`

### First Launch
- `AgeGateView` modal: dark screen, app name, "This app contains suggestive audio. You must be 17 or older to continue." + "I'm 17+ — Let's Go" button
- Dismissed permanently after first confirm

---

## Device Guard

On app launch, check device model identifier against known USB-C iPhones (iPhone15,x and later). If unsupported:
- Show `DeviceGuardView`: "ChargerScreamer is for iPhone 15 and later (USB-C only). Upgrade your phone, then come back."
- App is non-functional on unsupported devices but does not crash.

Supported model identifiers: `iPhone15,2`, `iPhone15,3`, `iPhone15,4`, `iPhone15,5`, `iPhone16,1`, `iPhone16,2`, `iPhone17,1`, `iPhone17,2`, `iPhone17,3`, `iPhone17,4` and simulator.

---

## Error Handling

- Audio file missing: `SoundPlayer` fails silently — haptic still fires
- Battery monitoring unavailable (simulator): `ChargerMonitor` exposes a debug toggle in `#if DEBUG` builds to simulate plug/unplug
- Muted: sound skipped, haptic still fires

---

## Testing

- Unit test `ChargerMonitor` with mock `UIDevice` state changes
- Unit test `SoundPackStore` persistence round-trip
- Manual test on iPhone 15+ physical device for audio and haptic
- Manual test on iPhone 14 or earlier to confirm device guard shows
- Manual test first-launch age gate appears, then never again

---

## App Store Submission Checklist

- Privacy manifest: no data collected, no tracking
- Age rating: 17+ (Frequent/Intense Sexual Content or Nudity → suggestive audio)
- App description must explicitly state "app must be open to detect charger events" — foreground-only, no background detection
- Screenshots: show the orb in both charged/uncharged states
- No IAP, no subscriptions, no network entitlements needed
