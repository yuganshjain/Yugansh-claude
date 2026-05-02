import SwiftUI

struct JournalView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Spacer()
                Text("✍️")
                    .font(.system(size: 64))
                Text("Journal")
                    .font(.system(size: 28, weight: .black))
                    .foregroundStyle(Theme.text)
                Text("Daily prompts and reflections\ncoming in the next phase")
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
