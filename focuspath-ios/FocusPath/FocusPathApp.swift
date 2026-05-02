import SwiftUI
import SwiftData

@main
struct FocusPathApp: App {
    var body: some Scene {
        WindowGroup {
            MainTabView()
        }
        .modelContainer(for: [FocusSession.self, MeditationSession.self, JournalEntry.self])
    }
}

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView(selectedTab: $selectedTab)
                .tabItem { Label("Home", systemImage: "sparkles") }
                .tag(0)

            PracticeView()
                .tabItem { Label("Practice", systemImage: "leaf.fill") }
                .tag(1)

            JournalView()
                .tabItem { Label("Journal", systemImage: "square.and.pencil") }
                .tag(2)

            YouView()
                .tabItem { Label("You", systemImage: "person.fill") }
                .tag(3)
        }
        .tint(Theme.saffron)
        .preferredColorScheme(.dark)
    }

}
