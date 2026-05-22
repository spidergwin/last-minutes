import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google-calendar";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const error = request.nextUrl.searchParams.get("error");

    if (error) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      return NextResponse.redirect(
        `${appUrl}/settings/integrations?error=google_denied`
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: "Missing code or state parameter" },
        { status: 400 }
      );
    }

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

    const redirectUri = `${request.nextUrl.origin}/api/google/callback`;
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    // Save tokens to CalendarConnection
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

    // Save tokens to GoogleDriveConnection as well!
    await db.googleDriveConnection.upsert({
      where: {
        userId: userId,
      },
      create: {
        userId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry: tokens.expiryDate,
        email: tokens.email,
        enabled: true,
      },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? undefined,
        tokenExpiry: tokens.expiryDate,
        email: tokens.email,
        enabled: true,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    // We redirect to integrations page with success
    return NextResponse.redirect(
      `${appUrl}/settings/integrations?connected=google`
    );
  } catch (error) {
    console.error("Google callback error:", error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${appUrl}/settings/integrations?error=google_failed`
    );
  }
}
