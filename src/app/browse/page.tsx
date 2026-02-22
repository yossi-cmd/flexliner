"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ContentCard from "@/components/ContentCard";
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
  categories: { category: { name: string } }[];
  episodes: { id: string; season: number; number: number; title: string }[];
};

type Category = { id: string; name: string; slug: string; order: number };

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const [content, setContent] = useState<Content[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recommendations, setRecommendations] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendQuery, setRecommendQuery] = useState("");
  const [recommendLoading, setRecommendLoading] = useState(false);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_APP_URL || "";
    Promise.all([
      fetch(`${base}/api/content`).then((r) => r.json()),
      fetch(`${base}/api/categories`).then((r) => r.json()),
    ]).then(([contentList, catList]) => {
      setContent(contentList);
      setCategories(catList.sort((a: Category, b: Category) => a.order - b.order));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!q) return;
    const base = process.env.NEXT_PUBLIC_APP_URL || "";
    fetch(`${base}/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then(setContent)
      .catch(() => setContent([]));
  }, [q]);

  const getRecommendations = () => {
    if (!recommendQuery.trim()) return;
    setRecommendLoading(true);
    const base = process.env.NEXT_PUBLIC_APP_URL || "";
    const watched: string[] = JSON.parse(
      typeof window !== "undefined" ? localStorage.getItem("flexliner_watched") || "[]" : "[]"
    );
    const liked: string[] = JSON.parse(
      typeof window !== "undefined" ? localStorage.getItem("flexliner_liked") || "[]" : "[]"
    );
    fetch(`${base}/api/ai/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: recommendQuery,
        watchedIds: watched,
        likedIds: liked,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRecommendations(data);
        setRecommendLoading(false);
      })
      .catch(() => setRecommendLoading(false));
  };

  const byCategory = (categoryId: string) =>
    content.filter((c) =>
      c.categories.some((x) => x.category.id === categoryId || x.category.slug === categoryId)
    );

  const featured = content[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-flexliner-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="pb-16">
      {/* Hero */}
      {featured && !q && (
        <section className="relative h-[70vh] min-h-[400px] mb-8">
          <div className="absolute inset-0">
            {featured.backdropUrl ? (
              <img
                src={featured.backdropUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-flexliner-red/30 to-flexliner-dark" />
            )}
            <div className="hero-overlay absolute inset-0" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg mb-4">
              {featured.title}
            </h1>
            {featured.description && (
              <p className="text-lg text-white/90 drop-shadow mb-6 line-clamp-3">
                {featured.description}
              </p>
            )}
            <div className="flex gap-3">
              <Link
                href={
                  featured.type === "series"
                    ? `/browse/series/${featured.id}`
                    : `/browse/movie/${featured.id}`
                }
                className="px-6 py-3 bg-white text-black rounded font-semibold hover:bg-white/90 flex items-center gap-2"
              >
                ▶ צפה עכשיו
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* AI Recommendations */}
      {!q && (
        <section className="px-6 mb-10">
          <h2 className="text-xl font-bold mb-4">המלצות לפי AI</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              type="text"
              value={recommendQuery}
              onChange={(e) => setRecommendQuery(e.target.value)}
              placeholder="תאר מה בא לך לראות (למשל: קומדיה רומנטית, מתח)"
              className="bg-white/10 border border-white/20 rounded px-4 py-2 w-80 max-w-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-flexliner-red"
            />
            <button
              onClick={getRecommendations}
              disabled={recommendLoading}
              className="px-4 py-2 bg-flexliner-red rounded font-medium hover:bg-flexliner-red/90 disabled:opacity-50"
            >
              {recommendLoading ? "מחפש..." : "המלץ לי"}
            </button>
          </div>
          {recommendations.length > 0 && (
            <div className="content-row flex gap-4 overflow-x-auto pb-4">
              {recommendations.map((c) => (
                <ContentCard key={c.id} content={c} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Search results title */}
      {q && (
        <section className="px-6 mb-6">
          <h2 className="text-2xl font-bold">
            תוצאות חיפוש: &quot;{q}&quot;
          </h2>
        </section>
      )}

      {/* Rows by category */}
      {categories.map((cat) => {
        const items = byCategory(cat.id);
        if (items.length === 0) return null;
        return (
          <section key={cat.id} className="px-6 mb-10">
            <h2 className="text-xl font-bold mb-4">{cat.name}</h2>
            <div className="content-row flex gap-4 overflow-x-auto pb-4">
              {items.map((c) => (
                <ContentCard key={c.id} content={c} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Uncategorized or all if no categories */}
      {categories.length === 0 && content.length > 0 && (
        <section className="px-6 mb-10">
          <h2 className="text-xl font-bold mb-4">כל התוכן</h2>
          <div className="content-row flex gap-4 overflow-x-auto pb-4">
            {content.map((c) => (
              <ContentCard key={c.id} content={c} />
            ))}
          </div>
        </section>
      )}

      {content.length === 0 && (
        <div className="px-6 py-20 text-center text-white/60">
          {q ? "לא נמצא תוכן התואם את החיפוש." : "אין עדיין תוכן. היכנס לצד הניהול להוספה."}
        </div>
      )}
    </main>
  );
}
