import type { GridStyle, Question } from '../../types';
import { calculateOptimalPracticeCount } from '../../utils/layout';
import { WritingRow } from '../WritingGrid';

interface Props {
  question: Question;
  questionNumber: number;
  cellSize: number;
  practiceCount: number;
  gridStyle: GridStyle;
  showHint: boolean;
}

export function WritingQuestion({
  question,
  questionNumber,
  cellSize,
  practiceCount,
  gridStyle,
  showHint,
}: Props) {
  const optimalPracticeCount = calculateOptimalPracticeCount(cellSize, practiceCount);

  return (
    <div className="flex items-center gap-3 mb-2 avoid-break">
      <div className="w-5 text-sm text-gray-600 shrink-0 text-right">{questionNumber}.</div>
      <div
        className="font-textbook shrink-0"
        style={{
          fontSize: `${cellSize * 0.55}mm`,
          width: `${cellSize * 2.5}mm`,
        }}
      >
        <ruby>
          {question.example?.word.split('').map((char, ci) => (
            <span key={ci}>
              {char === question.kanji.char ? (
                <span className="font-bold text-[1.1em]">□</span>
              ) : (
                char
              )}
            </span>
          ))}
          <rp>(</rp>
          <rt className="text-gray-500">{question.example?.reading}</rt>
          <rp>)</rp>
        </ruby>
      </div>
      <WritingRow
        example={showHint ? question.kanji.char : ''}
        practiceCount={optimalPracticeCount}
        size={cellSize}
        gridStyle={gridStyle}
      />
    </div>
  );
}
