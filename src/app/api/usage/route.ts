import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Get usage data
    const usage = await db.usage.findUnique({
      where: { userId },
    });

    // Get subscription data
    const subscription = await db.subscription.findUnique({
      where: { userId },
    });

    // Get transcript count for this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyTranscripts = await db.transcript.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
    });

    return NextResponse.json({
      usage: usage || {
        monthlyDictationMins: 0,
        monthlyUploadMins: 0,
        monthlyTranslations: 0,
        totalDictationMins: 0,
        totalUploadMins: 0,
        totalTranslations: 0,
      },
      subscription: {
        plan: subscription?.plan || "FREE",
        status: subscription?.status || "ACTIVE",
      },
      monthlyTranscripts,
    });
  } catch (error) {
    console.error("Usage API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}
