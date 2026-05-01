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

            LibraryView()
                .tabItem { Label("Library", systemImage: "books.vertical.fill") }

            ProgressView_()
                .tabItem { Label("Progress", systemImage: "chart.bar.fill") }

            SettingsView()
                .tabItem { Label("Settings", systemImage: "gearshape.fill") }
        }
        .tint(Theme.saffron)
    }

}
