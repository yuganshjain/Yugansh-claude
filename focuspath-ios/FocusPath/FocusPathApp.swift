import SwiftUI
import SwiftData

enum Tab: Int {
    case home, practice, journal, you
}

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
    @State private var selectedTab = Tab.home.rawValue

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView(selectedTab: $selectedTab)
                .tabItem { Label("Home", systemImage: "sparkles") }
                .tag(Tab.home.rawValue)

            PracticeView()
                .tabItem { Label("Practice", systemImage: "leaf.fill") }
                .tag(Tab.practice.rawValue)

            JournalView()
                .tabItem { Label("Journal", systemImage: "square.and.pencil") }
                .tag(Tab.journal.rawValue)

            YouView()
                .tabItem { Label("You", systemImage: "person.fill") }
                .tag(Tab.you.rawValue)
        }
        .tint(Theme.saffron)
        .preferredColorScheme(.dark)
    }

}
