"use client";

import { useEffect, useState, useRef } from "react";
import { upload as uploadToBlob } from "@vercel/blob/client";
import {
  parseVttToCues,
  cuesToVtt,
  formatSecToVtt,
  parseTimeToSec,
  type SubtitleCue,
} from "@/lib/vtt-cues";

type SubtitleTrack = { label: string; src: string; lang: string };

type Props = {
  track: SubtitleTrack;
  videoUrl?: string;
  onSave: (newSrc: string) => void;
  onClose: () => void;
};

const base = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL || "";

export default function SubtitleEditorModal({ track, videoUrl, onSave, onClose }: Props) {
  const [cues, setCues] = useState<SubtitleCue[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawMode, setRawMode] = useState(false);
  const [rawContent, setRawContent] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasVideo = !!videoUrl?.trim();

  const switchToRawMode = () => {
    setRawContent(cuesToVtt(cues));
    setRawMode(true);
  };

  const switchToCueMode = () => {
    try {
      setCues(parseVttToCues(rawContent));
      setRawMode(false);
    } catch {
      setError("לא ניתן לפרסר את התוכן");
    }
  };

  useEffect(() => {
    if (!track.src?.trim()) {
      setCues([]);
      setRawContent("WEBVTT\n\n");
      setError(null);
      setLoading(false);
      return;
    }
    const fullUrl = track.src.startsWith("http")
      ? track.src
      : `${typeof window !== "undefined" ? window.location.origin : ""}${track.src.startsWith("/") ? "" : "/"}${track.src}`;
    setError(null);
    fetch(`${base}/api/subtitles?url=${encodeURIComponent(fullUrl)}`)
      .then((r) => {
        if (!r.ok) throw new Error("לא ניתן לטעון את קובץ הכתוביות");
        return r.text();
      })
      .then((text) => {
        setRawContent(text);
        try {
          setCues(parseVttToCues(text));
        } catch {
          setCues([]);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "שגיאה"))
      .finally(() => setLoading(false));
  }, [track.src]);

  const seekTo = (sec: number) => {
    const v = videoRef.current;
    if (v) {
      v.currentTime = sec;
      v.play().catch(() => {});
    }
  };

  const setCueStartFromVideo = (index: number) => {
    const v = videoRef.current;
    if (!v) return;
    setCues((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], startSec: v.currentTime };
      return next;
    });
  };

  const setCueEndFromVideo = (index: number) => {
    const v = videoRef.current;
    if (!v) return;
    setCues((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], endSec: v.currentTime };
      return next;
    });
  };

  const updateCue = (index: number, patch: Partial<SubtitleCue>) => {
    setCues((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const addCue = () => {
    const lastEnd = cues.length ? cues[cues.length - 1].endSec : 0;
    setCues((prev) => [
      ...prev,
      { startSec: lastEnd, endSec: lastEnd + 3, text: "" },
    ]);
  };

  const removeCue = (index: number) => {
    setCues((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const content = rawMode ? rawContent : cuesToVtt(cues);
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

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
        <div className="bg-flexliner-dark border border-white/20 rounded-lg p-8">
          <p className="text-white/60">טוען כתוביות...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 overflow-auto"
      role="dialog"
      aria-modal
      aria-labelledby="subtitle-editor-title"
    >
      <div className="bg-flexliner-dark border border-white/20 rounded-lg w-full max-w-4xl max-h-[95vh] flex flex-col shadow-xl my-4">
        <div className="p-3 sm:p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <h2 id="subtitle-editor-title" className="text-lg font-bold">
            {track.src?.trim() ? "עריכת כתוביות" : "יצירת כתוביות מאפס"} – {track.label || "כתוביות"}
          </h2>
          <div className="flex items-center gap-2">
            {hasVideo && (
              <button
                type="button"
                onClick={rawMode ? switchToCueMode : switchToRawMode}
                className="text-sm px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              >
                {rawMode ? "ממשק קיו" : "עריכת טקסט"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded text-white/70 hover:text-white hover:bg-white/10"
              aria-label="סגור"
            >
              ✕
            </button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-2 bg-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {hasVideo && !rawMode && (
          <div className="p-3 sm:p-4 border-b border-white/10 flex-shrink-0">
            <p className="text-white/60 text-xs mb-2">תצוגה מקדימה – הזז לזמן הכתובית או השתמש ב״התחל/סיים מכאן״</p>
            <video
              ref={videoRef}
              key={videoUrl}
              src={videoUrl}
              controls
              className="w-full aspect-video max-h-[240px] rounded bg-black object-contain"
              playsInline
            />
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-auto p-3 sm:p-4">
          {rawMode ? (
            <textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              className="w-full min-h-[280px] bg-black/30 border border-white/20 rounded px-3 py-2 text-white font-mono text-sm resize-none"
              dir="ltr"
              spellCheck={false}
            />
          ) : (
            <div className="space-y-3">
              {cues.map((cue, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-white/60 text-xs w-16">התחלה</label>
                    <input
                      type="text"
                      value={formatSecToVtt(cue.startSec)}
                      onChange={(e) =>
                        updateCue(i, { startSec: parseTimeToSec(e.target.value) })
                      }
                      className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm font-mono w-28"
                      dir="ltr"
                    />
                    <label className="text-white/60 text-xs w-12">סיום</label>
                    <input
                      type="text"
                      value={formatSecToVtt(cue.endSec)}
                      onChange={(e) =>
                        updateCue(i, { endSec: parseTimeToSec(e.target.value) })
                      }
                      className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm font-mono w-28"
                      dir="ltr"
                    />
                    {hasVideo && (
                      <>
                        <button
                          type="button"
                          onClick={() => setCueStartFromVideo(i)}
                          className="text-xs px-2 py-1 rounded bg-white/15 hover:bg-white/25"
                        >
                          התחל מכאן
                        </button>
                        <button
                          type="button"
                          onClick={() => setCueEndFromVideo(i)}
                          className="text-xs px-2 py-1 rounded bg-white/15 hover:bg-white/25"
                        >
                          סיים מכאן
                        </button>
                        <button
                          type="button"
                          onClick={() => seekTo(cue.startSec)}
                          className="text-xs px-2 py-1 rounded bg-flexliner-red/80 hover:bg-flexliner-red"
                        >
                          עבור לכאן
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => removeCue(i)}
                      className="text-red-400 hover:text-red-300 text-xs mr-auto"
                    >
                      מחק
                    </button>
                  </div>
                  <input
                    type="text"
                    value={cue.text}
                    onChange={(e) => updateCue(i, { text: e.target.value })}
                    placeholder="טקסט הכתובית"
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/40"
                    dir="auto"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addCue}
                className="w-full py-3 rounded-lg border border-dashed border-white/30 text-white/70 hover:text-white hover:border-white/50 hover:bg-white/5"
              >
                + הוסף כתובית
              </button>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-white/10 flex gap-2 justify-end flex-shrink-0">
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
            disabled={saving}
            className="px-4 py-2 bg-flexliner-red rounded font-medium hover:bg-flexliner-red/90 disabled:opacity-50"
          >
            {saving ? "שומר ומעלה..." : track.src?.trim() ? "שמור והעלה קובץ חדש" : "צור והעלה קובץ"}
          </button>
        </div>
      </div>
    </div>
  );
}
