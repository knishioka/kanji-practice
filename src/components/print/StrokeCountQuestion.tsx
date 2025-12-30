import type { Question } from '../../types';

interface Props {
  question: Question;
  questionNumber: number;
  cellSize: number;
}

export function StrokeCountQuestion({ question, questionNumber, cellSize }: Props) {
  return (
    <div className="flex items-center gap-4 mb-3 avoid-break">
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
      <span className="text-gray-500 mx-1">=</span>
      <div
        className="border-b-2 border-gray-400 text-center"
        style={{
          width: `${cellSize * 1.5}mm`,
          height: `${cellSize * 0.8}mm`,
        }}
      />
      <span className="text-gray-700" style={{ fontSize: `${cellSize * 0.5}mm` }}>
        画
      </span>
    </div>
  );
}
