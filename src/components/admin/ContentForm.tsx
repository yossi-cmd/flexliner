"use client";

import { useEffect, useState } from "react";
import UrlOrUploadInput from "@/components/UrlOrUploadInput";
import SubtitleEditorModal from "@/components/admin/SubtitleEditorModal";

type Category = { id: string; name: string; slug: string };
type SubtitleTrack = { label: string; src: string; lang: string };

type Props = {
  contentId?: string;
  onSaved: (id: string) => void;
  onCancel: () => void;
};

export default function ContentForm({ contentId, onSaved, onCancel }: Props) {
  const [loading, setLoading] = useState(!!contentId);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: "",
    titleEn: "",
    description: "",
    type: "series" as "movie" | "series",
    posterUrl: "",
    backdropUrl: "",
    releaseYear: "",
    duration: "",
    rating: "",
    videoUrl: "",
    categoryIds: [] as string[],
    subtitleTracks: [] as SubtitleTrack[],
  });
  const [newSubSrc, setNewSubSrc] = useState("");
  const [editSubtitleIndex, setEditSubtitleIndex] = useState<number | null>(null);

  const base = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL || "";

  function parseSubtitleTracks(raw: string | SubtitleTrack[] | null | undefined): SubtitleTrack[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  useEffect(() => {
    fetch(`${base}/api/categories`)
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (!contentId) return;
    fetch(`${base}/api/content/${contentId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        const loadedTracks = parseSubtitleTracks(data.subtitleTracks);
        setForm({
          title: data.title || "",
          titleEn: data.titleEn || "",
          description: data.description || "",
          type: data.type || "series",
          posterUrl: data.posterUrl || "",
          backdropUrl: data.backdropUrl || "",
          releaseYear: data.releaseYear != null ? String(data.releaseYear) : "",
          duration: data.duration != null ? String(data.duration) : "",
          rating: data.rating || "",
          videoUrl: data.videoUrl || "",
          categoryIds: (data.categories || []).map((c: { categoryId: string }) => c.categoryId),
          subtitleTracks: Array.isArray(loadedTracks) ? loadedTracks : [],
        });
      })
      .finally(() => setLoading(false));
  }, [contentId]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      ...form,
      releaseYear: form.releaseYear ? parseInt(form.releaseYear, 10) : null,
      duration: form.duration ? parseInt(form.duration, 10) : null,
      categoryIds: form.categoryIds,
      subtitleTracks: form.subtitleTracks ?? [],
    };
    const url = contentId ? `${base}/api/content/${contentId}` : `${base}/api/content`;
    const method = contentId ? "PATCH" : "POST";
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        onSaved(data.id || contentId!);
      })
      .catch((err) => alert(err.message || "שגיאה"))
      .finally(() => setSaving(false));
  };

  const toggleCategory = (id: string) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((x) => x !== id)
        : [...prev.categoryIds, id],
    }));
  };

  if (loading) {
    return <p className="text-white/60">טוען...</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm text-white/70 mb-1">כותרת *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          required
          className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-flexliner-red"
        />
      </div>
      <div>
        <label className="block text-sm text-white/70 mb-1">כותרת באנגלית</label>
        <input
          type="text"
          value={form.titleEn}
          onChange={(e) => setForm((p) => ({ ...p, titleEn: e.target.value }))}
          className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-flexliner-red"
        />
      </div>
      <div>
        <label className="block text-sm text-white/70 mb-1">תיאור</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          rows={3}
          className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-flexliner-red"
        />
      </div>
      <div>
        <label className="block text-sm text-white/70 mb-1">סוג *</label>
        <select
          value={form.type}
          onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "movie" | "series" }))}
          className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-flexliner-red"
        >
          <option value="series">סדרה</option>
          <option value="movie">סרט</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">פוסטר (קישור או העלאה)</label>
          <UrlOrUploadInput
            value={form.posterUrl}
            onChange={(v) => setForm((p) => ({ ...p, posterUrl: v }))}
            placeholder="קישור תמונה או העלה קובץ"
            accept="image/*"
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-flexliner-red"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">רקע (קישור או העלאה)</label>
          <UrlOrUploadInput
            value={form.backdropUrl}
            onChange={(v) => setForm((p) => ({ ...p, backdropUrl: v }))}
            placeholder="קישור תמונה או העלה קובץ"
            accept="image/*"
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-flexliner-red"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">שנה</label>
          <input
            type="number"
            value={form.releaseYear}
            onChange={(e) => setForm((p) => ({ ...p, releaseYear: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-flexliner-red"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">משך (דקות)</label>
          <input
            type="number"
            value={form.duration}
            onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-flexliner-red"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">דירוג (PG-13 וכו')</label>
          <input
            type="text"
            value={form.rating}
            onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-flexliner-red"
          />
        </div>
      </div>
      {form.type === "movie" && (
        <div>
          <label className="block text-sm text-white/70 mb-1">וידאו סרט (קישור או העלאה)</label>
          <UrlOrUploadInput
            value={form.videoUrl}
            onChange={(v) => setForm((p) => ({ ...p, videoUrl: v }))}
            placeholder="קישור וידאו או העלה קובץ"
            accept="video/*"
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-flexliner-red"
          />
        </div>
      )}
      {form.type === "movie" && (
        <div>
          <label className="block text-sm text-white/70 mb-2">כתוביות (קבצי VTT)</label>
          <p className="text-white/50 text-xs mb-2">הוסף מסלולי כתוביות: תווית (למשל עברית), קוד שפה (he/en), קישור לקובץ .vtt</p>
          {form.subtitleTracks.map((t, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 mb-2 p-2 rounded bg-white/5">
              <span className="text-sm">{t.label}</span>
              <span className="text-white/50 text-xs">({t.lang})</span>
              <button
                type="button"
                onClick={() => setEditSubtitleIndex(i)}
                className="text-flexliner-red text-sm hover:underline"
              >
                ערוך קובץ
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, subtitleTracks: p.subtitleTracks.filter((_, j) => j !== i) }))}
                className="text-red-400 text-sm hover:underline"
              >
                הסר
              </button>
            </div>
          ))}
          {editSubtitleIndex !== null && form.subtitleTracks[editSubtitleIndex] && (
            <SubtitleEditorModal
              track={form.subtitleTracks[editSubtitleIndex]}
              onSave={(newSrc) => {
                setForm((p) => ({
                  ...p,
                  subtitleTracks: p.subtitleTracks.map((t, j) =>
                    j === editSubtitleIndex ? { ...t, src: newSrc } : t
                  ),
                }));
                setEditSubtitleIndex(null);
              }}
              onClose={() => setEditSubtitleIndex(null)}
            />
          )}
          <div className="flex flex-wrap gap-2 mb-2 items-end">
            <input
              type="text"
              placeholder="תווית (עברית, English)"
              id="st-label"
              className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-white text-sm w-28"
            />
            <input
              type="text"
              placeholder="שפה (he, en)"
              id="st-lang"
              className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-white text-sm w-20"
            />
            <div className="flex-1 min-w-[200px]">
              <UrlOrUploadInput
                value={newSubSrc}
                onChange={setNewSubSrc}
                placeholder="קישור .vtt / .srt או העלה קובץ"
                accept=".vtt,.srt,vtt,srt"
                className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-white text-sm w-full"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const label = (document.getElementById("st-label") as HTMLInputElement)?.value?.trim();
                const lang = (document.getElementById("st-lang") as HTMLInputElement)?.value?.trim();
                if (!label || !lang || !newSubSrc.trim()) return;
                setForm((p) => ({ ...p, subtitleTracks: [...p.subtitleTracks, { label, lang, src: newSubSrc.trim() }] }));
                (document.getElementById("st-label") as HTMLInputElement).value = "";
                (document.getElementById("st-lang") as HTMLInputElement).value = "";
                setNewSubSrc("");
              }}
              className="px-3 py-1.5 bg-white/20 rounded text-sm"
            >
              הוסף כתוביות
            </button>
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm text-white/70 mb-2">קטגוריות</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.categoryIds.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
                className="rounded"
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-flexliner-red rounded font-medium hover:bg-flexliner-red/90 disabled:opacity-50"
        >
          {saving ? "שומר..." : "שמור"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-white/10 rounded font-medium hover:bg-white/20"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
