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
      <button onClick={() => setVisible(true)} type="button"
        className="text-xs flex items-center gap-1" style={{ color: "var(--accent)" }}>
        ✨ Show writing prompts
      </button>
    );
  }

  return (
    <div className="rounded-xl p-4 space-y-2 border"
      style={{ backgroundColor: "var(--accent-light)", borderColor: "var(--border-color)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: "var(--accent-text)" }}>✨ Need a starting point?</span>
        <div className="flex items-center gap-3">
          <button onClick={refresh} type="button" className="text-xs transition" style={{ color: "var(--accent)" }}>
            ↻ New prompts
          </button>
          <button onClick={() => setVisible(false)} type="button" className="text-xs transition" style={{ color: "var(--text-muted)" }}>
            Hide
          </button>
        </div>
      </div>
      {prompts.map((prompt, i) => (
        <button key={i} type="button"
          onClick={() => { onSelect(prompt + "\n\n"); setVisible(false); }}
          className="w-full text-left text-sm rounded-lg px-3 py-2.5 border transition leading-relaxed"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
          {prompt}
        </button>
      ))}
    </div>
  );
}
