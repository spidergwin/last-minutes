import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SUPPORTED_LANGUAGES } from "@/features/translation/utils";

export async function GET(request: NextRequest) {
  try {
    // Admin auth check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const totalUsers = await db.user.count();
    const activeUsers = await db.user.count({
      where: {
        sessions: {
          some: {
            expiresAt: {
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

    // Usage trend — last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTranscripts = await db.transcript.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    });

    // Group by date
    const trendMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      trendMap.set(key, 0);
    }
    for (const t of recentTranscripts) {
      const key = new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (trendMap.has(key)) {
        trendMap.set(key, (trendMap.get(key) || 0) + 1);
      }
    }
    const usageTrend = Array.from(trendMap.entries()).map(([date, transcripts]) => ({
      date,
      transcripts,
    }));

    const topLanguages = await db.transcript.groupBy({
      by: ["sourceLanguage"],
      _count: {
        sourceLanguage: true,
      },
      orderBy: {
        _count: {
          sourceLanguage: "desc",
        },
      },
      take: 5,
    });

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalTranscripts,
      totalMinutes: totalMinutes._sum.duration || 0,
      usageTrend,
      topLanguages: topLanguages.map((lang: any) => {
        const langInfo = SUPPORTED_LANGUAGES[lang.sourceLanguage as keyof typeof SUPPORTED_LANGUAGES];
        return {
          code: lang.sourceLanguage,
          name: langInfo?.name || lang.sourceLanguage,
          count: lang._count.sourceLanguage,
        };
      }),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
