import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;
    const emailTrim = (email as string)?.trim()?.toLowerCase();
    if (!emailTrim || !password || password.length < 6) {
      return NextResponse.json(
        { error: "נא להזין אימייל וסיסמה (לפחות 6 תווים)" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: emailTrim },
    });
    if (existing) {
      return NextResponse.json(
        { error: "משתמש עם אימייל זה כבר קיים" },
        { status: 400 }
      );
    }

    const count = await prisma.user.count();
    const role = count === 0 ? "admin" : "viewer";
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: emailTrim,
        passwordHash,
        name: (name as string)?.trim() || null,
        role,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (e) {
    console.error("[register]", e);
    const message = e instanceof Error ? e.message : "שגיאה ביצירת משתמש";
    return NextResponse.json(
      { error: "שגיאה ביצירת משתמש", details: process.env.NODE_ENV === "development" ? message : undefined },
      { status: 500 }
    );
  }
}
