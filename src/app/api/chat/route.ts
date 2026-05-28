import { streamText, convertToModelMessages } from 'ai';
import { getModel } from '@/lib/ai';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Add the edge runtime config if we're not using prisma heavily or if we are, node is fine.
// Last Minutes uses Prisma, so let's stick to default Node runtime.

export const maxDuration = 60;

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

    const coreMessages = await convertToModelMessages(messages);
    const lastUserMessage = messages[messages.length - 1];

    let threadId: string | undefined = undefined;

    // Save user message to database
    if (transcriptId && lastUserMessage.role === "user") {
      let thread = await db.thread.findFirst({
        where: { userId: session.user.id, transcriptId },
      });

      if (!thread) {
        thread = await db.thread.create({
          data: {
            userId: session.user.id,
            transcriptId,
            title: `Chat about transcript`,
          },
        });
      }
      
      threadId = thread.id;

      await db.message.create({
        data: {
          threadId: thread.id,
          role: "user",
          content: typeof lastUserMessage.content === "string" ? lastUserMessage.content : JSON.stringify(lastUserMessage.content),
        },
      });
    }

    const result = streamText({
      model,
      system: systemPrompt,
      messages: coreMessages,
      maxTokens: 8192,
      maxRetries: 3,
      async onFinish({ text, finishReason }) {
        if (finishReason === 'length') {
          console.warn('AI Chat stream abruptly stopped due to maxTokens limit!');
        }
        if (threadId) {
          await db.message.create({
            data: {
              threadId,
              role: "assistant",
              content: text,
            },
          });
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
