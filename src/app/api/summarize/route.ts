import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";
import { generateSummaryRequestSchema } from "@/features/summarization/schemas";
import { generateSummary } from "@/features/summarization/service";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatAsConversation, normalizeSpeakerLabel, isMeetingTranscript, TranscriptSegment } from "@/lib/format-transcript";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const identifier = request.headers.get("x-forwarded-for") || userId;
    const allowed = await checkRateLimit(identifier);

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = generateSummaryRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { transcriptId, type, customPrompt } = result.data;

    // Fetch the transcript from DB
    const transcript = await db.transcript.findUnique({
      where: { id: transcriptId },
    });

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript not found" },
        { status: 404 }
      );
    }

    // Verify user owns the transcript
    if (transcript.userId !== userId) {
      return NextResponse.json(
        { error: "Transcript not found" },
        { status: 404 }
      );
    }
    
    // Build the text to summarize — use speaker-labeled format when available
    let textForSummary = transcript.originalText;
    const speakers = transcript.speakers as string[] | null;
    const segments = transcript.segments as TranscriptSegment[] | null;

    if (isMeetingTranscript(speakers) && segments && segments.length > 0) {
      // Re-format with speaker labels for the AI to understand who said what
      textForSummary = formatAsConversation(segments);
    }

    // Generate summary
    const summaryText = await generateSummary(textForSummary, type, customPrompt);

    // Try to parse as JSON if we expect JSON
    let parsedContent;
    try {
      const cleanJson = summaryText.replace(/```json\n?|\n?```/gi, "").trim();
      parsedContent = JSON.parse(cleanJson);
    } catch {
      // If it's not JSON (e.g. CUSTOM prompt), just save as string
      parsedContent = { raw: summaryText };
    }

    // Save summary to DB
    const summary = await db.summary.create({
      data: {
        transcriptId,
        type,
        content: type === "CUSTOM" ? summaryText : JSON.stringify(parsedContent),
        metadata: parsedContent,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: summary.id,
        transcriptId,
        type,
        result: parsedContent,
        rawResult: summaryText
      },
    });

  } catch (error: unknown) {
    console.error("Summarization error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate summary",
      },
      { status: 500 }
    );
  }
}
