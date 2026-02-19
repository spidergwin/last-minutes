import { NextRequest, NextResponse } from "next/server";
import { createTranscriptSchema } from "@/lib/validations";
import { db } from "@/lib/db";
import { getWordCount } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user from auth
    const userId = "user_id_placeholder";

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

    // TODO: Get user from auth
    const userId = "user_id_placeholder";

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
