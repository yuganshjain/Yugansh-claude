"use client";

const moodLabels: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: "😞", label: "Very bad", color: "text-red-500" },
  2: { emoji: "😔", label: "Bad", color: "text-red-400" },
  3: { emoji: "😕", label: "Low", color: "text-orange-400" },
  4: { emoji: "😐", label: "Meh", color: "text-orange-300" },
  5: { emoji: "🙂", label: "Okay", color: "text-yellow-500" },
  6: { emoji: "😊", label: "Good", color: "text-yellow-400" },
  7: { emoji: "😄", label: "Pretty good", color: "text-green-400" },
  8: { emoji: "😁", label: "Great", color: "text-green-500" },
  9: { emoji: "🤩", label: "Amazing", color: "text-violet-500" },
  10: { emoji: "🌟", label: "Perfect", color: "text-violet-600" },
};

export default function MoodSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const mood = moodLabels[value];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">How are you feeling?</label>
        <div className={`flex items-center gap-1.5 font-medium text-sm ${mood.color}`}>
          <span className="text-2xl">{mood.emoji}</span>
          <span>{mood.label}</span>
        </div>
      </div>
      <input
        type="range" min={1} max={10} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-violet-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>1 — Very bad</span>
        <span>10 — Perfect</span>
      </div>
    </div>
  );
}
