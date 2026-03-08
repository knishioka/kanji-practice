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

// 例文中の漢字に対するふりがなマップを構築
function buildFuriganaMap(sentence: string): Map<string, string> {
  const map = new Map<string, string>();

  for (const char of sentence) {
    if (map.has(char)) continue;
    const kanji = kanjiLookup.get(char);
    if (!kanji) continue;
    // 訓読み優先（例文は訓読みが多い）、なければ音読み
    const reading = kanji.readings.kun[0] ?? kanji.readings.on[0];
    if (reading) {
      map.set(char, reading);
    }
  }

  return map;
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
