import { allKanji } from '../data/kanji';
import type { Kanji } from '../types';
import { isKanjiChar, parseRubySentence } from './sentenceRuby';

/**
 * 写経モードの例文ルビ `{漢字|よみ}` のうち、
 * 「熟語を1文字ずつルビ付けした結果、熟語としての読みになっていない」候補を検出する。
 *
 * 例: `{汽|き}{笛|ふえ}` → 笛 単体の訓読み「ふえ」を熟語に流用しており、
 *     熟語としては「きてき」。未習漢字のかな置換と組み合わさると「汽ふえ」と表示される。
 *
 * 判定は 2 系統:
 *   1. example-mismatch: 隣接ルビが構成する語が例語辞書にあり、連結読みが一致しない（確定誤り）
 *   2. mixed-reading: 音読みと訓読みが混在する / どの読みにも由来しないルビ（要目視。
 *      麦茶・身分などの湯桶読み/重箱読みは正しいため allowlist で除外する）
 *
 * （検出ロジックは scripts/detectCompoundRubyErrors.ts と回帰テストで共有する）
 */

function katakanaToHiragana(str: string): string {
  return str.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

/** 連濁の濁点/半濁点を外して元の読みへ戻すための対応表 */
const SEQUENTIAL_VOICING: Record<string, string> = {
  が: 'か',
  ぎ: 'き',
  ぐ: 'く',
  げ: 'け',
  ご: 'こ',
  ざ: 'さ',
  じ: 'し',
  ず: 'す',
  ぜ: 'せ',
  ぞ: 'そ',
  だ: 'た',
  ぢ: 'ち',
  づ: 'つ',
  で: 'て',
  ど: 'と',
  ば: 'は',
  び: 'ひ',
  ぶ: 'ふ',
  べ: 'へ',
  ぼ: 'ほ',
  ぱ: 'は',
  ぴ: 'ひ',
  ぷ: 'ふ',
  ぺ: 'へ',
  ぽ: 'ほ',
};

/** 促音便で「っ」に変化しうる末尾かな（学期=がっき、実績=じっせき 等） */
const SOKUON_SOURCES = 'ついちくきつん';

/**
 * 熟語内で現れうる音変化（連濁・促音便）を戻した読み候補を返す。
 */
function readingVariants(reading: string): string[] {
  const variants = new Set([reading]);
  const unvoicedHead = SEQUENTIAL_VOICING[reading[0]];
  if (unvoicedHead) variants.add(unvoicedHead + reading.slice(1));
  for (const variant of [...variants]) {
    if (!variant.endsWith('っ')) continue;
    for (const tail of SOKUON_SOURCES) variants.add(`${variant.slice(0, -1)}${tail}`);
  }
  return [...variants];
}

type ReadingKind = 'on' | 'kun' | 'kun-stem' | 'compound' | 'unknown';

/**
 * 単一漢字のルビが音読み由来か訓読み由来かを判定する。
 * 語幹だけの一致（食べる=た 等）は kun-stem として区別する。
 * 語幹読みは送りがなが続く位置でのみ妥当で、熟語の途中にあれば誤りの可能性が高い。
 */
function classifyReading(kanji: Kanji | undefined, reading: string): ReadingKind {
  if (!kanji) return 'unknown';
  const on = kanji.readings.on.map(katakanaToHiragana);
  const kun = kanji.readings.kun.map(katakanaToHiragana);
  const variants = readingVariants(reading);
  if (variants.some((variant) => on.includes(variant))) return 'on';
  if (variants.some((variant) => kun.includes(variant))) return 'kun';
  if (variants.some((variant) => kun.some((candidate) => candidate.startsWith(variant))))
    return 'kun-stem';
  if (variants.some((variant) => on.some((candidate) => candidate.startsWith(variant))))
    return 'on';
  return 'unknown';
}

/**
 * 全漢字の例語・送りがな例から「語 → 読みの集合」の辞書を作る。
 */
function createWordReadings(kanjiList: Kanji[]): Map<string, Set<string>> {
  const wordReadings = new Map<string, Set<string>>();
  const add = (word: string, reading: string) => {
    const readings = wordReadings.get(word) ?? new Set<string>();
    readings.add(katakanaToHiragana(reading));
    wordReadings.set(word, readings);
  };
  for (const kanji of kanjiList) {
    for (const example of kanji.examples) add(example.word, example.reading);
    for (const okurigana of kanji.okuriganaExamples ?? []) add(okurigana.word, okurigana.reading);
  }
  return wordReadings;
}

export interface CompoundRubyIssue {
  kind: 'example-mismatch' | 'mixed-reading';
  grade: number;
  /** 隣接ルビが構成する語 */
  word: string;
  /** ルビを連結した読み */
  reading: string;
  /** 例語辞書に登録されている読み（example-mismatch のみ） */
  expected?: string[];
  sentence: string;
  /** allowlist 用シグネチャ: `語=読み` */
  signature: string;
}

/**
 * 全例文を走査し、熟語ルビの読みが熟語として成立していない候補を返す。
 */
export function detectCompoundRubyIssues(kanjiList: Kanji[] = allKanji): CompoundRubyIssue[] {
  const lookup = new Map(allKanji.map((kanji) => [kanji.char, kanji]));
  const wordReadings = createWordReadings(allKanji);
  const issues: CompoundRubyIssue[] = [];

  for (const kanji of kanjiList) {
    for (const sentence of kanji.sentences) {
      const parsed = parseRubySentence(sentence);
      if (!parsed) continue;
      const chars = Array.from(parsed.plain);

      let index = 0;
      while (index < parsed.groups.length) {
        // ルビ同士が隙間なく連続する範囲を 1 つの熟語とみなす
        let end = index;
        while (
          end + 1 < parsed.groups.length &&
          parsed.groups[end].start + parsed.groups[end].length === parsed.groups[end + 1].start
        ) {
          end++;
        }
        const run = parsed.groups.slice(index, end + 1);
        index = end + 1;
        if (run.length < 2) continue;

        const word = run
          .map((group) => chars.slice(group.start, group.start + group.length).join(''))
          .join('');
        const reading = run.map((group) => group.reading).join('');
        const signature = `${word}=${reading}`;

        const known = wordReadings.get(word);
        if (known && !known.has(reading)) {
          issues.push({
            kind: 'example-mismatch',
            grade: kanji.grade,
            word,
            reading,
            expected: [...known],
            sentence,
            signature,
          });
          continue;
        }

        const kinds: ReadingKind[] = run.map((group) => {
          const text = chars.slice(group.start, group.start + group.length).join('');
          if (text.length !== 1 || !isKanjiChar(text)) return 'compound';
          return classifyReading(lookup.get(text), group.reading);
        });
        const hasOn = kinds.includes('on');
        const hasKun = kinds.includes('kun') || kinds.includes('kun-stem');
        // 語幹読みは末尾（直後に送りがなが来る位置）以外では熟語の読みになりえない。
        const hasMisplacedStem = kinds.slice(0, -1).includes('kun-stem');
        if ((hasOn && hasKun) || kinds.includes('unknown') || hasMisplacedStem) {
          issues.push({
            kind: 'mixed-reading',
            grade: kanji.grade,
            word,
            reading,
            sentence,
            signature,
          });
        }
      }
    }
  }

  return issues;
}
