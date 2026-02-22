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
    const { query, watchedIds = [], likedIds = [] } = body;

    const allContent = await prisma.content.findMany({
      include: {
        categories: { include: { category: true } },
        episodes: true,
      },
    });

    const listDesc = allContent
      .slice(0, 80)
      .map(
        (c) =>
          `- ${c.title} (${c.type}): ${c.description || ""} ${c.aiProfile || ""} קטגוריות: ${c.categories.map((x) => x.category.name).join(", ")}`
      )
      .join("\n");

    const prompt = `אתה עוזר להמליץ על סרטים וסדרות. רשימת תוכן זמין:
${listDesc}

המשתמש חיפש/ביקש: "${query || "המלצה כללית"}".
${watchedIds.length ? `כבר צפה ב: ${watchedIds.join(", ")}` : ""}
${likedIds.length ? `אהב: ${likedIds.join(", ")}` : ""}

החזר רק שמות מדויקים של תוכן מהרשימה (עד 8 פריטים), אחד per line, בעברית. רק כותרות שקיימות ברשימה. אם אין התאמה טובה - החזר פחות.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    const recommendedTitles = text
      .split("\n")
      .map((s) => s.replace(/^[-*\d.)\s]+/, "").trim())
      .filter(Boolean);

    const recommended = allContent.filter((c) =>
      recommendedTitles.some(
        (t) => c.title.includes(t) || t.includes(c.title)
      )
    );

    return NextResponse.json(
      recommended.length ? recommended : allContent.slice(0, 8)
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "AI recommendation failed" },
      { status: 500 }
    );
  }
}
