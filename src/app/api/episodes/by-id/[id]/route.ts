import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const episode = await prisma.episode.findUnique({
      where: { id },
      include: { content: true },
    });
    if (!episode) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(episode);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch episode" },
      { status: 500 }
    );
  }
}
