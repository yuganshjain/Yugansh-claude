import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MoodChart from "@/components/dashboard/MoodChart";
import EntryList from "@/components/dashboard/EntryList";
import StreakBadge from "@/components/dashboard/StreakBadge";

async function getStreak(userId: string): Promise<number> {
  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (entries.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < entries.length; i++) {
    const d = new Date(entries[i].createdAt);
    d.setHours(0, 0, 0, 0);
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (d.getTime() === expected.getTime()) streak++;
    else break;
  }
  return streak;
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const [entries, streak] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    getStreak(userId),
  ]);

  const last7 = entries.slice(0, 7).reverse().map((e) => ({
    date: new Date(e.createdAt).toLocaleDateString("en-US", { weekday: "short" }),
    mood: e.moodScore,
  }));

  const todayEntry = entries.find((e) => {
    const d = new Date(e.createdAt);
    return d.toDateString() === new Date().toDateString();
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good {greeting}, {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {todayEntry ? "You've journaled today. Great job!" : "You haven't journaled yet today."}
          </p>
        </div>
        <StreakBadge streak={streak} />
      </div>

      {!todayEntry && (
        <Link href="/journal/new">
          <div className="bg-violet-600 text-white rounded-2xl p-6 mb-8 cursor-pointer hover:bg-violet-700 transition">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">How are you feeling today?</h2>
                <p className="text-violet-200 text-sm">Tap to write your daily entry</p>
              </div>
              <span className="text-4xl">✍️</span>
            </div>
          </div>
        </Link>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Mood this week</h3>
          <MoodChart data={last7} />
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Stats</h3>
          <div className="space-y-3 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total entries</span>
              <span className="font-semibold text-gray-900">{entries.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Avg mood</span>
              <span className="font-semibold text-gray-900">
                {entries.length > 0 ? (entries.reduce((s, e) => s + e.moodScore, 0) / entries.length).toFixed(1) : "—"}/10
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Current streak</span>
              <span className="font-semibold text-gray-900">{streak} days 🔥</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Recent entries</h3>
          <Link href="/journal/new" className="text-xs text-violet-600 hover:underline font-medium">+ New entry</Link>
        </div>
        <EntryList entries={entries} />
      </div>
    </div>
  );
}
