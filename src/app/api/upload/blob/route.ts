import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

/**
 * Client upload handler for Vercel Blob (CDN).
 * When BLOB_READ_WRITE_TOKEN is set, the client uploads directly to Blob;
 * otherwise the client falls back to POST /api/upload (local disk).
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage not configured" },
      { status: 400 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        addRandomSuffix: true,
        // Allow videos, images, subtitles, and common upload types
        allowedContentTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "video/mp4",
          "video/webm",
          "video/quicktime",
          "video/x-msvideo",
          "text/plain",
          "application/x-subrip",
          "text/vtt",
          "application/octet-stream",
        ],
      }),
      onUploadCompleted: async () => {
        // Optional: run logic after upload (e.g. log, update DB)
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
