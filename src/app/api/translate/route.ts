import { NextRequest, NextResponse } from "next/server";
import { translateSchema } from "@/lib/validations";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/ratelimit";

async function translateWithLibreTranslate(
  text: string,
  source: string,
  target: string
): Promise<string> {
  const apiUrl = process.env.LIBRETRANSLATE_API_URL || "http://localhost:5000";

  try {
    const response = await fetch(`${apiUrl}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: source,
        target: target,
        format: "text",
        api_key: process.env.LIBRETRANSLATE_API_KEY || "free",
      }),
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error("LibreTranslate failed:", error);
    throw error;
  }
}

async function getTranslation(
  text: string,
  sourceLang: string,
  targetLang: string,
  userId: string
): Promise<{ translatedText: string; provider: string }> {
  try {
    const translatedText = await translateWithLibreTranslate(text, sourceLang, targetLang);

    // Log translation statistics
    await db.translationStat.create({
      data: {
        userId,
        sourceLang,
        targetLang,
        wordCount: text.split(/\s+/).length,
        success: true,
        provider: "libretranslate",
        translationTime: 0, // Would measure actual time
      },
    });

    return { translatedText, provider: "libretranslate" };
  } catch (error) {
    console.error("Translation failed:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || "anonymous";
    const allowed = await checkRateLimit(identifier);

    if (!allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await request.json();
    const validInput = translateSchema.parse(body);

    // Get user (would check auth)
    const userId = "user_id_placeholder"; // TODO: Get from auth

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
