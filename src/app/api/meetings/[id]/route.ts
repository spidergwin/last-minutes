/**
 * GET /api/meetings/[id] — Get meeting details + bot status.
 * DELETE /api/meetings/[id] — Cancel scheduled bot / stop recording.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteBot, leaveMeeting, getBotStatus, mapBotStatusToInternal } from "@/lib/recall";

/**
 * GET — Get full meeting details including transcript link.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await params;

    const meeting = await db.meetingSchedule.findUnique({
      where: { id },
      include: {
        calendarConnection: {
          select: {
            provider: true,
            calendarEmail: true,
          },
        },
        transcript: {
          select: {
            id: true,
            title: true,
            wordCount: true,
            duration: true,
            createdAt: true,
          },
        },
      },
    });

    if (!meeting || meeting.userId !== userId) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    // If bot is active, refresh status from Recall.ai
    if (
      meeting.botId &&
      ["joining", "recording", "processing"].includes(meeting.botStatus)
    ) {
      try {
        const botStatus = await getBotStatus(meeting.botId);
        const internalStatus = mapBotStatusToInternal(botStatus.status.code);

        if (internalStatus !== meeting.botStatus) {
          await db.meetingSchedule.update({
            where: { id },
            data: { botStatus: internalStatus },
          });
          meeting.botStatus = internalStatus;
        }
      } catch {
        // Recall API might be unavailable — return cached status
      }
    }

    return NextResponse.json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error("Get meeting error:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting details" },
      { status: 500 }
    );
  }
}

/**
 * DELETE — Cancel a scheduled bot or stop a recording in progress.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await params;

    const meeting = await db.meetingSchedule.findUnique({
      where: { id },
    });

    if (!meeting || meeting.userId !== userId) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    if (!meeting.botId) {
      return NextResponse.json(
        { error: "No bot is assigned to this meeting" },
        { status: 400 }
      );
    }

    // Handle based on bot status
    try {
      if (meeting.botStatus === "recording") {
        // Bot is in the meeting — tell it to leave
        await leaveMeeting(meeting.botId);
      } else if (["scheduled", "joining"].includes(meeting.botStatus)) {
        // Bot hasn't joined yet — delete it
        await deleteBot(meeting.botId);
      }
    } catch (err) {
      console.warn(
        `Failed to stop/delete bot ${meeting.botId}:`,
        err instanceof Error ? err.message : err
      );
      // Continue anyway — update our DB status
    }

    // Reset bot state in our DB
    await db.meetingSchedule.update({
      where: { id },
      data: {
        botId: null,
        botStatus: "idle",
        botError: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bot cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel meeting bot error:", error);
    return NextResponse.json(
      { error: "Failed to cancel meeting bot" },
      { status: 500 }
    );
  }
}
