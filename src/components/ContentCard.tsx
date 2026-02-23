"use client";

import Link from "next/link";

type Content = {
  id: string;
  title: string;
  type: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseYear: number | null;
};

export default function ContentCard({ content }: { content: Content }) {
  const href = content.type === "series" ? `/browse/series/${content.id}` : `/browse/movie/${content.id}`;
  const img = content.posterUrl || content.backdropUrl;

  return (
    <Link
      href={href}
      className="content-card block flex-shrink-0 w-[180px] rounded overflow-hidden bg-flexliner-dark group"
    >
      <div className="aspect-video relative bg-white/5">
        {img ? (
          <img
            src={img}
            alt={content.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
            אין תמונה
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 group-hover:scale-105 scale-100 transition-colors" />
      </div>
      <div className="p-2">
        <p className="font-medium text-white truncate">{content.title}</p>
        {content.releaseYear && (
          <p className="text-xs text-white/60">{content.releaseYear}</p>
        )}
      </div>
    </Link>
  );
}
