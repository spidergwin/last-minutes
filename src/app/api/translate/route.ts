import { NextRequest, NextResponse } from "next/server";
import { translateSchema } from "@/lib/validations";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/ratelimit";
import { auth } from "@/lib/auth";
import { translateText } from "@/lib/translation";
import { getProviderName } from "@/lib/ai";

async function getTranslation(
  text: string,
  sourceLang: string,
  targetLang: string,
  userId: string
): Promise<{ translatedText: string; provider: string }> {
  const provider = getProviderName();

  try {
    const translatedText = await translateText(text, sourceLang, targetLang);

    // Log translation statistics
    await db.translationStat.create({
      data: {
        userId,
        sourceLang,
        targetLang,
        wordCount: text.split(/\s+/).length,
        success: true,
        provider,
        translationTime: 0, // Would measure actual time
      },
    });

    return { translatedText, provider };
  } catch (error) {
    console.error("Translation failed:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.headers.get("x-forwarded-for") || "anonymous";
    const allowed = await checkRateLimit(identifier);

    if (!allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await request.json();
    const validInput = translateSchema.parse(body);

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { translatedText, provider } = await getTranslation(
      validInput.text,
      validInput.sourceLang,
      validInput.targetLang,
      userId
    );

    return NextResponse.json({
      success: true,
      data: {
        originalText: validInput.text,
        translatedText,
        sourceLang: validInput.sourceLang,
        targetLang: validInput.targetLang,
        provider,
      },
    });
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Translation failed",
      },
      { status: 500 }
    );
  }
}
