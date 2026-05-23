import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await db.user.findUnique({ where: { id: session.user.id } });
    if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    // Prevent changing super admin roles
    const targetUser = await db.user.findUnique({ where: { id } });
    if (targetUser?.role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Cannot modify super admin" }, { status: 403 });
    }

    const user = await db.user.update({
      where: { id },
      data: { role },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_USER_ROLE",
        resource: `User:${id}`,
        changes: JSON.stringify({ role }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await db.user.findUnique({ where: { id: session.user.id } });
    if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const targetUser = await db.user.findUnique({ where: { id } });
    if (targetUser?.role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Cannot delete super admin" }, { status: 403 });
    }

    await db.user.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_USER",
        resource: `User:${id}`,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
