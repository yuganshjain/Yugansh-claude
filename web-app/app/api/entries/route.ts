import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMockAIReply } from "@/lib/mockAI";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { content, moodScore } = await req.json();
  if (!content || !moodScore) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Free plan limit check
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.plan === "FREE") {
    const count = await prisma.journalEntry.count({ where: { userId } });
    if (count >= 7) {
      return NextResponse.json({ error: "Free limit reached. Upgrade to Pro." }, { status: 403 });
    }
  }

  const aiReply = getMockAIReply(moodScore);

  const entry = await prisma.journalEntry.create({
    data: { userId, content, moodScore, aiReply },
  });

  return NextResponse.json(entry, { status: 201 });
}
