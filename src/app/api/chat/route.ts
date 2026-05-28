import { streamText, convertToModelMessages } from 'ai';
import { getModel } from '@/lib/ai';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Add the edge runtime config if we're not using prisma heavily or if we are, node is fine.
// Last Minutes uses Prisma, so let's stick to default Node runtime.

export const maxDuration = 60;

/** Extract text content from a UIMessage in any format */
function extractTextContent(message: any): string | undefined {
  // Try parts array first (AI SDK v6 UIMessage format)
  if (Array.isArray(message.parts)) {
    const text = message.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("");
    if (text) return text;
  }

  // Try content as array of objects (e.g. [{type: "text", text: "..."}])
  if (Array.isArray(message.content)) {
    const text = message.content
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("");
    if (text) return text;
  }

  // Try content as plain string
  if (typeof message.content === "string" && message.content) {
    return message.content;
  }

  // Last resort: stringify content if it exists
  if (message.content) {
    return JSON.stringify(message.content);
  }

  return undefined;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, transcriptId, threadId: clientThreadId } = await req.json();

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

    let coreMessages;
    try {
      coreMessages = await convertToModelMessages(messages);
    } catch (conversionError) {
      console.error("Message conversion error:", conversionError);
      return NextResponse.json(
        { error: "Failed to process messages" },
        { status: 400 }
      );
    }

    const lastUserMessage = messages[messages.length - 1];

    let threadId: string | undefined = undefined;

    // Save user message to database
    if (lastUserMessage?.role === "user") {
      try {
        let thread = null;
        if (transcriptId) {
          thread = await db.thread.findFirst({
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
        } else if (clientThreadId) {
          thread = await db.thread.findFirst({
            where: { id: clientThreadId, userId: session.user.id },
          });

          if (!thread) {
            const userText = extractTextContent(lastUserMessage) || "General Chat";
            const title = userText.length > 40 ? userText.substring(0, 37) + "..." : userText;
            
            thread = await db.thread.create({
              data: {
                id: clientThreadId,
                userId: session.user.id,
                transcriptId: null,
                title: title,
              },
            });
          }
        }

        if (thread) {
          threadId = thread.id;
          const messageContent = extractTextContent(lastUserMessage);

          if (messageContent) {
            await db.message.create({
              data: {
                threadId: thread.id,
                role: "user",
                content: messageContent,
              },
            });
          }
        }
      } catch (dbError) {
        // Don't fail the whole request if DB save fails — still stream the response
        console.error("Failed to save user message to DB:", dbError);
      }
    }

    const result = streamText({
      model,
      system: systemPrompt,
      messages: coreMessages,
      maxOutputTokens: 8192,
      maxRetries: 3,
      async onFinish({ text, finishReason }) {
        if (finishReason === 'length') {
          console.warn('AI Chat stream abruptly stopped due to maxOutputTokens limit!');
        }
        if (threadId && text) {
          try {
            await db.message.create({
              data: {
                threadId,
                role: "assistant",
                content: text,
              },
            });
          } catch (dbError) {
            console.error("Failed to save assistant message to DB:", dbError);
          }
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error instanceof Error ? error.message : error);
    console.error("Chat API error stack:", error instanceof Error ? error.stack : "no stack");
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
