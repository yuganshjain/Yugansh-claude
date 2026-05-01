import SwiftUI
import SwiftData

@main
struct FocusPathApp: App {
    var body: some Scene {
        WindowGroup {
            MainTabView()
        }
        .modelContainer(for: [FocusSession.self, QuizCache.self])
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem { Label("Home", systemImage: "house.fill") }

            ReadingView(passageId: todayPassageId())
                .tabItem { Label("Today", systemImage: "book.fill") }

            ProgressView_()
                .tabItem { Label("Progress", systemImage: "chart.bar.fill") }

            SettingsView()
                .tabItem { Label("Settings", systemImage: "gearshape.fill") }
        }
        .tint(Theme.saffron)
    }

    private func todayPassageId() -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return PassageStore.shared.todayPassage(
            dateString: f.string(from: Date()),
            traditions: nil
        ).id
    }
}
