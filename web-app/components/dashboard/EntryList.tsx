import Link from "next/link";

type Entry = { id: string; content: string; moodScore: number; createdAt: Date };

const moodEmoji = (score: number) => score >= 8 ? "😊" : score >= 5 ? "😐" : "😔";

export default function EntryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">📓</div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>No entries yet. Write your first one!</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <Link key={entry.id} href={`/journal/${entry.id}`}>
          <div className="rounded-xl p-4 border hover:border-violet-300 hover:shadow-sm transition cursor-pointer"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm line-clamp-2 flex-1" style={{ color: "var(--text-primary)" }}>{entry.content}</p>
              <span className="text-xl flex-shrink-0">{moodEmoji(entry.moodScore)}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span className="text-xs" style={{ color: "var(--border-color)" }}>·</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Mood {entry.moodScore}/10</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
