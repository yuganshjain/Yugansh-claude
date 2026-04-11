import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AIReplyCard from "@/components/journal/AIReplyCard";
import Link from "next/link";

const moodEmoji = (score: number) => score >= 8 ? "😊" : score >= 5 ? "😐" : "😔";

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const userId = (session!.user as any).id as string;

  const entry = await prisma.journalEntry.findFirst({ where: { id, userId } });
  if (!entry) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm transition" style={{ color: "var(--text-muted)" }}>← Dashboard</Link>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          {new Date(entry.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </h1>
        <span className="text-2xl">{moodEmoji(entry.moodScore)}</span>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Mood {entry.moodScore}/10</span>
      </div>
      <div className="rounded-2xl border p-6 mb-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{entry.content}</p>
      </div>
      {entry.aiReply && <AIReplyCard reply={entry.aiReply} />}
    </div>
  );
}
