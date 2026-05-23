import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tourCompleted = cookieStore.get("tourCompleted")?.value === "true";

    return NextResponse.json({
      success: true,
      data: {
        tourCompleted,
      },
    });
  } catch (error) {
    console.error("Failed to fetch user preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tourCompleted } = body;

    const cookieStore = await cookies();
    cookieStore.set("tourCompleted", String(Boolean(tourCompleted)), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return NextResponse.json({
      success: true,
      data: {
        tourCompleted: Boolean(tourCompleted),
      },
    });
  } catch (error) {
    console.error("Failed to update user preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
