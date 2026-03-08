import { useMemo } from 'react';
import { allKanji } from '../../data/kanji';
import type { GridStyle, Question } from '../../types';
import { SentenceGrid } from '../WritingGrid';

interface Props {
  question: Question;
  questionNumber: number;
  cellSize: number;
  columnsPerRow: number;
  gridStyle: GridStyle;
}

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
  for (const example of kanji.examples) {
    if (!wordReadingMap.has(example.word)) {
      wordReadingMap.set(example.word, example.reading);
    }
  }
  // okuriganaExamplesも含める（例: "数える" → "かぞえる"）
  if (kanji.okuriganaExamples) {
    for (const oku of kanji.okuriganaExamples) {
      if (!wordReadingMap.has(oku.word)) {
        wordReadingMap.set(oku.word, oku.reading);
      }
    }
  }
}
// 長い単語から先にマッチさせるためソート済み配列を用意
const sortedWords = [...wordReadingMap.keys()].sort((a, b) => b.length - a.length);

// 漢字かどうか判定（CJK統合漢字）
function isKanjiChar(char: string): boolean {
  const code = char.codePointAt(0) ?? 0;
  return (code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf);
}

/**
 * 単語の読みから送りがな部分を除去して漢字部分の読みだけを返す
 * 例: "数える"("かぞえる") → "かぞ"（送りがな "える" を除去）
 * 例: "交通"("こうつう") → "こうつう"（送りがななし）
 */
function getKanjiReading(wordChars: string[], reading: string): string {
  // 単語末尾のひらがな部分（送りがな）を特定
  let kanaSuffix = '';
  for (let i = wordChars.length - 1; i >= 0; i--) {
    if (!isKanjiChar(wordChars[i])) {
      kanaSuffix = wordChars[i] + kanaSuffix;
    } else {
      break;
    }
  }
  // 読みから送りがな部分を除去
  if (kanaSuffix && reading.endsWith(kanaSuffix)) {
    return reading.slice(0, -kanaSuffix.length);
  }
  return reading;
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
      const kanjiReading = getKanjiReading(wordChars, reading);

      // 漢字部分の開始位置と長さを計算
      const kanjiPositions = wordPositions.filter((pos) => isKanjiChar(chars[pos]));
      if (kanjiPositions.length > 0) {
        const start = kanjiPositions[0];
        const length = kanjiPositions[kanjiPositions.length - 1] - start + 1;
        groups.push({ start, length, reading: kanjiReading });
      }

      for (const pos of wordPositions) assigned.add(pos);
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
      groups.push({ start: i, length: 1, reading });
    }
  }

  return groups.sort((a, b) => a.start - b.start);
}

export function SentenceQuestion({
  question,
  questionNumber,
  cellSize,
  columnsPerRow,
  gridStyle,
}: Props) {
  const targetKanji = question.kanji.char;
  const sentence = question.sentence || '';

  const furiganaGroups = useMemo(() => buildFuriganaGroups(sentence), [sentence]);

  return (
    <div className="mb-4 avoid-break">
      <div className="text-sm text-gray-600 mb-1">{questionNumber}.</div>
      <SentenceGrid
        sentence={sentence}
        cellSize={cellSize}
        columnsPerRow={columnsPerRow}
        targetKanji={targetKanji}
        furiganaGroups={furiganaGroups}
        gridStyle={gridStyle}
      />
    </div>
  );
}
