import { NextRequest, NextResponse } from "next/server";
import { createTranscriptSchema } from "@/lib/validations";
import { db } from "@/lib/db";
import { getWordCount } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const transcripts = await db.transcript.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: transcripts,
    });
  } catch (error) {
    console.error("Get transcripts error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transcripts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validInput = createTranscriptSchema.parse(body);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const wordCount = getWordCount(validInput.originalText);

    const transcript = await db.transcript.create({
      data: {
        userId,
        title: validInput.title,
        originalText: validInput.originalText,
        sourceLanguage: validInput.sourceLanguage,
        targetLanguage: validInput.targetLanguage,
        fileUrl: validInput.fileUrl,
        fileType: validInput.fileType,
        wordCount,
        duration: 0, // Would calculate from audio
      },
    });

    // Update usage
    await db.usage.upsert({
      where: { userId },
      update: {
        monthlyDictationMins: { increment: 1 },
        totalDictationMins: { increment: 1 },
      },
      create: {
        userId,
        monthlyDictationMins: 1,
        totalDictationMins: 1,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: transcript,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create transcript error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create transcript" },
      { status: 500 }
    );
  }
}
