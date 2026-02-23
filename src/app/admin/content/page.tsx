"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Content = {
  id: string;
  title: string;
  type: string;
  posterUrl: string | null;
  releaseYear: number | null;
  categories: { category: { name: string } }[];
  episodes: { id: string }[];
};

export default function AdminContentPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL || "";
    fetch(`${base}/api/content`)
      .then((r) => r.json())
      .then((data) => setContent(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const remove = (id: string, title: string) => {
    if (!confirm(`למחוק "${title}"?`)) return;
    const base = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL || "";
    fetch(`${base}/api/content/${id}`, { method: "DELETE" }).then(() => {
      setContent((prev) => prev.filter((c) => c.id !== id));
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">תוכן (סרטים וסדרות)</h1>
        <Link
          href="/admin/content/new"
          className="px-6 py-2 bg-flexliner-red rounded font-medium hover:bg-flexliner-red/90"
        >
          הוסף תוכן
        </Link>
      </div>

      {loading ? (
        <p className="text-white/60">טוען...</p>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border border-white/10 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-white/5 text-right">
                  <th className="p-3 font-semibold">כותרת</th>
                  <th className="p-3 font-semibold">סוג</th>
                  <th className="p-3 font-semibold">שנה</th>
                  <th className="p-3 font-semibold">קטגוריות</th>
                  <th className="p-3 font-semibold">פרקים</th>
                  <th className="p-3 font-semibold">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {content.map((c) => (
                  <tr key={c.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="p-3">{c.title}</td>
                    <td className="p-3">{c.type === "series" ? "סדרה" : "סרט"}</td>
                    <td className="p-3">{c.releaseYear ?? "—"}</td>
                    <td className="p-3">
                      {c.categories.map((x) => x.category.name).join(", ") || "—"}
                    </td>
                    <td className="p-3">
                      {c.type === "series" ? c.episodes.length : "—"}
                    </td>
                    <td className="p-3 flex flex-wrap gap-2">
                      <Link
                        href={`/admin/content/${c.id}/preview`}
                        className="text-white/80 hover:text-white text-sm"
                      >
                        תצוגה מקדימה
                      </Link>
                      <Link
                        href={`/admin/content/${c.id}`}
                        className="text-flexliner-red hover:underline"
                      >
                        ערוך
                      </Link>
                      <button
                        onClick={() => remove(c.id, c.title)}
                        className="text-red-400 hover:underline"
                      >
                        מחק
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile: cards */}
          <div className="md:hidden space-y-3">
            {content.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium">{c.title}</span>
                  <span className="text-white/60 text-sm shrink-0">
                    {c.type === "series" ? "סדרה" : "סרט"}
                    {c.releaseYear != null ? ` · ${c.releaseYear}` : ""}
                  </span>
                </div>
                <p className="text-white/60 text-sm">
                  {c.categories.map((x) => x.category.name).join(", ") || "—"}
                  {c.type === "series" ? ` · ${c.episodes.length} פרקים` : ""}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    href={`/admin/content/${c.id}/preview`}
                    className="px-3 py-1.5 rounded bg-white/10 text-sm"
                  >
                    תצוגה מקדימה
                  </Link>
                  <Link
                    href={`/admin/content/${c.id}`}
                    className="px-3 py-1.5 rounded bg-flexliner-red/80 text-sm"
                  >
                    ערוך
                  </Link>
                  <button
                    onClick={() => remove(c.id, c.title)}
                    className="px-3 py-1.5 text-red-400 text-sm"
                  >
                    מחק
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && content.length === 0 && (
        <p className="text-white/60">אין תוכן. הוסף תוכן חדש.</p>
      )}
    </div>
  );
}
