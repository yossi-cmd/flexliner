import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");

    const where: { type?: string; categories?: { categoryId: string } } = {};
    if (type) where.type = type;
    if (categoryId) where.categories = { some: { categoryId } };

    const content = await prisma.content.findMany({
      where,
      include: {
        categories: { include: { category: true } },
        episodes: { orderBy: [{ season: "asc" }, { number: "asc" }] },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(content);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      titleEn,
      description,
      type,
      posterUrl,
      backdropUrl,
      releaseYear,
      duration,
      rating,
      videoUrl,
      categoryIds,
      aiProfile,
      subtitleTracks,
    } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: "title and type are required" },
        { status: 400 }
      );
    }

    const content = await prisma.content.create({
      data: {
        title,
        titleEn: titleEn ?? null,
        description: description ?? null,
        type,
        posterUrl: posterUrl ?? null,
        backdropUrl: backdropUrl ?? null,
        releaseYear: releaseYear ? parseInt(String(releaseYear), 10) : null,
        duration: duration ? parseInt(String(duration), 10) : null,
        rating: rating ?? null,
        videoUrl: videoUrl ?? null,
        aiProfile: aiProfile ?? null,
        subtitleTracks: subtitleTracks != null
          ? (Array.isArray(subtitleTracks) ? JSON.stringify(subtitleTracks) : subtitleTracks)
          : null,
        categories: Array.isArray(categoryIds)
          ? { create: categoryIds.map((id: string) => ({ categoryId: id })) }
          : undefined,
      },
      include: {
        categories: { include: { category: true } },
        episodes: true,
      },
    });

    return NextResponse.json(content);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create content" },
      { status: 500 }
    );
  }
}
