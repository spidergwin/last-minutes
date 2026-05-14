/**
 * DELETE /api/calendar/disconnect
 * Disconnects a calendar integration and removes associated data.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { provider } = body;

    if (!provider) {
      return NextResponse.json(
        { error: "provider is required" },
        { status: 400 }
      );
    }

    // Find the connection
    const connection = await db.calendarConnection.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Calendar connection not found" },
        { status: 404 }
      );
    }

    // Delete associated meetings that are still idle (not yet processed)
    await db.meetingSchedule.deleteMany({
      where: {
        calendarConnectionId: connection.id,
        botStatus: "idle",
      },
    });

    // Delete the connection
    await db.calendarConnection.delete({
      where: { id: connection.id },
    });

    return NextResponse.json({
      success: true,
      message: "Calendar disconnected successfully",
    });
  } catch (error) {
    console.error("Calendar disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect calendar" },
      { status: 500 }
    );
  }
}
