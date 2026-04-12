// ふりがなグループ型は furigana.ts と同形を再定義（循環 import 回避のため自己完結）
export interface FuriganaGroup {
  start: number;
  length: number;
  reading: string;
}

export function isKanjiChar(char: string): boolean {
  const code = char.codePointAt(0) ?? 0;
  // 々 (U+3005, 漢字繰り返し記号) もルビ対象として許容
  if (code === 0x3005) return true;
  return (code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf);
}

const RUBY_PATTERN = /\{([^|{}]+)\|([^|{}]+)\}/g;
const HIRAGANA_ONLY = /^[\u3041-\u3096\u30FC]+$/;

export interface ParsedRubySentence {
  plain: string;
  groups: FuriganaGroup[];
}

/**
 * ルビ記法 `{漢字|よみ}` を含む例文をパースして、
 * プレーンテキストとふりがなグループに分解する。
 *
 * - 注釈が1つも無ければ null を返す（呼び出し側で従来ロジックへフォールバック）
 * - 注釈の漢字部分が漢字以外を含む / 読みがひらがな以外を含む場合はエラーを投げる
 *   （データ不正は CI/テストで早期検出する方針）
 */
export function parseRubySentence(annotated: string): ParsedRubySentence | null {
  if (!annotated.includes('{')) return null;

  let plain = '';
  const groups: FuriganaGroup[] = [];
  let lastIndex = 0;
  let plainCharCount = 0;
  let matched = false;

  RUBY_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: regex exec loop
  while ((match = RUBY_PATTERN.exec(annotated)) !== null) {
    matched = true;
    const [whole, kanji, reading] = match;

    const before = annotated.slice(lastIndex, match.index);
    plain += before;
    plainCharCount += Array.from(before).length;

    const kanjiChars = Array.from(kanji);
    if (!kanjiChars.every(isKanjiChar)) {
      throw new Error(`parseRubySentence: ルビ対象は漢字のみ。'${kanji}' in '${annotated}'`);
    }
    if (!HIRAGANA_ONLY.test(reading)) {
      throw new Error(`parseRubySentence: 読みはひらがなのみ。'${reading}' in '${annotated}'`);
    }

    groups.push({
      start: plainCharCount,
      length: kanjiChars.length,
      reading,
    });

    plain += kanji;
    plainCharCount += kanjiChars.length;
    lastIndex = match.index + whole.length;
  }

  if (!matched) return null;

  plain += annotated.slice(lastIndex);
  return { plain, groups };
}

/**
 * 例文の表示用プレーンテキストを取得（ルビ記法を取り除く）。
 * 注釈が無ければそのまま返す。
 */
export function getSentencePlainText(sentence: string): string {
  const parsed = parseRubySentence(sentence);
  return parsed?.plain ?? sentence;
}
