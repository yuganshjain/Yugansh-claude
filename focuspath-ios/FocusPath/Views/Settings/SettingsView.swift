import SwiftUI

struct SettingsView: View {
    @AppStorage("fp_traditions") private var traditionsData = ""
    @AppStorage("fp_target_mins") private var targetMins = 8

    private var enabledTraditions: [Tradition] {
        guard !traditionsData.isEmpty,
              let data = traditionsData.data(using: .utf8),
              let arr = try? JSONDecoder().decode([Tradition].self, from: data)
        else { return Tradition.allCases }
        return arr
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {

                    VStack(alignment: .leading, spacing: 12) {
                        sectionLabel("DAILY TARGET")
                        HStack {
                            Slider(value: Binding(
                                get: { Double(targetMins) },
                                set: { targetMins = Int($0) }
                            ), in: 3...30, step: 1)
                            .tint(Theme.saffron)
                            Text("\(targetMins) min")
                                .font(.system(size: 18, weight: .black))
                                .foregroundStyle(Theme.saffron)
                                .frame(width: 60, alignment: .trailing)
                        }
                    }
                    .padding(16)
                    .background(Theme.creamDark)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.border, lineWidth: 1))
                    .clipShape(RoundedRectangle(cornerRadius: 16))

                    VStack(alignment: .leading, spacing: 12) {
                        sectionLabel("TRADITIONS")
                        ForEach(Tradition.allCases, id: \.self) { tradition in
                            HStack {
                                Text(tradition.displayName)
                                    .font(.system(size: 15))
                                    .foregroundStyle(Theme.brown)
                                Spacer()
                                Toggle("", isOn: Binding(
                                    get: { enabledTraditions.contains(tradition) },
                                    set: { toggle(tradition, on: $0) }
                                ))
                                .tint(Theme.saffron)
                                .labelsHidden()
                            }
                            .padding(.vertical, 4)
                            if tradition != Tradition.allCases.last {
                                Divider().background(Theme.border)
                            }
                        }
                    }
                    .padding(16)
                    .background(Theme.creamDark)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.border, lineWidth: 1))
                    .clipShape(RoundedRectangle(cornerRadius: 16))

                    VStack(alignment: .leading, spacing: 6) {
                        sectionLabel("ABOUT")
                        Text("FocusPath v1.0")
                            .font(.system(size: 14))
                            .foregroundStyle(Theme.brownMuted)
                        Text("Train your attention through daily spiritual reading.")
                            .font(.system(size: 13))
                            .foregroundStyle(Theme.brownMuted)
                    }
                    .padding(16)
                    .background(Theme.creamDark)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.border, lineWidth: 1))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .padding(20)
            }
            .background(Theme.cream.ignoresSafeArea())
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private func sectionLabel(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 10, weight: .bold))
            .tracking(1.5)
            .foregroundStyle(Theme.brownMuted)
    }

    private func toggle(_ tradition: Tradition, on: Bool) {
        var current = enabledTraditions
        if on { if !current.contains(tradition) { current.append(tradition) } }
        else { current.removeAll { $0 == tradition } }
        if let data = try? JSONEncoder().encode(current),
           let str = String(data: data, encoding: .utf8) {
            traditionsData = str
        }
    }
}
