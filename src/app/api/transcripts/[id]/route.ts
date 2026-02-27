import { NextRequest, NextResponse } from "next/server";
import { updateTranscriptSchema } from "@/lib/validations";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = "user_id_placeholder"; // TODO: Get from auth

    const transcript = await db.transcript.findUnique({
      where: { id },
    });

    if (!transcript || transcript.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Transcript not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transcript,
    });
  } catch (error) {
    console.error("Get transcript error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transcript" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validInput = updateTranscriptSchema.parse(body);

    const userId = "user_id_placeholder"; // TODO: Get from auth

    const transcript = await db.transcript.findUnique({
      where: { id },
    });

    if (!transcript || transcript.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Transcript not found" },
        { status: 404 }
      );
    }

    const updated = await db.transcript.update({
      where: { id },
      data: validInput,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Update transcript error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update transcript" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = "user_id_placeholder"; // TODO: Get from auth

    const transcript = await db.transcript.findUnique({
      where: { id },
    });

    if (!transcript || transcript.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Transcript not found" },
        { status: 404 }
      );
    }

    await db.transcript.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Transcript deleted successfully",
    });
  } catch (error) {
    console.error("Delete transcript error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete transcript" },
      { status: 500 }
    );
  }
}
