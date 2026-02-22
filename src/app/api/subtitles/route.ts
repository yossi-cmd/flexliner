import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { srtToVtt, isSrtContent, applyRtlToVtt } from "@/lib/srt-to-vtt";
import { decodeSubtitleBuffer } from "@/lib/decode-subtitle";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    let content: string;
    let buffer: Buffer;

    if (url.startsWith("http://") || url.startsWith("https://")) {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed");
      const ab = await res.arrayBuffer();
      buffer = Buffer.from(ab);
    } else if (url.startsWith("/")) {
      const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
      buffer = await readFile(filePath);
    } else {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }

    content = decodeSubtitleBuffer(buffer);

    const isSrt = url.toLowerCase().endsWith(".srt") || isSrtContent(content);
    let vtt = isSrt ? srtToVtt(content) : content;
    vtt = applyRtlToVtt(vtt);

    return new NextResponse(vtt, {
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load subtitles" },
      { status: 500 }
    );
  }
}
