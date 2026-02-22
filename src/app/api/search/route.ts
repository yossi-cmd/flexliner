import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    if (!q) {
      const all = await prisma.content.findMany({
        include: {
          categories: { include: { category: true } },
          episodes: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(all);
    }

    const content = await prisma.content.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { titleEn: { contains: q } },
          { description: { contains: q } },
          { aiProfile: { contains: q } },
        ],
      },
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
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}
