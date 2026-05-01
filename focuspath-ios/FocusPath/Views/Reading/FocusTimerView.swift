import SwiftUI

struct FocusTimerView: View {
    let seconds: Int

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(formatted)
                    .font(.system(size: 36, weight: .black, design: .monospaced))
                    .foregroundStyle(Theme.saffron)
                Text("Time reading")
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.brownMuted)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text("Focus")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(Theme.brown)
                Text("Stay with it")
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.brownMuted)
            }
        }
        .padding(16)
        .background(Theme.creamDark)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Theme.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var formatted: String {
        String(format: "%02d:%02d", seconds / 60, seconds % 60)
    }
}
