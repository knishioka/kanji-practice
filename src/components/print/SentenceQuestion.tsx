import { useMemo } from 'react';
import type { GridStyle, Question } from '../../types';
import { buildFuriganaGroups } from '../../utils/furigana';
import { getSentencePlainText } from '../../utils/sentenceRuby';
import { SentenceGrid } from '../WritingGrid';

interface Props {
  question: Question;
  questionNumber: number;
  cellSize: number;
  columnsPerRow: number;
  gridStyle: GridStyle;
  // 同じ例文を縦に何回写すか（お手本1行 + 練習N行）
  practiceRows: number;
}

export function SentenceQuestion({
  question,
  questionNumber,
  cellSize,
  columnsPerRow,
  gridStyle,
  practiceRows,
}: Props) {
  const targetKanji = question.kanji.char;
  const rawSentence = question.sentence || '';

  const furiganaGroups = useMemo(() => buildFuriganaGroups(rawSentence), [rawSentence]);
  const sentence = useMemo(() => getSentencePlainText(rawSentence), [rawSentence]);

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
        practiceRows={practiceRows}
      />
    </div>
  );
}
