/**
 * POST /api/calendar/sync — Background calendar sync endpoint.
 * Can be called by cron jobs or on-demand to refresh calendar data.
 * Also handles auto-scheduling bots for upcoming meetings.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { syncCalendarEvents } from "@/lib/google-calendar";
import { createBot, isRecallConfigured } from "@/lib/recall";

/**
 * POST — Sync all enabled calendar connections and optionally schedule bots.
 * 
 * Body (optional):
 * - scheduleAutoJoin: boolean — also schedule bots for auto-join meetings (default: true)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    let scheduleAutoJoin = true;
    try {
      const body = await request.json();
      scheduleAutoJoin = body.scheduleAutoJoin ?? true;
    } catch {
      // No body — use defaults
    }

    // Get all enabled calendar connections
    const connections = await db.calendarConnection.findMany({
      where: { userId, enabled: true },
    });

    if (connections.length === 0) {
      return NextResponse.json(
        { error: "No calendar connected" },
        { status: 400 }
      );
    }

    // Sync each connection
    const syncResults = [];
    for (const connection of connections) {
      try {
        const result = await syncCalendarEvents(userId, connection.id);
        syncResults.push({
          provider: connection.provider,
          email: connection.calendarEmail,
          ...result,
        });
      } catch (err) {
        syncResults.push({
          provider: connection.provider,
          email: connection.calendarEmail,
          error: err instanceof Error ? err.message : "Sync failed",
        });
      }
    }

    // Schedule bots for auto-join meetings starting within 5 minutes
    let botsScheduled = 0;
    if (scheduleAutoJoin && isRecallConfigured()) {
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

      const autoJoinMeetings = await db.meetingSchedule.findMany({
        where: {
          userId,
          autoJoinEnabled: true,
          botStatus: "idle",
          meetingUrl: { not: null },
          startTime: {
            lte: fiveMinutesFromNow,
            gte: new Date(), // Not in the past
          },
        },
      });

      for (const meeting of autoJoinMeetings) {
        if (!meeting.meetingUrl) continue;

        try {
          const bot = await createBot({
            meetingUrl: meeting.meetingUrl,
            botName: "Last Minutes Notetaker",
            transcriptionEnabled: false,
            recordingMode: "audio_only",
            // Schedule to join at the meeting start time if in the future
            joinAt:
              meeting.startTime > new Date() ? meeting.startTime : undefined,
          });

          await db.meetingSchedule.update({
            where: { id: meeting.id },
            data: {
              botId: bot.id,
              botStatus: "scheduled",
              botError: null,
            },
          });

          botsScheduled++;
        } catch (err) {
          console.error(
            `Failed to schedule bot for meeting ${meeting.id}:`,
            err
          );
          await db.meetingSchedule.update({
            where: { id: meeting.id },
            data: {
              botError:
                err instanceof Error
                  ? err.message
                  : "Failed to schedule bot",
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        syncResults,
        botsScheduled,
      },
    });
  } catch (error) {
    console.error("Calendar sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync calendar" },
      { status: 500 }
    );
  }
}
