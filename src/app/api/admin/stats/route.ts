import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // TODO: Check if user is admin

    const totalUsers = await db.user.count();
    const activeUsers = await db.user.count({
      where: {
        sessions: {
          some: {
            expires: {
              gt: new Date(),
            },
          },
        },
      },
    });

    const totalTranscripts = await db.transcript.count();

    const totalMinutes = await db.transcript.aggregate({
      _sum: {
        duration: true,
      },
    });

    const topLanguages = await db.transcript.groupBy({
      by: ["sourceLanguage"],
      _count: true,
      orderBy: {
        _count: "desc",
      },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalTranscripts,
        totalMinutes: totalMinutes._sum.duration || 0,
        topLanguages: topLanguages.map((lang: any) => ({
          code: lang.sourceLanguage,
          count: lang._count,
        })),
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
