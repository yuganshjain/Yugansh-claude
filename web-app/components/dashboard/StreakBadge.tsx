export default function StreakBadge({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-xl">
      <span className="text-xl">🔥</span>
      <div>
        <div className="text-lg font-bold leading-none">{streak}</div>
        <div className="text-xs">day streak</div>
      </div>
    </div>
  );
}
