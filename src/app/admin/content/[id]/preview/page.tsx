"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Content = {
  id: string;
  title: string;
  type: string;
  description: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseYear: number | null;
  duration: number | null;
  rating: string | null;
  videoUrl: string | null;
  categories: { category: { name: string } }[];
  episodes: { id: string; season: number; number: number; title: string }[];
};

export default function AdminPreviewPage() {
  const params = useParams();
  const contentId = params?.id as string;
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contentId) {
      setLoading(false);
      return;
    }
    const base = process.env.NEXT_PUBLIC_APP_URL || "";
    fetch(`${base}/api/content/${contentId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setContent(null);
        else setContent(data);
      })
      .finally(() => setLoading(false));
  }, [contentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-flexliner-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div>
        <p className="text-white/60 mb-4">תוכן לא נמצא.</p>
        <Link href="/admin/content" className="text-flexliner-red hover:underline">
          חזרה לרשימה
        </Link>
      </div>
    );
  }

  const firstEpisode = content.episodes[0];
  const watchHref = content.type === "movie"
    ? `/browse/watch/movie/${content.id}`
    : firstEpisode
      ? `/browse/watch/${firstEpisode.id}`
      : null;
  const browseHref = content.type === "series"
    ? `/browse/series/${content.id}`
    : `/browse/movie/${content.id}`;

  const img = content.posterUrl || content.backdropUrl;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">תצוגה מקדימה: {content.title}</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/content/${content.id}`}
            className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
          >
            ← ערוך תוכן
          </Link>
          <Link href="/admin/content" className="px-4 py-2 rounded bg-white/10 hover:bg-white/20">
            רשימת תוכן
          </Link>
        </div>
      </div>

      {/* 1. כפי שיופיע בכרטיס (בשורה/קטגוריה) */}
      <section className="rounded-lg border border-white/10 p-6 bg-white/5">
        <h2 className="text-lg font-bold mb-4">כפי שיופיע בכרטיס (בקטגוריה)</h2>
        <div className="flex flex-wrap gap-4">
          <div className="content-card block flex-shrink-0 w-[180px] rounded overflow-hidden bg-flexliner-dark group border border-white/20">
            <div className="aspect-video relative bg-white/5">
              {img ? (
                <img
                  src={img}
                  alt={content.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
                  אין תמונה
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="font-medium text-white truncate">{content.title}</p>
              {content.releaseYear && (
                <p className="text-xs text-white/60">{content.releaseYear}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. כעמוד עצמאי */}
      <section className="rounded-lg border border-white/10 overflow-hidden bg-white/5">
        <h2 className="text-lg font-bold p-4 pb-0">כעמוד עצמאי</h2>
        <div className="relative h-[40vh] min-h-[200px] mt-4">
          {content.backdropUrl ? (
            <img
              src={content.backdropUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-flexliner-red/20 to-flexliner-black" />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <h3 className="text-2xl md:text-3xl font-bold">{content.title}</h3>
            <div className="flex flex-wrap gap-3 mt-2 text-white/90 text-sm">
              {content.releaseYear && <span>{content.releaseYear}</span>}
              {content.type === "movie" && content.duration && (
                <span>{content.duration} דק׳</span>
              )}
              {content.rating && <span>{content.rating}</span>}
              {content.categories.map((c) => (
                <span key={c.category.name}>{c.category.name}</span>
              ))}
            </div>
          </div>
        </div>
        {content.description && (
          <p className="p-4 text-white/80 text-sm line-clamp-3">{content.description}</p>
        )}
      </section>

      {/* 3. צפייה עם כתוביות */}
      <section className="rounded-lg border border-white/10 p-6 bg-white/5">
        <h2 className="text-lg font-bold mb-4">צפייה עם כתוביות</h2>
        <p className="text-white/70 text-sm mb-4">
          פתח את הנגן עם הכתוביות המוגדרות לתוכן (סרט או פרק ראשון).
        </p>
        <div className="flex flex-wrap gap-3">
          {watchHref ? (
            <a
              href={watchHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-flexliner-red rounded font-medium hover:bg-flexliner-red/90"
            >
              צפה עכשיו (חלון חדש)
            </a>
          ) : (
            <span className="text-white/50">
              {content.type === "series" ? "הוסף פרק כדי לאפשר צפייה." : "הוסף קישור וידאו בתוכן."}
            </span>
          )}
          <a
            href={browseHref}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded bg-white/10 hover:bg-white/20"
          >
            עמוד התוכן באתר
          </a>
        </div>
      </section>
    </div>
  );
}
