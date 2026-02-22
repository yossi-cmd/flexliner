import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        episodes: { orderBy: [{ season: "asc" }, { number: "asc" }] },
      },
    });
    if (!content) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(content);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: {
      title?: string;
      titleEn?: string | null;
      description?: string | null;
      type?: string;
      posterUrl?: string | null;
      backdropUrl?: string | null;
      releaseYear?: number | null;
      duration?: number | null;
      rating?: string | null;
      videoUrl?: string | null;
      subtitleTracks?: string | null;
      aiProfile?: string | null;
    } = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.titleEn !== undefined) updateData.titleEn = body.titleEn;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.posterUrl !== undefined) updateData.posterUrl = body.posterUrl;
    if (body.backdropUrl !== undefined) updateData.backdropUrl = body.backdropUrl;
    if (body.releaseYear !== undefined)
      updateData.releaseYear = body.releaseYear == null ? null : parseInt(String(body.releaseYear), 10);
    if (body.duration !== undefined)
      updateData.duration = body.duration == null ? null : parseInt(String(body.duration), 10);
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
    if (body.aiProfile !== undefined) updateData.aiProfile = body.aiProfile;
    if (body.subtitleTracks !== undefined)
      updateData.subtitleTracks = Array.isArray(body.subtitleTracks)
        ? JSON.stringify(body.subtitleTracks)
        : body.subtitleTracks;

    if (body.categoryIds !== undefined) {
      await prisma.categoryOnContent.deleteMany({ where: { contentId: id } });
      if (Array.isArray(body.categoryIds) && body.categoryIds.length > 0) {
        await prisma.categoryOnContent.createMany({
          data: body.categoryIds.map((categoryId: string) => ({
            contentId: id,
            categoryId,
          })),
        });
      }
    }

    const content = await prisma.content.update({
      where: { id },
      data: updateData,
      include: {
        categories: { include: { category: true } },
        episodes: true,
      },
    });

    return NextResponse.json(content);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update content" },
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
    await prisma.content.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete content" },
      { status: 500 }
    );
  }
}
