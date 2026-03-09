import { useMemo } from 'react';
import type { GridStyle, Question } from '../../types';
import { buildFuriganaGroups } from '../../utils/furigana';
import { SentenceGrid } from '../WritingGrid';

interface Props {
  question: Question;
  questionNumber: number;
  cellSize: number;
  columnsPerRow: number;
  gridStyle: GridStyle;
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
    <div className="mb-2 avoid-break">
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
