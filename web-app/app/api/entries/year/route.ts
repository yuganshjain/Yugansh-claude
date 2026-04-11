import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const entries = await prisma.journalEntry.findMany({
    where: { userId, createdAt: { gte: startOfYear } },
    select: { createdAt: true, moodScore: true, id: true },
    orderBy: { createdAt: "asc" },
  });

  // Map date string (YYYY-MM-DD) → { moodScore, id }
  const map: Record<string, { moodScore: number; id: string }> = {};
  for (const e of entries) {
    const key = new Date(e.createdAt).toISOString().split("T")[0];
    map[key] = { moodScore: e.moodScore, id: e.id };
  }

  return NextResponse.json(map);
}
