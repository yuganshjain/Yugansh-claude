"use client";
import { useState, useEffect } from "react";
import { getPrompts } from "@/lib/prompts";

export default function WritingPrompts({
  moodScore,
  onSelect,
}: {
  moodScore: number;
  onSelect: (prompt: string) => void;
}) {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setPrompts(getPrompts(moodScore));
  }, [moodScore]);

  function refresh() {
    setPrompts(getPrompts(moodScore));
  }

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="text-xs text-violet-500 hover:text-violet-700 flex items-center gap-1"
        type="button"
      >
        ✨ Show writing prompts
      </button>
    );
  }

  return (
    <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-violet-700">✨ Need a starting point?</span>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            type="button"
            className="text-xs text-violet-500 hover:text-violet-700 transition"
          >
            ↻ New prompts
          </button>
          <button
            onClick={() => setVisible(false)}
            type="button"
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            Hide
          </button>
        </div>
      </div>
      {prompts.map((prompt, i) => (
        <button
          key={i}
          type="button"
          onClick={() => {
            onSelect(prompt + "\n\n");
            setVisible(false);
          }}
          className="w-full text-left text-sm text-gray-700 bg-white border border-violet-100 rounded-lg px-3 py-2.5 hover:border-violet-300 hover:bg-violet-50 transition leading-relaxed"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
