import SwiftUI

struct WeeklyBarChart: View {
    let data: [(label: String, avgSeconds: Int)]

    private var maxVal: Int { data.map(\.avgSeconds).max() ?? 1 }

    var body: some View {
        if data.isEmpty {
            Text("Complete your first session to see your chart.")
                .font(.system(size: 13))
                .foregroundStyle(Theme.brownMuted)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 20)
        } else {
            HStack(alignment: .bottom, spacing: 8) {
                ForEach(data, id: \.label) { item in
                    VStack(spacing: 4) {
                        Text(fmt(item.avgSeconds))
                            .font(.system(size: 8))
                            .foregroundStyle(Theme.brownMuted)
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Theme.saffron)
                            .frame(height: barHeight(item.avgSeconds))
                        Text(item.label)
                            .font(.system(size: 9))
                            .foregroundStyle(Theme.brownMuted)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .frame(height: 100)
        }
    }

    private func barHeight(_ seconds: Int) -> CGFloat {
        CGFloat(seconds) / CGFloat(maxVal) * 80
    }

    private func fmt(_ s: Int) -> String { "\(s / 60)m" }
}
