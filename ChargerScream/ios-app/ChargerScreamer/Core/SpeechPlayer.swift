import AVFoundation
import Combine

final class SoundEngine: NSObject, ObservableObject, AVSpeechSynthesizerDelegate {
    @Published var isMuted: Bool {
        didSet { UserDefaults.standard.set(isMuted, forKey: "isMuted") }
    }

    private let synthesizer = AVSpeechSynthesizer()
    private lazy var toneSynth = ToneSynthesizer()
    private var bestVoice: AVSpeechSynthesisVoice?

    override init() {
        self.isMuted = UserDefaults.standard.bool(forKey: "isMuted")
        super.init()
        synthesizer.delegate = self
        setupAudioSession()
        bestVoice = selectBestVoice()
    }

    func play(_ config: SoundConfig) {
        guard !isMuted else { return }
        switch config {
        case .speech(let sc): playSpeech(sc)
        case .tone(let tp):   toneSynth.play(tp)
        }
    }

    func toggleMute() {
        isMuted.toggle()
        if isMuted {
            synthesizer.stopSpeaking(at: .immediate)
            toneSynth.stop()
        }
    }

    // MARK: - Private

    private func playSpeech(_ config: SpeechConfig) {
        synthesizer.stopSpeaking(at: .immediate)
        let utterance = AVSpeechUtterance(string: config.text)
        utterance.rate = config.rate
        utterance.pitchMultiplier = config.pitch
        utterance.preUtteranceDelay = config.preDelay
        utterance.voice = bestVoice ?? AVSpeechSynthesisVoice(language: config.voiceLanguage)
        synthesizer.speak(utterance)
    }

    private func setupAudioSession() {
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: .mixWithOthers)
        try? AVAudioSession.sharedInstance().setActive(true)
    }

    private func selectBestVoice() -> AVSpeechSynthesisVoice? {
        // Prefer premium → enhanced → default, English only
        let voices = AVSpeechSynthesisVoice.speechVoices()
            .filter { $0.language.hasPrefix("en-") }
            .sorted { $0.quality.rawValue > $1.quality.rawValue }
        return voices.first
    }
}
