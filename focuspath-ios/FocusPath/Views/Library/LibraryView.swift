import SwiftUI
import SwiftData

struct LibraryView: View {
    @Query(filter: #Predicate<FocusSession> { $0.completed == true }) private var sessions: [FocusSession]
    @State private var searchText = ""

    private var readPassageIds: Set<String> {
        Set(sessions.map(\.passageId))
    }

    private var filteredPassages: [Passage] {
        if searchText.isEmpty { return [] }
        let q = searchText.lowercased()
        return PassageStore.shared.all.filter {
            $0.source.lowercased().contains(q) ||
            $0.work.lowercased().contains(q) ||
            $0.quote.lowercased().contains(q) ||
            $0.tradition.displayName.lowercased().contains(q)
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    if !searchText.isEmpty {
                        searchResults
                    } else {
                        ForEach(Tradition.allCases, id: \.self) { tradition in
                            TraditionSection(tradition: tradition, readIds: readPassageIds)
                        }
                    }
                }
                .padding(20)
            }
            .background(Theme.cream.ignoresSafeArea())
            .navigationTitle("Library")
            .navigationBarTitleDisplayMode(.large)
            .searchable(text: $searchText, prompt: "Search passages, authors\u{2026}")
        }
    }

    private var searchResults: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("\(filteredPassages.count) results")
                .font(.system(size: 12))
                .foregroundStyle(Theme.brownMuted)
            ForEach(filteredPassages) { passage in
                PassageRow(passage: passage, read: readPassageIds.contains(passage.id))
            }
            if filteredPassages.isEmpty {
                Text("No passages found for \u{201C}\(searchText)\u{201D}")
                    .font(.system(size: 14))
                    .foregroundStyle(Theme.brownMuted)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.top, 20)
            }
        }
    }
}

private struct TraditionSection: View {
    let tradition: Tradition
    let readIds: Set<String>

    private var passages: [Passage] {
        PassageStore.shared.all.filter { $0.tradition == tradition }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(tradition.displayName.uppercased())
                    .font(.system(size: 11, weight: .bold))
                    .tracking(1.5)
                    .foregroundStyle(Theme.brownMuted)
                Spacer()
                let readCount = passages.filter { readIds.contains($0.id) }.count
                Text("\(readCount)/\(passages.count) read")
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.brownMuted)
            }
            ForEach(passages) { passage in
                PassageRow(passage: passage, read: readIds.contains(passage.id))
            }
        }
    }
}

struct PassageRow: View {
    let passage: Passage
    let read: Bool

    var body: some View {
        NavigationLink(destination: ReadingView(passageId: passage.id)) {
            HStack(alignment: .top, spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text(passage.source)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(Theme.brown)
                        Text("\u{00B7}")
                            .foregroundStyle(Theme.brownMuted)
                        Text(passage.work)
                            .font(.system(size: 13))
                            .foregroundStyle(Theme.brownMuted)
                            .lineLimit(1)
                    }
                    Text("\u{201C}\(passage.quote)\u{201D}")
                        .font(.system(size: 14, design: .serif))
                        .foregroundStyle(Theme.brown)
                        .lineLimit(2)
                    HStack(spacing: 8) {
                        Text("~\(passage.estimatedMinutes) min")
                            .font(.system(size: 11))
                            .foregroundStyle(Theme.brownMuted)
                        if read {
                            Text("\u{2713} Read")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundStyle(Theme.greenOk)
                        }
                    }
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 12))
                    .foregroundStyle(Theme.border)
                    .padding(.top, 2)
            }
            .padding(14)
            .background(read ? Theme.greenOk.opacity(0.06) : Theme.creamDark)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(read ? Theme.greenOk.opacity(0.3) : Theme.border, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .buttonStyle(.plain)
    }
}
