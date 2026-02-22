import iconv from "iconv-lite";

const HEBREW_RANGE = /[\u0590-\u05FF]/g;

function countHebrew(str: string): number {
  const m = str.match(HEBREW_RANGE);
  return m ? m.length : 0;
}

/** Decode subtitle buffer as UTF-8 or Windows-1255 (Hebrew); pick the decoding with more Hebrew letters. */
export function decodeSubtitleBuffer(buffer: Buffer): string {
  const asUtf8 = buffer.toString("utf-8");
  const asWin1255 = iconv.decode(buffer, "win1255");
  const hebrewUtf8 = countHebrew(asUtf8);
  const hebrewWin1255 = countHebrew(asWin1255);
  return hebrewWin1255 > hebrewUtf8 ? asWin1255 : asUtf8;
}
