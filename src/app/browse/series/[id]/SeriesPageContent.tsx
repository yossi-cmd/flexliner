"use client";

import Link from "next/link";
import type { Content } from "./types";

type Props = {
  content: Content;
  firstEpisode: Content["episodes"][0] | undefined;
  seasons: number[];
  recordWatched: () => void;
  onBack: () => void;
};

export function SeriesPageContent({
  content,
  firstEpisode,
  seasons,
  recordWatched,
  onBack,
}: Props) {
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

        {firstEpisode && (
          <div className="mb-8">
            <Link
              href={`/browse/watch/${firstEpisode.id}`}
              onClick={recordWatched}
              className="inline-flex items-center gap-2 px-8 py-3 bg-flexliner-red rounded font-semibold hover:bg-flexliner-red/90"
            >
              ▶ צפה בפרק 1
            </Link>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4">פרקים</h2>
        {seasons.map((season) => (
          <div key={season} className="mb-8">
            <h3 className="text-lg font-semibold text-white/80 mb-3">
              עונה {season}
            </h3>
            <ul className="space-y-2">
              {content.episodes
                .filter((e) => e.season === season)
                .map((ep) => (
                  <li key={ep.id}>
                    <Link
                      href={`/browse/watch/${ep.id}`}
                      onClick={recordWatched}
                      className="flex items-center gap-4 p-3 rounded bg-white/5 hover:bg-white/10 transition"
                    >
                      <span className="text-white/60 w-12">
                        {ep.season}x{ep.number}
                      </span>
                      <span className="flex-1">{ep.title}</span>
                      {ep.duration && (
                        <span className="text-white/50 text-sm">
                          {ep.duration} דק׳
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}

        <button
          onClick={onBack}
          className="mt-8 text-white/70 hover:text-white"
        >
          ← חזרה
        </button>
      </div>
    </main>
  );
}
