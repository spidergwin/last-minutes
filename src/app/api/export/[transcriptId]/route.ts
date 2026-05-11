import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateExport, ExportFormat } from "@/features/export/service";
import { checkRateLimit } from "@/lib/ratelimit";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transcriptId: string }> }
) {
  try {
    const { transcriptId } = await params;

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = session.user.id;

    const identifier = request.headers.get("x-forwarded-for") || userId;
    const allowed = await checkRateLimit(identifier);

    if (!allowed) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "txt") as ExportFormat;

    // Validate format
    const validFormats = ["txt", "srt", "vtt", "json", "docx", "pdf"];
    if (!validFormats.includes(format)) {
      return new NextResponse(`Invalid format. Must be one of: ${validFormats.join(", ")}`, { status: 400 });
    }

    // Fetch transcript with summaries
    const transcript = await db.transcript.findUnique({
      where: { id: transcriptId },
      include: {
        summaries: true,
      }
    });

    if (!transcript) {
      return new NextResponse("Transcript not found", { status: 404 });
    }

    // Verify user owns the transcript
    if (transcript.userId !== userId) {
      return new NextResponse("Transcript not found", { status: 404 });
    }

    // Generate export data
    const summaries = transcript.summaries || [];
    const { data, mimeType, extension } = await generateExport(format, transcript as any, summaries);

    // Prepare filename
    const safeTitle = transcript.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeTitle}_${transcript.id.substring(0, 8)}.${extension}`;

    // Return as file download
    const headers = new Headers();
    headers.set("Content-Type", mimeType);
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);

    return new NextResponse(data as any, { headers });

  } catch (error) {
    console.error("Export generation error:", error);
    return new NextResponse("Failed to generate export", { status: 500 });
  }
}
