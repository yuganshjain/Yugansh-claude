import SwiftUI

struct YouView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Spacer()
                Text("👤")
                    .font(.system(size: 64))
                Text("Your Journey")
                    .font(.system(size: 28, weight: .black))
                    .foregroundStyle(Theme.text)
                Text("Profile, badges and stats\ncoming in a later phase")
                    .font(.system(size: 15))
                    .foregroundStyle(Theme.textMuted)
                    .multilineTextAlignment(.center)
                Spacer()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Theme.background.ignoresSafeArea())
            .toolbar(.hidden, for: .navigationBar)
        }
    }
}
