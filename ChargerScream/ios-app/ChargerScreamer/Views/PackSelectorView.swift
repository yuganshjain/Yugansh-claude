import SwiftUI

struct PackSelectorView: View {
    @ObservedObject var store: SoundPackStore

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(SoundPack.all) { pack in
                    PackCard(
                        pack: pack,
                        isSelected: store.selectedPack.id == pack.id
                    ) {
                        store.select(pack)
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 8)
        }
    }
}

private struct PackCard: View {
    let pack: SoundPack
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 6) {
                Text(pack.emoji)
                    .font(.system(size: 28))
                Text(pack.name)
                    .font(.system(size: 11, weight: .semibold, design: .rounded))
                    .foregroundColor(isSelected ? .white : .gray)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            .frame(width: 80, height: 80)
            .background(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .stroke(
                                isSelected
                                ? LinearGradient(colors: [.cyan, .blue], startPoint: .topLeading, endPoint: .bottomTrailing)
                                : LinearGradient(colors: [.clear], startPoint: .topLeading, endPoint: .bottomTrailing),
                                lineWidth: 2
                            )
                    )
            )
            .shadow(color: isSelected ? .cyan.opacity(0.4) : .clear, radius: 8)
            .scaleEffect(isSelected ? 1.05 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
        }
        .buttonStyle(.plain)
    }
}
