export default function AIReplyCard({ reply }: { reply: string }) {
  return (
    <div className="rounded-2xl p-6 border border-violet-200"
      style={{ background: "linear-gradient(135deg, var(--accent-light), var(--bg-card))" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
          style={{ backgroundColor: "var(--accent)" }}>
          🌙
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: "var(--accent-text)" }}>Lumio</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Your wellness companion</div>
        </div>
      </div>
      <p className="leading-relaxed text-sm whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{reply}</p>
    </div>
  );
}
