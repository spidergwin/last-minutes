/**
 * GET /api/calendar/callback
 * Handles the OAuth callback from Google after user grants calendar access.
 * Exchanges the code for tokens and saves the calendar connection.
 */

import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google-calendar";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const error = request.nextUrl.searchParams.get("error");

    // Handle user denying access
    if (error) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      return NextResponse.redirect(
        `${appUrl}/meetings?error=calendar_denied`
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: "Missing code or state parameter" },
        { status: 400 }
      );
    }

    // Decode state to get userId
    let userId: string;
    try {
      const statePayload = JSON.parse(
        Buffer.from(state, "base64url").toString("utf-8")
      );
      userId = statePayload.userId;
      if (!userId) throw new Error("No userId in state");
    } catch {
      return NextResponse.json(
        { error: "Invalid state parameter" },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Upsert the calendar connection
    await db.calendarConnection.upsert({
      where: {
        userId_provider: {
          userId,
          provider: "google",
        },
      },
      create: {
        userId,
        provider: "google",
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry: tokens.expiryDate,
        calendarEmail: tokens.email,
        enabled: true,
      },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? undefined,
        tokenExpiry: tokens.expiryDate,
        calendarEmail: tokens.email,
        enabled: true,
      },
    });

    // Redirect back to meetings page with success
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${appUrl}/meetings?connected=google`
    );
  } catch (error) {
    console.error("Calendar callback error:", error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${appUrl}/meetings?error=calendar_failed`
    );
  }
}
