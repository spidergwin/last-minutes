/**
 * GET /api/calendar/events — Fetch upcoming meetings from connected calendars.
 * POST /api/calendar/events — Sync calendar events and return updated list.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { syncCalendarEvents, fetchUpcomingEvents } from "@/lib/google-calendar";

/**
 * GET — Fetch meetings from DB (already synced).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Get calendar connections
    const connections = await db.calendarConnection.findMany({
      where: { userId, enabled: true },
    });

    // Get upcoming meetings
    const meetings = await db.meetingSchedule.findMany({
      where: {
        userId,
        startTime: { gte: new Date() },
      },
      orderBy: { startTime: "asc" },
      include: {
        transcript: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        connections: connections.map((c) => ({
          id: c.id,
          provider: c.provider,
          email: c.calendarEmail,
          enabled: c.enabled,
          connectedAt: c.createdAt,
        })),
        meetings,
      },
    });
  } catch (error) {
    console.error("Fetch calendar events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}

/**
 * POST — Trigger calendar sync (fetch fresh events from Google Calendar).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Get all enabled calendar connections
    const connections = await db.calendarConnection.findMany({
      where: { userId, enabled: true },
    });

    if (connections.length === 0) {
      return NextResponse.json(
        { error: "No calendar connected. Please connect your Google Calendar." },
        { status: 400 }
      );
    }

    // Sync each connection
    const results = [];
    for (const connection of connections) {
      try {
        const syncResult = await syncCalendarEvents(userId, connection.id);
        results.push({
          provider: connection.provider,
          email: connection.calendarEmail,
          ...syncResult,
        });
      } catch (err) {
        results.push({
          provider: connection.provider,
          email: connection.calendarEmail,
          error: err instanceof Error ? err.message : "Sync failed",
        });
      }
    }

    // Fetch updated meetings
    const meetings = await db.meetingSchedule.findMany({
      where: {
        userId,
        startTime: { gte: new Date() },
      },
      orderBy: { startTime: "asc" },
      include: {
        transcript: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        syncResults: results,
        meetings,
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
