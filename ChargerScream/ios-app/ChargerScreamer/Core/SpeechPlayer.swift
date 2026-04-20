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
