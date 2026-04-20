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
