import { streamText } from 'ai';
import { getModel } from '@/lib/ai';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Add the edge runtime config if we're not using prisma heavily or if we are, node is fine.
// Last Minutes uses Prisma, so let's stick to default Node runtime.

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, transcriptId } = await req.json();

    let systemPrompt = 'You are an advanced AI assistant designed to answer questions based on meeting transcripts. Be helpful, concise, and accurate based on the provided context. If the user asks something outside the transcript, try to answer but politely mention it is outside the scope of the meeting context.';
    
    if (transcriptId) {
      const transcript = await db.transcript.findUnique({
        where: { id: transcriptId, userId: session.user.id },
      });
      
      if (transcript) {
        systemPrompt += `\n\nHere is the transcript for context:\n\nTitle: ${transcript.title}\n\n${transcript.originalText}`;
      }
    }

    const model = getModel();

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
