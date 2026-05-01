import SwiftUI

struct PassageCardView: View {
    let passage: Passage

    var body: some View {
        NavigationLink(destination: ReadingView(passageId: passage.id)) {
            VStack(alignment: .leading, spacing: 10) {
                Text("TODAY'S PASSAGE")
                    .font(.system(size: 10, weight: .bold))
                    .tracking(2)
                    .foregroundStyle(.white.opacity(0.8))

                Text("\u{201C}\(passage.quote)\u{201D}")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.white)
                    .lineSpacing(4)

                Text("\(passage.source) · \(passage.work) · ~\(passage.estimatedMinutes) min")
                    .font(.system(size: 12))
                    .foregroundStyle(.white.opacity(0.75))

                HStack {
                    Spacer()
                    Text("Begin Today's Session →")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(.white.opacity(0.2))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    Spacer()
                }
                .padding(.top, 4)
            }
            .padding(20)
            .background(
                LinearGradient(
                    colors: [Theme.saffron, Theme.saffronLight],
                    startPoint: .topLeading, endPoint: .bottomTrailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: 20))
        }
        .buttonStyle(.plain)
    }
}
