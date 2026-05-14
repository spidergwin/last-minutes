/**
 * GET /api/calendar/connect
 * Initiates Google Calendar OAuth flow.
 * Redirects the user to Google's consent screen.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCalendarAuthUrl } from "@/lib/google-calendar";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a state token to prevent CSRF
    // Encode the userId in the state so we can link it on callback
    const statePayload = JSON.stringify({
      userId: session.user.id,
      nonce: crypto.randomBytes(16).toString("hex"),
    });
    const state = Buffer.from(statePayload).toString("base64url");

    const authUrl = getCalendarAuthUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Calendar connect error:", error);
    return NextResponse.json(
      { error: "Failed to initiate calendar connection" },
      { status: 500 }
    );
  }
}
