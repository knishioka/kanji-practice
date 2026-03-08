import { allKanji } from '../data/kanji';

// ふりがなグループ: 開始位置・文字数・読みのセット
export interface FuriganaGroup {
  start: number;
  length: number;
  reading: string;
}

// 漢字→Kanjiデータのルックアップ（モジュールスコープで1回だけ構築）
const kanjiLookup = new Map(allKanji.map((k) => [k.char, k]));

// 全例語から単語→読みマップを構築（例: "交通" → "こうつう"）
const wordReadingMap = new Map<string, string>();
for (const kanji of allKanji) {
  for (const ex of [...kanji.examples, ...(kanji.okuriganaExamples ?? [])]) {
    if (!wordReadingMap.has(ex.word)) {
      wordReadingMap.set(ex.word, ex.reading);
    }
  }
}
// 長い単語から先にマッチさせるためソート済み配列を用意
const sortedWords = [...wordReadingMap.keys()].sort((a, b) => b.length - a.length);

// 漢字かどうか判定（CJK統合漢字）
export function isKanjiChar(char: string): boolean {
  const code = char.codePointAt(0) ?? 0;
  return (code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf);
}

// カタカナをひらがなに変換
function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

/**
 * 単語の読みからひらがな接頭辞・送りがな部分を除去して漢字部分の読みだけを返す
 * 例: "数える"("かぞえる") → "かぞ"（送りがな "える" を除去）
 * 例: "お寺"("おてら") → "てら"（接頭辞 "お" を除去）
 * 例: "交通"("こうつう") → "こうつう"（送りがななし）
 */
function getKanjiReading(wordChars: string[], reading: string): string {
  // 単語先頭のひらがな部分（接頭辞）を特定
  let kanaPrefix = '';
  for (let i = 0; i < wordChars.length; i++) {
    if (!isKanjiChar(wordChars[i])) {
      kanaPrefix += wordChars[i];
    } else {
      break;
    }
  }

  // 単語末尾のひらがな部分（送りがな）を特定
  let kanaSuffix = '';
  for (let i = wordChars.length - 1; i >= 0; i--) {
    if (!isKanjiChar(wordChars[i])) {
      kanaSuffix = wordChars[i] + kanaSuffix;
    } else {
      break;
    }
  }

  let result = reading;
  // 読みから接頭辞部分を除去
  if (kanaPrefix && result.startsWith(kanaPrefix)) {
    result = result.slice(kanaPrefix.length);
  }
  // 読みから送りがな部分を除去
  if (kanaSuffix && result.endsWith(kanaSuffix)) {
    result = result.slice(0, -kanaSuffix.length);
  }
  return result;
}

type Segment = { type: 'kanji'; indices: number[] } | { type: 'kana'; chars: string };

/**
 * 非連続漢字を含む単語の読みを、間のひらがなで区切って各漢字グループに分配する
 * 例: "買い物"("かいもの") → [{start:0, reading:"か"}, {start:2, reading:"もの"}]
 * 例: "女の子"("おんなのこ") → [{start:0, reading:"おんな"}, {start:2, reading:"こ"}]
 */
