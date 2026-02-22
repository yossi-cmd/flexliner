import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: NextRequest) {
  if (!openai) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { contentId } = body;
    if (!contentId) {
      return NextResponse.json(
        { error: "contentId is required" },
        { status: 400 }
      );
    }

    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        categories: { include: { category: true } },
        episodes: { orderBy: [{ season: "asc" }, { number: "asc" }] },
      },
    });

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const prompt = `צור אפיון תוכן (אפיון AI) לסדרה/סרט לשימוש בהמלצות. תוכן:
כותרת: ${content.title}
${content.titleEn ? `כותרת באנגלית: ${content.titleEn}` : ""}
תיאור: ${content.description || "אין"}
סוג: ${content.type}
שנה: ${content.releaseYear || "לא צוין"}
קטגוריות: ${content.categories.map((c) => c.category.name).join(", ")}
${content.type === "series" && content.episodes.length ? `פרקים: ${content.episodes.map((e) => `S${e.season}E${e.number} ${e.title}`).join(", ")}` : ""}

החזר פסקה אחת קצרה בעברית: ז'אנר, נושאים, אווירה, קהל יעד. בלי כותרת.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    });

    const aiProfile =
      completion.choices[0]?.message?.content?.trim() || "לא נוצר אפיון.";

    await prisma.content.update({
      where: { id: contentId },
      data: { aiProfile },
    });

    return NextResponse.json({ aiProfile });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "AI characterization failed" },
      { status: 500 }
    );
  }
}
