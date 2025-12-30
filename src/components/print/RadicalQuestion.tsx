import type { Question } from '../../types';

interface Props {
  question: Question;
  questionNumber: number;
  cellSize: number;
}

export function RadicalQuestion({ question, questionNumber, cellSize }: Props) {
  const radical = question.radicalQuestion;

  if (!radical) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 mb-3 avoid-break">
      {/* 問題番号 */}
      <div className="w-6 text-sm text-gray-600 shrink-0">{questionNumber}.</div>

      {/* 漢字表示 */}
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
          {radical.targetKanji}
        </span>
      </div>

      {/* 矢印 */}
      <span className="text-gray-500 mx-1">→</span>

      {/* 部首欄 */}
      <div className="flex items-center gap-2">
        <span className="text-gray-700" style={{ fontSize: `${cellSize * 0.4}mm` }}>
          部首
        </span>
        <span className="text-gray-600">「</span>
        <div
          className="border-b-2 border-gray-400 text-center"
          style={{
            width: `${cellSize * 0.8}mm`,
            height: `${cellSize * 0.6}mm`,
          }}
        />
        <span className="text-gray-600">」</span>
      </div>

      {/* 部首名欄 */}
      <div className="flex items-center gap-1">
        <span className="text-gray-600">(</span>
        <div
          className="border-b-2 border-gray-400 text-center"
          style={{
            width: `${cellSize * 2}mm`,
            height: `${cellSize * 0.6}mm`,
          }}
        />
        <span className="text-gray-600">)</span>
      </div>
    </div>
  );
}
