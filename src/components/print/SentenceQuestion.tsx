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
}
// 長い単語から先にマッチさせるためソート済み配列を用意
const sortedWords = [...wordReadingMap.keys()].sort((a, b) => b.length - a.length);

// 漢字かどうか判定（CJK統合漢字）
function isKanjiChar(char: string): boolean {
  const code = char.codePointAt(0) ?? 0;
  return (code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf);
}

/**
 * 例文中の各文字位置にふりがなを割り当てるマップを構築
 * 例語データを最長一致で検索し、単語単位の正しい読みを割り当てる
 * 例: "交通安全。" → {0: "こう", 1: "つう", 2: "あん", 3: "ぜん"}
 */
function buildFuriganaMap(sentence: string): Map<number, string> {
  const chars = Array.from(sentence);
  const map = new Map<number, string>();
  const assigned = new Set<number>();

  // 1. 例語データから最長一致で単語を探してふりがなを割り当て
  for (const word of sortedWords) {
    const wordChars = Array.from(word);
    let searchFrom = 0;
    // biome-ignore lint/suspicious/noAssignInExpressions: indexOf loop pattern
    while ((searchFrom = sentence.indexOf(word, searchFrom)) !== -1) {
      // 文字インデックスに変換（サロゲートペア対応）
      const charIndex = Array.from(sentence.slice(0, searchFrom)).length;

      // 既に割り当て済みの位置と重複しないか確認
      const wordPositions = Array.from({ length: wordChars.length }, (_, i) => charIndex + i);
      if (wordPositions.some((pos) => assigned.has(pos))) {
        searchFrom += word.length;
        continue;
      }

      // 単語の読みを各文字に分配
      const reading = wordReadingMap.get(word) ?? '';
      distributeReading(wordChars, reading, charIndex, map);
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
      map.set(i, reading);
    }
  }

  return map;
}

/**
 * 単語の読みを各漢字に分配する
 * 送りがな（ひらがな部分）を除去して漢字部分に読みを割り当てる
 * 例: "引く"("ひく") → 引="ひ", く=skip
 * 例: "交通"("こうつう") → 交="こう", 通="つう"
 */
function distributeReading(
  wordChars: string[],
  reading: string,
  startIndex: number,
  map: Map<number, string>,
): void {
  // 単語中の漢字位置を特定
  const kanjiPositions: number[] = [];
  for (let i = 0; i < wordChars.length; i++) {
    if (isKanjiChar(wordChars[i])) {
      kanjiPositions.push(i);
    }
  }

  if (kanjiPositions.length === 0) return;

  // 漢字が1文字の場合: 送りがな部分を除いた読みを割り当て
  if (kanjiPositions.length === 1) {
    // 単語末尾のひらがな部分（送りがな）を読みから除去
    let kanaSuffix = '';
    for (let i = wordChars.length - 1; i >= 0; i--) {
      if (!isKanjiChar(wordChars[i])) {
        kanaSuffix = wordChars[i] + kanaSuffix;
      } else {
        break;
      }
    }
    let kanjiReading = reading;
    if (kanaSuffix && reading.endsWith(kanaSuffix)) {
      kanjiReading = reading.slice(0, -kanaSuffix.length);
    }
    map.set(startIndex + kanjiPositions[0], kanjiReading);
    return;
  }

  // 漢字が複数の場合: 均等分割（熟語は大体均等な音節数）
  // 送りがな部分を除去
  let pureReading = reading;
  let kanaEnd = '';
  for (let i = wordChars.length - 1; i >= 0; i--) {
    if (!isKanjiChar(wordChars[i])) {
      kanaEnd = wordChars[i] + kanaEnd;
    } else {
      break;
    }
  }
  if (kanaEnd && pureReading.endsWith(kanaEnd)) {
    pureReading = pureReading.slice(0, -kanaEnd.length);
  }

  const pureReadingChars = Array.from(pureReading);
  const chunkSize = Math.ceil(pureReadingChars.length / kanjiPositions.length);

  for (let i = 0; i < kanjiPositions.length; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, pureReadingChars.length);
    const charReading = pureReadingChars.slice(start, end).join('');
    if (charReading) {
      map.set(startIndex + kanjiPositions[i], charReading);
    }
  }
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

  const furiganaMap = useMemo(() => buildFuriganaMap(sentence), [sentence]);

  return (
    <div className="mb-4 avoid-break">
      <div className="text-sm text-gray-600 mb-1">{questionNumber}.</div>
      <SentenceGrid
        sentence={sentence}
        cellSize={cellSize}
        columnsPerRow={columnsPerRow}
        targetKanji={targetKanji}
        furiganaMap={furiganaMap}
        gridStyle={gridStyle}
      />
    </div>
  );
}
