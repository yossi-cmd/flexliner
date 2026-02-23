/**
 * Parse and serialize VTT/SRT cue list for the subtitle editor.
 * Cue times stored as seconds for easy sync with video.currentTime.
 */

export type SubtitleCue = {
  startSec: number;
  endSec: number;
  text: string;
};

/** Strip Unicode RTL markers (RLE U+202B, PDF U+202C) so we store clean text and avoid double-wrapping on save */
function stripRtlMarkers(line: string): string {
  return line.replace(/\u202B/g, "").replace(/\u202C/g, "").trim();
}

/** Parse "00:00:01.000" or "00:01.500" to seconds */
export function parseTimeToSec(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  // HH:MM:SS.mmm or MM:SS.mmm or SS.mmm
  const parts = t.replace(",", ".").split(":");
  let sec = 0;
  if (parts.length === 3) {
    sec = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2] || "0");
  } else if (parts.length === 2) {
    sec = parseInt(parts[0], 10) * 60 + parseFloat(parts[1] || "0");
  } else if (parts.length === 1) {
    sec = parseFloat(parts[0] || "0");
  }
  return Number.isNaN(sec) ? 0 : Math.max(0, sec);
}

/** Format seconds to VTT time "00:00:00.000" */
export function formatSecToVtt(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const ms = Math.round((s - Math.floor(s)) * 1000);
  const ss = Math.floor(s);
  return [
    String(h).padStart(2, "0"),
    String(m).padStart(2, "0"),
    `${String(ss).padStart(2, "0")}.${String(ms).padStart(3, "0")}`,
  ].join(":");
}

/** Parse VTT or SRT content into cue list */
export function parseVttToCues(vtt: string): SubtitleCue[] {
  const lines = vtt.trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const cues: SubtitleCue[] = [];
  let i = 0;

  const timingRe = /^(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})/;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    // Skip cue identifier (numeric for SRT, or any single line before timing in VTT)
    if (/^\d+$/.test(line.trim())) {
      i++;
      if (i >= lines.length) break;
    }
    const timeLine = lines[i];
    const match = timeLine.match(timingRe);
    if (match) {
      const startSec = parseTimeToSec(match[1].replace(",", "."));
      const endSec = parseTimeToSec(match[2].replace(",", "."));
      i++;
      const textLines: string[] = [];
      while (i < lines.length && lines[i].trim()) {
        textLines.push(stripRtlMarkers(lines[i]));
        i++;
      }
      cues.push({
        startSec,
        endSec: endSec >= startSec ? endSec : startSec + 2,
        text: textLines.join("\n"),
      });
    } else {
      i++;
    }
  }

  return cues;
}

/** Serialize cue list to VTT (no RTL wrapping; applyRtlToVtt can be used on result if needed) */
export function cuesToVtt(cues: SubtitleCue[]): string {
  const out: string[] = ["WEBVTT", ""];
  for (const c of cues) {
    const start = formatSecToVtt(c.startSec);
    const end = formatSecToVtt(c.endSec);
    out.push(`${start} --> ${end}`);
    out.push(c.text.trim() || " ");
    out.push("");
  }
  return out.join("\n").trim();
}
