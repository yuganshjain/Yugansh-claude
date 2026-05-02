import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function WeeklyReportPage() {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const [entries, report] = await Promise.all([
    prisma.journalEntry.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.weeklyReport.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const avgMood = entries.length > 0
    ? (entries.reduce((s, e) => s + e.moodScore, 0) / entries.length).toFixed(1)
    : null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Weekly Report</h1>
      <p className="text-gray-500 text-sm mb-8">
        {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })} —{" "}
        {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-sm">Your weekly report appears after 3+ entries this week.</p>
          <Link href="/journal/new" className="mt-4 inline-block text-violet-600 text-sm font-medium hover:underline">
            Start journaling →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-violet-600">{entries.length}</div>
              <div className="text-xs text-gray-500 mt-1">Entries this week</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-violet-600">{avgMood ?? "—"}</div>
              <div className="text-xs text-gray-500 mt-1">Avg mood /10</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-violet-600">
                {entries.length >= 5 ? "🌟" : entries.length >= 3 ? "✨" : "💪"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {entries.length >= 5 ? "Excellent week" : entries.length >= 3 ? "Good progress" : "Keep going"}
              </div>
            </div>
          </div>

          {report ? (
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white text-sm">🌙</div>
                <div className="text-sm font-semibold text-violet-800">Weekly Insight</div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{report.summary}</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white text-sm">🌙</div>
                <div className="text-sm font-semibold text-violet-800">Weekly Insight</div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                You wrote {entries.length} {entries.length === 1 ? "entry" : "entries"} this week with an average mood of {avgMood}/10.
                {Number(avgMood) >= 7 ? " Your mood has been strong — keep nurturing what's working." :
                  Number(avgMood) >= 5 ? " Your week had its ups and downs, which is completely normal. You showed up, and that matters." :
                  " This was a tough week. The fact that you kept journaling through it shows real strength."}
                {" "}Full AI-powered weekly summaries will be available when connected to Azure OpenAI.
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">This week&apos;s entries</h3>
            <div className="space-y-2">
              {entries.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600 truncate flex-1 mr-4">{e.content.slice(0, 60)}...</span>
                  <span className="text-gray-400 flex-shrink-0">Mood {e.moodScore}/10</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
