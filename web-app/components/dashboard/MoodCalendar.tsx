"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DayData = { moodScore: number; id: string };
type YearData = Record<string, DayData>;

function getMoodColor(score: number): string {
  if (score <= 3) return "bg-red-300 hover:bg-red-400";
  if (score <= 5) return "bg-yellow-300 hover:bg-yellow-400";
  if (score <= 7) return "bg-green-300 hover:bg-green-400";
  return "bg-violet-400 hover:bg-violet-500";
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export default function MoodCalendar() {
  const router = useRouter();
  const [data, setData] = useState<YearData>({});
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    fetch("/api/entries/year")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  const months = Array.from({ length: 12 }, (_, i) => i);
  const today = new Date().toISOString().split("T")[0];

  const totalDays = Math.floor((Date.now() - new Date(year, 0, 1).getTime()) / 86400000) + 1;
  const filledDays = Object.keys(data).length;

  if (loading) {
    return <div className="h-32 flex items-center justify-center text-gray-400 text-sm">Loading calendar...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">{year} in pixels</h3>
        <span className="text-xs text-gray-400">{filledDays} / {totalDays} days filled</span>
      </div>

      <div className="space-y-1.5">
        {months.map((month) => {
          const daysInMonth = getDaysInMonth(year, month);
          const monthName = new Date(year, month, 1).toLocaleDateString("en-US", { month: "short" });
          return (
            <div key={month} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-7 flex-shrink-0">{monthName}</span>
              <div className="flex gap-0.5 flex-wrap">
                {Array.from({ length: daysInMonth }, (_, d) => {
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d + 1).padStart(2, "0")}`;
                  const entry = data[dateStr];
                  const isToday = dateStr === today;
                  const isFuture = dateStr > today;

                  if (isFuture) {
                    return <div key={d} className="w-3 h-3 rounded-sm bg-gray-50" />;
                  }

                  return (
                    <div
                      key={d}
                      title={entry ? `Mood ${entry.moodScore}/10` : dateStr}
                      onClick={() => entry && router.push(`/journal/${entry.id}`)}
                      className={`w-3 h-3 rounded-sm transition cursor-pointer
                        ${entry ? getMoodColor(entry.moodScore) : "bg-gray-200 hover:bg-gray-300"}
                        ${isToday ? "ring-1 ring-violet-600 ring-offset-1" : ""}
                      `}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-3">
        <span className="text-xs text-gray-400">Mood:</span>
        {[
          { color: "bg-red-300", label: "Low" },
          { color: "bg-yellow-300", label: "Okay" },
          { color: "bg-green-300", label: "Good" },
          { color: "bg-violet-400", label: "Great" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-sm ${item.color}`} />
            <span className="text-xs text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
