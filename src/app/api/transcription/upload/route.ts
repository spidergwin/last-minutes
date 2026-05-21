/**
 * API route for batch file/URL transcription using AssemblyAI.
 * Handles audio/video file uploads and URL submissions, returns a job ID for polling.
 *
 * Flow:
 * 1. Client uploads file or submits URL
 * 2. Server validates and submits to AssemblyAI
 * 3. Returns job ID immediately
 * 4. Client polls GET /api/transcription/upload?jobId=xxx for status
 */

import { NextRequest, NextResponse } from "next/server";
import { submitTranscription, waitForTranscription, getTranscriptionResult } from "@/lib/assemblyai";
import { isNigerianLanguage } from "@/features/translation/utils";
import { checkRateLimit } from "@/lib/ratelimit";

/**
 * GET handler — poll for transcription status
 */
export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json(
      { error: "Missing jobId parameter." },
      { status: 400 }
    );
  }

  try {
    const result = await getTranscriptionResult(jobId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("Poll transcription error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to poll transcription status",
      },
      { status: 500 }
    );
  }
}

const MAX_FILE_SIZE = 2.5 * 1024 * 1024 * 1024; // 2.5GB
const ALLOWED_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/ogg",
  "audio/webm",
  "audio/flac",
  "audio/aac",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
]);

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.headers.get("x-forwarded-for") || "anonymous";
    const allowed = await checkRateLimit(identifier);

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    // Handle JSON body (URL-based transcription)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const audioUrl = body.audio_url as string | undefined;
      const languageCode = body.language as string | undefined;
      const waitForResult = body.wait === true;

      if (!audioUrl) {
        return NextResponse.json(
          { error: "No audio_url provided." },
          { status: 400 }
        );
      }

      // Basic URL validation
      try {
        new URL(audioUrl);
      } catch {
        return NextResponse.json(
          { error: "Invalid URL provided." },
          { status: 400 }
        );
      }

      const isNigerian = languageCode ? isNigerianLanguage(languageCode) : false;

      if (isNigerian) {
        return NextResponse.json(
          { error: "Nigerian language support is coming soon! We are actively working on self-hosting dedicated models. Please stay tuned." },
          { status: 400 }
        );
      }

      // Route to AssemblyAI for global languages
      const job = await submitTranscription({
        audioUrl,
        languageCode: languageCode || undefined,
        speakerLabels: true,
        languageDetection: !languageCode,
      });

      if (waitForResult) {
        const result = await waitForTranscription(job.id, 120_000);
        return NextResponse.json({ success: true, data: result });
      }

      return NextResponse.json({
        success: true,
        jobId: job.id,
        status: job.status,
        message: "Transcription submitted from URL. Poll for results using the jobId.",
      });
    }

    // Handle FormData body (file upload)
    const formData = await request.formData();
    const audioFile = formData.get("file") as File | null;
    const languageCode = formData.get("language") as string | null;
    const waitForResult = formData.get("wait") === "true";

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided." },
        { status: 400 }
      );
    }

    // Validate file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.has(audioFile.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${audioFile.type}. Supported: audio and video files.`,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    const isNigerian = languageCode ? isNigerianLanguage(languageCode) : false;

    if (isNigerian) {
      return NextResponse.json(
        { error: "Nigerian language support is coming soon! We are actively working on self-hosting dedicated models. Please stay tuned." },
        { status: 400 }
      );
    }

    // Route to AssemblyAI for global languages
    const job = await submitTranscription({
      audioData: audioBuffer,
      languageCode: languageCode || undefined,
      speakerLabels: true,
      languageDetection: !languageCode,
    });

    // If client wants to wait for result (for shorter files)
    if (waitForResult) {
      const result = await waitForTranscription(job.id, 120_000);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // Return job ID for polling
    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      message: "Transcription submitted. Poll for results using the jobId.",
    });
  } catch (error: unknown) {
    console.error("Upload transcription error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process audio file",
      },
      { status: 500 }
    );
  }
}
