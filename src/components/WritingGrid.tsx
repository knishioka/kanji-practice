import { clsx } from 'clsx';
import type { GridStyle } from '../types';

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
}

export function SentenceGrid({ sentence, cellSize }: SentenceGridProps) {
  const chars = sentence.split('');

  return (
    <div className="mb-4">
      {/* お手本行 */}
      <div className="flex flex-wrap mb-2">
        {chars.map((char, i) => (
          <div
            key={i}
            className="border border-gray-300 font-textbook text-gray-700 relative"
            style={{
              width: `${cellSize}mm`,
              height: `${cellSize}mm`,
            }}
          >
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
        ))}
      </div>
      {/* 練習行 */}
      <div className="flex flex-wrap">
        {chars.map((_, i) => (
          <div
            key={i}
            className="border border-gray-800 bg-white relative"
            style={{
              width: `${cellSize}mm`,
              height: `${cellSize}mm`,
            }}
          >
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -translate-y-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
