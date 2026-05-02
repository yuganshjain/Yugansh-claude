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
                    .trim(from: 0, to: min(max(CGFloat(progress), 0), 1))
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
                    Text("\(Int((progress * 100).rounded()))%")
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
