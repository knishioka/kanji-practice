/**
 * KanjiVG SVG取得ユーティリティ
 *
 * KanjiVG Project: https://kanjivg.tagaini.net/
 * License: Creative Commons Attribution-Share Alike 3.0
 * https://creativecommons.org/licenses/by-sa/3.0/
 */

const KANJIVG_BASE_URL = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji';

// SVGキャッシュ
const svgCache = new Map<string, string>();

/**
 * 漢字のUnicodeコードポイントを5桁の16進数文字列に変換
 */
export function kanjiToCodePoint(kanji: string): string {
  const codePoint = kanji.codePointAt(0);
  if (!codePoint) return '';
  return codePoint.toString(16).padStart(5, '0');
}

/**
 * KanjiVGのSVG URLを生成
 */
export function getKanjiVGUrl(kanji: string): string {
  const codePoint = kanjiToCodePoint(kanji);
  return `${KANJIVG_BASE_URL}/${codePoint}.svg`;
}

/**
 * KanjiVGからSVGを取得（キャッシュ付き）
 */
export async function fetchKanjiVGSvg(kanji: string): Promise<string | null> {
  const cacheKey = kanji;

  if (svgCache.has(cacheKey)) {
    return svgCache.get(cacheKey)!;
  }

  try {
    const url = getKanjiVGUrl(kanji);
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`KanjiVG SVG not found for: ${kanji}`);
      return null;
    }

    const svgText = await response.text();
    svgCache.set(cacheKey, svgText);
    return svgText;
  } catch (error) {
    console.error(`Error fetching KanjiVG SVG for ${kanji}:`, error);
    return null;
  }
}

/**
 * 複数の漢字のSVGを一括取得
 */
export async function fetchMultipleKanjiVGSvgs(kanjiList: string[]): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  await Promise.all(
    kanjiList.map(async (kanji) => {
      const svg = await fetchKanjiVGSvg(kanji);
      if (svg) {
        results.set(kanji, svg);
      }
    }),
  );

  return results;
}

/**
 * SVGから画数を抽出
 */
export function extractStrokeCount(svgText: string): number {
  const matches = svgText.match(/id="kvg:[0-9a-f]+-s(\d+)"/g);
  if (!matches) return 0;
  return matches.length;
}

/**
 * KanjiVGのライセンス表記
 */
export const KANJIVG_LICENSE = {
  name: 'KanjiVG',
  url: 'https://kanjivg.tagaini.net/',
  license: 'CC BY-SA 3.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
};
