import AVFoundation

struct SpeechConfig {
    let text: String
    let rate: Float
    let pitch: Float
    let voiceLanguage: String
    let preDelay: TimeInterval

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

enum SoundConfig {
    case speech(SpeechConfig)
    case tone(ToneProfile)
}

struct SoundPack: Identifiable {
    let id: String
    let name: String
    let emoji: String
    let plugSound: SoundConfig
    let unplugSound: SoundConfig
}

extension SoundPack {
    static let all: [SoundPack] = [
        // ── Synthesized tone packs ──────────────────────────────────
        SoundPack(
            id: "moan",
            name: "Moan",
            emoji: "😩",
            plugSound: .tone(.femaleMoan),
            unplugSound: .tone(.dyingBreath)
        ),
        SoundPack(
            id: "daddy",
            name: "Daddy",
            emoji: "😈",
            plugSound: .tone(.maleMoan),
            unplugSound: .tone(.maleGrunt)
        ),
        SoundPack(
            id: "baby",
            name: "Baby Mode",
            emoji: "👶",
            plugSound: .tone(.babyGiggle),
            unplugSound: .tone(.babyCry)
        ),

        // ── Premium TTS packs ───────────────────────────────────────
        SoundPack(
            id: "gen_alpha",
            name: "Gen Alpha",
            emoji: "💅",
            plugSound: .speech(SpeechConfig(
                text: "Slay! It's giving power, periodt!",
                rate: 0.54, pitch: 1.22
            )),
            unplugSound: .speech(SpeechConfig(
                text: "No cap that actually hurt. It's giving deceased, bestie.",
                rate: 0.48, pitch: 1.18
            ))
        ),
        SoundPack(
            id: "office",
            name: "The Office",
            emoji: "📎",
            plugSound: .speech(SpeechConfig(
                text: "That's... what she said.",
                rate: 0.5, pitch: 0.98
            )),
            unplugSound: .speech(SpeechConfig(
                text: "No. God. Please. No. No. NO!",
                rate: 0.42, pitch: 0.94
            ))
        ),
        SoundPack(
            id: "breaking_bad",
            name: "Breaking Bad",
            emoji: "🧪",
            plugSound: .speech(SpeechConfig(
                text: "I... am the one who charges.",
                rate: 0.36, pitch: 0.82
            )),
            unplugSound: .speech(SpeechConfig(
                text: "Say my name. You're god damn right.",
                rate: 0.38, pitch: 0.8
            ))
        ),
        SoundPack(
            id: "got",
            name: "Game of Thrones",
            emoji: "🐉",
            plugSound: .speech(SpeechConfig(
                text: "Dracarys.",
                rate: 0.34, pitch: 0.85
            )),
            unplugSound: .speech(SpeechConfig(
                text: "Shame. Shame. Shame.",
                rate: 0.28, pitch: 0.88
            ))
        ),
        SoundPack(
            id: "friends",
            name: "Friends",
            emoji: "☕",
            plugSound: .speech(SpeechConfig(
                text: "How... you doin'?",
                rate: 0.48, pitch: 1.04
            )),
            unplugSound: .speech(SpeechConfig(
                text: "PIVOT! PIVOT!! PIVOOOT!!!",
                rate: 0.52, pitch: 1.08
            ))
        ),
        SoundPack(
            id: "shrek",
            name: "Shrek",
            emoji: "🧅",
            plugSound: .speech(SpeechConfig(
                text: "What are you doing... in my swamp?!",
                rate: 0.4, pitch: 0.72
            )),
            unplugSound: .speech(SpeechConfig(
                text: "No! Not my charger! Not the charger!",
                rate: 0.42, pitch: 0.75
            ))
        ),
        SoundPack(
            id: "squid_game",
            name: "Squid Game",
            emoji: "🦑",
            plugSound: .speech(SpeechConfig(
                text: "Red light... green light.",
                rate: 0.36, pitch: 1.12,
                preDelay: 0.25
            )),
            unplugSound: .speech(SpeechConfig(
                text: "You have been... eliminated.",
                rate: 0.38, pitch: 1.08
            ))
        ),
        SoundPack(
            id: "spongebob",
            name: "SpongeBob",
            emoji: "🧽",
            plugSound: .speech(SpeechConfig(
                text: "I'm ready! I'm ready! I'm ready!",
                rate: 0.58, pitch: 1.65
            )),
            unplugSound: .speech(SpeechConfig(
                text: "MY LEG!!",
                rate: 0.46, pitch: 1.62
            ))
        ),
    ]

    static let `default` = all[0]
}
