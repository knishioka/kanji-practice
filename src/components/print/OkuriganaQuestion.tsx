import type { GridStyle, Question } from '../../types';
import { WritingCell } from '../WritingGrid';

interface Props {
  question: Question;
  questionNumber: number;
  cellSize: number;
  gridStyle: GridStyle;
  showHint: boolean;
  practiceCount: number;
}

export function OkuriganaQuestion({
  question,
  questionNumber,
  cellSize,
  gridStyle,
  showHint,
  practiceCount,
}: Props) {
  const okurigana = question.okuriganaQuestion;

  if (!okurigana) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 mb-3 avoid-break">
      {/* 問題番号 */}
      <div className="w-6 text-sm text-gray-600 shrink-0">{questionNumber}.</div>

      {/* 漢字（語幹）表示 */}
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
          {okurigana.stem}
        </span>
      </div>

      {/* 送りがな入力欄（practiceCount分のマスを表示） */}
      <div className="flex gap-0.5">
        {Array.from({ length: practiceCount }).map((_, i) => (
          <WritingCell key={i} size={cellSize * 0.7} gridStyle={gridStyle} />
        ))}
      </div>

      {/* ヒント（読み） */}
      {showHint && (
        <span className="text-gray-400 ml-2" style={{ fontSize: `${cellSize * 0.4}mm` }}>
          ({okurigana.hint})
        </span>
      )}
    </div>
  );
}
