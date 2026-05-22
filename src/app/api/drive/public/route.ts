import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { makeFilePublic } from "@/lib/google-drive";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: "Missing fileId" },
        { status: 400 }
      );
    }

    const publicUrl = await makeFilePublic(session.user.id, fileId);

    return NextResponse.json({
      success: true,
      publicUrl,
    });
  } catch (error: any) {
    console.error("Make file public error:", error);
    return NextResponse.json(
      { error: "Failed to make file public" },
      { status: 500 }
    );
  }
}
