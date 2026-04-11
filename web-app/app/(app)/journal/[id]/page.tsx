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

  const entry = await prisma.journalEntry.findFirst({
    where: { id, userId },
  });
  if (!entry) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition text-sm">← Dashboard</Link>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-bold text-gray-900">
          {new Date(entry.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </h1>
        <span className="text-2xl">{moodEmoji(entry.moodScore)}</span>
        <span className="text-sm text-gray-400">Mood {entry.moodScore}/10</span>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
      </div>
      {entry.aiReply && <AIReplyCard reply={entry.aiReply} />}
    </div>
  );
}
