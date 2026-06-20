import { allKanji } from '../data/kanji';
import type { Kanji } from '../types';
import { isKanjiChar, parseRubySentence } from './sentenceRuby';

/**
 * 写経モードの例文ルビ `{漢字|よみ}` のうち、
 * 「単一漢字のルビ + 直後の送りがな」が漢字の読みと整合しない候補を検出する。
 *
 * 例: `{通|とお}う` → 通=とおる/とおす の語幹「とお」だが、送りがな「う」と繋ぐと
 *     「とおう」になり不正。正しくは 通う=かよう（語幹「かよ」）。
 *
 * 完全な活用解析は ichidan/godan を読みだけから判定できないため不可能なので、
 * 「明らかに不整合」なものを高めの精度で拾い、確定済みの正例は allowlist で除外する。
 * （検出ロジックは scripts/detectFuriganaErrors.ts と回帰テストで共有する）
 */

function katakanaToHiragana(str: string): string {
  return str.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

// 辞書形語尾 → 活用で現れうる送りがな先頭文字の集合（五段活用の行）。
// 「る」は五段（通る等）と一段/テ・タ形（似る→似て等）を兼ねるため寛容にしている。
const GODAN_ROWS: Record<string, string> = {
  う: 'わいうえおっ',
  く: 'かきくけこい',
  ぐ: 'がぎぐげごい',
  す: 'さしすせそ',
  つ: 'たちつてとっ',
  ぬ: 'なにぬねのん',
  ぶ: 'ばびぶべぼん',
  む: 'まみむめもん',
  る: 'らりるれろってたな',
};

// 音読みに後続しうる助詞・コピュラ・形容動詞語尾（音読み採用の妥当性判定用）。
// 例: 役に立つ(に) / 体育だ(だ) / 急な坂(な) / 標準的な(な)
const PARTICLE_HEADS = new Set([...'にへをがはもとのでやなだ']);
const SURU_SUFFIX = /^(する|し|じ|ず|さ|せ|す)/;

/**
 * 単一漢字 X（読み r）の直後に送りがな okurigana が続くとき、
 * r が X の読みとして妥当かを判定する。
 */
function isOkuriganaReadingValid(kanji: Kanji, r: string, okurigana: string): boolean {
  if (!okurigana) return true; // 送りがな無し → 対象外
  const head = okurigana[0];
  const onHira = kanji.readings.on.map(katakanaToHiragana);
  const kunHira = kanji.readings.kun.map(katakanaToHiragana);

  // 1. 音読みそのもの（漢語サ変・名詞＋助詞）。後続が助詞/サ変のときのみ妥当とみなす。
  if (onHira.includes(r) && (PARTICLE_HEADS.has(head) || SURU_SUFFIX.test(okurigana))) {
    return true;
  }

  // 2. 訓読みと完全一致（送りがなを持たない名詞読み。後続かなは別語/助詞）
  if (kunHira.includes(r)) return true;

  // 2b. r ＋ 送りがな先頭部分 が訓読みを完全再構成（後ろ=うし＋ろ、少し=すこ＋し 等）
  for (const K of kunHira) {
    if (K.length <= r.length || !K.startsWith(r)) continue;
    if (okurigana.startsWith(K.slice(r.length))) return true;
  }

  // 2c. 促音便（引っ越し=引＝ひ＋っ 等）: r が訓読みの語幹なら「っ」始まりを許容
  if (head === 'っ' && kunHira.some((k) => k.length > r.length && k.startsWith(r))) {
    return true;
  }

  // 3. 訓読みの語幹 r ＋ 活用整合
  const stems: { reading: string; okuri?: string }[] = kunHira.map((reading) => ({ reading }));
  for (const oku of kanji.okuriganaExamples ?? []) {
    stems.push({
      reading: katakanaToHiragana(oku.reading),
      okuri: oku.okurigana,
    });
  }
  for (const { reading: K } of stems) {
    if (!K.startsWith(r) || K.length === r.length) continue;
    const tail = K.slice(r.length);
    if (tail.length === 1) {
      if (tail === 'い') {
        // 形容詞: 早い/早く/早けれ/早かっ(た)
        if ('いくけ'.includes(head)) return true;
        if (head === 'か' && okurigana[1] === 'っ') return true;
        continue;
      }
      const row = GODAN_ROWS[tail];
      if (row?.includes(head)) return true;
    } else {
      // 一段/多字送りがな（覚える=おぼ＋える 等）: 表記送りがなは tail 先頭で始まる
      if (head === tail[0]) return true;
    }
  }
  return false;
}

export interface FuriganaIssue {
  grade: number;
  char: string;
  ruby: string;
  okurigana: string;
  sentence: string;
  kun: string[];
  /** allowlist 用シグネチャ: `漢字:ルビ:送りがな先頭` */
  signature: string;
}

/**
 * 全例文（または指定の漢字リスト）を走査し、送りがなと整合しないルビ候補を返す。
 */
export function detectFuriganaIssues(kanjiList: Kanji[] = allKanji): FuriganaIssue[] {
  const issues: FuriganaIssue[] = [];
  for (const kanji of kanjiList) {
    for (const sentence of kanji.sentences) {
      const parsed = parseRubySentence(sentence);
      if (!parsed) continue;
      const chars = Array.from(parsed.plain);
      for (const group of parsed.groups) {
        if (group.length !== 1) continue; // 単一漢字のみ
        const ch = chars[group.start];
        if (!isKanjiChar(ch)) continue;
        const target = allKanjiLookup.get(ch);
        if (!target) continue;

        // 直後の連続ひらがな（送りがな候補）
        let okurigana = '';
        for (let i = group.start + 1; i < chars.length; i++) {
          if (/[ぁ-ゖ]/.test(chars[i])) okurigana += chars[i];
          else break;
        }
        if (!okurigana) continue;

        if (isOkuriganaReadingValid(target, group.reading, okurigana)) continue;

        issues.push({
          grade: kanji.grade,
          char: ch,
          ruby: group.reading,
          okurigana,
          sentence,
          kun: target.readings.kun.map(katakanaToHiragana),
          signature: `${ch}:${group.reading}:${okurigana[0]}`,
        });
      }
    }
  }
  return issues;
}

const allKanjiLookup = new Map(allKanji.map((k) => [k.char, k]));
