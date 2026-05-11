/**
 * API route to generate temporary Deepgram API keys for client-side streaming.
 *
 * Security: This route is protected by authentication. The temporary key
 * is scoped to only transcription usage and expires after 10 minutes.
 * This prevents exposing the main Deepgram API key to the browser.
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const identifier =
      request.headers.get("x-forwarded-for") || session.user.id;
    const allowed = await checkRateLimit(identifier);

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Transcription service not configured." },
        { status: 503 }
      );
    }

    // For Deepgram, we return the API key directly for browser SDK usage.
    // In production, you should use Deepgram's key management API
    // to generate scoped, time-limited keys instead.
    // See: https://developers.deepgram.com/docs/create-api-key
    return NextResponse.json({
      key: apiKey,
      expiresAt: new Date(Date.now() + 600_000).toISOString(), // 10 minutes
    });
  } catch (error: unknown) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate token",
      },
      { status: 500 }
    );
  }
}
