import { streamText, convertToModelMessages, stepCountIs, tool } from 'ai';
import { getModel } from '@/lib/ai';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';

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

    let activeTranscriptId = transcriptId;

    // Resolve transcriptId from the thread if not provided in request body
    if (!activeTranscriptId && clientThreadId) {
      try {
        const thread = await db.thread.findUnique({
          where: { id: clientThreadId, userId: session.user.id },
          select: { transcriptId: true },
        });
        if (thread?.transcriptId) {
          activeTranscriptId = thread.transcriptId;
        }
      } catch (e) {
        console.error("Error resolving transcriptId from thread:", e);
      }
    }

    let systemPrompt = `You are the Last Minutes AI Assistant, a specialized AI designed to analyze, summarize, and answer questions about meeting transcripts.

Your capabilities:
1. You have direct access to the user's meeting transcripts when loaded in the active chat session.
2. You can provide detailed insights, action items, summaries, speaker details, and key decisions from the transcripts.

Crucial instructions:
- If a transcript is loaded in the active chat session, you DO have access to it. NEVER claim you do not have access to the transcript or files. Answer questions about it directly using the provided text.
- If the user asks general questions or you are in a general chat (no transcript loaded), answer their questions helpfully. If they ask about a specific transcript in a general chat, politely remind them that they can select a transcript from the sidebar or from their transcripts list to load it into the chat.
- Always remain professional, friendly, and helpful.`;
    
    if (activeTranscriptId) {
      const transcript = await db.transcript.findUnique({
        where: { id: activeTranscriptId, userId: session.user.id },
      });
      
      if (transcript) {
        systemPrompt += `\n\n[Active Transcript Context]\nYou are currently chatting about the following transcript:\nTitle: ${transcript.title}\n\nContent:\n${transcript.originalText}`;
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
      stopWhen: stepCountIs(5), // Allow multi-step tool calls
      tools: {
        listRecentTranscripts: tool({
          description: "Retrieve a list of the user's most recent transcripts. Useful when the user asks about recent meetings or asks to summarize past meetings.",
          inputSchema: z.object({
            limit: z.number().optional(),
          }),
          execute: async ({ limit }: { limit?: number }) => {
            const finalLimit = limit ?? 10;
            try {
              const transcripts = await db.transcript.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                take: Math.min(finalLimit, 20),
                select: {
                  id: true,
                  title: true,
                  createdAt: true,
                  duration: true,
                  sourceLanguage: true,
                },
              });
              return { success: true, transcripts };
            } catch (error) {
              console.error("Tool listRecentTranscripts error:", error);
              return { success: false, error: "Failed to load transcripts" };
            }
          },
        }),
        getTranscriptDetails: tool({
          description: "Retrieve the full details and transcript text of a specific meeting by its ID.",
          inputSchema: z.object({
            transcriptId: z.string(),
          }),
          execute: async ({ transcriptId }: { transcriptId: string }) => {
            try {
              const transcript = await db.transcript.findUnique({
                where: { id: transcriptId, userId: session.user.id },
                select: {
                  id: true,
                  title: true,
                  originalText: true,
                  createdAt: true,
                },
              });
              if (!transcript) {
                return { success: false, error: "Transcript not found" };
              }
              return { success: true, transcript };
            } catch (error) {
              console.error("Tool getTranscriptDetails error:", error);
              return { success: false, error: "Failed to load transcript details" };
            }
          },
        }),
        searchTranscripts: tool({
          description: "Search for transcripts containing specific keywords or topics.",
          inputSchema: z.object({
            query: z.string(),
          }),
          execute: async ({ query }: { query: string }) => {
            try {
              const transcripts = await db.transcript.findMany({
                where: {
                  userId: session.user.id,
                  OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { originalText: { contains: query, mode: 'insensitive' } },
                  ],
                },
                take: 5,
                select: {
                  id: true,
                  title: true,
                  createdAt: true,
                },
              });
              return { success: true, results: transcripts };
            } catch (error) {
              console.error("Tool searchTranscripts error:", error);
              return { success: false, error: "Failed to search transcripts" };
            }
          },
        }),
      },
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
