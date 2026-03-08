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

// 読み書き統合モード: 1問で読みと書きを同時に練習
export function ReadingWritingQuestion({
  question,
  questionNumber,
  cellSize,
  practiceCount,
  gridStyle,
  showHint,
}: Props) {
  const optimalPracticeCount = calculateOptimalPracticeCount(cellSize, practiceCount);

  return (
    <div className="mb-3 avoid-break">
      {/* 上段: 読み問題 */}
      <div className="flex items-end gap-4 mb-1">
        <div className="w-5 text-sm text-gray-600 shrink-0 text-right">{questionNumber}.</div>
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

      {/* 下段: 書き問題 */}
      <div className="flex items-center gap-3 ml-5">
        <div className="w-5 shrink-0" />
        <div
          className="font-textbook shrink-0"
          style={{
            fontSize: `${cellSize * 0.45}mm`,
            width: `${cellSize * 2.5}mm`,
          }}
        >
          <ruby>
            {question.example?.word?.split('').map((char, ci) => (
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
    </div>
  );
}
