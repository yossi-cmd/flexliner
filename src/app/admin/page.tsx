"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Content = {
  id: string;
  title: string;
  type: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseYear: number | null;
  episodes: { id: string }[];
};

export default function AdminDashboard() {
  const [content, setContent] = useState<Content[]>([]);

  useEffect(() => {
    const base = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL || "";
    fetch(`${base}/api/content`)
      .then((r) => r.json())
      .then((data) => setContent(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">דשבורד</h1>
      <p className="text-white/70 mb-6">
        ניהול תוכן פלקסליינר. הוסף סרטים וסדרות והגדר קטגוריות.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mb-10">
        <Link
          href="/admin/content"
          className="block p-4 md:p-6 rounded-lg bg-flexliner-dark border border-white/10 hover:border-flexliner-red/50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">תוכן</h2>
          <p className="text-white/60 text-sm">
            העלאת סרטים וסדרות, עריכת פרטים והוספת פרקים.
          </p>
        </Link>
        <Link
          href="/admin/categories"
          className="block p-4 md:p-6 rounded-lg bg-flexliner-dark border border-white/10 hover:border-flexliner-red/50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">קטגוריות</h2>
          <p className="text-white/60 text-sm">
            ניהול קטגוריות להצגה בדף הצפייה.
          </p>
        </Link>
      </div>

      {content.length > 0 && (
        <section className="rounded-lg border border-white/10 p-4 md:p-6 bg-white/5">
          <h2 className="text-lg font-bold mb-4">תצוגה מקדימה – תוכן אחרון</h2>
          <p className="text-white/60 text-sm mb-4">
            כרטיס כפי שיופיע בקטגוריה; לחיצה על כרטיס → תצוגה מקדימה מלאה וצפייה עם כתוביות.
          </p>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {content.slice(0, 12).map((c) => {
              const img = c.posterUrl || c.backdropUrl;
              const watchHref = c.type === "movie"
                ? `/browse/watch/movie/${c.id}`
                : c.episodes[0]
                  ? `/browse/watch/${c.episodes[0].id}`
                  : null;
              return (
                <div key={c.id} className="flex-shrink-0 w-[160px] md:w-[180px]">
                  <Link
                    href={`/admin/content/${c.id}/preview`}
                    className="block rounded overflow-hidden bg-flexliner-dark border border-white/20 hover:border-flexliner-red/50 transition"
                  >
                    <div className="aspect-video relative bg-white/5">
                      {img ? (
                        <img
                          src={img}
                          alt={c.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
                          אין תמונה
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="font-medium text-white text-sm truncate">{c.title}</p>
                      {c.releaseYear && (
                        <p className="text-xs text-white/60">{c.releaseYear}</p>
                      )}
                    </div>
                  </Link>
                  {watchHref && (
                    <a
                      href={watchHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-center text-xs text-flexliner-red hover:underline"
                    >
                      צפה עם כתוביות
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
