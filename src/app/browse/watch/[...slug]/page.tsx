"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import NetflixPlayer from "@/components/player/NetflixPlayer";

type SubtitleTrack = { label: string; src: string; lang: string };

function parseSubtitleTracks(
  raw: string | SubtitleTrack[] | null | undefined
): SubtitleTrack[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Route subtitles via API so they're always served with charset=utf-8 (fixes Hebrew). SRT also gets converted to VTT. */
function subtitleTracksForPlayer(tracks: SubtitleTrack[]): SubtitleTrack[] {
  if (typeof window === "undefined") return tracks;
  const base = window.location.origin;
  return tracks.map((t) => {
    const fullUrl = t.src.startsWith("http") ? t.src : base + t.src;
    const isLocal = t.src.startsWith("/");
    const isSrt = t.src.toLowerCase().endsWith(".srt");
    if (isLocal || isSrt)
      return { ...t, src: `/api/subtitles?url=${encodeURIComponent(fullUrl)}` };
    return t;
  });
}

// slug is either [episodeId] or ["movie", movieId]
export default function WatchPage() {
  const params = useParams();
  const slug = params.slug as string[];
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [poster, setPoster] = useState<string | undefined>(undefined);
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const isMovie = slug?.[0] === "movie";
  const episodeId = isMovie ? null : slug?.[0];
  const movieId = isMovie ? slug?.[1] : null;

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_APP_URL || "";
    if (episodeId) {
      fetch(`${base}/api/episodes/by-id/${episodeId}`)
        .then((r) => r.json())
        .then((data: {
          videoUrl?: string;
          title?: string;
          content?: { title: string; backdropUrl?: string };
          subtitleUrl?: string;
          subtitleTracks?: SubtitleTrack[];
        }) => {
          if (data.videoUrl) {
            setVideoUrl(data.videoUrl);
            setTitle(data.content ? `${data.content.title} - ${data.title}` : data.title || "");
            setPoster(data.content?.backdropUrl);
            setSubtitleTracks(parseSubtitleTracks(data.subtitleTracks) || (data.subtitleUrl ? [{ label: "עברית", src: data.subtitleUrl, lang: "he" }] : []));
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (movieId) {
      fetch(`${base}/api/content/${movieId}`)
        .then((r) => r.json())
        .then((data: {
          videoUrl?: string;
          title?: string;
          backdropUrl?: string;
          subtitleUrl?: string;
          subtitleTracks?: SubtitleTrack[];
        }) => {
          setVideoUrl(data.videoUrl || null);
          setTitle(data.title || "");
          setPoster(data.backdropUrl);
          setSubtitleTracks(parseSubtitleTracks(data.subtitleTracks) || (data.subtitleUrl ? [{ label: "עברית", src: data.subtitleUrl, lang: "he" }] : []));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [episodeId, movieId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-flexliner-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-white/80">וידאו לא זמין.</p>
        <Link
          href="/browse"
          className="px-6 py-2 bg-flexliner-red rounded font-medium hover:bg-flexliner-red/90"
        >
          חזרה לצפייה
        </Link>
      </div>
    );
  }

  return (
    <NetflixPlayer
      src={videoUrl}
      title={title}
      onCloseHref="/browse"
      subtitleTracks={subtitleTracksForPlayer(subtitleTracks)}
      poster={poster}
    />
  );
}
