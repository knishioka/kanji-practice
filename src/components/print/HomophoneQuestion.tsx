import type { Question } from '../../types';

interface Props {
  question: Question;
  questionNumber: number;
  cellSize: number;
}

export function HomophoneQuestion({ question, questionNumber, cellSize }: Props) {
  const homophone = question.homophoneQuestion;

  if (!homophone) {
    return null;
  }

  // セルサイズに応じたスケーリング係数
  const scale = cellSize / 15; // 基準サイズ15mmでscale=1

  return (
    <div className="avoid-break" style={{ marginBottom: `${cellSize * 0.3}mm` }}>
      {/* 読み見出し */}
      <div
        className="flex items-center"
        style={{
          gap: `${2 * scale}mm`,
          marginBottom: `${cellSize * 0.15}mm`,
        }}
      >
        <span className="text-gray-600 shrink-0" style={{ fontSize: `${cellSize * 0.4}mm` }}>
          {questionNumber}.
        </span>
        <span
          className="font-bold bg-gray-100 rounded"
          style={{
            fontSize: `${cellSize * 0.55}mm`,
            padding: `${cellSize * 0.1}mm ${cellSize * 0.15}mm`,
          }}
        >
          【{homophone.reading}】
        </span>
      </div>

      {/* 各漢字の文脈問題 */}
      <div style={{ marginLeft: `${cellSize * 0.5}mm` }}>
        {homophone.options.map((option, index) => (
          <div
            key={index}
            className="flex items-center"
            style={{
              gap: `${1.5 * scale}mm`,
              marginBottom: `${cellSize * 0.08}mm`,
            }}
          >
            <span
              className="text-gray-500 shrink-0"
              style={{
                fontSize: `${cellSize * 0.35}mm`,
                width: `${cellSize * 0.4}mm`,
              }}
            >
              {index + 1})
            </span>
            <span style={{ fontSize: `${cellSize * 0.45}mm` }}>
              {renderContextWithBlank(option.context, option.kanji, cellSize)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 文脈の中で対象漢字を空欄（___）に置き換えて表示
 */
function renderContextWithBlank(context: string, kanji: string, cellSize: number) {
  // 文脈内に漢字が含まれている場合、空欄に置き換え
  if (context.includes(kanji)) {
    const parts = context.split(kanji);
    return (
      <>
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span
                className="inline-block border-b-2 border-gray-400 mx-0.5 text-center"
                style={{
                  width: `${cellSize * 0.8}mm`,
                  minWidth: '1.5em',
                }}
              >
                {'　'}
              </span>
            )}
          </span>
        ))}
      </>
    );
  }

  // 漢字が含まれていない場合は、先頭に空欄を配置
  return (
    <>
      <span
        className="inline-block border-b-2 border-gray-400 mr-1 text-center"
        style={{
          width: `${cellSize * 0.8}mm`,
          minWidth: '1.5em',
        }}
      >
        {'　'}
      </span>
      {context}
    </>
  );
}
