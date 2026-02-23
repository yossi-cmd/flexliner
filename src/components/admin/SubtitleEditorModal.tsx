"use client";

import { useEffect, useState } from "react";
import { upload as uploadToBlob } from "@vercel/blob/client";

type SubtitleTrack = { label: string; src: string; lang: string };

type Props = {
  track: SubtitleTrack;
  onSave: (newSrc: string) => void;
  onClose: () => void;
};

const base = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL || "";

export default function SubtitleEditorModal({ track, onSave, onClose }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fullUrl = track.src.startsWith("http")
      ? track.src
      : `${typeof window !== "undefined" ? window.location.origin : ""}${track.src.startsWith("/") ? "" : "/"}${track.src}`;
    setError(null);
    fetch(`${base}/api/subtitles?url=${encodeURIComponent(fullUrl)}`)
      .then((r) => {
        if (!r.ok) throw new Error("לא ניתן לטעון את קובץ הכתוביות");
        return r.text();
      })
      .then(setContent)
      .catch((e) => setError(e instanceof Error ? e.message : "שגיאה"))
      .finally(() => setLoading(false));
  }, [track.src]);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const file = new File([content], "subtitles.vtt", { type: "text/vtt" });
      const blob = await uploadToBlob(file.name, file, {
        access: "public",
        handleUploadUrl: `${base}/api/upload/blob`,
      });
      if (blob?.url) {
        onSave(blob.url);
        onClose();
      } else {
        setError("ההעלאה נכשלה");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה בהעלאה");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" role="dialog" aria-modal aria-labelledby="subtitle-editor-title">
      <div className="bg-flexliner-dark border border-white/20 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <h2 id="subtitle-editor-title" className="text-lg font-bold">
            עריכת קובץ כתוביות – {track.label}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded text-white/70 hover:text-white hover:bg-white/10"
            aria-label="סגור"
          >
            ✕
          </button>
        </div>
        <div className="p-4 flex-1 min-h-0 flex flex-col gap-2">
          {loading ? (
            <p className="text-white/60">טוען...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 min-h-[200px] w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white font-mono text-sm resize-none"
              dir="ltr"
              spellCheck={false}
            />
          )}
        </div>
        <div className="p-4 border-t border-white/10 flex gap-2 justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saving || !content.trim()}
            className="px-4 py-2 bg-flexliner-red rounded font-medium hover:bg-flexliner-red/90 disabled:opacity-50"
          >
            {saving ? "שומר ומעלה..." : "שמור והעלה קובץ חדש"}
          </button>
        </div>
      </div>
    </div>
  );
}
