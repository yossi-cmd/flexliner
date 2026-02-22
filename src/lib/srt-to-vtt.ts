/**
 * Converts SRT subtitle content to WebVTT.
 * SRT: numeric index, then "HH:MM:SS,mmm --> HH:MM:SS,mmm", then lines. Comma for ms.
 * VTT: optional "WEBVTT" header, then "HH:MM:SS.mmm --> HH:MM:SS.mmm", then lines. Dot for ms.
 */
export function srtToVtt(srt: string): string {
  const lines = srt.trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const out: string[] = ["WEBVTT", ""];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    // Skip numeric index line (SRT cue identifier)
    if (/^\d+$/.test(line.trim())) {
      i++;
      if (i >= lines.length) break;
    }
    const timeLine = lines[i];
    // Match SRT time: 00:00:00,000 --> 00:00:00,000
    const match = timeLine.match(/^(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (match) {
      const start = match[1].replace(",", ".");
      const end = match[2].replace(",", ".");
      out.push(`${start} --> ${end}`);
      i++;
      const textLines: string[] = [];
      while (i < lines.length && lines[i].trim()) {
        textLines.push(lines[i]);
        i++;
      }
      out.push(textLines.join("\n"), "");
    } else {
      i++;
    }
  }

  return out.join("\n").trim();
}

export function isSrtContent(content: string): boolean {
  const trimmed = content.trim();
  // SRT typically has a numeric line then timecode with comma (e.g. 00:00:00,000)
  return /^\d+\s*\n?\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/m.test(trimmed)
    || /^\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/m.test(trimmed);
}

/** Hebrew (U+0590–U+05FF) and Arabic (U+0600–U+06FF) */
const RTL_RANGE = /[\u0590-\u05FF\u0600-\u06FF]/;
const RLE = "\u202B"; // RIGHT-TO-LEFT EMBEDDING
const PDF = "\u202C"; // POP DIRECTIONAL FORMATTING

/** VTT cue timing line (e.g. 00:00:00.000 --> 00:00:00.000) */
const VTT_TIMING = /^\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}/;

/**
 * If the VTT content contains RTL characters (Hebrew/Arabic), wraps each cue
 * payload line with Unicode RLE+PDF so the browser always renders them RTL
 * and punctuation/numbers don't flip direction.
 */
export function applyRtlToVtt(vtt: string): string {
  if (!RTL_RANGE.test(vtt)) return vtt;

  const lines = vtt.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (VTT_TIMING.test(line.trim())) {
      out.push(line);
      i++;
      while (i < lines.length && lines[i].trim() !== "") {
        out.push(RLE + lines[i] + PDF);
        i++;
      }
      if (i < lines.length) out.push(lines[i]); // blank line
      i++;
    } else {
      out.push(line);
      i++;
    }
  }

  return out.join("\n");
}
