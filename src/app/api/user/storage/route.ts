import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Assume using Better Auth based on previous context or check import
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uploadThingToken } = await req.json();

    await db.user.update({
      where: { id: session.user.id },
      data: { uploadThingToken },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Storage config update error:", error);
    return NextResponse.json(
      { error: "Failed to update storage configuration" },
      { status: 500 }
    );
  }
}
