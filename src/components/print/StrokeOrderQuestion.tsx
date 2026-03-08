import { useEffect, useState } from 'react';
import type { GridStyle, Question } from '../../types';
import { fetchKanjiVGSvg } from '../../utils/kanjiVG';
import { WritingCell } from '../WritingGrid';

interface Props {
  question: Question;
  questionNumber: number;
  cellSize: number;
  practiceCount: number;
  gridStyle: GridStyle;
}

export function StrokeOrderQuestion({
  question,
  questionNumber,
  cellSize,
  practiceCount,
  gridStyle,
}: Props) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const kanji = question.kanji.char;

  useEffect(() => {
    let mounted = true;

    async function loadSvg() {
      setIsLoading(true);
      const svg = await fetchKanjiVGSvg(kanji);
      if (mounted) {
        setSvgContent(svg);
        setIsLoading(false);
      }
    }

    loadSvg();

    return () => {
      mounted = false;
    };
  }, [kanji]);

  // SVGを処理して表示用に調整
  const processedSvg = svgContent
    ? (() => {
        // SVG要素だけを抽出（XML宣言、DOCTYPE、コメントを除去）
        const svgMatch = svgContent.match(/<svg[\s\S]*<\/svg>/);
        if (!svgMatch) return null;

        let svg = svgMatch[0]
          // width/heightを削除してviewBoxだけで制御
          .replace(/\s+width="[^"]*"/g, '')
          .replace(/\s+height="[^"]*"/g, '')
          // 番号のテキストを見やすくする（赤色に）
          .replace(/fill="#808080"/g, 'fill="#dc2626"')
          .replace(/font-size:\s*8;?/g, 'font-size:12;');

        // viewBoxがない場合は追加
        if (!svg.includes('viewBox')) {
          svg = svg.replace('<svg', '<svg viewBox="0 0 109 109"');
        }

        return svg;
      })()
    : null;

  return (
    <div className="flex items-center gap-3 mb-3 avoid-break">
      {/* 問題番号 */}
      <div className="w-6 text-sm text-gray-600 shrink-0">{questionNumber}.</div>

      {/* 書き順付き漢字（KanjiVG SVG） */}
      <div
        className="border border-gray-800 shrink-0 relative overflow-hidden"
        style={{
          width: `${cellSize}mm`,
          height: `${cellSize}mm`,
        }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
            ...
          </div>
        ) : processedSvg ? (
          <div
            className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG描画に必要（DOMPurifyでサニタイズ済み）
            dangerouslySetInnerHTML={{ __html: processedSvg }}
          />
        ) : (
          // フォールバック: SVGが取得できない場合は通常の漢字表示
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-textbook"
            style={{
              fontSize: `${cellSize * 0.7}mm`,
              lineHeight: 1,
            }}
          >
            {kanji}
          </span>
        )}
      </div>

      {/* 画数・読み・例語 */}
      <div
        className="shrink-0 flex flex-col justify-center text-gray-500"
        style={{ fontSize: `${cellSize * 0.3}mm`, lineHeight: 1.4 }}
      >
        <div>
          ({question.kanji.strokeCount}画)
          {question.kanji.readings.on.length > 0 && (
            <span className="ml-1">音:{question.kanji.readings.on[0]}</span>
          )}
          {question.kanji.readings.kun.length > 0 && (
            <span className="ml-1">訓:{question.kanji.readings.kun[0]}</span>
          )}
        </div>
        {question.example && (
          <div>
            例:
            <ruby>
              {question.example.word}
              <rp>(</rp>
              <rt style={{ fontSize: `${cellSize * 0.2}mm` }}>{question.example.reading}</rt>
              <rp>)</rp>
            </ruby>
          </div>
        )}
      </div>

      {/* 練習マス */}
      <div className="flex gap-0.5">
        {Array.from({ length: practiceCount }).map((_, i) => (
          <WritingCell key={i} size={cellSize} gridStyle={gridStyle} />
        ))}
      </div>
    </div>
  );
}
