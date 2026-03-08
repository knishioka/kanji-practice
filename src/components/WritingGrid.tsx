import { clsx } from 'clsx';
import type { GridStyle } from '../types';
import type { FuriganaGroup } from '../utils/furigana';

interface Props {
  char?: string;
  furigana?: string;
  size: number;
  gridStyle: GridStyle;
  isExample?: boolean;
  showFurigana?: boolean;
}

export function WritingCell({
  char,
  furigana,
  size,
  gridStyle,
  isExample = false,
  showFurigana = false,
}: Props) {
  return (
    <div
      className="relative border border-gray-800 bg-white font-textbook"
      style={{
        width: `${size}mm`,
        height: `${size}mm`,
      }}
    >
      {/* ガイドライン */}
      {gridStyle === 'cross' && (
        <>
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 -translate-x-1/2" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 -translate-y-1/2" />
        </>
      )}
      {gridStyle === 'dots' && (
        <>
          <div className="absolute left-1/4 top-1/4 w-1 h-1 rounded-full bg-gray-300" />
          <div className="absolute right-1/4 top-1/4 w-1 h-1 rounded-full bg-gray-300" />
          <div className="absolute left-1/4 bottom-1/4 w-1 h-1 rounded-full bg-gray-300" />
          <div className="absolute right-1/4 bottom-1/4 w-1 h-1 rounded-full bg-gray-300" />
        </>
      )}

      {/* ふりがな */}
      {showFurigana && furigana && (
        <span
          className="absolute -top-4 left-0 right-0 text-center text-gray-600"
          style={{ fontSize: `${size * 0.25}mm` }}
        >
          {furigana}
        </span>
      )}

      {/* 文字 - 絶対位置で中央配置 (html2canvas互換) */}
      {char && (
        <span
          className={clsx(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10',
            isExample ? 'text-gray-400' : 'text-black',
          )}
          style={{
            fontSize: `${size * 0.7}mm`,
            lineHeight: 1,
          }}
        >
          {char}
        </span>
      )}
    </div>
  );
}

interface GridRowProps {
  example: string;
  furigana?: string;
  practiceCount: number;
  size: number;
  gridStyle: GridStyle;
  showFurigana?: boolean;
}

export function WritingRow({
  example,
  furigana,
  practiceCount,
  size,
  gridStyle,
  showFurigana = false,
}: GridRowProps) {
  return (
    <div className="flex flex-wrap gap-0.5 items-end mb-1">
      {/* お手本 */}
      <WritingCell
        char={example}
        furigana={furigana}
        size={size}
        gridStyle={gridStyle}
        isExample
        showFurigana={showFurigana}
      />
      {/* 練習マス */}
      {Array.from({ length: practiceCount }).map((_, i) => (
        <WritingCell key={i} size={size} gridStyle={gridStyle} />
      ))}
    </div>
  );
}

interface SentenceGridProps {
  sentence: string;
  cellSize: number;
  columnsPerRow: number;
  targetKanji?: string;
  furiganaGroups?: FuriganaGroup[];
  gridStyle?: GridStyle;
}

export function SentenceGrid({
  sentence,
  cellSize,
  targetKanji,
  furiganaGroups,
  gridStyle = 'cross',
}: SentenceGridProps) {
  const chars = Array.from(sentence);
  const hasFurigana = furiganaGroups && furiganaGroups.length > 0;

  // グループの開始位置を引くためのマップ
  const groupByStart = new Map<number, FuriganaGroup>();
  if (furiganaGroups) {
    for (const g of furiganaGroups) {
      groupByStart.set(g.start, g);
    }
  }

  return (
    <div className="mb-4 avoid-break">
      {/* お手本行 */}
      <div
        className="flex flex-wrap mb-2"
        style={hasFurigana ? { paddingTop: `${cellSize * 0.3}mm` } : undefined}
      >
        {chars.map((char, i) => {
          const group = groupByStart.get(i);
          return (
            <div
              key={i}
              className="border border-gray-300 font-textbook text-gray-700 relative"
              style={{
                width: `${cellSize}mm`,
                height: `${cellSize}mm`,
              }}
            >
              {/* ふりがな（グループの開始位置にのみ表示、複数セル分の幅にまたがる） */}
              {group && (
                <span
                  className="absolute bottom-full left-0 text-center text-gray-600 whitespace-nowrap pointer-events-none"
                  style={{
                    fontSize: `${cellSize * 0.25}mm`,
                    width: `${cellSize * group.length}mm`,
                  }}
                >
                  {group.reading}
                </span>
              )}
              {/* 文字 - 絶対位置で中央配置 (html2canvas互換) */}
              <span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  fontSize: `${cellSize * 0.7}mm`,
                  lineHeight: 1,
                }}
              >
                {char}
              </span>
            </div>
          );
        })}
      </div>
      {/* 練習行 */}
      <div className="flex flex-wrap">
        {chars.map((char, i) => {
          const isBlank = targetKanji && char === targetKanji;
          return (
            <div
              key={i}
              className={clsx(
                'relative font-textbook',
                isBlank ? 'border border-gray-800 bg-white' : 'border border-gray-300',
              )}
              style={{
                width: `${cellSize}mm`,
                height: `${cellSize}mm`,
              }}
            >
              {isBlank ? (
                <>
                  {/* 書き取り用ガイドライン */}
                  {gridStyle === 'cross' && (
                    <>
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 -translate-x-1/2" />
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 -translate-y-1/2" />
                    </>
                  )}
                  {gridStyle === 'dots' && (
                    <>
                      <div className="absolute left-1/4 top-1/4 w-1 h-1 rounded-full bg-gray-300" />
                      <div className="absolute right-1/4 top-1/4 w-1 h-1 rounded-full bg-gray-300" />
                      <div className="absolute left-1/4 bottom-1/4 w-1 h-1 rounded-full bg-gray-300" />
                      <div className="absolute right-1/4 bottom-1/4 w-1 h-1 rounded-full bg-gray-300" />
                    </>
                  )}
                </>
              ) : (
                <span
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400"
                  style={{
                    fontSize: `${cellSize * 0.7}mm`,
                    lineHeight: 1,
                  }}
                >
                  {char}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
