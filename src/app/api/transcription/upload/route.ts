/**
 * API route for batch file transcription using AssemblyAI.
 * Handles audio/video file uploads and returns a job ID for polling.
 *
 * Flow:
 * 1. Client uploads audio/video file
 * 2. Server validates file type and size
 * 3. Submits to AssemblyAI for processing
 * 4. Returns job ID immediately
 * 5. Client polls /api/transcription/upload/[jobId] for status
 */

import { NextRequest, NextResponse } from "next/server";
import { submitTranscription, waitForTranscription } from "@/lib/assemblyai";
import { checkRateLimit } from "@/lib/ratelimit";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
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

    // Submit to AssemblyAI
    const job = await submitTranscription({
      audioData: audioBuffer,
      languageCode: languageCode || undefined,
      speakerLabels: true,
      languageDetection: !languageCode,
    });

    // If client wants to wait for result (for shorter files)
    if (waitForResult) {
      const result = await waitForTranscription(job.id, 120_000); // 2 min timeout for wait mode
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
