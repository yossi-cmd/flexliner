import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {
      title: body.title,
      videoUrl: body.videoUrl,
      season: body.season != null ? parseInt(String(body.season), 10) : undefined,
      number: body.number != null ? parseInt(String(body.number), 10) : undefined,
      duration: body.duration != null ? parseInt(String(body.duration), 10) : undefined,
    };
    if (body.subtitleTracks !== undefined) {
      data.subtitleTracks = Array.isArray(body.subtitleTracks)
        ? JSON.stringify(body.subtitleTracks)
        : body.subtitleTracks;
    }
    const episode = await prisma.episode.update({
      where: { id },
      data: data as Parameters<typeof prisma.episode.update>[0]["data"],
    });
    return NextResponse.json(episode);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update episode" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.episode.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete episode" },
      { status: 500 }
    );
  }
}
