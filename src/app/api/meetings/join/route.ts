/**
 * POST /api/meetings/join — Send a bot to join a meeting.
 * PATCH /api/meetings/join — Toggle auto-join for a meeting.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createBot, isRecallConfigured } from "@/lib/recall";

/**
 * POST — Send a bot to join a specific meeting now.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    if (!isRecallConfigured()) {
      return NextResponse.json(
        { error: "Meeting bot service is not configured." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { meetingId } = body;

    if (!meetingId) {
      return NextResponse.json(
        { error: "meetingId is required" },
        { status: 400 }
      );
    }

    // Verify meeting belongs to user
    const meeting = await db.meetingSchedule.findUnique({
      where: { id: meetingId },
    });

    if (!meeting || meeting.userId !== userId) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    if (!meeting.meetingUrl) {
      return NextResponse.json(
        { error: "No meeting URL found for this event" },
        { status: 400 }
      );
    }

    // Don't re-send bot if already active
    if (["joining", "recording", "processing"].includes(meeting.botStatus)) {
      return NextResponse.json(
        { error: "Bot is already active for this meeting" },
        { status: 409 }
      );
    }

    // Create and send the bot
    const bot = await createBot({
      meetingUrl: meeting.meetingUrl,
      botName: "Last Minutes Notetaker",
      transcriptionEnabled: false, // We'll use our own AssemblyAI
      recordingMode: "audio_only",
    });

    // Update meeting with bot info
    await db.meetingSchedule.update({
      where: { id: meetingId },
      data: {
        botId: bot.id,
        botStatus: "joining",
        botError: null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        botId: bot.id,
        status: "joining",
      },
    });
  } catch (error) {
    console.error("Meeting join error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to join meeting",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH — Toggle auto-join for a meeting.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { meetingId, autoJoinEnabled } = body;

    if (!meetingId || typeof autoJoinEnabled !== "boolean") {
      return NextResponse.json(
        { error: "meetingId and autoJoinEnabled are required" },
        { status: 400 }
      );
    }

    // Verify meeting belongs to user
    const meeting = await db.meetingSchedule.findUnique({
      where: { id: meetingId },
    });

    if (!meeting || meeting.userId !== userId) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    // Update auto-join setting
    const updated = await db.meetingSchedule.update({
      where: { id: meetingId },
      data: { autoJoinEnabled },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Toggle auto-join error:", error);
    return NextResponse.json(
      { error: "Failed to update meeting settings" },
      { status: 500 }
    );
  }
}
