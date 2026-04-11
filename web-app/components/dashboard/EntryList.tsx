import Link from "next/link";

type Entry = { id: string; content: string; moodScore: number; createdAt: Date };

const moodEmoji = (score: number) => score >= 8 ? "😊" : score >= 5 ? "😐" : "😔";

export default function EntryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-4xl mb-3">📓</div>
        <p className="text-sm">No entries yet. Write your first one!</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <Link key={entry.id} href={`/journal/${entry.id}`}>
          <div className="bg-white border border-gray-100 rounded-xl p-4 hover:border-violet-200 hover:shadow-sm transition cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-gray-700 line-clamp-2 flex-1">{entry.content}</p>
              <span className="text-xl flex-shrink-0">{moodEmoji(entry.moodScore)}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">
                {new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400">Mood {entry.moodScore}/10</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
