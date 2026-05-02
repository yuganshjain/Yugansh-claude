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
            Circle()
                .fill(isCharging ? Color.cyan.opacity(0.15) : Color.clear)
                .frame(width: 260, height: 260)
                .blur(radius: 30)
                .opacity(glowOpacity)

            ForEach(sparkles) { particle in
                Circle()
                    .fill(Color.cyan)
                    .frame(width: particle.size, height: particle.size)
                    .offset(x: particle.x, y: particle.y)
                    .opacity(particle.opacity)
            }

            ZStack {
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .fill(
                        isCharging
                        ? LinearGradient(colors: [.cyan.opacity(0.9), .blue], startPoint: .top, endPoint: .bottom)
                        : LinearGradient(colors: [Color(white: 0.25), Color(white: 0.15)], startPoint: .top, endPoint: .bottom)
                    )
                    .frame(width: 120, height: 200)
                    .shadow(color: isCharging ? .cyan.opacity(0.8) : .clear, radius: 20)

                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(
                        isCharging
                        ? LinearGradient(colors: [.white.opacity(0.9), .cyan.opacity(0.6)], startPoint: .topLeading, endPoint: .bottomTrailing)
                        : LinearGradient(colors: [Color(white: 0.1), Color(white: 0.1)], startPoint: .topLeading, endPoint: .bottomTrailing)
                    )
                    .frame(width: 98, height: 160)

                VStack(spacing: 8) {
                    HStack(spacing: 20) {
                        Circle()
                            .fill(isCharging ? Color.black : Color.gray.opacity(0.4))
                            .frame(width: 14, height: isCharging ? 14 : 8)
                        Circle()
                            .fill(isCharging ? Color.black : Color.gray.opacity(0.4))
                            .frame(width: 14, height: isCharging ? 14 : 8)
                    }
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

                Image(systemName: "bolt.fill")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.yellow)
                    .shadow(color: .yellow, radius: 8)
                    .opacity(boltOpacity)
                    .offset(y: -55)

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
        withAnimation(.spring(response: 0.3, dampingFraction: 0.5)) {
            breathScale = 1.18
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { startBreathing() }
        withAnimation(.easeIn(duration: 0.15)) { boltOpacity = 1 }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
            withAnimation(.easeOut(duration: 0.4)) { boltOpacity = 0 }
        }
        fireSparkles()
    }

    private func triggerUnplugAnimation() {
        withAnimation(.easeOut(duration: 0.3)) {
            breathScale = 0.95
            glowOpacity = 0.1
        }
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
            sparkles = sparkles.map {
                SparkleParticle(x: $0.x * 1.8, y: $0.y * 1.8, size: $0.size, opacity: 0)
            }
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
