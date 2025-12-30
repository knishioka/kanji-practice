import type { Question } from '../../types';

interface Props {
  question: Question;
  questionNumber: number;
  cellSize: number;
}

export function ReadingQuestion({ question, questionNumber, cellSize }: Props) {
  return (
    <div className="flex items-end gap-4 mb-2 avoid-break">
      <div className="w-6 text-sm text-gray-600 shrink-0">{questionNumber}.</div>
      <div
        className="border border-gray-800 font-textbook shrink-0 relative"
        style={{
          width: `${cellSize}mm`,
          height: `${cellSize}mm`,
        }}
      >
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            fontSize: `${cellSize * 0.7}mm`,
            lineHeight: 1,
          }}
        >
          {question.kanji.char}
        </span>
      </div>
      <div className="flex-1 border-b-2 border-gray-300 h-8 max-w-48">
        <span className="text-xs text-gray-400 ml-1">
          ({question.example?.word || question.kanji.char})
        </span>
      </div>
    </div>
  );
}
