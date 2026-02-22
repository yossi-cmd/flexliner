import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, season, number, title, videoUrl, duration, subtitleTracks } = body;
    if (!contentId || number == null || !title || !videoUrl) {
      return NextResponse.json(
        { error: "contentId, number, title, videoUrl are required" },
        { status: 400 }
      );
    }
    const tracksJson = Array.isArray(subtitleTracks)
      ? JSON.stringify(subtitleTracks)
      : (subtitleTracks ?? null);
    const episode = await prisma.episode.create({
      data: {
        contentId,
        season: season != null ? parseInt(String(season), 10) : 1,
        number: parseInt(String(number), 10),
        title,
        videoUrl,
        duration: duration != null ? parseInt(String(duration), 10) : null,
        subtitleTracks: tracksJson,
      },
    });
    return NextResponse.json(episode);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create episode" },
      { status: 500 }
    );
  }
}
