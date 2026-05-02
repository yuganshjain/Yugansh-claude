import SwiftUI

struct AgeGateView: View {
    let onAccept: () -> Void

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            VStack(spacing: 32) {
                Spacer()

                Text("⚡")
                    .font(.system(size: 80))

                Text("ChargerScreamer")
                    .font(.system(size: 28, weight: .black, design: .rounded))
                    .foregroundColor(.white)

                Text("This app contains suggestive comedic audio.\nYou must be 17 or older to continue.")
                    .font(.body)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)

                Spacer()

                Button(action: onAccept) {
                    Text("I'm 17+ — Let's Go 🔥")
                        .font(.system(size: 18, weight: .bold, design: .rounded))
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(
                            LinearGradient(
                                colors: [.cyan, .blue],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .clipShape(Capsule())
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 48)
            }
        }
    }
}
