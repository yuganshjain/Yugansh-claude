"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MoodSlider from "@/components/ui/MoodSlider";
import AIReplyCard from "@/components/journal/AIReplyCard";
import WritingPrompts from "@/components/journal/WritingPrompts";

export default function NewEntryPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [moodScore, setMoodScore] = useState(5);
  const [loading, setLoading] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, moodScore }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to save entry");
      setLoading(false);
      return;
    }

    setAiReply(data.aiReply);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Today&apos;s entry</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {!aiReply ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <MoodSlider value={moodScore} onChange={setMoodScore} />
          </div>

          <WritingPrompts
            moodScore={moodScore}
            onSelect={(prompt) => setContent((prev) => prev ? prev + "\n" + prompt : prompt)}
          />

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What&apos;s on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Write freely... This is your safe space. No judgment, just reflection."
              className="w-full text-gray-700 placeholder-gray-300 text-sm leading-relaxed resize-none focus:outline-none"
              required
            />
          </div>

          <button type="submit" disabled={loading || !content.trim()}
            className="w-full bg-violet-600 text-white py-3 rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Getting your insight...
              </>
            ) : "Save & get insight ✨"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-500">Your entry</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Mood {moodScore}/10</span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
          <AIReplyCard reply={aiReply} />
          <div className="flex gap-3">
            <button onClick={() => router.push("/dashboard")}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition">
              Back to dashboard
            </button>
            <button onClick={() => { setContent(""); setMoodScore(5); setAiReply(null); }}
              className="flex-1 bg-violet-600 text-white py-2.5 rounded-xl font-medium hover:bg-violet-700 transition">
              Write another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
