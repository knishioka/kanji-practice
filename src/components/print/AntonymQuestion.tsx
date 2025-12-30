import type { Question } from '../../types';

interface Props {
  question: Question;
  questionNumber: number;
  cellSize: number;
}

export function AntonymQuestion({ question, questionNumber, cellSize }: Props) {
  const antonym = question.antonymQuestion;

  if (!antonym) {
    return null;
  }

  const typeLabel = antonym.type === 'antonym' ? '対義語' : '類義語';
  const typeSymbol = antonym.type === 'antonym' ? '⇔' : '≒';

  return (
    <div className="flex items-center gap-3 mb-3 avoid-break">
      {/* 問題番号 */}
      <div className="w-6 text-sm text-gray-600 shrink-0">{questionNumber}.</div>

      {/* タイプラベル */}
      <span className="text-gray-500 shrink-0" style={{ fontSize: `${cellSize * 0.35}mm` }}>
        【{typeLabel}】
      </span>

      {/* 出題漢字 */}
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
          {antonym.sourceKanji}
        </span>
      </div>

      {/* 矢印記号 */}
      <span className="text-gray-600 shrink-0" style={{ fontSize: `${cellSize * 0.5}mm` }}>
        {typeSymbol}
      </span>

      {/* 解答欄 */}
      <div
        className="border border-gray-800 bg-white shrink-0 relative"
        style={{
          width: `${cellSize}mm`,
          height: `${cellSize}mm`,
        }}
      >
        {/* 十字ガイド */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 -translate-x-1/2" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 -translate-y-1/2" />
      </div>
    </div>
  );
}
