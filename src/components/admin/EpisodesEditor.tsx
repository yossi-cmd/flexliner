"use client";

import { useState, useEffect } from "react";
import UrlOrUploadInput from "@/components/UrlOrUploadInput";
import SubtitleEditorModal from "@/components/admin/SubtitleEditorModal";

type SubtitleTrack = { label: string; src: string; lang: string };

type Episode = {
  id: string;
  season: number;
  number: number;
  title: string;
  videoUrl: string;
  duration: number | null;
  subtitleTracks?: string | null;
};

type Props = {
  contentId: string;
  episodes: Episode[];
  onUpdate: () => void;
};

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

export default function EpisodesEditor({ contentId, episodes, onUpdate }: Props) {
  const [season, setSeason] = useState(1);
  const [number, setNumber] = useState(episodes.length ? Math.max(...episodes.map((e) => e.number)) + 1 : 1);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);

  const base = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL || "";

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) return;
    setSaving(true);
    fetch(`${base}/api/episodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentId,
        season,
        number,
        title: title.trim(),
        videoUrl: videoUrl.trim(),
        duration: duration ? parseInt(duration, 10) : null,
      }),
    })
      .then((r) => r.json())
      .then(() => {
        setTitle("");
        setVideoUrl("");
        setNumber((n) => n + 1);
        onUpdate();
      })
      .finally(() => setSaving(false));
  };

  const remove = (episodeId: string) => {
    if (!confirm("למחוק פרק?")) return;
    fetch(`${base}/api/episodes/${episodeId}`, { method: "DELETE" }).then(onUpdate);
  };

  return (
    <div>
      <form onSubmit={add} className="p-4 rounded bg-white/5 border border-white/10 mb-6 max-w-2xl">
        <h3 className="font-semibold mb-3">הוסף פרק</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="number"
            min={1}
            value={season}
            onChange={(e) => setSeason(parseInt(e.target.value, 10) || 1)}
            placeholder="עונה"
            className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
          />
          <input
            type="number"
            min={1}
            value={number}
            onChange={(e) => setNumber(parseInt(e.target.value, 10) || 1)}
            placeholder="מס' פרק"
            className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
          />
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="כותרת פרק"
          required
          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white mb-3"
        />
        <div className="mb-3">
          <UrlOrUploadInput
            value={videoUrl}
            onChange={setVideoUrl}
            placeholder="קישור וידאו או העלה קובץ"
            accept="video/*"
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
          />
        </div>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="משך (דקות)"
          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white mb-3"
        />
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-flexliner-red rounded font-medium disabled:opacity-50"
        >
          {saving ? "מוסיף..." : "הוסף פרק"}
        </button>
      </form>

      <ul className="space-y-2">
        {episodes
          .sort((a, b) => (a.season - b.season) || (a.number - b.number))
          .map((ep) => (
            <EpisodeRow
              key={ep.id}
              episode={ep}
              onRemove={() => remove(ep.id)}
              onUpdate={onUpdate}
              base={base}
            />
          ))}
      </ul>
    </div>
  );
}

function EpisodeRow({
  episode,
  onRemove,
  onUpdate,
  base,
}: {
  episode: Episode;
  onRemove: () => void;
  onUpdate: () => void;
  base: string;
}) {
  const [showSubs, setShowSubs] = useState(false);
  const [tracks, setTracks] = useState<SubtitleTrack[]>(() => parseSubtitleTracks(episode.subtitleTracks));
  const [saving, setSaving] = useState(false);
  const [editTrackIndex, setEditTrackIndex] = useState<number | null>(null);
  const [createTrackOpen, setCreateTrackOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newLang, setNewLang] = useState("");
  const [newSrc, setNewSrc] = useState("");

  useEffect(() => {
    if (showSubs) setTracks(parseSubtitleTracks(episode.subtitleTracks));
  }, [showSubs, episode.subtitleTracks]);

  const saveTracks = () => {
    setSaving(true);
    fetch(`${base}/api/episodes/${episode.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtitleTracks: tracks }),
    })
      .then(() => {
        setShowSubs(false);
        onUpdate();
      })
      .finally(() => setSaving(false));
  };

  return (
    <li className="p-3 rounded bg-white/5 border border-white/10 space-y-2">
      <div className="flex items-center justify-between">
        <span>
          עונה {episode.season} פרק {episode.number}: {episode.title}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowSubs((v) => !v)}
            className="text-white/70 hover:text-white text-sm"
          >
            כתוביות ({parseSubtitleTracks(episode.subtitleTracks).length})
          </button>
          <button onClick={onRemove} className="text-red-400 hover:underline text-sm">
            מחק
          </button>
        </div>
      </div>
      {showSubs && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <p className="text-white/60 text-xs mb-2">מסלולי כתוביות (VTT) – תווית, שפה, קישור</p>
          {tracks.map((t, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 mb-1 text-sm">
              <span>{t.label}</span>
              <span className="text-white/50">({t.lang})</span>
              <button
                type="button"
                onClick={() => setEditTrackIndex(i)}
                className="text-flexliner-red hover:underline"
              >
                ערוך קובץ
              </button>
              <button
                type="button"
                onClick={() => setTracks((p) => p.filter((_, j) => j !== i))}
                className="text-red-400 hover:underline"
              >
                הסר
              </button>
            </div>
          ))}
          {editTrackIndex !== null && tracks[editTrackIndex] && (
            <SubtitleEditorModal
              track={tracks[editTrackIndex]}
              videoUrl={episode.videoUrl}
              onSave={(newSrc) => {
                setTracks((p) =>
                  p.map((t, j) => (j === editTrackIndex ? { ...t, src: newSrc } : t))
                );
                setEditTrackIndex(null);
              }}
              onClose={() => setEditTrackIndex(null)}
            />
          )}
          {createTrackOpen && (
            <SubtitleEditorModal
              track={{ label: newLabel.trim() || "עברית", lang: newLang.trim() || "he", src: "" }}
              videoUrl={episode.videoUrl}
              onSave={(newSrc) => {
                setTracks((p) => [...p, { label: newLabel.trim() || "עברית", lang: newLang.trim() || "he", src: newSrc }]);
                setCreateTrackOpen(false);
              }}
              onClose={() => setCreateTrackOpen(false)}
            />
          )}
          <div className="flex flex-wrap gap-2 mb-2 items-end">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="תווית"
              className="bg-white/10 border rounded px-2 py-1 text-white text-sm w-24"
            />
            <input
              type="text"
              value={newLang}
              onChange={(e) => setNewLang(e.target.value)}
              placeholder="שפה (he/en)"
              className="bg-white/10 border rounded px-2 py-1 text-white text-sm w-20"
            />
            <div className="flex-1 min-w-[180px]">
              <UrlOrUploadInput
                value={newSrc}
                onChange={setNewSrc}
                placeholder="קישור .vtt / .srt או העלה קובץ"
                accept=".vtt,.srt,vtt,srt"
                className="bg-white/10 border rounded px-2 py-1 text-white text-sm w-full"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!newLabel.trim() || !newLang.trim() || !newSrc.trim()) return;
                setTracks((p) => [...p, { label: newLabel.trim(), lang: newLang.trim(), src: newSrc.trim() }]);
                setNewLabel("");
                setNewLang("");
                setNewSrc("");
              }}
              className="px-2 py-1 bg-white/20 rounded text-sm"
            >
              הוסף
            </button>
            <button
              type="button"
              onClick={() => setCreateTrackOpen(true)}
              className="px-2 py-1 bg-flexliner-red/80 hover:bg-flexliner-red rounded text-sm"
            >
              צור קובץ בעורך
            </button>
          </div>
          <button
            type="button"
            onClick={saveTracks}
            disabled={saving}
            className="px-3 py-1.5 bg-flexliner-red rounded text-sm disabled:opacity-50"
          >
            {saving ? "שומר..." : "שמור כתוביות"}
          </button>
        </div>
      )}
    </li>
  );
}
