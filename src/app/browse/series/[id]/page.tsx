"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SeriesPageContent } from "./SeriesPageContent";
import type { Content } from "./types";

export type { Content } from "./types";

export default function SeriesPage() {
  const params = useParams();
  const router = useRouter();
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
        <p className="text-white/70 mb-4">התוכן לא נמצא.</p>
        <Link href="/browse" className="text-flexliner-red hover:underline">
          חזרה לדף הצפייה
        </Link>
      </div>
    );
  }

  const firstEpisode = content.episodes[0];
  const seasonNumbers = content.episodes.map((e) => e.season);
  const seasons = Array.from(new Set(seasonNumbers)).sort(
    (a, b) => a - b
  );

  return (
    <SeriesPageContent
      content={content}
      firstEpisode={firstEpisode}
      seasons={seasons}
      recordWatched={recordWatched}
      onBack={() => router.back()}
    />
  );
}
