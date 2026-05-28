import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const transcriptId = searchParams.get("transcriptId");
    const threadId = searchParams.get("threadId");

    let thread;
    if (threadId) {
      thread = await db.thread.findFirst({
        where: { id: threadId, userId: session.user.id },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });
    } else if (transcriptId && transcriptId !== 'new') {
      thread = await db.thread.findFirst({
        where: { userId: session.user.id, transcriptId },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });
    }

    if (!thread) {
      return NextResponse.json({ messages: [] });
    }

    const uiMessages = thread.messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      parts: [
        {
          type: "text",
          text: m.content,
        }
      ],
      createdAt: m.createdAt,
    }));

    return NextResponse.json({ messages: uiMessages });
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
  }
}
