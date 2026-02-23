"use client";

type Category = { id: string; name: string };
type SubtitleTrack = { label: string; src: string; lang: string };

type FormState = {
  title: string;
  type: "movie" | "series";
  description: string;
  posterUrl: string;
  backdropUrl: string;
  releaseYear: string;
  duration: string;
  rating: string;
  videoUrl: string;
  categoryIds: string[];
  subtitleTracks: SubtitleTrack[];
};

type Props = {
  form: FormState;
  categories: Category[];
  contentId?: string;
};

function subtitleTrackSrc(track: SubtitleTrack): string {
  if (typeof window === "undefined") return "";
  const fullUrl = track.src.startsWith("http")
    ? track.src
    : `${window.location.origin}${track.src.startsWith("/") ? "" : "/"}${track.src}`;
  return `/api/subtitles?url=${encodeURIComponent(fullUrl)}`;
}

export default function AdminLivePreview({ form, categories, contentId }: Props) {
  const categoryNames = form.categoryIds
    .map((id) => categories.find((c) => c.id === id)?.name)
    .filter(Boolean) as string[];
  const img = form.posterUrl || form.backdropUrl;
  const hasVideo = form.type === "movie" && !!form.videoUrl?.trim();

  return (
    <div className="rounded-xl border border-white/20 bg-black/30 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <h2 className="text-lg font-bold">תצוגה מקדימה – מתעדכן לפי הטופס</h2>
      </div>
      <div className="p-4 space-y-8">
        {/* 1. כפריט ראשי בדף הבית */}
        <section>
          <h3 className="text-sm font-semibold text-white/70 mb-2">כפריט ראשי (דף הבית)</h3>
          <div className="relative h-[220px] min-h-[140px] rounded-lg overflow-hidden border border-white/10">
            <div className="absolute inset-0">
              {form.backdropUrl ? (
                <img
                  src={form.backdropUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-flexliner-red/30 to-flexliner-dark" />
              )}
              <div className="hero-overlay absolute inset-0" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-end p-4">
              <h4 className="text-xl md:text-2xl font-bold drop-shadow-lg line-clamp-2">
                {form.title || "כותרת התוכן"}
              </h4>
              {form.description && (
                <p className="text-sm text-white/90 drop-shadow line-clamp-2 mt-1">
                  {form.description}
                </p>
              )}
              <div className="mt-2 text-xs text-white/80">
                {form.releaseYear && <span>{form.releaseYear}</span>}
                {form.type === "movie" && form.duration && (
                  <span className="mr-2"> · {form.duration} דק׳</span>
                )}
                {form.rating && <span> · {form.rating}</span>}
                {categoryNames.length > 0 && (
                  <span> · {categoryNames.join(", ")}</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2. כפריט בקטגוריה */}
        <section>
          <h3 className="text-sm font-semibold text-white/70 mb-2">כפריט בקטגוריה</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="content-card block flex-shrink-0 w-[160px] rounded overflow-hidden bg-flexliner-dark border border-white/20">
              <div className="aspect-video relative bg-white/5">
                {img ? (
                  <img
                    src={img}
                    alt={form.title || ""}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
                    אין תמונה
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="font-medium text-white text-sm truncate">
                  {form.title || "—"}
                </p>
                {form.releaseYear && (
                  <p className="text-xs text-white/60">{form.releaseYear}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 3. כעמוד עצמאי */}
        <section>
          <h3 className="text-sm font-semibold text-white/70 mb-2">כעמוד עצמאי</h3>
          <div className="relative h-[200px] min-h-[120px] rounded-lg overflow-hidden border border-white/10">
            {form.backdropUrl ? (
              <img
                src={form.backdropUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-flexliner-red/20 to-flexliner-black" />
            )}
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <h4 className="text-xl font-bold">{form.title || "—"}</h4>
              <div className="flex flex-wrap gap-2 mt-1 text-white/90 text-xs">
                {form.releaseYear && <span>{form.releaseYear}</span>}
                {form.type === "movie" && form.duration && (
                  <span>{form.duration} דק׳</span>
                )}
                {form.rating && <span>{form.rating}</span>}
                {categoryNames.map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </div>
          </div>
          {form.description && (
            <p className="mt-2 text-white/80 text-sm line-clamp-3 p-2 rounded bg-white/5">
              {form.description}
            </p>
          )}
        </section>

        {/* 4. צפייה בסרט */}
        <section>
          <h3 className="text-sm font-semibold text-white/70 mb-2">צפייה בסרט</h3>
          {form.type !== "movie" ? (
            <p className="text-white/50 text-sm p-3 rounded bg-white/5">
              סדרה – צפייה בפרקים מתוך עמוד התוכן באתר.
            </p>
          ) : !hasVideo ? (
            <p className="text-white/50 text-sm p-3 rounded bg-white/5">
              העלה או הזן קישור וידאו כדי לראות תצוגה מקדימה.
            </p>
          ) : (
            <div className="rounded-lg overflow-hidden border border-white/20 bg-black">
              <video
                key={form.videoUrl}
                src={form.videoUrl}
                controls
                className="w-full aspect-video max-h-[280px] object-contain"
                playsInline
              >
                {form.subtitleTracks.map((track, i) => (
                  <track
                    key={i}
                    kind="subtitles"
                    src={subtitleTrackSrc(track)}
                    label={track.label}
                    srcLang={track.lang}
                    default={i === 0}
                  />
                ))}
              </video>
              {form.subtitleTracks.length > 0 && (
                <p className="text-white/50 text-xs px-2 py-1">
                  כתוביות: {form.subtitleTracks.map((t) => t.label).join(", ")}
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
