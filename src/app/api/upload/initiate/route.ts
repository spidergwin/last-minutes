import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getResumableUploadUrl } from "@/lib/google-drive";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, R2_BUCKET_NAME } from "@/lib/s3";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const identifier = request.headers.get("x-forwarded-for") || "anonymous";
    const allowed = await checkRateLimit(identifier);

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded." },
        { status: 429 }
      );
    }

    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user.id;

    const { filename, contentType, fileSize } = await request.json();

    if (!filename || !contentType || !fileSize) {
      return NextResponse.json(
        { error: "Missing filename, contentType, or fileSize." },
        { status: 400 }
      );
    }

    // 1. Check if user has Google Drive Connected
    if (userId) {
      const driveConnection = await db.googleDriveConnection.findUnique({
        where: { userId },
      });

      if (driveConnection?.enabled) {
        try {
          const { uploadUrl } = await getResumableUploadUrl(
            userId,
            filename,
            contentType,
            fileSize
          );

          return NextResponse.json({
            success: true,
            type: "drive",
            uploadUrl,
          });
        } catch (error) {
          console.error("Failed to generate Google Drive resumable upload URL, falling back to R2:", error);
          // Fall through to R2
        }
      }
    }

    // 2. Fallback to Cloudflare R2
    const isR2Configured =
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_ACCESS_KEY_ID !== "your_access_key";

    if (!isR2Configured) {
      // Fallback to UploadThing
      return NextResponse.json({
        success: true,
        type: "uploadthing",
      });
    }

    const uniqueKey = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: uniqueKey,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    const publicDomain =
      process.env.R2_PUBLIC_DOMAIN ||
      `https://pub-${Math.random().toString(36)}.r2.dev`;
    const publicUrl = `${publicDomain}/${uniqueKey}`;

    return NextResponse.json({
      success: true,
      type: "r2",
      uploadUrl: signedUrl,
      key: uniqueKey,
      publicUrl: publicUrl,
    });
  } catch (error: any) {
    console.error("Upload initiate error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL." },
      { status: 500 }
    );
  }
}
