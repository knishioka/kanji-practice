import type { Question } from '../../types';
import { SentenceGrid } from '../WritingGrid';

interface Props {
  question: Question;
  questionNumber: number;
  cellSize: number;
  columnsPerRow: number;
}

export function SentenceQuestion({ question, questionNumber, cellSize, columnsPerRow }: Props) {
  return (
    <div className="mb-4 avoid-break">
      <div className="text-sm text-gray-600 mb-1">{questionNumber}.</div>
      <SentenceGrid
        sentence={question.sentence || ''}
        cellSize={cellSize}
        columnsPerRow={columnsPerRow}
      />
    </div>
  );
}
