import { CELL_SIZE } from '../../constants/print';
import type { GridStyle, Settings } from '../../types';
import { gridStyles, modeSettings } from './config';

interface Props {
  settings: Settings;
  rowsPerPage: number;
  totalQuestions: number;
  maxPracticeColumns: number;
  onSettingsChange: (s: Partial<Settings>) => void;
}

export function PrintOptions({
  settings,
  rowsPerPage,
  totalQuestions,
  maxPracticeColumns,
  onSettingsChange,
}: Props) {
  const currentModeSettings = modeSettings[settings.mode];

  return (
    <div className="space-y-5">
      {/* ページ数 */}
      <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg-warm)' }}>
        <label className="section-title">ページ数</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="20"
            value={settings.pageCount}
            onChange={(e) => onSettingsChange({ pageCount: Number(e.target.value) })}
            className="flex-1 h-2 rounded-lg cursor-pointer"
            style={{ background: 'var(--color-border)' }}
          />
          <div
            className="px-3 py-1 rounded-lg text-sm font-bold min-w-[80px] text-center"
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            {settings.pageCount}枚
          </div>
        </div>
        <div className="text-xs mt-2 text-center" style={{ color: 'var(--color-text-muted)' }}>
          {rowsPerPage}問/ページ × {settings.pageCount}枚 = 計<strong>{totalQuestions}問</strong>
        </div>
      </div>

      {/* 練習マス数 - 書き練習のみ */}
      {currentModeSettings.practiceColumns && (
        <div>
          <label className="section-title">練習マス数: {settings.practiceColumns}マス</label>
          <input
            type="range"
            min="3"
            max={maxPracticeColumns}
            value={settings.practiceColumns}
            onChange={(e) => onSettingsChange({ practiceColumns: Number(e.target.value) })}
            className="w-full h-2 rounded-lg cursor-pointer"
            style={{ background: 'var(--color-border)' }}
          />
          <div
            className="flex justify-between text-xs mt-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <span>3マス</span>
            <span>最大 {maxPracticeColumns}マス</span>
          </div>
        </div>
      )}

      {/* マスサイズ / 漢字サイズ */}
      <div>
        <label className="section-title">
          {currentModeSettings.cellSizeLabel}: {settings.cellSize}mm
        </label>
        <input
          type="range"
          min={CELL_SIZE.MIN}
          max={CELL_SIZE.MAX}
          value={settings.cellSize}
          onChange={(e) => onSettingsChange({ cellSize: Number(e.target.value) })}
          className="w-full h-2 rounded-lg cursor-pointer"
          style={{ background: 'var(--color-border)' }}
        />
        <div
          className="flex justify-between text-xs mt-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <span>{CELL_SIZE.MIN}mm（小さい）</span>
          <span>{CELL_SIZE.MAX}mm（大きい）</span>
        </div>
      </div>

      {/* ガイドライン - 書き練習・例文写経のみ */}
      {currentModeSettings.gridStyle && (
        <div>
          <label className="section-title">ガイドライン</label>
          <div className="grid grid-cols-3 gap-2">
            {gridStyles.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onSettingsChange({ gridStyle: value as GridStyle })}
                className="p-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: settings.gridStyle === value ? 'var(--color-primary)' : 'white',
                  color: settings.gridStyle === value ? 'white' : 'var(--color-text)',
                  border: `2px solid ${settings.gridStyle === value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* オプション */}
      <div className="space-y-3 p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.random}
            onChange={(e) => onSettingsChange({ random: e.target.checked })}
            className="w-5 h-5 rounded"
          />
          <span className="text-sm" style={{ color: 'var(--color-text)' }}>
            ランダム出題
          </span>
        </label>

        {currentModeSettings.showHint && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showHint}
              onChange={(e) => onSettingsChange({ showHint: e.target.checked })}
              className="w-5 h-5 rounded"
            />
            <span className="text-sm" style={{ color: 'var(--color-text)' }}>
              お手本に薄い漢字を表示
            </span>
          </label>
        )}
      </div>

      {/* タイトル */}
      <div>
        <label className="section-title">プリントタイトル</label>
        <input
          type="text"
          value={settings.title}
          onChange={(e) => onSettingsChange({ title: e.target.value })}
          className="w-full p-3 rounded-xl text-sm"
          style={{
            border: '2px solid var(--color-border)',
            background: 'white',
          }}
          placeholder="漢字練習プリント"
        />
      </div>
    </div>
  );
}
