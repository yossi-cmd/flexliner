"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Content = {
  id: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  type: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseYear: number | null;
  duration: number | null;
  rating: string | null;
  videoUrl: string | null;
  aiProfile: string | null;
  categories: { category: { name: string } }[];
};

export default function MoviePage() {
  const params = useParams();
  const id = params.id as string;
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_APP_URL || "";
    fetch(`${base}/api/content/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setContent(null);
        else setContent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const recordWatched = () => {
    try {
      const raw = localStorage.getItem("flexliner_watched") || "[]";
      const arr: string[] = JSON.parse(raw);
      if (!arr.includes(id)) {
        arr.unshift(id);
        localStorage.setItem("flexliner_watched", JSON.stringify(arr.slice(0, 50)));
      }
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-flexliner-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-white/70 mb-4">הסרט לא נמצא.</p>
        <Link href="/browse" className="text-flexliner-red hover:underline">
          חזרה לדף הצפייה
        </Link>
      </div>
    );
  }

  const hasVideo = !!content.videoUrl;

  return (
    <main className="min-h-screen">
      <div className="relative h-[50vh] min-h-[300px]">
        {content.backdropUrl ? (
          <img
            src={content.backdropUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-flexliner-red/20 to-flexliner-black" />
        )}
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 h-full flex flex-col justify-end p-8">
          <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
            {content.title}
          </h1>
          <div className="flex gap-4 mt-2 text-white/90">
            {content.releaseYear && <span>{content.releaseYear}</span>}
            {content.duration && <span>{content.duration} דק׳</span>}
            {content.rating && <span>{content.rating}</span>}
            {content.categories.map((c) => (
              <span key={c.category.name}>{c.category.name}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-4xl">
        {content.description && (
          <p className="text-white/90 mb-6">{content.description}</p>
        )}

        {hasVideo ? (
          <Link
            href={`/browse/watch/movie/${content.id}`}
            onClick={recordWatched}
            className="inline-flex items-center gap-2 px-8 py-3 bg-flexliner-red rounded font-semibold hover:bg-flexliner-red/90"
          >
            ▶ צפה עכשיו
          </Link>
        ) : (
          <p className="text-white/60">קישור וידאו לא זמין.</p>
        )}

        <Link
          href="/browse"
          className="block mt-8 text-white/70 hover:text-white"
        >
          ← חזרה לדף הצפייה
        </Link>
      </div>
    </main>
  );
}
