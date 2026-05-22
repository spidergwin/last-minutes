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

    const statePayload = JSON.stringify({
      userId: session.user.id,
      nonce: crypto.randomBytes(16).toString("hex"),
    });
    const state = Buffer.from(statePayload).toString("base64url");

    const redirectUri = `${request.nextUrl.origin}/api/google/callback`;
    const authUrl = getCalendarAuthUrl(state, redirectUri);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Google connect error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Google connection" },
      { status: 500 }
    );
  }
}
