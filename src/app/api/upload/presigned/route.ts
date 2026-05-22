import { NextRequest, NextResponse } from "next/server";
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

    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Missing filename or contentType." },
        { status: 400 }
      );
    }

    // Generate a unique object key
    const uniqueKey = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: uniqueKey,
      ContentType: contentType,
    });

    // Generate pre-signed URL (valid for 1 hour)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // The public URL assuming your R2 bucket is mapped to a custom domain.
    // AssemblyAI will need to download from this URL.
    // Note: Cloudflare R2 requires configuring a public custom domain or workers.dev subdomain for public access.
    const publicDomain = process.env.R2_PUBLIC_DOMAIN || `https://pub-${Math.random().toString(36)}.r2.dev`;
    const publicUrl = `${publicDomain}/${uniqueKey}`;

    return NextResponse.json({
      success: true,
      uploadUrl: signedUrl,
      key: uniqueKey,
      publicUrl: publicUrl,
    });
  } catch (error: any) {
    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL." },
      { status: 500 }
    );
  }
}
