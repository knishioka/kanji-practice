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
      {/* 漢字セル + ふりがな */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="border border-gray-800 font-textbook relative"
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
        <span
          className="text-gray-500"
          style={{ fontSize: `${cellSize * 0.3}mm`, lineHeight: 1.2 }}
        >
          {question.reading}
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
      {/* 例語（ふりがな付き） */}
      {question.example && (
        <span
          className="text-gray-500 font-textbook ml-2"
          style={{ fontSize: `${cellSize * 0.35}mm` }}
        >
          例:
          <ruby>
            {question.example.word}
            <rp>(</rp>
            <rt className="text-gray-400">{question.example.reading}</rt>
            <rp>)</rp>
          </ruby>
        </span>
      )}
    </div>
  );
}