function splitReadingForNonContiguous(
  wordChars: string[],
  wordPositions: number[],
  reading: string,
): FuriganaGroup[] | null {
  // 接頭辞・接尾辞のかなを除去した読みを使う
  const kanjiReading = getKanjiReading(wordChars, reading);

  // 単語を「漢字グループ」と「かなグループ」のセグメントに分割
  // 接頭辞・接尾辞のかなは除外して、間のかなのみ対象
  let startIdx = 0;
  while (startIdx < wordChars.length && !isKanjiChar(wordChars[startIdx])) startIdx++;
  let endIdx = wordChars.length - 1;
  while (endIdx >= 0 && !isKanjiChar(wordChars[endIdx])) endIdx--;

  const segments: Segment[] = [];
  let i = startIdx;
  while (i <= endIdx) {
    if (isKanjiChar(wordChars[i])) {
      const indices: number[] = [];
      while (i <= endIdx && isKanjiChar(wordChars[i])) {
        indices.push(i);
        i++;
      }
      segments.push({ type: 'kanji', indices });
    } else {
      let chars = '';
      while (i <= endIdx && !isKanjiChar(wordChars[i])) {
        chars += wordChars[i];
        i++;
      }
      segments.push({ type: 'kana', chars });
    }
  }

  // かなセグメントが無い場合（全て連続漢字）は分割不要
  const kanaSegments = segments.filter((s): s is Segment & { type: 'kana' } => s.type === 'kana');
  if (kanaSegments.length === 0) return null;

  // 読みの中からかなセグメントを順に探して分割
  const groups: FuriganaGroup[] = [];
  let readingPos = 0;

  for (let s = 0; s < segments.length; s++) {
    const seg = segments[s];
    if (seg.type === 'kana') {
      // かな部分を読みの中から探してスキップ
      const kanaPos = kanjiReading.indexOf(seg.chars, readingPos);
      if (kanaPos === -1) return null; // 分割失敗
      readingPos = kanaPos + seg.chars.length;
    } else {
      // 漢字セグメント: 次のかなセグメントまでの読みを割り当てる
      const nextKanaIdx = segments.findIndex((ns, ni) => ni > s && ns.type === 'kana');
      let kanjiPartReading: string;
      if (nextKanaIdx === -1) {
        // 最後の漢字セグメント: 残りの読みを全て割り当て
        kanjiPartReading = kanjiReading.slice(readingPos);
      } else {
        const nextKana = segments[nextKanaIdx] as Segment & { type: 'kana' };
        const nextKanaPos = kanjiReading.indexOf(nextKana.chars, readingPos);
        if (nextKanaPos === -1) return null;
        kanjiPartReading = kanjiReading.slice(readingPos, nextKanaPos);
      }

      if (kanjiPartReading) {
        const firstIdx = seg.indices[0];
        const lastIdx = seg.indices[seg.indices.length - 1];
        groups.push({
          start: wordPositions[firstIdx],
          length: lastIdx - firstIdx + 1,
          reading: kanjiPartReading,
        });
      }
    }
  }

  return groups.length > 0 ? groups : null;
}

/**
 * 例文中のふりがなグループを構築
 * 例語データを最長一致で検索し、単語単位でグループ化
 * 熟語は分割せず、複数セルにまたがるふりがなとして返す
 */
export function buildFuriganaGroups(sentence: string): FuriganaGroup[] {
  const chars = Array.from(sentence);
  const groups: FuriganaGroup[] = [];
  const assigned = new Set<number>();

  // 1. 例語データから最長一致で単語を探す
  for (const word of sortedWords) {
    const wordChars = Array.from(word);
    let searchFrom = 0;
    // biome-ignore lint/suspicious/noAssignInExpressions: indexOf loop pattern
    while ((searchFrom = sentence.indexOf(word, searchFrom)) !== -1) {
      const charIndex = Array.from(sentence.slice(0, searchFrom)).length;
      const wordPositions = Array.from({ length: wordChars.length }, (_, i) => charIndex + i);

      if (wordPositions.some((pos) => assigned.has(pos))) {
        searchFrom += word.length;
        continue;
      }

      const reading = wordReadingMap.get(word) ?? '';

      // 漢字部分の位置を取得
      const kanjiPositions = wordPositions.filter((pos) => isKanjiChar(chars[pos]));

      if (kanjiPositions.length > 0) {
        const firstKanji = kanjiPositions[0];
        const lastKanji = kanjiPositions[kanjiPositions.length - 1];
        const spanLength = lastKanji - firstKanji + 1;

        if (spanLength === kanjiPositions.length) {
          // 連続している場合: 1つのグループとして追加
          const kanjiReading = getKanjiReading(wordChars, reading);
          groups.push({
            start: firstKanji,
            length: spanLength,
            reading: kanjiReading,
          });
          for (const pos of wordPositions) assigned.add(pos);
        } else {
          // 非連続の場合（女の子、買い物等）: 間のかなで読みを分割
          const splitGroups = splitReadingForNonContiguous(wordChars, wordPositions, reading);
          if (splitGroups) {
            groups.push(...splitGroups);
            for (const pos of wordPositions) assigned.add(pos);
          }
          // 分割失敗時はassignedに追加しない → フォールバックで処理
        }
      } else {
        // 漢字を含まない単語はassignedに追加してスキップ
        for (const pos of wordPositions) assigned.add(pos);
      }
      searchFrom += word.length;
    }
  }

  // 2. 未割り当ての漢字は個別の代表読みでフォールバック
  for (let i = 0; i < chars.length; i++) {
    if (assigned.has(i)) continue;
    const char = chars[i];
    if (!isKanjiChar(char)) continue;
    const kanji = kanjiLookup.get(char);
    if (!kanji) continue;
    const reading = kanji.readings.kun[0] ?? kanji.readings.on[0];
    if (reading) {
      groups.push({
        start: i,
        length: 1,
        reading: katakanaToHiragana(reading),
      });
    }
  }

  return groups.sort((a, b) => a.start - b.start);
}
