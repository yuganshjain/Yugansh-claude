import Link from "next/link";

type MemoryEntry = {
  id: string;
  content: string;
  moodScore: number;
  createdAt: Date;
  label: string;
};

const moodEmoji = (score: number) => score >= 8 ? "😊" : score >= 5 ? "😐" : "😔";

export default function MemoryLane({ memories }: { memories: MemoryEntry[] }) {
  if (memories.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🕰️</span>
        <h3 className="text-sm font-semibold text-gray-700">On this day</h3>
      </div>
      <div className="space-y-3">
        {memories.map((memory) => (
          <Link key={memory.id} href={`/journal/${memory.id}`}>
            <div className="border border-amber-100 bg-amber-50 rounded-xl p-4 hover:border-amber-200 transition cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {memory.label}
                </span>
                <span className="text-lg">{moodEmoji(memory.moodScore)}</span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                {memory.content}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(memory.createdAt).toLocaleDateString("en-US", {
                  weekday: "long", month: "long", day: "numeric", year: "numeric"
                })}
                {" · "}Mood {memory.moodScore}/10
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
