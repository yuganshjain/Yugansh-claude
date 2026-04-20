import AVFoundation

struct ToneProfile {
    let duration: Double
    let baseFreq: Double
    let peakFreq: Double
    let endFreq: Double
    let peakFraction: Double
    let vibratoDepth: Double
    let vibratoRate: Double
    let vibratoStartFraction: Double
    let attackTime: Double
    let releaseTime: Double
    let noiseAmount: Float
    let harmonics: [(multiplier: Double, amplitude: Double)]
}

extension ToneProfile {
    // Female pleasure moan — rising pitch, warm harmonics
    static let femaleMoan = ToneProfile(
        duration: 2.0,
        baseFreq: 200, peakFreq: 430, endFreq: 290,
        peakFraction: 0.58,
        vibratoDepth: 18, vibratoRate: 5.2, vibratoStartFraction: 0.22,
        attackTime: 0.12, releaseTime: 0.55,
        noiseAmount: 0.015,
        harmonics: [(2, 0.45), (3, 0.22), (4, 0.1), (5, 0.05)]
    )

    // Dying breath — falling pitch with breathiness
    static let dyingBreath = ToneProfile(
        duration: 2.6,
        baseFreq: 290, peakFreq: 290, endFreq: 45,
        peakFraction: 0.04,
        vibratoDepth: 10, vibratoRate: 3.2, vibratoStartFraction: 0.08,
        attackTime: 0.06, releaseTime: 1.3,
        noiseAmount: 0.09,
        harmonics: [(2, 0.3), (3, 0.12)]
    )

    // Male moan — deeper, gruff
    static let maleMoan = ToneProfile(
        duration: 1.9,
        baseFreq: 110, peakFreq: 230, endFreq: 155,
        peakFraction: 0.52,
        vibratoDepth: 12, vibratoRate: 4.5, vibratoStartFraction: 0.28,
        attackTime: 0.09, releaseTime: 0.4,
        noiseAmount: 0.025,
        harmonics: [(2, 0.5), (3, 0.28), (4, 0.14), (5, 0.06)]
    )

    // Male grunt/death — low falling
    static let maleGrunt = ToneProfile(
        duration: 1.8,
        baseFreq: 190, peakFreq: 190, endFreq: 65,
        peakFraction: 0.08,
        vibratoDepth: 7, vibratoRate: 2.8, vibratoStartFraction: 0.0,
        attackTime: 0.04, releaseTime: 0.7,
        noiseAmount: 0.14,
        harmonics: [(2, 0.38), (3, 0.18)]
    )

    // Baby giggle — high rapid pulses
    static let babyGiggle = ToneProfile(
        duration: 1.3,
        baseFreq: 520, peakFreq: 720, endFreq: 560,
        peakFraction: 0.48,
        vibratoDepth: 32, vibratoRate: 9.0, vibratoStartFraction: 0.0,
        attackTime: 0.04, releaseTime: 0.18,
        noiseAmount: 0.04,
        harmonics: [(2, 0.28), (3, 0.1)]
    )

    // Baby cry — sustained high pitch with wobble
    static let babyCry = ToneProfile(
        duration: 2.2,
        baseFreq: 460, peakFreq: 620, endFreq: 390,
        peakFraction: 0.28,
        vibratoDepth: 42, vibratoRate: 6.5, vibratoStartFraction: 0.0,
        attackTime: 0.07, releaseTime: 0.45,
        noiseAmount: 0.035,
        harmonics: [(2, 0.42), (3, 0.22), (4, 0.09)]
    )
}

final class ToneSynthesizer {
    private let engine = AVAudioEngine()
    private let player = AVAudioPlayerNode()

    init() {
        engine.attach(player)
        let format = AVAudioFormat(standardFormatWithSampleRate: 44100, channels: 1)!
        engine.connect(player, to: engine.mainMixerNode, format: format)
        try? engine.start()
    }

    func play(_ profile: ToneProfile) {
        guard let buffer = makeBuffer(profile) else { return }
        player.stop()
        player.scheduleBuffer(buffer, at: nil, options: .interrupts, completionHandler: nil)
        if !engine.isRunning { try? engine.start() }
        player.play()
    }

    func stop() {
        player.stop()
    }

    private func makeBuffer(_ p: ToneProfile) -> AVAudioPCMBuffer? {
        let rate = 44100.0
        let count = AVAudioFrameCount(p.duration * rate)
        let format = AVAudioFormat(standardFormatWithSampleRate: rate, channels: 1)!
        guard let buf = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: count) else { return nil }
        buf.frameLength = count

        let data = buf.floatChannelData![0]
        var phase = 0.0

        for i in 0..<Int(count) {
            let t = Double(i) / rate
            let freq = frequency(p, t: t)
            let vib  = vibrato(p, t: t)
            let amp  = envelope(p, t: t)

            phase += (freq + vib) / rate * 2 * .pi
            if phase > 2 * .pi { phase -= 2 * .pi }

            var sample = sin(phase)
            for h in p.harmonics { sample += h.amplitude * sin(h.multiplier * phase) }
            let noise = p.noiseAmount > 0 ? Float.random(in: -1...1) * p.noiseAmount : 0
            data[i] = Float(amp * sample) + noise
        }
        return buf
    }

    private func frequency(_ p: ToneProfile, t: Double) -> Double {
        let frac = t / p.duration
        if frac <= p.peakFraction {
            let prog = p.peakFraction > 0 ? frac / p.peakFraction : 1.0
            return p.baseFreq + (p.peakFreq - p.baseFreq) * smoothstep(prog)
        } else {
            let prog = (frac - p.peakFraction) / max(1 - p.peakFraction, 0.001)
            return p.peakFreq + (p.endFreq - p.peakFreq) * smoothstep(prog)
        }
    }

    private func vibrato(_ p: ToneProfile, t: Double) -> Double {
        let startT = p.vibratoStartFraction * p.duration
        guard t > startT else { return 0 }
        let fade = min((t - startT) / 0.3, 1.0)
        return p.vibratoDepth * fade * sin(2 * .pi * p.vibratoRate * t)
    }

    private func envelope(_ p: ToneProfile, t: Double) -> Double {
        let a = min(t / max(p.attackTime, 0.001), 1.0)
        let r = min((p.duration - t) / max(p.releaseTime, 0.001), 1.0)
        return min(a, r) * 0.68
    }

    private func smoothstep(_ x: Double) -> Double {
        let t = max(0, min(1, x))
        return t * t * (3 - 2 * t)
    }
}
