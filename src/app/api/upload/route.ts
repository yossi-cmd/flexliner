import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

function safeName(original: string): string {
  const ext = path.extname(original) || "";
  const base = randomBytes(8).toString("hex");
  return base + ext;
}

export async function POST(request: NextRequest) {
  try {
    // On Vercel there is no writable filesystem – uploads must use Blob (CDN)
    if (process.env.VERCEL === "1") {
      return NextResponse.json(
        {
          error:
            "העלאת קבצים בפרודקשן דורשת הגדרת Vercel Blob (Storage → Blob). ודא ש-BLOB_READ_WRITE_TOKEN מוגדר.",
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "לא נשלח קובץ" },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "הקובץ גדול מדי (מקסימום 2GB)" },
        { status: 400 }
      );
    }
    await mkdir(UPLOAD_DIR, { recursive: true });
    const filename = safeName(file.name);
    const filepath = path.join(UPLOAD_DIR, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "שגיאה בהעלאת קובץ" },
      { status: 500 }
    );
  }
}
